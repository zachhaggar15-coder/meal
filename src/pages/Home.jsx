import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MealForm from '../components/MealForm.jsx';
import MealPlan from '../components/MealPlan.jsx';
import ShoppingList from '../components/ShoppingList.jsx';
import EditPlanBox from '../components/EditPlanBox.jsx';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import WaitlistSection from '../components/WaitlistSection.jsx';
import StickerPromo from '../components/StickerPromo.jsx';
import ContainerSetupRecommendation from '../components/ContainerSetupRecommendation.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PopularSearches, { POPULAR_SEARCH_LINKS } from '../components/PopularSearches.jsx';
import SearchOpportunityLinks from '../components/SearchOpportunityLinks.jsx';
import WeeklyTrendingLinks from '../components/WeeklyTrendingLinks.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { MID_RANGE_CONTAINERS } from '../data/offers.js';
import { INDEXED_SUPERMARKET_VALUES, PLAN_COUNT_LABEL } from '../data/planCatalogMeta.js';
import { INDEXABLE_PLAN_SEEDS } from '../data/planSeeds.js';
import { planGoalShort, planMarketShort } from '../utils/planCardMeta.js';
import { DIET_CHOICES, buildDietChooserPath, buildPlanChooserPath } from '../data/planChooser.js';
import { SITE_VISUALS } from '../data/visualAssets.js';
import { track } from '../utils/analytics.js';
import { apiHeaders } from '../utils/apiClient.js';

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const homeJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MealPrep.org.uk - Free UK Meal Plan Generator',
    url: 'https://www.mealprep.org.uk',
    description: `Generate a weekly UK meal plan using supermarket ingredients, browse ${PLAN_COUNT_LABEL} diet plans, print PDFs and build shopping lists by calories, supermarket and goal.`,
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
          text: `Answer 7 quick questions about your goal, diet type, supermarket, calorie target, budget, cooking effort, and macro preferences. The quiz matches you with your top 3 plans from a library of ${PLAN_COUNT_LABEL} UK meal plans.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Are the meal plans free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. All ${PLAN_COUNT_LABEL} meal plans are completely free with no sign-up required. You can also use the AI editing tool to customise any plan.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Can I generate a weekly meal plan using ingredients from UK supermarkets?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Yes. Choose a goal, calorie target and supermarket, then use the quiz or generator to build a 7-day plan with ingredients from Aldi, Lidl, Tesco, Asda, Sainsbury's, Morrisons, Iceland, Waitrose, Ocado, M&S, Co-op or generic UK supermarket staples.",
        },
      },
      {
        '@type': 'Question',
        name: 'Which UK supermarkets are covered?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Plans cover Aldi, Lidl, Tesco, Asda, Sainsbury's, Morrisons, Iceland, Waitrose, Ocado, M&S, and Co-op.",
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

// The three groups are ways in, not plans.
//
// They used to be six named Aldi plans under "By Goal", six mixed things under
// "By Supermarket" and six Aldi diet plans under "Diet Types" - so every route
// through the homepage was pre-decided as Aldi, and the supermarket choice the
// site is built around never got made by the reader. Each card is now the
// category its group heading promises, and choosing the supermarket is the
// step after, on the chooser pages that already exist for exactly that.
const FEATURED_GOALS = ['weight-loss', 'high-protein-low-cal', 'muscle-gain', 'budget-fat-loss', 'cheap-student', 'busy-professional'];

function seedsWhere(predicate) {
  return INDEXABLE_PLAN_SEEDS.filter(predicate);
}

function categoryFacts(seeds, remainingAxis) {
  if (!seeds.length) return null;
  const calories = seeds.map(seed => seed.calories);
  const low = Math.min(...calories);
  const high = Math.max(...calories);
  return {
    count: seeds.length,
    // A single figure would be a lie here: a goal spans several targets.
    kcal: low === high
      ? `${low.toLocaleString('en-GB')} kcal`
      : `${low.toLocaleString('en-GB')}–${high.toLocaleString('en-GB')} kcal`,
    // What is still left to choose, which is the point of sending people to a
    // chooser rather than straight at one plan.
    remaining: remainingAxis,
  };
}

const FEATURED_CATEGORIES = [
  {
    heading: 'By Goal',
    cards: FEATURED_GOALS.map(goal => {
      const seeds = seedsWhere(seed => seed.goal === goal);
      const markets = new Set(seeds.map(seed => seed.supermarket)).size;
      return {
        key: goal,
        label: planGoalShort(goal),
        to: buildPlanChooserPath(goal),
        facts: categoryFacts(seeds, `${markets} supermarkets`),
      };
    }),
  },
  {
    heading: 'By Supermarket',
    cards: INDEXED_SUPERMARKET_VALUES.filter(value => value !== 'any').map(supermarket => {
      const seeds = seedsWhere(seed => seed.supermarket === supermarket);
      const goals = new Set(seeds.map(seed => seed.goal)).size;
      return {
        key: supermarket,
        label: planMarketShort(supermarket),
        to: `/meal-plans/${supermarket}`,
        facts: categoryFacts(seeds, `${goals} ${goals === 1 ? 'goal' : 'goals'}`),
      };
    }),
  },
  {
    heading: 'Diet Types',
    cards: DIET_CHOICES.map(choice => {
      // The chooser's diet list is not purely dietType: "High Protein
      // Vegetarian" is a goal in the catalogue, not a diet, so matching it
      // against dietType made it claim all 213 vegetarian plans - the same
      // number as the Vegetarian card next to it. Match whichever field the
      // choice actually lives in.
      const seeds = seedsWhere(seed => seed.dietType === choice.value || seed.goal === choice.value);
      const markets = new Set(seeds.map(seed => seed.supermarket)).size;
      return {
        key: choice.value,
        label: choice.label,
        to: buildDietChooserPath(choice.value),
        facts: categoryFacts(seeds, `${markets} supermarkets`),
      };
    }),
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

// Named chains only. INDEXED_SUPERMARKET_VALUES also carries "any", which is a
// selectable option in the quiz ("12 supermarket choices") but not a shop, so
// the two figures are both right and were drifting apart as a hardcoded 11.
const NAMED_SUPERMARKET_COUNT = INDEXED_SUPERMARKET_VALUES.filter(value => value !== 'any').length;

// One accent per group. The cards used to be six different arbitrary colours
// inside a single group, which read as a category code and encoded nothing.
// Colour now tracks the group you are browsing within.
//
// Note this is deliberately NOT the same rule as /browse, where colour tracks
// the supermarket. The homepage is grouped, so the group is the useful signal;
// /browse is one mixed grid, where the chain is. Each surface states its own
// key rather than sharing one that fits neither.
const FEATURED_ACCENTS = {
  'By Goal': 'goal',
  'By Supermarket': 'market',
  'Diet Types': 'diet',
};

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
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
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
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
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
            track.planGenerated({
              days: values.days,
              calories: values.calories,
              meals: values.meals,
              diet: values.diet,
              supermarket: values.supermarket,
            });
            break outer;
          } else if (event.type === 'error') {
            throw new Error(event.error);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      track.planGenerationFailed({ reason: err.message || 'unknown' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO
        title="Find a UK Supermarket Meal Plan | MealPrep.org.uk"
        description={`Find a realistic 7-day meal plan for the UK supermarket you use, with shopping lists, calories, macros and printable plans from a library of ${PLAN_COUNT_LABEL}.`}
        canonical="https://www.mealprep.org.uk/"
        jsonLd={homeJsonLd}
      />

      <div className="page home-page">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <header className="home-hero">
          <SiteLogo variant="hero" className="home-hero-logo" />
          <h1 className="home-hero-h1">
            Find a realistic weekly plan for the supermarket you use.
          </h1>
          <p className="home-hero-sub">
            Answer seven quick questions about your goal, budget and usual UK supermarket.
            We'll match you with a ready-made 7-day plan and shopping list.
          </p>
          <div className="home-hero-actions">
            <Link
              to="/quiz"
              className="btn-hero-primary"
              data-event="plan_primary_cta_clicked"
              data-source-page="home"
              data-page-type="homepage"
              data-cta-location="hero"
            >
              Find my meal plan
            </Link>
            <Link to="/browse" className="btn-hero-secondary">
              Browse plans manually
            </Link>
          </div>
          <div className="trust-row">
            <span className="trust-badge"><strong>{PLAN_COUNT_LABEL}</strong> published plans</span>
            <span className="trust-badge"><strong>{NAMED_SUPERMARKET_COUNT}</strong> supermarkets</span>
            <span className="trust-badge"><strong>Free</strong> with no account</span>
            <span className="trust-badge"><strong>Shopping list</strong> included</span>
          </div>
          {/* `priority` but deliberately NOT `lcpCandidate`. Moving this above
              the fold on mobile was expected to make it the LCP element; measured
              on a 390x844 phone it does not - the H1 still wins, three runs out
              of three. So fetchpriority="high" here would only make the image
              contend with the render-blocking stylesheet that gates the text LCP,
              which is the trap PageHeroVisual's header comment describes. */}
          <PageHeroVisual visual={SITE_VISUALS.home} className="home-hero-visual" priority />
        </header>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="how-it-works">
          <h2 className="section-title">How it works</h2>
          {/* An ordered list, because it is one. The steps used to be four
              equal boxes whose numbers were styled as the same tiny grey
              kicker as every other label on the page, so nothing said these
              happened in sequence. Step two also led with the machinery — "we
              rank all 1,055 plans" — which describes our work, not the
              reader's. */}
          <ol className="hiw-steps">
            <li className="hiw-step">
              <span className="hiw-num" aria-hidden="true">1</span>
              <strong>Tell us what you need</strong>
              <p>Seven quick questions: your goal, diet, supermarket, calories, budget and how much cooking you want to do.</p>
            </li>
            <li className="hiw-step">
              <span className="hiw-num" aria-hidden="true">2</span>
              <strong>Get matched</strong>
              <p>You get the three plans that fit your answers best, each one saying plainly where it fits and where it does not.</p>
            </li>
            <li className="hiw-step">
              <span className="hiw-num" aria-hidden="true">3</span>
              <strong>Follow your plan</strong>
              <p>Seven days of meals with recipes, a shopping list you can tick off, daily macros and a cost estimate.</p>
            </li>
            <li className="hiw-step">
              <span className="hiw-num" aria-hidden="true">4</span>
              <strong>Change what does not suit you</strong>
              <p>Swap any meal in plain English — cheaper, vegan, higher protein — and the plan updates around it.</p>
            </li>
          </ol>
          <div className="hiw-cta">
            <Link to="/quiz" className="btn-primary">Find my meal plan</Link>
          </div>
        </section>

        {/* ── Manual calorie browsing remains available, but secondary ── */}
        <section className="calorie-nav-section">
          <h2 className="section-title">Prefer to browse by calorie target?</h2>
          <div className="calorie-nav-links">
            <Link to="/meal-plan/1500-calorie-meal-plan" className="calorie-nav-card">
              <strong>1,500 kcal</strong>
              <span>Lower target — most popular for weight loss</span>
            </Link>
            <Link to="/meal-plan/1800-calorie-meal-plan" className="calorie-nav-card">
              <strong>1,800 kcal</strong>
              <span>Moderate target — often chosen by active adults</span>
            </Link>
            <Link to="/meal-plan/2000-calorie-meal-plan" className="calorie-nav-card">
              <strong>2,000 kcal</strong>
              <span>Middle target — maintenance or gentle loss</span>
            </Link>
            <Link to="/meal-plan/2500-calorie-meal-plan" className="calorie-nav-card">
              <strong>2,500 kcal</strong>
              <span>Higher target — usually chosen for muscle gain</span>
            </Link>
          </div>
        </section>

        {/* ── Featured plans ────────────────────────────────────────────────── */}
        <section className="featured-plans" id="popular-plans">
          <h2 className="section-title">Popular UK Meal Plans</h2>
          <p className="featured-plans-sub">
            Start with what you want, not where you shop. Pick a supermarket on the next step.
          </p>

          {FEATURED_CATEGORIES.map(cat => (
            <div className={`featured-cat fc-${FEATURED_ACCENTS[cat.heading] || 'goal'}`} key={cat.heading}>
              <h3 className="featured-cat-heading">{cat.heading}</h3>
              <div className="featured-plan-links">
                {cat.cards.map(card => (
                  <Link key={card.key} to={card.to} className="fp-card">
                    {card.facts && (
                      <span className="fp-tag">
                        {card.facts.count.toLocaleString('en-GB')} plans
                      </span>
                    )}
                    <span className="fp-title">{card.label}</span>
                    {card.facts && (
                      <span className="fp-stats">
                        <span>{card.facts.kcal}</span>
                        <span aria-hidden="true">·</span>
                        <span className="fp-choice">{card.facts.remaining}</span>
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="featured-browse-cta">
            <Link to="/browse" className="btn-secondary">
              Browse all {PLAN_COUNT_LABEL} plans →
            </Link>
          </div>
        </section>

        {/* ── Affiliate promo ───────────────────────────────────────────────── */}
        <section className="home-prep-flow" aria-labelledby="home-prep-flow-heading">
          <div className="section-head-inline">
            <div>
              <span className="offer-kicker">Plan, shop, portion</span>
              <h2 id="home-prep-flow-heading">Make the plan easier to actually use</h2>
              <p>
                The useful bit is not only choosing meals. It is knowing what to buy,
                how much to cook, and what to portion it into before Monday starts.
              </p>
            </div>
          </div>
          <div className="home-prep-flow-grid">
            <Link to="/quiz" className="home-prep-flow-step">
              <strong>1. Match a plan</strong>
              <span>Pick a supermarket, calorie target, budget, and prep style.</span>
            </Link>
            <Link to="/tools#container-count-calculator" className="home-prep-flow-step">
              <strong>2. Count the boxes</strong>
              <span>Estimate lunches, dinners, snack tubs, and freezer spares.</span>
            </Link>
            <Link to="/meal-prep-containers" className="home-prep-flow-step">
              <strong>3. Compare containers</strong>
              <span>Choose budget plastic, weekday glass, or a larger batch system.</span>
            </Link>
          </div>
        </section>

        <StickerPromo offer={MID_RANGE_CONTAINERS} sourcePage="home-prep-flow" />

        {/* Three link blocks run back to back here. They kept every link, but two
            of them claimed the same thing ("most-read" and "finding useful right
            now"), so a reader could not tell them apart. Each intro now states the
            axis that actually separates them: what people search for, what is
            moving lately, and the fixed reference set. No links changed. */}
        <PopularSearches
          title="Popular UK Meal Plan Searches"
          intro="The phrases people actually search for. Each one goes straight to the matching plan, guide or shopping list."
          links={POPULAR_SEARCH_LINKS.slice(0, 8)}
          className="popular-searches--home"
        />

        <WeeklyTrendingLinks compact />

        <SearchOpportunityLinks
          title="Essential UK Meal Prep Guides"
          intro="The permanent reference set, unchanged week to week — containers, calorie targets, low-calorie foods, cheap protein, delivery comparisons and supermarket planning."
          showDiscovery={false}
          compact
        />

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
                a: "Yes. Use the quiz for ready-made 7-day plans or the AI generator for a custom week. Plans can be matched to Aldi, Lidl, Tesco, Asda, Sainsbury's, Morrisons, Iceland, Waitrose, Ocado, M&S, Co-op, or generic UK supermarket ingredients.",
              },
              {
                q: 'Which supermarkets do the plans cover?',
                a: "Plans cover Aldi, Lidl, Tesco, Asda, Sainsbury's, Morrisons, Iceland, Waitrose, Ocado, M&S, and Co-op. Plans marked 'Generic UK supermarket' use ingredients available at most UK stores with average UK supermarket pricing.",
              },
              {
                q: 'Are calorie counts accurate?',
                a: 'Calorie and macro figures are estimates based on standard UK nutritional data. After AI editing, values are labelled as estimates. Always verify with your specific branded products if you need precision.',
              },
              {
                q: 'Are the plans free?',
                a: `All ${PLAN_COUNT_LABEL} plans are completely free with no account required. The AI editing tool is also free.`,
              },
            ].map((f, i) => (
              <details className="faq-item" key={i}>
                <summary className="faq-question">{f.q}</summary>
                <p className="faq-answer">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="home-faq-more">
            <Link to="/questions">See more meal prep questions, answered by topic &rarr;</Link>
          </p>
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
              <ContainerSetupRecommendation
                plan={plan}
                formValues={lastValues}
                sourcePage="generated-plan"
              />
              <EditPlanBox
                onEdit={handleEdit}
                loading={editLoading}
                error={editError}
              />
            </div>
          )}
        </section>

      </div>
      <WaitlistSection sourcePage="home" compact />
      <Footer />
    </>
  );
}

