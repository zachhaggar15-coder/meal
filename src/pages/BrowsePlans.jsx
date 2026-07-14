import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PopularSearches from '../components/PopularSearches.jsx';
import SearchOpportunityLinks from '../components/SearchOpportunityLinks.jsx';
import WeeklyTrendingLinks from '../components/WeeklyTrendingLinks.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { getAllPlanMeta } from '../utils/planBuilder.js';
import { PLAN_COUNT } from '../data/planSeeds.js';
import { MEAL_PLAN_HUBS } from '../data/mealPlanHubs.js';
import { COMBO_LANDING_PAGES } from '../data/comboLandingPages.js';
import { SITE_VISUALS } from '../data/visualAssets.js';
import { toTitleCase } from '../utils/textFormatting.js';

// ALL_PLANS intentionally includes the large synthetic "coverage" pool (see
// planSeeds.js) so filtering can match granular goal/supermarket/diet/calorie
// combinations beyond the curated, indexed set. PLAN_COUNT (imported above)
// is the honest count of real, indexed plans and is used only for headline
// marketing/SEO text ("Browse X plans") — never for filtering.
const ALL_PLANS = getAllPlanMeta();
const PLAN_INDEX_LIMIT = 12;

const GOALS = [
  { value: '',                      label: 'All goals' },
  { value: 'weight-loss',           label: 'Weight Loss' },
  { value: 'budget-fat-loss',       label: 'Budget Fat Loss' },
  { value: 'high-protein-low-cal',  label: 'High Protein Low Cal' },
  { value: 'muscle-gain',           label: 'Muscle Gain' },
  { value: 'body-recomp',           label: 'Body Recomp' },
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
  { value: 'any',        label: 'Generic UK supermarket' },
  { value: 'aldi',       label: 'Aldi' },
  { value: 'lidl',       label: 'Lidl' },
  { value: 'tesco',      label: 'Tesco' },
  { value: 'asda',       label: 'Asda' },
  { value: 'sainsburys', label: "Sainsbury's" },
  { value: 'morrisons',  label: 'Morrisons' },
  { value: 'iceland',    label: 'Iceland' },
  { value: 'waitrose',   label: 'Waitrose' },
  { value: 'ocado',      label: 'Ocado' },
  { value: 'marks-spencer', label: 'M&S' },
  { value: 'coop',       label: 'Co-op' },
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
  { value: '3000', label: '~3,000 kcal' },
  { value: '3500', label: '~3,500 kcal' },
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
  sainsburys: "Sainsbury's", morrisons: 'Morrisons', iceland: 'Iceland',
  waitrose: 'Waitrose', ocado: 'Ocado', 'marks-spencer': 'M&S', coop: 'Co-op',
  any: 'Generic UK supermarket',
};

const EFFORT_LABEL = {
  minimal: 'Minimal', low: 'Low', standard: 'Standard',
  batch: 'Batch cook', 'high-variety': 'High variety',
};

const MACRO_SEARCH_TERMS = {
  'performance-protein': 'high protein high carb high carbohydrate 220g carbs 230g carbs 160g protein 170g protein performance protein muscle gain bodybuilding gym training fuel lean bulk',
  'high-carb-fuel': 'high carb high carbohydrate 220g carbs 250g carbs 280g carbs endurance running training fuel carb load performance',
  'lean-protein': 'high protein lean protein low calorie low carb cutting fat loss 150g protein 160g protein',
  'recomp-protein': 'high protein body recomp recomposition training protein muscle retention',
  'whole-food': 'whole food high fibre balanced carbs vegetables minimally processed',
  'batch-cooking': 'batch cooking meal prep repeat meals high protein prep ahead',
  'minimal-effort': 'minimal effort easy quick no fuss simple meals',
  'budget-focus': 'cheap budget low cost value own brand',
  'plant-protein': 'plant protein vegan vegetarian high protein beans tofu lentils',
  'low-cal-swaps': 'low calorie high fibre lighter swaps fat loss',
};

const PLAN_INDEX_GROUPS = GOALS
  .filter(g => g.value)
  .map(g => {
    const plans = ALL_PLANS.filter(p => p.goal === g.value);
    return {
      ...g,
      total: plans.length,
      plans: plans.slice(0, PLAN_INDEX_LIMIT),
    };
  })
  .filter(g => g.total > 0);

const HUB_INDEX_GROUPS = [
  {
    label: 'Calorie plan hubs',
    slugs: ['1200-calorie', '1400-calorie', '1500-calorie', '1600-calorie', '1800-calorie', '2000-calorie', '2500-calorie', '3000-calorie', '3500-calorie'],
  },
  {
    label: 'Supermarket plan hubs',
    slugs: ['aldi', 'lidl', 'tesco', 'asda', 'sainsburys', 'morrisons', 'iceland', 'waitrose', 'ocado', 'marks-spencer', 'coop', 'generic-uk-supermarket'],
  },
  {
    label: 'Goal and diet hubs',
    slugs: ['free-online-diet-plans-uk', 'weight-loss', 'low-calorie', 'high-protein', 'vegetarian', 'vegan', 'pescatarian', 'muscle-gain', 'menopause', 'endurance', 'cheap-student', 'budget-bodybuilding'],
  },
  {
    label: 'Shopping-list hubs',
    slugs: ['meal-plans-with-shopping-list', 'printable-meal-plans', 'low-calorie-shopping-list', 'high-protein-shopping-list', 'budget-shopping-list'],
  },
  {
    label: 'Exact high-intent pages',
    slugs: [
      'aldi-1500-calorie-meal-plan',
      'tesco-1500-calorie-meal-plan',
      'aldi-high-protein-meal-plan',
      'tesco-high-protein-meal-plan',
      'cheap-student-meal-prep-aldi',
      'vegetarian-batch-cooking-meal-plan',
      'work-lunch-meal-prep-uk',
    ],
  },
];

export default function BrowsePlans() {
  const [params] = useSearchParams();
  const paramString = params.toString();
  const [search,     setSearch]     = useState(() => params.get('search') || '');
  const [goal,       setGoal]       = useState(() => readFilterParam(params, 'goal', GOALS));
  const [supermarket,setSupermarket]= useState(() => readFilterParam(params, 'supermarket', SUPERMARKETS));
  const [diet,       setDiet]       = useState(() => readFilterParam(params, 'diet', DIETS));
  const [calories,   setCalories]   = useState(() => readFilterParam(params, 'calories', CALORIES));
  const [budget,     setBudget]     = useState(() => readFilterParam(params, 'budget', BUDGETS));
  const [effort,     setEffort]     = useState(() => readFilterParam(params, 'effort', EFFORTS));
  const [page,       setPage]       = useState(1);
  const PER_PAGE = 24;

  useEffect(() => {
    setSearch(params.get('search') || '');
    setGoal(readFilterParam(params, 'goal', GOALS));
    setSupermarket(readFilterParam(params, 'supermarket', SUPERMARKETS));
    setDiet(readFilterParam(params, 'diet', DIETS));
    setCalories(readFilterParam(params, 'calories', CALORIES));
    setBudget(readFilterParam(params, 'budget', BUDGETS));
    setEffort(readFilterParam(params, 'effort', EFFORTS));
    setPage(1);
  }, [paramString]);

  const filters = useMemo(() => ({
    search,
    goal,
    supermarket,
    dietType: diet,
    calories,
    budget,
    effort,
  }), [search, goal, supermarket, diet, calories, budget, effort]);

  const filtered = useMemo(() => (
    ALL_PLANS.filter(plan => planMatchesFilters(plan, filters))
  ), [filters]);

  const goalOptions = useMemo(() => withOptionCounts(GOALS, 'goal', filters), [filters]);
  const supermarketOptions = useMemo(() => withOptionCounts(SUPERMARKETS, 'supermarket', filters), [filters]);
  const dietOptions = useMemo(() => withOptionCounts(DIETS, 'dietType', filters), [filters]);
  const calorieOptions = useMemo(() => withOptionCounts(CALORIES, 'calories', filters), [filters]);
  const budgetOptions = useMemo(() => withOptionCounts(BUDGETS, 'budget', filters), [filters]);
  const effortOptions = useMemo(() => withOptionCounts(EFFORTS, 'effort', filters), [filters]);

  const pageCount  = Math.ceil(filtered.length / PER_PAGE);
  const shown      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Browse ${PLAN_COUNT} UK meal plans`,
      description: 'Browse free UK meal plans by goal, supermarket, diet, calories, budget and effort.',
      url: 'https://www.mealprep.org.uk/browse',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk/' },
        { '@type': 'ListItem', position: 2, name: 'Meal Plans', item: 'https://www.mealprep.org.uk/browse' },
      ],
    },
  ];

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
        title={`Free UK Diet Plans - Browse ${PLAN_COUNT} Meal Plans by Calories & Supermarket | MealPrep.org.uk`}
        description="Browse free online diet plans for UK supermarkets, including 1500 calorie, high protein, vegetarian, muscle gain and printable shopping-list plans."
        canonical="https://www.mealprep.org.uk/browse"
        jsonLd={jsonLd}
      />

      <div className="content-page browse-page">
        <div className="browse-header">
          <SiteLogo variant="page" className="page-header-logo" />
          <h1>Browse All UK Meal Plans</h1>
          <p className="browse-sub">
            {PLAN_COUNT} plans covering every goal, supermarket, and diet.
            {' '}<Link to="/quiz" className="browse-quiz-link">Take the quiz to get matched →</Link>
          </p>
        </div>

        <PageHeroVisual visual={SITE_VISUALS.browse} className="browse-hero-visual" priority />

        <PopularSearches
          title="Popular UK searches"
          intro="Use these shortcuts for the highest-demand calorie, protein, shopping-list and container guides."
          className="popular-searches--browse"
        />

        <WeeklyTrendingLinks />

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
            <Select label="Goal"        value={goal}        onChange={v => updateFilter(setGoal, v)}        options={goalOptions} />
            <Select label="Supermarket" value={supermarket} onChange={v => updateFilter(setSupermarket, v)} options={supermarketOptions} />
            <Select label="Diet"        value={diet}        onChange={v => updateFilter(setDiet, v)}        options={dietOptions} />
            <Select label="Calories"    value={calories}    onChange={v => updateFilter(setCalories, v)}    options={calorieOptions} />
            <Select label="Budget"      value={budget}      onChange={v => updateFilter(setBudget, v)}      options={budgetOptions} />
            <Select label="Effort"      value={effort}      onChange={v => updateFilter(setEffort, v)}      options={effortOptions} />
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

        <section className="browse-hub-index" aria-labelledby="browse-hub-index-heading">
          <div className="browse-index-header">
            <h2 id="browse-hub-index-heading">UK Meal Plan Hubs</h2>
            <p>Start from a calorie target, supermarket, diet goal or printable shopping list.</p>
          </div>
          <div className="browse-hub-index-grid">
            {HUB_INDEX_GROUPS.map(group => (
              <div className="browse-hub-index-group" key={group.label}>
                <h3>{toTitleCase(group.label)}</h3>
                <div className="browse-hub-links">
                  {group.slugs.map(slug => {
                    const page = MEAL_PLAN_HUBS[slug] || COMBO_LANDING_PAGES[slug];
                    return page ? (
                      <Link key={page.slug} to={page.path}>{toTitleCase(page.h1)}</Link>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <SearchOpportunityLinks />

        <section className="browse-index" aria-labelledby="browse-index-heading">
          <div className="browse-index-header">
            <h2 id="browse-index-heading">Goal Plan Index</h2>
            <p>Featured free UK meal plans, grouped by goal.</p>
          </div>
          <div className="browse-index-grid">
            {PLAN_INDEX_GROUPS.map(group => (
              <details className="browse-index-group" key={group.value}>
                <summary>
                  <span>{group.label}</span>
                  <span>{group.total} plans</span>
                </summary>
                <ul className="browse-index-list">
                  {group.plans.map(plan => (
                    <li key={plan.slug}>
                      <Link to={`/plans/${plan.slug}`}>{plan.title}</Link>
                    </li>
                  ))}
                  {group.total > group.plans.length && (
                    <li className="browse-index-more">
                      <Link to={`/browse?goal=${group.value}`}>
                        View all {group.total} {group.label.toLowerCase()} plans
                      </Link>
                    </li>
                  )}
                </ul>
              </details>
            ))}
          </div>
        </section>
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
          <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function readFilterParam(params, key, options) {
  const value = params.get(key) || '';
  return options.some(option => option.value === value) ? value : '';
}

function withOptionCounts(options, field, filters) {
  return options.map(option => {
    if (!option.value) return option;

    const optionFilters = { ...filters, [field]: option.value };
    const count = ALL_PLANS.reduce((total, plan) => (
      planMatchesFilters(plan, optionFilters) ? total + 1 : total
    ), 0);

    return {
      ...option,
      label: `${option.label} (${count})`,
      disabled: count === 0 && String(filters[field] || '') !== String(option.value),
    };
  });
}

function planMatchesFilters(plan, filters) {
  if (filters.goal && plan.goal !== filters.goal) return false;
  if (filters.supermarket && plan.supermarket !== filters.supermarket) return false;
  if (filters.dietType && plan.dietType !== filters.dietType) return false;
  if (filters.calories && String(plan.calories) !== String(filters.calories)) return false;
  if (filters.budget && plan.budget !== filters.budget) return false;
  if (filters.effort && plan.effort !== filters.effort) return false;

  const q = normaliseSearchText(filters.search);
  if (!q) return true;

  const haystack = normaliseSearchText([
    plan.title,
    plan.goalLabel,
    plan.goal,
    plan.dietType,
    plan.emphasis,
    MACRO_SEARCH_TERMS[plan.emphasis],
  ].filter(Boolean).join(' '));

  return q.split(/\s+/).every(term => haystack.includes(term));
}

function normaliseSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
