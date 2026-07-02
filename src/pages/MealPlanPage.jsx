import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import FeedbackBox from '../components/FeedbackBox.jsx';
import GeneratorCTA from '../components/GeneratorCTA.jsx';
import StickerPromo from '../components/StickerPromo.jsx';
import MealPromptBox from '../components/MealPromptBox.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import ContextualLinks from '../components/ContextualLinks.jsx';
import { mealPlansData } from '../data/mealPlans.js';
import { generateMealPlanImageUrl } from '../utils/imageGenerator.js';
import { buildShoppingList, scaleIngredientsForPortion } from '../utils/planBuilder.js';
import { SITE_CONTACT_EMAIL } from '../constants/site.js';

function ContentTable({ headers, rows }) {
  return (
    <div className="content-table-wrap">
      <table className="content-table">
        <thead>
          <tr>
            {headers.map(header => <th key={header}>{header}</th>)}
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

  const [plan, setPlan] = useState(() => normalisePlanCalories(data?.plan ?? [], data?.targetCalories));
  const [shoppingCopyStatus, setShoppingCopyStatus] = useState('');

  useEffect(() => {
    setPlan(normalisePlanCalories(data?.plan ?? [], data?.targetCalories));
  }, [slug, data]);

  const shoppingList = useMemo(() => buildShoppingList(plan), [plan]);

  if (!data) return <Navigate to="/" replace />;

  function handleSwap(dayIdx, mealIdx, newMeal) {
    setPlan(prev => prev.map((day, di) => {
      if (di !== dayIdx) return day;
      const meals = day.meals.map((m, mi) => mi !== mealIdx ? m : normaliseSwappedMeal(m, newMeal));
      return {
        ...day,
        meals,
        totals: {
          kcal: meals.reduce((s, m) => s + (m.kcal || 0), 0),
          protein: meals.reduce((s, m) => s + (m.protein || 0), 0),
        },
      };
    }));
  }

  async function copyShoppingList() {
    try {
      await navigator.clipboard.writeText(formatLegacyShoppingList(data.h1, shoppingList));
      setShoppingCopyStatus('Copied');
      setTimeout(() => setShoppingCopyStatus(''), 1800);
    } catch {
      setShoppingCopyStatus('Copy failed');
      setTimeout(() => setShoppingCopyStatus(''), 2200);
    }
  }

  const avgProtein = plan.length
    ? Math.round(plan.reduce((s, d) => s + d.totals.protein, 0) / plan.length)
    : null;

  const ogImageUrl = generateMealPlanImageUrl(slug, data.title, data.targetCalories);
  const planFamily = getLegacyPlanFamily(slug, data);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.h1,
      description: data.description,
      datePublished: data.published || '2026-05-28',
      dateModified: data.modified || '2026-05-30',
      author: { '@type': 'Organization', name: 'MealPrep.org.uk', url: 'https://www.mealprep.org.uk/about', email: SITE_CONTACT_EMAIL },
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
    <section className="legacy-plan-primary">
      <h2>Example 7-Day {data.planLabel} Meal Plan</h2>
      <p>
        Below is a sample week. Each day is planned to hit approximately{' '}
        <strong>{data.targetCalories.toLocaleString()} calories</strong> with a strong protein
        focus. Calorie and protein figures are estimates; weigh ingredients if you need
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
                <MealPromptBox meal={meal} onSwap={newMeal => handleSwap(i, j, newMeal)} />
              </div>
            ))}
            <div className="plan-day-total">
              Daily total:{' '}
              <strong>{day.totals.kcal} kcal</strong> -{' '}
              <strong>{day.totals.protein}g protein</strong>
            </div>
          </div>
        ))}
      </div>

      {data.ctaPlacements?.afterPlan !== false && (
        <GeneratorCTA sourcePage={slug} calories={data.targetCalories} compact />
      )}
    </section>
  );

  const shoppingListSection = (
    <section className="legacy-shopping-primary">
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
            <h4>{group.charAt(0).toUpperCase() + group.slice(1)}</h4>
            <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>
        ))}
      </div>
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

        {examplePlanSection}
        {shoppingListSection}

        {/* Quick-stats summary card */}
        <div className="plan-summary-card">
          <h2>Plan at a glance</h2>
          <table className="plan-summary-table">
            <tbody>
              <tr>
                <th>Calories</th>
                <td>~{data.targetCalories.toLocaleString()}/day</td>
              </tr>
              {avgProtein && (
                <tr>
                  <th>Protein</th>
                  <td>~{avgProtein}g/day</td>
                </tr>
              )}
              <tr>
                <th>Weekly cost</th>
                <td>{data.priceEstimate}</td>
              </tr>
              {data.summary?.costPerDay && (
                <tr>
                  <th>Cost per day</th>
                  <td>{data.summary.costPerDay}</td>
                </tr>
              )}
              {data.summary?.costPerMeal && (
                <tr>
                  <th>Cost per meal</th>
                  <td>{data.summary.costPerMeal}</td>
                </tr>
              )}
              {data.summary?.costPerGramProtein && (
                <tr>
                  <th>Cost per g protein</th>
                  <td>{data.summary.costPerGramProtein}</td>
                </tr>
              )}
              {data.summary?.updated && (
                <tr>
                  <th>Updated</th>
                  <td>{data.summary.updated}</td>
                </tr>
              )}
              {data.summary?.supermarkets && (
                <tr>
                  <th>Supermarkets</th>
                  <td>{data.summary.supermarkets}</td>
                </tr>
              )}
              {data.summary?.bestFor && (
                <tr>
                  <th>Best for</th>
                  <td>{data.summary.bestFor}</td>
                </tr>
              )}
              {data.summary?.prepDifficulty && (
                <tr>
                  <th>Prep difficulty</th>
                  <td>{data.summary.prepDifficulty}</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="plan-summary-personalise">
            Not quite right?{' '}
            <Link
              to="/"
              data-event="generator_cta_click"
              data-source-page={slug}
              data-target-calories={data.targetCalories}
            >
              Generate a personalised version in 30 seconds &rarr;
            </Link>
          </p>
        </div>

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

        <ContextualLinks blocks={data.contextualLinks} />

        <LegacyPlanFamilyBox family={planFamily} />

        {data.tescoPricing && (
          <>
            <h2>{data.tescoPricing.heading}</h2>
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
            <h2>{data.budgetBreakdown.heading}</h2>
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

        {false && (
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
              <h4>{group.charAt(0).toUpperCase() + group.slice(1)}</h4>
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
            <h2>{data.methodology.heading}</h2>
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
              <Link to={`/meal-plan/${r.slug}`}>{r.label}</Link>
            </li>
          ))}
          {data.blogLinks.map(b => (
            <li key={b.path}>
              <Link to={b.path}>{b.label}</Link>
            </li>
          ))}
          {data.ctaPlacements?.relatedGenerator !== false && (
            <li>
              <Link
                to="/"
                data-event="generator_cta_click"
                data-source-page={slug}
              >
                Generate a personalised {data.planLabel} plan
              </Link>
            </li>
          )}
          <li>
            <Link to="/stickers" data-event="container_promo_click" data-source-page={slug}>
              Glass meal prep containers for your portions
            </Link>
          </li>
        </ul>

        <FeedbackBox />
      </div>
      <Footer />
    </>
  );
}

function LegacyPlanFamilyBox({ family }) {
  if (!family) return null;

  return (
    <aside className="legacy-plan-family" aria-labelledby="legacy-plan-family-heading">
      <div>
        <h2 id="legacy-plan-family-heading">Current plan family</h2>
        <p>
          This older exact-match page is now connected to the current hub and generated plan
          library so related calorie, supermarket and shopping-list pages are easier to find.
        </p>
      </div>
      <div className="legacy-plan-family-links">
        {family.links.map(link => (
          <Link key={link.to} to={link.to}>{link.label}</Link>
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

function normalisePlanCalories(plan, targetCalories) {
  if (!Array.isArray(plan) || !targetCalories) return [];

  return plan.map(day => {
    const meals = rebalanceLegacyMeals(day.meals || [], targetCalories);
    return {
      ...day,
      meals,
      totals: {
        kcal: meals.reduce((sum, meal) => sum + (meal.kcal || 0), 0),
        protein: meals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
      },
    };
  });
}

function rebalanceLegacyMeals(meals, targetCalories) {
  const baseTotal = meals.reduce((sum, meal) => sum + (meal.kcal || 0), 0);
  if (!baseTotal || !targetCalories) return meals.map(enrichLegacyMeal);

  const portionScale = targetCalories / baseTotal;
  const rawCalories = meals.map(meal => (meal.kcal || 0) * portionScale);
  const adjustedCalories = distributeRoundedTotal(rawCalories, targetCalories);

  return meals.map((meal, index) => {
    const ingredients = scaleIngredientsForPortion(
      normaliseLegacyIngredients(meal.ingredients, meal.portion_size, meal.name),
      portionScale,
    );

    return enrichLegacyMeal({
      ...meal,
      kcal: adjustedCalories[index],
      protein: Math.max(1, Math.round((meal.protein || 0) * portionScale)),
      desc: cleanLegacyCopy(meal.desc),
      ingredients,
      portion_size: ingredients.join(', '),
    });
  });
}

function normaliseSwappedMeal(currentMeal, newMeal = {}) {
  return enrichLegacyMeal({
    ...currentMeal,
    name: newMeal.name ?? currentMeal.name,
    kcal: toInteger(newMeal.calories ?? newMeal.kcal, currentMeal.kcal),
    protein: toInteger(newMeal.protein, currentMeal.protein),
    prep: newMeal.prep_time ?? newMeal.prep ?? currentMeal.prep,
    desc: newMeal.description ?? newMeal.desc ?? currentMeal.desc,
    portion_size: newMeal.portion_size ?? currentMeal.portion_size,
    ingredients: newMeal.ingredients ?? currentMeal.ingredients,
    recipe: newMeal.recipe ?? currentMeal.recipe,
  });
}

function enrichLegacyMeal(meal) {
  const ingredients = normaliseLegacyIngredients(meal.ingredients, meal.portion_size, meal.name);
  const mealWithIngredients = {
    ...meal,
    ingredients,
    portion_size: meal.portion_size || ingredients.join(', '),
  };

  return {
    ...mealWithIngredients,
    recipe: normaliseLegacyRecipe(meal.recipe) || buildLegacyRecipe(mealWithIngredients),
  };
}

function normaliseLegacyIngredients(value, portionSize, mealName) {
  if (Array.isArray(value)) {
    const ingredients = value.map(formatLegacyIngredient).filter(Boolean);
    if (ingredients.length) return ingredients;
  }

  if (typeof value === 'string') {
    const ingredients = value.split(',').map(formatLegacyIngredient).filter(Boolean);
    if (ingredients.length) return ingredients;
  }

  if (portionSize) {
    const ingredients = String(portionSize).split(',').map(formatLegacyIngredient).filter(Boolean);
    if (ingredients.length) return ingredients;
  }

  return mealName ? [mealName] : [];
}

function formatLegacyIngredient(ingredient) {
  if (typeof ingredient === 'object' && ingredient !== null) {
    const name = ingredient.item || ingredient.name || '';
    const amount = ingredient.amount ? ` ${ingredient.amount}` : '';
    return cleanLegacyIngredient(`${name}${amount}`);
  }
  return cleanLegacyIngredient(ingredient);
}

function cleanLegacyIngredient(ingredient) {
  return cleanLegacyCopy(ingredient);
}

function cleanLegacyCopy(value) {
  return String(value || '')
    .replace(/\.\s*Use about .*$/i, '')
    .replace(/\s*Use about .*?(?:\.|$)/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normaliseLegacyRecipe(recipe) {
  if (Array.isArray(recipe)) {
    const steps = recipe.map(cleanLegacyCopy).filter(Boolean);
    return steps.length ? steps.slice(0, 6) : null;
  }

  if (typeof recipe === 'string') {
    const steps = recipe
      .split(/\n+|(?:^|\s)\d+\.\s*/g)
      .map(cleanLegacyCopy)
      .filter(Boolean);
    return steps.length ? steps.slice(0, 6) : null;
  }

  return null;
}

function buildLegacyRecipe(meal) {
  const ingredients = meal.ingredients?.length ? meal.ingredients.join(', ') : meal.portion_size || meal.name;
  const name = String(meal.name || '').toLowerCase();
  const type = String(meal.type || '').toLowerCase();

  if (name.includes('smoothie')) {
    return [
      `Add the listed ingredients to a blender: ${ingredients}.`,
      'Blend until smooth, adding a splash of milk or water if needed.',
      'Serve chilled straight away.',
    ];
  }

  if (type.includes('breakfast') || name.includes('oats') || name.includes('yogurt')) {
    return [
      `Prepare the ingredients: ${ingredients}.`,
      'Combine the base ingredients in a bowl or container and stir well.',
      'Add toppings last, then eat straight away or chill until needed.',
    ];
  }

  if (name.includes('wrap') || name.includes('sandwich') || name.includes('toast') || name.includes('pitta')) {
    return [
      'Toast or warm the bread, wrap, pitta, or bagel if preferred.',
      `Prepare the filling ingredients: ${ingredients}.`,
      'Layer everything evenly, season to taste, and serve or wrap for later.',
    ];
  }

  if (name.includes('salad') || name.includes('bowl')) {
    return [
      `Wash, chop, and portion the ingredients: ${ingredients}.`,
      'Cook or warm any grains or protein, then let them cool slightly.',
      'Combine in a bowl and keep dressing separate until serving if meal prepping.',
    ];
  }

  if (name.includes('curry') || name.includes('chilli') || name.includes('stew') || name.includes('soup')) {
    return [
      `Prepare the ingredients: ${ingredients}.`,
      'Cook the protein, aromatics, and firmer vegetables in a pan for 5-8 minutes.',
      'Add the remaining ingredients and simmer until hot, thickened, and cooked through.',
    ];
  }

  if (name.includes('pasta') || name.includes('rice') || name.includes('noodle')) {
    return [
      'Cook the pasta, rice, or noodles according to the packet instructions.',
      `Prepare the remaining ingredients while it cooks: ${ingredients}.`,
      'Combine everything, heat through, season to taste, and portion if meal prepping.',
    ];
  }

  if (name.includes('egg') || name.includes('omelette') || name.includes('scramble')) {
    return [
      `Prepare the ingredients: ${ingredients}.`,
      'Cook the eggs in a non-stick pan over medium heat, stirring or folding gently.',
      'Serve with the listed sides or toppings.',
    ];
  }

  return [
    `Prepare the ingredients: ${ingredients}.`,
    'Cook the main protein or vegetables in a pan over medium heat until cooked through.',
    'Add the remaining ingredients, heat until piping hot, season to taste, and serve.',
  ];
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

function toInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function distributeRoundedTotal(values, targetTotal) {
  const floors = values.map(Math.floor);
  let remaining = targetTotal - floors.reduce((sum, value) => sum + value, 0);
  const order = values
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < Math.abs(remaining); i += 1) {
    const target = order[i % order.length]?.index ?? 0;
    floors[target] += remaining > 0 ? 1 : -1;
  }

  return floors;
}
