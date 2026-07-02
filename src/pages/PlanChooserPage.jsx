import { Link, Navigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { getAllPlanMeta } from '../utils/planBuilder.js';
import {
  buildBrowsePlanUrl,
  getGoalChoice,
  SUPERMARKET_CHOICES,
} from '../data/planChooser.js';
import { chooseChooserVisual, chooseSupermarketVisual } from '../data/visualAssets.js';

const ALL_PLANS = getAllPlanMeta();

export default function PlanChooserPage() {
  const { goal } = useParams();
  const goalChoice = getGoalChoice(goal);

  if (!goalChoice) return <Navigate to="/browse" replace />;

  const options = SUPERMARKET_CHOICES
    .map(market => ({
      market,
      plan: chooseBestPlan(goalChoice.value, market.value, goalChoice.defaultCalories),
    }))
    .filter(option => option.plan);

  const canonical = `/choose-plan/${goalChoice.value}`;
  const title = `${goalChoice.label} Meal Plans by Supermarket`;
  const description = `Choose a generic UK supermarket, Aldi, Lidl, Tesco, Asda, Sainsbury's, Morrisons or Iceland ${goalChoice.label.toLowerCase()} meal plan.`;
  const chooserVisual = chooseChooserVisual({ goalChoice });

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: `https://www.mealprep.org.uk${canonical}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: options.map((option, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: `${option.market.label} ${goalChoice.label} meal plan`,
          url: `https://www.mealprep.org.uk/plans/${option.plan.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk/' },
        { '@type': 'ListItem', position: 2, name: 'Meal Plans', item: 'https://www.mealprep.org.uk/browse' },
        { '@type': 'ListItem', position: 3, name: title, item: `https://www.mealprep.org.uk${canonical}` },
      ],
    },
  ];

  return (
    <>
      <SEO
        title={`${title} | MealPrep.org.uk`}
        description={description}
        canonical={canonical}
        jsonLd={jsonLd}
      />

      <div className="content-page plan-chooser-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <Link to="/browse">Meal Plans</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">{goalChoice.label}</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />

        <header className="plan-chooser-hero">
          <span className="offer-kicker">Choose your supermarket</span>
          <h1>{title}</h1>
          <p>
            Pick where you usually shop, or choose Generic UK supermarket for an
            average-price version that is not tied to one store.
          </p>
          <div className="plan-chooser-default">
            <strong>Default calorie target:</strong>
            <span>{goalChoice.defaultCalories.toLocaleString('en-GB')} kcal/day</span>
            <Link to={buildBrowsePlanUrl({ goal: goalChoice.value })}>Change calories</Link>
          </div>
          <PageHeroVisual visual={chooserVisual} className="plan-chooser-visual" priority />
        </header>

        <section className="plan-chooser-grid" aria-label={`${goalChoice.label} supermarket choices`}>
          {options.map(({ market, plan }) => {
            const exactDefault = plan.calories === goalChoice.defaultCalories;
            const cardVisual = chooseSupermarketVisual(market.value);
            return (
              <article
                key={market.value}
                className={`plan-chooser-card${market.value === 'any' ? ' plan-chooser-card--generic' : ''}`}
              >
                <img
                  src={cardVisual.src}
                  alt=""
                  width={cardVisual.width}
                  height={cardVisual.height}
                  loading="lazy"
                  decoding="async"
                />
                <div className="plan-chooser-card-head">
                  <span className="plan-chooser-market">{market.label}</span>
                  <span className="plan-chooser-calories">
                    {exactDefault ? 'Default' : 'Closest'}: {plan.calories.toLocaleString('en-GB')} kcal
                  </span>
                </div>
                <h2>{plan.title}</h2>
                <p>{market.description}</p>
                <div className="plan-chooser-meta">
                  <span>{plan.priceEstimate}/week estimate</span>
                  <span>{plan.dietType === 'standard' ? 'Standard diet' : cap(plan.dietType)}</span>
                </div>
                <div className="plan-chooser-actions">
                  <Link className="btn-primary" to={`/plans/${plan.slug}`}>
                    View plan
                  </Link>
                  <Link
                    className="plan-chooser-change"
                    to={buildBrowsePlanUrl({ goal: goalChoice.value, supermarket: market.value })}
                  >
                    Change calories
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </>
  );
}

function chooseBestPlan(goal, supermarket, defaultCalories) {
  const candidates = ALL_PLANS.filter(plan => (
    plan.goal === goal && plan.supermarket === supermarket
  ));

  if (!candidates.length) return null;

  return [...candidates].sort((a, b) => (
    scorePlan(b, defaultCalories) - scorePlan(a, defaultCalories)
  ))[0];
}

function scorePlan(plan, defaultCalories) {
  let score = 0;
  const calorieGap = Math.abs(plan.calories - defaultCalories);
  score -= calorieGap / 10;
  if (plan.calories === defaultCalories) score += 80;
  if (plan.dietType === 'standard') score += 12;
  if (plan.effort === 'standard') score += 8;
  if (plan.effort === 'batch') score += 5;
  return score;
}

function cap(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
