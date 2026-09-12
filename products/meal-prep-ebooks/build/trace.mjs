// End-to-end trace of one week, for the manual QA pass.
//
// Prints the chain a buyer actually follows - shopping list, then the meals that
// consume it, then the leftover ledger, then the day totals - so a human can
// check that the four agree. The automated checks prove consistency; this exists
// so someone can see it.
//
//   node build/trace.mjs books/aldi-budget/index.mjs 1

import { assemble } from './assemble.mjs';
import { shopperQuantity, packHint, cookingEvents } from './plan.mjs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const [target, weekArg] = process.argv.slice(2);
const { default: def } = await import(pathToFileURL(path.resolve(target)).href);
const book = assemble(def);
const week = book.weeks.find((w) => w.n === Number(weekArg));

const strip = (s) => String(s).replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

console.log(`\n${'='.repeat(72)}\n${book.slug} — WEEK ${week.n}: ${strip(week.title)}\n${'='.repeat(72)}`);

console.log('\n--- 1. THE SHOPPING LIST (what the book prints) ---');
const buys = week.shopping.filter((r) => !r.staple);
for (const r of buys.sort((a, b) => a.aisle.localeCompare(b.aisle) || a.name.localeCompare(b.name))) {
  const hint = strip(packHint(r));
  console.log(`  ${r.aisle.padEnd(22)} ${shopperQuantity(r).padStart(12)}  ${r.shopperName}${hint ? `   [${hint}]` : ''}`);
}
console.log(`  (plus week-one cupboard staples: ${[...new Set(week.shopping.filter((r) => r.staple).map((r) => r.shopperName))].join(', ')})`);

console.log('\n--- 2. WHAT CONSUMES IT (every cooking event) ---');
const events = cookingEvents(week.days);
for (const e of events) {
  const m = book.meals[e.id];
  console.log(`  ${e.day} ${e.slot.padEnd(10)} ${strip(m.name).padEnd(42)} scale ${e.scale}  -> ${m.yield * e.scale} portions`);
}
console.log(`  total cooking events: ${events.length}`);

console.log('\n--- 3. THE LEFTOVER LEDGER ---');
console.log('  day  produced  eaten  fridge  lunch-ate  held-after');
for (const l of week.ledger) {
  console.log(`  ${l.day.padEnd(4)} ${String(l.produced).padStart(8)} ${String(l.eaten).padStart(6)} ${String(l.refrigerated).padStart(7)} ${String(l.lunchConsumed).padStart(10)} ${String(l.inFridgeAfter).padStart(11)}`);
}
console.log(`  ledger failures: ${week.ledgerFailures.length ? week.ledgerFailures.join('; ') : 'none'}`);

console.log('\n--- 4. THE DAYS ---');
for (const d of week.days) {
  const b = book.meals[d.breakfast.id].macros;
  const l = book.meals[d.lunch.id].macros;
  const dn = book.meals[d.dinner.id].macros;
  const x = book.meals[d.extra.id].macros;
  console.log(
    `  ${d.day}  ${String(b.kcal).padStart(4)} + ${String(l.kcal).padStart(4)} + ${String(dn.kcal).padStart(4)} + ${String(x.kcal).padStart(3)}` +
    ` = ${String(d.kcal).padStart(4)} kcal (${d.diff >= 0 ? '+' : ''}${d.diff.toFixed(1)}%)   ${String(d.protein).padStart(3)}g protein, ${d.proteinEnergyPercent.toFixed(0)}% of energy`
  );
}
console.log(`  week mean ${Math.round(week.mean)} kcal (${week.meanDiff >= 0 ? '+' : ''}${week.meanDiff.toFixed(1)}%), ${Math.round(week.meanProtein)}g protein`);

console.log('\n--- 5. COST ---');
console.log(`  ${book.cost.tier}: ${book.cost.range} (reviewed ${book.cost.checked}) — a planning range, not a basket price.`);
