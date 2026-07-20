import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { getTopMatches } from '../utils/quizScorer.js';
import { PLAN_COUNT } from '../data/planSeeds.js';
import { track } from '../utils/analytics.js';
import { QUIZ_LAST_ANSWERS_KEY } from '../utils/quizStorage.js';

const EFFORT_LABELS = {
  'minimal':      'Minimal prep',
  'low':          'Low effort',
  'standard':     'Standard',
  'batch':        'Batch cooking',
  'high-variety': 'High variety',
};

const DIET_LABELS = {
  'standard':    'Standard',
  'vegetarian':  'Vegetarian',
  'vegan':       'Vegan',
  'pescatarian': 'Pescatarian',
};

const MKT_LABELS = {
  'aldi': 'Aldi', 'lidl': 'Lidl', 'tesco': 'Tesco',
  'asda': 'Asda', 'sainsburys': "Sainsbury's",
  'morrisons': 'Morrisons', 'iceland': 'Iceland',
  'waitrose': 'Waitrose', 'ocado': 'Ocado',
  'marks-spencer': 'M&S', 'coop': 'Co-op',
  'any': 'Generic UK supermarket',
};

const GOAL_OPTIONS = [
  ['weight-loss', 'Weight loss'],
  ['budget-fat-loss', 'Budget fat loss'],
  ['high-protein-low-cal', 'High protein, low cal'],
  ['muscle-gain', 'Muscle gain'],
  ['gym-beginner', 'Gym beginner'],
  ['budget-bodybuilding', 'Budget bodybuilding'],
  ['cheap-student', 'Cheap student'],
  ['cheap-high-protein', 'Cheap high protein'],
  ['low-effort', 'Low effort'],
  ['busy-professional', 'Busy professional'],
];

const DIET_OPTIONS = [
  ['standard', 'No preference'],
  ['vegetarian', 'Vegetarian'],
  ['vegan', 'Vegan'],
  ['pescatarian', 'Pescatarian'],
];

const MARKET_OPTIONS = Object.entries(MKT_LABELS);
const CALORIE_OPTIONS = [
  ['unsure', 'Not sure'],
  ['1400', '1,400 kcal'],
  ['1500', '1,500 kcal'],
  ['1600', '1,600 kcal'],
  ['1800', '1,800 kcal'],
  ['2000', '2,000 kcal'],
  ['2200', '2,200 kcal'],
  ['2500', '2,500 kcal'],
  ['3000', '3,000 kcal'],
  ['3500', '3,500 kcal'],
];
const BUDGET_OPTIONS = [['very-cheap', 'Very cheap'], ['budget', 'Budget'], ['moderate', 'Moderate'], ['flexible', 'Flexible']];
const EFFORT_OPTIONS = Object.entries(EFFORT_LABELS);

export default function QuizResults() {
  const [params] = useSearchParams();
  const paramString = params.toString();

  const initialAnswers = useMemo(() => (
    readAnswersFromParams(params) || readSavedAnswers() || {}
  ), [paramString]);

  const [answers, setAnswers] = useState(initialAnswers);

  useEffect(() => {
    setAnswers(initialAnswers);
  }, [initialAnswers]);

  const matches = useMemo(() => getTopMatches(answers, 3), [answers]);

  function updateAnswer(field, value) {
    setAnswers(prev => {
      const next = { ...prev };
      if (value) next[field] = value;
      else delete next[field];
      writeSavedAnswers(next);
      return next;
    });
    track.quizAdjusted(field);
  }

  if (!matches.length) {
    return (
      <div className="content-page">
        <p>No matches found. <Link to="/quiz">Retake the quiz</Link></p>
      </div>
    );
  }

  const [best, ...rest] = matches;

  return (
    <>
      <SEO
        title="Your Meal Plan Matches — MealPrep.org.uk"
        description="Here are your top 3 matching UK meal plans based on your goal, budget, supermarket, and diet preferences."
        canonical="https://www.mealprep.org.uk/quiz/results"
        robots="noindex,follow"
      />

      <div className="quiz-results-page content-page">
        <div className="quiz-results-header">
          <SiteLogo variant="page" className="page-header-logo" />
          <h1 className="quiz-results-title">Your top meal plan matches</h1>
          <p className="quiz-results-sub">
            Based on your goal, supermarket, budget, and diet preferences.
          </p>
        </div>

        {/* Best match — featured */}
        <QuizAdjustments answers={answers} onChange={updateAnswer} />

        <div className="result-card result-card--best">
          <div className="result-card-badge result-card-badge--best">{best.matchLabel}</div>
          <div className="result-card-score">{best.score}% match</div>
          <h2 className="result-card-title">{best.title}</h2>
          <p className="result-card-reason">{best.matchReason}</p>
          <CompromiseNote compromises={best.compromises} />

          <div className="result-card-meta">
            <span className="result-meta-pill">{MKT_LABELS[best.supermarket] || best.supermarket}</span>
            <span className="result-meta-pill">~{best.calories} kcal/day</span>
            <span className="result-meta-pill">{best.priceEstimate}/week</span>
            <span className="result-meta-pill">{EFFORT_LABELS[best.effort] || best.effort}</span>
            {best.dietType !== 'standard' && (
              <span className="result-meta-pill">{DIET_LABELS[best.dietType] || best.dietType}</span>
            )}
          </div>

          <MacroBars macros={best.macrosGrams || best.macros} />

          <Link to={`/plans/${best.slug}`} className="result-card-cta result-card-cta--primary">
            View Full Plan →
          </Link>
        </div>

        {/* Other matches */}
        {rest.length > 0 && (
          <h2 className="quiz-results-alt-heading">Other close matches</h2>
        )}
        {rest.map((match, i) => (
          <div className="result-card result-card--alt" key={match.slug}>
            <div className="result-card-badge">{match.matchLabel}</div>
            <div className="result-card-score">{match.score}% match</div>
            <h2 className="result-card-title result-card-title--sm">{match.title}</h2>
            <p className="result-card-reason">{match.matchReason}</p>
            <CompromiseNote compromises={match.compromises} />

            <div className="result-card-meta">
              <span className="result-meta-pill">{MKT_LABELS[match.supermarket] || match.supermarket}</span>
              <span className="result-meta-pill">~{match.calories} kcal/day</span>
              <span className="result-meta-pill">{match.priceEstimate}/week</span>
              <span className="result-meta-pill">{EFFORT_LABELS[match.effort] || match.effort}</span>
            </div>

            <Link to={`/plans/${match.slug}`} className="result-card-cta">
              View Plan →
            </Link>
          </div>
        ))}

        {/* Actions */}
        <div className="quiz-results-actions">
          <Link to="/quiz" className="btn-secondary">← Retake Quiz</Link>
          <Link to="/browse" className="btn-secondary">Browse All {PLAN_COUNT} Plans</Link>
        </div>
      </div>
    </>
  );
}

function QuizAdjustments({ answers, onChange }) {
  return (
    <section className="quiz-adjustments" aria-labelledby="quiz-adjustments-heading">
      <div>
        <h2 id="quiz-adjustments-heading">Fine tune your matches</h2>
        <p>Adjust the main filters and the top plans update immediately.</p>
      </div>
      <div className="quiz-adjustment-grid">
        <AdjustmentSelect label="Goal" value={answers.goal || ''} options={GOAL_OPTIONS} onChange={value => onChange('goal', value)} />
        <AdjustmentSelect label="Diet" value={answers.diet || ''} options={DIET_OPTIONS} onChange={value => onChange('diet', value)} />
        <AdjustmentSelect label="Supermarket" value={answers.supermarket || ''} options={MARKET_OPTIONS} onChange={value => onChange('supermarket', value)} />
        <AdjustmentSelect label="Calories" value={answers.calories || ''} options={CALORIE_OPTIONS} onChange={value => onChange('calories', value)} />
        <AdjustmentSelect label="Budget" value={answers.budget || ''} options={BUDGET_OPTIONS} onChange={value => onChange('budget', value)} />
        <AdjustmentSelect label="Effort" value={answers.effort || ''} options={EFFORT_OPTIONS} onChange={value => onChange('effort', value)} />
      </div>
    </section>
  );
}

function AdjustmentSelect({ label, value, options, onChange }) {
  return (
    <label className="quiz-adjustment-field">
      <span>{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)}>
        <option value="">Any</option>
        {options.map(([key, labelText]) => (
          <option key={key} value={key}>{labelText}</option>
        ))}
      </select>
    </label>
  );
}

// States plainly where a plan does not match what was asked for. Without this
// a plan can miss the calorie target by 700 kcal and still read as a clean
// match, because calories are only a small share of the overall score.
function CompromiseNote({ compromises }) {
  if (!compromises?.length) return null;

  return (
    <ul className="result-card-compromises">
      {compromises.map(item => (
        <li key={item.type}>{item.text}</li>
      ))}
    </ul>
  );
}

function MacroBars({ macros }) {
  const maxByMacro = { protein: 220, carbs: 320, fats: 120, fibre: 50 };

  return (
    <div className="macro-bars">
      {[
        { key: 'protein', label: 'Protein' },
        { key: 'carbs',   label: 'Carbs' },
        { key: 'fats',    label: 'Fats' },
        { key: 'fibre',   label: 'Fibre' },
      ].map(({ key, label }) => (
        <div className="macro-bar-row" key={key}>
          <span className="macro-bar-label">{label}</span>
          <div className="macro-bar-track">
            <div
              className="macro-bar-fill"
              style={{ width: `${Math.min(100, Math.round(((macros[key] || 0) / maxByMacro[key]) * 100))}%` }}
            />
          </div>
          <span className="macro-bar-pct">{macros[key] || 0}g</span>
        </div>
      ))}
    </div>
  );
}

function readAnswersFromParams(params) {
  try {
    const q = params.get('q');
    return q ? JSON.parse(atob(q)) : null;
  } catch {
    return null;
  }
}

function readSavedAnswers() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = JSON.parse(window.localStorage.getItem(QUIZ_LAST_ANSWERS_KEY) || 'null');
    return saved?.answers || null;
  } catch {
    return null;
  }
}

function writeSavedAnswers(answers) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(QUIZ_LAST_ANSWERS_KEY, JSON.stringify({
      answers,
      savedAt: Date.now(),
    }));
  } catch {
    // Results still work without local storage.
  }
}
