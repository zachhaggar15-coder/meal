// IndexNow (https://www.indexnow.org/documentation) support for MealPrep.org.uk.
//
// IndexNow is a notification protocol: it tells participating search engines
// (Bing, Yandex, Seznam, Naver) that a specific URL has been created, changed
// or removed, so they can recrawl it sooner. It is not a ranking mechanism and
// it does not guarantee indexing, so everything here is deliberately
// conservative: only genuinely changed URLs are submitted, and any failure is
// logged and forgotten rather than retried aggressively.
//
// This module is pure and side-effect free apart from the HTTP POST in
// submitUrls(), which takes an injectable fetch so tests never touch the
// network. See docs/indexnow.md.

import crypto from 'node:crypto';

// The site ownership key. IndexNow keys are public by design — the key file is
// served from the production host so search engines can verify that whoever
// submitted the URLs controls the site. It is not a secret and rotating it is
// only necessary if the key file is removed.
export const INDEXNOW_KEY = 'aa4b99c49e40c8e76534a164794bc9be';

export const PRODUCTION_HOST = 'www.mealprep.org.uk';
export const PRODUCTION_ORIGIN = `https://${PRODUCTION_HOST}`;

// Hosts that are the same site under a non-canonical name. Anything else -
// preview deployments, localhost, other domains - is rejected outright.
const APEX_HOST = 'mealprep.org.uk';

export const INDEXNOW_KEY_FILENAME = `${INDEXNOW_KEY}.txt`;
export const INDEXNOW_KEY_LOCATION = `${PRODUCTION_ORIGIN}/${INDEXNOW_KEY_FILENAME}`;

// The shared endpoint. Submitting here forwards the notification to every
// participating engine, which is why no Bing-specific API key is involved.
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export const INDEXNOW_MANIFEST_FILENAME = 'indexnow-manifest.json';
export const INDEXNOW_MANIFEST_VERSION = 1;

// The protocol permits 10,000 URLs per request. A far smaller batch keeps any
// single failure cheap to retry and keeps us well inside sensible limits.
export const MAX_URLS_PER_BATCH = 100;
// Hard ceiling per run. A large refactor that touches every page must not turn
// into a site-wide resubmission; the remainder is picked up on later runs.
export const MAX_URLS_PER_RUN = 200;

const REQUEST_TIMEOUT_MS = 8000;

// ── URL handling ─────────────────────────────────────────────────────────────

// Turns a route or absolute URL into its canonical production URL, or null if
// it does not belong on MealPrep.org.uk. Query strings and fragments are
// dropped: no indexable URL on this site carries either, so anything that
// arrives with one is a tracking artefact rather than a distinct page.
export function normaliseUrl(input) {
  if (typeof input !== 'string') return null;
  const value = input.trim();
  if (!value) return null;

  // `..` is resolved away by the URL parser, so reject traversal before it is
  // silently turned into some other page's URL.
  if (/(^|\/)\.\.(\/|$)/.test(value)) return null;

  let url;
  try {
    url = value.startsWith('/') ? new URL(value, PRODUCTION_ORIGIN) : new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase();
  if (host !== PRODUCTION_HOST && host !== APEX_HOST) return null;

  let pathname = url.pathname;
  if (!pathname.startsWith('/')) return null;
  if (pathname.includes('//') || pathname.includes('..')) return null;
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, '') || '/';

  return `${PRODUCTION_ORIGIN}${pathname}`;
}

// Canonicalises, drops anything that is not a production URL, and deduplicates
// while preserving the caller's order.
export function prepareUrls(urls) {
  const seen = new Set();
  const accepted = [];
  const rejected = [];

  for (const candidate of Array.isArray(urls) ? urls : [urls]) {
    const url = normaliseUrl(candidate);
    if (!url) {
      rejected.push(candidate);
      continue;
    }
    if (seen.has(url)) continue;
    seen.add(url);
    accepted.push(url);
  }

  return { urls: accepted, rejected };
}

export function batchUrls(urls, size = MAX_URLS_PER_BATCH) {
  const batches = [];
  for (let index = 0; index < urls.length; index += size) {
    batches.push(urls.slice(index, index + size));
  }
  return batches;
}

export function buildPayload(urls) {
  return {
    host: PRODUCTION_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls,
  };
}

// ── Submission ───────────────────────────────────────────────────────────────

// 200/202 mean accepted. 400/403/422 mean our key or payload is wrong, which is
// a configuration fault worth surfacing but never worth retrying. 429 and 5xx
// are transient, so the caller leaves the URLs unacknowledged and tries again
// on the next run.
function classifyStatus(status) {
  if (status === 200 || status === 202) return 'accepted';
  if (status === 400 || status === 403 || status === 422) return 'rejected';
  return 'retry';
}

// Submits URLs in batches. Never throws: IndexNow is an optimisation, so a
// caller is free to ignore the result entirely.
export async function submitUrls(urls, options = {}) {
  const {
    fetchImpl = globalThis.fetch,
    endpoint = INDEXNOW_ENDPOINT,
    batchSize = MAX_URLS_PER_BATCH,
    logger = console,
  } = options;

  const { urls: prepared, rejected } = prepareUrls(urls);
  const result = { ok: true, submitted: [], rejected, batches: [] };
  if (!prepared.length) return result;

  if (typeof fetchImpl !== 'function') {
    result.ok = false;
    result.error = 'No fetch implementation available.';
    return result;
  }

  for (const batch of batchUrls(prepared, batchSize)) {
    let outcome;
    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(buildPayload(batch)),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      outcome = { size: batch.length, status: response?.status ?? 0 };
      outcome.result = classifyStatus(outcome.status);
    } catch (err) {
      outcome = { size: batch.length, status: 0, result: 'retry', error: err?.message || String(err) };
    }

    result.batches.push(outcome);

    if (outcome.result === 'accepted') {
      result.submitted.push(...batch);
      continue;
    }

    // Stop at the first failure. The unsubmitted URLs stay unacknowledged so
    // the next run picks them up, and a broken key does not produce a burst of
    // pointless requests.
    result.ok = false;
    result.error = outcome.error || `IndexNow responded ${outcome.status}`;
    logger?.warn?.(JSON.stringify({
      level: 'warn',
      message: 'indexnow_batch_failed',
      status: outcome.status,
      outcome: outcome.result,
      size: batch.length,
    }));
    break;
  }

  return result;
}

// ── Change detection ─────────────────────────────────────────────────────────

// Build output changes on every deploy even when no content did: Vite emits new
// hashed asset filenames, and the footer prints the current year. Normalising
// those out is what stops a routine redeploy from looking like a site-wide
// content change.
const VOLATILE_PATTERNS = [
  [/\/assets\/([^"'\s]+?)-[A-Za-z0-9_-]{8,}\.(js|css|woff2?|png|jpe?g|webp|svg|avif)/g, '/assets/$1.$2'],
  [/&copy;\s*\d{4}/g, '&copy; YEAR'],
  [/©\s*\d{4}/g, '© YEAR'],
];

export function fingerprintPage(...parts) {
  let text = parts.filter(Boolean).join('\n');
  for (const [pattern, replacement] of VOLATILE_PATTERNS) {
    text = text.replace(pattern, replacement);
  }
  // Whitespace between tags carries no content, and the SSR renderer is free to
  // move it around.
  text = text.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16);
}

export function buildManifest(routeFingerprints, { generatedAt = new Date().toISOString() } = {}) {
  const routes = {};
  for (const route of Object.keys(routeFingerprints).sort()) {
    routes[route] = routeFingerprints[route];
  }
  return {
    version: INDEXNOW_MANIFEST_VERSION,
    host: PRODUCTION_HOST,
    generatedAt,
    routes,
  };
}

export function manifestRoutes(manifest) {
  const routes = manifest?.routes;
  if (!routes || typeof routes !== 'object' || Array.isArray(routes)) return null;
  return routes;
}

// Added, materially changed and removed routes between two fingerprint maps.
// Removed routes are reported too: IndexNow accepts URLs that no longer exist
// so engines can drop them, which is the honest signal for a retired page.
export function diffManifests(previousRoutes, currentRoutes) {
  const previous = previousRoutes || {};
  const current = currentRoutes || {};
  const added = [];
  const changed = [];
  const removed = [];

  for (const [route, fingerprint] of Object.entries(current)) {
    if (!(route in previous)) added.push(route);
    else if (previous[route] !== fingerprint) changed.push(route);
  }
  for (const route of Object.keys(previous)) {
    if (!(route in current)) removed.push(route);
  }

  added.sort();
  changed.sort();
  removed.sort();
  return { added, changed, removed };
}

// Routes worth notifying, newest work first, capped so one sweeping change can
// never become a site-wide resubmission.
export function selectRoutesToSubmit(diff, limit = MAX_URLS_PER_RUN) {
  return [...diff.added, ...diff.changed, ...diff.removed].slice(0, limit);
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

// The first production run diffs against a baseline captured before IndexNow
// shipped (server/indexnow-baseline.js), so pages created or changed by the
// installation release itself are submitted rather than absorbed.
//
// That baseline was fingerprinted by a different build on a different machine
// from the one that will be running. Route names are exact either way, but if
// rendering ever differs in some way the normalisation does not cover, the
// "changed" set arrives implausibly large. Beyond this limit it is read as a
// fingerprinting mismatch rather than as a release that genuinely rewrote most
// of the site, and those routes are accepted into the snapshot without being
// submitted - the far cheaper mistake of the two.
export function bootstrapChangedLimit(routeCount) {
  return Math.max(25, Math.ceil(routeCount * 0.05));
}

export function planBootstrapSubmission(baselineRoutes, currentRoutes, limit = MAX_URLS_PER_RUN) {
  const diff = diffManifests(baselineRoutes, currentRoutes);
  const mismatch = diff.changed.length > bootstrapChangedLimit(Object.keys(currentRoutes || {}).length);
  const effective = mismatch ? { ...diff, changed: [] } : diff;

  return {
    diff,
    // Routes taken on trust into the snapshot instead of being submitted, so a
    // mismatch cannot repeat on every later run.
    accepted: mismatch ? diff.changed : [],
    fingerprintMismatch: mismatch,
    routes: selectRoutesToSubmit(effective, limit),
  };
}

// Advances the stored snapshot only for the routes actually submitted, so
// anything left behind by the per-run cap - or by a failed batch - is retried
// on the next run instead of being silently forgotten.
export function applySubmittedChanges(previousRoutes, currentRoutes, submittedRoutes) {
  const next = { ...(previousRoutes || {}) };
  const current = currentRoutes || {};
  for (const route of submittedRoutes) {
    if (route in current) next[route] = current[route];
    else delete next[route];
  }
  return next;
}

// ── Environment ──────────────────────────────────────────────────────────────

export function isProductionEnvironment(env = process.env) {
  return env.VERCEL_ENV === 'production';
}

export function isDisabled(env = process.env) {
  return String(env.INDEXNOW_DISABLED || '').toLowerCase() === 'true';
}

// The sync endpoint takes no input and is idempotent, but it should still only
// run when Vercel's scheduler calls it. If CRON_SECRET is set, Vercel sends it
// as a bearer token and nothing else is accepted; otherwise fall back to the
// markers Vercel puts on cron invocations.
export function isAuthorisedCronRequest(headers = {}, env = process.env) {
  const read = name => {
    const value = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  };

  const secret = env.CRON_SECRET;
  if (secret) {
    const provided = read('authorization') || '';
    const expected = `Bearer ${secret}`;
    if (provided.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  }

  // Vercel puts the triggering expression on every cron request. The older
  // marker header and user agent are accepted too, so a change in any one of
  // them cannot quietly stop the daily run.
  if (read('x-vercel-cron-schedule') || read('x-vercel-cron')) return true;
  return /^vercel-cron\//i.test(read('user-agent') || '');
}
