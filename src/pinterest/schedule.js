// The release queue: when each Pin reaches Pinterest.
//
// Pinterest's RSS import makes a Pin only from an item it has not seen before,
// and it favours accounts that publish a few fresh Pins every day over ones
// that bulk-upload. So instead of putting every page in the feed at once, each
// Pin gets a release date and a feed shows only the Pins whose date has
// passed. api/pinterest-feed.js applies that filter at request time, which is
// what lets new Pins appear every day without a redeploy.
//
// Pure functions: no clock, no file system. `now` is always passed in, so the
// same inputs give the same queue on every build and in every test.

import {
  FEED_ITEM_LIMIT,
  PINS_PER_DAY,
  PINTEREST_DRIP_START,
  PINTEREST_LAUNCH_BATCH,
  PINTEREST_LAUNCH_DATE,
} from './config.js';

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

// Releases are spread across the UK day, 07:00 to 21:00 UTC, rather than all
// landing at midnight.
const FIRST_RELEASE_HOUR_UTC = 7;
const RELEASE_WINDOW_HOURS = 14;

function utcMidnight(isoDate) {
  const time = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(time)) throw new Error(`invalid schedule date: ${isoDate}`);
  return time;
}

// First Pins before second Pins, then best page first. Path breaks ties so the
// order never changes between builds.
function queueOrder(a, b) {
  return a.variant - b.variant
    || (b.score || 0) - (a.score || 0)
    || a.path.localeCompare(b.path);
}

// How many free-page Pins go out on a board between two product Pins. The
// PDF plans share the Aldi and Lidl boards with the free plans, so they are
// mixed in rather than posted back to back.
export const PAGES_BETWEEN_PRODUCTS = 2;

// A board's queue with its product Pins spaced out: one product, then
// PAGES_BETWEEN_PRODUCTS pages, and so on, until one kind runs out.
function interleaveProducts(queue) {
  const products = queue.filter(record => record.kind === 'product');
  const pages = queue.filter(record => record.kind !== 'product');
  const mixed = [];
  while (products.length || pages.length) {
    if (products.length) mixed.push(products.shift());
    mixed.push(...pages.splice(0, PAGES_BETWEEN_PRODUCTS));
  }
  return mixed;
}

/**
 * Give every record a `releaseAt` (ISO string).
 *
 * First Pins for pages in the launch batch keep the launch date: Pinterest has
 * already made Pins from them. Everything else joins a queue per board, and
 * the queue releases up to `perDay` Pins a day from `dripStart`, spread across
 * the day, taking the boards in turn, skipping any board that has run out and
 * never giving one board two Pins, or the site two product Pins, on one day.
 *
 * @param {Array} records - pin records from metadata.buildPinRecord
 * @param {Array} boards  - PINTEREST_BOARDS, in rotation order
 */
export function assignReleaseDates(records, boards, {
  launchDate = PINTEREST_LAUNCH_DATE,
  dripStart = PINTEREST_DRIP_START,
  perDay = PINS_PER_DAY,
  launchBatch = PINTEREST_LAUNCH_BATCH,
} = {}) {
  if (!(perDay >= 1)) throw new Error('PINS_PER_DAY must be at least 1');

  const launched = new Set(launchBatch);
  const launchAt = new Date(utcMidnight(launchDate) + 9 * HOUR_MS).toISOString();
  const releaseAt = new Map();

  const queues = boards.map(board => records
    .filter(record => record.boardKey === board.key)
    .filter(record => {
      if (record.variant === 1 && launched.has(record.path)) {
        releaseAt.set(record.id, launchAt);
        return false;
      }
      return true;
    })
    .sort(queueOrder))
    .map(interleaveProducts);

  // Never more than one new Pin per board per day, so no board ever gets a
  // burst: once only a few boards have Pins left, a day releases fewer than
  // `perDay` rather than doubling up on one board.
  const start = utcMidnight(dripStart);
  let pointer = 0;
  let day = 0;
  let slot = 0;
  let usedToday = new Set();
  let productToday = false;

  // A product Pin also waits for the next day if one already went out today,
  // so the PDF adverts stay spread out across both boards.
  const canRelease = index => queues[index].length
    && !usedToday.has(index)
    && !(productToday && queues[index][0].kind === 'product');

  while (queues.some(queue => queue.length)) {
    let chosen = -1;
    for (let step = 0; step < queues.length; step += 1) {
      const index = (pointer + step) % queues.length;
      if (canRelease(index)) {
        chosen = index;
        break;
      }
    }
    if (chosen === -1 || slot >= perDay) {
      day += 1;
      slot = 0;
      usedToday = new Set();
      productToday = false;
      continue;
    }

    const record = queues[chosen].shift();
    pointer = (chosen + 1) % queues.length;
    usedToday.add(chosen);
    if (record.kind === 'product') productToday = true;

    const hour = FIRST_RELEASE_HOUR_UTC + Math.floor((slot * RELEASE_WINDOW_HOURS) / perDay);
    releaseAt.set(record.id, new Date(start + day * DAY_MS + hour * HOUR_MS).toISOString());
    slot += 1;
  }

  return records.map(record => ({ ...record, releaseAt: releaseAt.get(record.id) || launchAt }));
}

/**
 * The records a feed should show at `now`: released ones only, newest first,
 * at most `limit` of them.
 */
export function releasedRecords(records, now = new Date(), limit = FEED_ITEM_LIMIT) {
  const cutoff = now instanceof Date ? now.getTime() : Date.parse(now);
  return records
    .filter(record => Date.parse(record.releaseAt) <= cutoff)
    .sort((a, b) => Date.parse(b.releaseAt) - Date.parse(a.releaseAt) || a.id.localeCompare(b.id))
    .slice(0, limit);
}

/**
 * How far through the queue we are at `now`, for the build log.
 */
export function queueStatus(records, now = new Date()) {
  const cutoff = now instanceof Date ? now.getTime() : Date.parse(now);
  const times = records.map(record => Date.parse(record.releaseAt));
  const pending = times.filter(time => time > cutoff);
  const lastRelease = times.length ? Math.max(...times) : cutoff;
  return {
    total: records.length,
    released: times.length - pending.length,
    pending: pending.length,
    lastReleaseAt: new Date(lastRelease).toISOString(),
    daysLeft: Math.max(0, Math.ceil((lastRelease - cutoff) / DAY_MS)),
  };
}
