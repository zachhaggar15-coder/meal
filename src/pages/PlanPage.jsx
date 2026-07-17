import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import WaitlistSection from '../components/WaitlistSection.jsx';
import FeedbackBox from '../components/FeedbackBox.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import TrustBox, { DEFAULT_SOURCES } from '../components/TrustBox.jsx';
import { buildShoppingList, getPlanBySlug, scalePlanForHousehold } from '../utils/planBuilder.js';
import ContainerSetupRecommendation from '../components/ContainerSetupRecommendation.jsx';
import { PLAN_COUNT } from '../data/planSeeds.js';
import { getSupermarketEvidence } from '../data/comboLandingPages.js';
import { choosePlanVisual } from '../data/visualAssets.js';
import { AUTHOR_JSON_LD, SITE_AUTHOR_NAME, SITE_CONTACT_EMAIL } from '../constants/site.js';
import { track } from '../utils/analytics.js';
import { toTitleCase } from '../utils/textFormatting.js';
import NotFound from './NotFound.jsx';

const MKT_LABEL = {
  aldi: 'Aldi', lidl: 'Lidl', tesco: 'Tesco', asda: 'Asda',
  sainsburys: "Sainsbury's", morrisons: 'Morrisons', iceland: 'Iceland',
  waitrose: 'Waitrose', ocado: 'Ocado', 'marks-spencer': 'M&S', coop: 'Co-op',
  any: 'Generic UK supermarket',
};

const SERVING_OPTIONS = [1, 2, 3, 4, 5, 6];
const HOUSEHOLD_MODES = [
  { value: 'same', label: 'Same Portions' },
  { value: 'couple', label: 'Couple' },
  { value: 'family', label: 'Family' },
  { value: 'custom', label: 'Custom' },
];
const MAX_HOUSEHOLD_MEMBERS = 6;

const GOAL_HUB_SLUGS = {
  'weight-loss': 'weight-loss',
  'high-protein-low-cal': 'high-protein',
  'muscle-gain': 'muscle-gain',
  'budget-fat-loss': 'weight-loss',
  'cheap-student': 'cheap-student',
  'busy-professional': 'work-lunch-meal-prep-uk',
  'low-effort': 'meal-plans-with-shopping-list',
  'vegetarian-low-cal': 'vegetarian',
  'vegan-low-cal': 'vegan',
  'high-protein-vegetarian': 'high-protein',
  pescatarian: 'pescatarian',
  'budget-bodybuilding': 'budget-bodybuilding',
  'gym-beginner': 'high-protein',
  'cheap-high-protein': 'high-protein',
  maintenance: 'free-online-diet-plans-uk',
  'anti-inflammatory': 'free-online-diet-plans-uk',
  'menopause-nutrition': 'menopause',
  'endurance-athlete': 'endurance',
  'body-recomp': 'high-protein',
  cutting: 'weight-loss',
};

function createHouseholdMember(label, portionScale = 1, id = '') {
  const safeLabel = label || 'Person';
  return {
    id: id || `${safeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.round(portionScale * 100)}-${Date.now()}`,
    label: safeLabel,
    portionScale,
  };
}

function buildSamePortionMembers(count = 1) {
  const people = Math.min(MAX_HOUSEHOLD_MEMBERS, Math.max(1, Number(count) || 1));
  return Array.from({ length: people }, (_, index) => createHouseholdMember(`Person ${index + 1}`, 1, `same-${index + 1}`));
}

function buildHouseholdPreset(mode = 'same') {
  if (mode === 'couple') {
    return [
      createHouseholdMember('Person 1', 1, 'couple-1'),
      createHouseholdMember('Person 2', 0.75, 'couple-2'),
    ];
  }

  if (mode === 'family') {
    return [
      createHouseholdMember('Adult 1', 1, 'family-adult-1'),
      createHouseholdMember('Adult 2', 0.85, 'family-adult-2'),
      createHouseholdMember('Smaller portion', 0.55, 'family-smaller-1'),
    ];
  }

  if (mode === 'custom') {
    return [
      createHouseholdMember('Person 1', 1, 'custom-1'),
      createHouseholdMember('Person 2', 0.75, 'custom-2'),
    ];
  }

  return buildSamePortionMembers(1);
}

export default function PlanPage() {
  const { slug } = useParams();
  const plan = useMemo(() => getPlanBySlug(slug), [slug]);

  const [activeDayIdx, setActiveDayIdx]   = useState(0);
  const [editedPlan, setEditedPlan]        = useState(null);
  const [editTarget, setEditTarget]        = useState(null); // { dayIdx, mealIdx }
  const [editPrompt, setEditPrompt]        = useState('');
  const [editLoading, setEditLoading]      = useState(false);
  const [editError, setEditError]          = useState('');
  const [editNote, setEditNote]            = useState('');
  const [originalPlan, setOriginalPlan]    = useState(null);
  const [shoppingCopyStatus, setShoppingCopyStatus] = useState('');
  const [planCopyStatus, setPlanCopyStatus] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [planEmailStatus, setPlanEmailStatus] = useState('idle');
  const [planEmailMessage, setPlanEmailMessage] = useState('');
  const [householdMode, setHouseholdMode] = useState('same');
  const [householdMembers, setHouseholdMembers] = useState(() => buildHouseholdPreset('same'));
  const sourcePlan = editedPlan || plan;
  const displayPlan = useMemo(() => (
    sourcePlan ? scalePlanForHousehold(sourcePlan, householdMembers) : null
  ), [sourcePlan, householdMembers]);

  if (!plan) {
    return <NotFound />;
  }

  const activeDay   = displayPlan.plan[activeDayIdx];
  const planVisual  = choosePlanVisual(plan);
  const planImageUrl = planVisual?.src?.startsWith('http')
    ? planVisual.src
    : `https://www.mealprep.org.uk${planVisual?.src || '/og-preview.png'}`;

  const jsonLd = [
    buildPlanRecipeJsonLd(plan, planImageUrl),
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: plan.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',          item: 'https://www.mealprep.org.uk/' },
        { '@type': 'ListItem', position: 2, name: 'Meal Plans',    item: 'https://www.mealprep.org.uk/browse' },
        { '@type': 'ListItem', position: 3, name: plan.title,      item: plan.seo.canonical },
      ],
    },
  ];

  // ── AI edit handler ──────────────────────────────────────────────────────────
  async function handleAiEdit(e) {
    e.preventDefault();
    if (!editPrompt.trim() || !editTarget) return;

    setEditLoading(true);
    setEditError('');
    setEditNote('');

    const basePlan = editedPlan || plan;
    const meal = basePlan.plan[editTarget.dayIdx].meals[editTarget.mealIdx];
    track.mealEditSubmitted(plan.slug);

    try {
      const res = await fetch('/api/edit-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal, prompt: editPrompt }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Edit failed');
      }
      const data = await res.json();

      if (data.meal) {
        if (!originalPlan) setOriginalPlan(basePlan);

        const newPlan = JSON.parse(JSON.stringify(basePlan));
        newPlan.plan[editTarget.dayIdx].meals[editTarget.mealIdx] = normaliseEditedMeal(meal, data.meal);
        // Recalculate day totals
        const dayMeals = newPlan.plan[editTarget.dayIdx].meals;
        newPlan.plan[editTarget.dayIdx].totals = {
          kcal:    dayMeals.reduce((s, m) => s + (m.kcal || 0), 0),
          protein: dayMeals.reduce((s, m) => s + (m.protein || 0), 0),
          carbs:   dayMeals.reduce((s, m) => s + (m.carbs || 0), 0),
          fats:    dayMeals.reduce((s, m) => s + (m.fats || 0), 0),
          fibre:   dayMeals.reduce((s, m) => s + (m.fibre || 0), 0),
        };
        newPlan.shoppingList = buildShoppingList(newPlan.plan);

        setEditedPlan(newPlan);
        setEditNote('Plan updated. Calorie and macro values are estimates after AI editing.');
        setEditTarget(null);
        setEditPrompt('');
        track.mealEditCompleted(plan.slug);
      }
    } catch (err) {
      setEditError('Edit failed. Please try again.');
      track.mealEditFailed(plan.slug);
    } finally {
      setEditLoading(false);
    }
  }

  function resetToOriginal() {
    setEditedPlan(null);
    setOriginalPlan(null);
    setEditNote('');
  }

  function selectHouseholdMode(mode) {
    setHouseholdMode(mode);
    setHouseholdMembers(buildHouseholdPreset(mode));
  }

  function selectSamePortionCount(count) {
    setHouseholdMode('same');
    setHouseholdMembers(buildSamePortionMembers(count));
  }

  function updateHouseholdMember(id, field, value) {
    setHouseholdMembers(members => members.map(member => (
      member.id === id ? { ...member, [field]: value } : member
    )));
  }

  function addHouseholdMember() {
    setHouseholdMode('custom');
    setHouseholdMembers(members => {
      if (members.length >= MAX_HOUSEHOLD_MEMBERS) return members;
      return [...members, createHouseholdMember(`Person ${members.length + 1}`, 1)];
    });
  }

  function removeHouseholdMember(id) {
    setHouseholdMode('custom');
    setHouseholdMembers(members => {
      if (members.length <= 1) return members;
      return members.filter(member => member.id !== id);
    });
  }

  async function copyShoppingList() {
    const text = formatShoppingList(displayPlan);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setShoppingCopyStatus('Copied');
      track.shoppingListCopied();
      setTimeout(() => setShoppingCopyStatus(''), 1800);
    } catch {
      setShoppingCopyStatus('Copy failed');
      setTimeout(() => setShoppingCopyStatus(''), 2200);
    }
  }

  async function copyPlanSummary() {
    try {
      await writeClipboard(formatPlanShareText(displayPlan, plan.seo.canonical));
      setPlanCopyStatus('Copied');
      track.planCopied();
      setTimeout(() => setPlanCopyStatus(''), 1800);
    } catch {
      setPlanCopyStatus('Copy failed');
      setTimeout(() => setPlanCopyStatus(''), 2200);
    }
  }

  async function sharePlan() {
    const shareData = {
      title: plan.title,
      text: `${plan.title} with recipes, macros and a shopping list.`,
      url: plan.seo.canonical,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus('Shared');
      } else {
        await writeClipboard(plan.seo.canonical);
        setShareStatus('Link copied');
      }
      track.shareClicked();
      setTimeout(() => setShareStatus(''), 1800);
    } catch {
      setShareStatus('Share cancelled');
      setTimeout(() => setShareStatus(''), 1800);
    }
  }

  function handlePrintPlan() {
    track.printClicked();
    window.print();
  }

  async function handleEmailPlan({ email, website }) {
    if (planEmailStatus === 'sending') return;

    setPlanEmailStatus('sending');
    setPlanEmailMessage('');
    track.planEmailSubmitted(plan.slug);

    try {
      const res = await fetch('/api/email-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          website,
          planSlug: plan.slug,
          householdMembers,
          source: typeof window !== 'undefined' ? window.location.href : plan.seo.canonical,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Could not send the plan.');
      }

      setPlanEmailStatus('sent');
      setPlanEmailMessage('Sent. Check your inbox for the plan and shopping list.');
      track.planEmailSent(plan.slug);
    } catch (err) {
      setPlanEmailStatus('error');
      setPlanEmailMessage(err.message || 'Could not send the plan right now.');
      track.planEmailFailed(plan.slug, err.message || 'unknown');
    }
  }

  const planDaysSection = (
    <section id="meal-plan" className="plan-days-section">
      <h2>Your 7-Day Meal Plan</h2>

      <div className="plan-day-tabs" role="tablist" aria-label="Select day">
        {displayPlan.plan.map((d, i) => (
          <button
            key={d.day}
            role="tab"
            aria-selected={activeDayIdx === i}
            aria-controls={`day-panel-${i}`}
            className={`plan-day-tab ${activeDayIdx === i ? 'plan-day-tab--active' : ''}`}
            onClick={() => setActiveDayIdx(i)}
            type="button"
          >
            {d.day.slice(0, 3)}
          </button>
        ))}
      </div>

      <div
        id={`day-panel-${activeDayIdx}`}
        role="tabpanel"
        className="plan-day-panel"
      >
        <div className="plan-day-header">
          <h3 className="plan-day-name">{activeDay.day}</h3>
          <div className="plan-day-totals">
            {displayPlan.household?.hasMixedPortions ? (
              <>
                <span>{activeDay.totals.kcal} kcal full portion</span>
                <span>{formatCoreMacros(activeDay.totals)} full portion</span>
                <span>{activeDay.householdTotals.kcal} kcal household</span>
              </>
            ) : (
              <>
                <span>{activeDay.totals.kcal} kcal per person</span>
                <span>{formatCoreMacros(activeDay.totals)} per person</span>
              </>
            )}
          </div>
        </div>

        <div className="plan-meals-list">
          {activeDay.meals.map((meal, mi) => (
            <div className="plan-meal-card" key={mi}>
              <div className="plan-meal-header">
                <span className="plan-meal-type">{meal.type}</span>
                <span className="plan-meal-macros">{formatMealMacroLine(meal)}</span>
              </div>
              <h4 className="plan-meal-name">{meal.name}</h4>
              {meal.desc && (
                <p className="plan-meal-desc">{meal.desc}</p>
              )}

              {displayPlan.household?.hasMixedPortions && (
                <MealPortionBreakdown portions={meal.householdPortions} />
              )}

              {meal.recipe?.length > 0 && (
                <details className="plan-meal-recipe">
                  <summary>Recipe</summary>
                  <ol>
                    {meal.recipe.map((stepText, stepIdx) => (
                      <li key={stepIdx}>{stepText}</li>
                    ))}
                    {displayPlan.household?.hasMixedPortions && meal.householdPortions?.length > 1 && (
                      <li className="plan-meal-recipe-serve-step">
                        Divide the finished dish:{' '}
                        {meal.householdPortions.map((p, i) => (
                          <span key={p.id}>
                            {i > 0 ? ', ' : ''}
                            <strong>{p.label}</strong>
                            {' '}— {toNiceFraction(p.portionScale / (meal.totalPortions || 1))}
                          </span>
                        ))}.
                      </li>
                    )}
                  </ol>
                </details>
              )}

              <button
                className="plan-meal-edit-btn"
                onClick={() => {
                  setEditTarget({ dayIdx: activeDayIdx, mealIdx: mi });
                  setEditPrompt('');
                  setEditError('');
                }}
                type="button"
              >
                Edit this meal
              </button>

              {editTarget?.dayIdx === activeDayIdx && editTarget?.mealIdx === mi && (
                <form className="plan-meal-edit-form" onSubmit={handleAiEdit}>
                  <input
                    className="plan-meal-edit-input"
                    placeholder="e.g. make this vegetarian, remove tuna, swap for something cheaper..."
                    value={editPrompt}
                    onChange={e => setEditPrompt(e.target.value)}
                    disabled={editLoading}
                    autoFocus
                  />
                  <div className="plan-meal-edit-actions">
                    <button
                      className="plan-meal-edit-submit"
                      type="submit"
                      disabled={editLoading || !editPrompt.trim()}
                    >
                      {editLoading ? 'Updating...' : 'Apply edit'}
                    </button>
                    <button
                      className="plan-meal-edit-cancel"
                      type="button"
                      onClick={() => setEditTarget(null)}
                      disabled={editLoading}
                    >
                      Cancel
                    </button>
                  </div>
                  {editError && <p className="plan-meal-edit-error" role="alert">{editError}</p>}
                  <p className="plan-meal-edit-hint">
                    Try: "make it vegetarian", "remove eggs", "make it cheaper", "increase protein"
                  </p>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const shoppingListSection = (
    <section id="shopping-list" className="plan-shopping-section">
      <div className="plan-shopping-header">
        <h2>Weekly Shopping List</h2>
        <button className="plan-copy-shopping-btn" onClick={copyShoppingList} type="button">
          {shoppingCopyStatus || 'Copy shopping list'}
        </button>
      </div>
      <p className="plan-shopping-container-note">
        Need containers for this batch?{' '}
        <Link to={plan.budget === 'very-cheap' || plan.budget === 'budget' ? '/meal-prep-containers/budget' : '/meal-prep-containers/mid-range'}>
          Compare meal prep containers →
        </Link>
      </p>
      <p className="plan-shopping-note">
        Estimated cost: <strong>{displayPlan.priceEstimate}/week</strong> for {formatHouseholdLabel(displayPlan)} from {MKT_LABEL[plan.supermarket] || plan.supermarket}.
        {displayPlan.household?.hasMixedPortions
          ? ' Calories and macros are estimated for each household member from their portion size.'
          : ' Calories and macros stay shown per person; ingredients and shopping quantities are scaled for the household.'}
      </p>
      <div className="shopping-list-grid">
        {Object.entries(displayPlan.shoppingList).map(([cat, items]) =>
          items.length > 0 ? (
            <div className="shopping-cat" key={cat}>
              <h3 className="shopping-cat-title">{catLabel(cat)}</h3>
              <ul className="shopping-items">
                {items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          ) : null
        )}
      </div>
    </section>
  );

  return (
    <>
      <SEO
        title={plan.seo.title}
        description={plan.seo.description}
        canonical={plan.seo.canonical}
        jsonLd={jsonLd}
        ogTitle={plan.seo.ogTitle}
        ogDescription={plan.seo.ogDescription}
        ogImage={planImageUrl}
      />

      <div className="content-page plan-page">

        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> › </span>
          <Link to="/browse">Meal Plans</Link>
          <span aria-hidden="true"> › </span>
          <span aria-current="page">{plan.title}</span>
        </nav>

        {/* Hero */}
        <SiteLogo variant="page" className="page-header-logo" />
        <h1 className="plan-page-h1">{plan.title}</h1>
        <p className="plan-page-intro">{plan.seo.description}</p>
        <p className="content-byline">
          Built and reviewed by <Link to="/about">{SITE_AUTHOR_NAME}</Link>. Last materially reviewed: 2 July 2026.
        </p>
        <PageHeroVisual visual={planVisual} className="plan-page-visual" />

        {editNote && (
          <div className="plan-edit-notice">
            <strong>Note:</strong> {editNote}{' '}
            {originalPlan && (
              <button className="plan-reset-btn" onClick={resetToOriginal} type="button">
                Reset to original
              </button>
            )}
          </div>
        )}

        <PlanActionBar
          onCopyPlan={copyPlanSummary}
          onSharePlan={sharePlan}
          onPrintPlan={handlePrintPlan}
          planCopyStatus={planCopyStatus}
          shareStatus={shareStatus}
        />

        <PlanEmailCapture
          plan={plan}
          status={planEmailStatus}
          message={planEmailMessage}
          onSubmit={handleEmailPlan}
        />

        <HouseholdPortionsControl
          mode={householdMode}
          members={householdMembers}
          displayPlan={displayPlan}
          onModeChange={selectHouseholdMode}
          onSameCountChange={selectSamePortionCount}
          onMemberChange={updateHouseholdMember}
          onAddMember={addHouseholdMember}
          onRemoveMember={removeHouseholdMember}
        />

        {planDaysSection}
        {shoppingListSection}
        <ContainerSetupRecommendation
          plan={displayPlan}
          sourcePage={`plan-${plan.slug || 'page'}-containers`}
        />

        {/* Summary card */}
        <div className="plan-summary-card">
          <div className="plan-summary-grid">
            <SummaryItem label="Supermarket"  value={MKT_LABEL[plan.supermarket] || plan.supermarket} />
            <SummaryItem label="Cooking for" value={displayPlan.peopleLabel} />
            <SummaryItem label="Cook amount" value={`${displayPlan.totalPortionLabel} portions`} />
            <SummaryItem label="Calorie target" value={displayPlan.summary.calorieRange} />
            <SummaryItem label="Weekly budget"  value={`${displayPlan.summary.budgetRange} total`} />
            <SummaryItem label="Prep difficulty" value={plan.effortLabel} />
            <SummaryItem label="Best for"       value={plan.summary.bestFor} />
            <SummaryItem label="Diet"
              value={plan.dietType === 'standard' ? 'All diets' : cap(plan.dietType)} />
          </div>

          {/* Macro bars */}
          <div className="plan-macros">
            <h3 className="plan-macros-title">{toTitleCase('Estimated daily macros per person')}</h3>
            <div className="macro-bars">
              {[
                { key: 'protein', label: 'Protein', max: 200 },
                { key: 'carbs',   label: 'Carbs',   max: 300 },
                { key: 'fats',    label: 'Fats',    max: 120 },
                { key: 'fibre',   label: 'Fibre',   max: 50  },
              ].map(({ key, label, max }) => {
                const g = plan.macrosGrams?.[key] ?? 0;
                return (
                  <div className="macro-bar-row" key={key}>
                    <span className="macro-bar-label">{label}</span>
                    <div className="macro-bar-track">
                      <div className="macro-bar-fill" style={{ width: `${Math.min(100, Math.round((g / max) * 100))}%` }} />
                    </div>
                    <span className="macro-bar-pct">{g}g</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <details className="plan-secondary-details">
          <summary>{toTitleCase('Plan details and assumptions')}</summary>
          <div className="plan-secondary-stack">
            <SupermarketEvidence plan={plan} />
            <PlanQualityNotes plan={plan} />
            <BatchPrepPlan prepPlan={plan.prepPlan} />
          </div>
        </details>

        {/* Quiz CTA */}
        <div className="plan-quiz-cta">
          <Link to="/quiz" className="btn-quiz-inline">Not Right For You? Take The Quiz →</Link>
        </div>

        <PrintablePlanSummary
          plan={displayPlan}
          marketLabel={MKT_LABEL[plan.supermarket] || plan.supermarket}
        />

        {false && (
          <>
        {/* 7-Day Plan */}
        <section className="plan-days-section">
          <h2>Your 7-Day Meal Plan</h2>

          {/* Day tabs */}
          <div className="plan-day-tabs" role="tablist" aria-label="Select day">
            {displayPlan.plan.map((d, i) => (
              <button
                key={d.day}
                role="tab"
                aria-selected={activeDayIdx === i}
                aria-controls={`day-panel-${i}`}
                className={`plan-day-tab ${activeDayIdx === i ? 'plan-day-tab--active' : ''}`}
                onClick={() => setActiveDayIdx(i)}
                type="button"
              >
                {d.day.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Active day */}
          <div
            id={`day-panel-${activeDayIdx}`}
            role="tabpanel"
            className="plan-day-panel"
          >
            <div className="plan-day-header">
              <h3 className="plan-day-name">{activeDay.day}</h3>
              <div className="plan-day-totals">
                <span>{activeDay.totals.kcal} kcal</span>
                <span>{formatCoreMacros(activeDay.totals)}</span>
              </div>
            </div>

            <div className="plan-meals-list">
              {activeDay.meals.map((meal, mi) => (
                <div className="plan-meal-card" key={mi}>
                  <div className="plan-meal-header">
                    <span className="plan-meal-type">{meal.type}</span>
                    <span className="plan-meal-macros">{formatMealMacroLine(meal)}</span>
                  </div>
                  <h4 className="plan-meal-name">{meal.name}</h4>
                  {meal.desc && (
                    <p className="plan-meal-desc">{meal.desc}</p>
                  )}

                  {meal.recipe?.length > 0 && (
                    <details className="plan-meal-recipe">
                      <summary>Recipe</summary>
                      <ol>
                        {meal.recipe.map((stepText, stepIdx) => (
                          <li key={stepIdx}>{stepText}</li>
                        ))}
                      </ol>
                    </details>
                  )}

                  {/* AI edit trigger */}
                  <button
                    className="plan-meal-edit-btn"
                    onClick={() => {
                      setEditTarget({ dayIdx: activeDayIdx, mealIdx: mi });
                      setEditPrompt('');
                      setEditError('');
                    }}
                    type="button"
                  >
                    ✏️ Edit this meal
                  </button>

                  {/* Inline edit form */}
                  {editTarget?.dayIdx === activeDayIdx && editTarget?.mealIdx === mi && (
                    <form className="plan-meal-edit-form" onSubmit={handleAiEdit}>
                      <input
                        className="plan-meal-edit-input"
                        placeholder="e.g. make this vegetarian, remove tuna, swap for something cheaper…"
                        value={editPrompt}
                        onChange={e => setEditPrompt(e.target.value)}
                        disabled={editLoading}
                        autoFocus
                      />
                      <div className="plan-meal-edit-actions">
                        <button
                          className="plan-meal-edit-submit"
                          type="submit"
                          disabled={editLoading || !editPrompt.trim()}
                        >
                          {editLoading ? 'Updating…' : 'Apply edit'}
                        </button>
                        <button
                          className="plan-meal-edit-cancel"
                          type="button"
                          onClick={() => setEditTarget(null)}
                          disabled={editLoading}
                        >
                          Cancel
                        </button>
                      </div>
                      {editError && <p className="plan-meal-edit-error">{editError}</p>}
                      <p className="plan-meal-edit-hint">
                        Try: "make it vegetarian", "remove eggs", "make it cheaper", "increase protein"
                      </p>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shopping List */}
        <section className="plan-shopping-section">
          <div className="plan-shopping-header">
            <h2>Weekly Shopping List</h2>
            <button className="plan-copy-shopping-btn" onClick={copyShoppingList} type="button">
              {shoppingCopyStatus || 'Copy shopping list'}
            </button>
          </div>
          <p className="plan-shopping-note">
            Estimated cost: <strong>{displayPlan.priceEstimate}/week</strong> for {formatHouseholdLabel(displayPlan)} from {MKT_LABEL[plan.supermarket] || plan.supermarket}.
            {displayPlan.household?.hasMixedPortions
              ? ' Calories and macros are estimated for each household member from their portion size.'
              : ' Calories and macros stay shown per person; ingredients and shopping quantities are scaled for the household.'}
          </p>
          <div className="shopping-list-grid">
            {Object.entries(displayPlan.shoppingList).map(([cat, items]) =>
              items.length > 0 ? (
                <div className="shopping-cat" key={cat}>
                  <h3 className="shopping-cat-title">{catLabel(cat)}</h3>
                  <ul className="shopping-items">
                    {items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              ) : null
            )}
          </div>
        </section>
          </>
        )}

        {/* Swaps & suggestions */}
        <section className="plan-swaps-section">
          <h2>Swaps &amp; Suggestions</h2>
          <div className="swaps-grid">
            <div className="swap-card">
              <h3>💰 Make it cheaper</h3>
              <ul>
                {plan.swaps.cheaper.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="swap-card">
              <h3>💪 Increase protein</h3>
              <ul>
                {plan.swaps.higherProtein.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            {plan.swaps.vegetarian?.length > 0 && (
              <div className="swap-card">
                <h3>🥦 Make it vegetarian</h3>
                <ul>
                  {plan.swaps.vegetarian.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="plan-faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {plan.faq.map((f, i) => (
              <details className="faq-item" key={i}>
                <summary className="faq-question">{f.q}</summary>
                <p className="faq-answer">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related plans */}
        {plan.relatedSlugs.length > 0 && (
          <section className="plan-related-section">
            <h2>Related Meal Plans</h2>
            <div className="related-plans-grid">
              {plan.relatedSlugs.map(r => (
                <Link key={r.slug} to={`/plans/${r.slug}`} className="related-plan-card">
                  {r.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTAs */}
        <div className="plan-bottom-ctas">
          <Link to="/quiz" className="btn-primary">Find a better match →</Link>
          <Link to="/browse" className="btn-secondary">Browse all {PLAN_COUNT} plans</Link>
        </div>

        <TrustBox
          reviewed="2 July 2026"
          note="Plans are generated from a curated UK meal library, then rendered with deterministic shopping lists, recipes, calorie estimates and supermarket-specific notes. They are general meal-planning information, not medical advice."
        />

        <FeedbackBox />

      </div>
      <WaitlistSection sourcePage="plan" />
      <Footer />
    </>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="plan-summary-item">
      <span className="plan-summary-label">{label}</span>
      <span className="plan-summary-value">{value}</span>
    </div>
  );
}

function PlanQuickFacts({ plan }) {
  const facts = [
    { label: 'Best for', value: plan.summary.bestFor },
    { label: 'Calories', value: plan.summary.calorieRange },
    { label: 'Budget', value: `${plan.summary.budgetRange}/week estimate` },
    { label: 'Prep style', value: plan.effortLabel },
    { label: 'Includes', value: '7 days, recipes, macros, PDF export and shopping list' },
    { label: 'Diet', value: plan.dietType === 'standard' ? 'All diets' : cap(plan.dietType) },
  ];

  return (
    <section className="plan-quick-facts" aria-labelledby="plan-quick-facts-heading">
      <h2 id="plan-quick-facts-heading">Plan Quick Facts</h2>
      <div className="plan-quick-facts-grid">
        {facts.map(fact => (
          <div className="plan-quick-fact" key={fact.label}>
            <strong>{fact.label}</strong>
            <span>{fact.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlanActionBar({ onCopyPlan, onSharePlan, onPrintPlan, planCopyStatus, shareStatus }) {
  return (
    <section className="plan-action-bar" aria-label="Plan actions">
      <a href="#meal-plan">Meals</a>
      <a href="#shopping-list">Shopping List</a>
      <button onClick={onCopyPlan} type="button">{planCopyStatus || 'Copy Summary'}</button>
      <button onClick={onPrintPlan} type="button">Print PDF</button>
      <button className="plan-action-primary" onClick={onSharePlan} type="button">
        {shareStatus || 'Share'}
      </button>
    </section>
  );
}

function PlanEmailCapture({ plan, status, message, onSubmit }) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const sending = status === 'sending';
  const sent = status === 'sent';

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || sending) return;
    onSubmit({ email: email.trim(), website });
  }

  return (
    <section className="plan-email-capture" aria-labelledby="plan-email-heading">
      <div>
        <span className="offer-kicker">Save this plan</span>
        <h2 id="plan-email-heading">Email this plan to yourself</h2>
        <p>
          Get the 7-day menu, shopping list and printable plan link in your inbox.
        </p>
      </div>
      {sent ? (
        <p className="plan-email-status plan-email-status--sent" role="status">{message}</p>
      ) : (
        <form className="plan-email-form" onSubmit={handleSubmit}>
          <label>
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={sending}
            />
          </label>
          <label className="plan-email-honeypot" aria-hidden="true">
            Website
            <input
              type="text"
              value={website}
              onChange={event => setWebsite(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
          <button className="btn-primary" type="submit" disabled={sending || !email.trim()}>
            {sending ? 'Sending...' : 'Email plan'}
          </button>
          {message && (
            <p className={`plan-email-status plan-email-status--${status}`} role="status">
              {message}
            </p>
          )}
        </form>
      )}
      <p className="plan-email-note">
        Current selection: {plan.title}
      </p>
    </section>
  );
}

function HouseholdPortionsControl({
  mode,
  members,
  displayPlan,
  onModeChange,
  onSameCountChange,
  onMemberChange,
  onAddMember,
  onRemoveMember,
}) {
  const sameCount = members.length;
  const showMemberRows = mode !== 'same';

  return (
    <section className="plan-servings-control plan-household-control" aria-labelledby="plan-household-heading">
      <div className="plan-household-header">
        <div>
          <h2 id="plan-household-heading">{toTitleCase('Household portions')}</h2>
          <p>Same meals, adjusted portions.</p>
        </div>
        <span className="plan-household-total">
          {displayPlan.totalPortionLabel} cook portions
        </span>
      </div>

      <div className="plan-household-modes" role="group" aria-label="Household portion type">
        {HOUSEHOLD_MODES.map(option => (
          <button
            key={option.value}
            className={option.value === mode ? 'plan-household-mode plan-household-mode--active' : 'plan-household-mode'}
            type="button"
            aria-pressed={option.value === mode}
            onClick={() => onModeChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {mode === 'same' && (
        <div className="plan-servings-options" role="group" aria-label="People to cook for">
          {SERVING_OPTIONS.map(option => (
            <button
              key={option}
              className={option === sameCount ? 'plan-servings-option plan-servings-option--active' : 'plan-servings-option'}
              type="button"
              aria-pressed={option === sameCount}
              onClick={() => onSameCountChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {showMemberRows && (
        <div className="plan-household-rows">
          {members.map((member, index) => (
            <div className="plan-household-row" key={member.id}>
              <input
                className="plan-household-name"
                aria-label={`Household member ${index + 1} name`}
                value={member.label}
                onChange={event => onMemberChange(member.id, 'label', event.target.value)}
              />
              <label className="plan-household-slider">
                <span>Portion</span>
                <input
                  type="range"
                  min="0.25"
                  max="1.75"
                  step="0.05"
                  value={member.portionScale}
                  onChange={event => onMemberChange(member.id, 'portionScale', Number(event.target.value))}
                />
              </label>
              <output className="plan-household-output">
                {Math.round(Number(member.portionScale || 1) * 100)}%
              </output>
              <button
                className="plan-household-remove"
                type="button"
                onClick={() => onRemoveMember(member.id)}
                disabled={members.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="plan-household-add"
            type="button"
            onClick={onAddMember}
            disabled={members.length >= MAX_HOUSEHOLD_MEMBERS}
          >
            Add person
          </button>
        </div>
      )}
    </section>
  );
}

function toNiceFraction(decimal) {
  const candidates = [
    [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5],
    [2, 5], [3, 5], [4, 5], [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8],
  ];
  let best = [1, 1];
  let bestDiff = Math.abs(decimal - 1);
  for (const [n, d] of candidates) {
    const diff = Math.abs(decimal - n / d);
    if (diff < bestDiff) { bestDiff = diff; best = [n, d]; }
  }
  return best[1] === 1 ? 'all' : `${best[0]}/${best[1]}`;
}

function MealPortionBreakdown({ portions = [] }) {
  if (!portions.length) return null;

  return (
    <div className="plan-meal-portions" aria-label="Per-person portions">
      {portions.map(portion => (
        <span key={portion.id}>
          <strong>{portion.label}</strong>
          {portion.portionPercent}% · {portion.kcal} kcal · {formatCoreMacros(portion)}
        </span>
      ))}
    </div>
  );
}

function SupermarketEvidence({ plan }) {
  const evidence = getSupermarketEvidence(plan.supermarket);

  return (
    <section className="supermarket-evidence" aria-labelledby="plan-evidence-heading">
      <div>
        <h2 id="plan-evidence-heading">{toTitleCase(`${evidence.label} shopping evidence notes`)}</h2>
        <p>
          These basket notes explain why this plan is shaped around certain
          ingredients and swaps before you open the shopping list.
        </p>
      </div>
      <ul>
        {evidence.notes.map(note => <li key={note}>{note}</li>)}
      </ul>
    </section>
  );
}

function PlanQualityNotes({ plan }) {
  const market = MKT_LABEL[plan.supermarket] || plan.supermarket;
  const calorieText = plan.calories.toLocaleString('en-GB');
  const goalHub = GOAL_HUB_SLUGS[plan.goal] || 'free-online-diet-plans-uk';
  const hubLinks = [
    { to: `/meal-plans/${plan.calories}-calorie`, label: `${calorieText} calorie meal plans` },
    plan.supermarket !== 'any'
      ? { to: `/meal-plans/${plan.supermarket}`, label: `${market} meal plans` }
      : { to: '/meal-plans/generic-uk-supermarket', label: 'Generic UK supermarket plans' },
    { to: `/meal-plans/${goalHub}`, label: `${plan.goalLabel} hub` },
    { to: '/meal-plans/meal-plans-with-shopping-list', label: 'Plans with shopping lists' },
  ];

  const rows = [
    ['Calorie target', `Built around roughly ${calorieText} kcal per day`, getCalorieAssumption(plan.calories)],
    ['Supermarket', market, getMarketAssumption(plan.supermarket)],
    ['Budget', `${plan.summary.budgetRange}/week estimate`, getBudgetAssumption(plan.budget)],
    ['Prep style', plan.effortLabel, getEffortAssumption(plan.effort)],
  ];

  return (
    <section className="plan-quality-notes" aria-labelledby="plan-quality-heading">
      <div className="section-head-inline">
        <div>
          <h2 id="plan-quality-heading">{toTitleCase('Why this exact plan exists')}</h2>
          <p>
            This page is not only a title-and-macros variant. The calorie target, supermarket,
            diet type, budget and prep style all change the meals, shopping-list assumptions and swaps.
          </p>
        </div>
      </div>

      <div className="plan-quality-grid">
        <article>
          <h3>{toTitleCase('Search intent')}</h3>
          <p>
            A {market} {plan.goalLabel.toLowerCase()} plan at {calorieText} calories is useful when
            someone wants a printable week before shopping, not just a generic diet article.
          </p>
        </article>
        <article>
          <h3>{toTitleCase('Shopping logic')}</h3>
          <p>
            The list favours repeatable UK supermarket staples, grouped by protein, carbs, vegetables,
            dairy and extras so the basket can be checked before buying.
          </p>
        </article>
        <article>
          <h3>{toTitleCase('Practical swaps')}</h3>
          <p>
            The swap section keeps the page usable if a product is out of stock, too expensive, or not
            right for the reader's diet.
          </p>
        </article>
      </div>

      <div className="content-table-wrap">
        <table className="content-table plan-quality-table">
          <thead>
            <tr>
              <th scope="col">Decision</th>
              <th scope="col">This plan uses</th>
              <th scope="col">Why it matters</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="plan-quality-links" aria-label="Related plan hubs">
        {hubLinks.map(link => (
          <Link key={link.to} to={link.to}>{toTitleCase(link.label)}</Link>
        ))}
      </div>
    </section>
  );
}

function buildPlanRecipeJsonLd(plan, planImageUrl) {
  const days = plan.plan || [];
  const meals = days.flatMap((day, dayIndex) => (
    (day.meals || []).map((meal, mealIndex) => ({ day, dayIndex, meal, mealIndex }))
  ));
  const averageDailyMinutes = Math.max(
    15,
    Math.round(meals.reduce((sum, item) => sum + readMealMinutes(item.meal), 0) / Math.max(1, days.length)),
  );
  const timing = splitPrepCookMinutes(averageDailyMinutes);
  const market = MKT_LABEL[plan.supermarket] || plan.supermarket;

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    '@id': `${plan.seo.canonical}#recipe`,
    name: plan.title,
    description: plan.seo.description,
    url: plan.seo.canonical,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': plan.seo.canonical,
    },
    image: [planImageUrl],
    datePublished: '2026-06-01',
    dateModified: '2026-07-02',
    author: AUTHOR_JSON_LD,
    publisher: {
      '@type': 'Organization',
      name: 'MealPrep.org.uk',
      url: 'https://www.mealprep.org.uk',
      email: SITE_CONTACT_EMAIL,
    },
    recipeCategory: 'Meal prep',
    recipeCuisine: 'British',
    recipeYield: '1 person for 7 days',
    keywords: [
      `${plan.goalLabel} meal plan`,
      `${market} meal prep`,
      `${plan.calories.toLocaleString('en-GB')} calorie meal plan`,
      plan.dietType !== 'standard' ? `${plan.dietType} meal plan` : null,
    ].filter(Boolean).join(', '),
    prepTime: formatIsoDuration(timing.prep),
    cookTime: formatIsoDuration(timing.cook),
    totalTime: formatIsoDuration(averageDailyMinutes),
    recipeIngredient: flattenShoppingIngredients(plan.shoppingList).slice(0, 120),
    recipeInstructions: buildPlanInstructionSections(days),
    nutrition: buildNutritionJsonLd({
      kcal: plan.calories,
      protein: plan.macrosGrams?.protein,
      carbs: plan.macrosGrams?.carbs,
      fats: plan.macrosGrams?.fats,
      fibre: plan.macrosGrams?.fibre,
    }),
    hasPart: meals.map(item => buildMealRecipeJsonLd(plan, item, planImageUrl)),
    citation: DEFAULT_SOURCES.map(source => source.url),
    about: [
      `${plan.goalLabel} meal plan`,
      `${market} meal prep`,
      `${plan.calories.toLocaleString('en-GB')} calorie meal plan`,
    ],
  };
}

function buildMealRecipeJsonLd(plan, { day, dayIndex, meal, mealIndex }, planImageUrl) {
  const minutes = readMealMinutes(meal);
  const timing = splitPrepCookMinutes(minutes);

  return {
    '@type': 'Recipe',
    '@id': `${plan.seo.canonical}#recipe-${dayIndex + 1}-${mealIndex + 1}`,
    name: `${meal.name} (${day.day} ${meal.type})`,
    description: meal.desc || `${meal.name} from ${plan.title}.`,
    image: [planImageUrl],
    recipeCategory: meal.type,
    recipeYield: '1 serving',
    prepTime: formatIsoDuration(timing.prep),
    cookTime: formatIsoDuration(timing.cook),
    totalTime: formatIsoDuration(minutes),
    recipeIngredient: getMealIngredients(meal),
    recipeInstructions: buildMealInstructionItems(meal),
    nutrition: buildNutritionJsonLd(meal),
    isPartOf: { '@id': `${plan.seo.canonical}#recipe` },
  };
}

function buildPlanInstructionSections(days) {
  return days.map((day, dayIndex) => ({
    '@type': 'HowToSection',
    name: day.day,
    position: dayIndex + 1,
    itemListElement: (day.meals || []).map((meal, mealIndex) => ({
      '@type': 'HowToStep',
      position: mealIndex + 1,
      name: `${meal.type}: ${meal.name}`,
      text: buildMealInstructionText(meal),
    })),
  }));
}

function buildMealInstructionItems(meal) {
  const steps = Array.isArray(meal.recipe) && meal.recipe.length
    ? meal.recipe
    : [buildMealInstructionText(meal)];

  return steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    text: String(step || '').trim(),
  })).filter(step => step.text);
}

function buildMealInstructionText(meal) {
  const recipeText = Array.isArray(meal.recipe) && meal.recipe.length
    ? meal.recipe.join(' ')
    : meal.desc;
  return [
    recipeText || `Prepare ${meal.name} using the listed ingredients.`,
    `${toMacroNumber(meal.kcal)} kcal and ${toMacroNumber(meal.protein)}g protein.`,
    meal.prep ? `Ready in ${meal.prep}.` : null,
  ].filter(Boolean).join(' ');
}

function buildNutritionJsonLd(source = {}) {
  return {
    '@type': 'NutritionInformation',
    calories: `${toMacroNumber(source.kcal)} calories`,
    proteinContent: `${toMacroNumber(source.protein)} g`,
    carbohydrateContent: source.carbs !== undefined ? `${toMacroNumber(source.carbs)} g` : undefined,
    fatContent: source.fats !== undefined ? `${toMacroNumber(source.fats)} g` : undefined,
    fiberContent: source.fibre !== undefined ? `${toMacroNumber(source.fibre)} g` : undefined,
  };
}

function flattenShoppingIngredients(shoppingList = {}) {
  return uniqueStrings(Object.values(shoppingList).flat());
}

function getMealIngredients(meal) {
  return uniqueStrings(meal.ingredients || meal.portion_size?.split(',') || [meal.name]);
}

function uniqueStrings(values = []) {
  return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
}

function readMealMinutes(meal = {}) {
  if (Number.isFinite(Number(meal.prepMins))) return Math.max(1, Number(meal.prepMins));
  const match = String(meal.prep || '').match(/\d+/);
  return match ? Math.max(1, Number(match[0])) : 15;
}

function splitPrepCookMinutes(totalMinutes) {
  const total = Math.max(1, Math.round(Number(totalMinutes) || 15));
  if (total <= 5) return { prep: total, cook: 0 };
  const prep = Math.min(10, Math.max(5, Math.round(total * 0.35)));
  return { prep, cook: Math.max(0, total - prep) };
}

function formatIsoDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return `PT${hours ? `${hours}H` : ''}${mins ? `${mins}M` : hours ? '' : '0M'}`;
}

function BatchPrepPlan({ prepPlan }) {
  if (!prepPlan?.steps?.length) return null;

  return (
    <section className="plan-prep-section" aria-labelledby="plan-prep-heading">
      <div>
        <h2 id="plan-prep-heading">{toTitleCase(prepPlan.title)}</h2>
        <p>{prepPlan.intro}</p>
      </div>
      <ol className="plan-prep-list">
        {prepPlan.steps.map((step, index) => <li key={index}>{step}</li>)}
      </ol>
    </section>
  );
}

function getCalorieAssumption(calories) {
  if (calories <= 1500) {
    return 'Lower-calorie days need protein, fibre and vegetables so the plan still feels like meals.';
  }
  if (calories >= 3000) {
    return 'High-calorie days need snacks and carbohydrate portions rather than one oversized dinner.';
  }
  if (calories >= 2200) {
    return 'Higher targets leave more room for training fuel, snacks and larger carbohydrate portions.';
  }
  return 'Moderate targets balance breakfast, lunch, dinner and snacks without extreme restriction.';
}

function getMarketAssumption(supermarket) {
  const notes = {
    aldi: 'Aldi pages lean on own-brand staples, simple proteins, frozen veg and budget-friendly repeats.',
    lidl: 'Lidl pages work best with simple staples, rotating offers and flexible protein swaps.',
    tesco: 'Tesco pages can use wider choice, online availability and convenient high-protein or free-from options.',
    asda: 'Asda pages balance budget staples with broader family-friendly ranges and frozen options.',
    sainsburys: "Sainsbury's pages allow more prepared ingredients, vegetarian options and premium swaps where useful.",
    morrisons: 'Morrisons pages suit fresh-counter options plus standard supermarket staples.',
    iceland: 'Iceland pages lean into freezer-friendly protein, vegetables and low-waste backup meals.',
    waitrose: 'Waitrose pages suit quality-focused produce, fish, dairy, higher-welfare protein and premium but controlled shops.',
    ocado: 'Ocado pages suit online baskets, scheduled deliveries, M&S ranges and easy repeat shops.',
    'marks-spencer': 'M&S pages lean on premium convenience, fresh prepared ingredients and high-quality smaller baskets.',
    coop: 'Co-op pages suit local top-up shops, smaller baskets and flexible convenience staples.',
    any: 'Generic UK pages use widely available supermarket ingredients and average-price assumptions.',
  };
  return notes[supermarket] || 'The plan uses common UK supermarket ingredients and flexible swaps.';
}

function getBudgetAssumption(budget) {
  if (budget === 'very-cheap') return 'Very cheap plans repeat staples and avoid niche products.';
  if (budget === 'budget') return 'Budget plans keep variety while still prioritising own-brand and batch-friendly ingredients.';
  if (budget === 'moderate') return 'Moderate plans allow more convenience items and variety without becoming premium-only.';
  return 'Flexible-budget plans can use more varied proteins, higher-calorie extras and convenience foods.';
}

function getEffortAssumption(effort) {
  if (effort === 'batch') return 'Batch plans repeat weekday bases so Sunday prep genuinely saves time.';
  if (effort === 'minimal') return 'Minimal-prep plans use more assembly meals, ready-to-eat staples and short cooking steps.';
  if (effort === 'low') return 'Low-effort plans keep daily cooking short while preserving enough variety.';
  if (effort === 'high-variety') return 'High-variety plans trade extra decisions for less repetition.';
  return 'Standard-prep plans balance variety, fresh meals and realistic weekday cooking.';
}

function PrintablePlanSummary({ plan, marketLabel }) {
  const shoppingGroups = Object.entries(plan.shoppingList || {})
    .filter(([, items]) => items?.length);

  return (
    <section className="plan-print-summary" aria-label="Printable meal plan PDF summary">
      <header className="print-summary-header">
        <p className="print-summary-kicker">Printable meal plan PDF</p>
        <h2>{plan.title}</h2>
        <p>
          A 7-day UK meal plan summary for saving as a PDF or printing, including every meal,
          daily macros and the weekly shopping list.
        </p>
      </header>

      <div className="print-summary-meta">
        <span>Supermarket: {marketLabel}</span>
        <span>Cooking for: {formatHouseholdLabel(plan)}</span>
        <span>Cook amount: {plan.totalPortionLabel || '1'} portions</span>
        <span>Calories: {plan.summary?.calorieRange || `~${plan.calories} kcal/day per person`}</span>
        <span>Budget: {plan.summary?.budgetRange || plan.priceEstimate} total</span>
        <span>Diet: {plan.dietType === 'standard' ? 'All diets' : cap(plan.dietType)}</span>
      </div>

      {plan.household?.hasMixedPortions && (
        <div className="print-household-members">
          {plan.household.members.map(member => (
            <span key={member.id}>{member.label}: {member.portionPercent}% portion</span>
          ))}
        </div>
      )}

      <h3>7-day meal plan</h3>
      <div className="print-days">
        {plan.plan.map(day => (
          <article className="print-day" key={day.day}>
            <div className="print-day-heading">
              <h4>{day.day}</h4>
              {plan.household?.hasMixedPortions ? (
                <span>{day.totals.kcal} kcal full portion - {formatCoreMacros(day.totals)} full portion - {day.householdTotals.kcal} kcal household</span>
              ) : (
                <span>{day.totals.kcal} kcal - {formatFullMacros(day.totals, ', ')}</span>
              )}
            </div>
            <ul>
              {day.meals.map((meal, index) => (
                <li key={`${day.day}-${meal.type}-${index}`}>
                  <strong>{meal.type}:</strong> {meal.name} ({meal.kcal} kcal, {formatFullMacros(meal, ', ')} {plan.household?.hasMixedPortions ? 'full portion' : 'per person'})
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h3>Weekly shopping list</h3>
      <div className="print-shopping-list">
        {shoppingGroups.map(([cat, items]) => (
          <section className="print-shopping-group" key={cat}>
            <h4>{catLabel(cat)}</h4>
            <ul>
              {items.map((item, index) => <li key={`${cat}-${index}`}>{item}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

function normaliseEditedMeal(currentMeal, returnedMeal = {}) {
  const merged = { ...currentMeal, ...returnedMeal };
  const ingredients = normaliseIngredients(merged.ingredients, merged.portion_size, merged.name);
  const portionSize = merged.portion_size || ingredients.join(', ');
  const mealWithIngredients = {
    ...merged,
    kcal: toInteger(merged.kcal ?? merged.calories ?? currentMeal.kcal),
    protein: toInteger(merged.protein ?? currentMeal.protein),
    carbs: toInteger(merged.carbs ?? merged.carbohydrates ?? currentMeal.carbs),
    fats: toInteger(merged.fats ?? merged.fat ?? currentMeal.fats),
    fibre: toInteger(merged.fibre ?? merged.fiber ?? currentMeal.fibre),
    ingredients,
    portion_size: portionSize,
  };

  return {
    ...mealWithIngredients,
    recipe: normaliseRecipe(merged.recipe) || buildDynamicRecipe(mealWithIngredients),
  };
}

function normaliseIngredients(value, portionSize, mealName) {
  if (Array.isArray(value)) {
    const ingredients = value.map(formatIngredient).filter(Boolean);
    if (ingredients.length) return ingredients;
  }

  if (typeof value === 'string') {
    const ingredients = value.split(',').map(formatIngredient).filter(Boolean);
    if (ingredients.length) return ingredients;
  }

  if (portionSize) {
    const ingredients = String(portionSize).split(',').map(formatIngredient).filter(Boolean);
    if (ingredients.length) return ingredients;
  }

  return mealName ? [mealName] : [];
}

function formatIngredient(ingredient) {
  if (typeof ingredient === 'object' && ingredient !== null) {
    const name = ingredient.item || ingredient.name || '';
    const amount = ingredient.amount ? ` ${ingredient.amount}` : '';
    return cleanIngredient(`${name}${amount}`);
  }
  return cleanIngredient(ingredient);
}

function cleanIngredient(ingredient) {
  return String(ingredient || '')
    .replace(/\.\s*Use about .*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normaliseRecipe(recipe) {
  if (Array.isArray(recipe)) {
    const steps = recipe.map(step => String(step || '').trim()).filter(Boolean);
    return steps.length ? steps.slice(0, 6) : null;
  }

  if (typeof recipe === 'string') {
    const steps = recipe
      .split(/\n+|(?:^|\s)\d+\.\s*/g)
      .map(step => step.trim())
      .filter(Boolean);
    return steps.length ? steps.slice(0, 6) : null;
  }

  return null;
}

function buildDynamicRecipe(meal) {
  const ingredients = meal.ingredients?.length ? meal.ingredients.join(', ') : meal.portion_size || meal.name;
  const name = String(meal.name || '').toLowerCase();
  const type = String(meal.type || '').toLowerCase();

  if (name.includes('smoothie')) {
    return [
      `Add the listed ingredients to a blender: ${ingredients}.`,
      'Blend until smooth, adding a splash of water or milk if it is too thick.',
      'Pour into a glass or shaker and serve chilled.',
    ];
  }

  if (type.includes('breakfast') || name.includes('oats') || name.includes('yogurt')) {
    return [
      `Prepare the ingredients: ${ingredients}.`,
      'Combine the base ingredients in a bowl or container and stir well.',
      'Top with any fruit, nuts, seeds, or sauces listed and eat straight away or chill for later.',
    ];
  }

  if (name.includes('wrap') || name.includes('sandwich') || name.includes('toast') || name.includes('pitta')) {
    return [
      'Warm or toast the bread, wrap, pitta, or bagel if preferred.',
      `Prepare the filling ingredients: ${ingredients}.`,
      'Layer the filling evenly, season to taste, then serve or wrap tightly for meal prep.',
    ];
  }

  if (name.includes('salad') || name.includes('bowl')) {
    return [
      `Wash, chop, and portion the listed ingredients: ${ingredients}.`,
      'Cook or warm any grains or protein, then let them cool slightly.',
      'Combine everything in a bowl, season, and keep dressing separate until serving if prepping ahead.',
    ];
  }

  if (name.includes('curry') || name.includes('chilli') || name.includes('stew') || name.includes('soup')) {
    return [
      `Prepare the ingredients: ${ingredients}.`,
      'Cook the protein, aromatics, and firmer vegetables in a pan until lightly browned.',
      'Add the remaining ingredients and simmer until hot, thickened, and cooked through.',
    ];
  }

  if (name.includes('pasta') || name.includes('rice') || name.includes('noodle')) {
    return [
      'Cook the pasta, rice, or noodles according to the packet instructions.',
      `Prepare the remaining ingredients while it cooks: ${ingredients}.`,
      'Combine everything, heat through, season to taste, and portion into containers if needed.',
    ];
  }

  return [
    `Prepare the ingredients: ${ingredients}.`,
    'Cook the main protein or vegetables in a non-stick pan over medium heat until cooked through.',
    'Add the remaining ingredients, heat until piping hot, season to taste, and serve.',
  ];
}

function toInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toMacroNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function formatCoreMacros(source = {}) {
  return `${toMacroNumber(source.protein)}g protein · ${toMacroNumber(source.carbs)}g carbs`;
}

function formatFullMacros(source = {}, separator = ' · ') {
  return [
    `${toMacroNumber(source.protein)}g protein`,
    `${toMacroNumber(source.carbs)}g carbs`,
    `${toMacroNumber(source.fats)}g fat`,
    `${toMacroNumber(source.fibre)}g fibre`,
  ].join(separator);
}

function formatMealMacroLine(meal = {}) {
  return `${toMacroNumber(meal.kcal)} kcal · ${formatCoreMacros(meal)} · ${meal.prep}`;
}

function formatShoppingList(plan) {
  const groups = Object.entries(plan.shoppingList || {})
    .filter(([, items]) => items?.length)
    .map(([cat, items]) => [
      catLabel(cat),
      ...items.map(item => `- ${item}`),
    ].join('\n'));

  const householdLines = formatHouseholdTextLines(plan);
  return `${plan.title || 'Meal plan'} shopping list\n${householdLines.join('\n')}\n\n${groups.join('\n\n')}`;
}

function formatPlanShareText(plan, url) {
  const dayLines = (plan.plan || []).map(day => {
    const meals = day.meals.map(meal => `${meal.type}: ${meal.name}`).join('; ');
    if (plan.household?.hasMixedPortions) {
      return `${day.day}: ${meals} (${day.totals.kcal} kcal full portion, ${formatCoreMacros(day.totals)} full portion, ${day.householdTotals.kcal} kcal household)`;
    }
    return `${day.day}: ${meals} (${day.totals.kcal} kcal, ${formatFullMacros(day.totals, ', ')} per person)`;
  });

  return [
    plan.title,
    ...formatHouseholdTextLines(plan),
    plan.summary?.calorieRange,
    plan.summary?.budgetRange ? `Budget: ${plan.summary.budgetRange}/week estimate total` : null,
    '',
    '7-day menu',
    ...dayLines,
    '',
    `Open the plan: ${url}`,
  ].filter(line => line !== null && line !== undefined).join('\n');
}

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function catLabel(cat) {
  return {
    protein: 'Protein',
    carbs: 'Carbs & Grains',
    vegetables: 'Vegetables',
    dairy: 'Dairy & Eggs',
    fruit: 'Fruit',
    herbs: 'Herbs & Spices',
    condiments: 'Condiments & Oils',
    tins: 'Tins & Jars',
    extras: 'Extras',
  }[cat] || cat;
}

function formatHouseholdLabel(plan) {
  return plan.householdLabel || plan.peopleLabel || '1 person';
}

function formatHouseholdTextLines(plan) {
  const lines = [`Cooking for: ${formatHouseholdLabel(plan)}`];
  if (plan.totalPortionLabel) {
    lines.push(`Cook amount: ${plan.totalPortionLabel} portions`);
  }
  if (plan.household?.hasMixedPortions) {
    lines.push(`Portions: ${plan.household.members.map(member => `${member.label} ${member.portionPercent}%`).join(', ')}`);
  }
  return lines;
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
