import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { buildBrowsePlanUrl } from '../data/planChooser.js';

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
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'UK Meal Prep Calculators',
    url: 'https://www.mealprep.org.uk/tools',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    description: 'Free UK meal prep tools for calorie targets, protein targets, shopping budgets and meal prep container planning.',
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
        name: 'Are the calculator results medical advice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The tools provide general planning estimates only. Calorie and protein needs vary by person, health status and activity.',
        },
      },
    ],
  },
];

export default function ToolsPage() {
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

  const [market, setMarket] = useState('any');
  const [people, setPeople] = useState(1);
  const [shopDays, setShopDays] = useState(7);
  const [highProtein, setHighProtein] = useState(true);

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
  const budgetResult = useMemo(() => {
    const base = MARKET_BASKET_BASE[market].base;
    const dayFactor = shopDays / 7;
    const proteinFactor = highProtein ? 1.14 : 1;
    const householdFactor = people === 1 ? 1 : (1 + ((people - 1) * 0.72));
    return Math.round(base * dayFactor * proteinFactor * householdFactor);
  }, [highProtein, market, people, shopDays]);

  return (
    <>
      <SEO
        title="Free UK Meal Prep Tools - Calorie, Protein, Shopping List & Container Calculators | MealPrep.org.uk"
        description="Use free UK meal prep calculators for calorie targets, protein targets, weekly supermarket budget estimates and how many containers you need."
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
        <header className="tools-hero">
          <span className="offer-kicker">Free meal prep calculators</span>
          <h1>UK Meal Prep Tools</h1>
          <p className="content-intro">
            Estimate a daily calorie target, protein range, shopping budget and container count,
            then jump straight to printable meal plans with shopping lists.
          </p>
        </header>

        <div className="tools-grid">
          <section className="tool-panel">
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

          <section className="tool-panel">
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

          <section className="tool-panel">
            <h2>Container Count Calculator</h2>
            <div className="tool-fields">
              <NumberField label="Prep days" value={prepDays} onChange={setPrepDays} min={1} max={7} suffix="days" />
              <NumberField label="Meals per day" value={mealsPerDay} onChange={setMealsPerDay} min={1} max={4} suffix="meals" />
              <NumberField label="Spares" value={spareContainers} onChange={setSpareContainers} min={0} max={10} suffix="extra" />
            </div>
            <ResultBlock
              title={`${containerResult} containers`}
              lines={[
                'Add one or two spares for snacks, freezer portions or a missed wash cycle.',
                containerResult >= 14 ? 'A larger divided set or glass bundle is likely to be easier.' : 'A compact plastic or glass set should cover this prep style.',
              ]}
            />
            <Link className="btn-primary" to={containerResult >= 14 ? '/meal-prep-containers/premium' : '/meal-prep-containers/mid-range'}>
              Compare containers
            </Link>
          </section>

          <section className="tool-panel">
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
        </div>

        <section className="tools-print-section">
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
