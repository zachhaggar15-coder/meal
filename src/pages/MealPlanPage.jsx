import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import GeneratorCTA from '../components/GeneratorCTA.jsx';
import StickerPromo from '../components/StickerPromo.jsx';
import MealPromptBox from '../components/MealPromptBox.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import ContextualLinks from '../components/ContextualLinks.jsx';
import { mealPlansData } from '../data/mealPlans.js';
import { generateMealPlanImageUrl } from '../utils/imageGenerator.js';

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

  const [plan, setPlan] = useState(data?.plan ?? []);

  if (!data) return <Navigate to="/" replace />;

  function handleSwap(dayIdx, mealIdx, newMeal) {
    setPlan(prev => prev.map((day, di) => {
      if (di !== dayIdx) return day;
      const meals = day.meals.map((m, mi) => mi !== mealIdx ? m : {
        ...m,
        name: newMeal.name ?? m.name,
        kcal: newMeal.calories ?? newMeal.kcal ?? m.kcal,
        protein: newMeal.protein ?? m.protein,
        desc: newMeal.description ?? newMeal.desc ?? m.desc,
      });
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

  const avgProtein = plan.length
    ? Math.round(plan.reduce((s, d) => s + d.totals.protein, 0) / plan.length)
    : null;

  const ogImageUrl = generateMealPlanImageUrl(slug, data.title, data.targetCalories);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.h1,
      description: data.description,
      datePublished: data.published || '2026-05-28',
      dateModified: data.modified || '2026-05-30',
      author: { '@type': 'Organization', name: 'MealPrep.org.uk', url: 'https://www.mealprep.org.uk' },
      publisher: { '@type': 'Organization', name: 'MealPrep.org.uk', url: 'https://www.mealprep.org.uk' },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://www.mealprep.org.uk/meal-plan/${slug}`,
      },
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

        <h2>Sample Weekly Shopping List</h2>
        <p>
          Here is a sample shopping list to cover this 7-day plan. Estimated cost:{' '}
          <strong>{data.priceEstimate}</strong>.
        </p>
        <div className="shop-grid">
          {Object.entries(data.shoppingList).map(([group, items]) => (
            <div key={group} className="shop-group">
              <h4>{group.charAt(0).toUpperCase() + group.slice(1)}</h4>
              <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          ))}
        </div>

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
      </div>
      <Footer />
    </>
  );
}
