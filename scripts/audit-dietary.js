import { MEALS } from '../src/data/mealLibrary.js';
import { computeMealNutrition } from '../src/utils/nutrition.js';
import { writeAuditJson } from './lib/auditOutput.js';

const meatTerms = [
  'chicken', 'turkey', 'beef', 'steak', 'lamb', 'pork', 'bacon', 'ham',
  'sausage', 'jerky',
];
const fishTerms = [
  'salmon', 'tuna', 'cod', 'haddock', 'mackerel', 'sardine', 'prawn',
  'trout', 'anchovy', 'fish',
];
const animalTerms = [
  ...meatTerms,
  ...fishTerms,
  'egg', 'milk', 'yogurt', 'yoghurt', 'cheese', 'whey', 'honey', 'butter',
  'halloumi', 'feta', 'mozzarella', 'parmesan', 'skyr', 'kefir', 'ricotta',
];
const errors = [];
const records = [];

for (const meal of MEALS) {
  const text = `${meal.name} ${(meal.ingredients || []).join(' ')}`.toLowerCase();
  const taxonomyText = text
    .replace(/\b(?:oat|soy|coconut|almond|plant-based|dairy-free) milk\b/g, '')
    .replace(/\b(?:peanut|almond|cashew|nut) butter\b/g, '')
    .replace(/\btuna steak\b/g, 'tuna')
    .replace(/\bbeef tomato\b/g, 'tomato');
  const prohibited = meal.diet === 'vegan'
    ? findTerms(taxonomyText, animalTerms)
    : meal.diet === 'vegetarian'
      ? findTerms(taxonomyText, [...meatTerms, ...fishTerms])
      : meal.diet === 'pescatarian'
        ? findTerms(taxonomyText, meatTerms)
        : [];
  const nutrition = computeMealNutrition(meal.ingredients);
  const proteinEnergyPercent = nutrition.kcal > 0
    ? (nutrition.protein * 4 / nutrition.kcal) * 100
    : 0;
  const claimsHighProtein = meal.tags?.includes('high-protein') || false;

  if (prohibited.length) {
    errors.push(`${meal.id}: ${meal.diet} label conflicts with ${prohibited.join(', ')}`);
  }
  if (claimsHighProtein && proteinEnergyPercent < 20) {
    errors.push(`${meal.id}: high-protein tag has ${proteinEnergyPercent.toFixed(1)}% of energy from protein (minimum 20%)`);
  }

  records.push({
    id: meal.id,
    name: meal.name,
    diet: meal.diet,
    prohibitedTerms: prohibited,
    highProteinTag: claimsHighProtein,
    proteinEnergyPercent: Number(proteinEnergyPercent.toFixed(2)),
    status: prohibited.length || (claimsHighProtein && proteinEnergyPercent < 20) ? 'failed' : 'passed',
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  coverage: {
    sharedMeals: MEALS.length,
    dietaryLabels: Object.fromEntries(
      [...new Set(MEALS.map(meal => meal.diet))].map(diet => [
        diet,
        MEALS.filter(meal => meal.diet === diet).length,
      ]),
    ),
    highProteinTaggedMeals: records.filter(record => record.highProteinTag).length,
    exhaustive: true,
  },
  criteria: {
    vegan: 'No known meat, fish, dairy, egg, honey or whey terms in named ingredients.',
    vegetarian: 'No known meat or fish terms in named ingredients.',
    pescatarian: 'No known meat terms in named ingredients.',
    highProtein: 'At least 20% of source energy is supplied by protein.',
    allergenScope: 'No cross-contamination-free claim is inferred from ingredient taxonomy.',
  },
  errors,
  records,
};
const outputPath = writeAuditJson('dietary-labels.json', report);

if (errors.length) {
  console.error(`Dietary audit failed with ${errors.length} issue(s):`);
  errors.slice(0, 60).forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Dietary audit passed exhaustively for ${MEALS.length} shared meals and ` +
  `${report.coverage.highProteinTaggedMeals} high-protein tags. Report: ${outputPath}`,
);

function findTerms(text, terms) {
  return terms.filter(term => new RegExp(`\\b${term}s?\\b`, 'i').test(text));
}
