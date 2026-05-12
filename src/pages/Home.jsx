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
    '@type': 'WebSite',
    name: 'MealPrep.org.uk — Free UK Meal Plan Generator',
    url: 'https://www.mealprep.org.uk',
    description: 'Free UK meal plan generator for weight loss. Create personalised 7-day meal plans by calorie target, diet type, and supermarket.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'UK Meal Plan Generator',
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
    name: 'How to Create a Free UK Weight Loss Meal Plan',
    description:
      'Use the free AI-powered meal plan generator to create a personalised 7-day weight loss meal plan in under 30 seconds.',
    tool: [{ '@type': 'HowToTool', name: 'UK Meal Plan Generator' }],
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
        name: 'Click Get My 7-Day Meal Plan',
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
  'Convincing the AI that kale is exciting…',
  'Hiding the chocolate from your meal plan…',
  'Negotiating with broccoli on your behalf…',
  'Removing the fourth cheese option (reluctantly)…',
  'Asking the AI very nicely…',
  'Pretending cauliflower rice is just as good…',
  'Telling the algorithm you actually like vegetables…',
  'Adding a cheeky treat then removing it again…',
  'Explaining to the AI what a jacket potato is…',
  'Cross-referencing with 47 nutritional databases…',
  'Convincing protein that it tastes nice in yogurt…',
  'Hiding the fact that we almost included a kebab…',
  'Overruling the AI\'s obsession with quinoa…',
  'Teaching the algorithm what "budget-friendly" means…',
  'Calculating exactly how many oats is too many oats…',
  'Pretending overnight oats are a treat, not a punishment…',
  'Adding salmon, removing salmon, adding it back…',
  'Convincing the AI that meal prep is fun…',
  'Removing the fifth egg of the day…',
  'Arguing with the algorithm about portion sizes…',
  'Sneaking in an extra snack just for you…',
  'Asking the AI to stop suggesting avocado toast for every meal…',
  'Teaching the robot the difference between Tesco and Waitrose…',
  'Removing the suggestion of "just have a salad"…',
  'Making sure your shopping list doesn\'t cost more than rent…',
  'Apologising to the AI for rejecting its kale smoothie idea…',
  'Convincing the system that cottage cheese is acceptable…',
  'Double-checking the AI hasn\'t snuck in a Michelin-star recipe…',
  'Removing "truffle oil" from the shopping list again…',
  'Making the AI acknowledge that frozen veg counts…',
  'Telling the algorithm that "a handful" is not a unit of measurement…',
  'Stopping the AI from writing a 12-step recipe for beans on toast…',
  'Quietly ignoring the AI\'s suggestion of a spiraliser…',
  'Making sure Sunday doesn\'t involve a 3-hour roast…',
  'Filtering out anything that requires a bain-marie…',
  'Convincing the AI that Aldi is just as good as Waitrose…',
  'Removing the suggestion that you learn to ferment your own kimchi…',
  'Adding some actual flavour to the Wednesday dinner…',
  'Stopping the AI from making every lunch a sad desk salad…',
  'Quietly removing "bone broth" from the breakfast options…',
  'Telling the robot you don\'t own a mandoline slicer…',
  'Making sure at least one meal doesn\'t require 14 ingredients…',
  'Convincing the AI that "meal prep" doesn\'t mean "cook for 6 hours on Sunday"…',
  'Removing the AI\'s inexplicable love of edamame…',
  'Making sure there are no turmeric lattes on this plan…',
  'Persuading the algorithm that fish fingers are a valid protein source…',
  'Telling the AI that "superfood" isn\'t a food group…',
  'Removing the suggestion to buy a Nutribullet…',
  'Convincing the system that beans are, in fact, a meal…',
  'Almost done — just negotiating over the biscuit situation…',
];

const PLAN_CARDS = [
  // Calorie targets
  {
    slug: '1500-calorie-meal-plan',
    title: '1500 Calorie Meal Plan',
    desc: 'A 7-day fat loss plan for a moderate calorie deficit. Good starting point for lighter adults.',
  },
  {
    slug: '1800-calorie-meal-plan',
    title: '1800 Calorie Meal Plan',
    desc: 'The most popular target — high-protein, filling meals with a sustainable deficit.',
  },
  {
    slug: '2000-calorie-meal-plan',
    title: '2000 Calorie Meal Plan',
    desc: 'For active people who want structure without an aggressive cut.',
  },
  {
    slug: '2500-calorie-meal-plan',
    title: '2500 Calorie Meal Plan',
    desc: 'For muscle gain or very active individuals needing more fuel.',
  },
  // Goal / identity
  {
    slug: 'high-protein-low-calorie-meal-plan',
    title: 'High Protein Low Calorie Plan',
    desc: 'Maximum protein within a calorie deficit — ideal for fat loss while keeping muscle.',
  },
  {
    slug: 'cheap-student-meal-plan-uk',
    title: 'Cheap Student Meal Plan UK',
    desc: 'Under £30 a week at Aldi or Lidl. High-protein and genuinely simple to cook.',
  },
  {
    slug: 'budget-bodybuilding-meal-plan-uk',
    title: 'Budget Bodybuilding Meal Plan',
    desc: '2,000 kcal and 160g protein without premium-brand prices.',
  },
  {
    slug: 'gym-beginner-meal-plan-uk',
    title: 'Gym Beginner Meal Plan UK',
    desc: 'Simple, balanced 1,800 kcal meals for beginners starting a training routine.',
  },
  {
    slug: 'busy-professional-meal-plan-uk',
    title: 'Busy Professional Meal Plan',
    desc: 'Under 20 minutes per meal. Calorie-controlled, batch-cook friendly.',
  },
  {
    slug: 'cheap-high-protein-meal-plan-uk',
    title: 'Cheap High Protein Meal Plan',
    desc: 'Maximum protein per pound — built around the cheapest UK protein sources.',
  },
  // Supermarket
  {
    slug: 'aldi-1800-calorie-meal-plan',
    title: 'Aldi 1800 Calorie Meal Plan',
    desc: 'A full 7-day plan using Aldi own-brand staples — typically £35–45 for the week.',
  },
  {
    slug: 'tesco-low-calorie-meal-plan',
    title: 'Tesco Low Calorie Meal Plan',
    desc: 'Tesco-friendly ingredients with Clubcard-price staples and a full shopping list.',
  },
  {
    slug: 'lidl-1800-calorie-meal-plan',
    title: 'Lidl 1800 Calorie Meal Plan',
    desc: 'Lidl\'s own-brand range is among the cheapest for high-protein eating in the UK.',
  },
  {
    slug: 'iceland-budget-meal-plan',
    title: 'Iceland Budget Meal Plan',
    desc: 'Frozen protein staples from Iceland — a full week under £30.',
  },
  // Diet type
  {
    slug: 'vegetarian-low-calorie-meal-plan',
    title: 'Vegetarian Low Calorie Plan',
    desc: 'Plant-forward meals with protein from eggs, dairy, tofu, and legumes.',
  },
  {
    slug: 'high-protein-vegetarian-meal-plan-uk',
    title: 'High Protein Vegetarian Plan',
    desc: 'Vegetarian meals hitting 130g+ protein daily — no meat required.',
  },
];

const EXAMPLE_7_DAY_PLAN = [
  {
    day: 'Monday',
    meals: [
      { type: 'Breakfast', name: 'Oat Porridge with Berries & Greek Yogurt', kcal: 390, protein: 18, prep: '8 min' },
      { type: 'Lunch', name: 'Grilled Chicken, Brown Rice & Roasted Peppers', kcal: 520, protein: 45, prep: '20 min' },
      { type: 'Dinner', name: 'Baked Salmon, Sweet Potato Wedges & Steamed Broccoli', kcal: 580, protein: 40, prep: '25 min' },
      { type: 'Snack', name: 'Low-Fat Greek Yogurt with Mixed Berries', kcal: 230, protein: 16, prep: '2 min' },
    ],
    totals: { kcal: 1720, protein: 119 },
  },
  {
    day: 'Tuesday',
    meals: [
      { type: 'Breakfast', name: 'Scrambled Eggs on Wholemeal Toast with Spinach', kcal: 370, protein: 24, prep: '10 min' },
      { type: 'Lunch', name: 'Tuna & Sweetcorn Jacket Potato', kcal: 460, protein: 36, prep: '12 min' },
      { type: 'Dinner', name: 'Turkey Mince Bolognese with Wholemeal Pasta', kcal: 640, protein: 46, prep: '25 min' },
      { type: 'Snack', name: 'Apple & 20g Almonds', kcal: 260, protein: 7, prep: '1 min' },
    ],
    totals: { kcal: 1730, protein: 113 },
  },
  {
    day: 'Wednesday',
    meals: [
      { type: 'Breakfast', name: 'Overnight Oats with Chia Seeds, Peanut Butter & Banana', kcal: 430, protein: 16, prep: '5 min' },
      { type: 'Lunch', name: 'Grilled Chicken Caesar Salad Wrap (wholemeal)', kcal: 480, protein: 38, prep: '10 min' },
      { type: 'Dinner', name: 'Lean Beef Stir-Fry with Brown Rice & Frozen Veg', kcal: 590, protein: 44, prep: '20 min' },
      { type: 'Snack', name: 'Cottage Cheese with Cucumber (150g)', kcal: 230, protein: 22, prep: '2 min' },
    ],
    totals: { kcal: 1730, protein: 120 },
  },
  {
    day: 'Thursday',
    meals: [
      { type: 'Breakfast', name: 'Scrambled Eggs with Smoked Salmon on Wholemeal Toast', kcal: 420, protein: 34, prep: '10 min' },
      { type: 'Lunch', name: 'Red Lentil & Vegetable Soup with Wholemeal Roll', kcal: 400, protein: 18, prep: '10 min' },
      { type: 'Dinner', name: 'Chicken Tikka with Cauliflower Rice & Raita', kcal: 610, protein: 52, prep: '25 min' },
      { type: 'Snack', name: 'Banana & 1 tbsp Peanut Butter', kcal: 310, protein: 9, prep: '2 min' },
    ],
    totals: { kcal: 1740, protein: 113 },
  },
  {
    day: 'Friday',
    meals: [
      { type: 'Breakfast', name: 'Porridge with Walnuts, Cinnamon & Skimmed Milk', kcal: 390, protein: 14, prep: '5 min' },
      { type: 'Lunch', name: 'King Prawn & Avocado Salad with Lemon Dressing', kcal: 420, protein: 28, prep: '10 min' },
      { type: 'Dinner', name: 'Baked Cod with New Potatoes & Green Beans', kcal: 620, protein: 48, prep: '25 min' },
      { type: 'Snack', name: 'High-Protein Yogurt Pot with Berries', kcal: 280, protein: 22, prep: '2 min' },
    ],
    totals: { kcal: 1710, protein: 112 },
  },
  {
    day: 'Saturday',
    meals: [
      { type: 'Breakfast', name: 'Wholemeal Pancakes with Berries & Low-Fat Yogurt', kcal: 420, protein: 20, prep: '15 min' },
      { type: 'Lunch', name: 'Turkey & Avocado Wholemeal Wrap with Spinach', kcal: 440, protein: 34, prep: '5 min' },
      { type: 'Dinner', name: 'Grilled Lean Sirloin Steak, Roasted Veg & Brown Rice', kcal: 620, protein: 48, prep: '20 min' },
      { type: 'Snack', name: 'Carrot Sticks with 40g Reduced-Fat Hummus', kcal: 200, protein: 6, prep: '2 min' },
    ],
    totals: { kcal: 1680, protein: 108 },
  },
  {
    day: 'Sunday',
    meals: [
      { type: 'Breakfast', name: 'Poached Eggs & Smoked Salmon on Wholemeal Toast', kcal: 420, protein: 32, prep: '10 min' },
      { type: 'Lunch', name: 'Lentil & Roasted Vegetable Soup with Wholemeal Roll', kcal: 390, protein: 18, prep: '10 min' },
      { type: 'Dinner', name: 'Roast Chicken Breast with Potatoes, Carrots & Greens', kcal: 660, protein: 52, prep: '50 min' },
      { type: 'Snack', name: 'Oat Biscuits with Low-Fat Cottage Cheese (100g)', kcal: 280, protein: 14, prep: '3 min' },
    ],
    totals: { kcal: 1750, protein: 116 },
  },
];

const EXAMPLE_SHOPPING_LIST = [
  {
    group: 'Protein',
    items: [
      'Chicken breast (1 kg)',
      'Tinned tuna in spring water (4 × 145g cans)',
      'Eggs (12)',
      'Low-fat Greek yogurt (2 × 500g)',
      'Salmon fillets (2)',
      'Turkey mince, lean (500g)',
      'Smoked salmon slices (100g)',
      'Low-fat cottage cheese (300g)',
    ],
  },
  {
    group: 'Carbohydrates',
    items: [
      'Rolled oats (1 kg)',
      'Wholemeal bread (800g loaf)',
      'Brown rice (500g)',
      'Wholemeal pasta (500g)',
      'Sweet potatoes (1 kg)',
      'New potatoes (500g)',
      'Wholemeal tortilla wraps (8-pack)',
    ],
  },
  {
    group: 'Fruit & vegetables',
    items: [
      'Frozen mixed vegetables (1 kg)',
      'Frozen mixed berries (500g)',
      'Broccoli (500g)',
      'Baby spinach (200g bag)',
      'Mixed peppers (3)',
      'Carrots (750g)',
      'Cucumber (2)',
      'Cherry tomatoes (400g)',
      'Bananas (5–6)',
      'Apples (6)',
      'Avocado (1)',
    ],
  },
  {
    group: 'Dairy & fridge',
    items: [
      'Semi-skimmed or skimmed milk (2L)',
      'Reduced-fat hummus (200g)',
    ],
  },
  {
    group: 'Store cupboard',
    items: [
      'Olive oil (500ml)',
      'Natural peanut butter (340g)',
      'Low-sodium soy sauce',
      'Mixed herbs & spices',
      'Garlic (1 bulb)',
      'Lemons (2)',
      'Honey (small jar)',
      'Red lentils (500g)',
      'Tinned chickpeas or kidney beans (2 cans)',
    ],
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
  const loadingRef = useRef(null);
  const planRef = useRef(null);

  useEffect(() => {
    if (loading) {
      progressRef.current = 0;
      setProgress(0);
      setMsgIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));

      setTimeout(() => {
        loadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);

      progressInterval.current = setInterval(() => {
        const next = progressRef.current + (90 - progressRef.current) * 0.045;
        progressRef.current = next;
        setProgress(next);
      }, 300);

      msgInterval.current = setInterval(() => {
        setMsgIndex(() => Math.floor(Math.random() * LOADING_MESSAGES.length));
      }, 5000);
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

  useEffect(() => {
    if (plan?.weekly_plan && planRef.current) {
      setTimeout(() => {
        planRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
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
        title="Free UK Meal Plan Generator | Personalised by Calories, Supermarket & Diet"
        description="Generate a free 7-day UK meal plan in 30 seconds. Set your calorie target, preferred supermarket (Tesco, Aldi, Lidl, Asda), protein goal, and dietary preference. High-protein plans, shopping list included."
        canonical="/"
        jsonLd={homeJsonLd}
      />

      <div className="page">
        <header className="header">
          <h1>Free UK Meal Plans for Weight Loss — By Calories, Budget &amp; Supermarket</h1>
          <p>Tell us your calorie target, cooking time, and favourite UK supermarket. Get a complete 7-day meal plan with high-protein meals, prep times, and a grouped shopping list — in under 30 seconds. Free, no sign-up.</p>
          <div className="trust-row">
            <span className="trust-badge">1500–2500 kcal plans</span>
            <span className="trust-badge">Tesco · Aldi · Lidl · Asda · Morrisons</span>
            <span className="trust-badge">High-protein &amp; budget options</span>
            <span className="trust-badge">Free forever, no sign-up</span>
          </div>
          <p className="hero-secondary-cta">
            Already know what you want? <a href="#popular-plans">Browse ready-made plans ↓</a>
          </p>
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
            <a
              href="https://ebay.us/m/w68ZOg"
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="ad-card"
            >
              <span className="ad-label">Sponsored</span>
              <img src="/meal-stickers-ad.png" alt="Meal prep starter kit sticker set" className="ad-card-img" />
              <div className="ad-card-body">
                <strong className="ad-card-title">Meal Prep Starter Kit</strong>
                <p>Labels, portion trackers, and weekly planner stickers to keep your meal prep organised and stress-free.</p>
                <span className="ad-card-cta">Shop on eBay &rarr;</span>
              </div>
            </a>
          </aside>
        </div>

        {(loading || progress > 0) && (
          <div className="loading" ref={loadingRef}>
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

        <p className="disclaimer">
          Meal plans are generated for general information only. Calories and protein are estimates. For medical conditions, pregnancy, eating disorders, or clinical dietary needs, speak to a qualified healthcare professional.
        </p>

        {/* ── Generator feature sections ── */}
        <section className="generator-features">
          <h2>How it works</h2>
          <div className="how-it-works-steps">
            <div className="hiw-step">
              <div className="hiw-step-num">1</div>
              <h3>Set your targets</h3>
              <p>Enter your calorie goal, meals per day, and dietary preference.</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-step-num">2</div>
              <h3>Pick your supermarket</h3>
              <p>Choose Tesco, Aldi, Lidl, Asda, Sainsbury's, Morrisons, or Iceland.</p>
            </div>
            <div className="hiw-step">
              <div className="hiw-step-num">3</div>
              <h3>Get your plan</h3>
              <p>Your complete 7-day plan with meals, macros, and a shopping list appears in under 30 seconds.</p>
            </div>
          </div>

          <h2>What you can personalise</h2>
          <div className="personalise-grid">
            <div className="personalise-item">
              <span className="personalise-item-icon">🔥</span> Calorie target (800–4,000 kcal)
            </div>
            <div className="personalise-item">
              <span className="personalise-item-icon">🛒</span> UK supermarket preference
            </div>
            <div className="personalise-item">
              <span className="personalise-item-icon">🥩</span> Protein focus (standard or high)
            </div>
            <div className="personalise-item">
              <span className="personalise-item-icon">🥦</span> Vegetarian or vegan diet
            </div>
            <div className="personalise-item">
              <span className="personalise-item-icon">⏱️</span> Max cooking time per meal
            </div>
            <div className="personalise-item">
              <span className="personalise-item-icon">🚫</span> Foods to avoid or include
            </div>
            <div className="personalise-item">
              <span className="personalise-item-icon">📅</span> Plan length (1, 3, or 7 days)
            </div>
            <div className="personalise-item">
              <span className="personalise-item-icon">🛍️</span> Grouped shopping list with cost estimate
            </div>
          </div>

          <div className="popular-starts">
            <h3>Popular starting points</h3>
            <div className="popular-start-links">
              <Link to="/meal-plan/high-protein-low-calorie-meal-plan" className="popular-start-link">High protein fat loss plan</Link>
              <Link to="/meal-plan/tesco-low-calorie-meal-plan" className="popular-start-link">Tesco low calorie plan</Link>
              <Link to="/meal-plan/1800-calorie-meal-plan" className="popular-start-link">1800 calorie plan</Link>
              <Link to="/meal-plan/2000-calorie-meal-plan" className="popular-start-link">2000 calorie plan</Link>
              <Link to="/meal-plan/cheap-student-meal-plan-uk" className="popular-start-link">Budget meal prep plan</Link>
              <Link to="/meal-plan/high-protein-vegetarian-meal-plan-uk" className="popular-start-link">Vegetarian high protein plan</Link>
              <Link to="/meal-plan/aldi-1800-calorie-meal-plan" className="popular-start-link">Aldi 1800 cal plan</Link>
              <Link to="/meal-plan/budget-bodybuilding-meal-plan-uk" className="popular-start-link">Budget bodybuilding plan</Link>
            </div>
          </div>
        </section>

        {/* ── Popular Plans Hub ── */}
        <section className="plans-hub" id="popular-plans">
          <h2>Explore Ready-Made UK Meal Plans</h2>
          <p>Not sure where to start? Browse our pre-built plans by calorie target, budget, or dietary preference — all free, no generator needed.</p>
          <div className="plan-cards">
            {PLAN_CARDS.map(p => (
              <Link key={p.slug} to={`/meal-plan/${p.slug}`} className="plan-card">
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <div ref={planRef}>
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
        </div>

        {/* ── SEO Content ── */}
        <section className="seo-content">

          <div className="seo-section">
            <h2>What is a UK Meal Plan Generator?</h2>
            <p>
              A UK meal plan generator takes your personal preferences — daily calorie target, dietary requirements,
              preferred supermarket, and foods you love or want to avoid — and produces a complete weekly meal plan in seconds.
              Our free meal plan generator is powered by AI and designed specifically for UK shoppers at Tesco, Aldi,
              Sainsbury&apos;s, and Asda, so every ingredient on your plan is easy to find and affordable.
            </p>
            <p>
              Unlike generic calorie calculators, our tool creates a structured day-by-day plan with named meals,
              calorie counts, protein targets, and prep times. It also generates a categorised shopping list with an
              estimated weekly cost in GBP, making it easier than ever to stick to a budget while eating healthily.
            </p>
          </div>

          <div className="seo-section">
            <h2>How to Create Your Free UK Weight Loss Meal Plan</h2>
            <p>Getting started takes less than a minute:</p>
            <ol>
              <li><strong>Set your plan length.</strong> Choose a 1-day, 3-day, or 7-day plan.</li>
              <li><strong>Enter your daily calorie target.</strong> Not sure? A common starting point for weight loss is 1,500–1,800 calories. Use our <Link to="/blog/how-to-build-a-calorie-deficit">calorie deficit guide</Link> to calculate yours.</li>
              <li><strong>Choose your meals per day</strong> and dietary preference — standard, vegetarian, or vegan.</li>
              <li><strong>Use Advanced options</strong> to pick your supermarket, max cooking time, and any foods to include or avoid.</li>
              <li>Click <em>Get My 7-Day Meal Plan</em> — your personalised plan and shopping list appear in under 30 seconds.</li>
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

          {/* ── Full 7-Day Example Plan ── */}
          <div className="seo-section seo-example">
            <h2>Example 7-Day 1800 Calorie Meal Plan UK</h2>
            <p>
              Below is a full 7-day example of an 1,800 calorie meal plan using common UK supermarket ingredients —
              oats, chicken breast, eggs, salmon, tuna, lentils, sweet potatoes, and frozen vegetables.
              Calorie and protein figures are estimates; weigh ingredients for precision.
            </p>
            <div className="example-plan">
              {EXAMPLE_7_DAY_PLAN.map((day, i) => (
                <div key={i} className="plan-day-card">
                  <h3>{day.day}</h3>
                  {day.meals.map((meal, j) => (
                    <div key={j} className="plan-meal">
                      <div className="plan-meal-header">
                        <span className="meal-type">{meal.type}</span>
                        <span className="plan-meal-name">{meal.name}</span>
                        <span className="plan-meal-meta">{meal.kcal} kcal &middot; {meal.protein}g protein &middot; {meal.prep}</span>
                      </div>
                    </div>
                  ))}
                  <div className="plan-day-total">
                    ~{day.totals.kcal} kcal &nbsp;&middot;&nbsp; ~{day.totals.protein}g protein
                  </div>
                </div>
              ))}
            </div>
            <p className="example-cta">
              Want a plan that matches your diet and supermarket?{' '}
              <a href="#top" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Generate your personalised version above.
              </a>
            </p>
          </div>

          {/* ── Example Shopping List ── */}
          <div className="seo-section">
            <h2>Example UK Shopping List for a Low-Calorie Meal Plan</h2>
            <p>
              A well-organised shopping list makes the biggest difference to sticking to a meal plan.
              Here is an example weekly shop based on the 1,800 calorie plan above, grouped by category.
            </p>
            <div className="home-shopping-grid">
              {EXAMPLE_SHOPPING_LIST.map(section => (
                <div key={section.group} className="home-shopping-group">
                  <h4>{section.group}</h4>
                  <ul>
                    {section.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '8px' }}>
              Estimated cost: around £35–£50 for one person depending on supermarket, brands, and portion sizes.
            </p>
          </div>

          <div className="seo-section">
            <h2>Popular UK Meal Plan Types</h2>
            <p>Browse our ready-made example plans for the most popular calorie targets and dietary goals:</p>
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
              Our generator supports all major UK supermarkets. Select yours and every ingredient will be tailored to
              products you can actually find in a single weekly shop:
            </p>
            <ul>
              <li><strong>Tesco</strong> — UK&apos;s largest supermarket. Huge own-brand range; Clubcard Prices regularly cut chicken, fish, and dairy. See our <Link to="/meal-plan/tesco-low-calorie-meal-plan">Tesco low-calorie plan</Link> and <Link to="/blog/tesco-low-calorie-shopping-list">Tesco shopping list</Link>.</li>
              <li><strong>Aldi</strong> — consistently cheapest for staples like chicken, eggs, oats, and frozen veg. See our <Link to="/meal-plan/aldi-1800-calorie-meal-plan">Aldi 1800 calorie plan</Link>.</li>
              <li><strong>Lidl</strong> — similar value to Aldi with slightly better fresh fish availability. See our <Link to="/meal-plan/lidl-1800-calorie-meal-plan">Lidl 1800 calorie plan</Link>.</li>
              <li><strong>Asda</strong> — budget-friendly and widely stocked, particularly good for bulk protein and carbs. See our <Link to="/meal-plan/asda-1800-calorie-meal-plan">Asda 1800 calorie plan</Link>.</li>
              <li><strong>Sainsbury&apos;s</strong> — strong fresh produce and free-from range. See our <Link to="/meal-plan/sainsburys-1800-calorie-meal-plan">Sainsbury&apos;s 1800 calorie plan</Link>.</li>
              <li><strong>Morrisons</strong> — Market Street butcher counter and good own-brand staples. See our <Link to="/meal-plan/morrisons-1800-calorie-meal-plan">Morrisons 1800 calorie plan</Link>.</li>
              <li><strong>Iceland</strong> — best frozen protein range in the UK. A full week under £30 is achievable. See our <Link to="/meal-plan/iceland-budget-meal-plan">Iceland budget meal plan</Link>.</li>
            </ul>
            <p>
              Not sure which supermarket wins on price? Read our <Link to="/blog/aldi-vs-tesco-meal-prep">Aldi vs Tesco comparison</Link> or the full <Link to="/blog/cheapest-uk-supermarket-meal-prep">cheapest UK supermarket for meal prep</Link> guide.
            </p>
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

          <div className="cta-box" style={{ marginTop: '32px' }}>
            <strong>Batch cooking this week?</strong>{' '}
            <Link to="/stickers" data-event="sticker_promo_click" data-source-page="home">
              Keep portions organised with freezer-safe meal prep labels &rarr;
            </Link>
          </div>

          <h2>Further Reading</h2>
          <ul className="plan-links">
            <li><Link to="/blog/how-to-build-a-calorie-deficit">How to Build a Calorie Deficit for Sustainable Weight Loss</Link></li>
            <li><Link to="/blog/how-many-calories-to-lose-weight">How Many Calories Do You Need to Lose Weight?</Link></li>
            <li><Link to="/blog/1500-vs-1800-vs-2000-calories">1500 vs 1800 vs 2000 Calories: Which Meal Plan Should You Choose?</Link></li>
            <li><Link to="/blog/how-much-protein-when-dieting">How Much Protein Do You Need When Dieting?</Link></li>
            <li><Link to="/blog/best-low-calorie-foods-uk">The Best Low Calorie Foods Available in UK Supermarkets</Link></li>
            <li><Link to="/blog/best-cheap-high-protein-foods-uk">Best Cheap High-Protein Foods in UK Supermarkets</Link></li>
            <li><Link to="/blog/high-protein-low-calorie-meals">High Protein Low Calorie Meals for UK Weight Loss</Link></li>
            <li><Link to="/blog/tesco-low-calorie-shopping-list">The Ultimate Tesco Low Calorie Shopping List</Link></li>
            <li><Link to="/blog/cheap-meal-prep-shopping-list-uk">Cheap Meal Prep Shopping List UK — Under £30 for a Full Week</Link></li>
            <li><Link to="/blog/aldi-vs-tesco-meal-prep">Aldi vs Tesco for Meal Prep: Which Supermarket Is Better?</Link></li>
            <li><Link to="/blog/cheapest-uk-supermarket-meal-prep">Cheapest UK Supermarket for Meal Prep: Full 2025 Comparison</Link></li>
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
