import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import NotFound from './NotFound.jsx';
import { getAllPlanMeta } from '../utils/planBuilder.js';
import { indefiniteArticleFor } from '../utils/indefiniteArticle.js';
import { recommendPlanForIntent } from '../utils/planRecommendation.js';
import { planCardTitle } from '../utils/planCardMeta.js';
import {
  buildBrowsePlanUrl,
  getCalorieChoice,
  getDietChoice,
  getIndexedSupermarketChoice,
  GOAL_CHOOSER_ITEMS,
  INDEXED_SUPERMARKET_CHOICES,
  SUPERMARKET_CHOICES,
} from '../data/planChooser.js';
import { chooseChooserVisual, chooseNavigationCardVisual, chooseSupermarketVisual } from '../data/visualAssets.js';
import { MEAL_PLAN_HUBS } from '../data/mealPlanHubs.js';
import { toTitleCase } from '../utils/textFormatting.js';

const ALL_PLANS = getAllPlanMeta();
const HUB_PATHS = new Set(Object.values(MEAL_PLAN_HUBS).map(hub => hub.path));

// A chooser page and its /meal-plans/ hub target the same intent (e.g.
// /choose-calories/1500 and /meal-plans/1500-calorie). To stop them splitting
// ranking signals, the chooser canonicalises to the hub where one exists. The
// page still works and stays in the funnel; Google is just told the hub is the
// primary version. Where no hub exists, the chooser stays self-canonical.
function resolveCanonical(selfPath, hubPath) {
  return hubPath && HUB_PATHS.has(hubPath) ? hubPath : selfPath;
}

export default function ChoiceLandingPage({ mode }) {
  const params = useParams();
  const config = getModeConfig(mode, params);

  if (!config?.choice) return <NotFound />;

  const resolvedCards = config.cards.map(card => ({
    ...card,
    plan: recommendPlanForIntent(ALL_PLANS, {
      ...card.filters,
      targetCalories: card.defaultCalories,
    }),
  }));
  const cards = resolvedCards.filter(card => card.plan);
  // Combinations with no plan are named rather than silently dropped, so a
  // reader can see why a goal is missing instead of assuming the page is broken.
  const unavailableCards = resolvedCards.filter(card => !card.plan);
  const chooserVisual = chooseChooserVisual({ mode, choice: config.choice });

  const selfUrl = config.selfUrl || config.canonical;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: config.title,
      description: config.description,
      url: `https://www.mealprep.org.uk${selfUrl}`,
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
        { '@type': 'ListItem', position: 3, name: config.title, item: `https://www.mealprep.org.uk${selfUrl}` },
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
          <span aria-current="page">{toTitleCase(config.shortTitle)}</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />

        <header className="plan-chooser-hero">
          <span className="offer-kicker">{toTitleCase(config.kicker)}</span>
          <h1>{toTitleCase(config.title)}</h1>
          <p>{config.intro}</p>
          <div className="plan-chooser-default">
            <strong>{config.defaultLabel}</strong>
            <span>{config.defaultValue}</span>
            <Link to={config.changeUrl}>Change filters</Link>
          </div>
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
                  <span className="plan-chooser-market">{toTitleCase(card.label)}</span>
                  <span className="plan-chooser-calories">
                    {card.plan.calories.toLocaleString('en-GB')} kcal
                  </span>
                </div>
                <h2>{toTitleCase(planCardTitle(card.plan.title))}</h2>
                <p>{card.description}</p>
                <div className="plan-chooser-meta">
                  <span>{toTitleCase(marketLabel(card.plan.supermarket))}</span>
                  <span>{card.plan.priceEstimate}/week estimate</span>
                  <span>{card.plan.dietType === 'standard' ? 'Standard diet' : cap(card.plan.dietType)}</span>
                </div>
                <div className="plan-chooser-actions">
                  <Link
                    className="btn-primary"
                    to={`/plans/${card.plan.slug}`}
                    data-event="plan_primary_cta_clicked"
                    data-source-page={`${mode}-${config.choice.value}`}
                    data-plan-slug={card.plan.slug}
                    data-supermarket={card.plan.supermarket}
                    data-goal={card.plan.goal}
                    data-calorie-target={card.plan.calories}
                    data-protein-target={card.plan.macrosGrams?.protein}
                    data-page-type="choice_landing"
                    data-cta-location="plan_card"
                  >
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

        <PageHeroVisual visual={chooserVisual} className="plan-chooser-visual plan-chooser-visual--after-grid" priority />

        {unavailableCards.length > 0 && (
          <section className="choice-index-note">
            <h2>{toTitleCase('Not available for this choice yet')}</h2>
            <p>
              We do not have a{' '}
              {formatChoiceList(unavailableCards.map(card => card.label.toLowerCase()))} plan for{' '}
              {config.defaultValue} yet. The plan browser can show the closest alternatives across
              other supermarkets.
            </p>
            <Link className="btn-secondary" to={config.changeUrl}>See the closest alternatives</Link>
          </section>
        )}

        <section className="choice-index-note">
          <h2>{toTitleCase('Want a different combination?')}</h2>
          <p>
            Use the full plan browser to combine supermarket, diet, calories, budget and effort
            without landing on a default Aldi or weight loss plan first.
          </p>
          <Link className="btn-secondary" to={config.changeUrl}>Browse matching plans</Link>
        </section>
      </div>
      <Footer />
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
  const choice = getIndexedSupermarketChoice(slug);
  if (!choice) return null;

  const title = `${choice.label} Meal Plans by Goal`;
  return {
    choice,
    title,
    shortTitle: choice.label,
    kicker: 'Choose your goal',
    selfUrl: `/choose-supermarket/${choice.value}`,
    canonical: resolveCanonical(`/choose-supermarket/${choice.value}`, `/meal-plans/${choice.value}`),
    description: `Choose ${indefiniteArticleFor(choice.label)} ${choice.label} meal plan by goal, calories and diet type, including weight loss, high protein and muscle gain options.`,
    intro: `${choice.description} Pick the goal first, then open the suggested plan or change calories before choosing.`,
    defaultLabel: 'Current supermarket:',
    defaultValue: choice.label,
    changeUrl: buildBrowsePlanUrl({ supermarket: choice.value }),
    gridLabel: `${choice.label} meal plan goals`,
    cards: GOAL_CHOOSER_ITEMS.map(goal => ({
      key: goal.value,
      label: goal.label,
      heading: `${choice.shortLabel || choice.label} ${goal.label} plan`,
      description: `Start with ${indefiniteArticleFor(goal.label)} ${goal.label.toLowerCase()} plan, then adjust calories if needed.`,
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
    selfUrl: `/choose-diet/${choice.value}`,
    canonical: resolveCanonical(`/choose-diet/${choice.value}`, `/meal-plans/${choice.value}`),
    description: `Choose ${indefiniteArticleFor(choice.label)} ${choice.label.toLowerCase()} meal plan by supermarket, with ${formatChoiceList(INDEXED_SUPERMARKET_CHOICES.map(market => market.label))}.`,
    intro: `${choice.description} Pick the supermarket next so the diet type no longer defaults to Aldi.`,
    defaultLabel: 'Current diet type:',
    defaultValue: choice.label,
    changeUrl: buildBrowsePlanUrl({ diet: choice.dietType, goal: choice.defaultGoal }),
    gridLabel: `${choice.label} supermarket choices`,
    cards: INDEXED_SUPERMARKET_CHOICES.map(market => ({
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
    selfUrl: `/choose-calories/${choice.value}`,
    canonical: resolveCanonical(`/choose-calories/${choice.value}`, `/meal-plans/${choice.value}-calorie`),
    description: `Choose ${indefiniteArticleFor(choice.label)} ${choice.label} UK meal plan by goal and supermarket, with printable PDFs, macros and shopping lists.`,
    intro: `${choice.description} Pick a goal first, then use More options if you want a different supermarket or diet type.`,
    defaultLabel: 'Current calorie target:',
    defaultValue: `${choice.calories.toLocaleString('en-GB')} kcal/day`,
    changeUrl: buildBrowsePlanUrl({ calories: choice.calories }),
    gridLabel: `${choice.label} meal plan goals`,
    cards: GOAL_CHOOSER_ITEMS.map(goal => ({
      key: goal.value,
      label: goal.label,
      heading: `${goal.label} plan`,
      description: `Find a ${goal.label.toLowerCase()} plan at this calorie target, then choose the store that fits your weekly shop.`,
      defaultCalories: choice.calories,
      filters: { calories: choice.calories, goal: goal.value },
      changeUrl: buildBrowsePlanUrl({ calories: choice.calories, goal: goal.value }),
      highlight: false,
    })),
  };
}

function marketLabel(value) {
  const market = SUPERMARKET_CHOICES.find(item => item.value === value);
  return market?.label || cap(value);
}

function formatChoiceList(values = []) {
  const labels = values.filter(Boolean);
  if (labels.length <= 1) return labels[0] || 'indexed UK supermarkets';
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

function cap(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
