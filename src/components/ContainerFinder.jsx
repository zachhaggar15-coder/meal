import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AFFILIATE_DISCLOSURE, CONTAINER_GUIDES } from '../data/containerProducts.js';

const TIER_LABEL = {
  budget: 'Budget containers',
  'mid-range': 'Mid-range containers',
  premium: 'Premium containers',
  glass: 'Glass containers',
  plastic: 'Plastic containers',
  leakproof: 'Leakproof containers',
  'freezer-safe': 'Freezer-safe containers',
  'freezer-bags': 'Freezer bags',
  'work-lunch': 'Work lunch boxes',
  'large-sets': 'Large container sets',
};

export default function ContainerFinder({ currentTier = 'mid-range' }) {
  const [material, setMaterial] = useState('either');
  const [useCase, setUseCase] = useState('work');
  const [budget, setBudget] = useState('mid');
  const [meals, setMeals] = useState(10);

  const recommendation = useMemo(() => {
    if (useCase === 'flat-freeze') return 'freezer-bags';
    if (budget === 'low') return 'budget';
    if (meals >= 16) return 'large-sets';
    if (useCase === 'freezer') return 'freezer-safe';
    if (useCase === 'commute') return 'leakproof';
    if (useCase === 'work') return 'work-lunch';
    if (material === 'glass' || useCase === 'microwave') return 'glass';
    if (material === 'plastic') return 'plastic';
    if (budget === 'premium') return 'premium';
    return 'mid-range';
  }, [budget, material, meals, useCase]);

  const guide = CONTAINER_GUIDES[recommendation];
  const isCurrent = recommendation === currentTier;

  return (
    <section className="container-finder" aria-labelledby="container-finder-heading">
      <div className="container-finder-copy">
        <span className="offer-kicker">Container chooser</span>
        <h2 id="container-finder-heading">Find the right meal prep containers</h2>
        <p>
          Choose how you prep and the guide will point you towards budget tubs,
          mid-range glass boxes or premium leak-resistant sets.
        </p>
        <p className="affiliate-disclosure">{AFFILIATE_DISCLOSURE}</p>
      </div>

      <div className="container-finder-controls">
        <ChoiceGroup
          label="Material"
          value={material}
          onChange={setMaterial}
          options={[
            ['either', 'Either'],
            ['plastic', 'Plastic'],
            ['glass', 'Glass'],
          ]}
        />
        <ChoiceGroup
          label="Main use"
          value={useCase}
          onChange={setUseCase}
          options={[
            ['work', 'Work lunches'],
            ['commute', 'Commuting'],
            ['freezer', 'Freezer prep'],
            ['flat-freeze', 'Freezer bags'],
            ['microwave', 'Microwave meals'],
          ]}
        />
        <ChoiceGroup
          label="Budget"
          value={budget}
          onChange={setBudget}
          options={[
            ['low', 'Lowest cost'],
            ['mid', 'Best value'],
            ['premium', 'Buy once'],
          ]}
        />
        <label className="container-finder-slider">
          <span>Meals per prep: {meals}</span>
          <input
            type="range"
            min="4"
            max="21"
            value={meals}
            onChange={e => setMeals(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="container-finder-result">
        <span>Recommended</span>
        <strong>{TIER_LABEL[recommendation]}</strong>
        <p>{guide?.description || 'Compare container guides before buying.'}</p>
        <div className="container-finder-actions">
          <Link className="btn-primary" to={`/meal-prep-containers/${recommendation}`}>
            {isCurrent ? 'Compare picks below' : `View ${TIER_LABEL[recommendation].toLowerCase()}`}
          </Link>
          <Link className="btn-secondary" to="/blog/budget-vs-premium-meal-prep-containers">
            Budget vs premium
          </Link>
        </div>
      </div>
    </section>
  );
}

function ChoiceGroup({ label, value, onChange, options }) {
  return (
    <fieldset className="container-finder-group">
      <legend>{label}</legend>
      <div>
        {options.map(([key, labelText]) => (
          <button
            key={key}
            type="button"
            className={value === key ? 'container-finder-choice container-finder-choice--active' : 'container-finder-choice'}
            onClick={() => onChange(key)}
          >
            {labelText}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
