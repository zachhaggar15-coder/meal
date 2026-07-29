import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import WaitlistSection from '../components/WaitlistSection.jsx';
import FeedbackBox from '../components/FeedbackBox.jsx';
import GeneratorCTA from '../components/GeneratorCTA.jsx';
import StickerPromo from '../components/StickerPromo.jsx';
import MealPromptBox from '../components/MealPromptBox.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import ContextualLinks from '../components/ContextualLinks.jsx';
import ContextualNextStep from '../components/ContextualNextStep.jsx';
import CostEstimateNote from '../components/CostEstimateNote.jsx';
import EmailPlanCapture from '../components/EmailPlanCapture.jsx';
import PlanSaveButton from '../components/PlanSaveButton.jsx';
import TickableShoppingList from '../components/TickableShoppingList.jsx';
import NotFound from './NotFound.jsx';
import { mealPlansData } from '../data/mealPlans.js';
import { generateMealPlanImageUrl } from '../utils/imageGenerator.js';
import { buildShoppingList } from '../utils/planBuilder.js';
import { buildCanonicalLegacyPlan, canonicaliseLegacyMeal } from '../utils/legacyPlanBuilder.js';
import { sumNutrition } from '../utils/nutrition.js';
import { AUTHOR_JSON_LD, SITE_AUTHOR_NAME, SITE_CONTACT_EMAIL } from '../constants/site.js';
import { toTitleCase } from '../utils/textFormatting.js';
import { track } from '../utils/analytics.js';
import {
  buildPlanReference,
  readPlanProgress,
  recordPlanView,
  writePlanProgress,
} from '../utils/planRetention.js';

const SHOW_LEGACY_EXAMPLE_PLAN = false;

function ContentTable({ headers, rows }) {
  return (
    <div className="content-table-wrap">
      <table className="content-table">
        <thead>
          <tr>
            {headers.map(header => <th key={header} scope="col">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MealPlanPage() {
  const { slug } = useParams();
  const data = mealPlansData[slug];

  const [plan, setPlan] = useState(() => buildCanonicalLegacyPlan(data?.plan ?? [], data?.targetCalories));
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [shoppingCopyStatus, setShoppingCopyStatus] = useState('');
  const [progressRoute, setProgressRoute] = useState('');

  useEffect(() => {
    setPlan(buildCanonicalLegacyPlan(data?.plan ?? [], data?.targetCalories));
    setActiveDayIdx(0);
  }, [slug, data]);

  const shoppingList = useMemo(() => buildShoppingList(plan), [plan]);
  const avgProtein = plan.length
    ? Math.round(plan.reduce((s, d) => s + d.totals.protein, 0) / plan.length)
    : null;
  const planRoute = data ? `/meal-plan/${slug}` : '';
  const planReference = useMemo(() => data ? buildPlanReference({
    route: `/meal-plan/${slug}`,
    slug,
    title: data.h1,
    supermarket: detectLegacySupermarket(slug, data)?.slug || 'any',
    goal: data.planLabel,
    calories: data.targetCalories,
    protein: avgProtein,
    priceEstimate: data.priceEstimate,
  }) : null, [avgProtein, data, slug]);
  const planAnalytics = useMemo(() => data ? ({
    plan_slug: slug,
    supermarket: detectLegacySupermarket(slug, data)?.slug || 'any',
    goal: data.planLabel,
    calorie_target: data.targetCalories,
    protein_target: avgProtein,
    page_type: 'legacy_plan',
  }) : null, [avgProtein, data, slug]);

  useEffect(() => {
    if (!planReference) return;
    const progress = readPlanProgress(planReference.route);
    if (progress?.activeDayIdx !== undefined) setActiveDayIdx(progress.activeDayIdx);
    setProgressRoute(planReference.route);

    const view = recordPlanView(planReference);
    if (view.isReturn) {
      track.planReopened({
        ...planAnalytics,
        visit_count: view.viewCount,
        cta_location: 'direct_or_internal_return',
      });
    }
  }, [planAnalytics, planReference]);

  useEffect(() => {
    if (!planRoute || progressRoute !== planRoute) return;
    writePlanProgress(planRoute, { activeDayIdx });
  }, [activeDayIdx, planRoute, progressRoute]);

  if (!data) return <NotFound />;

  function handleSwap(dayIdx, mealIdx, newMeal) {
    setPlan(prev => prev.map((day, di) => {
      if (di !== dayIdx) return day;
      const meals = day.meals.map((m, mi) => mi !== mealIdx ? m : normaliseSwappedMeal(m, newMeal));
      return {
        ...day,
        meals,
        totals: sumNutrition(meals),
      };
    }));
    track.mealEdited({
      plan_slug: slug,
      calorie_target: data.targetCalories,
      page_type: 'legacy_plan',
      cta_location: 'meal_swap',
      meal_name: newMeal?.name,
    });
  }

  async function copyShoppingList() {
    try {
      await navigator.clipboard.writeText(formatLegacyShoppingList(data.h1, shoppingList));
      setShoppingCopyStatus('Copied');
      track.shoppingListCopied({
        plan_slug: slug,
        calorie_target: data.targetCalories,
        page_type: 'legacy_plan',
        cta_location: 'shopping_list',
      });
      setTimeout(() => setShoppingCopyStatus(''), 1800);
    } catch {
      setShoppingCopyStatus('Copy failed');
      setTimeout(() => setShoppingCopyStatus(''), 2200);
    }
  }

  const ogImageUrl = generateMealPlanImageUrl(slug, data.title, data.targetCalories);
  const planFamily = getLegacyPlanFamily(slug, data);
  const activeDay = plan[activeDayIdx] || plan[0];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.h1,
      description: data.description,
      datePublished: data.published || '2026-05-28',
      dateModified: data.modified || '2026-05-30',
      author: AUTHOR_JSON_LD,
      publisher: { '@type': 'Organization', name: 'MealPrep.org.uk', url: 'https://www.mealprep.org.uk', email: SITE_CONTACT_EMAIL },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://www.mealprep.org.uk/meal-plan/${slug}`,
      },
      isPartOf: planFamily
        ? {
            '@type': 'CollectionPage',
            name: planFamily.hubLabel,
            url: `https://www.mealprep.org.uk${planFamily.hubPath}`,
          }
        : undefined,
      image: ogImageUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk' },
        { '@type': 'ListItem', position: 2, name: 'Meal Plans', item: 'https://www.mealprep.org.uk/#popular-plans' },
        { '@type': 'ListItem', position: 3, name: data.h1, item: `https://www.mealprep.org.uk/meal-plan/${slug}` },
      ],
    },
  ];

  const examplePlanSection = (
    <section id="meal-plan" className="legacy-plan-primary">
      <h2>Example 7-Day {data.planLabel} Meal Plan</h2>
      <p>
        Below is a sample week. Each day is planned to hit approximately{' '}
        <strong>{data.targetCalories.toLocaleString()} calories</strong> with a strong protein
        focus. Calorie and protein figures are estimates; weigh ingredients if you need
        precision. Use the{' '}
        <Link to="/quiz" data-event="plan_primary_cta_clicked" data-source-page={slug}>meal-plan finder</Link> to get a better-matched version.
      </p>

      {activeDay && (
        <>
          <div className="plan-day-tabs legacy-day-tabs" role="tablist" aria-label="Select day">
            {plan.map((day, i) => (
              <button
                key={day.day}
                role="tab"
                aria-selected={activeDayIdx === i}
                aria-controls={`legacy-day-panel-${i}`}
                className={`plan-day-tab ${activeDayIdx === i ? 'plan-day-tab--active' : ''}`}
                onClick={() => setActiveDayIdx(i)}
                type="button"
              >
                {day.day.slice(0, 3)}
              </button>
            ))}
          </div>

          <div
            id={`legacy-day-panel-${activeDayIdx}`}
            role="tabpanel"
            className="example-plan legacy-example-plan"
          >
            <div className="plan-day-card legacy-plan-day-card">
              <h3>{activeDay.day}</h3>
              {activeDay.meals.map((meal, j) => (
                <div key={j} className="plan-meal">
                  <div className="plan-meal-header">
                    <span className="meal-type">{meal.type}</span>
                    <span className="plan-meal-name">{meal.name}</span>
                    <span className="plan-meal-meta">
                      {meal.kcal} kcal - {meal.protein}g protein - {meal.prep}
                    </span>
                  </div>
                  <p className="plan-meal-desc">{meal.desc}</p>
                  {meal.portion_size && (
                    <p className="plan-meal-portion"><strong>Portions:</strong> {meal.portion_size}</p>
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
                  <MealPromptBox meal={meal} onSwap={newMeal => handleSwap(activeDayIdx, j, newMeal)} />
                </div>
              ))}
              <div className="plan-day-total">
                Daily total:{' '}
                <strong>{activeDay.totals.kcal} kcal</strong> -{' '}
                <strong>{activeDay.totals.protein}g protein</strong>
              </div>
            </div>
          </div>
        </>
      )}

      {data.ctaPlacements?.afterPlan !== false && (
        <GeneratorCTA sourcePage={slug} calories={data.targetCalories} compact />
      )}
    </section>
  );

  const shoppingListSection = (
    <section id="shopping-list" className="legacy-shopping-primary">
      <div className="plan-shopping-header">
        <h2>Sample Weekly Shopping List</h2>
        <button className="plan-copy-shopping-btn" onClick={copyShoppingList} type="button">
          {shoppingCopyStatus || 'Copy shopping list'}
        </button>
      </div>
      <p>
        Here is a sample shopping list to cover this 7-day plan. Estimated cost:{' '}
        <strong>{data.priceEstimate}</strong>.
      </p>
      <CostEstimateNote
        supermarket={data.summary?.supermarkets || detectLegacySupermarket(slug, data)?.label || 'the selected UK supermarket'}
        compact
      />
      <TickableShoppingList
        list={shoppingList}
        planRoute={planRoute}
        analyticsContext={planAnalytics}
        gridClassName="shop-grid"
        groupClassName="shop-group"
        groupLabel={group => group.charAt(0).toUpperCase() + group.slice(1)}
      />
      <EmailPlanCapture
        plan={{
          slug,
          supermarket: detectLegacySupermarket(slug, data)?.slug,
          goal: data.planLabel,
          calories: data.targetCalories,
          macrosGrams: { protein: avgProtein },
        }}
        sourcePage="legacy_plan"
        compact
      />
    </section>
  );

  return (
    <>
      <SEO
        title={data.title}
        description={data.description}
        canonical={`/meal-plan/${slug}`}
        ogType="article"
        ogImage={ogImageUrl}
        jsonLd={jsonLd}
      />
      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span>{' '}
          <Link to="/#popular-plans">Meal Plans</Link> <span aria-hidden>›</span>{' '}
          <span>{data.h1}</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />
        <h1>{data.h1}</h1>
        <p className="content-byline">
          Built and reviewed by <Link to="/about">{SITE_AUTHOR_NAME}</Link>. Last materially reviewed:{' '}
          {data.reviewed || data.modified || '17 June 2026'}.
        </p>

        <section className="legacy-plan-overview" aria-label="Plan overview">
          <div>
            <span>Calorie target</span>
            <strong>~{data.targetCalories.toLocaleString('en-GB')} kcal/day</strong>
          </div>
          <div>
            <span>Protein target</span>
            <strong>{avgProtein ? `~${avgProtein}g/day` : 'Estimated per meal'}</strong>
          </div>
          <div>
            <span>Weekly cost</span>
            <strong>{data.priceEstimate} estimate</strong>
          </div>
          <div>
            <span>Supermarket</span>
            <strong>{data.summary?.supermarkets || detectLegacySupermarket(slug, data)?.label || 'UK supermarkets'}</strong>
          </div>
        </section>

        <nav className="plan-action-bar" aria-label="Plan actions">
          <a href="#meal-plan" data-event="plan_primary_cta_clicked" data-source-page={slug} data-page-type="legacy_plan" data-cta-location="plan_action_bar">
            View meals
          </a>
          <a href="#shopping-list" data-event="shopping_list_opened" data-source-page={slug} data-page-type="legacy_plan" data-cta-location="plan_action_bar">
            Shopping list
          </a>
          <PlanSaveButton
            plan={planReference}
            analyticsContext={planAnalytics}
            className="plan-action-primary"
          />
          <button
            type="button"
            onClick={() => {
              track.planPrinted({
                plan_slug: slug,
                calorie_target: data.targetCalories,
                page_type: 'legacy_plan',
                cta_location: 'plan_action_bar',
              });
              window.print();
            }}
          >
            Print or save
          </button>
        </nav>

        {examplePlanSection}
        <ContextualNextStep
          eyebrow="Next step"
          title="Shop this plan without rebuilding the list"
          description="Open the grouped weekly list, or use the quiz if this calorie target or supermarket is not quite right."
          primary={{ to: '#shopping-list', label: 'Open the shopping list', event: 'shopping_list_opened' }}
          secondary={[
            { to: `/browse?calories=${data.targetCalories}`, label: `Compare ${data.targetCalories.toLocaleString('en-GB')} calorie plans` },
            { to: '/quiz', label: 'Find a better match' },
          ]}
          pageType={`legacy-plan-${slug}`}
          className="plan-continuation"
        />
        {shoppingListSection}

        {/* Quick-stats summary card */}
        <details className="plan-summary-card legacy-plan-summary-detail">
          <summary>More plan and cost details</summary>
          <h2>Plan at a glance</h2>
          <table className="plan-summary-table">
            <tbody>
              <tr>
                <th scope="row">Calories</th>
                <td>~{data.targetCalories.toLocaleString()}/day</td>
              </tr>
              {avgProtein && (
                <tr>
                  <th scope="row">Protein</th>
                  <td>~{avgProtein}g/day</td>
                </tr>
              )}
              <tr>
                <th scope="row">Weekly cost</th>
                <td>{data.priceEstimate}</td>
              </tr>
              {data.summary?.costPerDay && (
                <tr>
                  <th scope="row">Cost per day</th>
                  <td>{data.summary.costPerDay}</td>
                </tr>
              )}
              {data.summary?.costPerMeal && (
                <tr>
                  <th scope="row">Cost per meal</th>
                  <td>{data.summary.costPerMeal}</td>
                </tr>
              )}
              {data.summary?.costPerGramProtein && (
                <tr>
                  <th scope="row">Cost per g protein</th>
                  <td>{data.summary.costPerGramProtein}</td>
                </tr>
              )}
              {data.summary?.updated && (
                <tr>
                  <th scope="row">Updated</th>
                  <td>{data.summary.updated}</td>
                </tr>
              )}
              {data.summary?.supermarkets && (
                <tr>
                  <th scope="row">Supermarkets</th>
                  <td>{data.summary.supermarkets}</td>
                </tr>
              )}
              {data.summary?.bestFor && (
                <tr>
                  <th scope="row">Best for</th>
                  <td>{data.summary.bestFor}</td>
                </tr>
              )}
              {data.summary?.prepDifficulty && (
                <tr>
                  <th scope="row">Prep difficulty</th>
                  <td>{data.summary.prepDifficulty}</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="plan-summary-personalise">
            Not quite right?{' '}
            <Link
              to="/quiz"
              data-event="plan_primary_cta_clicked"
              data-source-page={slug}
              data-target-calories={data.targetCalories}
            >
              Generate a personalised version in 30 seconds &rarr;
            </Link>
          </p>
        </details>

        <p className="content-intro">{data.intro}</p>

        {data.ctaPlacements?.intro !== false && (
          <GeneratorCTA
            sourcePage={slug}
            calories={data.targetCalories}
            supermarket={data.summary?.supermarket}
          />
        )}

        <h2>Why Choose a {data.planLabel} Meal Plan?</h2>
        <p>{data.whyThisPlan}</p>

        {data.suitability && (
          <section className="plan-suitability" aria-label="Who this plan is for">
            <h2>Who This {data.planLabel} Meal Plan Is For</h2>
            {data.suitability.forWho?.length > 0 && (
              <>
                <h3>A good fit if you are</h3>
                <ul className="content-bullets">
                  {data.suitability.forWho.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </>
            )}
            {data.suitability.notForWho?.length > 0 && (
              <>
                <h3>Probably not the right plan if you are</h3>
                <ul className="content-bullets">
                  {data.suitability.notForWho.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </>
            )}
            {data.suitability.disclaimer && (
              <p className="plan-disclaimer"><strong>Important:</strong> {data.suitability.disclaimer}</p>
            )}
          </section>
        )}

        <ContextualLinks blocks={data.contextualLinks} />

        <LegacyPlanFamilyBox family={planFamily} />

        {data.tescoPricing && (
          <>
            <h2>{toTitleCase(data.tescoPricing.heading)}</h2>
            <p>{data.tescoPricing.intro}</p>
            <div className="metric-grid">
              {data.tescoPricing.metrics.map(metric => (
                <div key={metric.label} className="metric-card">
                  <span className="metric-label">{metric.label}</span>
                  <strong>{metric.value}</strong>
                  {metric.note && <span className="metric-note">{metric.note}</span>}
                </div>
              ))}
            </div>

            <h3>Cheapest Protein Sources at Tesco</h3>
            <ContentTable
              headers={['Tesco item', 'Estimated price', 'Protein supplied', 'Cost per g protein', 'Best use']}
              rows={data.tescoPricing.proteinSources.map(item => [
                item.item,
                item.price,
                item.protein,
                item.costPerGram,
                item.bestUse,
              ])}
            />

            <h3>Cheapest Low Calorie Foods at Tesco</h3>
            <ContentTable
              headers={['Tesco item', 'Estimated price', 'Calories', 'Why it helps']}
              rows={data.tescoPricing.lowCalorieFoods.map(item => [
                item.item,
                item.price,
                item.calories,
                item.why,
              ])}
            />

            <h3>Clubcard and Tesco Saving Opportunities</h3>
            <ul className="content-bullets">
              {data.tescoPricing.clubcard.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </>
        )}

        {data.budgetBreakdown && (
          <>
            <h2>{toTitleCase(data.budgetBreakdown.heading)}</h2>
            <p>{data.budgetBreakdown.intro}</p>
            <ContentTable
              headers={['Item', 'Quantity', 'Estimated Tesco price', 'Number of meals supplied']}
              rows={data.budgetBreakdown.rows.map(row => [
                row.item,
                row.quantity,
                row.price,
                row.meals,
              ])}
            />
            {data.budgetBreakdown.note && (
              <p className="method-note">{data.budgetBreakdown.note}</p>
            )}
          </>
        )}

        {SHOW_LEGACY_EXAMPLE_PLAN && (
          <>
        <h2>Example 7-Day {data.planLabel} Meal Plan</h2>
        <p>
          Below is a sample week. Each day is planned to hit approximately{' '}
          <strong>{data.targetCalories.toLocaleString()} calories</strong> with a strong protein
          focus. Calorie and protein figures are estimates — weigh ingredients if you need
          precision. Use the{' '}
          <Link to="/" data-event="generator_cta_click" data-source-page={slug}>free generator</Link> to get a freshly personalised version.
        </p>

        <div className="example-plan">
          {plan.map((day, i) => (
            <div key={i} className="plan-day-card">
              <h3>{day.day}</h3>
              {day.meals.map((meal, j) => (
                <div key={j} className="plan-meal">
                  <div className="plan-meal-header">
                    <span className="meal-type">{meal.type}</span>
                    <span className="plan-meal-name">{meal.name}</span>
                    <span className="plan-meal-meta">
                      {meal.kcal} kcal &middot; {meal.protein}g protein &middot; {meal.prep}
                    </span>
                  </div>
                  <p className="plan-meal-desc">{meal.desc}</p>
                  {meal.portion_size && (
                    <p className="plan-meal-portion"><strong>Portions:</strong> {meal.portion_size}</p>
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
                  <MealPromptBox meal={meal} onSwap={newMeal => handleSwap(i, j, newMeal)} />
                </div>
              ))}
              <div className="plan-day-total">
                Daily total:{' '}
                <strong>{day.totals.kcal} kcal</strong> &middot;{' '}
                <strong>{day.totals.protein}g protein</strong>
              </div>
            </div>
          ))}
        </div>

        {data.ctaPlacements?.afterPlan !== false && (
          <GeneratorCTA sourcePage={slug} calories={data.targetCalories} compact />
        )}

        <div className="plan-shopping-header">
          <h2>Sample Weekly Shopping List</h2>
          <button className="plan-copy-shopping-btn" onClick={copyShoppingList} type="button">
            {shoppingCopyStatus || 'Copy shopping list'}
          </button>
        </div>
        <p>
          Here is a sample shopping list to cover this 7-day plan. Estimated cost:{' '}
          <strong>{data.priceEstimate}</strong>.
        </p>
        <div className="shop-grid">
          {Object.entries(shoppingList).filter(([, items]) => items.length > 0).map(([group, items]) => (
            <div key={group} className="shop-group">
              <h3>{group.charAt(0).toUpperCase() + group.slice(1)}</h3>
              <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          ))}
        </div>
          </>
        )}

        {data.tescoSubstitutions && (
          <>
            <h2>Tesco Ingredient Substitutions</h2>
            <p>{data.tescoSubstitutions.intro}</p>
            <ContentTable
              headers={['Major ingredient', 'Cheaper Tesco substitute', 'Higher protein substitute', 'Vegetarian substitute']}
              rows={data.tescoSubstitutions.rows.map(row => [
                row.ingredient,
                row.cheaper,
                row.higherProtein,
                row.vegetarian,
              ])}
            />
          </>
        )}

        {data.tescoConvenience && (
          <>
            <h2>Tesco Convenience Picks for Weight Loss</h2>
            <p>{data.tescoConvenience.intro}</p>
            <ContentTable
              headers={['Need', 'Best Tesco option', 'Calories/protein', 'Why it works']}
              rows={data.tescoConvenience.rows.map(row => [
                row.need,
                row.option,
                row.nutrition,
                row.why,
              ])}
            />
          </>
        )}

        {data.supermarketComparison && (
          <>
            <h2>Tesco vs Aldi vs Asda for Low Calorie Meal Prep</h2>
            <p>{data.supermarketComparison.intro}</p>
            <ContentTable
              headers={['Supermarket', 'Best for', 'Strength', 'Watch-out']}
              rows={data.supermarketComparison.rows.map(row => [
                row.supermarket,
                row.bestFor,
                row.strength,
                row.watchOut,
              ])}
            />
          </>
        )}

        {data.methodology && (
          <>
            <h2>{toTitleCase(data.methodology.heading)}</h2>
            <ul className="content-bullets">
              {data.methodology.points.map((point, i) => <li key={i}>{point}</li>)}
            </ul>
          </>
        )}

        {/* Sticker promo — after shopping list, feels relevant here */}
        <StickerPromo sourcePage={`${slug}-shopping-list`} />

        <h2>Tips for Success</h2>
        <ul className="tips-list">
          {data.tips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>

        {data.ctaPlacements?.final !== false && (
          <div className="cta-box cta-box--large">
            <h2>Generate Your Free Personalised Plan</h2>
            <p>
              Our AI generator creates a personalised {data.planLabel} meal plan tailored to your
              preferred UK supermarket, dietary requirements, and cooking time. Free, no sign-up needed.
            </p>
            <Link
              to="/"
              className="btn-primary"
              data-event="generator_cta_click"
              data-source-page={slug}
              data-target-calories={data.targetCalories}
            >
              Generate My {data.planLabel} Plan &rarr;
            </Link>
          </div>
        )}

        <p className="disclaimer">
          Meal plans are for general information only. Calories and protein are estimates. For
          medical conditions, pregnancy, eating disorders, or clinical dietary needs, speak to a
          qualified healthcare professional.
        </p>

        <h2>Frequently Asked Questions</h2>
        <div className="faq">
          {data.faq.map((item, i) => (
            <div key={i} className="faq-item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>

        <h2>Related Meal Plans &amp; Guides</h2>
        <ul className="plan-links">
          {data.related.map(r => (
            <li key={r.slug}>
              <Link to={`/meal-plan/${r.slug}`}>{toTitleCase(r.label)}</Link>
            </li>
          ))}
          {data.blogLinks.map(b => (
            <li key={b.path}>
              <Link to={b.path}>{toTitleCase(b.label)}</Link>
            </li>
          ))}
          {data.ctaPlacements?.relatedGenerator !== false && (
            <li>
              <Link
                to="/"
                data-event="generator_cta_click"
                data-source-page={slug}
              >
                Generate A Personalised {toTitleCase(data.planLabel)} Plan
              </Link>
            </li>
          )}
          <li>
            <Link to="/glass-meal-prep-containers" data-event="container_promo_click" data-source-page={slug}>
              Glass Meal Prep Containers For Your Portions
            </Link>
          </li>
        </ul>

        <FeedbackBox />
      </div>
      <WaitlistSection sourcePage="meal-plan" compact />
      <Footer />
    </>
  );
}

function LegacyPlanFamilyBox({ family }) {
  if (!family) return null;

  return (
    <aside className="legacy-plan-family" aria-labelledby="legacy-plan-family-heading">
      <div>
        <h2 id="legacy-plan-family-heading">{toTitleCase('Current plan family')}</h2>
        <p>
          Looking for a different version? Compare related calorie, supermarket and
          shopping-list pages below.
        </p>
      </div>
      <div className="legacy-plan-family-links">
        {family.links.map(link => (
          <Link key={`${link.to}-${link.label}`} to={link.to}>{toTitleCase(link.label)}</Link>
        ))}
      </div>
    </aside>
  );
}

function getLegacyPlanFamily(slug, data) {
  if (!data?.targetCalories) return null;

  const calorieHub = `/meal-plans/${data.targetCalories}-calorie`;
  const supermarket = detectLegacySupermarket(slug, data);
  const generatedEquivalent = LEGACY_GENERATED_EQUIVALENTS[slug];
  const links = [
    { to: calorieHub, label: `${data.targetCalories.toLocaleString('en-GB')} calorie plan hub` },
    generatedEquivalent,
    supermarket ? { to: `/meal-plans/${supermarket.slug}`, label: `${supermarket.label} meal plans` } : null,
    { to: '/meal-plans/meal-plans-with-shopping-list', label: 'Plans with shopping lists' },
  ].filter(Boolean);

  return {
    hubPath: calorieHub,
    hubLabel: `${data.targetCalories.toLocaleString('en-GB')} calorie meal plans`,
    links,
  };
}

const LEGACY_GENERATED_EQUIVALENTS = {
  '1500-calorie-meal-plan': { to: '/meal-plans/1500-calorie', label: 'Printable 1500 calorie plans' },
  '1800-calorie-meal-plan': { to: '/meal-plans/1800-calorie', label: 'Printable 1800 calorie plans' },
  '2000-calorie-meal-plan': { to: '/meal-plans/2000-calorie', label: 'Printable 2000 calorie plans' },
  'aldi-low-calorie-meal-plan': { to: '/plans/aldi-weight-loss-1500', label: 'Current Aldi 1500 calorie plan' },
  'tesco-low-calorie-meal-plan': { to: '/plans/tesco-weight-loss-1500', label: 'Current Tesco 1500 calorie plan' },
  'asda-1500-calorie-meal-plan': { to: '/plans/asda-weight-loss-1500', label: 'Current Asda 1500 calorie plan' },
  'sainsburys-low-calorie-meal-plan': { to: '/plans/sainsburys-weight-loss-1500', label: "Current Sainsbury's 1500 calorie plan" },
  'morrisons-low-calorie-meal-plan': { to: '/plans/morrisons-weight-loss-1500', label: 'Current Morrisons 1500 calorie plan' },
  'iceland-budget-meal-plan': { to: '/plans/iceland-budget-fat-loss-1500', label: 'Current Iceland budget fat-loss plan' },
};

function detectLegacySupermarket(slug, data) {
  const text = `${slug} ${data.summary?.supermarkets || ''} ${data.title || ''}`.toLowerCase();
  const supermarkets = [
    ['aldi', 'Aldi'],
    ['lidl', 'Lidl'],
    ['tesco', 'Tesco'],
    ['asda', 'Asda'],
    ['sainsburys', "Sainsbury's"],
    ['sainsbury', "Sainsbury's"],
    ['morrisons', 'Morrisons'],
    ['iceland', 'Iceland'],
  ];
  const match = supermarkets.find(([key]) => text.includes(key));
  return match ? { slug: match[0] === 'sainsbury' ? 'sainsburys' : match[0], label: match[1] } : null;
}

function normaliseSwappedMeal(currentMeal, newMeal = {}) {
  return canonicaliseLegacyMeal({
    ...currentMeal,
    name: newMeal.name ?? currentMeal.name,
    prep: newMeal.prep_time ?? newMeal.prep ?? currentMeal.prep,
    desc: newMeal.description ?? newMeal.desc ?? currentMeal.desc,
    portion_size: newMeal.portion_size ?? currentMeal.portion_size,
    ingredients: newMeal.ingredients ?? currentMeal.ingredients,
    recipe: newMeal.recipe ?? currentMeal.recipe,
  });
}

function formatLegacyShoppingList(title, shoppingList) {
  const groups = Object.entries(shoppingList || {})
    .filter(([, items]) => items?.length)
    .map(([group, items]) => [
      formatShoppingGroup(group),
      ...items.map(item => `- ${item}`),
    ].join('\n'));

  return `${title || 'Meal plan'} shopping list\n\n${groups.join('\n\n')}`;
}

function formatShoppingGroup(group) {
  return {
    protein: 'Protein',
    carbs: 'Carbs & Grains',
    vegetables: 'Vegetables',
    dairy: 'Dairy & Eggs',
    extras: 'Extras & Condiments',
  }[group] || group;
}
