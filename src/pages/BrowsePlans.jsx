import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import { getAllPlanMeta, GOAL_LABELS, BUDGET_ESTIMATES } from '../utils/planBuilder.js';

const ALL_PLANS = getAllPlanMeta();

const GOALS = [
  { value: '',                      label: 'All goals' },
  { value: 'weight-loss',           label: 'Weight Loss' },
  { value: 'budget-fat-loss',       label: 'Budget Fat Loss' },
  { value: 'high-protein-low-cal',  label: 'High Protein Low Cal' },
  { value: 'muscle-gain',           label: 'Muscle Gain' },
  { value: 'gym-beginner',          label: 'Gym Beginner' },
  { value: 'budget-bodybuilding',   label: 'Budget Bodybuilding' },
  { value: 'cheap-student',         label: 'Cheap Student' },
  { value: 'cheap-high-protein',    label: 'Cheap High Protein' },
  { value: 'low-effort',            label: 'Low Effort' },
  { value: 'busy-professional',     label: 'Busy Professional' },
  { value: 'vegetarian-low-cal',    label: 'Vegetarian Low Cal' },
  { value: 'vegan-low-cal',         label: 'Vegan Low Cal' },
  { value: 'high-protein-vegetarian','label': 'High Protein Veg' },
  { value: 'pescatarian',           label: 'Pescatarian' },
  { value: 'maintenance',           label: 'Maintenance' },
  { value: 'anti-inflammatory',     label: 'Anti-Inflammatory' },
  { value: 'menopause-nutrition',   label: 'Menopause Nutrition' },
  { value: 'endurance-athlete',     label: 'Endurance & Running' },
  { value: 'cutting',               label: 'Cutting Phase' },
];

const SUPERMARKETS = [
  { value: '', label: 'All supermarkets' },
  { value: 'aldi',       label: 'Aldi' },
  { value: 'lidl',       label: 'Lidl' },
  { value: 'tesco',      label: 'Tesco' },
  { value: 'asda',       label: 'Asda' },
  { value: 'sainsburys', label: "Sainsbury's" },
  { value: 'morrisons',  label: 'Morrisons' },
  { value: 'iceland',    label: 'Iceland' },
  { value: 'any',        label: 'Any / No preference' },
];

const DIETS = [
  { value: '',            label: 'All diets' },
  { value: 'standard',   label: 'Standard' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan',      label: 'Vegan' },
  { value: 'pescatarian',label: 'Pescatarian' },
];

const CALORIES = [
  { value: '',     label: 'Any calories' },
  { value: '1500', label: '~1,500 kcal' },
  { value: '1800', label: '~1,800 kcal' },
  { value: '1400', label: '~1,400 kcal' },
  { value: '1600', label: '~1,600 kcal' },
  { value: '2000', label: '~2,000 kcal' },
  { value: '2200', label: '~2,200 kcal' },
  { value: '2500', label: '~2,500 kcal' },
];

const BUDGETS = [
  { value: '',           label: 'Any budget' },
  { value: 'very-cheap', label: 'Very cheap (£20–30)' },
  { value: 'budget',     label: 'Budget (£30–40)' },
  { value: 'moderate',   label: 'Moderate (£40–55)' },
  { value: 'flexible',   label: 'Flexible (£55+)' },
];

const EFFORTS = [
  { value: '',            label: 'Any effort' },
  { value: 'minimal',    label: 'Minimal' },
  { value: 'low',        label: 'Low' },
  { value: 'standard',   label: 'Standard' },
  { value: 'batch',      label: 'Batch cooking' },
  { value: 'high-variety','label':'High variety' },
];

const MKT_LABEL = {
  aldi: 'Aldi', lidl: 'Lidl', tesco: 'Tesco', asda: 'Asda',
  sainsburys: "Sainsbury's", morrisons: 'Morrisons', iceland: 'Iceland', any: 'Any',
};

const EFFORT_LABEL = {
  minimal: 'Minimal', low: 'Low', standard: 'Standard',
  batch: 'Batch cook', 'high-variety': 'High variety',
};

export default function BrowsePlans() {
  const [search,     setSearch]     = useState('');
  const [goal,       setGoal]       = useState('');
  const [supermarket,setSupermarket]= useState('');
  const [diet,       setDiet]       = useState('');
  const [calories,   setCalories]   = useState('');
  const [budget,     setBudget]     = useState('');
  const [effort,     setEffort]     = useState('');
  const [page,       setPage]       = useState(1);
  const PER_PAGE = 24;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_PLANS.filter(p => {
      if (goal       && p.goal !== goal)                         return false;
      if (supermarket && p.supermarket !== supermarket)          return false;
      if (diet       && p.dietType !== diet)                     return false;
      if (calories   && String(p.calories) !== calories)         return false;
      if (budget     && p.budget !== budget)                     return false;
      if (effort     && p.effort !== effort)                     return false;
      if (q && !p.title.toLowerCase().includes(q) &&
               !p.goalLabel.toLowerCase().includes(q))           return false;
      return true;
    });
  }, [search, goal, supermarket, diet, calories, budget, effort]);

  const pageCount  = Math.ceil(filtered.length / PER_PAGE);
  const shown      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function resetFilters() {
    setSearch(''); setGoal(''); setSupermarket(''); setDiet('');
    setCalories(''); setBudget(''); setEffort(''); setPage(1);
  }

  function updateFilter(setter, val) {
    setter(val);
    setPage(1);
  }

  return (
    <>
      <SEO
        title="Free UK Meal Plans 2026 — Search by Goal, Supermarket & Calories | MealPrep.org.uk"
        description="Browse 300 free UK meal plans by goal, supermarket, calories, diet, budget, and effort. Weight loss, muscle gain, vegan, vegetarian, anti-inflammatory and more — no sign-up needed."
        canonical="https://www.mealprep.org.uk/browse"
      />

      <div className="content-page browse-page">
        <div className="browse-header">
          <h1>Browse All UK Meal Plans</h1>
          <p className="browse-sub">
            {ALL_PLANS.length} plans covering every goal, supermarket, and diet.
            {' '}<Link to="/quiz" className="browse-quiz-link">Take the quiz to get matched →</Link>
          </p>
        </div>

        {/* Search + filters */}
        <div className="browse-filters">
          <input
            className="browse-search"
            type="search"
            placeholder="Search plans…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            aria-label="Search meal plans"
          />

          <div className="browse-filter-row">
            <Select label="Goal"        value={goal}        onChange={v => updateFilter(setGoal, v)}        options={GOALS} />
            <Select label="Supermarket" value={supermarket} onChange={v => updateFilter(setSupermarket, v)} options={SUPERMARKETS} />
            <Select label="Diet"        value={diet}        onChange={v => updateFilter(setDiet, v)}        options={DIETS} />
            <Select label="Calories"    value={calories}    onChange={v => updateFilter(setCalories, v)}    options={CALORIES} />
            <Select label="Budget"      value={budget}      onChange={v => updateFilter(setBudget, v)}      options={BUDGETS} />
            <Select label="Effort"      value={effort}      onChange={v => updateFilter(setEffort, v)}      options={EFFORTS} />
          </div>

          <div className="browse-filter-meta">
            <span className="browse-count">{filtered.length} plan{filtered.length !== 1 ? 's' : ''}</span>
            {(goal || supermarket || diet || calories || budget || effort || search) && (
              <button className="browse-reset" onClick={resetFilters} type="button">Clear filters</button>
            )}
          </div>
        </div>

        {/* Plan grid */}
        {shown.length === 0 ? (
          <div className="browse-empty">
            <p>No plans match your filters.</p>
            <button onClick={resetFilters} className="btn-secondary" type="button">Clear all filters</button>
          </div>
        ) : (
          <div className="browse-grid">
            {shown.map(plan => (
              <Link key={plan.slug} to={`/plans/${plan.slug}`} className="browse-plan-card">
                <div className="bpc-goal-tag">{plan.goalLabel}</div>
                <h2 className="bpc-title">{plan.title}</h2>
                <div className="bpc-meta">
                  <span className="bpc-meta-item">{MKT_LABEL[plan.supermarket] || plan.supermarket}</span>
                  <span className="bpc-meta-item">~{plan.calories} kcal</span>
                  <span className="bpc-meta-item">{plan.priceEstimate}/wk</span>
                  <span className="bpc-meta-item">{EFFORT_LABEL[plan.effort] || plan.effort}</span>
                </div>
                {plan.dietType !== 'standard' && (
                  <span className="bpc-diet-badge">{cap(plan.dietType)}</span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="browse-pagination">
            <button
              className="browse-page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              type="button"
            >
              ← Previous
            </button>
            <span className="browse-page-info">Page {page} of {pageCount}</span>
            <button
              className="browse-page-btn"
              disabled={page === pageCount}
              onClick={() => setPage(p => p + 1)}
              type="button"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="browse-filter-label">
      <span className="browse-filter-name">{label}</span>
      <select
        className="browse-filter-select"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={label}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
