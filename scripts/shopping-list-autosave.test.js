// Ticking a shopping-list item is the point a plan becomes this week's shop.
// Progress was always stored, but in its own record keyed by route, so a plan
// could accumulate ticks and still be absent from Saved Plans - leaving the
// user's progress reachable only from a URL they no longer had.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const listSource = fs.readFileSync(path.join(root, 'src/components/TickableShoppingList.jsx'), 'utf8');
const retentionSource = fs.readFileSync(path.join(root, 'src/utils/planRetention.js'), 'utf8');

function withLocalStorage(run) {
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: key => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: key => store.delete(key),
    },
    dispatchEvent: () => true,
  };
  globalThis.CustomEvent = class { constructor(type, init) { this.type = type; Object.assign(this, init); } };
  try { return run(store); } finally { delete globalThis.window; delete globalThis.CustomEvent; }
}

const reference = {
  route: '/plans/aldi-weight-loss-1500',
  slug: 'aldi-weight-loss-1500',
  title: 'Aldi Weight Loss Meal Plan',
  supermarket: 'aldi',
};

test('ensureSavedPlan adds a plan once and never removes it', async () => {
  const { ensureSavedPlan, isPlanSaved } = await import('../src/utils/planRetention.js');
  withLocalStorage(() => {
    assert.equal(isPlanSaved(reference.route), false);

    const first = ensureSavedPlan(reference);
    assert.equal(first.added, true, 'first call adds');
    assert.equal(isPlanSaved(reference.route), true);

    const second = ensureSavedPlan(reference);
    assert.equal(second.added, false, 'second call is a no-op');
    assert.equal(second.saved, true);
    assert.equal(isPlanSaved(reference.route), true,
      'ensureSavedPlan must never toggle a saved plan back off');
  });
});

test('only the first tick saves, so a deliberate un-save is not undone', () => {
  assert.match(
    listSource,
    /if \(nextChecked && checked\.length === 0 && planReference\)/,
    'guard must require the transition into the first checked item',
  );
  assert.match(listSource, /ensureSavedPlan\(planReference\)/);
  assert.doesNotMatch(listSource, /toggleSavedPlan/, 'toggling here would remove an already-saved plan');
});

test('the auto-save is disclosed rather than silent', () => {
  assert.match(listSource, /added to your plans/);
});

test('ensureSavedPlan is exported and distinct from toggleSavedPlan', () => {
  assert.match(retentionSource, /export function ensureSavedPlan/);
  assert.match(retentionSource, /export function toggleSavedPlan/);
});
