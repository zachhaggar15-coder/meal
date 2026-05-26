import { Link } from 'react-router-dom';

export default function GeneratorCTA({ sourcePage, calories, supermarket, compact = false }) {
  return (
    <div className={`generator-cta${compact ? ' generator-cta--compact' : ''}`}>
      <h2 className="generator-cta-headline">Want this meal plan personalised?</h2>
      <p className="generator-cta-body">
        Use the free AI meal plan generator to adapt this plan to your calories, protein target,
        budget, supermarket, dietary preferences, and foods you actually like.
      </p>
      <div className="generator-cta-btns">
        <Link
          to="/"
          className="btn-primary"
          data-event="generator_cta_click"
          data-source-page={sourcePage || ''}
          data-target-calories={calories || ''}
          data-supermarket={supermarket || ''}
        >
          Generate my personalised meal plan
        </Link>
        <Link to="/#popular-plans" className="generator-cta-secondary">
          See example meal plans
        </Link>
      </div>
    </div>
  );
}
