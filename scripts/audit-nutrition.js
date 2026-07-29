import { MEALS } from '../src/data/mealLibrary.js';
import {
  NUTRITION_MACRO_OVERRIDES,
  NUTRITION_SYNONYMS,
  NUTRITION_TABLE,
} from '../src/data/nutritionTable.js';
import {
  PLAN_1500,
  PLAN_HIGH_PROTEIN,
  PLAN_VEGAN,
  PLAN_VEGETARIAN,
} from '../src/data/mealPlans.js';
import {
  computeMealNutritionRaw,
  roundNutrition,
  splitIngredientText,
} from '../src/utils/nutrition.js';
import { PROTEIN_FOODS } from '../src/data/proteinValueData.js';
import { hasValidIngredientQuantity } from '../src/utils/ingredientParser.js';
import { writeAuditJson } from './lib/auditOutput.js';

const legacyPlans = { PLAN_1500, PLAN_HIGH_PROTEIN, PLAN_VEGAN, PLAN_VEGETARIAN };
const records = [
  ...MEALS.map(meal => ({
    recordIdentifier: meal.id,
    mealOrPlanName: meal.name,
    sourceFile: 'src/data/mealLibrary.js',
    publishedUrlsAffected: ['All generated plan pages that select this shared meal'],
    ingredients: meal.ingredients,
    storedValues: { kcal: meal.cal, protein: meal.pro },
  })),
  ...Object.entries(legacyPlans).flatMap(([planName, days]) => (
    days.flatMap(day => day.meals.map(meal => ({
      recordIdentifier: `${planName}:${day.day}:${meal.name}`,
      mealOrPlanName: meal.name,
      sourceFile: `src/data/mealPlans.js#${planName}`,
      publishedUrlsAffected: ['Legacy /meal-plan/* pages derived from this base plan'],
      ingredients: splitIngredientText(meal.portion_size || meal.ingredients || ''),
      storedValues: { kcal: meal.kcal, protein: meal.protein },
    })))
  )),
];

const errors = [];
const discrepancies = [];
const uniqueIngredientLines = new Set();
let ingredientOccurrences = 0;
let explicitExclusions = 0;
let volumeOccurrences = 0;

for (const record of records) {
  const raw = computeMealNutritionRaw(record.ingredients);
  const calculated = roundNutrition(raw);
  const macroEnergy = (raw.protein * 4) + (raw.carbs * 4) + (raw.fats * 9) + (raw.fibre * 2);
  const energyDifferencePercent = raw.kcal > 0
    ? (Math.abs(macroEnergy - raw.kcal) / raw.kcal) * 100
    : 0;
  const stored = {
    kcal: Number(record.storedValues.kcal),
    protein: Number(record.storedValues.protein),
  };
  const absoluteDifference = {
    kcal: Math.abs(stored.kcal - calculated.kcal),
    protein: Math.abs(stored.protein - calculated.protein),
  };
  const percentageDifference = {
    kcal: percentageDiff(stored.kcal, calculated.kcal),
    protein: percentageDiff(stored.protein, calculated.protein),
  };

  for (const ingredient of raw.ingredientsAudit) {
    ingredientOccurrences += 1;
    uniqueIngredientLines.add(ingredient.line.toLowerCase());
    if (ingredient.parsed?.excluded) explicitExclusions += 1;
    if (ingredient.parsed?.unit === 'ml' || ingredient.parsed?.unit === 'l') volumeOccurrences += 1;
    if (!ingredient.matched) {
      errors.push(`${record.recordIdentifier}: unresolved ingredient "${ingredient.line}"${ingredient.reason ? ` (${ingredient.reason})` : ''}`);
    }
    if (!ingredient.parsed?.excluded && !hasValidIngredientQuantity(ingredient.parsed)) {
      errors.push(`${record.recordIdentifier}: invalid quantity for "${ingredient.line}"`);
    }
  }

  if (raw.kcal >= 100 && energyDifferencePercent > 35) {
    errors.push(`${record.recordIdentifier}: source energy differs from macro plausibility energy by ${energyDifferencePercent.toFixed(1)}%`);
  }
  for (const [key, value] of Object.entries(calculated)) {
    if (key === 'unmatched') continue;
    if (!Number.isFinite(value) || value < 0) errors.push(`${record.recordIdentifier}: invalid ${key} ${value}`);
  }
  if ((calculated.protein * 4) > calculated.kcal * 1.05) {
    errors.push(`${record.recordIdentifier}: protein alone implies more energy than the source total`);
  }
  if ((calculated.fats * 9) > calculated.kcal * 1.05) {
    errors.push(`${record.recordIdentifier}: fat alone implies more energy than the source total`);
  }

  const hasDifference = absoluteDifference.kcal > 0 || absoluteDifference.protein > 0;
  discrepancies.push({
    recordIdentifier: record.recordIdentifier,
    mealOrPlanName: record.mealOrPlanName,
    sourceFile: record.sourceFile,
    publishedUrlsAffected: record.publishedUrlsAffected,
    storedValues: stored,
    recalculatedValues: calculated,
    absoluteDifference,
    percentageDifference,
    severity: hasDifference ? 'P0' : 'resolved',
    rootCause: hasDifference ? 'Stored recipe total drifted from canonical ingredient sum.' : null,
    fixApplied: hasDifference ? null : 'Stored headline totals and all rendered surfaces resolve from the canonical ingredient calculation.',
    postFixResult: hasDifference ? 'failed' : 'matched',
    dataSourceOrAssumption: 'Deterministic canonical ingredient mapping; UK CoFID 2021 primary, documented label/USDA fallback.',
    eligibleForExactNutritionClaim: !hasDifference && raw.unmatched.length === 0,
    macroPlausibilityEnergy: Math.round(macroEnergy),
    sourceEnergyDifferencePercent: Number(energyDifferencePercent.toFixed(2)),
  });
}

for (const key of Object.keys(NUTRITION_TABLE)) {
  const macros = NUTRITION_MACRO_OVERRIDES[key];
  if (!macros || ['fat100', 'carb100', 'fibre100'].some(field => !Number.isFinite(macros[field]))) {
    errors.push(`nutrition table key "${key}" lacks explicit full-macro coverage`);
  }
}
for (const [alias, target] of Object.entries(NUTRITION_SYNONYMS)) {
  if (!NUTRITION_TABLE[target]) errors.push(`nutrition alias "${alias}" points to missing key "${target}"`);
}
for (const food of PROTEIN_FOODS) {
  const canonical = NUTRITION_TABLE[food.nutritionKey];
  if (!canonical) {
    errors.push(`protein comparator "${food.id}" points to missing nutrition key "${food.nutritionKey}"`);
  } else if (food.kcal100 !== canonical.kcal100 || food.pro100 !== canonical.pro100) {
    errors.push(`protein comparator "${food.id}" drifted from canonical nutrition key "${food.nutritionKey}"`);
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  methodologyVersion: 1,
  coverage: {
    sharedMeals: MEALS.length,
    legacyBasePlans: Object.keys(legacyPlans).length,
    legacyMealOccurrences: records.length - MEALS.length,
    totalMealRecords: records.length,
    ingredientOccurrences,
    uniqueIngredientLines: uniqueIngredientLines.size,
    nutritionTableEntries: Object.keys(NUTRITION_TABLE).length,
    aliases: Object.keys(NUTRITION_SYNONYMS).length,
    proteinComparatorFoods: PROTEIN_FOODS.length,
    volumeOccurrences,
    explicitOptionalExclusions: explicitExclusions,
    exhaustive: true,
  },
  thresholds: {
    unresolvedIngredients: 0,
    invalidQuantities: 0,
    negativeOrNonFiniteNutrition: 0,
    storedDisplayDifference: 0,
    macroEnergyPlausibilityDifferencePercent: 35,
  },
  errors,
  records: discrepancies,
};
const outputPath = writeAuditJson('nutrition-discrepancies.json', report);

if (errors.length || discrepancies.some(item => item.postFixResult !== 'matched')) {
  console.error(`Nutrition audit failed with ${errors.length} integrity error(s) and ${discrepancies.filter(item => item.postFixResult !== 'matched').length} stored-value discrepancy(ies).`);
  errors.slice(0, 60).forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Nutrition audit passed exhaustively: ${MEALS.length} shared meals, ` +
  `${records.length - MEALS.length} legacy meal occurrences, ${ingredientOccurrences} ingredient occurrences, ` +
  `${Object.keys(NUTRITION_TABLE).length} canonical foods and ${Object.keys(NUTRITION_SYNONYMS).length} aliases. ` +
  `Report: ${outputPath}`,
);

function percentageDiff(stored, calculated) {
  if (!Number.isFinite(stored) || !Number.isFinite(calculated)) return null;
  if (calculated === 0) return stored === 0 ? 0 : null;
  return Number((((stored - calculated) / calculated) * 100).toFixed(2));
}
