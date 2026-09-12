// Front-matter fact validation.
//
// The governing principle, and the reason this file exists:
//
//   IF PROSE STATES A FACT THAT EXISTS IN STRUCTURED DATA, THE PROSE MUST BE
//   DERIVED FROM THAT DATA OR VALIDATED AGAINST IT.
//
// The earlier claims checker walked week objects only. Introductory and
// editorial chapters were never read, and they kept four figures that had been
// true of an earlier draft. This walks every string in the book - sections,
// appendices, recipe taglines, cover facts, contents ledes, week prose - and
// reconciles each factual claim it recognises against build/facts.mjs.
//
// It validates claims that can be reconciled against plan data. It does not try
// to police stylistic prose, and a sentence it does not recognise passes.

import { CUPBOARD_CONCEPTS, toNumber } from './facts.mjs';

const plain = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;|&ndash;/g, ' - ')
    .replace(/&pound;/g, 'GBP')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Every prose string in the book, with a path so a failure names its location.
 * Deliberately exhaustive: the bug being fixed was a scanner that looked in too
 * few places.
 */
export function collectProse(book) {
  const out = [];
  const seen = new Set();

  const walk = (value, path) => {
    if (value == null) return;
    if (typeof value === 'string') {
      if (value.length > 3 && !seen.has(`${path}:${value}`)) {
        seen.add(`${path}:${value}`);
        out.push([path, value]);
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${path}[${i}]`));
      return;
    }
    if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        // Identifiers and ingredient lines are data, not prose.
        if (['id', 'slug', 'key', 'line', 'ingredients', 'parsed', 'macros', 'sources'].includes(k)) continue;
        walk(v, path ? `${path}.${k}` : k);
      }
    }
  };

  walk(book.sections, 'sections');
  walk(book.appendices, 'appendices');
  walk(book.weeks.map((w) => ({ n: w.n, title: w.title, tocSub: w.tocSub, lede: w.lede, notes: w.notes })), 'weeks');
  // Cover facts are key/value pairs; emitted joined so "Dinners" stays attached
  // to "15-35 min" and the timing check can tell which fact it is reading.
  (book.facts || []).forEach((f, i) => {
    out.push([`facts[${i}]`, `${f.k}: ${f.v}`]);
  });
  for (const field of ['title', 'subtitle', 'coverNote', 'tocLede', 'shopLede', 'recipesLede', 'notAffiliated', 'footer']) {
    walk(book[field], field);
  }
  for (const [id, meal] of Object.entries(book.meals)) {
    walk({ tagline: meal.tagline, swap: meal.swap, leftovers: meal.leftovers }, `meals.${id}`);
  }
  walk(book.shopNotes, 'shopNotes');
  return out;
}

const NUM = '(\\d+|ten|fifteen|twenty|twenty-five|thirty|thirty-five|forty|forty-five|fifty|sixty)';

export function checkFrontMatterFacts(book, facts) {
  const failures = [];
  const prose = collectProse(book);
  const note = (path, text, msg) =>
    failures.push(`${path}: ${msg}\n           "${text.slice(0, 130)}"`);

  const near = (a, b, tol) => Math.abs(a - b) <= tol;

  for (const [path, raw] of prose) {
    const text = plain(raw);

    /* ── protein claims, at whatever scope the sentence states ──────── */
    for (const m of text.matchAll(/(?:about|around|roughly|approximately)\s+(\d{2,3})\s*g of protein\b([^.]{0,80})/gi)) {
      const target = Number(m[1]);
      const tail = (m[2] || '').toLowerCase();
      const head = text.slice(Math.max(0, m.index - 90), m.index).toLowerCase();
      const ctx = `${head} ${tail}`;

      // An increment is not a total. "Another 100g of yogurt adds roughly 12g"
      // describes what happens if you add more, and must not be measured against
      // the extra's own protein figure.
      if (/\b(another|adds?|add|extra 100g|more|on top|per 100g)\b/.test(head)) continue;

      // Scope is read from the sentence, not assumed.
      const isCombo = /breakfast and the (daily )?extra|breakfast and the snack|between them/.test(ctx);
      const isBreakfastOnly = !isCombo && /breakfast/.test(ctx);
      const isExtraOnly = !isCombo && /(daily extra|the extra|snack)/.test(ctx);
      const isDaily = /\ba day\b|\beach a day\b|\bdaily total\b|\bevery day\b/.test(ctx) && !isCombo;

      let scope = null;
      if (isCombo) scope = ['breakfast and the daily extra', facts.protein.combo];
      else if (isDaily) scope = ['the daily total', facts.protein.daily];
      else if (isBreakfastOnly) scope = ['breakfast', facts.protein.breakfast];
      else if (isExtraOnly) scope = ['the daily extra', facts.protein.extra];

      if (!scope) continue;
      const [label, stat] = scope;
      // A stated "about N" must sit within the real spread, and within 5g of
      // the mean. 55g against a 48-53g spread fails both.
      const tol = Math.max(5, stat.mean * 0.05);
      if (!near(stat.mean, target, tol)) {
        note(path, text, `claims about ${target}g of protein from ${label}, computed mean is ${stat.mean.toFixed(1)}g (range ${stat.min}-${stat.max}g)`);
      } else if (target < stat.min - 1 || target > stat.max + 1) {
        note(path, text, `claims about ${target}g from ${label}, outside the real ${stat.min}-${stat.max}g spread`);
      }
    }

    // Protein ranges: "50-55g on most days", "a range of 134-171g".
    for (const m of text.matchAll(/(\d{2,3})\s*-\s*(\d{2,3})\s*g\b([^.]{0,60})/gi)) {
      const [lo, hi] = [Number(m[1]), Number(m[2])];
      const ctx = `${text.slice(Math.max(0, m.index - 90), m.index)} ${m[3] || ''}`.toLowerCase();
      if (!/protein/.test(ctx)) continue;
      const isCombo = /breakfast and the (daily )?extra|between them/.test(ctx);
      const stat = isCombo ? facts.protein.combo : facts.protein.daily;
      const label = isCombo ? 'breakfast and the daily extra' : 'the daily total';
      if (lo !== stat.min || hi !== stat.max) {
        note(path, text, `states a protein range of ${lo}-${hi}g for ${label}, actual spread is ${stat.min}-${stat.max}g`);
      }
    }

    // Percentage of energy from protein.
    //
    // Scope matters: a sentence naming specific dishes is a claim about those
    // dishes, and is checked against them. "the bean mash, the lentil bowl and
    // the tuna pasta all land above 28%" was measured against the daily minimum
    // and looked like a false positive; checked against the three dishes it
    // names, it was simply false - one of them is 22%.
    for (const m of text.matchAll(/(\d{1,2})\s*(?:%|per cent) of (?:its |their )?(?:energy|calories) (?:from|as) protein/gi)) {
      const target = Number(m[1]);
      const sentence = text.slice(Math.max(0, m.index - 200), m.index + 60).toLowerCase();
      const named = Object.values(book.meals).filter((meal) => {
        const key = plain(meal.name).toLowerCase().replace(/^the /, '');
        const distinctive = key.split(/\s+/).filter((w) => w.length > 4);
        return distinctive.length >= 2 && distinctive.every((w) => sentence.includes(w));
      });

      if (named.length) {
        const below = named.filter((meal) => (meal.macros.protein * 4 * 100) / meal.macros.kcal < target);
        if (below.length) {
          note(path, text, `claims the named dishes are above ${target}% of energy from protein, but ${below
            .map((x) => `${plain(x.name)} is ${((x.macros.protein * 4 * 100) / x.macros.kcal).toFixed(1)}%`)
            .join(', ')}`);
        }
      } else if (/\b(a day|every day|each day|the plan|these weeks)\b/.test(sentence)
        && target > facts.protein.energyPercent.min + 0.5) {
        note(path, text, `claims ${target}% of energy from protein, but the lowest day is ${facts.protein.energyPercent.min.toFixed(1)}%`);
      }
    }

    /* ── week-one cupboard prose ────────────────────────────────────── */
    // Any sentence asserting what week one buys for the cupboard is resolved
    // term by term against the generated week-one set.
    if (/week one(?:'s)?[^.]{0,60}\b(buys|carries|carry|list carries|includes|contains)\b/i.test(text)
      || /\bcupboard section\b/i.test(text)) {
      for (const [term, satisfiedBy] of CUPBOARD_CONCEPTS) {
        const pattern = new RegExp(`(^|[\\s,])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s,.]|$)`, 'i');
        if (!pattern.test(text)) continue;
        const satisfied = satisfiedBy.some((staple) => facts.cupboard.weekOne.has(staple));
        if (!satisfied) {
          note(path, text, `names "${term}" as a week-one cupboard buy, but week one buys none of: ${satisfiedBy.join(', ')}`);
        }
      }
    }

    /* ── dinner timing ──────────────────────────────────────────────── */
    const dinnerTime = facts.time.dinner;

    // "forty minutes at the outside" - the stated ceiling must be the real one.
    for (const m of text.matchAll(new RegExp(`${NUM}\\s*minutes? at the outside`, 'gi'))) {
      const claimed = toNumber(m[1]);
      if (claimed !== null && claimed !== dinnerTime.max) {
        note(path, text, `states a ${claimed}-minute ceiling, but the longest dinner is ${dinnerTime.max} minutes`);
      }
    }

    // "most take thirty" - must be true of most dinners.
    for (const m of text.matchAll(new RegExp(`most (?:take|are)\\s*(?:about\\s*|around\\s*)?${NUM}`, 'gi'))) {
      const claimed = toNumber(m[1]);
      if (claimed === null) continue;
      const times = [...facts.time.byRecipe.values()];
      const dinnerTimes = Object.values(book.meals).filter((x) => x.kind === 'dinner').map((x) => x.timeMins);
      const within = dinnerTimes.filter((t) => t <= claimed).length;
      if (within * 2 <= dinnerTimes.length) {
        note(path, text, `says most dinners take ${claimed} minutes, but only ${within} of ${dinnerTimes.length} do`);
      }
    }

    // "X-Y min" as a dinner range, on the cover or in prose.
    for (const m of text.matchAll(/(\d{2})\s*-\s*(\d{2})\s*min/gi)) {
      const [lo, hi] = [Number(m[1]), Number(m[2])];
      const ctx = `${path} ${text}`.toLowerCase();
      if (!/dinner/.test(ctx)) continue;
      if (lo !== dinnerTime.min || hi !== dinnerTime.max) {
        note(path, text, `states a dinner range of ${lo}-${hi} min, actual spread is ${dinnerTime.min}-${dinnerTime.max} min`);
      }
    }

    // "in under forty minutes" attached to a recipe - that recipe must be under it.
    if (path.startsWith('meals.')) {
      const id = path.split('.')[1];
      const mins = facts.time.byRecipe.get(id);
      for (const m of text.matchAll(new RegExp(`under\\s*${NUM}\\s*minutes`, 'gi'))) {
        const claimed = toNumber(m[1]);
        if (claimed !== null && mins != null && mins >= claimed) {
          note(path, text, `says "under ${m[1]} minutes" but the recipe is ${mins} minutes`);
        }
      }
    }

    /* ── counts ─────────────────────────────────────────────────────── */
    for (const m of text.matchAll(/\b(\d{1,2}|twenty-four|twenty-one)\s+(?:unique\s+|distinct\s+)?dinners?\b/gi)) {
      const claimed = toNumber(m[1]);
      const ctx = text.slice(Math.max(0, m.index - 60), m.index + 80).toLowerCase();
      if (claimed === null) continue;
      // Only whole-book statements; weekly counts are checked by claims.mjs.
      if (!/in (this|the) book|altogether|in total|all \w+ dinners/.test(ctx)) continue;
      if (claimed !== facts.counts.uniqueDinners) {
        note(path, text, `claims ${claimed} dinners in the book, actual unique count is ${facts.counts.uniqueDinners}`);
      }
    }

    for (const m of text.matchAll(/\b(\d{1,2})\s+(?:of the\s+)?dinners are meat-free/gi)) {
      const claimed = Number(m[1]);
      if (facts.counts.meatFreeDinners && claimed !== facts.counts.meatFreeDinners) {
        note(path, text, `claims ${claimed} meat-free dinners, actual is ${facts.counts.meatFreeDinners}`);
      }
    }
  }

  return failures;
}

export { plain };
