import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chunkReloadKey,
  claimChunkReload,
  isChunkLoadError,
} from '../src/utils/errorRecovery.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
}

test('recognises stale dynamic-import failures without treating ordinary render errors as chunks', () => {
  assert.equal(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module')), true);
  assert.equal(isChunkLoadError(new Error('Loading chunk 42 failed')), true);
  assert.equal(isChunkLoadError(new Error('Cannot read properties of undefined')), false);
});

test('claims one reload per route and error signature', () => {
  const storage = memoryStorage();
  const error = new Error('Loading chunk 42 failed');

  assert.equal(claimChunkReload(error, { pathname: '/blog', storage }), true);
  assert.equal(claimChunkReload(error, { pathname: '/blog', storage }), false);
  assert.equal(claimChunkReload(error, { pathname: '/browse', storage }), true);
});

test('does not reload if session storage is unavailable', () => {
  const storage = { getItem: () => { throw new Error('blocked'); } };
  assert.equal(claimChunkReload(new Error('Loading chunk 42 failed'), { storage }), false);
});

test('chunk retry keys are bounded and route-specific', () => {
  const key = chunkReloadKey(new Error(`Loading chunk ${'x'.repeat(500)} failed`), '/plans/example');
  assert.match(key, /^mealprep:chunk-reload:\/plans\/example:/);
  assert.ok(key.length < 300);
});
