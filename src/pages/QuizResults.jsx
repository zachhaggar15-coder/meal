import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { getTopMatches } from '../utils/quizScorer.js';
import { PLAN_COUNT } from '../data/planSeeds.js';

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
  'morrisons': 'Morrisons', 'iceland': 'Iceland', 'any': 'Any UK supermarket',
};

export default function QuizResults() {
  const [params] = useSearchParams();

  const answers = useMemo(() => {
    try {
      const q = params.get('q');
      return q ? JSON.parse(atob(q)) : {};
    } catch {
      return {};
    }
  }, [params]);

  const matches = useMemo(() => getTopMatches(answers, 3), [answers]);

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
        <div className="result-card result-card--best">
          <div className="result-card-badge result-card-badge--best">{best.matchLabel}</div>
          <div className="result-card-score">{best.score}% match</div>
          <h2 className="result-card-title">{best.title}</h2>
          <p className="result-card-reason">{best.matchReason}</p>

          <div className="result-card-meta">
            <span className="result-meta-pill">{MKT_LABELS[best.supermarket] || best.supermarket}</span>
            <span className="result-meta-pill">~{best.calories} kcal/day</span>
            <span className="result-meta-pill">{best.priceEstimate}/week</span>
            <span className="result-meta-pill">{EFFORT_LABELS[best.effort] || best.effort}</span>
            {best.dietType !== 'standard' && (
              <span className="result-meta-pill">{DIET_LABELS[best.dietType] || best.dietType}</span>
            )}
          </div>

          <MacroBars macros={best.macros} />

          <Link to={`/plans/${best.slug}`} className="result-card-cta result-card-cta--primary">
            View Full Plan →
          </Link>
        </div>

        {/* Other matches */}
        {rest.map((match, i) => (
          <div className="result-card result-card--alt" key={match.slug}>
            <div className="result-card-badge">{match.matchLabel}</div>
            <div className="result-card-score">{match.score}% match</div>
            <h2 className="result-card-title result-card-title--sm">{match.title}</h2>
            <p className="result-card-reason">{match.matchReason}</p>

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

function MacroBars({ macros }) {
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
            <div className="macro-bar-fill" style={{ width: `${macros[key] || 50}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
