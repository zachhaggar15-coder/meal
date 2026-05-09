import { useState } from 'react';
import { track } from '../utils/analytics.js';

function buildPlanText(weeklyPlan) {
  return weeklyPlan.map(day => {
    const meals = day.meals.map(m => {
      let line = `  ${m.type}: ${m.name} — ${m.calories || 0} kcal, ${m.protein || 0}g protein`;
      if (m.prep_time) line += `, ${m.prep_time}`;
      if (m.portion_size) line += `\n    Portion: ${m.portion_size}`;
      return line;
    }).join('\n');
    const totals = day.daily_totals
      ? `\n  Total: ${day.daily_totals.calories || 0} kcal · ${day.daily_totals.protein || 0}g protein`
      : '';
    return `${day.day || 'Day'}\n${meals}${totals}`;
  }).join('\n\n');
}

export default function MealPlan({ weeklyPlan }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  if (!Array.isArray(weeklyPlan) || weeklyPlan.length === 0) return null;

  async function copyPlan() {
    const text = `YOUR MEAL PLAN\n${'='.repeat(40)}\n\n${buildPlanText(weeklyPlan)}\n\nGenerated at mealprep.org.uk`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      track.planCopied();
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function sharePlan() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My UK Meal Plan — MealPrep.org.uk',
          text: buildPlanText(weeklyPlan),
          url: 'https://www.mealprep.org.uk/',
        });
        setShared(true);
        track.shareClicked();
        setTimeout(() => setShared(false), 2000);
      } catch {}
    } else {
      await copyPlan();
    }
  }

  function printPlan() {
    track.printClicked();
    window.print();
  }

  return (
    <section>
      <div className="plan-actions">
        <h2 style={{ margin: 0 }}>Your weekly plan</h2>
        <div className="plan-action-btns">
          <button className="action-btn" onClick={copyPlan}>
            {copied ? '✓ Copied!' : 'Copy plan'}
          </button>
          <button className="action-btn" onClick={sharePlan}>
            {shared ? '✓ Shared!' : 'Share'}
          </button>
          <button className="action-btn" onClick={printPlan}>Print</button>
        </div>
      </div>

      {weeklyPlan.map((day, idx) => (
        <div key={idx} className="card day-card">
          <h3>{day.day || `Day ${idx + 1}`}</h3>
          {Array.isArray(day.meals) &&
            day.meals.map((meal, mIdx) => (
              <div key={mIdx} className="meal">
                <div className="meal-header">
                  <div>
                    <span className="meal-type">{meal.type}</span>
                    <span className="meal-name">{meal.name}</span>
                  </div>
                  <div className="meal-meta">
                    {meal.calories ? `${meal.calories} kcal` : ''}
                    {meal.protein ? ` · ${meal.protein}g protein` : ''}
                    {meal.prep_time ? ` · ${meal.prep_time}` : ''}
                  </div>
                </div>
                {meal.description && <p className="meal-desc">{meal.description}</p>}
                {meal.portion_size && (
                  <p className="meal-portion"><strong>Portion:</strong> {meal.portion_size}</p>
                )}
              </div>
            ))}
          {day.daily_totals && (
            <div className="daily-totals">
              Daily total:{' '}
              {day.daily_totals.calories || 0} kcal ·{' '}
              {day.daily_totals.protein || 0}g protein
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
