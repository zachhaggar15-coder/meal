// A plan page runs to roughly 10,000px. Someone returning for the shopping list
// had to scroll past seven days of meals to reach it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const planPage = fs.readFileSync(path.join(root, 'src/pages/PlanPage.jsx'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src/App.css'), 'utf8');

const TARGETS = ['plan-summary', 'meal-plan', 'shopping-list'];

test('every jump link has a target that exists on the page', () => {
  for (const id of TARGETS) {
    assert.match(planPage, new RegExp(`href="#${id}"`), `${id} is linked`);
    assert.match(planPage, new RegExp(`id="${id}"`), `${id} exists as an anchor`);
  }
});

test('the nav is plain anchors, so it works in the prerendered HTML', () => {
  // Slice forward from the nav itself: the first </nav> in the file belongs to
  // the breadcrumb, which would make this assert against the wrong element.
  const navStart = planPage.indexOf('className="plan-jump"');
  const navBlock = planPage.slice(navStart, planPage.indexOf('</nav>', navStart));
  assert.match(navBlock, /<a href="#/, 'must be real anchors');
  assert.doesNotMatch(navBlock, /onClick|useState|scrollIntoView/, 'no JavaScript scroll handling');
});

test('anchor targets clear the sticky navbar', () => {
  // Without this the heading an anchor lands on sits underneath the sticky
  // header, so the section appears to have been skipped.
  // Again, search forward from the rule that matters - scroll-margin-top
  // appears elsewhere in the stylesheet.
  const ruleStart = css.indexOf('#plan-summary,');
  assert.notEqual(ruleStart, -1, 'the anchor-offset rule must exist');
  const rule = css.slice(ruleStart, css.indexOf('}', ruleStart) + 1);
  assert.match(rule, /scroll-margin-top/);
  for (const id of TARGETS) assert.ok(rule.includes(`#${id}`), `${id} needs scroll-margin`);
});

test('the nav is labelled for assistive tech', () => {
  assert.match(planPage, /<nav className="plan-jump" aria-label="On this page">/);
});
