// The Pinterest pipeline, assembled.
//
//   site content -> eligibility -> metadata -> creative -> schedule -> distribution adapter
//
// Everything above the adapter is plain data. `buildPinterestPlan` returns the
// finished records (each with its release date) and creatives;
// `renderPinterestFeeds` is the RSS adapter, rendering the feeds as they stand
// at a given moment.
// A Pinterest API adapter would consume the same plan and would not need any
// of the selection or copy logic to change.

import { fileURLToPath } from 'node:url';
import {
  PIN_VARIANTS_PER_PAGE,
  PINTEREST_BASE_PATH,
  PINTEREST_BOARDS,
  PINTEREST_ENABLED,
  PINTEREST_MASTER_FEED,
} from './config.js';
import { buildPinterestEntries } from './eligibility.js';
import { buildPinRecord, pinImageFilename, pinRecordId } from './metadata.js';
import { buildPinSvg } from './creative.js';
import { renderFeedAt } from './feed.js';
import { assignReleaseDates } from './schedule.js';

// Food photos for the product Pins, checked in beside the fonts.
export const PINTEREST_PHOTO_DIR = fileURLToPath(new URL('../../assets/pinterest/photos/', import.meta.url));

export { PINTEREST_BASE_PATH, PINTEREST_BOARDS, PINTEREST_ENABLED, PINTEREST_MASTER_FEED, renderFeedAt };

/**
 * Everything the distribution layer needs, with no side effects.
 *
 * @returns {{
 *   entries: Array, records: Array, images: Array,
 *   rejected: Array, suppressed: Array,
 * }}
 */
export function buildPinterestPlan({ origin } = {}) {
  if (!PINTEREST_ENABLED) {
    return { entries: [], records: [], images: [], rejected: [], suppressed: [] };
  }

  const { published, rejected, suppressed } = buildPinterestEntries();
  // A product has one Pin per hand-written hook; every other page has
  // PIN_VARIANTS_PER_PAGE.
  const variantsFor = entry => Array.from(
    { length: entry.pins?.length || Math.max(1, PIN_VARIANTS_PER_PAGE) },
    (_, index) => index + 1,
  );

  // One record and one creative per Pin; the release queue decides when each
  // one goes out.
  const records = assignReleaseDates(
    published.flatMap(entry => variantsFor(entry).map(variant => buildPinRecord(entry, { variant, ...(origin ? { origin } : {}) }))),
    PINTEREST_BOARDS,
  );
  const images = published.flatMap(entry => variantsFor(entry).map(variant => ({
    id: pinRecordId(entry, { variant }),
    pageId: entry.id,
    variant,
    filename: pinImageFilename(entry, { variant }),
    ...buildPinSvg(entry, { variant, photoBase: PINTEREST_PHOTO_DIR }),
  })));

  return { entries: published, records, images, rejected, suppressed };
}

/**
 * Attach each creative's measured byte length to its record, so `enclosure`
 * can carry the `length` RSS requires.
 */
export function withImageBytes(records, imageBytes = new Map()) {
  return records.map(record => {
    const bytes = imageBytes.get(record.image.url.split('/').pop());
    return bytes ? { ...record, image: { ...record.image, bytes } } : record;
  });
}

/**
 * Every feed at `now`: one document per board, plus the diagnostic master
 * feed.
 *
 * @param {object} plan          - from buildPinterestPlan
 * @param {object} options
 * @param {Date}   options.now        - which moment of the queue to render
 * @param {Map}    options.imageBytes - filename -> byte length
 */
export function renderPinterestFeeds(plan, { origin, now = new Date(), imageBytes = new Map(), limit } = {}) {
  const records = withImageBytes(plan.records, imageBytes);
  return [...PINTEREST_BOARDS, PINTEREST_MASTER_FEED]
    .map(feed => renderFeedAt(feed, records, { now, origin, ...(limit ? { limit } : {}) }));
}
