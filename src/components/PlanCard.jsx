import { Link } from 'react-router-dom';
import {
  planCardFamily,
  planCardTitle,
  planEffortShort,
  planGoalShort,
  planMarketShort,
} from '../utils/planCardMeta.js';

// Shared browse-grid card used by every list of meal plans (browse, supermarket
// and combo hubs). A goal-coded banner makes the grid scannable, a stat strip
// front-loads the three figures people compare on (calories, cost, effort), and
// the plan name sits underneath as a caption. Keeping it in one component means
// the design stays consistent across pages instead of drifting per page.
export default function PlanCard({ plan }) {
  const family = planCardFamily(plan.goal);
  const goalShort = planGoalShort(plan.goal, plan.goalLabel);
  const hasDiet = plan.dietType && plan.dietType !== 'standard';

  return (
    <Link to={`/plans/${plan.slug}`} className={`plan-card pc-${family}`}>
      <div className="pc-banner">
        <span className="pc-goal">{goalShort}</span>
        <span className="pc-store">{planMarketShort(plan.supermarket)}</span>
      </div>
      <div className="pc-body">
        <div className="pc-stats">
          <div className="pc-stat">
            <b>{plan.calories.toLocaleString('en-GB')}</b>
            <span>kcal</span>
          </div>
          <div className="pc-stat">
            <b>{plan.priceEstimate}</b>
            <span>/week</span>
          </div>
          <div className="pc-stat">
            <b>{planEffortShort(plan.effort)}</b>
            <span>effort</span>
          </div>
        </div>
        <div className="pc-titles">
          <h3 className="pc-title">{planCardTitle(plan.title)}</h3>
          <span className="pc-sub">7-day plan · shopping list · PDF</span>
        </div>
        <div className="pc-foot">
          {hasDiet
            ? <span className="pc-diet">{cap(plan.dietType)}</span>
            : <span />}
          <span className="pc-view" aria-hidden="true">View plan &rarr;</span>
        </div>
      </div>
    </Link>
  );
}

function cap(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}
