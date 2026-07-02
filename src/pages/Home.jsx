import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MealForm from '../components/MealForm.jsx';
import MealPlan from '../components/MealPlan.jsx';
import ShoppingList from '../components/ShoppingList.jsx';
import EditPlanBox from '../components/EditPlanBox.jsx';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import StickerPromo from '../components/StickerPromo.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PopularSearches from '../components/PopularSearches.jsx';
import SearchOpportunityLinks from '../components/SearchOpportunityLinks.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { MEAL_PREP_STICKERS } from '../data/offers.js';
import { PLAN_COUNT } from '../data/planSeeds.js';
import { choosePlanVisual, SITE_VISUALS } from '../data/visualAssets.js';

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const homeJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MealPrep.org.uk - Free UK Meal Plan Generator',
    url: 'https://www.mealprep.org.uk',
    description: `Generate a weekly UK meal plan using supermarket ingredients, browse ${PLAN_COUNT} diet plans, print PDFs and build shopping lists by calories, supermarket and goal.`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.mealprep.org.uk/browse?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the meal plan quiz work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Answer 7 quick questions about your goal, diet type, supermarket, calorie target, budget, cooking effort, and macro preferences. The quiz matches you with your top 3 plans from a library of ${PLAN_COUNT} UK meal plans.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Are the meal plans free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. All ${PLAN_COUNT} meal plans are completely free with no sign-up required. You can also use the AI editing tool to customise any plan.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Can I generate a weekly meal plan using ingredients from UK supermarkets?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Yes. Choose a goal, calorie target and supermarket, then use the quiz or generator to build a 7-day plan with ingredients from Aldi, Lidl, Tesco, Asda, Sainsbury's, Morrisons, Iceland or generic UK supermarket staples.",
        },
      },
      {
        '@type': 'Question',
        name: 'Which UK supermarkets are covered?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Plans cover Aldi, Lidl, Tesco, Asda, Sainsbury's, Morrisons, and Iceland.",
        },
      },
      {
        '@type': 'Question',
        name: 'Can I edit a meal plan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Every plan page has an AI editing tool. You can swap individual meals, change the diet, remove ingredients, or adjust macros — and the shopping list updates automatically.',
        },
      },
    ],
  },
];

// ── Featured plan categories ──────────────────────────────────────────────────

const FEATURED_CATEGORIES = [
  {
    heading: 'By Goal',
    plans: [
      { slug: 'aldi-weight-loss-1500',         label: 'Weight Loss — Aldi 1,500 kcal' },
      { slug: 'aldi-high-protein-low-cal-1500', label: 'High Protein Low Cal — Aldi' },
      { slug: 'aldi-muscle-gain-2000',          label: 'Muscle Gain — Aldi 2,000 kcal' },
      { slug: 'aldi-budget-fat-loss-1500',      label: 'Budget Fat Loss — Aldi' },
      { slug: 'aldi-cheap-student-1800',        label: 'Cheap Student — Aldi 1,800 kcal' },
      { slug: 'aldi-busy-professional-1800',    label: 'Busy Professional — Aldi' },
    ],
  },
  {
    heading: 'By Supermarket',
    plans: [
      { slug: 'tesco-weight-loss-1800',   label: 'Tesco Weight Loss 1,800 kcal' },
      { slug: 'aldi-weight-loss-1800',    label: 'Aldi Weight Loss 1,800 kcal' },
      { slug: 'lidl-budget-fat-loss-1500',label: 'Lidl Budget Fat Loss' },
      { slug: 'asda-muscle-gain-2000',    label: 'Asda Muscle Gain 2,000 kcal' },
      { slug: 'sainsburys-weight-loss-1800', label: "Sainsbury's 1,800 kcal" },
      { slug: 'iceland-budget-fat-loss-1500', label: 'Iceland Budget Fat Loss' },
    ],
  },
  {
    heading: 'Diet Types',
    plans: [
      { slug: 'aldi-veg-low-cal-1500',       label: 'Vegetarian Low Cal — Aldi' },
      { slug: 'aldi-vegan-low-cal-1500',      label: 'Vegan Low Cal — Aldi' },
      { slug: 'aldi-hp-veg-1800',             label: 'High Protein Vegetarian — Aldi' },
      { slug: 'tesco-veg-low-cal-1800',       label: 'Vegetarian Low Cal — Tesco' },
      { slug: 'aldi-pescatarian-1800',        label: 'Pescatarian — Aldi 1,800 kcal' },
      { slug: 'lidl-vegan-low-cal-1800',      label: 'Vegan Low Cal — Lidl' },
    ],
  },
];

// ── Loading messages for AI generator ────────────────────────────────────────

const LOADING_MESSAGES = [
  'Convincing the AI that kale is exciting…',
  'Hiding the chocolate from your meal plan…',
  'Negotiating with broccoli on your behalf…',
  'Removing the fourth cheese option (reluctantly)…',
  'Pretending cauliflower rice is just as good…',
  'Telling the algorithm you actually like vegetables…',
  'Adding a cheeky treat then removing it again…',
  'Explaining to the AI what a jacket potato is…',
  'Cross-referencing with 47 nutritional databases…',
  'Making sure your shopping list doesn\'t cost more than rent…',
  'Removing "truffle oil" from the shopping list again…',
  'Making the AI acknowledge that frozen veg counts…',
  'Stopping the AI from writing a 12-step recipe for beans on toast…',
  'Almost done — just negotiating over the biscuit situation…',
];

async function safeJson(res) {
  try { return await res.json(); } catch { return {}; }
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Home() {
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [plan, setPlan]             = useState(null);
  const [lastValues, setLastValues] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError]   = useState(null);
  const [progress, setProgress]     = useState(0);
  const [msgIndex, setMsgIndex]     = useState(0);
  const progressRef  = useRef(0);
  const msgInterval  = useRef(null);
  const loadingRef   = useRef(null);
  const planRef      = useRef(null);

  useEffect(() => {
    if (loading) {
      progressRef.current = 0;
      setProgress(0);
      setMsgIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
      setTimeout(() => loadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      msgInterval.current = setInterval(() => {
        setMsgIndex(() => Math.floor(Math.random() * LOADING_MESSAGES.length));
      }, 5000);
    } else {
      clearInterval(msgInterval.current);
      if (progressRef.current > 0) {
        setProgress(100);
        setTimeout(() => { setProgress(0); progressRef.current = 0; }, 500);
      }
    }
    return () => clearInterval(msgInterval.current);
  }, [loading]);

  useEffect(() => {
    if (plan?.weekly_plan && planRef.current) {
      setTimeout(() => planRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [plan]);

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
      setPlan(await res.json());
    } catch (err) {
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

    const estimatedChars = Number(values.days || 7) * Number(values.meals || 3) * 800 + 2000;

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

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let event;
          try { event = JSON.parse(line.slice(6)); } catch { continue; }
          if (event.type === 'progress') {
            const pct = Math.min(95, (event.chars / estimatedChars) * 100);
            progressRef.current = pct;
            setProgress(pct);
          } else if (event.type === 'done') {
            setPlan(event.plan);
            break outer;
          } else if (event.type === 'error') {
            throw new Error(event.error);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO
        title={`Generate a Weekly UK Meal Plan - ${PLAN_COUNT} Plans + Shopping Lists | MealPrep.org.uk`}
        description="Generate a weekly meal plan using UK supermarket ingredients, with Aldi, Tesco, Lidl, Asda and Sainsbury's options, calories, PDFs and shopping lists."
        canonical="https://www.mealprep.org.uk/"
        jsonLd={homeJsonLd}
      />

      <div className="page">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <header className="home-hero">
          <SiteLogo variant="hero" className="home-hero-logo" />
          <h1 className="home-hero-h1">
            Eat well this week without the guesswork.
          </h1>
          <p className="home-hero-sub">
            A quiet, considered meal planner. Tell us your goal, budget and supermarket; we return a ready-made 7-day plan and a shopping list, priced to the pound.
          </p>
          <div className="home-hero-actions">
            <Link to="/quiz" className="btn-hero-primary">
              Start the quiz
            </Link>
            <Link to="/browse" className="btn-hero-secondary">
              Browse all plans
            </Link>
          </div>
          <div className="trust-row">
            <span className="trust-badge"><strong>1,000+</strong> ready-made plans</span>
            <span className="trust-badge"><strong>7</strong> supermarkets</span>
            <span className="trust-badge"><strong>£31</strong> avg weekly cost</span>
            <span className="trust-badge"><strong>2 min</strong> to your match</span>
          </div>
          <PageHeroVisual visual={SITE_VISUALS.home} className="home-hero-visual" priority />
        </header>

        <PopularSearches
          title="Popular UK Meal Plan Searches"
          intro="Start with the highest-demand guides, then jump into a printable plan or shopping list."
          className="popular-searches--home"
        />

        <SearchOpportunityLinks
          title="Most requested UK meal prep guides"
          intro="Quick routes into the pages Search Console is already surfacing: containers, 1500 calorie plans, low-calorie foods, cheap protein and named-supermarket meal prep."
          showDiscovery={false}
          compact
        />

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="how-it-works">
          <h2 className="section-title">How it works</h2>
          <div className="hiw-steps">
            <div className="hiw-step">
              <span className="hiw-num">1</span>
              <strong>Take the quiz</strong>
              <p>7 quick questions about your goal, diet, supermarket, calories, budget, and effort.</p>
            </div>
            <div className="hiw-step">
              <span className="hiw-num">2</span>
              <strong>Get matched</strong>
              <p>We rank all {PLAN_COUNT} plans against your answers and show your top 3 matches.</p>
            </div>
            <div className="hiw-step">
              <span className="hiw-num">3</span>
              <strong>View your plan</strong>
              <p>Full 7-day meal plan, shopping list, macros, cost estimate, and swaps.</p>
            </div>
            <div className="hiw-step">
              <span className="hiw-num">4</span>
              <strong>Customise with AI</strong>
              <p>Edit any meal using natural language — make it vegan, cheaper, or higher protein.</p>
            </div>
          </div>
          <div className="hiw-cta">
            <Link to="/quiz" className="btn-primary">Start the Quiz</Link>
          </div>
        </section>

        {/* ── Featured plans ────────────────────────────────────────────────── */}
        <section className="featured-plans" id="popular-plans">
          <h2 className="section-title">Popular UK Meal Plans</h2>

          {FEATURED_CATEGORIES.map(cat => (
            <div className="featured-cat" key={cat.heading}>
              <h3 className="featured-cat-heading">{cat.heading}</h3>
              <div className="featured-plan-links">
                {cat.plans.map(p => (
                  <Link key={p.slug} to={`/plans/${p.slug}`} className="featured-plan-link">
                    <img
                      src={choosePlanVisual({ slug: p.slug, title: p.label }).src}
                      alt=""
                      width="1200"
                      height="675"
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{p.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="featured-browse-cta">
            <Link to="/browse" className="btn-secondary">
              Browse all {PLAN_COUNT} plans →
            </Link>
          </div>
        </section>

        {/* ── Affiliate promo ───────────────────────────────────────────────── */}
        <StickerPromo offer={MEAL_PREP_STICKERS} />

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="home-faq">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {[
              {
                q: 'How does the quiz match me with a plan?',
                a: 'We score every plan against your answers across 7 factors: goal, diet type, supermarket, calorie target, budget, effort level, and macro preferences. The three highest-scoring plans are shown as your matches.',
              },
              {
                q: 'Can I edit a plan I don\'t fully like?',
                a: 'Yes. Every plan page has an AI edit tool. Type instructions like "make this meal vegetarian", "remove tuna", "make it cheaper", or "increase the protein" — the plan updates in place and the shopping list changes too.',
              },
              {
                q: 'Can I generate a weekly meal plan using ingredients from UK supermarkets?',
                a: "Yes. Use the quiz for ready-made 7-day plans or the AI generator for a custom week. Plans can be matched to Aldi, Lidl, Tesco, Asda, Sainsbury's, Morrisons, Iceland, or generic UK supermarket ingredients.",
              },
              {
                q: 'Which supermarkets do the plans cover?',
                a: "Plans cover Aldi, Lidl, Tesco, Asda, Sainsbury's, Morrisons, and Iceland. Plans marked 'Generic UK supermarket' use ingredients available at most UK stores with average UK supermarket pricing.",
              },
              {
                q: 'Are calorie counts accurate?',
                a: 'Calorie and macro figures are estimates based on standard UK nutritional data. After AI editing, values are labelled as estimates. Always verify with your specific branded products if you need precision.',
              },
              {
                q: 'Are the plans free?',
                a: `All ${PLAN_COUNT} plans are completely free with no account required. The AI editing tool is also free.`,
              },
            ].map((f, i) => (
              <details className="faq-item" key={i}>
                <summary className="faq-question">{f.q}</summary>
                <p className="faq-answer">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── AI Generator (secondary) ──────────────────────────────────────── */}
        <section className="home-generator-section" id="generator">
          <h2 className="section-title">Prefer a custom plan? Use the AI generator</h2>
          <p className="home-generator-sub">
            Can't find exactly what you're looking for in the library? Generate a one-off plan by specifying your exact requirements below.
          </p>

          <div className="form-preview-layout">
            <div className="card form-col">
              <MealForm onSubmit={handleGenerate} disabled={loading} />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="loading-state" ref={loadingRef} aria-live="polite">
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="loading-msg">{LOADING_MESSAGES[msgIndex]}</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="error-msg" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Generated plan */}
          {plan?.weekly_plan && !loading && (
            <div ref={planRef}>
              <MealPlan plan={plan} />
              {plan.shopping_list && <ShoppingList list={plan.shopping_list} />}
              <EditPlanBox
                onEdit={handleEdit}
                loading={editLoading}
                error={editError}
              />
            </div>
          )}
        </section>

      </div>
      <Footer />
    </>
  );
}
