import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import FeedbackBox from '../components/FeedbackBox.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { buildShoppingList, getPlanBySlug } from '../utils/planBuilder.js';
import { PLAN_COUNT } from '../data/planSeeds.js';
import { getSupermarketEvidence } from '../data/comboLandingPages.js';
import { choosePlanVisual } from '../data/visualAssets.js';
import { track } from '../utils/analytics.js';

const MKT_LABEL = {
  aldi: 'Aldi', lidl: 'Lidl', tesco: 'Tesco', asda: 'Asda',
  sainsburys: "Sainsbury's", morrisons: 'Morrisons', iceland: 'Iceland',
  any: 'Generic UK supermarket',
};

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

  if (!plan) {
    return (
      <div className="content-page">
        <h1>Plan not found</h1>
        <p><Link to="/browse">Browse all {PLAN_COUNT} meal plans</Link></p>
      </div>
    );
  }

  const displayPlan = editedPlan || plan;
  const activeDay   = displayPlan.plan[activeDayIdx];
  const planVisual  = choosePlanVisual(plan);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: plan.title,
      description: plan.seo.description,
      url: plan.seo.canonical,
      publisher: {
        '@type': 'Organization',
        name: 'MealPrep.org.uk',
        url: 'https://www.mealprep.org.uk',
      },
    },
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

    const meal = displayPlan.plan[editTarget.dayIdx].meals[editTarget.mealIdx];

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
        if (!originalPlan) setOriginalPlan(displayPlan);

        const newPlan = JSON.parse(JSON.stringify(displayPlan));
        newPlan.plan[editTarget.dayIdx].meals[editTarget.mealIdx] = normaliseEditedMeal(meal, data.meal);
        // Recalculate day totals
        const dayMeals = newPlan.plan[editTarget.dayIdx].meals;
        newPlan.plan[editTarget.dayIdx].totals = {
          kcal:    dayMeals.reduce((s, m) => s + (m.kcal || 0), 0),
          protein: dayMeals.reduce((s, m) => s + (m.protein || 0), 0),
        };
        newPlan.shoppingList = buildShoppingList(newPlan.plan);

        setEditedPlan(newPlan);
        setEditNote('Plan updated. Calorie and macro values are estimates after AI editing.');
        setEditTarget(null);
        setEditPrompt('');
      }
    } catch (err) {
      setEditError('Edit failed. Please try again.');
    } finally {
      setEditLoading(false);
    }
  }

  function resetToOriginal() {
    setEditedPlan(null);
    setOriginalPlan(null);
    setEditNote('');
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
    window.print();
  }

  return (
    <>
      <SEO
        title={plan.seo.title}
        description={plan.seo.description}
        canonical={plan.seo.canonical}
        jsonLd={jsonLd}
        ogTitle={plan.seo.ogTitle}
        ogDescription={plan.seo.ogDescription}
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

        {/* Summary card */}
        <div className="plan-summary-card">
          <div className="plan-summary-grid">
            <SummaryItem label="Supermarket"  value={MKT_LABEL[plan.supermarket] || plan.supermarket} />
            <SummaryItem label="Calorie target" value={plan.summary.calorieRange} />
            <SummaryItem label="Weekly budget"  value={plan.summary.budgetRange} />
            <SummaryItem label="Prep difficulty" value={plan.effortLabel} />
            <SummaryItem label="Best for"       value={plan.summary.bestFor} />
            <SummaryItem label="Diet"
              value={plan.dietType === 'standard' ? 'All diets' : cap(plan.dietType)} />
          </div>

          {/* Macro bars */}
          <div className="plan-macros">
            <h3 className="plan-macros-title">Estimated daily macros</h3>
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

        <PlanQuickFacts plan={plan} />
        <PlanShareTools
          onCopyPlan={copyPlanSummary}
          onSharePlan={sharePlan}
          planCopyStatus={planCopyStatus}
          shareStatus={shareStatus}
        />
        <SupermarketEvidence plan={plan} />
        <BatchPrepPlan prepPlan={plan.prepPlan} />

        {/* Quiz CTA */}
        <div className="plan-quiz-cta">
          <Link to="/quiz" className="btn-quiz-inline">Not right for you? Take the quiz →</Link>
        </div>

        <section className="plan-export-section" aria-labelledby="plan-export-heading">
          <div>
            <h2 id="plan-export-heading">Export This Meal Plan as a PDF</h2>
            <p>
              Print this 7-day meal plan or save it as a PDF. The printable meal plan summary includes
              every meal, daily calories, protein totals and the full weekly shopping list.
            </p>
          </div>
          <button className="plan-export-btn" onClick={handlePrintPlan} type="button">
            Export / print PDF
          </button>
        </section>

        <PrintablePlanSummary
          plan={displayPlan}
          marketLabel={MKT_LABEL[plan.supermarket] || plan.supermarket}
        />

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
                <span>{activeDay.totals.protein}g protein</span>
              </div>
            </div>

            <div className="plan-meals-list">
              {activeDay.meals.map((meal, mi) => (
                <div className="plan-meal-card" key={mi}>
                  <div className="plan-meal-header">
                    <span className="plan-meal-type">{meal.type}</span>
                    <span className="plan-meal-macros">{meal.kcal} kcal · {meal.protein}g protein · {meal.prep}</span>
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
          <p className="plan-shopping-note">Estimated cost: <strong>{plan.priceEstimate}/week</strong> for one person from {MKT_LABEL[plan.supermarket] || plan.supermarket}.</p>
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

        <PlanContainerLinks plan={plan} />

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

        <FeedbackBox />

      </div>
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

function PlanShareTools({ onCopyPlan, onSharePlan, planCopyStatus, shareStatus }) {
  return (
    <section className="plan-share-section" aria-labelledby="plan-share-heading">
      <div>
        <h2 id="plan-share-heading">Save or share this plan</h2>
        <p>
          Copy a clean weekly summary, send the link to yourself, or share it with
          someone you shop or meal prep with.
        </p>
      </div>
      <div className="plan-share-actions">
        <button className="plan-share-btn" onClick={onCopyPlan} type="button">
          {planCopyStatus || 'Copy plan summary'}
        </button>
        <button className="plan-share-btn plan-share-btn--primary" onClick={onSharePlan} type="button">
          {shareStatus || 'Share plan link'}
        </button>
      </div>
    </section>
  );
}

function SupermarketEvidence({ plan }) {
  const evidence = getSupermarketEvidence(plan.supermarket);

  return (
    <section className="supermarket-evidence" aria-labelledby="plan-evidence-heading">
      <div>
        <h2 id="plan-evidence-heading">{evidence.label} shopping evidence notes</h2>
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

function BatchPrepPlan({ prepPlan }) {
  if (!prepPlan?.steps?.length) return null;

  return (
    <section className="plan-prep-section" aria-labelledby="plan-prep-heading">
      <div>
        <h2 id="plan-prep-heading">{prepPlan.title}</h2>
        <p>{prepPlan.intro}</p>
      </div>
      <ol className="plan-prep-list">
        {prepPlan.steps.map((step, index) => <li key={index}>{step}</li>)}
      </ol>
    </section>
  );
}

function PlanContainerLinks({ plan }) {
  const isBudget = plan.budget === 'very-cheap' || plan.budget === 'budget';
  const primary = isBudget ? '/meal-prep-containers/budget' : '/meal-prep-containers/mid-range';
  const primaryLabel = isBudget ? 'Budget meal prep containers' : 'Glass meal prep containers';

  return (
    <section className="plan-container-links" aria-labelledby="plan-container-links-heading">
      <div>
        <h2 id="plan-container-links-heading">Containers for this meal prep plan</h2>
        <p>
          Batch cooking this week? Compare meal prep boxes, tubs and glass containers before you portion
          the shopping list into lunches and dinners.
        </p>
      </div>
      <div className="plan-container-link-list">
        <Link to="/meal-prep-containers">Best meal prep containers</Link>
        <Link to={primary}>{primaryLabel}</Link>
        {primary !== '/meal-prep-containers/budget' && (
          <Link to="/meal-prep-containers/budget">Budget plastic tubs</Link>
        )}
        {primary !== '/meal-prep-containers/mid-range' && (
          <Link to="/meal-prep-containers/mid-range">Mid-range glass boxes</Link>
        )}
        <Link to="/meal-prep-containers/premium">Premium storage sets</Link>
      </div>
    </section>
  );
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
          daily calories, protein totals and the weekly shopping list.
        </p>
      </header>

      <div className="print-summary-meta">
        <span>Supermarket: {marketLabel}</span>
        <span>Calories: {plan.summary?.calorieRange || `~${plan.calories} kcal/day`}</span>
        <span>Budget: {plan.summary?.budgetRange || plan.priceEstimate}</span>
        <span>Diet: {plan.dietType === 'standard' ? 'All diets' : cap(plan.dietType)}</span>
      </div>

      <h3>7-day meal plan</h3>
      <div className="print-days">
        {plan.plan.map(day => (
          <article className="print-day" key={day.day}>
            <div className="print-day-heading">
              <h4>{day.day}</h4>
              <span>{day.totals.kcal} kcal - {day.totals.protein}g protein</span>
            </div>
            <ul>
              {day.meals.map((meal, index) => (
                <li key={`${day.day}-${meal.type}-${index}`}>
                  <strong>{meal.type}:</strong> {meal.name} ({meal.kcal} kcal, {meal.protein}g protein)
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

function formatShoppingList(plan) {
  const groups = Object.entries(plan.shoppingList || {})
    .filter(([, items]) => items?.length)
    .map(([cat, items]) => [
      catLabel(cat),
      ...items.map(item => `- ${item}`),
    ].join('\n'));

  return `${plan.title || 'Meal plan'} shopping list\n\n${groups.join('\n\n')}`;
}

function formatPlanShareText(plan, url) {
  const dayLines = (plan.plan || []).map(day => {
    const meals = day.meals.map(meal => `${meal.type}: ${meal.name}`).join('; ');
    return `${day.day}: ${meals} (${day.totals.kcal} kcal, ${day.totals.protein}g protein)`;
  });

  return [
    plan.title,
    plan.summary?.calorieRange,
    plan.summary?.budgetRange ? `Budget: ${plan.summary.budgetRange}/week estimate` : null,
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
  return { protein: 'Protein', carbs: 'Carbs & Grains', vegetables: 'Vegetables', dairy: 'Dairy & Eggs', extras: 'Extras & Condiments' }[cat] || cat;
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
