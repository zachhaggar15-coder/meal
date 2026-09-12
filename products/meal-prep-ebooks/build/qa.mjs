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
import { cookingEvents, KCAL_TARGET, DAY_NAMES, packHint, PACKS, canonicalSeasonings } from './plan.mjs';
import { deriveOccurrences } from './occurrences.mjs';
import { checkTocClaims, plain } from './claims.mjs';
import { deriveFacts } from './facts.mjs';
import { checkFrontMatterFacts } from './frontmatter.mjs';

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
        if (p.kind === 'negligible') {
          for (const canon of canonicalSeasonings(p.name)) {
            const key = `${canon}|`;
            if (!expected.has(key)) expected.set(key, { grams: 0, counts: new Map(), kind: 'negligible' });
          }
          continue;
        }
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

  /* M - prose claims must agree with the derived occurrence model.
   *
   * The gap that let four books ship contradictions: structure was validated,
   * sentences were not. Every novelty or repetition claim is now checked against
   * week.dinners, which is the only place that fact is allowed to live. */
  const occ = deriveOccurrences(book);
  add('M', 'Prose claims agree with the actual recipe schedule', checkTocClaims(book, occ));

  /* N - cupboard procurement.
   *
   * A later week may only tell the reader to "check you still have" something
   * week one actually told them to buy. */
  const nFail = [];
  const weekOneSet = new Set(book.cupboard.weekOne);
  for (const [n, names] of book.cupboard.byWeek) {
    if (n === 1) continue;
    for (const name of names) {
      if (!weekOneSet.has(name)) nFail.push(`week ${n}: "${name}" is assumed in the cupboard but was never on week one's buy-once list`);
    }
  }
  for (const week of book.weeks) {
    for (const row of week.shopping) {
      if (row.staple && !weekOneSet.has(row.shopperName)) {
        nFail.push(`week ${week.n}: staple "${row.shopperName}" has no procurement history`);
      }
    }
  }
  add('N', 'Cupboard: every later staple was bought in week one', nFail);

  /* O - one canonical name per concept per list. */
  const oFail = [];
  for (const week of book.weeks) {
    const seen = new Map();
    for (const row of week.shopping) {
      const label = row.shopperName.toLowerCase();
      seen.set(label, [...(seen.get(label) || []), row.key]);
    }
    for (const [label, keys] of seen) {
      if (keys.length > 1) oFail.push(`week ${week.n}: "${label}" appears ${keys.length} times (${keys.join(', ')})`);
    }
    // Combined seasoning strings must never survive canonicalisation.
    for (const row of week.shopping) {
      if (/\band\b/.test(row.shopperName) && row.negligible) {
        oFail.push(`week ${week.n}: "${row.shopperName}" is a combined seasoning string, not a canonical staple`);
      }
    }
  }
  add('O', 'Shopping lists carry one canonical name per ingredient concept', oFail);

  /* P - pack guidance.
   *
   * Both halves: the arithmetic (never buy less than the plan needs) and the
   * prose (a static per-ingredient note must not assert a quantity, because it
   * is printed in every week regardless of that week's requirement). */
  const pFail = [];
  for (const week of book.weeks) {
    for (const row of week.shopping) {
      const hint = packHint(row);
      if (!hint) continue;
      const m = /Buy (\d+) &times; (.+?)s?$/.exec(hint);
      const pack = PACKS.get(row.name);
      if (!m || !pack) continue;
      const bought = Number(m[1]) * pack.each;
      if (bought + 1e-6 < row.grams) {
        pFail.push(`week ${week.n}: "${row.shopperName}" needs ${row.grams.toFixed(0)}g but "${plain(hint)}" buys only ${bought}g`);
      }
      const expected = Math.ceil(row.grams / pack.each - 1e-9);
      if (Number(m[1]) !== expected) {
        pFail.push(`week ${week.n}: "${row.shopperName}" pack count is ${m[1]}, arithmetic says ${expected}`);
      }
    }
  }
  for (const [name, note] of Object.entries(book.shopNotes || {})) {
    // Pack nouns only. "within two days" is a storage instruction and stays true
    // in every week; "two packs" is an arithmetic claim and does not.
    if (/\b(\d+|one|two|three|four|five|both|second|third)\b.{0,24}\b(packs?|tins?|bottles?|jars?|loa[fv]e?s?)\b/i.test(note)) {
      pFail.push(`shopNote for "${name}" asserts a quantity, but the same note prints in every week: "${note}"`);
    }
  }
  add('P', 'Pack guidance: never under-buys, counts correct, notes make no week-specific quantity claim', pFail);

  /* Q - retailer specificity and cross-book contamination. */
  const qFail = [];
  const OTHER_RETAILER_TERMS = {
    Aldi: [/\bmilbona\b/i, /\bvemondo\b/i, /\blidl plus\b/i, /\bderiva\b/i, /\bbaresa\b/i, /\bdeluxe\b/i, /\blidl\b/i],
    Lidl: [/\bspecially selected\b/i, /\beveryday essentials\b/i, /\bslimwell\b/i, /\bcucina\b/i, /\baldi\b/i],
  };
  const fullText = plain(JSON.stringify({
    sections: book.sections, appendices: book.appendices,
    weeks: book.weeks.map((w) => ({ t: w.title, s: w.tocSub, l: w.lede, n: w.notes })),
    title: book.title, subtitle: book.subtitle, footer: book.footer, shopNotes: book.shopNotes,
    notAffiliated: book.notAffiliated, tocLede: book.tocLede, shopLede: book.shopLede,
    recipesLede: book.recipesLede, facts: book.facts,
  }));
  for (const pattern of OTHER_RETAILER_TERMS[book.store] || []) {
    const hit = pattern.exec(fullText);
    if (hit) qFail.push(`${book.store} book contains the other retailer's term "${hit[0]}"`);
  }
  if (!new RegExp(`\\b${book.store}\\b`, 'i').test(book.footer || '')) {
    qFail.push(`footer does not name ${book.store}: "${book.footer}"`);
  }
  if (!new RegExp(`not affiliated with[^.]{0,80}${book.store}`, 'i').test(fullText)) {
    qFail.push(`missing a "not affiliated with ... ${book.store}" disclaimer`);
  }
  add('Q', 'Retailer content is specific to this book and carries the right disclaimer', qFail);

  /* R - time claims.
   *
   * Cover and intro promises are checked against the actual dinner timings so a
   * "20-40 min" claim cannot outlive a recipe that grew to 45. */
  const rFail = [];
  const dinnerTimes = Object.values(book.meals).filter((m) => m.kind === 'dinner').map((m) => m.timeMins);
  const lo = Math.min(...dinnerTimes);
  const hi = Math.max(...dinnerTimes);
  const rangeClaims = [...fullText.matchAll(/\b(\d{2})\s*(?:-|to|&ndash;|–)\s*(\d{2})\s*min/gi)];
  for (const claim of rangeClaims) {
    const [, a, b] = claim;
    if (Number(a) > lo || Number(b) < hi) {
      rFail.push(`claims dinners are ${a}-${b} min, actual spread is ${lo}-${hi} min`);
    }
  }
  for (const fact of book.facts || []) {
    const m = /(\d{2})\s*(?:-|&ndash;|–)\s*(\d{2})/.exec(plain(fact.v));
    if (m && /min/i.test(plain(fact.v)) && (Number(m[1]) > lo || Number(m[2]) < hi)) {
      rFail.push(`cover fact "${plain(fact.k)}: ${plain(fact.v)}" does not cover the real ${lo}-${hi} min spread`);
    }
  }
  add('R', `Time claims cover the real dinner spread (${lo}-${hi} min)`, rFail);

  /* S - stated protein figures must match the computed plan.
   *
   * Both books claimed "around 150g / 145g of protein each, every day". The
   * means were right and the daily claim was not: seven and nine days
   * respectively fell outside a +/-10% band. A mean stated as a mean is checked
   * against the mean; a claim that says "every day" is held to every day. */
  const sFail = [];
  const allDays = book.weeks.flatMap((w) => w.days);
  const proteinMean = allDays.reduce((t, d) => t + d.protein, 0) / allDays.length;
  // Only whole-day, per-person claims. "Another 100g of yogurt adds 10g of
  // protein" is a per-meal fact and has nothing to do with the daily mean; the
  // "each" is what marks a claim as being about a person's day.
  for (const claim of fullText.matchAll(/(?:averaging|around|about|roughly)\s+(\d{2,3})\s*g of protein each([^.]{0,70})/gi)) {
    const target = Number(claim[1]);
    const trailing = claim[2] || '';
    // A claim not scoped to a whole day is about part of one, so it is measured
    // against the component means rather than the daily total: "breakfast and
    // the daily extra settle about 55g each" was overstating a real 51.6g.
    if (!/^\s*\(?a day/i.test(trailing)) {
      const meanOf = (pick) => allDays.reduce((t, d) => t + pick(d), 0) / allDays.length;
      const candidates = [
        meanOf((d) => book.meals[d.breakfast.id].macros.protein + book.meals[d.extra.id].macros.protein),
        meanOf((d) => book.meals[d.breakfast.id].macros.protein),
        meanOf((d) => book.meals[d.extra.id].macros.protein),
        meanOf((d) => book.meals[d.dinner.id].macros.protein),
        meanOf((d) => book.meals[d.lunch.id].macros.protein),
      ];
      if (!candidates.some((c) => Math.abs(c - target) <= 5)) {
        sFail.push(`claims ${target}g of protein each, matching no component of the plan (component means: ${candidates.map((c) => c.toFixed(0)).join(', ')}g)`);
      }
      continue;
    }
    const tolerance = Math.max(5, target * 0.05);
    if (Math.abs(proteinMean - target) > tolerance) {
      sFail.push(`claims ${target}g of protein a day, computed mean is ${proteinMean.toFixed(1)}g (tolerance ${tolerance.toFixed(1)}g)`);
    }
    if (/\bevery day\b|\ba day, every\b/i.test(trailing)) {
      const outside = allDays.filter((d) => Math.abs(d.protein - target) > target * 0.1);
      if (outside.length) {
        sFail.push(`claims ${target}g of protein every day, but ${outside.length} of ${allDays.length} days fall outside +/-10%`);
      }
    }
    // A stated range must contain the real spread.
    const range = /(\d{2,3})\s*(?:&ndash;|-|–)\s*(\d{2,3})\s*g/.exec(trailing);
    if (range) {
      const lo = Math.min(...allDays.map((d) => d.protein));
      const hi = Math.max(...allDays.map((d) => d.protein));
      if (Number(range[1]) !== lo || Number(range[2]) !== hi) {
        sFail.push(`states a protein range of ${range[1]}-${range[2]}g, actual spread is ${lo}-${hi}g`);
      }
    }
  }
  add('S', 'Stated protein figures match the computed plan', sFail);

  /* T - front-matter and editorial facts.
   *
   * The checks above read week objects. This one reads every string in the
   * book, because four stale figures survived a full QA pass by sitting in
   * introductory chapters nothing was scanning. */
  add('T', 'Editorial prose reconciles with the computed plan', checkFrontMatterFacts(book, deriveFacts(book)));

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
