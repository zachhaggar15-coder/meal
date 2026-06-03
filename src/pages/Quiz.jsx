import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { PLAN_COUNT } from '../data/planSeeds.js';

// ── Quiz steps definition ─────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'goal',
    question: "What's your main goal?",
    hint: 'Choose the one that best fits you right now.',
    type: 'single',
    options: [
      { value: 'weight-loss',           label: 'Weight loss',            icon: '⚖️' },
      { value: 'budget-fat-loss',       label: 'Budget fat loss',        icon: '💰' },
      { value: 'high-protein-low-cal',  label: 'High protein, low cal',  icon: '🥩' },
      { value: 'muscle-gain',           label: 'Muscle gain',            icon: '💪' },
      { value: 'gym-beginner',          label: 'Gym beginner',           icon: '🏋️' },
      { value: 'budget-bodybuilding',   label: 'Budget bodybuilding',    icon: '🔩' },
      { value: 'cheap-student',         label: 'Cheap student',          icon: '🎒' },
      { value: 'cheap-high-protein',    label: 'Cheap high protein',     icon: '🥚' },
      { value: 'low-effort',            label: 'Low effort',             icon: '😌' },
      { value: 'busy-professional',     label: 'Busy professional',      icon: '💼' },
    ],
  },
  {
    id: 'diet',
    question: 'Do you follow a specific diet?',
    hint: 'This filters out meals that don\'t suit you.',
    type: 'single',
    options: [
      { value: 'standard',     label: 'No preference',  icon: '🍽️' },
      { value: 'vegetarian',   label: 'Vegetarian',     icon: '🥦' },
      { value: 'vegan',        label: 'Vegan',          icon: '🌱' },
      { value: 'pescatarian',  label: 'Pescatarian',    icon: '🐟' },
    ],
  },
  {
    id: 'supermarket',
    question: 'Which supermarket do you mainly shop at?',
    hint: 'Plans use realistic products from your chosen store.',
    type: 'single',
    options: [
      { value: 'aldi',        label: 'Aldi',          icon: '🛒' },
      { value: 'lidl',        label: 'Lidl',          icon: '🛒' },
      { value: 'tesco',       label: 'Tesco',         icon: '🛒' },
      { value: 'asda',        label: 'Asda',          icon: '🛒' },
      { value: 'sainsburys',  label: "Sainsbury's",   icon: '🛒' },
      { value: 'morrisons',   label: 'Morrisons',     icon: '🛒' },
      { value: 'iceland',     label: 'Iceland',       icon: '🛒' },
      { value: 'any',         label: 'No preference', icon: '🏪' },
    ],
  },
  {
    id: 'calories',
    question: 'What calorie range suits you?',
    hint: 'Not sure? 1,800 kcal is the most popular starting point.',
    type: 'single',
    options: [
      { value: '1500', label: '~1,500 kcal',  desc: 'Moderate deficit — good for lighter adults' },
      { value: '1800', label: '~1,800 kcal',  desc: 'Most popular — filling, sustainable' },
      { value: '2000', label: '~2,000 kcal',  desc: 'Active adults, light deficit or maintenance' },
      { value: '2500', label: '~2,500 kcal',  desc: 'Muscle gain or very active individuals' },
      { value: 'unsure', label: "I'm not sure", desc: 'We\'ll find the best match anyway' },
    ],
  },
  {
    id: 'budget',
    question: 'What\'s your weekly food budget?',
    hint: 'For one person.',
    type: 'single',
    options: [
      { value: 'very-cheap', label: 'Very cheap',  desc: 'Under £30/week' },
      { value: 'budget',     label: 'Budget',      desc: '£30–40/week' },
      { value: 'moderate',   label: 'Moderate',    desc: '£40–55/week' },
      { value: 'flexible',   label: 'Flexible',    desc: '£55+/week' },
    ],
  },
  {
    id: 'effort',
    question: 'How much cooking time do you have?',
    hint: 'Affects how complex the meals are.',
    type: 'single',
    options: [
      { value: 'minimal',      label: 'Minimal',        desc: 'Under 10 min/day, mostly ready-made' },
      { value: 'low',          label: 'Low effort',     desc: '10–20 min/day, simple recipes' },
      { value: 'standard',     label: 'Standard',       desc: '20–30 min/day' },
      { value: 'batch',        label: 'Batch cooking',  desc: 'Prep on Sunday, quick reheat all week' },
      { value: 'high-variety', label: 'High variety',   desc: 'Happy to cook more for different meals' },
    ],
  },
  {
    id: 'macros',
    question: 'Any macro preferences?',
    hint: 'Drag the sliders to adjust. Leave them as-is if you\'re not sure.',
    type: 'sliders',
    defaults: { protein: 70, carbs: 50, fats: 40, fibre: 50 },
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [macros, setMacros] = useState({ protein: 70, carbs: 50, fats: 40, fibre: 50 });

  const current = STEPS[step];
  const progress = Math.round(((step) / STEPS.length) * 100);

  function handleSelect(value) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      submitQuiz(next);
    }
  }

  function handleMacroChange(key, val) {
    setMacros(m => ({ ...m, [key]: Number(val) }));
  }

  function handleMacroSubmit() {
    const next = { ...answers, macros };
    setAnswers(next);
    submitQuiz(next);
  }

  function submitQuiz(finalAnswers) {
    const encoded = btoa(JSON.stringify(finalAnswers));
    navigate(`/quiz/results?q=${encoded}`);
  }

  function goBack() {
    if (step > 0) setStep(s => s - 1);
  }

  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: 'How does the meal plan quiz work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Answer 7 short questions about your goal, diet, supermarket, calories, budget, effort, and macro preferences. We match you with the top 3 plans from our library of ${PLAN_COUNT} UK meal plans.`,
      },
    }],
  }];

  return (
    <>
      <SEO
        title="Find Your Perfect UK Meal Plan — Free Quiz | MealPrep.org.uk"
        description={`Answer 7 quick questions to find the best UK meal plan for your goal, budget, supermarket, and diet. ${PLAN_COUNT} ready-made plans to match.`}
        canonical="https://www.mealprep.org.uk/quiz"
        jsonLd={jsonLd}
      />

      <div className="quiz-page">
        <div className="quiz-container">

          {/* Static SEO shell — always rendered, visible to crawlers */}
          <header className="quiz-shell-header">
            <SiteLogo variant="page" className="page-header-logo" />
            <h1 className="quiz-shell-h1">Find your perfect UK meal plan</h1>
            <p className="quiz-shell-sub">
              Answer 7 quick questions about your goal, diet, supermarket, calories, budget, and
              cooking effort. We'll match you with the best plans from our library of {PLAN_COUNT} free
              UK meal plans — with full shopping lists, macros, and cost estimates.
            </p>
            <ul className="quiz-shell-features">
              <li>{PLAN_COUNT} plans across Aldi, Tesco, Lidl, Asda, Morrisons, Sainsbury's &amp; Iceland</li>
              <li>Vegetarian, vegan, pescatarian and standard options</li>
              <li>1,500–2,500 kcal targets · £20–70/week budgets</li>
              <li>Takes 30 seconds · free · no sign-up</li>
            </ul>
          </header>

          {/* Progress */}
          <div className="quiz-header">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="quiz-step-count">Step {step + 1} of {STEPS.length}</p>
          </div>

          {/* Question */}
          <div className="quiz-body">
            <h2 className="quiz-question">{current.question}</h2>
            {current.hint && <p className="quiz-hint">{current.hint}</p>}

            {/* Single-select grid */}
            {current.type === 'single' && (
              <div className={`quiz-options ${current.options.length > 4 ? 'quiz-options--wide' : ''}`}>
                {current.options.map(opt => (
                  <button
                    key={opt.value}
                    className={`quiz-option ${answers[current.id] === opt.value ? 'quiz-option--selected' : ''}`}
                    onClick={() => handleSelect(opt.value)}
                    type="button"
                  >
                    {opt.icon && <span className="quiz-option-icon" aria-hidden="true">{opt.icon}</span>}
                    <span className="quiz-option-label">{opt.label}</span>
                    {opt.desc && <span className="quiz-option-desc">{opt.desc}</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Macro sliders */}
            {current.type === 'sliders' && (
              <div className="quiz-sliders">
                {[
                  { key: 'protein', label: 'Protein', low: 'Lower', high: 'Higher' },
                  { key: 'carbs',   label: 'Carbohydrates', low: 'Fewer', high: 'More' },
                  { key: 'fats',    label: 'Fats', low: 'Less', high: 'More' },
                  { key: 'fibre',   label: 'Fibre', low: 'Less', high: 'More' },
                ].map(({ key, label, low, high }) => (
                  <div className="quiz-slider-row" key={key}>
                    <div className="quiz-slider-header">
                      <span className="quiz-slider-label">{label}</span>
                      <span className="quiz-slider-value">{macros[key]}%</span>
                    </div>
                    <div className="quiz-slider-track">
                      <span className="quiz-slider-endpoint">{low}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={macros[key]}
                        onChange={e => handleMacroChange(key, e.target.value)}
                        className="quiz-slider-input"
                        aria-label={label}
                      />
                      <span className="quiz-slider-endpoint">{high}</span>
                    </div>
                  </div>
                ))}

                <button className="quiz-submit-btn" onClick={handleMacroSubmit} type="button">
                  See My Meal Plans →
                </button>
                <button className="quiz-skip-btn" onClick={() => submitQuiz(answers)} type="button">
                  Skip — use defaults
                </button>
              </div>
            )}
          </div>

          {/* Back navigation */}
          {step > 0 && (
            <div className="quiz-footer">
              <button className="quiz-back-btn" onClick={goBack} type="button">
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
