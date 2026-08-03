import { Link } from 'react-router-dom';

export default function QuizNudge({
  sourcePage,
  pageType = 'content',
  location = 'quiz_nudge',
  className = '',
}) {
  const classes = ['quiz-nudge', className].filter(Boolean).join(' ');

  return (
    <aside className={classes} aria-label="Meal plan quiz">
      <div className="quiz-nudge-copy">
        <span className="quiz-nudge-eyebrow">Plan finder</span>
        <h2>Get matched to your best plan in under a minute</h2>
        <p>
          Answer seven quick questions about your goal, diet, supermarket, calories,
          budget and cooking style.
        </p>
      </div>
      <Link
        to="/quiz"
        className="btn-primary quiz-nudge-action"
        data-event="quiz_nudge_click"
        data-source-page={sourcePage || ''}
        data-page-type={pageType}
        data-cta-location={location}
      >
        Find my best plan
      </Link>
    </aside>
  );
}
