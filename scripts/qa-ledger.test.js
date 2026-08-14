import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addManualFinding,
  ledgerRows,
  recheckRoute,
  setFindingAssessment,
  setFindingStatus,
  setPotentiallySystemic,
} from './lib/semanticQaLedger.js';

const NOW = new Date('2026-08-14T12:00:00.000Z');

function emptyLedger() {
  return { version: 1, updatedAt: '', entries: {} };
}

test('a manual finding is opened as New / Uncertain with the given evidence', () => {
  const { ledger, id } = addManualFinding(emptyLedger(), {
    route: '/plans/example', category: 'Recipe method', severity: 'High',
    note: 'Method mismatch', evidence: 'Step 3 references an ingredient not in the list.',
    addedAt: NOW,
  });

  const entry = ledger.entries[id];
  assert.equal(entry.source, 'manual');
  assert.equal(entry.status, 'New');
  assert.equal(entry.humanAssessment, 'Uncertain');
  assert.equal(entry.route, '/plans/example');
  assert.equal(entry.firstDetectedAt, NOW.toISOString());
});

test('addManualFinding rejects an unknown category or severity rather than silently storing it', () => {
  assert.throws(() => addManualFinding(emptyLedger(), {
    route: '/plans/example', category: 'Not a real category', severity: 'High', addedAt: NOW,
  }));
  assert.throws(() => addManualFinding(emptyLedger(), {
    route: '/plans/example', category: 'Recipe method', severity: 'Severe', addedAt: NOW,
  }));
});

test('status and assessment are independent axes on the same finding', () => {
  const { ledger, id } = addManualFinding(emptyLedger(), {
    route: '/plans/example', category: 'Other', severity: 'Low', evidence: 'x', addedAt: NOW,
  });
  const afterStatus = setFindingStatus(ledger, id, 'Fixed');
  const afterAssessment = setFindingAssessment(afterStatus, id, 'True issue', 'confirmed by hand');

  assert.equal(afterAssessment.entries[id].status, 'Fixed');
  assert.equal(afterAssessment.entries[id].humanAssessment, 'True issue');
  assert.equal(afterAssessment.entries[id].humanNote, 'confirmed by hand');
});

test('setFindingStatus rejects an unknown status and never mutates the input ledger', () => {
  const { ledger, id } = addManualFinding(emptyLedger(), {
    route: '/plans/example', category: 'Other', severity: 'Low', evidence: 'x', addedAt: NOW,
  });
  assert.throws(() => setFindingStatus(ledger, id, 'Closed'));
  assert.equal(ledger.entries[id].status, 'New');
});

test('a finding newly detected on recheck is persisted, not just reported', () => {
  const finding = {
    findingId: 'qa_abc123', category: 'Shopping list', patternKey: 'shopping-duplicate-alias',
    severity: 'Medium', explanation: 'Two lines for the same item.', affectedLocation: 'Weekly shopping list',
  };
  const { ledger, result } = recheckRoute(emptyLedger(), '/plans/example', () => [finding], NOW);

  assert.equal(result.newFindings, 1);
  assert.equal(result.stillDetected, 0);
  assert.ok(ledger.entries.qa_abc123);
  assert.equal(ledger.entries.qa_abc123.status, 'New');
  assert.equal(ledger.entries.qa_abc123.lastRecheckResult, 'new');
});

test('a persisted finding is reported as still detected on the next recheck, not new again', () => {
  const finding = {
    findingId: 'qa_abc123', category: 'Shopping list', patternKey: 'shopping-duplicate-alias',
    severity: 'Medium', explanation: 'Two lines for the same item.', affectedLocation: 'Weekly shopping list',
  };
  const first = recheckRoute(emptyLedger(), '/plans/example', () => [finding], NOW);
  const second = recheckRoute(first.ledger, '/plans/example', () => [finding], new Date('2026-08-21T12:00:00.000Z'));

  assert.equal(second.result.newFindings, 0);
  assert.equal(second.result.stillDetected, 1);
});

test('a finding no longer produced by the detector is marked resolved without deleting its history', () => {
  const finding = {
    findingId: 'qa_abc123', category: 'Shopping list', patternKey: 'shopping-duplicate-alias',
    severity: 'Medium', explanation: 'Two lines for the same item.', affectedLocation: 'Weekly shopping list',
  };
  const first = recheckRoute(emptyLedger(), '/plans/example', () => [finding], NOW);
  const second = recheckRoute(first.ledger, '/plans/example', () => [], new Date('2026-08-21T12:00:00.000Z'));

  assert.equal(second.result.noLongerDetected, 1);
  const entry = second.ledger.entries.qa_abc123;
  assert.equal(entry.lastRecheckResult, 'no-longer-detected');
  assert.ok(entry.resolvedAt);
  assert.equal(entry.evidence, 'Two lines for the same item.', 'original evidence is retained, not erased');
});

test('a finding can be flagged as potentially systemic independently of its status or assessment', () => {
  const { ledger, id } = addManualFinding(emptyLedger(), {
    route: '/plans/example', category: 'Recipe method', severity: 'High',
    evidence: 'Dry lentils with no cooking liquid', addedAt: NOW,
  });
  assert.equal(ledger.entries[id].potentiallySystemic, false);

  const flagged = setFindingStatus(setPotentiallySystemic(ledger, id, true), id, 'Fixed');
  assert.equal(flagged.entries[id].potentiallySystemic, true, 'stays flagged even once the single finding is Fixed');
  assert.equal(flagged.entries[id].status, 'Fixed');

  const unflagged = setPotentiallySystemic(flagged, id, false);
  assert.equal(unflagged.entries[id].potentiallySystemic, false);
});

test('a human status/assessment survives a recheck even when the finding is still detected', () => {
  const finding = {
    findingId: 'qa_abc123', category: 'Shopping list', patternKey: 'shopping-duplicate-alias',
    severity: 'Medium', explanation: 'Two lines for the same item.', affectedLocation: 'Weekly shopping list',
  };
  const opened = recheckRoute(emptyLedger(), '/plans/example', () => [finding], NOW).ledger;
  const reviewed = setFindingAssessment(setFindingStatus(opened, 'qa_abc123', 'Fixed'), 'qa_abc123', 'True issue');
  const rechecked = recheckRoute(reviewed, '/plans/example', () => [finding], new Date('2026-08-21T12:00:00.000Z'));

  assert.equal(rechecked.ledger.entries.qa_abc123.status, 'Fixed');
  assert.equal(rechecked.ledger.entries.qa_abc123.humanAssessment, 'True issue');
});

test('an unresolvable route reports unable-to-determine and leaves the ledger untouched', () => {
  const { ledger, result } = recheckRoute(emptyLedger(), '/plans/does-not-exist', () => {
    throw new Error('No plan found');
  }, NOW);

  assert.equal(result.status, 'unable-to-determine');
  assert.deepEqual(ledger.entries, {});
});

test('ledgerRows sorts most recently detected first', () => {
  const older = addManualFinding(emptyLedger(), {
    route: '/plans/a', category: 'Other', severity: 'Low', evidence: 'x',
    addedAt: new Date('2026-08-01T00:00:00.000Z'),
  }).ledger;
  const both = addManualFinding(older, {
    route: '/plans/b', category: 'Other', severity: 'Low', evidence: 'y',
    addedAt: new Date('2026-08-10T00:00:00.000Z'),
  }).ledger;

  const rows = ledgerRows(both);
  assert.equal(rows[0].route, '/plans/b');
  assert.equal(rows[1].route, '/plans/a');
});
