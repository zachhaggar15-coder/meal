// IndexNow contract tests.
//
// Nothing here may reach the network. globalThis.fetch is replaced with a spy
// that throws if anything calls it, and every submission test injects its own
// fetch, so a genuine submission is a test failure rather than a surprise.

import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  INDEXNOW_KEY_FILENAME,
  INDEXNOW_KEY_LOCATION,
  MAX_URLS_PER_BATCH,
  MAX_URLS_PER_RUN,
  PRODUCTION_HOST,
  PRODUCTION_ORIGIN,
  applySubmittedChanges,
  batchUrls,
  buildManifest,
  buildPayload,
  diffManifests,
  fingerprintPage,
  isAuthorisedCronRequest,
  isDisabled,
  isProductionEnvironment,
  manifestRoutes,
  normaliseUrl,
  prepareUrls,
  selectRoutesToSubmit,
  submitUrls,
} from '../server/indexnow.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const silentLogger = { warn() {} };

let realFetch;
let realFetchCalls;

beforeEach(() => {
  realFetch = globalThis.fetch;
  realFetchCalls = 0;
  globalThis.fetch = (...args) => {
    realFetchCalls += 1;
    throw new Error(`Test made a real network call to ${args[0]}`);
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
  assert.equal(realFetchCalls, 0, 'IndexNow tests must not make real network calls');
});

// ── Key file ─────────────────────────────────────────────────────────────────

test('the ownership key is a valid IndexNow key', () => {
  assert.match(INDEXNOW_KEY, /^[A-Za-z0-9-]{8,128}$/);
});

test('the key file is served from the production root and matches the key', () => {
  const keyFile = path.join(root, 'public', INDEXNOW_KEY_FILENAME);
  assert.ok(fs.existsSync(keyFile), `${INDEXNOW_KEY_FILENAME} is missing from public/`);

  const bytes = fs.readFileSync(keyFile);
  assert.equal(bytes.toString('utf8'), INDEXNOW_KEY, 'key file content must be exactly the key');
  // UTF-8 with no BOM and no trailing newline: engines compare the body byte
  // for byte against the submitted key.
  assert.equal(bytes.length, INDEXNOW_KEY.length);
  assert.equal(INDEXNOW_KEY_LOCATION, `${PRODUCTION_ORIGIN}/${INDEXNOW_KEY_FILENAME}`);
});

test('the key file is served as text/plain from the production domain', () => {
  const { headers } = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const rule = headers.find(entry => entry.source === `/${INDEXNOW_KEY_FILENAME}`);
  assert.ok(rule, 'vercel.json has no header rule for the IndexNow key file');
  const contentType = rule.headers.find(header => header.key === 'Content-Type');
  assert.match(contentType.value, /^text\/plain; charset=utf-8$/);
});

test('the sync endpoint is scheduled by a Vercel cron, not by hand', () => {
  const { crons } = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.ok(Array.isArray(crons) && crons.length, 'no cron schedule configured');
  assert.ok(crons.some(cron => cron.path === '/api/indexnow-sync'));
});

// ── Payload ──────────────────────────────────────────────────────────────────

test('the submission payload matches the IndexNow specification', () => {
  const payload = buildPayload([`${PRODUCTION_ORIGIN}/plans/aldi-weight-loss-1500`]);
  assert.deepEqual(Object.keys(payload).sort(), ['host', 'key', 'keyLocation', 'urlList']);
  assert.equal(payload.host, PRODUCTION_HOST);
  assert.equal(payload.key, INDEXNOW_KEY);
  assert.equal(payload.keyLocation, INDEXNOW_KEY_LOCATION);
  assert.ok(payload.urlList.every(url => url.startsWith(`${PRODUCTION_ORIGIN}/`)));
  assert.equal(INDEXNOW_ENDPOINT, 'https://api.indexnow.org/indexnow');
});

// ── Production domain enforcement ────────────────────────────────────────────

test('only canonical production URLs are accepted', () => {
  assert.equal(normaliseUrl('/browse'), `${PRODUCTION_ORIGIN}/browse`);
  assert.equal(normaliseUrl(`${PRODUCTION_ORIGIN}/blog/meal-prep`), `${PRODUCTION_ORIGIN}/blog/meal-prep`);
  // The apex is the same site under a non-canonical name, so it is rewritten.
  assert.equal(normaliseUrl('https://mealprep.org.uk/quiz'), `${PRODUCTION_ORIGIN}/quiz`);
  // Trailing slashes and fragments collapse onto the canonical form.
  assert.equal(normaliseUrl(`${PRODUCTION_ORIGIN}/quiz/#top`), `${PRODUCTION_ORIGIN}/quiz`);
  assert.equal(normaliseUrl(`${PRODUCTION_ORIGIN}/quiz?utm_source=x`), `${PRODUCTION_ORIGIN}/quiz`);
  assert.equal(normaliseUrl('/'), `${PRODUCTION_ORIGIN}/`);
});

test('preview, local and foreign URLs are rejected', () => {
  const rejected = [
    'http://localhost:5173/browse',
    'http://127.0.0.1:3000/',
    'https://meal-plan-generator-git-branch.vercel.app/browse',
    'https://mealprep-org-uk.vercel.app/plans/x',
    'https://staging.mealprep.org.uk/browse',
    'https://evil.example.com/browse',
    'https://www.mealprep.org.uk.evil.com/browse',
    'javascript:alert(1)',
    'not a url',
    '',
    '   ',
    null,
    undefined,
    42,
    '/plans/../../etc/passwd',
  ];
  for (const value of rejected) {
    assert.equal(normaliseUrl(value), null, `${String(value)} should be rejected`);
  }
});

test('preview URLs cannot leak into a prepared submission', () => {
  const { urls, rejected } = prepareUrls([
    '/browse',
    'https://preview.vercel.app/browse',
    'http://localhost:5173/browse',
  ]);
  assert.deepEqual(urls, [`${PRODUCTION_ORIGIN}/browse`]);
  assert.equal(rejected.length, 2);
});

test('duplicate URLs are submitted once', () => {
  const { urls } = prepareUrls([
    '/browse',
    `${PRODUCTION_ORIGIN}/browse`,
    `${PRODUCTION_ORIGIN}/browse/`,
    'https://mealprep.org.uk/browse',
    '/quiz',
  ]);
  assert.deepEqual(urls, [`${PRODUCTION_ORIGIN}/browse`, `${PRODUCTION_ORIGIN}/quiz`]);
});

// ── Batching and submission ──────────────────────────────────────────────────

test('large submissions are split into batches', () => {
  const urls = Array.from({ length: MAX_URLS_PER_BATCH * 2 + 1 }, (_, i) => `${PRODUCTION_ORIGIN}/plans/p${i}`);
  const batches = batchUrls(urls);
  assert.equal(batches.length, 3);
  assert.equal(batches[0].length, MAX_URLS_PER_BATCH);
  assert.equal(batches[2].length, 1);
  assert.equal(batches.flat().length, urls.length);
});

test('submitUrls posts standards-compliant batches to the shared endpoint', async () => {
  const calls = [];
  const urls = Array.from({ length: 5 }, (_, i) => `/plans/p${i}`);
  const result = await submitUrls(urls, {
    batchSize: 2,
    fetchImpl: async (endpoint, init) => {
      calls.push({ endpoint, body: JSON.parse(init.body), method: init.method });
      return { status: 200 };
    },
  });

  assert.equal(result.ok, true);
  assert.equal(calls.length, 3);
  assert.equal(result.submitted.length, 5);
  for (const call of calls) {
    assert.equal(call.endpoint, INDEXNOW_ENDPOINT);
    assert.equal(call.method, 'POST');
    assert.equal(call.body.host, PRODUCTION_HOST);
    assert.equal(call.body.key, INDEXNOW_KEY);
    assert.equal(call.body.keyLocation, INDEXNOW_KEY_LOCATION);
    assert.ok(call.body.urlList.length <= 2);
  }
});

test('nothing is posted when every URL is rejected', async () => {
  let called = false;
  const result = await submitUrls(['http://localhost/x', 'https://other.example/y'], {
    fetchImpl: async () => { called = true; return { status: 200 }; },
  });
  assert.equal(called, false);
  assert.equal(result.submitted.length, 0);
  assert.equal(result.rejected.length, 2);
});

test('a network failure is reported, not thrown', async () => {
  const result = await submitUrls(['/browse'], {
    logger: silentLogger,
    fetchImpl: async () => { throw new Error('ECONNRESET'); },
  });
  assert.equal(result.ok, false);
  assert.equal(result.submitted.length, 0);
  assert.match(result.error, /ECONNRESET/);
});

test('an API error stops further batches and reports what was accepted', async () => {
  const urls = Array.from({ length: 6 }, (_, i) => `/plans/p${i}`);
  let call = 0;
  const result = await submitUrls(urls, {
    batchSize: 2,
    logger: silentLogger,
    fetchImpl: async () => {
      call += 1;
      return { status: call === 2 ? 403 : 200 };
    },
  });

  assert.equal(result.ok, false);
  assert.equal(call, 2, 'submission stops at the first failure');
  assert.equal(result.submitted.length, 2);
  assert.match(result.error, /403/);
});

test('202 Accepted counts as a successful submission', async () => {
  const result = await submitUrls(['/browse'], { fetchImpl: async () => ({ status: 202 }) });
  assert.equal(result.ok, true);
  assert.deepEqual(result.submitted, [`${PRODUCTION_ORIGIN}/browse`]);
});

// ── Change detection ─────────────────────────────────────────────────────────

test('fingerprints ignore build noise but track real content changes', () => {
  const before = fingerprintPage(
    '<title>Plan</title>',
    '<main>Two chicken traybakes</main><span>&copy; 2026 MealPrep.org.uk</span><script src="/assets/index-A1b2C3d4.js"></script>',
  );
  const sameContentNextYearAndBuild = fingerprintPage(
    '<title>Plan</title>',
    '<main>Two  chicken traybakes</main>\n<span>&copy; 2027 MealPrep.org.uk</span><script src="/assets/index-Z9y8X7w6.js"></script>',
  );
  const edited = fingerprintPage(
    '<title>Plan</title>',
    '<main>Three chicken traybakes</main><span>&copy; 2026 MealPrep.org.uk</span><script src="/assets/index-A1b2C3d4.js"></script>',
  );

  assert.equal(before, sameContentNextYearAndBuild);
  assert.notEqual(before, edited);
});

test('the manifest is a sorted, versioned route fingerprint map', () => {
  const manifest = buildManifest({ '/quiz': 'b', '/browse': 'a' }, { generatedAt: '2026-01-01T00:00:00.000Z' });
  assert.deepEqual(Object.keys(manifest.routes), ['/browse', '/quiz']);
  assert.equal(manifest.host, PRODUCTION_HOST);
  assert.deepEqual(manifestRoutes(manifest), { '/browse': 'a', '/quiz': 'b' });
  assert.equal(manifestRoutes({}), null);
  assert.equal(manifestRoutes(null), null);
});

test('diffing reports created, changed and removed routes only', () => {
  const diff = diffManifests(
    { '/a': '1', '/b': '2', '/gone': '3' },
    { '/a': '1', '/b': 'changed', '/new': '4' },
  );
  assert.deepEqual(diff, { added: ['/new'], changed: ['/b'], removed: ['/gone'] });
  assert.deepEqual(
    diffManifests({ '/a': '1' }, { '/a': '1' }),
    { added: [], changed: [], removed: [] },
  );
});

test('a sweeping change never becomes a site-wide resubmission', () => {
  const current = Object.fromEntries(
    Array.from({ length: MAX_URLS_PER_RUN + 50 }, (_, i) => [`/plans/p${i}`, 'x']),
  );
  const routes = selectRoutesToSubmit(diffManifests({}, current));
  assert.equal(routes.length, MAX_URLS_PER_RUN);
});

test('the snapshot only advances for routes that were actually submitted', () => {
  const previous = { '/a': '1', '/b': '2', '/gone': '3' };
  const current = { '/a': 'new', '/b': 'new', '/added': '9' };
  const next = applySubmittedChanges(previous, current, ['/a', '/gone']);
  assert.deepEqual(next, { '/a': 'new', '/b': '2' });
});

// ── Environment ──────────────────────────────────────────────────────────────

test('submissions are production-only and can be switched off', () => {
  assert.equal(isProductionEnvironment({ VERCEL_ENV: 'production' }), true);
  assert.equal(isProductionEnvironment({ VERCEL_ENV: 'preview' }), false);
  assert.equal(isProductionEnvironment({}), false);
  assert.equal(isDisabled({ INDEXNOW_DISABLED: 'true' }), true);
  assert.equal(isDisabled({ INDEXNOW_DISABLED: 'false' }), false);
  assert.equal(isDisabled({}), false);
});

test('only Vercel cron invocations reach the sync endpoint', () => {
  assert.equal(isAuthorisedCronRequest({ 'x-vercel-cron-schedule': '0 4 * * *' }, {}), true);
  assert.equal(isAuthorisedCronRequest({ 'x-vercel-cron': '1' }, {}), true);
  assert.equal(isAuthorisedCronRequest({ 'user-agent': 'vercel-cron/1.0' }, {}), true);
  assert.equal(isAuthorisedCronRequest({ 'user-agent': 'curl/8.0' }, {}), false);
  assert.equal(isAuthorisedCronRequest({}, {}), false);

  const env = { CRON_SECRET: 'sekrit' };
  assert.equal(isAuthorisedCronRequest({ authorization: 'Bearer sekrit' }, env), true);
  assert.equal(isAuthorisedCronRequest({ authorization: 'Bearer wrong!' }, env), false);
  assert.equal(isAuthorisedCronRequest({ authorization: 'Bearer' }, env), false);
  // The header markers stop being enough once a secret is configured.
  assert.equal(isAuthorisedCronRequest({ 'x-vercel-cron': '1' }, env), false);
});
