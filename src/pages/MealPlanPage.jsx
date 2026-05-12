import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import GeneratorCTA from '../components/GeneratorCTA.jsx';
import StickerPromo from '../components/StickerPromo.jsx';
import MealPromptBox from '../components/MealPromptBox.jsx';
import { mealPlansData } from '../data/mealPlans.js';

export default function MealPlanPage() {
  const { slug } = useParams();
  const data = mealPlansData[slug];

  if (!data) return <Navigate to="/" replace />;

  const avgProtein = data.plan.length
    ? Math.round(data.plan.reduce((s, d) => s + d.totals.protein, 0) / data.plan.length)
    : null;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.h1,
      description: data.description,
      datePublished: '2025-01-01',
      dateModified: '2026-05-01',
      publisher: { '@type': 'Organization', name: 'MealPrep.org.uk' },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://www.mealprep.org.uk/meal-plan/${slug}`,
      },
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
  ];

  return (
    <>
      <SEO
        title={data.title}
        description={data.description}
        canonical={`/meal-plan/${slug}`}
        ogType="article"
        jsonLd={jsonLd}
      />
      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span>{' '}
          <Link to="/#popular-plans">Meal Plans</Link> <span aria-hidden>›</span>{' '}
          <span>{data.h1}</span>
        </nav>

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
              to={`/?from=${slug}&kcal=${data.targetCalories}`}
              data-event="generator_cta_click"
              data-source-page={slug}
            >
              Generate a personalised version in 30 seconds &rarr;
            </Link>
          </p>
        </div>

        <p className="content-intro">{data.intro}</p>

        {/* Primary CTA — above the fold on most screens */}
        <GeneratorCTA
          sourcePage={slug}
          calories={data.targetCalories}
          supermarket={data.summary?.supermarket}
        />

        <h2>Why Choose a {data.planLabel} Meal Plan?</h2>
        <p>{data.whyThisPlan}</p>

        <h2>Example 7-Day {data.planLabel} Meal Plan</h2>
        <p>
          Below is a sample week. Each day is planned to hit approximately{' '}
          <strong>{data.targetCalories.toLocaleString()} calories</strong> with a strong protein
          focus. Calorie and protein figures are estimates — weigh ingredients if you need
          precision. Use the{' '}
          <Link to={`/?from=${slug}`}>free generator</Link> to get a freshly personalised version.
        </p>

        <div className="example-plan">
          {data.plan.map((day, i) => (
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
                  <MealPromptBox meal={meal} />
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

        {/* Mid-page CTA — after the plan */}
        <GeneratorCTA sourcePage={slug} calories={data.targetCalories} compact />

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

        {/* Sticker promo — after shopping list, feels relevant here */}
        <StickerPromo />

        <h2>Tips for Success</h2>
        <ul className="tips-list">
          {data.tips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>

        <div className="cta-box cta-box--large">
          <h2>Generate Your Free Personalised Plan</h2>
          <p>
            Our AI generator creates a personalised {data.planLabel} meal plan tailored to your
            preferred UK supermarket, dietary requirements, and cooking time. Free, no sign-up needed.
          </p>
          <Link
            to={`/?from=${slug}&kcal=${data.targetCalories}`}
            className="btn-primary"
            data-event="generator_cta_click"
            data-source-page={slug}
          >
            Generate My {data.planLabel} Plan &rarr;
          </Link>
        </div>

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
          <li>
            <Link
              to={`/?from=${slug}`}
              data-event="generator_cta_click"
              data-source-page={slug}
            >
              Generate a personalised {data.planLabel} plan
            </Link>
          </li>
          <li>
            <Link to="/stickers" data-event="sticker_promo_click" data-source-page={slug}>
              Meal prep labels for your portions
            </Link>
          </li>
        </ul>
      </div>
      <Footer />
    </>
  );
}
