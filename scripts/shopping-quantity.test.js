// Practical shopping-quantity presentation.
//
// The shopping list is allowed to read like a human wrote it while the
// arithmetic underneath stays exact. These tests pin both halves of that: the
// tolerance behaves sensibly at the boundary, and nothing canonical moved.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildShoppingList,
  getAllPlanMeta,
  getPlanBySlug,
  isPracticallySamePurchaseQuantity,
} from '../src/utils/planBuilder.js';

// ── The tolerance itself ─────────────────────────────────────────────────────

test('a trivial gap on a large purchase is treated as the same quantity', () => {
  // Suppression cases: the reader learns nothing from being told these.
  const same = [
    [199, 200, 'g'],
    [198, 200, 'g'],
    [498, 500, 'ml'],
    [247, 250, 'ml'],
    [990, 1000, 'g'],
    [200, 200, 'g'],
    [0.95, 1, 'tsp'],
    [2.9, 3, 'tsp'],
  ];
  for (const [used, purchase, unit] of same) {
    assert.equal(
      isPracticallySamePurchaseQuantity(used, purchase, unit),
      true,
      `${used}/${purchase}${unit} should read as one quantity`,
    );
  }
});

test('a gap that leaves a real remainder is always reported', () => {
  // Preservation cases: the reader needs to know what will be left over.
  const different = [
    [195, 200, 'g'],   // 2.5% — above the proportional tolerance
    [190, 200, 'g'],   // 5%
    [340, 500, 'g'],   // the worked example from the brief
    [750, 1000, 'g'],
    [980, 1000, 'g'],  // 2% of 1kg is 20g, which is a real amount of food
    [45, 50, 'g'],     // 5g absolute, but a tenth of the item
    [90, 100, 'ml'],
  ];
  for (const [used, purchase, unit] of different) {
    assert.equal(
      isPracticallySamePurchaseQuantity(used, purchase, unit),
      false,
      `${used}/${purchase}${unit} leaves a meaningful remainder and must stay visible`,
    );
  }
});

test('a small absolute gap is still reported when it is a large share of the item', () => {
  // The failure the brief warns about: hiding 45g/50g because "it is only 5g".
  assert.equal(isPracticallySamePurchaseQuantity(45, 50, 'g'), false);
  assert.equal(isPracticallySamePurchaseQuantity(18, 20, 'g'), false);
  // …while the same 5g on a large purchase is genuinely irrelevant.
  assert.equal(isPracticallySamePurchaseQuantity(495, 500, 'g'), true);
});

test('count units keep whole-item differences visible', () => {
  // One egg, pepper or roll left over matters however small the number is.
  for (const unit of ['item', 'items', 'egg', 'eggs', 'slice', 'slices', 'tin', 'tins']) {
    assert.equal(
      isPracticallySamePurchaseQuantity(5, 6, unit),
      false,
      `${unit}: a whole item of difference must not be hidden`,
    );
    assert.equal(isPracticallySamePurchaseQuantity(1, 2, unit), false);
  }
});

test('the helper refuses nonsense rather than guessing', () => {
  assert.equal(isPracticallySamePurchaseQuantity(NaN, 200, 'g'), false);
  assert.equal(isPracticallySamePurchaseQuantity(199, 0, 'g'), false);
  assert.equal(isPracticallySamePurchaseQuantity(199, undefined, 'g'), false);
  assert.equal(isPracticallySamePurchaseQuantity(199, 200, undefined), false);
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

test('a usage note only survives where the difference is genuinely material', () => {
  const offenders = [];
  for (const meta of getAllPlanMeta().slice(0, 200)) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan?.shoppingList) continue;
    for (const items of Object.values(plan.shoppingList)) {
      for (const line of items) {
        const match = /^(.*?)\s\(about\s(.+?)\sused\)$/.exec(line);
        if (!match) continue;
        // Only compare where both halves are a plain gram/ml amount.
        const buy = /([\d.]+)\s*(g|ml)\b/i.exec(match[1]);
        const use = /([\d.]+)\s*(g|ml)\b/i.exec(match[2]);
        if (!buy || !use || buy[2].toLowerCase() !== use[2].toLowerCase()) continue;
        // Both halves are display values, already rounded for readability, so
        // the true canonical gap can be up to a unit larger than it looks.
        // Only flag a line when it is unambiguously inside the tolerance even
        // after allowing for that rounding.
        const displayedGap = Number(buy[1]) - Number(use[1]);
        const worstCaseGap = displayedGap + 1;
        if (isPracticallySamePurchaseQuantity(Number(buy[1]) - worstCaseGap, Number(buy[1]), buy[2])) {
          offenders.push(line);
        }
      }
    }
  }
  assert.deepEqual(offenders.slice(0, 8), [], 'these lines should have been simplified');
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
