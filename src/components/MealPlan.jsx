import { useState } from 'react';
import RecipeDetails from './RecipeDetails.jsx';
import { track } from '../utils/analytics.js';
import { getCookingIngredientDisplay } from '../utils/cookingQuantities.js';
import { buildPracticalRecipeSteps } from '../utils/recipeQuality.js';

function buildShoppingText(list, price) {
  const lines = [];
  for (const [group, items] of Object.entries(list)) {
    if (!Array.isArray(items) || items.length === 0) continue;
    lines.push(group.toUpperCase());
    for (const item of items) {
      if (typeof item === 'object' && item !== null) {
        let line = `• ${item.name}`;
        if (item.amount) line += ` — ${item.amount}`;
        if (item.packs) line += ` (${item.packs})`;
        lines.push(line);
      } else {
        lines.push(`• ${item}`);
      }
    }
    lines.push('');
  }
  if (price?.total) lines.push(`Estimated cost: ${price.total}`);
  if (price?.notes) lines.push(price.notes);
  return lines.join('\n');
}

function buildPlanText(weeklyPlan) {
  return weeklyPlan.map(day => {
    const meals = day.meals.map(m => {
      let line = `  ${m.type}: ${m.name} — ${m.calories || 0} kcal, ${formatFullMacros(m, ', ')}`;
      if (m.prep_time) line += `, ${m.prep_time}`;
      const cookingIngredients = getCookingIngredientDisplay(
        m.calculationIngredients || m.ingredients || m.portion_size,
      );
      if (cookingIngredients.length) {
        line += `\n    Ingredients: ${cookingIngredients.join(', ')}`;
      }
      const recipe = getMealRecipe(m);
      if (recipe.length) {
        line += `\n    Recipe:\n${recipe.map((step, index) => `      ${index + 1}. ${step}`).join('\n')}`;
      }
      return line;
    }).join('\n');
    const totals = day.daily_totals
      ? `\n  Total: ${day.daily_totals.calories || 0} kcal · ${formatFullMacros(day.daily_totals)}`
      : '';
    return `${day.day || 'Day'}\n${meals}${totals}`;
  }).join('\n\n');
}

export default function MealPlan({ plan, weeklyPlan, shoppingList, price }) {
  const resolvedWeeklyPlan = weeklyPlan || plan?.weekly_plan;
  const resolvedShoppingList = shoppingList || plan?.shopping_list;
  const resolvedPrice = price || plan?.price_estimate;

  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [shared, setShared] = useState(false);

  if (!Array.isArray(resolvedWeeklyPlan) || resolvedWeeklyPlan.length === 0) return null;

  async function copyPlan() {
    const text = `YOUR MEAL PLAN\n${'='.repeat(40)}\n\n${buildPlanText(resolvedWeeklyPlan)}\n\nGenerated at mealprep.org.uk`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      track.planCopied();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access is best-effort; the plan remains visible.
    }
  }

  async function copyAll() {
    const sep = `\n${'='.repeat(40)}\n`;
    let text = `YOUR MEAL PLAN${sep}\n${buildPlanText(resolvedWeeklyPlan)}`;
    if (resolvedShoppingList) {
      text += `\n\nSHOPPING LIST${sep}\n${buildShoppingText(resolvedShoppingList, resolvedPrice)}`;
    }
    text += '\n\nGenerated at mealprep.org.uk';
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      track.planCopied();
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // Clipboard access is best-effort; the plan remains visible.
    }
  }

  async function sharePlan() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My UK Meal Plan — MealPrep.org.uk',
          text: buildPlanText(resolvedWeeklyPlan),
          url: 'https://www.mealprep.org.uk/',
        });
        setShared(true);
        track.shareClicked();
        setTimeout(() => setShared(false), 2000);
      } catch {
        // A cancelled native share is not an application error.
      }
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
          {resolvedShoppingList && (
            <button className="action-btn" onClick={copyAll}>
              {copiedAll ? '✓ Copied!' : 'Copy all'}
            </button>
          )}
          <button className="action-btn" onClick={sharePlan}>
            {shared ? '✓ Shared!' : 'Share'}
          </button>
          <button className="action-btn" onClick={printPlan}>Print</button>
        </div>
      </div>

      {resolvedWeeklyPlan.map((day, idx) => (
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
                    {hasAnyMacro(meal) ? ` · ${formatCoreMacros(meal)}` : ''}
                    {meal.prep_time ? ` · ${meal.prep_time}` : ''}
                  </div>
                </div>
                {meal.description && <p className="meal-desc">{meal.description}</p>}
                <RecipeDetails meal={meal} />
              </div>
            ))}
          {day.daily_totals && (
            <div className="daily-totals">
              Daily total:{' '}
              {day.daily_totals.calories || 0} kcal ·{' '}
              {formatFullMacros(day.daily_totals)}
            </div>
          )}
        </div>
      ))}
    </section>
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

function formatFullMacros(source = {}, separator = ' · ') {
  return [
    `${macroValue(source, 'protein')}g protein`,
    `${macroValue(source, 'carbs')}g carbs`,
    `${macroValue(source, 'fats')}g fat`,
    `${macroValue(source, 'fibre')}g fibre`,
  ].join(separator);
}

function getMealRecipe(meal) {
  const calculationIngredients = meal.calculationIngredients || meal.ingredients || meal.portion_size;
  return buildPracticalRecipeSteps({ ...meal, ingredients: calculationIngredients });
}
