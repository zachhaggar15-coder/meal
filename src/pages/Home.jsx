import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MealForm from '../components/MealForm.jsx';
import MealPlan from '../components/MealPlan.jsx';
import ShoppingList from '../components/ShoppingList.jsx';
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
      'Free AI-powered meal plan generator for UK users. Creates personalised low-calorie, high-protein weekly meal plans tailored to Tesco, Aldi, Sainsbury\'s or Asda.',
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
          text: 'The generator supports Tesco, Aldi, Sainsbury\'s and Asda. Meal plans are tailored to use ingredients readily available at your chosen store.',
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
  'Almost there…',
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [lastValues, setLastValues] = useState(null);
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

      // Easing: each tick moves (target - current) * factor — fast then slows
      progressInterval.current = setInterval(() => {
        const next = progressRef.current + (90 - progressRef.current) * 0.045;
        progressRef.current = next;
        setProgress(next);
      }, 300);

      msgInterval.current = setInterval(() => {
        setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
      }, 4500);
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
          <p>Enter your details below and get a personalised, high-protein meal plan in under 30 seconds.</p>
        </header>

        <section className="card">
          <MealForm onSubmit={handleGenerate} disabled={loading} />
        </section>

        {/* Fixed top progress bar */}
        {progress > 0 && (
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%`, transition: progress === 100 ? 'width 0.2s ease-in' : 'width 0.3s ease-out' }}
            />
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="loading-message">{LOADING_MESSAGES[msgIndex]}</div>
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

        {plan?.weekly_plan && <MealPlan weeklyPlan={plan.weekly_plan} />}
        {plan?.shopping_list && lastValues?.shoppingList && (
          <ShoppingList list={plan.shopping_list} price={plan.price_estimate} />
        )}

        {/* ── SEO Content ── */}
        <section className="seo-content">
          <h2>What is a Low-Calorie Meal Plan Generator?</h2>
          <p>
            A low-calorie meal plan generator takes your personal preferences — daily calorie target, dietary requirements,
            preferred supermarket, and foods you love or want to avoid — and produces a complete weekly meal plan in seconds.
            Our UK meal plan generator is powered by AI and is designed specifically for shoppers at Tesco, Aldi,
            Sainsbury&apos;s, and Asda, so every ingredient on your plan is easy to find and affordable.
          </p>
          <p>
            Unlike generic calorie calculators, our tool creates a structured day-by-day plan with named meals,
            calorie counts, protein targets, and prep times. It also generates a categorised shopping list with an
            estimated weekly cost in GBP, making it easier than ever to stick to a budget while eating healthily.
          </p>

          <h2>How to Use This UK Meal Plan Generator</h2>
          <p>Getting started takes less than a minute. Here is what to do:</p>
          <ol>
            <li><strong>Set your plan length.</strong> Choose a 1-day, 3-day, or 7-day plan depending on how far ahead you want to plan.</li>
            <li><strong>Enter your daily calorie target.</strong> Not sure what yours is? A common starting point for weight loss is 1,500–1,800 calories per day. Use our <Link to="/blog/how-to-build-a-calorie-deficit">calorie deficit guide</Link> to calculate yours.</li>
            <li><strong>Choose your meals per day</strong> and whether you want snacks included.</li>
            <li><strong>Select your dietary preference</strong> — standard, vegetarian, or vegan.</li>
            <li><strong>Pick your UK supermarket.</strong> The plan will use ingredients available at Tesco, Aldi, Sainsbury&apos;s, or Asda.</li>
            <li><strong>Set your max cooking time</strong> so every meal fits your lifestyle — from quick 15-minute dinners to more involved weekend cooking.</li>
            <li>Optionally add foods you want to include or avoid, then click <em>Generate Plan</em>.</li>
          </ol>
          <p>
            Your personalised meal plan appears within 30 seconds, complete with a shopping list and estimated weekly cost.
          </p>

          <h2>Why Choose a Calorie-Controlled Meal Plan?</h2>
          <p>
            Research consistently shows that meal planning is one of the most effective strategies for sustained weight loss.
            A 2017 study published in the <em>International Journal of Behavioral Nutrition and Physical Activity</em> found
            that meal planners had significantly higher diet quality and were less likely to be overweight than those who did not plan.
          </p>
          <p>
            Calorie control remains the most reliable way to lose body fat. By targeting a specific daily calorie intake —
            typically 300–500 below your Total Daily Energy Expenditure — you create the deficit needed for steady, sustainable
            fat loss of around 0.5 kg per week. Our generator keeps every day within ±100 kcal of your target,
            takes the maths out of the equation, and ensures you get enough protein to preserve muscle while you lose fat.
          </p>
          <p>
            High protein intake is especially important during weight loss. Protein is the most satiating macronutrient,
            meaning it keeps you fuller for longer and reduces cravings. Our meal plans prioritise lean protein sources —
            chicken breast, eggs, Greek yogurt, tuna, and tofu — to help you hit at least 1.6 g of protein per kg of body weight each day.
          </p>

          <h2>Popular UK Meal Plan Types</h2>
          <p>Not sure where to start? Browse our ready-made example plans for the most popular calorie targets:</p>
          <ul className="plan-links">
            <li><Link to="/meal-plan/1500-calorie-meal-plan">1500 Calorie Meal Plan</Link> — ideal for a moderate weight-loss deficit</li>
            <li><Link to="/meal-plan/1800-calorie-meal-plan">1800 Calorie Meal Plan</Link> — popular for women aiming to lose 0.5 kg/week</li>
            <li><Link to="/meal-plan/2000-calorie-meal-plan">2000 Calorie Meal Plan</Link> — suited to active individuals or a gentle deficit</li>
            <li><Link to="/meal-plan/high-protein-low-calorie-meal-plan">High Protein Low Calorie Plan</Link> — maximises protein for muscle retention</li>
            <li><Link to="/meal-plan/tesco-low-calorie-meal-plan">Tesco Low Calorie Meal Plan</Link> — budget-friendly, uses Tesco products</li>
            <li><Link to="/meal-plan/vegetarian-low-calorie-meal-plan">Vegetarian Low Calorie Plan</Link> — plant-based and protein-rich</li>
          </ul>

          <h2>Supported UK Supermarkets</h2>
          <p>
            Our generator is tailored to the four largest UK supermarkets, making it easy to pick up everything you need in a
            single weekly shop:
          </p>
          <ul>
            <li><strong>Tesco</strong> — the UK&apos;s largest supermarket, with a huge range of own-brand and Finest products perfect for calorie-controlled eating.</li>
            <li><strong>Aldi</strong> — outstanding value for staples like chicken, eggs, oats, and frozen vegetables.</li>
            <li><strong>Sainsbury&apos;s</strong> — a strong range of fresh produce, free-from options, and high-protein ready meals.</li>
            <li><strong>Asda</strong> — budget-friendly and widely stocked, particularly good for bulk buys on proteins and carbs.</li>
          </ul>
          <p>
            If you shop at Tesco, check out our dedicated <Link to="/meal-plan/tesco-low-calorie-meal-plan">Tesco low-calorie meal plan</Link> and
            our <Link to="/blog/tesco-low-calorie-shopping-list">Tesco low-calorie shopping list</Link> for budget tips and product recommendations.
          </p>

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
                produce a fully plant-based plan. You can also browse our <Link to="/meal-plan/vegetarian-low-calorie-meal-plan">vegetarian low-calorie meal plan</Link> for
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
