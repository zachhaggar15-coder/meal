import { Link } from 'react-router-dom';

// Concise plan-level food-safety guidance. Deliberately short: the detailed
// explanation and sources live on /methodology#food-safety, and individual
// recipes only carry extra wording when something genuinely needs special
// handling. Every figure below comes from current FSA or NHS guidance —
// see the Methodology page for the citations.
export default function StorageSafetyNote({ className = '' }) {
  return (
    <aside
      className={['storage-safety-note', className].filter(Boolean).join(' ')}
      aria-labelledby="storage-safety-heading"
    >
      <h2 id="storage-safety-heading">Storing this plan safely</h2>
      <p>
        A week of meals is not a week of fridge life. Batch-cooking once and refrigerating
        everything until Friday is not safe — freeze anything you will not eat within two days,
        or cook the later half of the week separately.
      </p>
      <ul className="storage-safety-list">
        <li>
          <strong>Cool then chill.</strong> Cool cooked food and get it into the fridge within
          one to two hours. Keep your fridge between 0°C and 5°C.
        </li>
        <li>
          <strong>Two days chilled.</strong> Eat refrigerated leftovers within 48 hours, or
          freeze them instead.
        </li>
        <li>
          <strong>Rice is stricter.</strong> Cool cooked rice within one hour, use it within
          24 hours, and never reheat it more than once.
        </li>
        <li>
          <strong>Reheat properly.</strong> Reheat until steaming hot all the way through —
          at least 70°C in the middle — and only reheat a meal once.
        </li>
        <li>
          <strong>Defrost in the fridge.</strong> Once fully defrosted, treat food as fresh and
          use it within 24 hours.
        </li>
      </ul>
      <p className="storage-safety-links">
        <Link to="/methodology#food-safety">How we handle food safety</Link>
        {' · '}
        <a
          href="https://www.food.gov.uk/safety-hygiene/how-to-chill-freeze-and-defrost-food-safely"
          target="_blank"
          rel="noopener noreferrer"
        >
          FSA chilling and freezing guidance
        </a>
        {' · '}
        <a
          href="https://www.nhs.uk/common-health-questions/food-and-diet/can-reheating-rice-cause-food-poisoning/"
          target="_blank"
          rel="noopener noreferrer"
        >
          NHS advice on reheating rice
        </a>
      </p>
    </aside>
  );
}
