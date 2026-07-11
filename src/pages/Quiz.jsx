import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { PLAN_COUNT } from '../data/planSeeds.js';
import { track } from '../utils/analytics.js';
import {
  QUIZ_DRAFT_KEY,
  QUIZ_DRAFT_MAX_AGE_MS,
  QUIZ_LAST_ANSWERS_KEY,
} from '../utils/quizStorage.js';

const STEPS = [
  {
    id: 'goal',
    question: "What's your main goal?",
    hint: 'Choose the one that best fits you right now.',
    type: 'single',
    options: [
      { value: 'weight-loss', label: 'Weight loss', icon: '⚖️' },
      { value: 'budget-fat-loss', label: 'Budget fat loss', icon: '💰' },
      { value: 'high-protein-low-cal', label: 'High protein, low cal', icon: '🥩' },
      { value: 'muscle-gain', label: 'Muscle gain', icon: '💪' },
      { value: 'gym-beginner', label: 'Gym beginner', icon: '🏋️' },
      { value: 'budget-bodybuilding', label: 'Budget bodybuilding', icon: '🔩' },
      { value: 'cheap-student', label: 'Cheap student', icon: '🎒' },
      { value: 'cheap-high-protein', label: 'Cheap high protein', icon: '🥚' },
      { value: 'low-effort', label: 'Low effort', icon: '😌' },
      { value: 'busy-professional', label: 'Busy professional', icon: '💼' },
    ],
  },
  {
    id: 'diet',
    question: 'Do you follow a specific diet?',
    hint: "This filters out meals that don't suit you.",
    type: 'single',
    options: [
      { value: 'standard', label: 'No preference', icon: '🍽️' },
      { value: 'vegetarian', label: 'Vegetarian', icon: '🥦' },
      { value: 'vegan', label: 'Vegan', icon: '🌱' },
      { value: 'pescatarian', label: 'Pescatarian', icon: '🐟' },
    ],
  },
  {
    id: 'supermarket',
    question: 'Which supermarket do you mainly shop at?',
    hint: 'Choose a named store, or use a generic UK supermarket average.',
    type: 'single',
    options: [
      { value: 'any', label: 'Generic UK supermarket', icon: 'UK' },
      { value: 'aldi', label: 'Aldi', icon: '🛒' },
      { value: 'lidl', label: 'Lidl', icon: '🛒' },
      { value: 'tesco', label: 'Tesco', icon: '🛒' },
      { value: 'asda', label: 'Asda', icon: '🛒' },
      { value: 'sainsburys', label: "Sainsbury's", icon: '🛒' },
      { value: 'morrisons', label: 'Morrisons', icon: '🛒' },
      { value: 'iceland', label: 'Iceland', icon: '🛒' },
      { value: 'waitrose', label: 'Waitrose', icon: '🛒' },
      { value: 'ocado', label: 'Ocado', icon: '🛒' },
      { value: 'marks-spencer', label: 'M&S', icon: '🛒' },
      { value: 'coop', label: 'Co-op', icon: '🛒' },
    ],
  },
  {
    id: 'calories',
    question: 'What calorie range suits you?',
    hint: 'Not sure? 1,800 kcal is the most popular starting point.',
    type: 'single',
    options: [
      { value: '1500', label: '~1,500 kcal', desc: 'Moderate deficit - good for lighter adults' },
      { value: '1800', label: '~1,800 kcal', desc: 'Most popular - filling, sustainable' },
      { value: '2000', label: '~2,000 kcal', desc: 'Active adults, light deficit or maintenance' },
      { value: '2500', label: '~2,500 kcal', desc: 'Muscle gain or very active individuals' },
      { value: 'custom', label: 'Custom kcal', desc: 'Enter your own daily target' },
      { value: 'unsure', label: "I'm not sure", desc: "We'll find the best match anyway" },
    ],
  },
  {
    id: 'budget',
    question: "What's your weekly food budget?",
    hint: 'For one person.',
    type: 'single',
    options: [
      { value: 'very-cheap', label: 'Very cheap', desc: 'Under £30/week' },
      { value: 'budget', label: 'Budget', desc: '£30-40/week' },
      { value: 'moderate', label: 'Moderate', desc: '£40-55/week' },
      { value: 'flexible', label: 'Flexible', desc: '£55+/week' },
    ],
  },
  {
    id: 'effort',
    question: 'How much cooking time do you have?',
    hint: 'Affects how complex the meals are.',
    type: 'single',
    options: [
      { value: 'minimal', label: 'Minimal', desc: 'Under 10 min/day, mostly ready-made' },
      { value: 'low', label: 'Low effort', desc: '10-20 min/day, simple recipes' },
      { value: 'standard', label: 'Standard', desc: '20-30 min/day' },
      { value: 'batch', label: 'Batch cooking', desc: 'Prep on Sunday, quick reheat all week' },
      { value: 'high-variety', label: 'High variety', desc: 'Happy to cook more for different meals' },
    ],
  },
  {
    id: 'macros',
    question: 'Do you want to set macro targets?',
    hint: 'Optional. Skip this if your goal and calories are enough.',
    type: 'macroTargets',
  },
];

const MACRO_FIELDS = [
  { key: 'protein', label: 'Protein', min: 50, max: 260, step: 5, desc: 'Common high-protein targets sit around 120-190g/day.' },
  { key: 'carbs', label: 'Carbohydrates', min: 50, max: 400, step: 10, desc: 'Useful for training fuel and meal preference.' },
  { key: 'fats', label: 'Fats', min: 25, max: 140, step: 5, desc: 'Keeps plans from skewing too low or too high in fats.' },
  { key: 'fibre', label: 'Fibre', min: 15, max: 70, step: 1, desc: 'Helps match filling, high-fibre plans.' },
];

const DEFAULT_MACROS = { protein: '160', carbs: '180', fats: '60', fibre: '30' };

export default function Quiz() {
  const navigate = useNavigate();
  const [initialDraft] = useState(() => readQuizDraft());
  const [step, setStep] = useState(() => initialDraft?.step || 0);
  const [answers, setAnswers] = useState(() => initialDraft?.answers || {});
  const [macros, setMacros] = useState(() => initialDraft?.macros || DEFAULT_MACROS);
  const [macroMode, setMacroMode] = useState(() => initialDraft?.macroMode || null);
  const [macroError, setMacroError] = useState('');
  const [customCalories, setCustomCalories] = useState(() => initialDraft?.customCalories || '');
  const [customCalorieError, setCustomCalorieError] = useState('');
  const startTrackedRef = useRef(false);

  const current = STEPS[step];
  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const isCustomCaloriesSelected = current.id === 'calories' && (
    answers.calories === 'custom' ||
    (answers.calories && !current.options.some(opt => opt.value === answers.calories))
  );

  useEffect(() => {
    if (!startTrackedRef.current) {
      track.quizStarted();
      startTrackedRef.current = true;
    }
  }, []);

  useEffect(() => {
    writeJson(QUIZ_DRAFT_KEY, {
      step,
      answers,
      macros,
      macroMode,
      customCalories,
      savedAt: Date.now(),
    });
  }, [answers, customCalories, macroMode, macros, step]);

  function handleSelect(value) {
    if (current.id === 'calories' && value === 'custom') {
      setAnswers({ ...answers, calories: 'custom' });
      setCustomCalorieError('');
      return;
    }

    if (current.id === 'calories') {
      setCustomCalorieError('');
    }

    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      submitQuiz(next);
    }
  }

  function handleCustomCalorieSubmit(e) {
    e.preventDefault();
    const value = Number(customCalories);

    if (!Number.isFinite(value) || value < 1000 || value > 4000) {
      setCustomCalorieError('Enter a daily target between 1,000 and 4,000 kcal.');
      return;
    }

    const rounded = String(Math.round(value));
    const next = { ...answers, calories: rounded };
    setCustomCalories(rounded);
    setCustomCalorieError('');
    setAnswers(next);

    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      submitQuiz(next);
    }
  }

  function handleMacroChange(key, val) {
    setMacros(m => ({ ...m, [key]: val }));
    setMacroError('');
  }

  function handleMacroSubmit(e) {
    e.preventDefault();

    const parsed = {};
    for (const field of MACRO_FIELDS) {
      const value = Number(macros[field.key]);
      if (!Number.isFinite(value) || value < field.min || value > field.max) {
        setMacroError(`Enter ${field.label.toLowerCase()} between ${field.min}g and ${field.max}g.`);
        return;
      }
      parsed[field.key] = Math.round(value);
    }

    const next = { ...answers, macros: parsed, macroMode: 'custom-grams' };
    setAnswers(next);
    submitQuiz(next);
  }

  function handleMacroSkip() {
    const next = { ...answers };
    setAnswers(next);
    submitQuiz(next);
  }

  function submitQuiz(finalAnswers) {
    writeJson(QUIZ_LAST_ANSWERS_KEY, {
      answers: finalAnswers,
      savedAt: Date.now(),
    });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(QUIZ_DRAFT_KEY);
    }
    track.quizCompleted();
    const encoded = btoa(JSON.stringify(finalAnswers));
    navigate(`/quiz/results?q=${encoded}`);
  }

  function goBack() {
    if (step > 0) setStep(s => s - 1);
  }

  function startOver() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(QUIZ_DRAFT_KEY);
    }
    setStep(0);
    setAnswers({});
    setMacros(DEFAULT_MACROS);
    setMacroMode(null);
    setMacroError('');
    setCustomCalories('');
    setCustomCalorieError('');
  }

  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: 'How does the meal plan quiz work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Answer 7 short questions about your goal, diet, supermarket, calories, budget, effort, and optional macro targets. We match you with the top 3 plans from our library of ${PLAN_COUNT} UK meal plans.`,
      },
    }],
  }];

  return (
    <>
      <SEO
        title="Free UK Meal Plan Quiz - Find a Printable Diet Plan | MealPrep.org.uk"
        description={`Answer 7 quick questions to find a free UK diet plan with calories, macros, supermarket choices, printable PDF export and shopping list. ${PLAN_COUNT} plans to match.`}
        canonical="https://www.mealprep.org.uk/quiz"
        jsonLd={jsonLd}
      />

      <div className="quiz-page">
        <div className="quiz-container">
          <header className="quiz-shell-header">
            <SiteLogo variant="page" className="page-header-logo" />
            <h1 className="quiz-shell-h1">Find your perfect UK meal plan</h1>
            <p className="quiz-shell-sub">
              Answer 7 quick questions about your goal, diet, supermarket, calories, budget, and
              cooking effort. We'll match you with the best plans from our library of {PLAN_COUNT} free
              UK meal plans - with full shopping lists, macros, and cost estimates.
            </p>
            <ul className="quiz-shell-features">
              <li>{PLAN_COUNT} plans across Aldi, Tesco, Lidl, Asda, Morrisons, Sainsbury's &amp; Iceland</li>
              <li>Vegetarian, vegan, pescatarian and standard options</li>
              <li>1,500-2,500 kcal targets, plus custom calories</li>
              <li>Takes 30 seconds, free, no sign-up</li>
            </ul>
          </header>

          <div className="quiz-header">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="quiz-step-count">Step {step + 1} of {STEPS.length}</p>
          </div>

          <div className="quiz-body">
            <h2 className="quiz-question">{current.question}</h2>
            {current.hint && <p className="quiz-hint">{current.hint}</p>}

            {current.type === 'single' && (
              <>
                <div className={`quiz-options ${current.options.length > 4 ? 'quiz-options--wide' : ''}`}>
                  {current.options.map(opt => (
                    <button
                      key={opt.value}
                      className={`quiz-option ${
                        answers[current.id] === opt.value || (opt.value === 'custom' && isCustomCaloriesSelected)
                          ? 'quiz-option--selected'
                          : ''
                      }`}
                      onClick={() => handleSelect(opt.value)}
                      type="button"
                    >
                      {opt.icon && <span className="quiz-option-icon" aria-hidden="true">{opt.icon}</span>}
                      <span className="quiz-option-label">{opt.label}</span>
                      {opt.desc && <span className="quiz-option-desc">{opt.desc}</span>}
                    </button>
                  ))}
                </div>

                {current.id === 'calories' && isCustomCaloriesSelected && (
                  <form className="quiz-custom-calories" onSubmit={handleCustomCalorieSubmit}>
                    <label className="quiz-custom-calories-label" htmlFor="custom-calories">
                      Daily calorie target
                    </label>
                    <div className="quiz-custom-calories-row">
                      <input
                        id="custom-calories"
                        className="quiz-custom-calories-input"
                        type="number"
                        min="1000"
                        max="4000"
                        step="50"
                        inputMode="numeric"
                        placeholder="e.g. 1900"
                        value={customCalories}
                        onChange={e => {
                          setCustomCalories(e.target.value);
                          setCustomCalorieError('');
                        }}
                        aria-describedby="custom-calories-hint"
                        aria-invalid={customCalorieError ? 'true' : 'false'}
                        autoFocus
                      />
                      <button className="quiz-submit-btn quiz-custom-calories-submit" type="submit">
                        Continue
                      </button>
                    </div>
                    <p
                      id="custom-calories-hint"
                      className={`quiz-custom-calories-hint ${customCalorieError ? 'quiz-custom-calories-hint--error' : ''}`}
                    >
                      {customCalorieError || 'Use your target daily calories. We will match the closest plans.'}
                    </p>
                  </form>
                )}
              </>
            )}

            {current.type === 'macroTargets' && (
              <div className="quiz-macro-targets">
                <div className="quiz-macro-choice-grid">
                  <button
                    className={`quiz-macro-choice ${macroMode === 'skip' ? 'quiz-macro-choice--selected' : ''}`}
                    onClick={() => {
                      setMacroMode('skip');
                      handleMacroSkip();
                    }}
                    type="button"
                  >
                    <span className="quiz-macro-choice-title">Use recommended macros</span>
                    <span className="quiz-macro-choice-desc">Best if you only care about goal, calories, budget, and diet.</span>
                  </button>
                  <button
                    className={`quiz-macro-choice ${macroMode === 'custom' ? 'quiz-macro-choice--selected' : ''}`}
                    onClick={() => {
                      setMacroMode('custom');
                      setMacroError('');
                    }}
                    type="button"
                  >
                    <span className="quiz-macro-choice-title">Set gram targets</span>
                    <span className="quiz-macro-choice-desc">Add daily protein, carbs, fats, and fibre targets in grams.</span>
                  </button>
                </div>

                {macroMode === 'custom' && (
                  <form className="quiz-macro-form" onSubmit={handleMacroSubmit}>
                    <div className="quiz-macro-fields">
                      {MACRO_FIELDS.map(field => (
                        <label className="quiz-macro-field" key={field.key}>
                          <span className="quiz-macro-label">{field.label}</span>
                          <span className="quiz-macro-input-wrap">
                            <input
                              className="quiz-macro-input"
                              type="number"
                              min={field.min}
                              max={field.max}
                              step={field.step}
                              value={macros[field.key]}
                              onChange={e => handleMacroChange(field.key, e.target.value)}
                              aria-label={`${field.label} grams per day`}
                            />
                            <span className="quiz-macro-unit">g/day</span>
                          </span>
                          <span className="quiz-macro-desc">{field.desc}</span>
                        </label>
                      ))}
                    </div>

                    {macroError && <p className="quiz-macro-error" role="alert">{macroError}</p>}

                    <button className="quiz-submit-btn" type="submit">
                      See My Meal Plans →
                    </button>
                    <button className="quiz-skip-btn" onClick={handleMacroSkip} type="button">
                      Skip macros
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {step > 0 && (
            <div className="quiz-footer">
              <button className="quiz-back-btn" onClick={goBack} type="button">
                ← Back
              </button>
              <button className="quiz-back-btn" onClick={startOver} type="button">
                Start over
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function readQuizDraft() {
  const saved = readJson(QUIZ_DRAFT_KEY);
  if (!saved?.savedAt || Date.now() - saved.savedAt > QUIZ_DRAFT_MAX_AGE_MS) return null;
  const step = Math.min(STEPS.length - 1, Math.max(0, Number(saved.step) || 0));
  return { ...saved, step };
}

function readJson(key) {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The quiz remains usable without local storage.
  }
}
