// Vercel cron function: GET /api/indexnow-sync
//
// Runs once a day (see "crons" in vercel.json, which registers itself on every
// production deploy). It compares the IndexNow manifest served by the live site
// against the snapshot of what was last submitted, and notifies IndexNow about
// the routes that were added, materially changed or removed since then.
//
// It takes no input, so there is nothing a caller could submit: the only URLs
// it can ever send are MealPrep.org.uk routes that the deployed build itself
// says have changed. Failures are logged and left for the next run - IndexNow
// is an optimisation and nothing on the site depends on it.
//
// Optional env vars:
//   CRON_SECRET        - if set, Vercel sends it and nothing else is accepted
//   INDEXNOW_DISABLED  - "true" turns submissions off without a redeploy
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN - snapshot storage

import { Redis } from '@upstash/redis';
import { INDEXNOW_BASELINE_COMMIT, INDEXNOW_BASELINE_ROUTES } from '../server/indexnow-baseline.js';
import {
  INDEXNOW_MANIFEST_FILENAME,
  PRODUCTION_ORIGIN,
  applySubmittedChanges,
  diffManifests,
  isAuthorisedCronRequest,
  isDisabled,
  isProductionEnvironment,
  manifestRoutes,
  planBootstrapSubmission,
  selectRoutesToSubmit,
  submitUrls,
} from '../server/indexnow.js';

const SNAPSHOT_KEY = 'mealprep:indexnow:v1:snapshot';
const LOCK_KEY = 'mealprep:indexnow:v1:lock';
// Long enough that a retrying scheduler cannot start a second overlapping run,
// short enough that a crashed run recovers well before the next daily fire.
const LOCK_SECONDS = 600;
const MANIFEST_TIMEOUT_MS = 8000;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // Preview and branch deployments share this code but must never notify search
  // engines: their URLs are not the canonical site.
  if (!isProductionEnvironment()) {
    return res.status(403).json({ status: 'skipped', reason: 'not-production' });
  }

  if (!isAuthorisedCronRequest(req.headers || {})) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  if (isDisabled()) {
    return res.status(200).json({ status: 'disabled' });
  }

  const redis = getRedis();
  if (!redis) {
    log('error', 'indexnow_no_snapshot_store');
    return res.status(200).json({ status: 'skipped', reason: 'no-snapshot-store' });
  }

  try {
    const locked = await redis.set(LOCK_KEY, Date.now(), { nx: true, ex: LOCK_SECONDS });
    if (!locked) {
      return res.status(200).json({ status: 'skipped', reason: 'already-running' });
    }

    const current = await fetchLiveManifest();
    if (!current) {
      log('warn', 'indexnow_manifest_unavailable');
      return res.status(200).json({ status: 'skipped', reason: 'manifest-unavailable' });
    }

    const previous = readSnapshot(await redis.get(SNAPSHOT_KEY));

    // First run after installation. The back catalogue must not be resubmitted
    // just because IndexNow now exists, but pages the installation release
    // itself added or changed are genuine news - so diff against the state of
    // the site before IndexNow shipped rather than against nothing.
    if (!previous) {
      return await bootstrap(redis, current, res);
    }

    const diff = diffManifests(previous, current);
    const routes = selectRoutesToSubmit(diff);
    if (!routes.length) {
      return res.status(200).json({ status: 'no-changes', submitted: 0 });
    }

    const result = await submitUrls(routes.map(route => `${PRODUCTION_ORIGIN}${route}`));
    const submittedRoutes = routes.filter(route => (
      result.submitted.includes(`${PRODUCTION_ORIGIN}${route}`)
    ));

    if (submittedRoutes.length) {
      await redis.set(
        SNAPSHOT_KEY,
        JSON.stringify(applySubmittedChanges(previous, current, submittedRoutes)),
      );
    }

    log(result.ok ? 'info' : 'warn', 'indexnow_sync_complete', {
      added: diff.added.length,
      changed: diff.changed.length,
      removed: diff.removed.length,
      submitted: submittedRoutes.length,
      ok: result.ok,
    });

    return res.status(200).json({
      status: result.ok ? 'submitted' : 'partial',
      added: diff.added.length,
      changed: diff.changed.length,
      removed: diff.removed.length,
      submitted: submittedRoutes.length,
      batches: result.batches,
    });
  } catch (err) {
    // A failed sync is never worth an alert-worthy status code: the next run
    // sees exactly the same diff and tries again.
    log('error', 'indexnow_sync_failed', { error: err?.message || String(err) });
    return res.status(200).json({ status: 'error' });
  }
}

async function bootstrap(redis, current, res) {
  const baseline = INDEXNOW_BASELINE_ROUTES;

  // No usable baseline: fall back to recording what is live. Never submit the
  // whole site.
  if (!baseline || !Object.keys(baseline).length) {
    await redis.set(SNAPSHOT_KEY, JSON.stringify(current));
    log('warn', 'indexnow_baseline_missing', { routes: Object.keys(current).length });
    return res.status(200).json({ status: 'baseline', routes: Object.keys(current).length, submitted: 0 });
  }

  const plan = planBootstrapSubmission(baseline, current);
  const result = plan.routes.length
    ? await submitUrls(plan.routes.map(route => `${PRODUCTION_ORIGIN}${route}`))
    : { ok: true, submitted: [], batches: [] };
  const submittedRoutes = plan.routes.filter(route => (
    result.submitted.includes(`${PRODUCTION_ORIGIN}${route}`)
  ));

  // Anything accepted on trust joins the snapshot alongside what was submitted,
  // so the bootstrap reconciliation happens exactly once. Whatever is left -
  // held back by the per-run cap or by a failed batch - stays outstanding and
  // goes out on the next run.
  const snapshot = applySubmittedChanges(
    applySubmittedChanges(baseline, current, plan.accepted),
    current,
    submittedRoutes,
  );
  await redis.set(SNAPSHOT_KEY, JSON.stringify(snapshot));

  log('info', 'indexnow_bootstrap', {
    baselineCommit: INDEXNOW_BASELINE_COMMIT,
    added: plan.diff.added.length,
    changed: plan.diff.changed.length,
    removed: plan.diff.removed.length,
    acceptedWithoutSubmission: plan.accepted.length,
    fingerprintMismatch: plan.fingerprintMismatch,
    submitted: submittedRoutes.length,
    ok: result.ok,
  });

  return res.status(200).json({
    status: 'bootstrap',
    baselineRoutes: Object.keys(baseline).length,
    added: plan.diff.added.length,
    changed: plan.diff.changed.length,
    removed: plan.diff.removed.length,
    fingerprintMismatch: plan.fingerprintMismatch,
    submitted: submittedRoutes.length,
    batches: result.batches,
  });
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({
    url,
    token,
    signal: () => AbortSignal.timeout(3000),
    retry: { retries: 1, backoff: () => 100 },
  });
}

async function fetchLiveManifest() {
  try {
    const response = await fetch(`${PRODUCTION_ORIGIN}/${INDEXNOW_MANIFEST_FILENAME}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(MANIFEST_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return manifestRoutes(await response.json());
  } catch {
    return null;
  }
}

// @upstash/redis deserialises JSON values automatically, but a raw string can
// come back if the value was written by an older client.
function readSnapshot(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return readSnapshot(JSON.parse(value));
    } catch {
      return null;
    }
  }
  if (typeof value !== 'object' || Array.isArray(value)) return null;
  return Object.keys(value).length ? value : null;
}

function log(level, message, extra = {}) {
  const line = JSON.stringify({ level, message, route: '/api/indexnow-sync', ...extra });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}
