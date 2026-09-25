// Vercel function: the Pinterest RSS feeds.
//
//   GET /pinterest/aldi.xml  ->  (vercel.json rewrite)  ->  /api/pinterest-feed?feed=aldi.xml
//
// The build writes every Pin and its release date to the static file
// /pinterest/schedule.json (scripts/generate-pinterest-assets.js). This reads
// it and serves the feed as it stands right now: only Pins whose release date
// has passed, newest first. That is how new Pins reach Pinterest every day
// without a redeploy - a feed that never changes gets exactly one batch of
// Pins, which is what happened after the September 2026 launch.
//
// Nothing here chooses, writes or checks Pins; the build has already done and
// validated all of that. The only input is the feed filename, and only names
// the schedule itself lists are served.

import { SITE_URL } from '../src/constants/site.js';
import { PINTEREST_BASE_PATH } from '../src/pinterest/config.js';
import { renderFeedAt } from '../src/pinterest/feed.js';
import {
  PINTEREST_SCHEDULE_FILENAME,
  feedForFilename,
  scheduleProblems,
} from '../src/pinterest/scheduleFile.js';

const SCHEDULE_TIMEOUT_MS = 8000;
// A warm instance reuses the schedule for a few minutes. It only changes on a
// deploy, and the CDN in front of this caches the finished feed for an hour.
const SCHEDULE_CACHE_MS = 10 * 60 * 1000;

let cached = null;

// Production reads its own production schedule. A preview reads the schedule
// of its own build, so a change can be checked before it ships.
export function scheduleUrl(env = process.env) {
  const origin = env.VERCEL_ENV === 'production' || !env.VERCEL_URL
    ? SITE_URL
    : `https://${env.VERCEL_URL}`;
  return `${origin}${PINTEREST_BASE_PATH}/${PINTEREST_SCHEDULE_FILENAME}`;
}

export async function loadSchedule({ fetchImpl = fetch, now = Date.now(), env = process.env } = {}) {
  if (cached && now - cached.at < SCHEDULE_CACHE_MS) return cached.schedule;

  const response = await fetchImpl(scheduleUrl(env), {
    cache: 'no-store',
    signal: AbortSignal.timeout(SCHEDULE_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`schedule request returned ${response.status}`);

  const schedule = await response.json();
  const problems = scheduleProblems(schedule);
  if (problems.length) throw new Error(problems.join('; '));

  cached = { at: now, schedule };
  return schedule;
}

export function clearScheduleCache() {
  cached = null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed. Use GET.');
  }

  const filename = String(req.query?.feed || '');
  if (!/^[a-z-]+\.xml$/.test(filename)) return res.status(404).send('Not found');

  let schedule;
  try {
    schedule = await loadSchedule();
  } catch (error) {
    // Pinterest simply tries again on its next poll, so a short outage costs
    // nothing as long as it is not cached as if it were the feed.
    console.error(JSON.stringify({ level: 'error', route: '/api/pinterest-feed', message: error.message }));
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Retry-After', '3600');
    return res.status(503).send('Pinterest feed temporarily unavailable');
  }

  const feed = feedForFilename(schedule, filename);
  if (!feed) return res.status(404).send('Not found');

  const { xml } = renderFeedAt(feed, schedule.records, { now: new Date(), origin: SITE_URL });

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('X-Robots-Tag', 'noindex');
  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).send(xml);
}
