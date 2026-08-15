import { Link } from 'react-router-dom';
import { allergenLabel } from '../utils/allergens.js';

// Plan-level allergen awareness. Deliberately reports only what the site can
// actually know — see src/utils/allergens.js — and never states that a plan is
// free from anything. Rendered once per plan rather than on every recipe so
// that the guidance stays useful instead of becoming repetitive boilerplate.
export default function AllergenNote({ summary, className = '' }) {
  if (!summary) return null;
  const { present = [], varies = [], unclassified = [] } = summary;

  return (
    <aside
      className={['allergen-note', className].filter(Boolean).join(' ')}
      aria-labelledby="allergen-note-heading"
    >
      <h2 id="allergen-note-heading">Allergens in this plan</h2>

      {present.length > 0 ? (
        <>
          <p className="allergen-note-lead">
            Across the whole week, ingredients in this plan include these UK regulated
            allergens. Open any meal&rsquo;s recipe to see which allergens that particular
            meal contains, so you can swap just that one.
          </p>
          <ul className="allergen-chip-list">
            {present.map(key => (
              <li key={key} className="allergen-chip allergen-chip--present">
                {allergenLabel(key)}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="allergen-note-lead">
          No UK regulated allergen was identified from the generic ingredient names in this
          plan. That is not the same as the plan being free from allergens — see below.
        </p>
      )}

      {varies.length > 0 && (
        <>
          <p className="allergen-note-lead">
            These depend on the exact product you buy, so check the label:
          </p>
          <ul className="allergen-chip-list">
            {varies.map(key => (
              <li key={key} className="allergen-chip allergen-chip--varies">
                {allergenLabel(key)}
              </li>
            ))}
          </ul>
        </>
      )}

      {unclassified.length > 0 && (
        <p className="allergen-note-lead">
          {unclassified.length} ingredient{unclassified.length === 1 ? '' : 's'} in this plan
          could not be matched to a known food, so {unclassified.length === 1 ? 'it is' : 'they are'}{' '}
          not covered above.
        </p>
      )}

      <p className="allergen-note-caveat">
        This list is worked out from generic ingredient names, not from product labels. We
        cannot see which brand you buy, how a manufacturer has reformulated a product, or
        whether a food was made in a factory handling other allergens.{' '}
        <strong>Never treat this as an allergen-free statement.</strong> If you are allergic
        or intolerant, always read the label on the product in your basket.
      </p>

      <p className="allergen-note-links">
        <Link to="/methodology#allergens">How we work out allergens</Link>
        {' · '}
        <a
          href="https://www.food.gov.uk/safety-hygiene/food-allergy-and-intolerance"
          target="_blank"
          rel="noopener noreferrer"
        >
          FSA allergy and intolerance advice
        </a>
      </p>
    </aside>
  );
}
