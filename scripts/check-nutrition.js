import { MEALS } from '../src/data/mealLibrary.js';
import { PLAN_1500, PLAN_HIGH_PROTEIN, PLAN_VEGAN, PLAN_VEGETARIAN } from '../src/data/mealPlans.js';
import { computeMealNutrition, percentDiff } from './lib/nutritionAudit.js';

// Regression gate: fails if a meal's stored kcal drifts too far from what its
// own ingredient list computes to, or if an ingredient can't be parsed/priced
// at all. Looser than the 8% threshold used when applying bulk fixes, to
// allow for reasonable rounding.
const KCAL_DIFF_TOLERANCE = 12;

const errors = [];
const MACRO_KEYS = ['kcal', 'protein', 'carbs', 'fats', 'fibre'];

function checkMeal(file, id, ingredients, storedKcal) {
  if (storedKcal == null) return;
  const computed = computeMealNutrition(ingredients);
  if (computed.unmatched.length) {
    errors.push(`[${file}] ${id}: unrecognised ingredient(s) — ${computed.unmatched.join(' | ')}`);
    return;
  }

  const invalidMacro = MACRO_KEYS.find(key => !Number.isFinite(computed[key]) || computed[key] < 0);
  if (invalidMacro) {
    errors.push(`[${file}] ${id}: invalid computed ${invalidMacro} value (${computed[invalidMacro]})`);
    return;
  }

  const macroKcal = (computed.protein * 4) + (computed.carbs * 4) + (computed.fats * 9) + (computed.fibre * 2);
  if (computed.kcal >= 100 && Math.abs(macroKcal - computed.kcal) / computed.kcal > 0.35) {
    errors.push(`[${file}] ${id}: macro energy ${Math.round(macroKcal)}kcal is too far from computed ${computed.kcal}kcal`);
  }

  const diff = percentDiff(storedKcal, computed.kcal);
  if (Math.abs(diff) > KCAL_DIFF_TOLERANCE) {
    errors.push(`[${file}] ${id}: stored ${storedKcal}kcal vs. computed ${computed.kcal}kcal (${diff}% diff, exceeds ${KCAL_DIFF_TOLERANCE}%)`);
  }
}

for (const meal of MEALS) {
  checkMeal('mealLibrary.js', meal.id, meal.ingredients, meal.cal);
}

const legacyPlans = { PLAN_1500, PLAN_HIGH_PROTEIN, PLAN_VEGAN, PLAN_VEGETARIAN };
for (const [planName, days] of Object.entries(legacyPlans)) {
  for (const day of days) {
    for (const meal of day.meals) {
      if (!meal.portion_size) continue;
      checkMeal(`mealPlans.js:${planName}`, `${day.day}:${meal.name}`, meal.portion_size, meal.kcal);
    }
  }
}

if (errors.length) {
  console.error(`Nutrition sanity check failed with ${errors.length} issue(s):`);
  errors.slice(0, 80).forEach(e => console.error(`  - ${e}`));
  if (errors.length > 80) console.error(`...and ${errors.length - 80} more`);
  process.exit(1);
}

console.log(`Nutrition sanity check passed for ${MEALS.length} library meals and ${Object.keys(legacyPlans).length} legacy plans, including calories, protein, carbs, fats and fibre.`);
