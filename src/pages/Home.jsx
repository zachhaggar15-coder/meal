import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MealForm from '../components/MealForm.jsx';
import MealPlan from '../components/MealPlan.jsx';
import ShoppingList from '../components/ShoppingList.jsx';
import EditPlanBox from '../components/EditPlanBox.jsx';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';

const homeJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'UK Low-Calorie Meal Plan Generator',
    url: 'https://www.mealprep.org.uk/',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
    description:
      "Free AI-powered meal plan generator for UK users. Creates personalised low-calorie, high-protein weekly meal plans tailored to Tesco, Aldi, Sainsbury's or Asda.",
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Generate a UK Low-Calorie Meal Plan',
    description:
      'Use the free AI-powered meal plan generator to create a personalised weekly meal plan in under 30 seconds.',
    tool: [{ '@type': 'HowToTool', name: 'UK Low-Calorie Meal Plan Generator' }],
    step: [
      {
        '@type': 'HowToStep',
        position: '1',
        name: 'Set your plan length',
        text: 'Choose a 1-day, 3-day, or 7-day meal plan.',
      },
      {
        '@type': 'HowToStep',
        position: '2',
        name: 'Enter your daily calorie target',
        text: 'A common starting point for weight loss is 1,500–1,800 calories per day.',
      },
      {
        '@type': 'HowToStep',
        position: '3',
        name: 'Choose meals per day and dietary preference',
        text: 'Select 3, 4, or 5 meals and choose standard, vegetarian, or vegan.',
      },
      {
        '@type': 'HowToStep',
        position: '4',
        name: 'Pick your UK supermarket',
        text: "Choose from Tesco, Aldi, Sainsbury's, or Asda.",
      },
      {
        '@type': 'HowToStep',
        position: '5',
        name: 'Click Generate Plan',
        text: 'Your personalised meal plan with a full shopping list appears in under 30 seconds.',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How many calories should I eat to lose weight?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most adults lose weight on 1,500–1,800 calories per day, depending on their size and activity level. A deficit of 500 calories below your Total Daily Energy Expenditure (TDEE) leads to roughly 0.5 kg of fat loss per week.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which UK supermarkets does the generator support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "The generator supports Tesco, Aldi, Sainsbury's and Asda. Meal plans are tailored to use ingredients readily available at your chosen store.",
        },
      },
      {
        '@type': 'Question',
        name: 'Is the meal plan generator free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, it is completely free to use with no sign-up required.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to generate a meal plan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The AI generates your personalised meal plan in 10–30 seconds.',
        },
      },
    ],
  },
];

const LOADING_MESSAGES = [
  'Analysing your preferences…',
  'Building your meal schedule…',
  'Calculating calories and protein…',
  'Selecting recipes from your supermarket…',
  'Compiling your shopping list…',
  'Asking the AI very nicely…',
  'Convincing the AI that broccoli is delicious…',
  'Hiding the chocolate from your plan…',
  'Negotiating with the algorithm…',
  'Pretending kale is exciting…',
  'Cross-referencing with 47 nutritional databases…',
  'Removing the fourth cheese option…',
  'Making sure there\'s enough protein…',
  'Adding a cheeky treat then removing it again…',
  'Almost there…',
];

const PLAN_CARDS = [
  {
    slug: '1500-calorie-meal-plan',
    title: '1500 Calorie Meal Plan',
    desc: 'Moderate deficit — ideal for smaller frames or lower activity levels.',
  },
  {
    slug: '1800-calorie-meal-plan',
    title: '1800 Calorie Meal Plan',
    desc: 'Popular for women aiming to lose 0.5 kg/week on satisfying meals.',
  },
  {
    slug: '2000-calorie-meal-plan',
    title: '2000 Calorie Meal Plan',
    desc: 'Suited to active individuals or those wanting a gentle deficit.',
  },
  {
    slug: 'high-protein-low-calorie-meal-plan',
    title: 'High Protein Plan',
    desc: 'Maximises protein to retain muscle mass while losing fat.',
  },
  {
    slug: 'tesco-low-calorie-meal-plan',
    title: 'Tesco Meal Plan',
    desc: 'Budget-friendly Tesco ingredients — typically under £35/week.',
  },
  {
    slug: 'vegetarian-low-calorie-meal-plan',
    title: 'Vegetarian Plan',
    desc: 'Plant-based and protein-rich using legumes, eggs, and dairy.',
  },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [lastValues, setLastValues] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const progressRef = useRef(0);
  const progressInterval = useRef(null);
  const msgInterval = useRef(null);

  useEffect(() => {
    if (loading) {
      progressRef.current = 0;
      setProgress(0);
      setMsgIndex(0);

      progressInterval.current = setInterval(() => {
        const next = progressRef.current + (90 - progressRef.current) * 0.045;
        progressRef.current = next;
        setProgress(next);
      }, 300);

      msgInterval.current = setInterval(() => {
        setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
      }, 2800);
    } else {
      clearInterval(progressInterval.current);
      clearInterval(msgInterval.current);
      if (progressRef.current > 0) {
        setProgress(100);
        setTimeout(() => {
          setProgress(0);
          progressRef.current = 0;
        }, 500);
      }
    }
    return () => {
      clearInterval(progressInterval.current);
      clearInterval(msgInterval.current);
    };
  }, [loading]);

  async function handleEdit(instruction) {
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, instruction }),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || `Server error (${res.status}).`);
      }
      const updated = await res.json();
      setPlan(updated);
    } catch (err) {
      console.error(err);
      setEditError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleGenerate(values) {
    setLoading(true);
    setError(null);
    setPlan(null);
    setLastValues(values);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || `Server error (${res.status}).`);
      }

      const data = await res.json();
      setPlan(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO
        title="Free Low-Calorie Meal Plan Generator UK | AI-Powered Weekly Planner"
        description="Generate a personalised low-calorie meal plan in seconds. UK-focused, tailored to Tesco, Aldi, Sainsbury's or Asda. Free 7-day high protein meal plan generator."
        canonical="/"
        jsonLd={homeJsonLd}
      />

      <div className="page">
        <header className="header">
          <h1>Free Low-Calorie Meal Plan Generator — UK Edition</h1>
          <p>Enter your details and get a personalised, high-protein meal plan in under 30 seconds.</p>
          <div className="trust-row">
            <span className="trust-badge">UK supermarket focused</span>
            <span className="trust-badge">High-protein by default</span>
            <span className="trust-badge">Shopping list included</span>
            <span className="trust-badge">No sign-up required</span>
          </div>
        </header>

        <div className="form-preview-layout">
          <section className="card form-col">
            <MealForm onSubmit={handleGenerate} disabled={loading} />
          </section>
          <aside className="preview-col">
            <div className="preview-card">
              <div className="preview-header">
                <span className="preview-tag">Example output</span>
                <span className="preview-title">Sample 1,800 kcal day</span>
              </div>
              <div className="preview-meals">
                <div className="preview-meal">
                  <span className="preview-meal-type">Breakfast</span>
                  <span className="preview-meal-name">Greek Yogurt Oat Bowl with Berries</span>
                  <span className="preview-meal-meta">380 kcal &middot; 24g protein &middot; 8 min</span>
                </div>
                <div className="preview-meal">
                  <span className="preview-meal-type">Lunch</span>
                  <span className="preview-meal-name">Chicken, Rice &amp; Roasted Veg Bowl</span>
                  <span className="preview-meal-meta">520 kcal &middot; 42g protein &middot; 20 min</span>
                </div>
                <div className="preview-meal">
                  <span className="preview-meal-type">Dinner</span>
                  <span className="preview-meal-name">Grilled Salmon, Sweet Potato &amp; Broccoli</span>
                  <span className="preview-meal-meta">580 kcal &middot; 38g protein &middot; 25 min</span>
                </div>
                <div className="preview-meal">
                  <span className="preview-meal-type">Snack</span>
                  <span className="preview-meal-name">Apple &amp; Peanut Butter</span>
                  <span className="preview-meal-meta">280 kcal &middot; 8g protein &middot; 2 min</span>
                </div>
              </div>
              <div className="preview-total">~1,760 kcal &nbsp;&middot;&nbsp; ~112g protein</div>
            </div>
          </aside>
        </div>

        {(loading || progress > 0) && (
          <div className="loading">
            <div className="loading-message">{LOADING_MESSAGES[msgIndex]}</div>
            <div className="loading-bar-track">
              <div
                className="loading-bar-fill"
                style={{ width: `${progress}%`, transition: progress === 100 ? 'width 0.2s ease-in' : 'width 0.3s ease-out' }}
              />
            </div>
            <p className="loading-sub">This usually takes 10–30 seconds.</p>
          </div>
        )}

        {error && (
          <div className="error">
            <strong>We couldn&apos;t generate your plan.</strong>
            <p style={{ margin: '6px 0 0' }}>{error}</p>
            {lastValues && (
              <button onClick={() => handleGenerate(lastValues)}>Try again</button>
            )}
          </div>
        )}

        {plan?.weekly_plan && (
          <EditPlanBox
            onEdit={handleEdit}
            loading={editLoading}
            error={editError}
          />
        )}

        {plan?.weekly_plan && <MealPlan weeklyPlan={plan.weekly_plan} />}
        {plan?.shopping_list && lastValues?.shoppingList && (
          <ShoppingList list={plan.shopping_list} price={plan.price_estimate} />
        )}

        {/* ── SEO Content ── */}
        <section className="seo-content">

          <div className="seo-section">
            <h2>What is a Low-Calorie Meal Plan Generator?</h2>
            <p>
              A low-calorie meal plan generator takes your personal preferences — daily calorie target, dietary requirements,
              preferred supermarket, and foods you love or want to avoid — and produces a complete weekly meal plan in seconds.
              Our UK meal plan generator is powered by AI and designed specifically for shoppers at Tesco, Aldi,
              Sainsbury&apos;s, and Asda, so every ingredient on your plan is easy to find and affordable.
            </p>
            <p>
              Unlike generic calorie calculators, our tool creates a structured day-by-day plan with named meals,
              calorie counts, protein targets, and prep times. It also generates a categorised shopping list with an
              estimated weekly cost in GBP, making it easier than ever to stick to a budget while eating healthily.
            </p>
          </div>

          <div className="seo-section">
            <h2>How to Use This UK Meal Plan Generator</h2>
            <p>Getting started takes less than a minute:</p>
            <ol>
              <li><strong>Set your plan length.</strong> Choose a 1-day, 3-day, or 7-day plan.</li>
              <li><strong>Enter your daily calorie target.</strong> Not sure? A common starting point for weight loss is 1,500–1,800 calories. Use our <Link to="/blog/how-to-build-a-calorie-deficit">calorie deficit guide</Link> to calculate yours.</li>
              <li><strong>Choose your meals per day</strong> and dietary preference — standard, vegetarian, or vegan.</li>
              <li><strong>Use Advanced options</strong> to pick your supermarket, max cooking time, and any foods to include or avoid.</li>
              <li>Click <em>Generate Plan</em> — your personalised meal plan and shopping list appear in under 30 seconds.</li>
            </ol>
          </div>

          <div className="seo-section">
            <h2>Why Choose a Calorie-Controlled Meal Plan?</h2>
            <p>
              Research consistently shows that meal planning is one of the most effective strategies for sustained weight loss.
              A 2017 study published in the <em>International Journal of Behavioral Nutrition and Physical Activity</em> found
              that meal planners had significantly higher diet quality and were less likely to be overweight.
            </p>
            <p>
              Calorie control remains the most reliable way to lose body fat. By targeting 300–500 calories below your
              Total Daily Energy Expenditure, you create the deficit needed for steady fat loss of around 0.5 kg per week.
              Our generator keeps every day within ±100 kcal of your target and ensures you get enough protein to preserve
              muscle while you lose fat.
            </p>
            <p>
              High protein intake is especially important during weight loss — it is the most satiating macronutrient,
              keeping you fuller for longer. Our plans prioritise lean protein sources: chicken breast, eggs, Greek yogurt,
              tuna, and tofu.
            </p>
          </div>

          <div className="seo-section seo-example">
            <h2>Example 1800 Calorie Meal Plan UK</h2>
            <p>Here is a typical day from an AI-generated 1,800 kcal plan using Tesco ingredients:</p>
            <div className="plan-day-card">
              <h3>Sample Day — 1,800 kcal target</h3>
              <div className="plan-meal">
                <div className="plan-meal-header">
                  <span className="meal-type">Breakfast</span>
                  <span className="plan-meal-name">Greek Yogurt Oat Bowl with Berries</span>
                  <span className="plan-meal-meta">380 kcal &middot; 24g protein &middot; 8 min</span>
                </div>
                <p className="plan-meal-desc">Rolled oats, Tesco Greek yogurt, frozen mixed berries, drizzle of honey — filling, high-protein, and ready in under 10 minutes.</p>
              </div>
              <div className="plan-meal">
                <div className="plan-meal-header">
                  <span className="meal-type">Lunch</span>
                  <span className="plan-meal-name">Chicken, Rice &amp; Roasted Veg Bowl</span>
                  <span className="plan-meal-meta">520 kcal &middot; 42g protein &middot; 20 min</span>
                </div>
                <p className="plan-meal-desc">Grilled chicken breast over brown rice with oven-roasted courgette, pepper, and onion. Simple and macro-balanced.</p>
              </div>
              <div className="plan-meal">
                <div className="plan-meal-header">
                  <span className="meal-type">Dinner</span>
                  <span className="plan-meal-name">Grilled Salmon, Sweet Potato &amp; Broccoli</span>
                  <span className="plan-meal-meta">580 kcal &middot; 38g protein &middot; 25 min</span>
                </div>
                <p className="plan-meal-desc">Salmon fillet with roasted sweet potato wedges and steamed broccoli. Rich in omega-3s and extremely filling.</p>
              </div>
              <div className="plan-meal">
                <div className="plan-meal-header">
                  <span className="meal-type">Snack</span>
                  <span className="plan-meal-name">Apple &amp; Peanut Butter</span>
                  <span className="plan-meal-meta">280 kcal &middot; 8g protein &middot; 2 min</span>
                </div>
                <p className="plan-meal-desc">Sliced apple with two tablespoons of peanut butter. A satisfying afternoon snack that keeps hunger at bay.</p>
              </div>
              <div className="plan-day-total">Total: ~1,760 kcal &nbsp;&middot;&nbsp; ~112g protein</div>
            </div>
            <p style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--muted)' }}>
              Each generated plan is unique — click <em>Generate Plan</em> above for a different, randomised meal schedule.
            </p>
          </div>

          <div className="seo-section">
            <h2>Popular UK Meal Plan Types</h2>
            <p>Browse our ready-made example plans for the most popular calorie targets:</p>
            <div className="plan-cards">
              {PLAN_CARDS.map(p => (
                <Link key={p.slug} to={`/meal-plan/${p.slug}`} className="plan-card">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="seo-section">
            <h2>Supported UK Supermarkets</h2>
            <p>
              Our generator is tailored to the four largest UK supermarkets, making it easy to pick up everything in a
              single weekly shop:
            </p>
            <ul>
              <li><strong>Tesco</strong> — the UK&apos;s largest supermarket, with a huge range of own-brand products perfect for calorie-controlled eating.</li>
              <li><strong>Aldi</strong> — outstanding value for staples like chicken, eggs, oats, and frozen vegetables.</li>
              <li><strong>Sainsbury&apos;s</strong> — a strong range of fresh produce, free-from options, and high-protein choices.</li>
              <li><strong>Asda</strong> — budget-friendly and widely stocked, particularly good for bulk buys on proteins and carbs.</li>
            </ul>
            <p>
              If you shop at Tesco, see our dedicated <Link to="/meal-plan/tesco-low-calorie-meal-plan">Tesco low-calorie meal plan</Link> and
              our <Link to="/blog/tesco-low-calorie-shopping-list">Tesco low-calorie shopping list</Link> for product recommendations.
            </p>
          </div>

          <div className="ad-banner">
            <a
              href="https://ebay.us/m/w68ZOg"
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="ad-img-link"
            >
              <img src="/meal-stickers-ad.png" alt="Meal prep organisation sticker set" className="ad-img" />
            </a>
            <div className="ad-text">
              <span className="ad-label">Sponsored</span>
              <p>Need help with meal prep organisation? Buy these stickers and keep your week on track.</p>
            </div>
          </div>

          <div className="seo-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq">
              <div className="faq-item">
                <h3>How many calories should I eat to lose weight?</h3>
                <p>
                  Most adults lose weight sustainably on 1,500–1,800 calories per day, depending on height, weight, age, and
                  activity level. The safest approach is to calculate your TDEE and subtract 300–500 calories.
                  Our <Link to="/blog/how-to-build-a-calorie-deficit">calorie deficit guide</Link> walks you through this step by step.
                </p>
              </div>
              <div className="faq-item">
                <h3>Is this meal plan generator really free?</h3>
                <p>Yes — completely free, with no sign-up, no email required, and no paywalled features. Generate as many plans as you like.</p>
              </div>
              <div className="faq-item">
                <h3>Can I use this if I am vegetarian or vegan?</h3>
                <p>
                  Absolutely. Select &quot;Vegetarian&quot; or &quot;Vegan&quot; from the dietary preference dropdown and the generator will
                  produce a fully plant-based plan. Browse our <Link to="/meal-plan/vegetarian-low-calorie-meal-plan">vegetarian low-calorie meal plan</Link> for
                  a ready-made example.
                </p>
              </div>
              <div className="faq-item">
                <h3>How do I know the calorie counts are accurate?</h3>
                <p>
                  The AI generates calorie and protein estimates based on standard nutritional data. They are a useful guide rather than exact figures.
                  For precise tracking, weigh your ingredients and use a calorie tracking app such as MyFitnessPal or Cronometer.
                </p>
              </div>
              <div className="faq-item">
                <h3>Can I regenerate the plan if I do not like it?</h3>
                <p>Yes — simply adjust your settings and click Generate Plan again. Each generation produces a different, randomised plan.</p>
              </div>
            </div>
          </div>

          <h2>Further Reading</h2>
          <ul className="plan-links">
            <li><Link to="/blog/how-to-build-a-calorie-deficit">How to Build a Calorie Deficit for Sustainable Weight Loss</Link></li>
            <li><Link to="/blog/best-low-calorie-foods-uk">The Best Low Calorie Foods Available in UK Supermarkets</Link></li>
            <li><Link to="/blog/high-protein-low-calorie-meals">High Protein Low Calorie Meals for UK Weight Loss</Link></li>
            <li><Link to="/blog/tesco-low-calorie-shopping-list">The Ultimate Tesco Low Calorie Shopping List</Link></li>
            <li><Link to="/blog/how-to-meal-plan-for-weight-loss">How to Meal Plan for Weight Loss — A UK Beginner&apos;s Guide</Link></li>
          </ul>
        </section>
      </div>

      <Footer />
    </>
  );
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}
