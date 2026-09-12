// The permanent test suite for the four products.
//
//   node build/test.mjs
//
// Runs every deterministic check against every book and counts the individual
// assertions made, rather than the number of check groups. A check group like
// "shopping list reconciles" is one line of output but thousands of assertions:
// every ingredient of every meal occurrence in every week.
//
// Exit code is non-zero if anything fails, so this is safe to gate a release on.

import { assemble } from './assemble.mjs';
import { runQa } from './qa.mjs';
import { deriveOccurrences } from './occurrences.mjs';
import { cookingEvents, packHint, PACKS } from './plan.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUGS = ['aldi-budget', 'aldi-high-protein', 'lidl-budget', 'lidl-high-protein'];

let assertions = 0;
let failures = [];
const ok = (condition, message) => {
  assertions += 1;
  if (!condition) failures.push(message);
};

const books = {};
for (const slug of SLUGS) {
  const { default: def } = await import(pathToFileURL(path.join(ROOT, 'books', slug, 'index.mjs')).href);
  books[slug] = assemble(def);
}

for (const slug of SLUGS) {
  const book = books[slug];
  const occ = deriveOccurrences(book);

  // 21, 20, 19: shape of the plan.
  ok(book.weeks.length === 6, `${slug}: six weeks`);
  ok(occ.totalUnique === 24, `${slug}: 24 unique dinners, found ${occ.totalUnique}`);
  ok(occ.totalSlots === 42, `${slug}: 42 dinner slots, found ${occ.totalSlots}`);

  for (const week of book.weeks) {
    ok(week.dinners.length === 7, `${slug} wk${week.n}: seven dinners`);
    ok(week.days.length === 7, `${slug} wk${week.n}: seven days`);

    // 1, 14, 15, 16: schedule integrity.
    for (const [i, day] of week.days.entries()) {
      for (const slot of ['breakfast', 'lunch', 'dinner', 'extra']) {
        ok(Boolean(book.meals[day[slot].id]), `${slug} wk${week.n} ${day.day}: ${slot} recipe exists`);
      }
      if (i === 0) {
        ok(day.lunch.kind === 'cook', `${slug} wk${week.n}: Monday lunch is cooked fresh`);
        ok(day.lunch.id === week.mondayLunch, `${slug} wk${week.n}: Monday lunch is the week's nominated lunch`);
      } else {
        ok(day.lunch.kind === 'leftover', `${slug} wk${week.n} ${day.day}: lunch is leftovers`);
        ok(day.lunch.id === week.dinners[i - 1], `${slug} wk${week.n} ${day.day}: lunch traces to yesterday's dinner`);
      }
      // 15: Sunday half batch, everything else full.
      const expectedScale = i === 6 ? 0.5 : 1;
      ok(day.dinner.scale === expectedScale, `${slug} wk${week.n} ${day.day}: dinner scale ${expectedScale}`);
      const produced = book.meals[day.dinner.id].yield * day.dinner.scale;
      ok(produced === (i === 6 ? 2 : 4), `${slug} wk${week.n} ${day.day}: produces the right portion count`);

      // 17: the printed day total is the sum of its four meals.
      const sum = ['breakfast', 'lunch', 'dinner', 'extra']
        .reduce((t, slot) => t + book.meals[day[slot].id].macros.kcal, 0);
      ok(sum === day.kcal, `${slug} wk${week.n} ${day.day}: day kcal ${day.kcal} equals component sum ${sum}`);
      const psum = ['breakfast', 'lunch', 'dinner', 'extra']
        .reduce((t, slot) => t + book.meals[day[slot].id].macros.protein, 0);
      ok(psum === day.protein, `${slug} wk${week.n} ${day.day}: day protein equals component sum`);
      ok(Math.abs(day.diff) <= 7.5, `${slug} wk${week.n} ${day.day}: ${day.kcal} kcal within 7.5%`);
    }

    // 5, 6, 12, 13: shopping reconciliation, recomputed here independently.
    // Keyed by name AND qualifier: "potato" and "potato baked" are different
    // purchases (loose potatoes, large baking potatoes) and must not be summed
    // into one line. Merging them here reported a 1,800g requirement against a
    // correct 600g row.
    const need = new Map();
    for (const event of cookingEvents(week.days)) {
      for (const item of book.meals[event.id].parsed) {
        const p = item.parsed;
        if (p.kind !== 'measured') continue;
        const key = `${p.name}|${p.qualifier || ''}`;
        need.set(key, (need.get(key) || 0) + Number(p.grams || 0) * event.scale);
      }
    }
    for (const [key, grams] of need) {
      const row = week.shopping.find((r) => r.key === key);
      ok(Boolean(row), `${slug} wk${week.n}: "${key}" appears on the shopping list`);
      if (row) ok(Math.abs(row.grams - grams) < 0.5, `${slug} wk${week.n}: "${key}" ${row.grams.toFixed(0)}g matches required ${grams.toFixed(0)}g`);
    }

    // 12: a breakfast eaten five times is bought five times.
    const breakfastCount = week.days.filter((d) => d.breakfast.id === week.weekdayBreakfast).length;
    ok(breakfastCount === 5, `${slug} wk${week.n}: weekday breakfast occurs five times`);
    ok(week.days.filter((d) => d.extra.id === week.extra).length === 7, `${slug} wk${week.n}: the daily extra occurs seven times`);

    // 9: one canonical name per concept.
    const labels = week.shopping.map((r) => r.shopperName.toLowerCase());
    ok(new Set(labels).size === labels.length, `${slug} wk${week.n}: no duplicate ingredient labels`);

    // 7, 8: cupboard procurement history.
    for (const name of book.cupboard.byWeek.get(week.n)) {
      ok(week.n === 1 || book.cupboard.weekOne.includes(name),
        `${slug} wk${week.n}: cupboard item "${name}" was bought in week one`);
    }

    // 10, 11: pack arithmetic.
    for (const row of week.shopping) {
      const hint = packHint(row);
      if (!hint) continue;
      const pack = PACKS.get(row.name);
      const m = /Buy (\d+) /.exec(hint);
      if (!pack || !m) continue;
      ok(Number(m[1]) * pack.each + 1e-6 >= row.grams, `${slug} wk${week.n}: "${row.shopperName}" pack covers requirement`);
      ok(Number(m[1]) === Math.ceil(row.grams / pack.each - 1e-9), `${slug} wk${week.n}: "${row.shopperName}" pack count is exact`);
    }

    // 6: no phantom leftovers.
    ok(week.ledgerFailures.length === 0, `${slug} wk${week.n}: leftover ledger balances`);
  }

  // 2, 3, 4: occurrence history and the prose that describes it.
  for (const [id, rec] of occ.recipes) {
    ok(rec.appearances.length === rec.count, `${slug}: ${id} appearance count is consistent`);
    ok(rec.firstWeek === rec.appearances[0].week, `${slug}: ${id} first appearance is its earliest`);
  }
  const cumulative = occ.weeks.map((w) => w.cumulativeUnique);
  ok(cumulative.every((v, i) => i === 0 || v >= cumulative[i - 1]), `${slug}: cumulative unique count never decreases`);
  ok(cumulative[cumulative.length - 1] === occ.totalUnique, `${slug}: every dinner has appeared by week six`);

  // 18: high-protein threshold.
  if (book.planType === 'high-protein') {
    for (const week of book.weeks) {
      for (const day of week.days) {
        ok(day.proteinEnergyPercent >= 20, `${slug} wk${week.n} ${day.day}: ${day.proteinEnergyPercent.toFixed(1)}% energy from protein`);
      }
    }
  }

  // 22: no cross-retailer terminology.
  const other = book.store === 'Aldi' ? /\b(lidl|milbona|vemondo|baresa)\b/i : /\b(aldi|specially selected|everyday essentials|cucina)\b/i;
  const prose = JSON.stringify({ s: book.sections, a: book.appendices, w: book.weeks.map((w) => w.notes), n: book.shopNotes });
  ok(!other.test(prose), `${slug}: no ${book.store === 'Aldi' ? 'Lidl' : 'Aldi'} terminology`);

  // Everything qa.mjs asserts, folded in.
  const report = runQa(book);
  for (const check of report.checks) {
    ok(check.pass || !check.critical, `${slug}: QA ${check.id} — ${check.failures[0] || ''}`);
  }
}

console.log(`\n${assertions} assertions across ${SLUGS.length} books`);
if (failures.length) {
  console.error(`\n${failures.length} FAILED:`);
  for (const f of failures.slice(0, 40)) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('all passed');
