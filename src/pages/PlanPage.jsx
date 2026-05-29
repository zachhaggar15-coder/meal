import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import { getPlanBySlug } from '../utils/planBuilder.js';

const MKT_LABEL = {
  aldi: 'Aldi', lidl: 'Lidl', tesco: 'Tesco', asda: 'Asda',
  sainsburys: "Sainsbury's", morrisons: 'Morrisons', iceland: 'Iceland',
  any: 'Any UK supermarket',
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

  if (!plan) {
    return (
      <div className="content-page">
        <h1>Plan not found</h1>
        <p><Link to="/browse">Browse all meal plans</Link></p>
      </div>
    );
  }

  const displayPlan = editedPlan || plan;
  const activeDay   = displayPlan.plan[activeDayIdx];

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
        newPlan.plan[editTarget.dayIdx].meals[editTarget.mealIdx] = {
          ...meal,
          ...data.meal,
        };
        // Recalculate day totals
        const dayMeals = newPlan.plan[editTarget.dayIdx].meals;
        newPlan.plan[editTarget.dayIdx].totals = {
          kcal:    dayMeals.reduce((s, m) => s + (m.kcal || 0), 0),
          protein: dayMeals.reduce((s, m) => s + (m.protein || 0), 0),
        };

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
        <h1 className="plan-page-h1">{plan.title}</h1>
        <p className="plan-page-intro">{plan.seo.description}</p>

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
            <h3 className="plan-macros-title">Macro emphasis</h3>
            <div className="macro-bars">
              {[
                { key: 'protein', label: 'Protein' },
                { key: 'carbs',   label: 'Carbs' },
                { key: 'fats',    label: 'Fats' },
                { key: 'fibre',   label: 'Fibre' },
              ].map(({ key, label }) => (
                <div className="macro-bar-row" key={key}>
                  <span className="macro-bar-label">{label}</span>
                  <div className="macro-bar-track">
                    <div className="macro-bar-fill" style={{ width: `${plan.macros[key] || 50}%` }} />
                  </div>
                  <span className="macro-bar-pct">{plan.macros[key] || 50}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz CTA */}
        <div className="plan-quiz-cta">
          <Link to="/quiz" className="btn-quiz-inline">Not right for you? Take the quiz →</Link>
        </div>

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
                  {meal.portion_size && (
                    <p className="plan-meal-portions">{meal.portion_size}</p>
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
          <h2>Weekly Shopping List</h2>
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
          <Link to="/browse" className="btn-secondary">Browse all 250 plans</Link>
        </div>

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

function catLabel(cat) {
  return { protein: 'Protein', carbs: 'Carbs & Grains', vegetables: 'Vegetables', dairy: 'Dairy & Eggs', extras: 'Extras & Condiments' }[cat] || cat;
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
