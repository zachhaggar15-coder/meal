// The Pinterest pipeline, assembled.
//
//   site content -> eligibility -> metadata -> creative -> distribution adapter
//
// Everything above the adapter is plain data. `buildPinterestPlan` returns the
// finished records and creatives; `renderPinterestFeeds` is the RSS adapter.
// A Pinterest API adapter would consume the same plan and would not need any
// of the selection or copy logic to change.

import {
  PINTEREST_BASE_PATH,
  PINTEREST_BOARDS,
  PINTEREST_ENABLED,
  PINTEREST_MASTER_FEED,
} from './config.js';
import { buildPinterestEntries } from './eligibility.js';
import { buildPinRecord, pinImageFilename } from './metadata.js';
import { buildPinSvg } from './creative.js';
import { buildRssFeed } from './feed.js';

export { PINTEREST_BASE_PATH, PINTEREST_BOARDS, PINTEREST_ENABLED, PINTEREST_MASTER_FEED };

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
  const records = published.map(entry => buildPinRecord(entry, origin ? { origin } : {}));
  const images = published.map(entry => ({
    id: entry.id,
    filename: pinImageFilename(entry),
    ...buildPinSvg(entry),
  }));

  return { entries: published, records, images, rejected, suppressed };
}

/**
 * The RSS distribution adapter: one document per board, plus the diagnostic
 * master feed.
 *
 * @param {object} plan          - from buildPinterestPlan
 * @param {object} options
 * @param {Map}    options.imageBytes - filename -> byte length, so `enclosure`
 *                                      can carry the required `length`.
 */
export function renderPinterestFeeds(plan, { origin, buildDate = new Date(), imageBytes = new Map() } = {}) {
  const withBytes = record => {
    const bytes = imageBytes.get(record.image.url.split('/').pop());
    return bytes ? { ...record, image: { ...record.image, bytes } } : record;
  };

  const feedOptions = { basePath: PINTEREST_BASE_PATH, buildDate, ...(origin ? { origin } : {}) };
  const documents = PINTEREST_BOARDS.map(board => {
    const records = plan.records.filter(record => record.boardKey === board.key).map(withBytes);
    return { board, filename: board.feed, records, xml: buildRssFeed(board, records, feedOptions) };
  });

  const allRecords = plan.records.map(withBytes);
  documents.push({
    board: PINTEREST_MASTER_FEED,
    filename: PINTEREST_MASTER_FEED.feed,
    records: allRecords,
    xml: buildRssFeed(PINTEREST_MASTER_FEED, allRecords, feedOptions),
  });

  return documents;
}
