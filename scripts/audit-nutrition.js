import { MEALS } from '../src/data/mealLibrary.js';
import { PLAN_1500, PLAN_HIGH_PROTEIN, PLAN_VEGAN, PLAN_VEGETARIAN } from '../src/data/mealPlans.js';
import { computeMealNutrition, percentDiff } from './lib/nutritionAudit.js';
import fs from 'fs';

const rows = [];

for (const meal of MEALS) {
  const computed = computeMealNutrition(meal.ingredients);
  rows.push({
    file: 'mealLibrary.js',
    id: meal.id,
    name: meal.name,
    storedKcal: meal.cal,
    computedKcal: computed.kcal,
    kcalDiffPct: percentDiff(meal.cal, computed.kcal),
    storedProtein: meal.pro,
    computedProtein: computed.protein,
    computedCarbs: computed.carbs,
    computedFats: computed.fats,
    computedFibre: computed.fibre,
    unmatched: computed.unmatched,
  });
}

const legacyPlans = { PLAN_1500, PLAN_HIGH_PROTEIN, PLAN_VEGAN, PLAN_VEGETARIAN };
for (const [planName, days] of Object.entries(legacyPlans)) {
  for (const day of days) {
    for (const meal of day.meals) {
      if (!meal.portion_size) continue;
      const computed = computeMealNutrition(meal.portion_size);
      rows.push({
        file: `mealPlans.js:${planName}`,
        id: `${day.day}:${meal.name}`,
        name: meal.name,
        storedKcal: meal.kcal,
        computedKcal: computed.kcal,
        kcalDiffPct: percentDiff(meal.kcal, computed.kcal),
        storedProtein: meal.protein,
        computedProtein: computed.protein,
        computedCarbs: computed.carbs,
        computedFats: computed.fats,
        computedFibre: computed.fibre,
        unmatched: computed.unmatched,
      });
    }
  }
}

const unparsedRows = rows.filter(r => r.unmatched.length > 0);
const computedRows = rows
  .filter(r => r.unmatched.length === 0)
  .sort((a, b) => Math.abs(b.kcalDiffPct) - Math.abs(a.kcalDiffPct));

console.log(`Total meals audited: ${rows.length}`);
console.log(`Meals with unmatched ingredients: ${unparsedRows.length}`);
console.log(`Meals with a clean computed total: ${computedRows.length}\n`);

console.log('--- Unmatched ingredients (not computed, needs a table entry) ---');
for (const r of unparsedRows) {
  console.log(`[${r.file}] ${r.name}: ${r.unmatched.join(' | ')}`);
}

console.log('\n--- Largest calorie diffs (stored vs. computed) ---');
for (const r of computedRows.slice(0, 40)) {
  console.log(`${r.kcalDiffPct >= 0 ? '+' : ''}${r.kcalDiffPct}%\t[${r.file}] ${r.name}: stored ${r.storedKcal}kcal, computed ${r.computedKcal}kcal (protein stored ${r.storedProtein}g, computed ${r.computedProtein}g, carbs ${r.computedCarbs}g, fats ${r.computedFats}g, fibre ${r.computedFibre}g)`);
}

const outPath = new URL('./output/nutrition-audit.json', import.meta.url);
fs.mkdirSync(new URL('./output/', import.meta.url), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ unparsedRows, computedRows }, null, 2));
console.log(`\nFull report written to ${outPath.pathname.replace(/^\//, '')}`);
