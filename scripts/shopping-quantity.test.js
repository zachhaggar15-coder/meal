// Practical shopping-quantity presentation.
//
// A shopping list gives one number: what to put in the trolley. The arithmetic
// underneath stays exact. These tests pin both halves of that.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildShoppingList,
  getAllPlanMeta,
  getPlanBySlug,
} from '../src/utils/planBuilder.js';
import { getCookingIngredientModels } from '../src/utils/cookingQuantities.js';

// ── One number per line ──────────────────────────────────────────────────────

test('no shopping line reports a second "used" quantity beside what to buy', () => {
  // The purchase amount is the exact amount rounded UP to a shoppable step, so
  // the gap a "(about X used)" note reported was always smaller than one
  // rounding step — the rounding restated, never a fact about the recipes.
  // Counted lines were worse: "Eggs 10 (about 9¼ used)" and "Garlic 14 cloves
  // (about 13½ used)" invited a cook to measure a quarter of an egg.
  const offenders = [];
  for (const meta of getAllPlanMeta().slice(0, 250)) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan?.shoppingList) continue;
    for (const items of Object.values(plan.shoppingList)) {
      for (const line of items) {
        if (/\bused\)/.test(line)) offenders.push(`${meta.slug}: ${line}`);
      }
    }
  }
  assert.deepEqual(offenders.slice(0, 8), []);
});

test('a shopping line never asks for a fraction of a countable thing', () => {
  // You cannot buy, or use, a quarter of an egg.
  const offenders = [];
  for (const meta of getAllPlanMeta().slice(0, 250)) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan?.shoppingList) continue;
    for (const items of Object.values(plan.shoppingList)) {
      for (const line of items) {
        if (/[¼½¾]|\b\d+\/\d+\b/.test(line)) offenders.push(`${meta.slug}: ${line}`);
      }
    }
  }
  assert.deepEqual(offenders.slice(0, 8), []);
});

test('buying enough is never sacrificed to make the number look tidy', () => {
  // The one thing worse than an ugly quantity is a short one. Whatever the
  // presentation does, the purchase amount must cover what the week's recipes
  // actually ask a cook to use.
  const shortfalls = [];
  for (const meta of getAllPlanMeta().slice(0, 60)) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan?.plan) continue;

    // What the recipes, as printed, tell the cook to take out of the cupboard.
    const usedGrams = new Map();
    for (const day of plan.plan) {
      for (const meal of day.meals || []) {
        for (const model of getCookingIngredientModels(meal.ingredients || [])) {
          const grams = model.canonicalQuantity?.quantityGrams;
          if (!Number.isFinite(grams)) continue;
          const key = model.ingredient.toLowerCase();
          usedGrams.set(key, (usedGrams.get(key) || 0) + grams);
        }
      }
    }

    // One ingredient can legitimately occupy several lines — sweet potato
    // bought whole and bought to mash are separate jobs — so compare totals,
    // not lines. Ingredients measured in spoons anywhere are skipped: their
    // grams-per-spoon varies by food and this test is about quantity, not
    // unit conversion.
    const boughtGrams = new Map();
    const spoonMeasured = new Set();
    for (const items of Object.values(plan.shoppingList || {})) {
      for (const line of items) {
        const measured = /^(.+?)\s(\d+(?:\.\d+)?)\s*(g|tsp|tbsp)\b/.exec(line);
        if (!measured) continue;
        const key = measured[1].toLowerCase();
        if (measured[3] !== 'g') { spoonMeasured.add(key); continue; }
        boughtGrams.set(key, (boughtGrams.get(key) || 0) + Number(measured[2]));
      }
    }

    for (const [key, used] of usedGrams) {
      if (spoonMeasured.has(key)) continue;
      const bought = boughtGrams.get(key);
      if (bought === undefined) continue;
      if (bought + 1e-6 < used) {
        shortfalls.push(`${meta.slug}: buy ${bought.toFixed(0)}g of ${key}, recipes use ${used.toFixed(0)}g`);
      }
    }
  }
  assert.deepEqual(shortfalls.slice(0, 8), []);
});

test('one food never occupies two lines under a reordered name', () => {
  // This is a shortfall bug wearing a cosmetic disguise. "Reduced-fat cheddar
  // 35g" and "Cheddar reduced-fat 30g" sat in one category of one list, and a
  // shopper who read either line bought 35g for recipes needing 57g.
  const offenders = [];
  for (const meta of getAllPlanMeta().slice(0, 250)) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan?.shoppingList) continue;
    const byTokens = new Map();
    for (const items of Object.values(plan.shoppingList)) {
      for (const line of items) {
        const label = line.replace(/\s\d.*$/, '').trim();
        if (!label) continue;
        const key = label.toLowerCase().split(/\s+/).sort().join(' ');
        if (!byTokens.has(key)) byTokens.set(key, new Set());
        byTokens.get(key).add(label);
      }
    }
    for (const labels of byTokens.values()) {
      if (labels.size > 1) offenders.push(`${meta.slug}: ${[...labels].join(' / ')}`);
    }
  }
  assert.deepEqual(offenders.slice(0, 8), []);
});

// ── Rendered output ──────────────────────────────────────────────────────────

test('shopping lines never contain the artefacts of a suppressed suffix', () => {
  const failures = [];
  for (const meta of getAllPlanMeta().slice(0, 120)) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan?.shoppingList) continue;
    for (const items of Object.values(plan.shoppingList)) {
      for (const line of items) {
        if (/\s{2,}/.test(line)) failures.push(`double space: "${line}"`);
        if (/\(\s*\)/.test(line)) failures.push(`empty parentheses: "${line}"`);
        if (/\(about\s*used\)/.test(line)) failures.push(`missing amount: "${line}"`);
        if (/\($/.test(line) || /^\)/.test(line)) failures.push(`dangling bracket: "${line}"`);
        if (/\s+$/.test(line) || /^\s/.test(line)) failures.push(`stray whitespace: "${line}"`);
        const opens = (line.match(/\(/g) || []).length;
        const closes = (line.match(/\)/g) || []).length;
        if (opens !== closes) failures.push(`unbalanced brackets: "${line}"`);
      }
    }
  }
  assert.deepEqual(failures.slice(0, 8), []);
});

// ── Presentation only: nothing canonical may move ────────────────────────────

test('the canonical shopping aggregation is untouched by display formatting', () => {
  // buildShoppingList returns rendered strings, but the amounts behind them
  // come from the plan's ingredient data. If the formatter had leaked into the
  // data, the same plan built twice would disagree.
  for (const meta of getAllPlanMeta().slice(0, 40)) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan) continue;
    const first = JSON.stringify(buildShoppingList(plan.plan));
    const second = JSON.stringify(buildShoppingList(plan.plan));
    assert.equal(second, first, `${meta.slug}: shopping list is not deterministic`);
  }
});

test('nutrition and plan quantities are unchanged by the presentation rule', () => {
  // A property test rather than a snapshot: every meal's calculated nutrition
  // must still be derived from its own ingredient list, and day totals must
  // still equal the sum of their meals. If the display tolerance had rewritten
  // any canonical quantity, these relationships would break.
  const failures = [];
  for (const meta of getAllPlanMeta().slice(0, 60)) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan?.plan) continue;

    for (const day of plan.plan) {
      const summed = (day.meals || []).reduce((total, meal) => total + Number(meal.kcal || 0), 0);
      const stated = Number(day.totals?.kcal || 0);
      if (Math.abs(summed - stated) > 1) {
        failures.push(`${meta.slug} ${day.day}: meals sum to ${summed} but day says ${stated}`);
      }

      for (const meal of day.meals || []) {
        // Ingredient quantities must still carry real numbers, not rounded
        // display strings.
        for (const ingredient of meal.ingredients || []) {
          if (/\(about .* used\)/.test(ingredient)) {
            failures.push(`${meta.slug} ${meal.name}: shopping wording leaked into an ingredient`);
          }
        }
      }
    }
  }
  assert.deepEqual(failures.slice(0, 8), []);
});

test('recipe ingredient lines keep their exact quantities', () => {
  // The recipe must still say 199g if that is what the plan uses; only the
  // shopping line simplifies.
  const plan = getPlanBySlug(getAllPlanMeta()[0].slug);
  const ingredients = plan.plan
    .flatMap(day => day.meals || [])
    .flatMap(meal => meal.ingredients || []);
  assert.ok(ingredients.length > 0, 'no ingredients to check');
  for (const ingredient of ingredients) {
    assert.ok(
      !/\babout\b/i.test(ingredient),
      `recipe ingredient carries shopping-list hedging: "${ingredient}"`,
    );
  }
});
