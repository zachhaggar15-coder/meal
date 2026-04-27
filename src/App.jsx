import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import MealForm from './components/MealForm.jsx';
import MealPlan from './components/MealPlan.jsx';
import ShoppingList from './components/ShoppingList.jsx';
import './App.css';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  // Keep the last submitted form values around so the "Try again" button can re-run.
  const [lastValues, setLastValues] = useState(null);

  async function handleGenerate(values) {
    setLoading(true);
    setError(null);
    setPlan(null);
    setLastValues(values);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || `Server error (${res.status}).`);
      }

      const data = await res.json();
      setPlan(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Low-Calorie Meal Plan Generator</h1>
        <p>Tell us your goal and we&apos;ll build a 7-day plan for you.</p>
      </header>

      <section className="card">
        <MealForm onSubmit={handleGenerate} disabled={loading} />
      </section>

      {loading && (
        <div className="loading">
          <strong>Generating your personalised meal plan…</strong>
          <p style={{ margin: '6px 0 0' }}>This usually takes 10–30 seconds.</p>
        </div>
      )}

      {error && (
        <div className="error">
          <strong>We couldn&apos;t generate your plan.</strong>
          <p style={{ margin: '6px 0 0' }}>{error}</p>
          {lastValues && (
            <button onClick={() => handleGenerate(lastValues)}>Try again</button>
          )}
        </div>
      )}

      {plan?.weekly_plan && <MealPlan weeklyPlan={plan.weekly_plan} />}
      {plan?.shopping_list && lastValues?.shoppingList && (
        <ShoppingList list={plan.shopping_list} price={plan.price_estimate} />
      )}
      <Analytics />
    </div>
  );
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}
