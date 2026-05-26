import { Link } from 'react-router-dom';

export default function GeneratorCTA({ sourcePage, calories, supermarket, compact = false }) {
  const params = new URLSearchParams();
  if (sourcePage) params.set('from', sourcePage);
  if (supermarket) params.set('supermarket', supermarket);
  if (calories) params.set('kcal', String(calories));
  const query = params.toString();
  const to = query ? `/?${query}` : '/';

  return (
    <div className={`generator-cta${compact ? ' generator-cta--compact' : ''}`}>
      <h2 className="generator-cta-headline">Want this tailored to your calories?</h2>
      <p className="generator-cta-body">
        Build a free 7-day plan with meals, calories, protein, and a UK supermarket shopping
        list matched to your budget and food preferences.
      </p>
      <div className="generator-cta-btns">
        <Link
          to={to}
          className="btn-primary"
          data-event="generator_cta_click"
          data-source-page={sourcePage || ''}
        >
          Build my free 7-day plan
        </Link>
        <Link to="/#popular-plans" className="generator-cta-secondary">
          See example meal plans
        </Link>
      </div>
    </div>
  );
}
