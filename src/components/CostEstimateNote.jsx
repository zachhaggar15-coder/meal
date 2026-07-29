import { Link } from 'react-router-dom';

export default function CostEstimateNote({
  supermarket = 'the selected UK supermarket',
  compact = false,
  className = '',
}) {
  return (
    <aside
      className={['cost-estimate-note', compact ? 'cost-estimate-note--compact' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-label="How this cost estimate works"
    >
      <strong>What this estimate means</strong>
      <p>
        This is an approximate planning range for ingredients in this plan at {supermarket},
        not a live checkout total. It may treat common cupboard staples as already available
        and does not precisely price every pack-size leftover. Brands, offers, substitutions,
        pack sizes and regional prices will change what you pay.
      </p>
      <Link to="/about#meal-plan-costs">How meal-plan costs are estimated</Link>
    </aside>
  );
}
