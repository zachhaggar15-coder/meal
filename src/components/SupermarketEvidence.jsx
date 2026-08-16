import { Link } from 'react-router-dom';
import { buildSupermarketContext } from '../utils/supermarketContext.js';
import { toTitleCase } from '../utils/textFormatting.js';

// Retailer-specific substance for editorial pages.
//
// Two halves, both of which a generic meal-prep article cannot reproduce:
// researched facts about how the retailer actually operates, each recorded with
// the source and the date it was checked; and a summary of this site's own plan
// library for that retailer, computed live from the plan data.
//
// Renders nothing when a retailer has neither, rather than printing an empty
// frame or filler.
export default function SupermarketEvidence({ supermarkets = [] }) {
  const contexts = supermarkets
    .map(buildSupermarketContext)
    .filter(context => context && (context.evidence || context.planSummary));

  if (!contexts.length) return null;

  const comparison = contexts.length > 1;

  return (
    <section className="supermarket-evidence" aria-labelledby="supermarket-evidence-heading">
      <h2 id="supermarket-evidence-heading">
        {comparison
          ? 'How these supermarkets differ for meal prep'
          : `What makes ${contexts[0].label} different for meal prep`}
      </h2>

      {contexts.map(context => (
        <div className="supermarket-evidence-block" key={context.supermarket}>
          {comparison && <h3>{context.label}</h3>}

          {context.evidence?.angle && (
            <p className="supermarket-evidence-angle">{context.evidence.angle}</p>
          )}

          {context.evidence?.findings?.length > 0 && (
            <ul className="supermarket-evidence-findings">
              {context.evidence.findings.map(finding => (
                <li key={finding}>{finding}</li>
              ))}
            </ul>
          )}

          {context.planSummary && (
            <div className="supermarket-evidence-plans">
              <h4>{toTitleCase(`${context.label} plans on this site`)}</h4>
              <ul className="supermarket-evidence-stats">
                <li>
                  <strong>{context.planSummary.planCount.toLocaleString('en-GB')}</strong>
                  <span>plans</span>
                </li>
                {context.planSummary.calorieRange && (
                  <li>
                    <strong>
                      {context.planSummary.calorieRange.min.toLocaleString('en-GB')}–
                      {context.planSummary.calorieRange.max.toLocaleString('en-GB')}
                    </strong>
                    <span>kcal range</span>
                  </li>
                )}
                {context.planSummary.medianProtein ? (
                  <li>
                    <strong>{context.planSummary.medianProtein}g</strong>
                    <span>typical daily protein</span>
                  </li>
                ) : null}
                <li>
                  <strong>{context.planSummary.goalCount}</strong>
                  <span>goals covered</span>
                </li>
              </ul>
              <p className="supermarket-evidence-plan-copy">
                {buildPlanSentence(context.planSummary)}{' '}
                {context.planSummary.examplePlan && (
                  <Link to={`/plans/${context.planSummary.examplePlan.slug}`}>See an example plan</Link>
                )}
                {' · '}
                <Link to={context.hubPath}>All {context.label} plans</Link>
              </p>
            </div>
          )}

          {context.evidence && (
            <p className="supermarket-evidence-source">
              Checked against{' '}
              <a href={context.evidence.sourceUrl} target="_blank" rel="noopener noreferrer">
                {context.evidence.source}
              </a>{' '}
              on {formatChecked(context.evidence.checked)}. Ranges and availability change, and
              stock varies by store — treat this as the shape of the range, not a stock list.
            </p>
          )}
        </div>
      ))}
    </section>
  );
}

// Built as one string rather than interpolated JSX: the previous version put
// whitespace before the comma and full stop, producing "low effort , and 12 are
// vegetarian, vegan and pescatarian ."
function buildPlanSentence(summary) {
  const goals = summary.topGoals.map(goal => String(goal.label).toLowerCase()).join(', ');
  const diets = summary.dietCount > 0
    ? `, and ${summary.dietCount} are ${summary.dietList}`
    : '';
  return `Most are built for ${goals}${diets}. Every one comes with its own shopping list and calculated nutrition.`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatChecked(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!match) return String(value || '');
  const [, year, month, day] = match;
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}
