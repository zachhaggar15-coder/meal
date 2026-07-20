import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PopularSearches from '../components/PopularSearches.jsx';
import { BUDGET_CONTAINERS, MEAL_PREP_STICKERS, MID_RANGE_CONTAINERS } from '../data/offers.js';
import { buildBrowsePlanUrl } from '../data/planChooser.js';
import { CONTAINER_TIER_COPY, getContainerRecommendation } from '../utils/containerSetup.js';
import { toTitleCase } from '../utils/textFormatting.js';
import {
  PROTEIN_FOODS,
  PRICE_CHECKED_DATE,
  costPerProteinTarget,
  costPerServingPence,
  formatPenceRange,
  getProteinFood,
  kcalPerServing,
  proteinPerServing,
} from '../data/proteinValueData.js';

const ACTIVITY = {
  sedentary: { label: 'Mostly desk based', factor: 1.2 },
  light: { label: 'Lightly active', factor: 1.375 },
  moderate: { label: 'Moderately active', factor: 1.55 },
  very: { label: 'Very active', factor: 1.725 },
};

const GOAL_ADJUSTMENT = {
  fatLoss: { label: 'Fat loss', adjustment: -450 },
  slowLoss: { label: 'Slow fat loss', adjustment: -250 },
  maintain: { label: 'Maintenance', adjustment: 0 },
  gain: { label: 'Muscle gain', adjustment: 350 },
};

const PLAN_CALORIES = [1400, 1500, 1600, 1800, 2000, 2200, 2500, 3000, 3500];

const MARKET_BASKET_BASE = {
  any: { label: 'Generic UK supermarket', base: 42 },
  aldi: { label: 'Aldi', base: 34 },
  lidl: { label: 'Lidl', base: 35 },
  tesco: { label: 'Tesco', base: 43 },
  asda: { label: 'Asda', base: 41 },
  sainsburys: { label: "Sainsbury's", base: 48 },
  morrisons: { label: 'Morrisons', base: 45 },
  iceland: { label: 'Iceland', base: 37 },
  waitrose: { label: 'Waitrose', base: 55 },
  ocado: { label: 'Ocado', base: 53 },
  'marks-spencer': { label: 'M&S', base: 57 },
  coop: { label: 'Co-op', base: 47 },
};

const DEFAULT_FRIDGE_ROWS = [
  { id: 1, name: '', quantity: '' },
];

const DINNER_TEMPLATES = [
  {
    id: 'chicken-rice-bowl',
    name: 'High-protein chicken rice bowl',
    baseKcal: 640,
    baseProtein: 48,
    prep: '18 min',
    sourcePlan: '/plans/aldi-high-protein-low-cal-1500',
    sourceLabel: 'Aldi high-protein low-calorie plan',
    keywords: ['chicken', 'turkey', 'rice', 'pepper', 'spinach', 'broccoli', 'beans', 'sweetcorn'],
    staples: ['Soy sauce 1 tbsp', 'Greek yogurt 2 tbsp', 'Lemon juice 1 tsp'],
    desc: 'A fast bowl built from lean protein, a measured carb portion and whatever veg is already open.',
    recipe: [
      'Slice the protein and cook it in a hot pan with salt, pepper and soy sauce.',
      'Warm the rice or potato portion and fold through the veg until hot.',
      'Top with yogurt, lemon juice and any chilli flakes you like.',
    ],
  },
  {
    id: 'tuna-pasta-salad',
    name: 'Tuna pasta protein salad',
    baseKcal: 590,
    baseProtein: 42,
    prep: '12 min',
    sourcePlan: '/meal-plans/high-protein-shopping-list',
    sourceLabel: 'high-protein shopping list plan',
    keywords: ['tuna', 'salmon', 'pasta', 'sweetcorn', 'cucumber', 'tomato', 'yogurt', 'lettuce'],
    staples: ['Light mayo or yogurt 1 tbsp', 'Lemon juice 1 tsp', 'Black pepper'],
    desc: 'A cold or warm dinner that turns tins, leftover pasta and salad veg into a filling high-protein plate.',
    recipe: [
      'Cook or warm the pasta portion, then drain well.',
      'Mix tuna with yogurt or light mayo, lemon juice and black pepper.',
      'Toss with chopped veg and serve with extra salad leaves if you have them.',
    ],
  },
  {
    id: 'egg-potato-frittata',
    name: 'Egg, potato and veg frittata',
    baseKcal: 560,
    baseProtein: 34,
    prep: '20 min',
    sourcePlan: '/meal-plans/vegetarian',
    sourceLabel: 'vegetarian meal plan hub',
    keywords: ['egg', 'eggs', 'potato', 'cheese', 'spinach', 'mushroom', 'pepper', 'onion'],
    staples: ['Eggs 3', 'Milk 30ml', 'Cheddar 20g'],
    desc: 'A cheap skillet dinner for eggs, leftover potato and veg that needs using up.',
    recipe: [
      'Fry the veg and cooked potato until browned at the edges.',
      'Whisk eggs with milk, salt and pepper, then pour into the pan.',
      'Scatter over cheese and cook gently until set, finishing under the grill if needed.',
    ],
  },
  {
    id: 'bean-chilli',
    name: 'Bean and tomato chilli bowl',
    baseKcal: 620,
    baseProtein: 31,
    prep: '22 min',
    sourcePlan: '/meal-plans/budget-shopping-list',
    sourceLabel: 'budget shopping list plan',
    keywords: ['beans', 'kidney', 'chickpea', 'lentil', 'tomato', 'rice', 'quorn', 'mince', 'pepper'],
    staples: ['Chopped tomatoes 200g', 'Chilli powder 1 tsp', 'Rice 120g cooked'],
    desc: 'A budget dinner that leans on beans, tomatoes and a measured rice portion.',
    recipe: [
      'Simmer beans, tomatoes, chopped veg and chilli powder for 12 to 15 minutes.',
      'Add mince, Quorn or lentils if you have them and cook until piping hot.',
      'Serve over rice with yogurt or grated cheese if it fits your target.',
    ],
  },
  {
    id: 'tofu-stir-fry',
    name: 'Tofu noodle stir-fry',
    baseKcal: 610,
    baseProtein: 36,
    prep: '16 min',
    sourcePlan: '/meal-plans/vegan',
    sourceLabel: 'vegan meal plan hub',
    keywords: ['tofu', 'noodles', 'rice', 'broccoli', 'carrot', 'pepper', 'edamame', 'cabbage'],
    staples: ['Soy sauce 1 tbsp', 'Peanut butter 1 tsp', 'Garlic 1 clove'],
    desc: 'A plant-based dinner that uses tofu, noodles or rice and crunchy fridge veg.',
    recipe: [
      'Press and cube the tofu, then fry until golden.',
      'Add sliced veg and stir-fry on a high heat for 3 to 4 minutes.',
      'Toss through noodles or rice with soy sauce, garlic and a little peanut butter.',
    ],
  },
  {
    id: 'wrap-pizza',
    name: 'Loaded wrap pizza',
    baseKcal: 540,
    baseProtein: 33,
    prep: '10 min',
    sourcePlan: '/meal-plans/low-calorie-shopping-list',
    sourceLabel: 'low-calorie shopping list plan',
    keywords: ['wrap', 'tortilla', 'cheese', 'ham', 'chicken', 'tomato', 'pepper', 'mushroom'],
    staples: ['Tortilla wrap 1', 'Passata 3 tbsp', 'Mozzarella 40g'],
    desc: 'A quick low-effort dinner for wraps, passata, cheese and leftover protein or veg.',
    recipe: [
      'Spread passata over the wrap and add sliced toppings.',
      'Scatter over cheese and season with pepper and mixed herbs.',
      'Bake or air-fry until the edges are crisp and the cheese has melted.',
    ],
  },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'UK Meal Prep Calculators',
    url: 'https://www.mealprep.org.uk/tools',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    description: 'Free UK meal prep tools for fridge dinner ideas, calorie targets, protein targets, shopping budgets, protein value comparison and meal prep container planning.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I print a meal plan after using these tools?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Choose a matching plan, then use the export or print PDF section on the plan page to print the full week and shopping list.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the fridge dinner tool work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It runs in the browser, matches your ingredients and calorie target against premade meal-prep recipe patterns, then returns three dinner ideas that can optionally be edited with AI.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are the calculator results medical advice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The tools provide general planning estimates only. Calorie and protein needs vary by person, health status and activity.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are the protein value comparator prices live supermarket prices?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The comparator uses representative UK price ranges checked against real supermarket listings, not a live pricing feed. Prices vary by retailer, pack size, brand and promotion, so use the tool for relative comparison rather than an exact quote.',
        },
      },
    ],
  },
];

export default function ToolsPage() {
  const location = useLocation();
  const [sex, setSex] = useState('female');
  const [age, setAge] = useState(35);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(75);
  const [activity, setActivity] = useState('moderate');
  const [goal, setGoal] = useState('fatLoss');

  const [proteinWeight, setProteinWeight] = useState(75);
  const [proteinGoal, setProteinGoal] = useState('fatLoss');

  const [prepDays, setPrepDays] = useState(5);
  const [mealsPerDay, setMealsPerDay] = useState(2);
  const [spareContainers, setSpareContainers] = useState(2);
  const [containerUseCase, setContainerUseCase] = useState('work');
  const [containerMaterial, setContainerMaterial] = useState('either');
  const [containerBudget, setContainerBudget] = useState('mid');

  const [market, setMarket] = useState('any');
  const [people, setPeople] = useState(1);
  const [shopDays, setShopDays] = useState(7);
  const [highProtein, setHighProtein] = useState(true);

  const [proteinCompareIds, setProteinCompareIds] = useState([
    'chicken-breast', 'eggs', 'greek-yogurt', 'tinned-tuna',
  ]);
  const [proteinTargetG, setProteinTargetG] = useState(30);

  const [fridgeRows, setFridgeRows] = useState(DEFAULT_FRIDGE_ROWS);
  const [dinnerCalories, setDinnerCalories] = useState(650);
  const [dinnerOptions, setDinnerOptions] = useState([]);
  const [aiPrompts, setAiPrompts] = useState({});
  const [aiStatus, setAiStatus] = useState({ id: '', message: '', busy: false });

  useEffect(() => {
    if (!location.hash) return;

    const target = document.getElementById(location.hash.slice(1));
    if (!target) return;

    window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }, 0);
  }, [location.hash]);

  const calorieResult = useMemo(() => {
    const bmr = sex === 'male'
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161;
    const tdee = Math.round(bmr * ACTIVITY[activity].factor);
    const target = Math.max(1200, Math.round((tdee + GOAL_ADJUSTMENT[goal].adjustment) / 50) * 50);
    const nearestPlan = nearestCalories(target);
    return { tdee, target, nearestPlan };
  }, [age, activity, goal, height, sex, weight]);

  const proteinResult = useMemo(() => {
    const multiplier = proteinGoal === 'gain' ? [1.8, 2.2] : proteinGoal === 'maintain' ? [1.4, 1.8] : [1.6, 2.0];
    return {
      low: Math.round(proteinWeight * multiplier[0]),
      high: Math.round(proteinWeight * multiplier[1]),
    };
  }, [proteinGoal, proteinWeight]);

  const containerResult = Math.max(1, (prepDays * mealsPerDay) + spareContainers);
  const containerTier = getContainerRecommendation({
    containerCount: containerResult,
    budget: containerBudget,
    useCase: containerUseCase,
    material: containerMaterial,
    reheating: containerUseCase === 'microwave',
    alreadyPreps: prepDays >= 5 && mealsPerDay >= 2,
  });
  const containerCopy = CONTAINER_TIER_COPY[containerTier];
  const containerOffer = containerTier === 'budget'
    ? BUDGET_CONTAINERS
    : containerTier === 'premium'
      ? MEAL_PREP_STICKERS
      : MID_RANGE_CONTAINERS;
  const budgetResult = useMemo(() => {
    const base = MARKET_BASKET_BASE[market].base;
    const dayFactor = shopDays / 7;
    const proteinFactor = highProtein ? 1.14 : 1;
    const householdFactor = people === 1 ? 1 : (1 + ((people - 1) * 0.72));
    return Math.round(base * dayFactor * proteinFactor * householdFactor);
  }, [highProtein, market, people, shopDays]);

  const proteinCompareRows = useMemo(() => {
    const rows = proteinCompareIds
      .map(getProteinFood)
      .filter(Boolean)
      .map(food => {
        const cost = costPerServingPence(food);
        const target = costPerProteinTarget(food, proteinTargetG);
        return {
          food,
          proteinG: proteinPerServing(food),
          kcal: kcalPerServing(food),
          costServing: cost,
          targetCost: target,
        };
      });
    return [...rows].sort((a, b) => a.targetCost.low - b.targetCost.low);
  }, [proteinCompareIds, proteinTargetG]);

  const bestProteinValue = proteinCompareRows[0];

  function updateProteinCompareSlot(index, id) {
    setProteinCompareIds(ids => ids.map((current, i) => (i === index ? id : current)));
  }

  function updateFridgeRow(id, field, value) {
    setFridgeRows(rows => rows.map(row => (
      row.id === id ? { ...row, [field]: value } : row
    )));
  }

  function addFridgeRow() {
    const nextId = fridgeRows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    setFridgeRows(rows => [...rows, { id: nextId, name: '', quantity: '' }]);
  }

  function removeFridgeRow(id) {
    setFridgeRows(rows => rows.length <= 1 ? rows : rows.filter(row => row.id !== id));
  }

  function handleDinnerGenerate(event) {
    event.preventDefault();
    if (!normaliseFridgeRows(fridgeRows).length) {
      setDinnerOptions([]);
      setAiStatus({ id: '', message: 'Add at least one ingredient before building dinner ideas.', busy: false });
      return;
    }

    const options = generateDinnerOptions(fridgeRows, dinnerCalories);
    setDinnerOptions(options);
    setAiStatus({ id: '', message: 'Built three dinners from your current fridge list.', busy: false });
  }

  function updateAiPrompt(id, value) {
    setAiPrompts(prompts => ({ ...prompts, [id]: value }));
  }

  async function editDinnerWithAi(option) {
    const prompt = (aiPrompts[option.id] || '').trim();
    if (!prompt) {
      setAiStatus({ id: option.id, message: 'Add a short change first, such as make it vegetarian or lower calorie.', busy: false });
      return;
    }

    setAiStatus({ id: option.id, message: 'Asking AI to edit this dinner...', busy: true });

    try {
      const response = await fetch('/api/edit-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal: option, prompt }),
      });
      const data = await response.json();
      if (!response.ok || !data?.meal) {
        throw new Error(data?.error || 'Could not edit the meal.');
      }

      setDinnerOptions(options => options.map(item => (
        item.id === option.id
          ? {
              ...item,
              ...data.meal,
              id: item.id,
              sourcePlan: item.sourcePlan,
              sourceLabel: item.sourceLabel,
            }
          : item
      )));
      setAiStatus({ id: option.id, message: 'Updated this dinner with AI.', busy: false });
    } catch (error) {
      setAiStatus({
        id: option.id,
        message: error.message || 'AI edit is unavailable right now. The rule-based options still work locally.',
        busy: false,
      });
    }
  }

  return (
    <>
      <SEO
        title="Free UK Diet Plan Tools - Calorie, Protein, PDF & Shopping List Calculators | MealPrep.org.uk"
        description="Use free UK diet-plan tools for calorie targets, protein ranges, printable PDFs, shopping lists, supermarket budgets and meal prep containers."
        canonical="/tools"
        jsonLd={jsonLd}
      />

      <div className="content-page tools-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">Tools</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />
        <header className="tools-hero tools-hero--compact">
          <div className="tools-hero-copy">
            <span className="offer-kicker">{toTitleCase('Free meal prep calculators')}</span>
            <h1>UK Meal Prep Tools</h1>
            <p className="content-intro">
              Build dinner from what is already in your fridge, estimate a daily calorie target,
              check protein, plan your budget and jump to printable meal plans with shopping lists.
            </p>
          </div>
        </header>

        <section id="fridge-dinner-builder" className="fridge-tool-panel" aria-labelledby="fridge-dinner-heading">
          <div className="fridge-tool-copy">
            <span className="offer-kicker">{toTitleCase('Client-side dinner builder')}</span>
            <h2 id="fridge-dinner-heading">{toTitleCase('Turn fridge ingredients into dinner')}</h2>
            <p>
              Add ingredients and rough quantities, choose a calorie target, and the tool makes three dinners from
              rule-based premade recipe patterns. Each option links to a related plan or recipe hub, and you can ask AI
              to change one after it is made.
            </p>
          </div>

          <form className="fridge-tool-form" onSubmit={handleDinnerGenerate}>
            <div className="fridge-row-head" aria-hidden="true">
              <span>Ingredient</span>
              <span>Quantity</span>
              <span> </span>
            </div>
            <div className="fridge-rows">
              {fridgeRows.map((row, index) => (
                <div className="fridge-row" key={row.id}>
                  <input
                    aria-label={`Ingredient ${index + 1}`}
                    value={row.name}
                    onChange={event => updateFridgeRow(row.id, 'name', event.target.value)}
                    placeholder="Chicken breast"
                  />
                  <input
                    aria-label={`Quantity for ingredient ${index + 1}`}
                    value={row.quantity}
                    onChange={event => updateFridgeRow(row.id, 'quantity', event.target.value)}
                    placeholder="200g"
                  />
                  <button type="button" className="fridge-remove-btn" onClick={() => removeFridgeRow(row.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="fridge-tool-controls">
              <button type="button" className="btn-secondary" onClick={addFridgeRow}>Add ingredient</button>
              <NumberField
                label="Dinner target"
                value={dinnerCalories}
                onChange={setDinnerCalories}
                min={350}
                max={1200}
                suffix="kcal"
              />
              <button type="submit" className="btn-primary">Build dinners</button>
            </div>
          </form>

          {aiStatus.message && !aiStatus.id && (
            <p className="fridge-status" role="status">{aiStatus.message}</p>
          )}

          {dinnerOptions.length > 0 && (
            <div className="fridge-options" aria-live="polite">
              {dinnerOptions.map((option, index) => (
                <article className="fridge-option-card" key={option.id}>
                  <div className="fridge-option-head">
                    <span className="lime-tag">Option {index + 1}</span>
                    <span>{option.kcal} kcal</span>
                  </div>
                  <h3>{toTitleCase(option.name)}</h3>
                  <p>{option.desc}</p>
                  <div className="fridge-option-meta">
                    <span>{option.protein}g protein</span>
                    <span>{option.prep}</span>
                    <Link to={option.sourcePlan}>{toTitleCase(`Base recipe: ${option.sourceLabel}`)}</Link>
                  </div>
                  <details className="fridge-recipe">
                    <summary>View recipe and ingredients</summary>
                    <div className="fridge-recipe-grid">
                      <div>
                        <strong>Ingredients</strong>
                        <ul>
                          {asList(option.ingredients).map(item => <li key={item}>{item}</li>)}
                        </ul>
                      </div>
                      <div>
                        <strong>Steps</strong>
                        <ol>
                          {asList(option.recipe).map(step => <li key={step}>{step}</li>)}
                        </ol>
                      </div>
                    </div>
                  </details>
                  <div className="ai-edit-box">
                    <label>
                      <span>Edit this option with AI</span>
                      <textarea
                        value={aiPrompts[option.id] || ''}
                        onChange={event => updateAiPrompt(option.id, event.target.value)}
                        placeholder="Example: make it vegetarian and keep it under 550 kcal"
                        rows={3}
                      />
                    </label>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => editDinnerWithAi(option)}
                      disabled={aiStatus.busy}
                    >
                      {aiStatus.busy && aiStatus.id === option.id ? 'Editing...' : 'Edit with AI'}
                    </button>
                    {aiStatus.id === option.id && aiStatus.message && (
                      <p className="fridge-status" role="status">{aiStatus.message}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <PopularSearches
          title="Popular UK planning shortcuts"
          intro="Open the most useful plan hubs and buying guides after using the calculators."
          className="popular-searches--tools"
        />

        <div className="tools-grid">
          <section id="calorie-calculator" className="tool-panel">
            <h2>Calorie Target Calculator</h2>
            <div className="tool-fields tool-fields--two">
              <Select label="Sex" value={sex} onChange={setSex} options={[['female', 'Female'], ['male', 'Male']]} />
              <NumberField label="Age" value={age} onChange={setAge} min={18} max={90} suffix="years" />
              <NumberField label="Height" value={height} onChange={setHeight} min={130} max={220} suffix="cm" />
              <NumberField label="Weight" value={weight} onChange={setWeight} min={40} max={220} suffix="kg" />
              <Select label="Activity" value={activity} onChange={setActivity} options={Object.entries(ACTIVITY).map(([key, item]) => [key, item.label])} />
              <Select label="Goal" value={goal} onChange={setGoal} options={Object.entries(GOAL_ADJUSTMENT).map(([key, item]) => [key, item.label])} />
            </div>
            <ResultBlock
              title={`${calorieResult.target.toLocaleString('en-GB')} kcal/day`}
              lines={[
                `Estimated maintenance: ${calorieResult.tdee.toLocaleString('en-GB')} kcal/day`,
                `Closest plan filter: ${calorieResult.nearestPlan.toLocaleString('en-GB')} kcal`,
              ]}
            />
            <Link className="btn-primary" to={buildBrowsePlanUrl({ calories: calorieResult.nearestPlan })}>
              Browse matching plans
            </Link>
          </section>

          <section id="protein-calculator" className="tool-panel">
            <h2>Protein Target Calculator</h2>
            <div className="tool-fields">
              <NumberField label="Body weight" value={proteinWeight} onChange={setProteinWeight} min={40} max={220} suffix="kg" />
              <Select
                label="Main goal"
                value={proteinGoal}
                onChange={setProteinGoal}
                options={[['fatLoss', 'Fat loss'], ['maintain', 'Maintenance'], ['gain', 'Muscle gain']]}
              />
            </div>
            <ResultBlock
              title={`${proteinResult.low}-${proteinResult.high}g protein/day`}
              lines={[
                'Spread protein across breakfast, lunch, dinner and snacks.',
                'High-protein plans are easiest when the weekly shop includes eggs, yogurt, fish, chicken, tofu, beans or lentils.',
              ]}
            />
            <Link className="btn-primary" to={buildBrowsePlanUrl({ goal: proteinGoal === 'gain' ? 'muscle-gain' : 'high-protein-low-cal' })}>
              Browse high protein plans
            </Link>
          </section>

          <section id="container-count-calculator" className="tool-panel">
            <h2>Container Count Recommender</h2>
            <div className="tool-fields">
              <NumberField label="Prep days" value={prepDays} onChange={setPrepDays} min={1} max={7} suffix="days" />
              <NumberField label="Meals per day" value={mealsPerDay} onChange={setMealsPerDay} min={1} max={4} suffix="meals" />
              <NumberField label="Spares" value={spareContainers} onChange={setSpareContainers} min={0} max={10} suffix="extra" />
              <Select
                label="Main use"
                value={containerUseCase}
                onChange={setContainerUseCase}
                options={[
                  ['work', 'Work lunches'],
                  ['microwave', 'Reheating meals'],
                  ['freezer', 'Freezer batches'],
                  ['commute', 'Commuting'],
                ]}
              />
              <Select
                label="Material"
                value={containerMaterial}
                onChange={setContainerMaterial}
                options={[
                  ['either', 'Either'],
                  ['plastic', 'Plastic'],
                  ['glass', 'Glass'],
                ]}
              />
              <Select
                label="Budget"
                value={containerBudget}
                onChange={setContainerBudget}
                options={[
                  ['low', 'Lowest cost'],
                  ['mid', 'Best value'],
                  ['premium', 'Buy once'],
                ]}
              />
            </div>
            <ResultBlock
              title={`${containerResult} containers`}
              lines={[
                `${containerCopy.label}: ${containerCopy.fit}`,
                containerCopy.setup,
              ]}
            />
            <div className="tool-action-row">
              <a
                className="btn-primary"
                href={containerOffer.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                data-event={containerOffer.eventName}
                data-source-page="tools-container-recommender"
                data-offer={containerOffer.name}
              >
                View matched pick on Amazon UK
              </a>
              <Link className="btn-secondary" to={containerCopy.guidePath}>
                {containerCopy.guideLabel}
              </Link>
            </div>
          </section>

          <section id="shopping-budget-estimator" className="tool-panel">
            <h2>Weekly Shopping Budget Estimator</h2>
            <div className="tool-fields">
              <Select label="Supermarket" value={market} onChange={setMarket} options={Object.entries(MARKET_BASKET_BASE).map(([key, item]) => [key, item.label])} />
              <NumberField label="People" value={people} onChange={setPeople} min={1} max={6} suffix="people" />
              <NumberField label="Days" value={shopDays} onChange={setShopDays} min={1} max={7} suffix="days" />
              <label className="tool-toggle">
                <input type="checkbox" checked={highProtein} onChange={e => setHighProtein(e.target.checked)} />
                <span>Higher protein shop</span>
              </label>
            </div>
            <ResultBlock
              title={`Around \u00a3${budgetResult}/week`}
              lines={[
                'This is a planning estimate, not live supermarket pricing.',
                'Actual cost depends on offers, own-brand choices, cupboard staples and portion sizes.',
              ]}
            />
            <Link className="btn-primary" to={buildBrowsePlanUrl({ supermarket: market })}>
              Browse supermarket plans
            </Link>
          </section>

          <section id="protein-value-comparator" className="tool-panel tool-panel--wide" aria-labelledby="protein-value-heading">
            <h2 id="protein-value-heading">Protein Value Comparator</h2>
            <p className="tool-intro">
              Compare protein sources by calories, protein per serving, and estimated cost per {proteinTargetG}g of protein.
              Prices are representative UK supermarket ranges checked {PRICE_CHECKED_DATE}, not live pricing — see the note below the table.
            </p>
            <div className="tool-fields">
              {proteinCompareIds.map((id, index) => (
                <Select
                  key={index}
                  label={`Food ${index + 1}`}
                  value={id}
                  onChange={value => updateProteinCompareSlot(index, value)}
                  options={PROTEIN_FOODS.map(food => [food.id, food.name])}
                />
              ))}
              <Select
                label="Compare cost per"
                value={String(proteinTargetG)}
                onChange={value => setProteinTargetG(Number(value))}
                options={[['25', '25g protein'], ['30', '30g protein']]}
              />
            </div>

            {bestProteinValue && (
              <ResultBlock
                title={`Best value here: ${bestProteinValue.food.name}`}
                lines={[
                  `Approximately ${formatPenceRange(bestProteinValue.targetCost.low, bestProteinValue.targetCost.high)} per ${proteinTargetG}g of protein, the lowest of the foods compared.`,
                  'This changes if you swap in different foods, target a different protein amount, or catch different prices in-store.',
                ]}
              />
            )}

            <div className="content-table-wrap">
              <table className="content-table protein-compare-table">
                <thead>
                  <tr>
                    <th scope="col">Food</th>
                    <th scope="col">Typical serving</th>
                    <th scope="col">Protein</th>
                    <th scope="col">Calories</th>
                    <th scope="col">Cost per serving</th>
                    <th scope="col">Cost per {proteinTargetG}g protein</th>
                  </tr>
                </thead>
                <tbody>
                  {proteinCompareRows.map(row => (
                    <tr key={row.food.id}>
                      <th scope="row">{row.food.name}</th>
                      <td>{row.food.servingNote}</td>
                      <td>{row.proteinG}g</td>
                      <td>{row.kcal} kcal</td>
                      <td>{formatPenceRange(row.costServing.low, row.costServing.high)}</td>
                      <td>{formatPenceRange(row.targetCost.low, row.targetCost.high)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="tool-price-note">
              Cost ranges are representative, not live prices: they reflect typical own-brand to mid-range UK
              supermarket pricing checked against Tesco and Aldi listings on {PRICE_CHECKED_DATE}. Actual prices
              vary by retailer, pack size, brand and promotion. Nutrition figures are based on UK CoFID and USDA
              FoodData Central reference data, the same dataset used to calculate every recipe on this site.
            </p>
            <div className="tool-action-row">
              <Link className="btn-primary" to="/blog/cheapest-protein-sources-cost-per-gram-uk">
                Read the full cheap protein comparison
              </Link>
              <Link className="btn-secondary" to={buildBrowsePlanUrl({ goal: 'high-protein-low-cal' })}>
                Browse high protein plans
              </Link>
            </div>
          </section>
        </div>

        <section id="printable-plans" className="tools-print-section">
          <h2>Print or Save Your Plan as a PDF</h2>
          <p>
            After choosing a plan, use the export PDF section on the plan page to print a weekly
            meal plan, printable shopping list, recipes, calories and macros.
          </p>
          <div className="tools-print-links">
            <Link to="/meal-plans/printable-meal-plans">Printable meal plans</Link>
            <Link to="/meal-plans/meal-plans-with-shopping-list">Plans with shopping lists</Link>
            <Link to="/browse">Browse all plans</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

function generateDinnerOptions(rows, targetCalories) {
  const ingredients = normaliseFridgeRows(rows);
  const calories = clamp(Number(targetCalories), 350, 1200);
  const ranked = DINNER_TEMPLATES
    .map((template, index) => ({
      template,
      index,
      score: scoreDinnerTemplate(template, ingredients),
    }))
    .sort((a, b) => (b.score - a.score) || (a.index - b.index));

  return ranked.slice(0, 3).map(({ template }, index) => (
    buildDinnerOption(template, ingredients, calories, index)
  ));
}

function normaliseFridgeRows(rows) {
  return rows
    .map(row => ({
      name: (row.name || '').trim(),
      quantity: (row.quantity || '').trim(),
    }))
    .filter(row => row.name)
    .map(row => ({
      ...row,
      search: `${row.name} ${row.quantity}`.toLowerCase(),
    }));
}

function scoreDinnerTemplate(template, ingredients) {
  if (!ingredients.length) return 1;

  return ingredients.reduce((score, ingredient) => {
    const matched = template.keywords.some(keyword => {
      const keywordText = keyword.toLowerCase();
      const ingredientText = ingredient.name.toLowerCase();
      return ingredient.search.includes(keywordText) || keywordText.includes(ingredientText);
    });
    return score + (matched ? 4 : 0.5);
  }, 0);
}

function buildDinnerOption(template, ingredients, targetCalories, index) {
  const calorieOffsets = [-50, 0, 50];
  const kcal = clamp(Math.round((targetCalories + calorieOffsets[index]) / 25) * 25, 350, 1200);
  const factor = Math.max(0.75, Math.min(1.35, kcal / template.baseKcal));
  const matched = ingredients.filter(ingredient => (
    template.keywords.some(keyword => ingredient.search.includes(keyword.toLowerCase()))
  ));
  const selected = (matched.length ? matched : ingredients).slice(0, 4);
  const fridgeIngredients = selected.map(formatFridgeIngredient);
  const pantryIngredients = template.staples.slice(0, Math.max(3, 7 - fridgeIngredients.length));
  const optionIngredients = [...fridgeIngredients, ...pantryIngredients].slice(0, 8);

  return {
    id: template.id,
    type: 'Dinner',
    name: template.name,
    kcal,
    protein: Math.max(18, Math.round((template.baseProtein * Math.sqrt(factor)) + (matched.length * 1.5))),
    prep: template.prep,
    desc: template.desc,
    ingredients: optionIngredients,
    portion_size: optionIngredients.slice(0, 4).join(', '),
    recipe: template.recipe,
    sourcePlan: template.sourcePlan,
    sourceLabel: template.sourceLabel,
  };
}

function formatFridgeIngredient(row) {
  return row.quantity ? `${row.name} ${row.quantity}` : row.name;
}

function asList(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }
  if (!value) return [];
  return String(value)
    .split(/\n|\. /)
    .map(item => item.trim().replace(/\.$/, ''))
    .filter(Boolean);
}

function NumberField({ label, value, onChange, min, max, suffix }) {
  return (
    <label className="tool-field">
      <span>{label}</span>
      <div className="tool-number-wrap">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(clamp(Number(e.target.value), min, max))}
        />
        <small>{suffix}</small>
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="tool-field">
      <span>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(([key, labelText]) => (
          <option key={key} value={key}>{labelText}</option>
        ))}
      </select>
    </label>
  );
}

function ResultBlock({ title, lines }) {
  return (
    <div className="tool-result">
      <strong>{title}</strong>
      {lines.map(line => <span key={line}>{line}</span>)}
    </div>
  );
}

function nearestCalories(target) {
  return PLAN_CALORIES.reduce((best, value) => (
    Math.abs(value - target) < Math.abs(best - target) ? value : best
  ), PLAN_CALORIES[0]);
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
