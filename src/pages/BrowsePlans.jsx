import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PlanCard from '../components/PlanCard.jsx';
import PopularSearches from '../components/PopularSearches.jsx';
import SearchOpportunityLinks from '../components/SearchOpportunityLinks.jsx';
import WeeklyTrendingLinks from '../components/WeeklyTrendingLinks.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { getAllPlanMeta } from '../utils/planBuilder.js';
import { PLAN_COUNT_LABEL } from '../data/planCatalogMeta.js';
import { BROWSE_PAGE_SIZE, buildBrowsePagePath, buildBrowsePageWindow } from '../data/browsePagination.js';
import { MEAL_PLAN_HUBS } from '../data/mealPlanHubs.js';
import { COMBO_LANDING_PAGES } from '../data/comboLandingPages.js';
import { SITE_VISUALS } from '../data/visualAssets.js';
import { toTitleCase } from '../utils/textFormatting.js';
import { proteinFilterMatches } from '../utils/targetValidation.js';
import { trackEvent } from '../utils/analytics.js';

// Browse only links to indexed, prerendered plan pages. The larger synthetic
// coverage pool is kept out of public links so Google and users never land on
// plan URLs that the static build does not serve as detail pages.
const ALL_PLANS = getAllPlanMeta({ calculateMacros: false });
const PLAN_INDEX_LIMIT = 3;

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

// Per person, per week — as everywhere else the site quotes a cost. "Flexible"
// named the most expensive tier, which read as "no strong feelings" while
// filtering to the priciest plans.
const BUDGETS = [
  { value: '',           label: 'Any budget' },
  { value: 'very-cheap', label: 'Very cheap (£20–30 pp/week)' },
  { value: 'budget',     label: 'Budget (£30–40 pp/week)' },
  { value: 'moderate',   label: 'Moderate (£40–55 pp/week)' },
  { value: 'flexible',   label: 'Higher budget (£55+ pp/week)' },
];

const EFFORTS = [
  { value: '',            label: 'Any effort' },
  { value: 'minimal',    label: 'Minimal' },
  { value: 'low',        label: 'Low' },
  { value: 'standard',   label: 'Standard' },
  { value: 'batch',      label: 'Batch cooking' },
  { value: 'high-variety','label':'High variety' },
];

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
    label: 'More specific plan options',
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
  const { page: pageParam } = useParams();
  const paramString = params.toString();
  const routePage = readPageParam(pageParam);
  // Static prerendering cannot know a visitor's query string. Keep the first
  // client render identical to the prerendered unfiltered page, then apply URL
  // filters in the effect below. This avoids hydration errors on shared or
  // bookmarked filtered URLs.
  const [search,     setSearch]     = useState('');
  const [goal,       setGoal]       = useState('');
  const [supermarket,setSupermarket]= useState('');
  const [diet,       setDiet]       = useState('');
  const [calories,   setCalories]   = useState('');
  const [budget,     setBudget]     = useState('');
  const [effort,     setEffort]     = useState('');
  const [page,       setPage]       = useState(routePage);

  useEffect(() => {
    const currentParams = new URLSearchParams(paramString);
    setSearch(currentParams.get('search') || '');
    setGoal(readFilterParam(currentParams, 'goal', GOALS));
    setSupermarket(readFilterParam(currentParams, 'supermarket', SUPERMARKETS));
    setDiet(readFilterParam(currentParams, 'diet', DIETS));
    setCalories(readFilterParam(currentParams, 'calories', CALORIES));
    setBudget(readFilterParam(currentParams, 'budget', BUDGETS));
    setEffort(readFilterParam(currentParams, 'effort', EFFORTS));
    setPage(routePage);
  }, [paramString, routePage]);

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

  useEffect(() => {
    const hasIntent = search || goal || supermarket || diet || calories || budget || effort;
    if (!hasIntent) return undefined;

    const timer = window.setTimeout(() => {
      trackEvent('browse_filters_changed', {
        search: cleanBrowseSearch(search),
        goal,
        supermarket,
        diet,
        calories,
        budget,
        effort,
        result_count: filtered.length,
      });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [search, goal, supermarket, diet, calories, budget, effort, filtered.length]);

  const goalOptions = useMemo(() => withOptionCounts(GOALS, 'goal', filters), [filters]);
  const supermarketOptions = useMemo(() => withOptionCounts(SUPERMARKETS, 'supermarket', filters), [filters]);
  const dietOptions = useMemo(() => withOptionCounts(DIETS, 'dietType', filters), [filters]);
  const calorieOptions = useMemo(() => withOptionCounts(CALORIES, 'calories', filters), [filters]);
  const budgetOptions = useMemo(() => withOptionCounts(BUDGETS, 'budget', filters), [filters]);
  const effortOptions = useMemo(() => withOptionCounts(EFFORTS, 'effort', filters), [filters]);

  const hasActiveFilters = Boolean(search || goal || supermarket || diet || calories || budget || effort);
  const pageCount = Math.max(1, Math.ceil(filtered.length / BROWSE_PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const pageStartIndex = (currentPage - 1) * BROWSE_PAGE_SIZE;
  const shown = filtered.slice(pageStartIndex, pageStartIndex + BROWSE_PAGE_SIZE);
  const pageNumbers = useMemo(() => (
    buildBrowsePageWindow(currentPage, pageCount)
  ), [currentPage, pageCount]);
  const canonicalPath = !hasActiveFilters ? buildBrowsePagePath(currentPage) : '/browse';
  const pageTitleSuffix = currentPage > 1 && !hasActiveFilters ? ` - Page ${currentPage}` : '';
  const browseDescription = currentPage > 1 && !hasActiveFilters
    ? `Page ${currentPage} of free UK diet plans by supermarket, calories, goal, diet, budget and effort, with printable shopping-list plans.`
    : 'Browse free online diet plans for UK supermarkets, including 1500 calorie, high protein, vegetarian, muscle gain and printable shopping-list plans.';
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Browse ${PLAN_COUNT_LABEL} UK meal plans${pageTitleSuffix}`,
      description: browseDescription,
      url: `https://www.mealprep.org.uk${canonicalPath}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: shown.map((plan, index) => ({
          '@type': 'ListItem',
          position: pageStartIndex + index + 1,
          name: plan.title,
          url: `https://www.mealprep.org.uk/plans/${plan.slug}`,
        })),
      },
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
        title={`Browse ${PLAN_COUNT_LABEL} UK Meal Plans by Goal & Calories${pageTitleSuffix} | MealPrep.org.uk`}
        description={browseDescription}
        canonical={`https://www.mealprep.org.uk${canonicalPath}`}
        robots={hasActiveFilters ? 'noindex,follow' : undefined}
        jsonLd={jsonLd}
      />

      <div className="content-page browse-page">
        <div className="browse-header">
          <SiteLogo variant="page" className="page-header-logo" />
          <h1>Browse All UK Meal Plans</h1>
          <p className="browse-sub">
            {PLAN_COUNT_LABEL} plans covering every goal, supermarket, and diet.
            {' '}<Link to="/quiz" className="browse-quiz-link">Take the quiz to get matched →</Link>
          </p>
        </div>

        {/* Search + filters */}
        <div className="browse-filters" id="browse-filters">
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
        <section aria-labelledby="browse-results-heading">
          <h2 id="browse-results-heading" className="sr-only">Meal plan results</h2>
          {shown.length === 0 ? (
            <div className="browse-empty">
              <p>No plans match your filters.</p>
              <button onClick={resetFilters} className="btn-secondary" type="button">Clear all filters</button>
            </div>
          ) : (
            <div className="browse-grid">
              {shown.map(plan => (
                <PlanCard key={plan.slug} plan={plan} sourcePage="browse" />
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {pageCount > 1 && (
          <nav className="browse-pagination" aria-label="Browse meal plan pages">
            {hasActiveFilters ? (
              <>
                <button
                  className="browse-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  type="button"
                >
                  &larr; Previous
                </button>
                <span className="browse-page-info">Page {currentPage} of {pageCount}</span>
                <button
                  className="browse-page-btn"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                  type="button"
                >
                  Next &rarr;
                </button>
              </>
            ) : (
              <>
                {currentPage > 1 ? (
                  <Link className="browse-page-btn" to={buildBrowsePagePath(currentPage - 1)}>
                    &larr; Previous
                  </Link>
                ) : (
                  <span className="browse-page-btn browse-page-btn--disabled" aria-disabled="true">
                    &larr; Previous
                  </span>
                )}
                <span className="browse-page-info">Page {currentPage} of {pageCount}</span>
                {currentPage < pageCount ? (
                  <Link className="browse-page-btn" to={buildBrowsePagePath(currentPage + 1)}>
                    Next &rarr;
                  </Link>
                ) : (
                  <span className="browse-page-btn browse-page-btn--disabled" aria-disabled="true">
                    Next &rarr;
                  </span>
                )}
                <div className="browse-page-links" aria-label="Browse pages">
                  {pageNumbers.map((pageNumber, index) => (
                    pageNumber === 'gap' ? (
                      <span
                        key={`gap-${index}`}
                        className="browse-page-gap"
                        aria-hidden="true"
                      >
                        &hellip;
                      </span>
                    ) : pageNumber === currentPage ? (
                      <span
                        key={pageNumber}
                        className="browse-page-number browse-page-number--active"
                        aria-current="page"
                      >
                        {pageNumber}
                      </span>
                    ) : (
                      <Link
                        key={pageNumber}
                        className="browse-page-number"
                        to={buildBrowsePagePath(pageNumber)}
                        aria-label={`Page ${pageNumber} of ${pageCount}`}
                      >
                        {pageNumber}
                      </Link>
                    )
                  ))}
                </div>
              </>
            )}
          </nav>
        )}

        <PageHeroVisual visual={SITE_VISUALS.browse} className="browse-hero-visual browse-hero-visual--after-results" priority />

        <PopularSearches
          title="Popular UK searches"
          intro="Use these shortcuts for the highest-demand calorie, protein, shopping-list and container guides."
          className="popular-searches--browse"
        />

        <WeeklyTrendingLinks />

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

        <SearchOpportunityLinks compact />

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
      <Footer />
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

function readFilterParam(params, key, options) {
  const value = params.get(key) || '';
  return options.some(option => option.value === value) ? value : '';
}

function readPageParam(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 1 ? parsed : 1;
}

// Options that cannot return a single plan are removed from the dropdown
// entirely rather than rendered disabled. A selectable filter that yields an
// empty page is a dead end, and combinations like "vegan goal + standard diet"
// are contradictions that should never be offered in the first place. The
// currently-selected value is always kept so the control never loses its own
// state mid-interaction.
function withOptionCounts(options, field, filters) {
  return options
    .map(option => {
      if (!option.value) return option;

      const optionFilters = { ...filters, [field]: option.value };
      const count = ALL_PLANS.reduce((total, plan) => (
        planMatchesFilters(plan, optionFilters) ? total + 1 : total
      ), 0);

      return { ...option, count, label: `${option.label} (${count})` };
    })
    .filter(option => (
      !option.value ||
      option.count > 0 ||
      String(filters[field] || '') === String(option.value)
    ));
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
  const proteinTarget = q.match(/^(\d{2,3})g protein$/);
  if (proteinTarget) {
    return proteinFilterMatches(plan.macrosGrams?.protein, proteinTarget[1]);
  }

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

function cleanBrowseSearch(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 100);
}
