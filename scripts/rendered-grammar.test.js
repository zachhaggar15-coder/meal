// Grammar defects that only exist once the page is rendered.
//
// The earlier grammar pass checked source strings and fixed the hub copy. It
// could not see three things that were wrong in the built output:
//
//   "Why Choose a Aldi 1800 Calorie Meal Plan?"  — a literal article before an
//                                                  interpolated brand name
//   "the a generic UK supermarket average shopping list"
//                                                — one label used in a slot
//                                                  that supplies its own "the"
//   descriptions built as `a ${goal.label}`      — fine until a goal called
//                                                  "Anti-Inflammatory" exists,
//                                                  which two of them now do
//
// So this reads dist/ rather than src/. It is deliberately narrow: it asserts
// the specific mistakes that have actually occurred, on the real corpus, rather
// than trying to be a general grammar checker.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { visibleText } from './audit-rendered-corpus.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

function pages() {
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'index.html') found.push(full);
    }
  };
  walk(DIST);
  return found;
}

// Words whose written form starts with a vowel letter and whose spoken form
// starts with a vowel sound — the two have to agree for "a"/"an" to be right.
//
// These were case-sensitive, so they could only ever catch an article in the
// middle of a sentence. "A Aldi weight loss plan at 1,500 calories" opened a
// paragraph on every generated plan page and matched neither — the detector was
// blind to the sentence-initial case, which is exactly where a capitalised
// template defect lands. Both are case-insensitive now.
const NEEDS_AN = /\ba (?=(?:Aldi|Asda|Iceland|Ocado|M&S|anti-inflammatory|endurance|hour|honest)\b)/i;
const NEEDS_A = /\ban (?=(?:Tesco|Lidl|Waitrose|Morrisons|Co-op|Sainsbury|generic|budget|one-pot)\b)/i;
// A determiner immediately followed by another determiner.
const DOUBLE_DETERMINER = /\bthe (?:a|an|the)\b|\ba (?:a|an|the)\b|\ban (?:a|an|the)\b/i;

const skip = !fs.existsSync(DIST) && 'no build to check — run npm run build first';

test('no rendered page uses the wrong indefinite article', { skip }, () => {
  const offenders = [];
  for (const page of pages()) {
    const text = visibleText(fs.readFileSync(page, 'utf8'));
    const route = `/${path.relative(DIST, page).split(path.sep).join('/').replace(/index\.html$/, '')}`;
    for (const pattern of [NEEDS_AN, NEEDS_A]) {
      const match = pattern.exec(text);
      if (!match) continue;
      const excerpt = text.slice(match.index, match.index + 44).trim();
      offenders.push(`${route}: "${excerpt}"`);
    }
  }
  assert.deepEqual(offenders.slice(0, 8), []);
});

test('no rendered page stacks two determiners', { skip }, () => {
  const offenders = [];
  for (const page of pages()) {
    const text = visibleText(fs.readFileSync(page, 'utf8'));
    const match = DOUBLE_DETERMINER.exec(text);
    if (!match) continue;
    const route = `/${path.relative(DIST, page).split(path.sep).join('/').replace(/index\.html$/, '')}`;
    offenders.push(`${route}: "${text.slice(match.index, match.index + 46).trim()}"`);
  }
  assert.deepEqual(offenders.slice(0, 8), []);
});

test('the detectors still fire on the defects they were built for (control)', () => {
  // Positive controls: the exact strings that shipped.
  assert.ok(NEEDS_AN.test('Why Choose a Aldi 1800 Calorie Meal Plan?'));
  assert.ok(NEEDS_AN.test('Start with a anti-inflammatory plan'));
  // The sentence-initial forms the detector used to be blind to.
  assert.ok(NEEDS_AN.test('A Aldi weight loss plan at 1,500 calories is useful'));
  assert.ok(NEEDS_A.test('An Tesco plan is cheaper'));
  assert.ok(DOUBLE_DETERMINER.test('summarises all 7 days at 1,800 kcal/day, the a generic UK supermarket'));
  assert.ok(NEEDS_A.test('Can I use an Tesco plan elsewhere?'));

  // Negative controls: the corrected forms, and ordinary prose.
  assert.ok(!NEEDS_AN.test('Why Choose an Aldi 1800 Calorie Meal Plan?'));
  assert.ok(!NEEDS_AN.test('Start with an anti-inflammatory plan'));
  assert.ok(!DOUBLE_DETERMINER.test('the generic UK supermarket shopping list'));
  assert.ok(!NEEDS_A.test('Can I use a Tesco plan elsewhere?'));
  assert.ok(!DOUBLE_DETERMINER.test('a plan the reader can follow'));
});
