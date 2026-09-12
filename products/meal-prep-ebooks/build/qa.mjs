// Automated QA. Checks A-K from RULES.md section 12.
//
// A check is `critical` when shipping the book despite it would mean selling a
// plan that does not work: a day that misses its calorie tolerance, a lunch with
// no dinner behind it, a shopping list that under-buys. Those fail the build.
// Advisory checks report and do not block.
//
// Check E deliberately recomputes the shopping totals by a second, independent
// route and compares them with the aggregation the book will print. One pass
// through the same function twice proves nothing; two routes disagreeing is what
// catches a multiplication error.

import { computeMealNutritionRaw } from '../../../src/utils/nutrition.js';
import { parseIngredientLine } from '../../../src/utils/ingredientParser.js';
import {
  checkCoreIngredientOmission,
  checkRawProteinWithoutCooking,
  checkHydrationWithoutMedium,
} from '../../../scripts/lib/recipeInvariants.js';
import { cookingEvents, KCAL_TARGET, DAY_NAMES } from './plan.mjs';

const RICE = /\brice\b/i;
const DINNER_MINUTES_LIMIT = 40;

export function runQa(book) {
  const checks = [];
  const add = (id, name, failures, critical = true, note = '') =>
    checks.push({ id, name, pass: failures.length === 0, failures, critical, note });

  /* A - schedule */
  const aFail = [];
  const totalDays = book.weeks.reduce((s, w) => s + w.days.length, 0);
  if (book.weeks.length !== 6) aFail.push(`expected 6 weeks, found ${book.weeks.length}`);
  if (totalDays !== 42) aFail.push(`expected 42 days, found ${totalDays}`);
  for (const w of book.weeks) {
    for (const d of w.days) {
      for (const slot of ['breakfast', 'lunch', 'dinner', 'extra']) {
        if (!d[slot]?.id) aFail.push(`week ${w.n} ${d.day}: missing ${slot}`);
      }
    }
  }
  add('A', 'Schedule: 42 days, all four slots filled', aFail);

  /* B - calories */
  const bFail = [];
  for (const w of book.weeks) {
    for (const d of w.days) {
      if (Math.abs(d.diff) > 7.5) {
        bFail.push(`week ${w.n} ${d.day}: ${d.kcal} kcal, ${d.diff.toFixed(1)}% vs target (limit 7.5%)`);
      }
    }
    if (Math.abs(w.meanDiff) > 3) {
      bFail.push(`week ${w.n}: mean ${Math.round(w.mean)} kcal, ${w.meanDiff.toFixed(1)}% vs target (limit 3%)`);
    }
  }
  add('B', `Calories: every day within 7.5% and each week mean within 3% of ${KCAL_TARGET}`, bFail);

  /* C - high protein */
  const cFail = [];
  const isHighProtein = book.planType === 'high-protein';
  for (const w of book.weeks) {
    for (const d of w.days) {
      if (isHighProtein && d.proteinEnergyPercent < 20) {
        cFail.push(`week ${w.n} ${d.day}: ${d.proteinEnergyPercent.toFixed(1)}% of energy from protein (needs 20%)`);
      }
    }
  }
  add('C', 'High-protein: at least 20% of energy from protein', cFail, isHighProtein,
    isHighProtein ? '' : 'not a high-protein book; reported for information only');

  /* D - yield agrees with the schedule */
  const dFail = [];
  for (const w of book.weeks) {
    w.days.forEach((day, i) => {
      const dinner = book.meals[day.dinner.id];
      const produced = dinner.yield * day.dinner.scale;
      if (!Number.isInteger(produced)) {
        dFail.push(`week ${w.n} ${day.day}: "${day.dinner.id}" produces ${produced} portions, which is not a whole number`);
      }
      if (day.dinner.producesLunch && produced !== 4) {
        dFail.push(`week ${w.n} ${day.day}: "${day.dinner.id}" must yield 4 portions to feed tomorrow's lunch, yields ${produced}`);
      }
      if (!day.dinner.producesLunch && produced !== 2) {
        dFail.push(`week ${w.n} ${day.day}: "${day.dinner.id}" feeds no lunch so must yield 2 portions, yields ${produced}`);
      }
      if (day.lunch.kind === 'leftover' && day.lunch.id !== w.dinners[i - 1]) {
        dFail.push(`week ${w.n} ${day.day}: lunch does not match the previous dinner`);
      }
    });
  }
  add('D', 'Yield: servings agree with the schedule; every leftover lunch has a producing dinner', dFail);

  /* E - shopping list reconciliation, by an independent route */
  const eFail = [];
  for (const w of book.weeks) {
    const expected = new Map();
    for (const event of cookingEvents(w.days)) {
      const recipe = book.meals[event.id];
      for (const item of recipe.ingredients) {
        const p = parseIngredientLine(item.line);
        const key = `${p.name}|${p.qualifier || ''}`;
        if (!expected.has(key)) expected.set(key, { grams: 0, counts: new Map(), kind: p.kind });
        const row = expected.get(key);
        if (p.kind === 'measured') row.grams += Number(p.grams || 0) * event.scale;
        else if (p.kind === 'count') {
          const unit = p.unit || 'item';
          row.counts.set(unit, (row.counts.get(unit) || 0) + Number(p.qty || 0) * event.scale);
        }
      }
    }

    const printed = new Map(w.shopping.map((r) => [r.key, r]));

    for (const [key, exp] of expected) {
      const got = printed.get(key);
      if (!got) {
        eFail.push(`week ${w.n}: "${key}" is needed by the plan but missing from the shopping list`);
        continue;
      }
      if (Math.abs(got.grams - exp.grams) > 0.5) {
        eFail.push(`week ${w.n}: "${key}" needs ${exp.grams.toFixed(0)}g, list aggregates ${got.grams.toFixed(0)}g`);
      }
      for (const [unit, qty] of exp.counts) {
        const gotQty = Number(got.counts[unit] || 0);
        if (Math.abs(gotQty - qty) > 0.01) {
          eFail.push(`week ${w.n}: "${key}" needs ${qty} ${unit}, list aggregates ${gotQty}`);
        }
      }
    }
    for (const key of printed.keys()) {
      if (!expected.has(key)) eFail.push(`week ${w.n}: "${key}" is on the shopping list with no meal needing it`);
    }
  }
  add('E', 'Shopping list reconciles with the schedule, with repeats multiplied', eFail);

  /* F - leftovers */
  const fFail = book.weeks.flatMap((w) => w.ledgerFailures.map((f) => `week ${w.n}: ${f}`));
  add('F', 'Leftovers: no phantom lunches, no stranded portions', fFail);

  /* G - nutrition integrity */
  const gFail = [];
  for (const [id, r] of Object.entries(book.meals)) {
    const total = computeMealNutritionRaw(r.ingredients.map((i) => i.line));
    if (total.unmatched.length) gFail.push(`${id}: unresolved ${total.unmatched.join(', ')}`);
    for (const k of ['kcal', 'protein', 'carbs', 'fats', 'fibre']) {
      if (!Number.isFinite(r.macros[k])) gFail.push(`${id}: macro ${k} is not a number`);
    }
    // Independent re-derivation of the single yield division.
    const expectedKcal = Math.round(total.kcal / r.yield);
    if (Math.abs(expectedKcal - r.macros.kcal) > 1) {
      gFail.push(`${id}: per-portion kcal ${r.macros.kcal} does not match total/yield ${expectedKcal}`);
    }
    if (r.macros.kcal <= 0) gFail.push(`${id}: per-portion kcal is zero`);
  }
  add('G', 'Nutrition: everything resolves, macros present, yield divided exactly once', gFail);

  /* H - cost claims */
  const hFail = [];
  const costMeta = book.cost || {};
  if (!costMeta.tier || !costMeta.range || !costMeta.checked) {
    hFail.push('book is missing cost tier, range or check date');
  }
  const bodyText = JSON.stringify({ sections: book.sections, appendices: book.appendices, weeks: book.weeks.map((w) => w.notes) });
  const priceClaims = bodyText.match(/&pound;\s?\d[\d.,]*/g) || [];
  if (priceClaims.length && !costMeta.checked) {
    hFail.push(`${priceClaims.length} price claim(s) with no check date`);
  }
  const ABSOLUTES = /\b(always cheaper|cheapest|guaranteed|never costs|is cheaper than)\b/i;
  if (ABSOLUTES.test(bodyText)) hFail.push('an unsupported absolute price comparison is present');
  add('H', 'Cost: tier, range, check date present; no unsupported absolutes', hFail);

  /* I - food safety, rice in particular */
  const iFail = [];
  for (const w of book.weeks) {
    for (const day of w.days) {
      const dinner = book.meals[day.dinner.id];
      const hasRice = dinner.ingredients.some((i) => RICE.test(i.line));
      if (hasRice && day.dinner.producesLunch) {
        const text = `${dinner.leftovers} ${dinner.method.join(' ')}`.toLowerCase();
        // Two compliant routes. Either the rice is cooked fresh for both meals,
        // or - for a one-pot dish where that is impossible - the recipe opts in
        // explicitly and must spell out the one-hour chill and the next-day rule.
        if (dinner.riceNextDay) {
          if (!/within an hour|inside an hour/.test(text) || !text.includes('tomorrow')) {
            iFail.push(`week ${w.n} ${day.day}: "${dinner.id}" is flagged riceNextDay but does not state the one-hour chill and next-day rule`);
          }
        } else if (!text.includes('fresh')) {
          iFail.push(`week ${w.n} ${day.day}: "${dinner.id}" contains rice and feeds a lunch, but does not tell the cook to make the rice fresh`);
        }
      }
    }
  }
  add('I', 'Food safety: rice never relies on being stored and reheated from the batch', iFail);

  /* J - content practicality */
  const jFail = [];
  const jAdvisory = [];
  for (const [id, r] of Object.entries(book.meals)) {
    if (r.kind === 'dinner') {
      if (!Number.isFinite(r.timeMins)) jFail.push(`${id}: no timeMins declared`);
      else if (r.timeMins > DINNER_MINUTES_LIMIT) jFail.push(`${id}: ${r.timeMins} minutes elapsed, over the ${DINNER_MINUTES_LIMIT}-minute promise`);
    }
    if (!r.method?.length) jFail.push(`${id}: no method steps`);
    const plainIngredients = r.ingredients.map((i) => i.display.replace(/&[a-z]+;/g, ' '));
    const methodText = r.method.join(' ').replace(/<[^>]+>/g, ' ');
    const uncooked = checkRawProteinWithoutCooking(r.name, plainIngredients, methodText);
    if (uncooked.length) jFail.push(`${id}: raw protein never cooked in the method (${uncooked.join(', ')})`);
    if (checkHydrationWithoutMedium(r.name, plainIngredients, methodText)) {
      jFail.push(`${id}: dish needs a cooking liquid and none is present`);
    }
    const omitted = checkCoreIngredientOmission(r.name, plainIngredients, methodText);
    if (omitted.length) jAdvisory.push(`${id}: ingredient(s) never named in the method: ${omitted.join(', ')}`);
  }
  add('J', `Content: dinners within ${DINNER_MINUTES_LIMIT} minutes, methods complete, raw protein cooked`, jFail);
  add('J2', 'Advisory: core ingredients named in the method', jAdvisory, false);

  /* extra: recipe reuse shape */
  const reuseFail = [];
  const dinnerCounts = new Map();
  const flatDinners = [];
  for (const w of book.weeks) {
    w.days.forEach((d) => {
      dinnerCounts.set(d.dinner.id, (dinnerCounts.get(d.dinner.id) || 0) + 1);
      flatDinners.push({ week: w.n, day: d.day, id: d.dinner.id });
    });
  }
  for (let i = 1; i < flatDinners.length; i += 1) {
    if (flatDinners[i].id === flatDinners[i - 1].id) {
      reuseFail.push(`${flatDinners[i].id} repeats on adjacent days (week ${flatDinners[i].week} ${flatDinners[i].day})`);
    }
  }
  add('L', 'Dinners never repeat on adjacent days', reuseFail);

  const uniqueDinners = dinnerCounts.size;
  const summary = {
    uniqueDinners,
    repeatedDinners: [...dinnerCounts.values()].filter((n) => n > 1).length,
    dinnerSlots: flatDinners.length,
    meanKcal: book.weeks.reduce((s, w) => s + w.mean, 0) / book.weeks.length,
    minDayKcal: Math.min(...book.weeks.flatMap((w) => w.days.map((d) => d.kcal))),
    maxDayKcal: Math.max(...book.weeks.flatMap((w) => w.days.map((d) => d.kcal))),
    meanProtein: book.weeks.reduce((s, w) => s + w.meanProtein, 0) / book.weeks.length,
    proteinEnergyPercent: book.weeks.reduce((s, w) => s + w.proteinEnergyPercent, 0) / book.weeks.length,
  };

  return {
    slug: book.slug,
    checks,
    summary,
    criticalFailures: checks.filter((c) => c.critical && !c.pass).length,
  };
}

export function formatQa(report) {
  const lines = [`QA - ${report.slug}`];
  for (const c of report.checks) {
    const status = c.pass ? 'PASS' : c.critical ? 'FAIL' : 'warn';
    lines.push(`  [${status}] ${c.id}. ${c.name}${c.note ? ` (${c.note})` : ''}`);
    for (const f of c.failures.slice(0, 12)) lines.push(`         - ${f}`);
    if (c.failures.length > 12) lines.push(`         ... and ${c.failures.length - 12} more`);
  }
  const s = report.summary;
  lines.push(
    `  summary: ${s.uniqueDinners} unique dinners over ${s.dinnerSlots} slots; ` +
    `${Math.round(s.meanKcal)} kcal/day (min ${s.minDayKcal}, max ${s.maxDayKcal}); ` +
    `${Math.round(s.meanProtein)}g protein/day (${s.proteinEnergyPercent.toFixed(1)}% of energy)`
  );
  return lines.join('\n');
}
