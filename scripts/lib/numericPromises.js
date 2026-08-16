// Numerical promise contracts for editorial pages.
//
// A page can be technically valid, route correctly and pass every nutrition
// test while still contradicting itself in the reader's face:
//
//   "all under 500 calories per serving" — followed by a 560 kcal dinner
//   "each deliver at least 15 g of protein" — followed by boiled eggs at 13 g
//   "these options each deliver 20–35 g of protein" — followed by a 40 g bowl
//
// Nothing in the recipe or nutrition layer catches that, because every
// individual figure is correct. Only the relationship between the promise and
// the examples underneath it is wrong.
//
// This module extracts both halves from rendered article text and reports
// where they disagree. It reads the prerendered HTML rather than source
// strings, because a promise and its examples are frequently assembled from
// different fields.

// A promise only governs the examples beneath it when it is *distributive* —
// it says something about each item in the list. That distinction is the whole
// difficulty: "aim for 130-150g of protein per day" and "these snacks each
// deliver at least 15g of protein" look almost identical to a regex, but only
// the second is contradicted by a 13g example.
//
// So every pattern below requires an explicit distributive quantifier, and
// anything framed per-day, per-100g or as a personal target is excluded.
const DISTRIBUTIVE = /\b(?:all|each|every|these)\b/i;
const NOT_PER_EXAMPLE = /\b(?:per day|per 100 ?g|a day|daily|per kg|body ?weight|target|aim for|per week)\b/i;

/** Promise patterns, each yielding a predicate over an example's figures. */
const PROMISE_PATTERNS = [
  {
    id: 'under-kcal',
    // "all under 500 calories per serving", "each under 400 kcal"
    pattern: /\b(?:all|each|every)\b[^.]{0,60}?\bunder (\d{2,4}) ?(?:kcal|calories)/i,
    build: match => ({
      kind: 'kcal-max',
      describe: () => `all under ${match[1]} kcal`,
      violated: example => example.kcal !== null && example.kcal > Number(match[1]),
    }),
  },
  {
    id: 'kcal-under-plain',
    // "these snacks each deliver ... for under 200 kcal"
    pattern: /\bfor under (\d{2,4}) ?(?:kcal|calories)/i,
    build: match => ({
      kind: 'kcal-max',
      describe: () => `under ${match[1]} kcal`,
      violated: example => example.kcal !== null && example.kcal > Number(match[1]),
    }),
  },
  {
    id: 'at-least-protein',
    // "each deliver at least 15 g of protein"
    pattern: /\bat least (\d{1,3}) ?g\b[^.]{0,30}?protein/i,
    build: match => ({
      kind: 'protein-min',
      describe: () => `at least ${match[1]}g protein`,
      violated: example => example.protein !== null && example.protein < Number(match[1]),
    }),
  },
  {
    id: 'protein-range',
    // "these options each deliver 20–35 g of protein"
    pattern: /\b(\d{1,3}) ?[-–—] ?(\d{1,3}) ?g\b[^.]{0,30}?protein/i,
    build: match => ({
      kind: 'protein-range',
      describe: () => `${match[1]}–${match[2]}g protein`,
      violated: example => example.protein !== null
        && (example.protein < Number(match[1])
          || (example.proteinHigh ?? example.protein) > Number(match[2])),
    }),
  },
];

/** Pulls kcal and protein figures out of one example line. */
export function parseExample(line) {
  const text = String(line || '');
  // Ranges like "~120–150 kcal" take the upper bound: that is the figure the
  // promise has to hold against.
  const kcalMatch = /(\d{2,4}) ?[-–—] ?(\d{2,4}) ?(?:kcal|calories)/i.exec(text)
    || /(\d{2,4}) ?(?:kcal|calories)/i.exec(text);
  const proteinMatch = /(\d{1,3}) ?[-–—] ?(\d{1,3}) ?g ?(?:of )?protein/i.exec(text)
    || /(\d{1,3}) ?g ?(?:of )?protein/i.exec(text);

  const kcal = kcalMatch ? Number(kcalMatch[2] || kcalMatch[1]) : null;
  // For a protein range the LOWER bound is what an "at least" promise must
  // clear, so keep both ends.
  const proteinLow = proteinMatch ? Number(proteinMatch[1]) : null;
  const proteinHigh = proteinMatch ? Number(proteinMatch[2] || proteinMatch[1]) : null;

  return {
    text: text.trim(),
    kcal,
    protein: proteinLow,
    proteinHigh,
    hasFigures: kcal !== null || proteinLow !== null,
  };
}

/**
 * Finds promise/example contradictions in one article's rendered text.
 *
 * `blocks` is the article split into segments in reading order — a promise
 * governs the examples that follow it until another promise of the same kind
 * replaces it.
 */
export function findNumericContradictions(blocks) {
  const findings = [];
  let active = [];
  // A promise made in the intro, before any section heading, is about the whole
  // article — "all under 500 calories per serving" governs every example on the
  // page. A promise made inside a section is only about that section, and stops
  // at the next heading.
  let pageLevel = [];
  let seenHeading = false;

  for (const raw of blocks) {
    const line = String(raw || '').trim();
    if (!line) continue;

    if (line.startsWith('@@SECTION@@')) {
      if (!seenHeading) {
        pageLevel = active;
        seenHeading = true;
      }
      active = [];
      continue;
    }

    let statedPromise = false;
    for (const { id, pattern, build } of PROMISE_PATTERNS) {
      const match = pattern.exec(line);
      if (!match) continue;
      // Only a distributive statement constrains the examples below it, and a
      // per-day or per-100g figure never does.
      if (!DISTRIBUTIVE.test(line) || NOT_PER_EXAMPLE.test(line)) continue;
      const promise = build(match);
      active = active.filter(item => item.kind !== promise.kind);
      active.push({ ...promise, id, source: line });
      statedPromise = true;
    }

    const example = parseExample(line);
    // A line that states a promise is not itself an example of it, and a
    // per-100g ingredient figure is not a served portion the promise covers.
    if (statedPromise || !example.hasFigures) continue;
    if (NOT_PER_EXAMPLE.test(line)) continue;

    for (const promise of [...pageLevel, ...active]) {
      if (promise.violated(example)) {
        findings.push({
          promise: promise.describe(),
          promiseSource: promise.source.slice(0, 140),
          example: example.text.slice(0, 140),
          kcal: example.kcal,
          protein: example.protein,
        });
      }
    }
  }

  return findings;
}

/**
 * "N ideas" / "N meals" style count promises, reported for review rather than
 * asserted — a count can legitimately be satisfied by variations a parser
 * cannot enumerate.
 */
export function findCountPromises(text) {
  const promises = [];
  const pattern = /\b(\d{1,3}) +(ideas|meals|foods|recipes|snacks|options|swaps)\b/gi;
  for (const match of String(text || '').matchAll(pattern)) {
    promises.push({ claimed: Number(match[1]), noun: match[2].toLowerCase(), source: match[0] });
  }
  return promises;
}

export { PROMISE_PATTERNS, DISTRIBUTIVE, NOT_PER_EXAMPLE };
