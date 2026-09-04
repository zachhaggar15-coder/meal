import { useMemo } from 'react';
import ProductPicks from './ProductPicks.jsx';
import { getPlanKitPick } from '../utils/planKit.js';

// Renders the single kit item a plan's own method calls for, or nothing.
//
// Deliberately thin: ProductPicks already carries the disclosure, the tracking
// attributes and the card styling, and the affiliate-disclosure build gate
// checks the rendered output. Reusing it keeps one code path for every Amazon
// card on the site rather than a second one that has to be kept in step.
export default function PlanKitPick({ plan, portions, sourcePage = 'plan-kit' }) {
  const pick = useMemo(() => getPlanKitPick(plan, { portions }), [plan, portions]);

  if (!pick) return null;

  return (
    <ProductPicks
      title={pick.title}
      intro={pick.intro}
      productIds={[pick.product.id]}
      sourcePage={sourcePage}
      showQuickComparison={false}
      recommendationSource="plan_method"
    />
  );
}
