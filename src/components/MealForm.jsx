import { useState } from 'react';

const SUPERMARKETS = ['Tesco', 'Aldi', "Sainsbury's", 'Asda'];
const DIETS = ['standard', 'vegetarian', 'vegan'];
const MEALS_PER_DAY = [3, 4, 5];

export default function MealForm({ onSubmit, disabled }) {
  const [calories, setCalories] = useState(1800);
  const [meals, setMeals] = useState(3);
  const [diet, setDiet] = useState('standard');
  const [supermarket, setSupermarket] = useState('Tesco');
  const [include, setInclude] = useState('');
  const [avoid, setAvoid] = useState('');
  const [snacks, setSnacks] = useState(false);
  const [shoppingList, setShoppingList] = useState(true);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      calories: Number(calories) || 1800,
      meals: Number(meals),
      diet,
      supermarket,
      include: include.trim(),
      avoid: avoid.trim(),
      snacks,
      shoppingList
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div>
          <label htmlFor="calories">Daily calorie target</label>
          <input
            id="calories"
            type="number"
            min={800}
            max={4000}
            step={50}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="meals">Meals per day</label>
          <select id="meals" value={meals} onChange={(e) => setMeals(e.target.value)}>
            {MEALS_PER_DAY.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="diet">Dietary preference</label>
          <select id="diet" value={diet} onChange={(e) => setDiet(e.target.value)}>
            {DIETS.map((d) => (
              <option key={d} value={d}>{capitalise(d)}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="supermarket">Supermarket</label>
          <select id="supermarket" value={supermarket} onChange={(e) => setSupermarket(e.target.value)}>
            {SUPERMARKETS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="full">
          <label htmlFor="include">Foods to include (optional)</label>
          <input
            id="include"
            type="text"
            placeholder="e.g. chicken, eggs, oats"
            value={include}
            onChange={(e) => setInclude(e.target.value)}
          />
        </div>

        <div className="full">
          <label htmlFor="avoid">Foods to avoid (optional)</label>
          <input
            id="avoid"
            type="text"
            placeholder="e.g. mushrooms, peanuts"
            value={avoid}
            onChange={(e) => setAvoid(e.target.value)}
          />
        </div>

        <div className="full">
          <div className="toggles">
            <label className="toggle">
              <input
                type="checkbox"
                checked={snacks}
                onChange={(e) => setSnacks(e.target.checked)}
              />
              Include snacks
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={shoppingList}
                onChange={(e) => setShoppingList(e.target.checked)}
              />
              Generate shopping list
            </label>
          </div>
        </div>
      </div>

      <button className="submit" type="submit" disabled={disabled}>
        {disabled ? 'Generating…' : 'Generate Plan'}
      </button>
    </form>
  );
}

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
