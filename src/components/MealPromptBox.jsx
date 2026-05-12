import { useState } from 'react';

export default function MealPromptBox({ meal }) {
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
        }],
        daily_totals: {
          calories: meal.kcal || meal.calories || 0,
          protein: meal.protein || 0,
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
              {(result.calories || result.protein) && (
                <p className="meal-prompt-result-meta">
                  {result.calories ? `${result.calories} kcal` : ''}
                  {result.calories && result.protein ? ' · ' : ''}
                  {result.protein ? `${result.protein}g protein` : ''}
                </p>
              )}
              {result.description && <p className="meal-prompt-result-desc">{result.description}</p>}
              <button className="action-btn" onClick={reset} type="button">Try another swap</button>
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
              {error && <p className="edit-plan-error">{error}</p>}
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
