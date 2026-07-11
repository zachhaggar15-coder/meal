import { useState } from 'react';

export default function MealPromptBox({ meal, onSwap }) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!instruction.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const syntheticPlan = {
      weekly_plan: [{
        day: 'Monday',
        meals: [{
          type: meal.type || 'Meal',
          name: meal.name,
          description: meal.desc || meal.description || '',
          calories: meal.kcal || meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || meal.carbohydrates || 0,
          fats: meal.fats || meal.fat || 0,
          fibre: meal.fibre || meal.fiber || 0,
          prep_time: meal.prep_time || meal.prep || '',
          portion_size: meal.portion_size || '',
          ingredients: normalisePromptIngredients(meal),
          recipe: normalisePromptRecipe(meal.recipe),
        }],
        daily_totals: {
          calories: meal.kcal || meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || meal.carbohydrates || 0,
          fats: meal.fats || meal.fat || 0,
          fibre: meal.fibre || meal.fiber || 0,
        },
      }],
    };

    try {
      const res = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: syntheticPlan, instruction: instruction.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      const newMeal = data?.weekly_plan?.[0]?.meals?.[0];
      if (!newMeal) throw new Error('No meal returned. Please try again.');
      setResult(newMeal);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setInstruction('');
    setError(null);
  }

  return (
    <div className="meal-prompt-box">
      <button
        className="meal-prompt-toggle"
        onClick={() => { setOpen(o => !o); reset(); }}
        aria-expanded={open}
        type="button"
      >
        {open ? '▴ Close' : '▾ Swap this meal'}
      </button>
      {open && (
        <div className="meal-prompt-content">
          {result ? (
            <div className="meal-prompt-result">
              <p className="meal-prompt-result-name">{result.name}</p>
              {(result.calories || hasAnyMacro(result)) && (
                <p className="meal-prompt-result-meta">
                  {result.calories ? `${result.calories} kcal` : ''}
                  {result.calories && hasAnyMacro(result) ? ' · ' : ''}
                  {hasAnyMacro(result) ? formatCoreMacros(result) : ''}
                </p>
              )}
              {result.description && <p className="meal-prompt-result-desc">{result.description}</p>}
              {Array.isArray(result.recipe) && result.recipe.length > 0 && (
                <details className="plan-meal-recipe">
                  <summary>Recipe</summary>
                  <ol>
                    {result.recipe.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </details>
              )}
              <div className="meal-prompt-result-actions">
                {onSwap && (
                  <button
                    className="submit meal-prompt-apply"
                    type="button"
                    onClick={() => { onSwap(result); reset(); setOpen(false); }}
                  >
                    Apply swap
                  </button>
                )}
                <button className="action-btn" onClick={reset} type="button">Try another</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="meal-prompt-form">
              <input
                className="meal-prompt-input"
                type="text"
                value={instruction}
                onChange={e => setInstruction(e.target.value)}
                placeholder='e.g. "make it vegetarian" or "no chicken"'
                disabled={loading}
                autoFocus
              />
              {error && <p className="edit-plan-error" role="alert">{error}</p>}
              <button
                className="submit meal-prompt-submit"
                type="submit"
                disabled={loading || !instruction.trim()}
              >
                {loading ? 'Generating…' : 'Regenerate meal'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function macroValue(source = {}, key) {
  const aliases = {
    carbs: ['carbs', 'carbohydrates'],
    fats: ['fats', 'fat'],
    fibre: ['fibre', 'fiber'],
  };
  const keys = aliases[key] || [key];
  for (const candidate of keys) {
    const value = Number(source?.[candidate]);
    if (Number.isFinite(value)) return Math.round(value);
  }
  return 0;
}

function hasAnyMacro(source = {}) {
  return ['protein', 'carbs', 'fats', 'fibre'].some(key => macroValue(source, key) > 0);
}

function formatCoreMacros(source = {}) {
  return `${macroValue(source, 'protein')}g protein · ${macroValue(source, 'carbs')}g carbs`;
}

function normalisePromptIngredients(meal) {
  if (Array.isArray(meal.ingredients) && meal.ingredients.length > 0) {
    return meal.ingredients;
  }
  if (meal.portion_size) {
    return String(meal.portion_size)
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalisePromptRecipe(recipe) {
  if (Array.isArray(recipe)) {
    return recipe.map(step => String(step || '').trim()).filter(Boolean);
  }
  return [];
}
