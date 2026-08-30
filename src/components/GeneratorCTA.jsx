import { Link } from 'react-router-dom';

export default function GeneratorCTA({ sourcePage, calories, supermarket, compact = false }) {
  return (
    <div className={`generator-cta${compact ? ' generator-cta--compact' : ''}`}>
      {/* This said "the free AI meal plan generator". Plans are assembled from
          a curated UK meal library by deterministic rules, which is what
          /about and /methodology both describe — the only AI on the site is
          the optional single-meal swap. Claiming an AI generator here
          contradicted our own methodology page. */}
      <h2 className="generator-cta-headline">Want a plan matched to you?</h2>
      <p className="generator-cta-body">
        Use the free plan finder to match your calories, protein target, budget, supermarket and
        dietary preferences against the whole UK plan library.
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
          Find my best-matched meal plan
        </Link>
        <Link to="/#popular-plans" className="generator-cta-secondary">
          See example meal plans
        </Link>
      </div>
    </div>
  );
}
