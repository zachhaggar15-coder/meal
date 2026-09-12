// Negative tests for the front-matter fact validator.
//
// A validator that reports nothing is indistinguishable from a validator that
// does nothing. Each case below re-injects one of the stale statements that
// reached a released PDF, and asserts the checker still catches it. If someone
// later loosens a pattern, these fail.
//
//   node build/frontmatter.selftest.mjs

import { assemble } from './assemble.mjs';
import { deriveFacts } from './facts.mjs';
import { checkFrontMatterFacts } from './frontmatter.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ES modules are cached, so the imported definition object is shared between
// calls. Injecting into it would leak into every later case and into the
// positive control. Each case gets its own deep copy.
const load = async (slug) => {
  const { default: def } = await import(pathToFileURL(path.join(ROOT, 'books', slug, 'index.mjs')).href);
  return structuredClone(assemble(def));
};

const CASES = [
  {
    name: 'stale combined breakfast+extra protein figure',
    book: 'lidl-high-protein',
    inject: (b) => { b.sections[0].blocks[1].items[2].text = 'The breakfast and the daily extra carry about 55g of protein between them before you cook anything.'; },
    expect: /55g of protein from breakfast and the daily extra|outside the real/,
  },
  {
    name: 'week-one cupboard prose naming an ingredient never bought',
    book: 'lidl-high-protein',
    inject: (b) => { b.sections[1].blocks[5].text = 'Week one buys the oil, spices, stock, soy, miso, mustard and honey that carry all six weeks.'; },
    expect: /names "miso" as a week-one cupboard buy/,
  },
  {
    name: 'week-one cupboard prose inherited from another plan',
    book: 'aldi-budget',
    inject: (b) => { b.sections[1].blocks[5].text = "Week one's list carries a cupboard section - oil, spices, mustard, soy sauce, stock cubes, honey, peanut butter."; },
    expect: /names "peanut butter" as a week-one cupboard buy/,
  },
  {
    name: 'dinner-time ceiling above the real maximum',
    book: 'lidl-high-protein',
    inject: (b) => { b.sections[0].blocks[1].items[0].b = 'Dinner takes forty minutes at the outside, and most take thirty.'; },
    expect: /states a 40-minute ceiling, but the longest dinner is 35 minutes/,
  },
  {
    name: '"most take N" that is not true of most dinners',
    book: 'lidl-high-protein',
    inject: (b) => { b.sections[0].blocks[1].items[0].b = 'Dinner takes thirty-five minutes at the outside, and most take thirty.'; },
    expect: /says most dinners take 30 minutes, but only 12 of 24 do/,
  },
  {
    name: 'cover dinner range disagreeing with the recipes',
    book: 'lidl-high-protein',
    inject: (b) => { b.facts = b.facts.map((f) => (/dinner/i.test(f.k) ? { ...f, v: '15&ndash;40 min' } : f)); },
    expect: /states a dinner range of 15-40 min, actual spread is 15-35 min/,
  },
  {
    name: 'recipe tagline claiming a time the recipe does not meet',
    book: 'lidl-budget',
    inject: (b) => { b.meals['quorn-cottage-pie'].tagline = 'Under the grill, which is what brings it in under forty minutes.'; },
    expect: /says "under forty minutes" but the recipe is 40 minutes/,
  },
  {
    name: 'dish-level protein percentage claim that one dish misses',
    book: 'lidl-high-protein',
    inject: (b) => { b.weeks[5].notes[0].blocks[1].items[1] = 'Lean on the pulse-and-dairy dinners: the feta, lentil and roasted pepper bowl lands above 28% of energy from protein.'; },
    expect: /claims the named dishes are above 28%/,
  },
  {
    name: 'daily protein mean that does not match the plan',
    book: 'aldi-high-protein',
    inject: (b) => { b.sections[0].lede = 'Written for two adults, at about 190g of protein each a day.'; },
    expect: /claims about 190g of protein from the daily total/,
  },
  {
    name: 'stated protein range that is not the real spread',
    book: 'aldi-high-protein',
    inject: (b) => { b.sections[0].lede = 'Protein lands in a day-to-day range of 120-200g across the six weeks.'; },
    expect: /states a protein range of 120-200g/,
  },
  {
    name: 'whole-book dinner count that is wrong',
    book: 'aldi-budget',
    inject: (b) => { b.tocLede = 'Six weeks of dinners, and the 30 dinners in this book they are built from.'; },
    expect: /claims 30 dinners in the book, actual unique count is 24/,
  },
];

let passed = 0;
const failures = [];

for (const testCase of CASES) {
  const book = await load(testCase.book);
  testCase.inject(book);
  const found = checkFrontMatterFacts(book, deriveFacts(book));
  const hit = found.some((f) => testCase.expect.test(f));
  if (hit) passed += 1;
  else failures.push(`NOT CAUGHT: ${testCase.name} (${testCase.book})\n    expected /${testCase.expect.source}/\n    got: ${found.length ? found.map((f) => f.split('\n')[0]).join(' | ') : '(nothing)'}`);
}

// And the positive control: the real books must still be clean.
for (const slug of ['aldi-budget', 'aldi-high-protein', 'lidl-budget', 'lidl-high-protein']) {
  const book = await load(slug);
  const found = checkFrontMatterFacts(book, deriveFacts(book));
  if (found.length === 0) passed += 1;
  else failures.push(`FALSE POSITIVE in ${slug}: ${found.map((f) => f.split('\n')[0]).join(' | ')}`);
}

console.log(`front-matter validator self-test: ${passed}/${CASES.length + 4} passed`);
if (failures.length) {
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
