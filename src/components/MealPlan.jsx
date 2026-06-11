import { useState } from 'react';
import { track } from '../utils/analytics.js';

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
      let line = `  ${m.type}: ${m.name} — ${m.calories || 0} kcal, ${m.protein || 0}g protein`;
      if (m.prep_time) line += `, ${m.prep_time}`;
      if (m.portion_size) line += `\n    Portion: ${m.portion_size}`;
      const recipe = getMealRecipe(m);
      if (recipe.length) {
        line += `\n    Recipe:\n${recipe.map((step, index) => `      ${index + 1}. ${step}`).join('\n')}`;
      }
      return line;
    }).join('\n');
    const totals = day.daily_totals
      ? `\n  Total: ${day.daily_totals.calories || 0} kcal · ${day.daily_totals.protein || 0}g protein`
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
    } catch {}
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
    } catch {}
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
                    {meal.protein ? ` · ${meal.protein}g protein` : ''}
                    {meal.prep_time ? ` · ${meal.prep_time}` : ''}
                  </div>
                </div>
                {meal.description && <p className="meal-desc">{meal.description}</p>}
                {meal.portion_size && (
                  <p className="meal-portion"><strong>Portion:</strong> {meal.portion_size}</p>
                )}
                {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
                  <ul className="meal-ingredients">
                    {meal.ingredients.map((ing, iIdx) => (
                      <li key={iIdx}>{formatMealIngredient(ing)}</li>
                    ))}
                  </ul>
                )}
                {getMealRecipe(meal).length > 0 && (
                  <details className="plan-meal-recipe">
                    <summary>Recipe</summary>
                    <ol>
                      {getMealRecipe(meal).map((step, iIdx) => <li key={iIdx}>{step}</li>)}
                    </ol>
                  </details>
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

function getMealRecipe(meal) {
  if (Array.isArray(meal.recipe)) {
    const steps = meal.recipe.map(step => String(step || '').trim()).filter(Boolean);
    if (steps.length) return steps.slice(0, 6);
  }

  if (typeof meal.recipe === 'string') {
    const steps = meal.recipe
      .split(/\n+|(?:^|\s)\d+\.\s*/g)
      .map(step => step.trim())
      .filter(Boolean);
    if (steps.length) return steps.slice(0, 6);
  }

  return buildFallbackRecipe(meal);
}

function buildFallbackRecipe(meal) {
  const ingredients = getIngredientText(meal);
  const name = String(meal.name || '').toLowerCase();

  if (name.includes('smoothie')) {
    return [
      `Add the listed ingredients to a blender: ${ingredients}.`,
      'Blend until smooth, adding a splash of liquid if needed.',
      'Serve chilled straight away.',
    ];
  }

  if (name.includes('oats') || name.includes('yogurt') || String(meal.type || '').toLowerCase().includes('breakfast')) {
    return [
      `Prepare the ingredients: ${ingredients}.`,
      'Combine the base ingredients in a bowl or container and stir well.',
      'Add toppings last and eat straight away or chill until needed.',
    ];
  }

  if (name.includes('wrap') || name.includes('sandwich') || name.includes('toast') || name.includes('pitta')) {
    return [
      'Toast or warm the bread, wrap, pitta, or bagel if preferred.',
      `Prepare the filling ingredients: ${ingredients}.`,
      'Layer everything evenly, season to taste, and serve or wrap for later.',
    ];
  }

  if (name.includes('salad') || name.includes('bowl')) {
    return [
      `Wash, chop, and portion the ingredients: ${ingredients}.`,
      'Cook or warm any grains or protein, then let them cool slightly.',
      'Combine everything in a bowl and keep dressing separate until serving if prepping ahead.',
    ];
  }

  if (name.includes('curry') || name.includes('chilli') || name.includes('stew') || name.includes('soup')) {
    return [
      `Prepare the ingredients: ${ingredients}.`,
      'Cook the protein, aromatics, and firmer vegetables in a pan for 5-8 minutes.',
      'Add the remaining ingredients and simmer until hot, thickened, and cooked through.',
    ];
  }

  if (name.includes('pasta') || name.includes('rice') || name.includes('noodle')) {
    return [
      'Cook the pasta, rice, or noodles according to the packet instructions.',
      `Prepare the remaining ingredients while it cooks: ${ingredients}.`,
      'Combine everything, heat through, season to taste, and portion if meal prepping.',
    ];
  }

  return [
    `Prepare the ingredients: ${ingredients}.`,
    'Cook the main protein or vegetables in a pan over medium heat until cooked through.',
    'Add the remaining ingredients, heat until piping hot, season to taste, and serve.',
  ];
}

function getIngredientText(meal) {
  if (Array.isArray(meal.ingredients) && meal.ingredients.length > 0) {
    return meal.ingredients.map(formatMealIngredient).filter(Boolean).join(', ');
  }
  return meal.portion_size || meal.name || 'the listed ingredients';
}

function formatMealIngredient(ingredient) {
  if (typeof ingredient === 'object' && ingredient !== null) {
    const name = ingredient.item || ingredient.name || '';
    const amount = ingredient.amount ? ` ${ingredient.amount}` : '';
    return `${name}${amount}`.trim();
  }
  return String(ingredient || '').trim();
}
