import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONSENT_MAX_AGE_MS,
  CONSENT_RECORD_VERSION,
  readConsentRecord,
  writeConsentRecord,
} from '../src/utils/consentRecord.js';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    value: key => values.get(key),
  };
}

test('consent records include the current schema version and an ISO timestamp', () => {
  const storage = memoryStorage();
  const now = Date.parse('2026-09-02T10:30:00.000Z');

  writeConsentRecord(storage, 'choice', 'granted', { now });

  assert.deepEqual(JSON.parse(storage.value('choice')), {
    choice: 'granted',
    version: CONSENT_RECORD_VERSION,
    updatedAt: '2026-09-02T10:30:00.000Z',
  });
  assert.equal(readConsentRecord(storage, 'choice', { now }), 'granted');
});

test('legacy consent choices are migrated without changing their meaning', () => {
  const storage = memoryStorage({ choice: 'denied' });
  const now = Date.parse('2026-09-02T10:30:00.000Z');

  assert.equal(readConsentRecord(storage, 'choice', { now }), 'denied');
  assert.deepEqual(JSON.parse(storage.value('choice')), {
    choice: 'denied',
    version: CONSENT_RECORD_VERSION,
    updatedAt: '2026-09-02T10:30:00.000Z',
    migratedFrom: 'legacy',
  });
});

test('expired, outdated and malformed consent records require a fresh choice', () => {
  const now = Date.parse('2026-09-02T10:30:00.000Z');
  const expiredAt = new Date(now - CONSENT_MAX_AGE_MS - 1).toISOString();
  const cases = [
    JSON.stringify({ choice: 'granted', version: CONSENT_RECORD_VERSION, updatedAt: expiredAt }),
    JSON.stringify({ choice: 'granted', version: CONSENT_RECORD_VERSION + 1, updatedAt: new Date(now).toISOString() }),
    JSON.stringify({ choice: 'maybe', version: CONSENT_RECORD_VERSION, updatedAt: new Date(now).toISOString() }),
    '{not-json',
  ];

  for (const value of cases) {
    assert.equal(readConsentRecord(memoryStorage({ choice: value }), 'choice', { now }), 'unset');
  }
});
