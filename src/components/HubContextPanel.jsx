import { Link } from 'react-router-dom';
import { toTitleCase } from '../utils/textFormatting.js';

// What this hub's plans actually contain, plus where to go next.
//
// This replaced a fixed 16-link block that was byte-identical on all 55 hub
// pages and was the single largest source of duplicated text between them.
// Everything rendered here is computed from the hub's own matched plans, so it
// differs page to page because the underlying data differs — not because
// wording was varied to look different.
export default function HubContextPanel({ heading, summary, links = [] }) {
  if (!summary && !links.length) return null;

  return (
    <section className="hub-context-panel" aria-labelledby="hub-context-heading">
      <h2 id="hub-context-heading">What is in these plans</h2>

      {summary && (
        <>
          <ul className="hub-context-stats">
            <li>
              <strong>{summary.planCount.toLocaleString('en-GB')}</strong>
              <span>matching plans</span>
            </li>
            {summary.calorieRange && summary.calorieRange.min !== summary.calorieRange.max && (
              <li>
                <strong>
                  {summary.calorieRange.min.toLocaleString('en-GB')}–
                  {summary.calorieRange.max.toLocaleString('en-GB')}
                </strong>
                <span>kcal range</span>
              </li>
            )}
            {summary.medianProtein ? (
              <li>
                <strong>{summary.medianProtein}g</strong>
                <span>typical daily protein</span>
              </li>
            ) : null}
            <li>
              <strong>{summary.marketCount}</strong>
              <span>supermarkets covered</span>
            </li>
          </ul>

          <p className="hub-context-copy">
            {summary.topGoals.length > 0 && (
              <>
                Most of these plans are built for{' '}
                {summary.topGoals.map(goal => String(goal.label).toLowerCase()).join(', ')}
                {summary.marketList ? `, across ${summary.marketList}` : ''}.{' '}
              </>
            )}
            {summary.dietCount > 0 && (
              <>
                {summary.dietCount} of them are {summary.dietList}.{' '}
              </>
            )}
            {summary.batchCount > 0 && (
              <>
                {summary.batchCount} are batch-cook plans
                {summary.lowEffortCount > 0 ? ` and ${summary.lowEffortCount} are low-effort` : ''}
                , if prep time is the thing you are choosing on.
              </>
            )}
          </p>
        </>
      )}

      {links.length > 0 && (
        <div className="hub-context-links">
          <h3>Where to go next from {toTitleCase(heading || 'here')}</h3>
          <ul>
            {links.map(link => (
              <li key={link.to}>
                <Link to={link.to}>{toTitleCase(link.label)}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
