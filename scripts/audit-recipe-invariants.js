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
import { RAW_PROTEINS_REQUIRING_A_COOK_STEP, hasCookingLiquid, isSoupSideAccompaniment } from '../src/utils/ingredientRoles.js';

const NEGLIGIBLE_EXCEPTION = /\b(excluded from nutrition estimate|optional|to taste|garnish|spray|as needed)\b/i;
const COOK_VERB_PATTERN = /\b(cook|cooked|bake|baked|grill|grilled|fry|fried|simmer|simmered|roast|roasted|poach|poached|boil|boiled|brown|browned)\b/i;

function ingredientHeadWord(text) {
  return String(text || '').replace(/\d.*$/, '').trim().toLowerCase();
}

function isMaterialIngredient(rawIngredient) {
  const text = String(rawIngredient || '');
  if (NEGLIGIBLE_EXCEPTION.test(text)) return false;
  if (isSoupSideAccompaniment(text)) return false; // accompaniments are legitimately not "cooked into" the dish
  return true;
}

// ── Check 1: core ingredient present but never mentioned in the method ────
function checkCoreIngredientOmission(mealName, ingredients, methodText) {
  const flagged = [];
  for (const raw of ingredients || []) {
    if (!isMaterialIngredient(raw)) continue;
    const head = ingredientHeadWord(raw);
    if (!head) continue;
    // Use the first 1-2 significant words as a loose name match against the
    // method text — matches how a human would scan for "is this mentioned".
    const words = head.replace(/\(.*?\)/g, '').split(/\s+/).filter(w => w.length > 2);
    const mentioned = words.some(word => methodText.toLowerCase().includes(word));
    if (!mentioned) flagged.push(raw);
  }
  return flagged;
}

// ── Check 2: a raw protein requiring a cook step has no cooking verb near it ──
function checkRawProteinWithoutCooking(name, ingredients, methodText) {
  const nameLower = name.toLowerCase();
  const text = `${nameLower} ${(ingredients || []).join(' ')}`.toLowerCase();
  const flaggedProteins = [];
  for (const protein of RAW_PROTEINS_REQUIRING_A_COOK_STEP) {
    if (!text.includes(protein)) continue;
    // Already-prepared exceptions that legitimately need no further cooking.
    if (/(smoked|tinned|canned|cooked|pre-cooked)\s+\w*\s*/i.test(text) && text.includes(`${protein}`)) {
      // Only skip if the protein word itself is adjacent to a prepared marker.
      const preparedNear = new RegExp(`(smoked|tinned|canned|cooked)[^,]{0,20}${protein}|${protein}[^,]{0,20}(smoked|tinned|canned|cooked)`, 'i');
      if (preparedNear.test(text)) continue;
    }
    if (!COOK_VERB_PATTERN.test(methodText)) flaggedProteins.push(protein);
  }
  return flaggedProteins;
}

// ── Check 3: a soup/stew/curry has no recognised cooking liquid ───────────
function checkSoupStewMissingLiquid(name, ingredients) {
  const nameLower = name.toLowerCase();
  const isSoupStew = /(curry|chilli|stew|soup)/.test(nameLower);
  if (!isSoupStew) return false;
  return !hasCookingLiquid(ingredients);
}

const results = { coreOmission: [], rawProteinUncooked: [], soupStewNoLiquid: [] };
let totalChecked = 0;

for (const meal of MEALS) {
  totalChecked += 1;
  const method = buildPracticalRecipeSteps(meal).join(' ');
  const omitted = checkCoreIngredientOmission(meal.name, meal.ingredients, method);
  if (omitted.length) results.coreOmission.push({ source: 'shared', id: meal.id, name: meal.name, omitted, method });
  const uncooked = checkRawProteinWithoutCooking(meal.name, meal.ingredients, method);
  if (uncooked.length) results.rawProteinUncooked.push({ source: 'shared', id: meal.id, name: meal.name, uncooked, method });
  if (checkSoupStewMissingLiquid(meal.name, meal.ingredients)) {
    results.soupStewNoLiquid.push({ source: 'shared', id: meal.id, name: meal.name, ingredients: meal.ingredients });
  }
}

let legacyChecked = 0;
for (const [slug, plan] of Object.entries(mealPlansData)) {
  for (const day of plan.plan || []) {
    for (const sourceMeal of day.meals || []) {
      legacyChecked += 1;
      const meal = canonicaliseLegacyMeal(sourceMeal);
      const method = (meal.recipe || []).join(' ');
      const omitted = checkCoreIngredientOmission(meal.name, meal.ingredients, method);
      if (omitted.length) results.coreOmission.push({ source: 'legacy', id: `${slug}:${day.day}:${meal.name}`, name: meal.name, omitted, method });
      const uncooked = checkRawProteinWithoutCooking(meal.name, meal.ingredients, method);
      if (uncooked.length) results.rawProteinUncooked.push({ source: 'legacy', id: `${slug}:${day.day}:${meal.name}`, name: meal.name, uncooked, method });
      if (checkSoupStewMissingLiquid(meal.name, meal.ingredients)) {
        results.soupStewNoLiquid.push({ source: 'legacy', id: `${slug}:${day.day}:${meal.name}`, name: meal.name, ingredients: meal.ingredients });
      }
    }
  }
}

console.log(`=== Core ingredient omission (method never mentions a material ingredient) ===`);
console.log(`Checked: ${totalChecked} shared + ${legacyChecked} legacy = ${totalChecked + legacyChecked}`);
console.log(`Flagged: ${results.coreOmission.length}`);
for (const item of results.coreOmission.slice(0, 30)) {
  console.log(`- [${item.source}] ${item.name} (${item.id}): omitted=${JSON.stringify(item.omitted)}`);
}

console.log(`\n=== Raw protein requiring a cook step with no cooking verb in the method ===`);
console.log(`Checked: ${totalChecked} shared + ${legacyChecked} legacy = ${totalChecked + legacyChecked}`);
console.log(`Flagged: ${results.rawProteinUncooked.length}`);
for (const item of results.rawProteinUncooked.slice(0, 30)) {
  console.log(`- [${item.source}] ${item.name} (${item.id}): proteins=${JSON.stringify(item.uncooked)}`);
  console.log(`  method: ${item.method}`);
}

console.log(`\n=== Soup/stew/curry/chilli with no recognised cooking liquid ===`);
console.log(`Checked: ${totalChecked} shared + ${legacyChecked} legacy = ${totalChecked + legacyChecked}`);
console.log(`Flagged: ${results.soupStewNoLiquid.length}`);
for (const item of results.soupStewNoLiquid.slice(0, 30)) {
  console.log(`- [${item.source}] ${item.name} (${item.id}): ${JSON.stringify(item.ingredients)}`);
}
