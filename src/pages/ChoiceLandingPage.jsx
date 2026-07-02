import { Link, Navigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { getAllPlanMeta } from '../utils/planBuilder.js';
import {
  buildBrowsePlanUrl,
  CALORIE_CHOICES,
  getCalorieChoice,
  getDietChoice,
  getSupermarketChoice,
  GOAL_CHOOSER_ITEMS,
  SUPERMARKET_CHOICES,
} from '../data/planChooser.js';
import { chooseChooserVisual, chooseNavigationCardVisual, chooseSupermarketVisual } from '../data/visualAssets.js';

const ALL_PLANS = getAllPlanMeta();

export default function ChoiceLandingPage({ mode }) {
  const params = useParams();
  const config = getModeConfig(mode, params);

  if (!config?.choice) return <Navigate to="/browse" replace />;

  const cards = config.cards
    .map(card => ({
      ...card,
      plan: chooseBestPlan(card.filters, card.defaultCalories),
    }))
    .filter(card => card.plan);
  const chooserVisual = chooseChooserVisual({ mode, choice: config.choice });

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: config.title,
      description: config.description,
      url: `https://www.mealprep.org.uk${config.canonical}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: cards.map((card, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: card.heading,
          url: `https://www.mealprep.org.uk/plans/${card.plan.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk/' },
        { '@type': 'ListItem', position: 2, name: 'Meal Plans', item: 'https://www.mealprep.org.uk/browse' },
        { '@type': 'ListItem', position: 3, name: config.title, item: `https://www.mealprep.org.uk${config.canonical}` },
      ],
    },
  ];

  return (
    <>
      <SEO
        title={`${config.title} | MealPrep.org.uk`}
        description={config.description}
        canonical={config.canonical}
        jsonLd={jsonLd}
      />

      <div className="content-page plan-chooser-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <Link to="/browse">Meal Plans</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">{config.shortTitle}</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />

        <header className="plan-chooser-hero">
          <span className="offer-kicker">{config.kicker}</span>
          <h1>{config.title}</h1>
          <p>{config.intro}</p>
          <div className="plan-chooser-default">
            <strong>{config.defaultLabel}</strong>
            <span>{config.defaultValue}</span>
            <Link to={config.changeUrl}>Change filters</Link>
          </div>
          <PageHeroVisual visual={chooserVisual} className="plan-chooser-visual" priority />
        </header>

        <section className="plan-chooser-grid" aria-label={config.gridLabel}>
          {cards.map(card => {
            const cardVisual = mode === 'diet'
              ? chooseSupermarketVisual(card.plan.supermarket)
              : chooseNavigationCardVisual({
                  label: card.heading,
                  eyebrow: card.label,
                  note: marketLabel(card.plan.supermarket),
                  seed: `${mode}-${card.key}-${card.plan.slug}`,
                });
            return (
              <article
                key={card.key}
                className={`plan-chooser-card${card.highlight ? ' plan-chooser-card--generic' : ''}`}
              >
                <img
                  src={cardVisual.src}
                  alt=""
                  width={cardVisual.width || 1200}
                  height={cardVisual.height || 675}
                  loading="lazy"
                  decoding="async"
                />
                <div className="plan-chooser-card-head">
                  <span className="plan-chooser-market">{card.label}</span>
                  <span className="plan-chooser-calories">
                    {card.plan.calories.toLocaleString('en-GB')} kcal
                  </span>
                </div>
                <h2>{card.heading}</h2>
                <p>{card.description}</p>
                <div className="plan-chooser-meta">
                  <span>{marketLabel(card.plan.supermarket)}</span>
                  <span>{card.plan.priceEstimate}/week estimate</span>
                  <span>{card.plan.dietType === 'standard' ? 'Standard diet' : cap(card.plan.dietType)}</span>
                </div>
                <div className="plan-chooser-actions">
                  <Link className="btn-primary" to={`/plans/${card.plan.slug}`}>
                    View plan
                  </Link>
                  <Link className="plan-chooser-change" to={card.changeUrl}>
                    More options
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        <section className="choice-index-note">
          <h2>Want a different combination?</h2>
          <p>
            Use the full plan browser to combine supermarket, diet, calories, budget and effort
            without landing on a default Aldi or weight loss plan first.
          </p>
          <Link className="btn-secondary" to={config.changeUrl}>Browse matching plans</Link>
        </section>
      </div>
    </>
  );
}

function getModeConfig(mode, params) {
  if (mode === 'supermarket') return buildSupermarketConfig(params.supermarket);
  if (mode === 'diet') return buildDietConfig(params.diet);
  if (mode === 'calories') return buildCaloriesConfig(params.calories);
  return null;
}

function buildSupermarketConfig(slug) {
  const choice = getSupermarketChoice(slug);
  if (!choice) return null;

  const title = `${choice.label} Meal Plans by Goal`;
  return {
    choice,
    title,
    shortTitle: choice.label,
    kicker: 'Choose your goal',
    canonical: `/choose-supermarket/${choice.value}`,
    description: `Choose a ${choice.label} meal plan by goal, calories and diet type, including weight loss, high protein and muscle gain options.`,
    intro: `${choice.description} Pick the goal first, then open the suggested plan or change calories before choosing.`,
    defaultLabel: 'Current supermarket:',
    defaultValue: choice.label,
    changeUrl: buildBrowsePlanUrl({ supermarket: choice.value }),
    gridLabel: `${choice.label} meal plan goals`,
    cards: GOAL_CHOOSER_ITEMS.map(goal => ({
      key: goal.value,
      label: goal.label,
      heading: `${choice.shortLabel || choice.label} ${goal.label} plan`,
      description: `Start with a ${goal.defaultCalories.toLocaleString('en-GB')} kcal ${goal.label.toLowerCase()} plan, then adjust calories if needed.`,
      defaultCalories: goal.defaultCalories,
      filters: { supermarket: choice.value, goal: goal.value },
      changeUrl: buildBrowsePlanUrl({ supermarket: choice.value, goal: goal.value }),
      highlight: choice.value === 'any',
    })),
  };
}

function buildDietConfig(slug) {
  const choice = getDietChoice(slug);
  if (!choice) return null;

  const title = `${choice.label} Meal Plans by Supermarket`;
  return {
    choice,
    title,
    shortTitle: choice.label,
    kicker: 'Choose your supermarket',
    canonical: `/choose-diet/${choice.value}`,
    description: `Choose a ${choice.label.toLowerCase()} meal plan by supermarket, with generic UK supermarket, Aldi, Lidl, Tesco, Asda and more.`,
    intro: `${choice.description} Pick the supermarket next so the diet type no longer defaults to Aldi.`,
    defaultLabel: 'Current diet type:',
    defaultValue: choice.label,
    changeUrl: buildBrowsePlanUrl({ diet: choice.dietType, goal: choice.defaultGoal }),
    gridLabel: `${choice.label} supermarket choices`,
    cards: SUPERMARKET_CHOICES.map(market => ({
      key: market.value,
      label: market.label,
      heading: `${market.shortLabel || market.label} ${choice.shortLabel} plan`,
      description: market.description,
      defaultCalories: choice.defaultCalories,
      filters: {
        supermarket: market.value,
        dietType: choice.dietType,
        goal: choice.defaultGoal,
      },
      changeUrl: buildBrowsePlanUrl({
        supermarket: market.value,
        diet: choice.dietType,
        goal: choice.defaultGoal,
      }),
      highlight: market.value === 'any',
    })),
  };
}

function buildCaloriesConfig(value) {
  const choice = getCalorieChoice(value);
  if (!choice) return null;

  const title = `${choice.label} Meal Plans by Goal`;
  return {
    choice,
    title,
    shortTitle: choice.label,
    kicker: 'Choose your goal',
    canonical: `/choose-calories/${choice.value}`,
    description: `Choose a ${choice.label} UK meal plan by goal and supermarket, with printable PDFs, macros and shopping lists.`,
    intro: `${choice.description} Pick a goal first, then use More options if you want a different supermarket or diet type.`,
    defaultLabel: 'Current calorie target:',
    defaultValue: `${choice.calories.toLocaleString('en-GB')} kcal/day`,
    changeUrl: buildBrowsePlanUrl({ calories: choice.calories }),
    gridLabel: `${choice.label} meal plan goals`,
    cards: GOAL_CHOOSER_ITEMS.map(goal => ({
      key: goal.value,
      label: goal.label,
      heading: `${choice.label} ${goal.label} plan`,
      description: `Find a ${goal.label.toLowerCase()} plan at this calorie target, then choose the store that fits your weekly shop.`,
      defaultCalories: choice.calories,
      filters: { calories: choice.calories, goal: goal.value },
      changeUrl: buildBrowsePlanUrl({ calories: choice.calories, goal: goal.value }),
      highlight: false,
    })),
  };
}

function chooseBestPlan(filters, defaultCalories) {
  const candidates = ALL_PLANS.filter(plan => {
    if (filters.goal && plan.goal !== filters.goal) return false;
    if (filters.supermarket && plan.supermarket !== filters.supermarket) return false;
    if (filters.dietType && plan.dietType !== filters.dietType) return false;
    if (filters.calories && plan.calories !== Number(filters.calories)) return false;
    return true;
  });

  if (!candidates.length) return null;

  return [...candidates].sort((a, b) => (
    scorePlan(b, defaultCalories, filters) - scorePlan(a, defaultCalories, filters)
  ))[0];
}

function scorePlan(plan, defaultCalories, filters) {
  let score = 0;
  const calorieGap = Math.abs(plan.calories - Number(defaultCalories || plan.calories));
  score -= calorieGap / 10;
  if (plan.calories === Number(defaultCalories)) score += 80;
  if (plan.supermarket === 'any') score += filters.supermarket ? 0 : 8;
  if (plan.dietType === 'standard') score += filters.dietType ? 0 : 8;
  if (plan.effort === 'batch') score += 6;
  if (plan.effort === 'standard') score += 5;
  return score;
}

function marketLabel(value) {
  const market = SUPERMARKET_CHOICES.find(item => item.value === value);
  return market?.label || cap(value);
}

function cap(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
