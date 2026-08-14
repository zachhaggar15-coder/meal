#!/usr/bin/env node
// Non-blocking audit for the recipe-family invariants proposed in the
// meal-plan quality audit (2026-08). Deliberately NOT wired into the
// deployment gate or CI — per the approved plan, an invariant is only
// promoted to a blocking check once its false-positive rate is understood.
// This prints total checked / flagged / a sample of flagged cases so a
// human can classify obvious true positives vs likely false positives vs
// ambiguous cases, per meal.
import { MEALS } from '../src/data/mealLibrary.js';
import { mealPlansData } from '../src/data/mealPlans.js';
import { canonicaliseLegacyMeal } from '../src/utils/legacyPlanBuilder.js';
import { buildPracticalRecipeSteps } from '../src/utils/recipeQuality.js';
import {
  checkCoreIngredientOmission,
  checkFamilyValidity,
  checkFlavourCompleteness,
  checkHydrationWithoutMedium,
  checkRawProteinWithoutCooking,
} from './lib/recipeInvariants.js';

const results = {
  coreOmission: [], rawProteinUncooked: [], hydrationNoMedium: [], familyInvalid: [], flavourBare: [],
};
let totalChecked = 0;

function runChecks(source, id, name, ingredients, method) {
  const omitted = checkCoreIngredientOmission(name, ingredients, method);
  if (omitted.length) results.coreOmission.push({ source, id, name, omitted, method });
  const uncooked = checkRawProteinWithoutCooking(name, ingredients, method);
  if (uncooked.length) results.rawProteinUncooked.push({ source, id, name, uncooked, method });
  if (checkHydrationWithoutMedium(name, ingredients, method)) {
    results.hydrationNoMedium.push({ source, id, name, ingredients, method });
  }
  const familyProblems = checkFamilyValidity(name, ingredients, method);
  if (familyProblems.length) results.familyInvalid.push({ source, id, name, problems: familyProblems, method });
  if (checkFlavourCompleteness(name, ingredients)) {
    results.flavourBare.push({ source, id, name, ingredients });
  }
}

for (const meal of MEALS) {
  totalChecked += 1;
  runChecks('shared', meal.id, meal.name, meal.ingredients, buildPracticalRecipeSteps(meal).join(' '));
}

let legacyChecked = 0;
for (const [slug, plan] of Object.entries(mealPlansData)) {
  for (const day of plan.plan || []) {
    for (const sourceMeal of day.meals || []) {
      legacyChecked += 1;
      const meal = canonicaliseLegacyMeal(sourceMeal);
      runChecks('legacy', `${slug}:${day.day}:${meal.name}`, meal.name, meal.ingredients, (meal.recipe || []).join(' '));
    }
  }
}

// Legacy plans repeat the same handful of underlying recipes across every
// calorie/supermarket variant — report distinct recipe patterns as well as
// raw occurrences so a "120 occurrences" number isn't mistaken for 120
// distinct problems.
function distinctPatterns(rows) {
  return new Set(rows.map(row => row.name)).size;
}

const scope = `${totalChecked} shared + ${legacyChecked} legacy = ${totalChecked + legacyChecked}`;

function report(title, rows, renderer, note = '') {
  console.log(`\n=== ${title} ===`);
  console.log(`Checked: ${scope}`);
  console.log(`Flagged: ${rows.length} occurrence(s) across ${distinctPatterns(rows)} distinct recipe pattern(s)`);
  if (note) console.log(note);
  const seen = new Set();
  for (const item of rows) {
    if (seen.has(item.name)) continue; // one line per distinct pattern
    seen.add(item.name);
    console.log(renderer(item));
  }
}

report(
  'Core ingredient omission (method never mentions a material ingredient)',
  results.coreOmission,
  item => `- [${item.source}] ${item.name} (${item.id}): omitted=${JSON.stringify(item.omitted)}`,
  'Non-blocking. Seasonings, herbs, spices and common aromatics are excluded as legitimately unnamed.',
);

report(
  'Raw protein requiring a cook step with no cooking verb in the method',
  results.rawProteinUncooked,
  item => `- [${item.source}] ${item.name} (${item.id}): proteins=${JSON.stringify(item.uncooked)}\n  method: ${item.method}`,
  'High precision in review — food-safety relevant.',
);

report(
  'Dry ingredient needing hydration with no cooking medium in the METHOD',
  results.hydrationNoMedium,
  item => `- [${item.source}] ${item.name} (${item.id}): ${JSON.stringify(item.ingredients)}\n  method: ${item.method}`,
  'Refined: checks method wording, not the shopping list (water is not a grocery item).',
);

report(
  'Recipe-family validity (chosen method incompatible with ingredients)',
  results.familyInvalid,
  item => `- [${item.source}] ${item.name} (${item.id}): ${item.problems.join('; ')}`,
);

report(
  'Structural flavour completeness (savoury cooked dish with no flavour component)',
  results.flavourBare,
  item => `- [${item.source}] ${item.name} (${item.id}): ${JSON.stringify(item.ingredients)}`,
  'Structural only — never a judgement about taste. Fixing these would require adding material ingredients (a product/data decision, not a method fix).',
);
