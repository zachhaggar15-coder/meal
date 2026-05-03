import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import { mealPlansData } from '../data/mealPlans.js';

export default function MealPlanPage() {
  const { slug } = useParams();
  const data = mealPlansData[slug];

  if (!data) return <Navigate to="/" replace />;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.h1,
      description: data.description,
      datePublished: '2025-01-01',
      publisher: { '@type': 'Organization', name: 'MealPrep.org.uk' },
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
        jsonLd={jsonLd}
      />
      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span> <span>{data.h1}</span>
        </nav>

        <h1>{data.h1}</h1>

        <p className="content-intro">{data.intro}</p>

        <div className="cta-box">
          <strong>Want a personalised version?</strong> Use our free AI generator to build a plan tailored to your calorie target, preferred supermarket, and dietary needs.{' '}
          <Link to="/">Generate my plan →</Link>
        </div>

        <h2>Why Choose a {data.planLabel} Meal Plan?</h2>
        <p>{data.whyThisPlan}</p>

        <h2>Example 7-Day {data.planLabel} Meal Plan</h2>
        <p>Below is a sample week. Each day is planned to hit approximately {data.targetCalories} calories with a strong protein focus. Calorie and protein figures are estimates — weigh ingredients if you need precision. Use our <Link to="/">free generator</Link> to get a freshly personalised version.</p>

        <div className="example-plan">
          {data.plan.map((day, i) => (
            <div key={i} className="plan-day-card">
              <h3>{day.day}</h3>
              {day.meals.map((meal, j) => (
                <div key={j} className="plan-meal">
                  <div className="plan-meal-header">
                    <span className="meal-type">{meal.type}</span>
                    <span className="plan-meal-name">{meal.name}</span>
                    <span className="plan-meal-meta">{meal.kcal} kcal · {meal.protein}g protein · {meal.prep}</span>
                  </div>
                  <p className="plan-meal-desc">{meal.desc}</p>
                </div>
              ))}
              <div className="plan-day-total">
                Daily total: <strong>{day.totals.kcal} kcal</strong> · <strong>{day.totals.protein}g protein</strong>
              </div>
            </div>
          ))}
        </div>

        <h2>Sample Weekly Shopping List</h2>
        <p>Here is a sample shopping list to cover this 7-day plan. Estimated cost: <strong>{data.priceEstimate}</strong>.</p>
        <div className="shop-grid">
          {Object.entries(data.shoppingList).map(([group, items]) => (
            <div key={group} className="shop-group">
              <h4>{group.charAt(0).toUpperCase() + group.slice(1)}</h4>
              <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          ))}
        </div>

        <h2>Tips for Success</h2>
        <ul className="tips-list">
          {data.tips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>

        <div className="cta-box cta-box--large">
          <h2>Generate Your Free Personalised Plan</h2>
          <p>Our AI generator creates a personalised {data.planLabel} meal plan tailored to your preferred UK supermarket, dietary requirements, and cooking time. Free, no sign-up needed.</p>
          <Link to="/" className="btn-primary">Generate My {data.planLabel} Plan →</Link>
        </div>

        <p className="disclaimer">
          Meal plans are for general information only. Calories and protein are estimates. For medical conditions, pregnancy, eating disorders, or clinical dietary needs, speak to a qualified healthcare professional.
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

        <h2>Related Meal Plans</h2>
        <ul className="plan-links">
          {data.related.map(r => (
            <li key={r.slug}><Link to={`/meal-plan/${r.slug}`}>{r.label}</Link></li>
          ))}
          {data.blogLinks.map(b => (
            <li key={b.path}><Link to={b.path}>{b.label}</Link></li>
          ))}
        </ul>
      </div>
      <Footer />
    </>
  );
}
