// RSS 2.0 writer for Pinterest auto-publishing.
//
// Pure functions over the records metadata.js produces: no file system and no
// site-data imports, so the output is trivial to test and identical whether it
// is produced at build time or, later, by a different distribution adapter.
//
// Pinterest reads the image from Media RSS (`media:content`), and most feed
// validators also expect `enclosure`. Both are emitted, pointing at the same
// PNG, alongside a `content:encoded` body so the feed reads sensibly in an
// ordinary feed reader too.

import { SITE_NAME, SITE_URL } from '../constants/site.js';
import { FEED_ITEM_LIMIT, PINTEREST_BASE_PATH } from './config.js';
import { releasedRecords } from './schedule.js';

const RSS_NAMESPACES = [
  'xmlns:content="http://purl.org/rss/1.0/modules/content/"',
  'xmlns:media="http://search.yahoo.com/mrss/"',
  'xmlns:atom="http://www.w3.org/2005/Atom"',
].join(' ');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Control characters that are not legal anywhere in an XML 1.0 document. One
// of them makes the whole feed unparseable, and Pinterest responds by quietly
// not publishing rather than by reporting an error.
const ILLEGAL_XML_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

/**
 * RFC 822 date, which is what RSS 2.0 requires. Built by hand rather than with
 * toUTCString() so the output cannot drift with the host locale or ICU data.
 */
export function rfc822(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = number => String(number).padStart(2, '0');
  return [
    `${DAYS[date.getUTCDay()]},`,
    pad(date.getUTCDate()),
    MONTHS[date.getUTCMonth()],
    date.getUTCFullYear(),
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`,
    'GMT',
  ].join(' ');
}

export function escapeXml(value) {
  return String(value ?? '')
    .replace(ILLEGAL_XML_CHARS, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(value) {
  // "]]>" cannot appear inside a CDATA section, so split it across two.
  const text = String(value ?? '').replace(ILLEGAL_XML_CHARS, '').replace(/]]>/g, ']]]]><![CDATA[>');
  return `<![CDATA[${text}]]>`;
}

function itemXml(record) {
  const parts = [
    `      <title>${escapeXml(record.title)}</title>`,
    `      <link>${escapeXml(record.link)}</link>`,
    `      <description>${escapeXml(record.description)}</description>`,
    `      <guid isPermaLink="false">${escapeXml(record.guid)}</guid>`,
  ];

  // The release date is when the Pin enters the feed, which is what "new" means
  // to Pinterest. The page's own dates are only a fallback.
  const pubDate = rfc822(record.releaseAt || record.published || record.modified || record.buildDate);
  if (pubDate) parts.push(`      <pubDate>${pubDate}</pubDate>`);

  if (record.image?.url) {
    parts.push(
      `      <media:content url="${escapeXml(record.image.url)}" medium="image" type="${escapeXml(record.image.type)}" width="${record.image.width}" height="${record.image.height}"/>`,
      `      <media:thumbnail url="${escapeXml(record.image.url)}" width="${record.image.width}" height="${record.image.height}"/>`,
    );
    // `length` is mandatory on an enclosure, so one is only emitted once the
    // generator has measured the rendered PNG.
    if (record.image.bytes) {
      parts.push(`      <enclosure url="${escapeXml(record.image.url)}" length="${record.image.bytes}" type="${escapeXml(record.image.type)}"/>`);
    }
    const body = `<p><a href="${escapeXml(record.link)}"><img src="${escapeXml(record.image.url)}" width="${record.image.width}" height="${record.image.height}" alt="${escapeXml(record.title)}"></a></p><p>${escapeXml(record.description)}</p>`;
    parts.push(`      <content:encoded>${cdata(body)}</content:encoded>`);
  }

  return `    <item>\n${parts.join('\n')}\n    </item>`;
}

/**
 * A complete RSS 2.0 document.
 *
 * @param {object} feed    - { key, feed, title, description }
 * @param {Array}  records - pin records from metadata.buildPinRecord
 * @param {object} options - { origin, basePath, buildDate }
 */
export function buildRssFeed(feed, records, {
  origin = SITE_URL,
  basePath = '/pinterest',
  buildDate = new Date(),
} = {}) {
  const selfUrl = `${origin}${basePath}/${feed.feed}`;
  const items = records.map(record => itemXml({ ...record, buildDate })).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" ${RSS_NAMESPACES}>
  <channel>
    <title>${escapeXml(feed.title)}</title>
    <link>${escapeXml(origin)}</link>
    <description>${escapeXml(feed.description)}</description>
    <language>en-gb</language>
    <copyright>${escapeXml(SITE_NAME)}</copyright>
    <generator>MealPrep.org.uk Pinterest feed builder</generator>
    <lastBuildDate>${rfc822(buildDate)}</lastBuildDate>
    <ttl>1440</ttl>
    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

/**
 * One feed as it stands at `now`: the board's released Pins, newest first.
 * This is what api/pinterest-feed.js serves, and it needs nothing but the
 * records, so it runs the same at build time, in tests and at request time.
 *
 * @param {object} feed    - a PINTEREST_BOARDS entry, or PINTEREST_MASTER_FEED
 * @param {Array}  records - every record, with releaseAt (and image bytes)
 */
export function renderFeedAt(feed, records, { now = new Date(), origin, limit = FEED_ITEM_LIMIT } = {}) {
  const forFeed = feed.board ? records.filter(record => record.boardKey === feed.key) : records;
  const released = releasedRecords(forFeed, now, feed.board ? limit : Infinity);
  // lastBuildDate is the newest release rather than the clock, so a feed that
  // has not changed does not claim that it has.
  const buildDate = released[0]?.releaseAt ? new Date(released[0].releaseAt) : new Date(now);
  const xml = buildRssFeed(feed, released, {
    basePath: PINTEREST_BASE_PATH,
    buildDate,
    ...(origin ? { origin } : {}),
  });
  return { board: feed, filename: feed.feed, records: released, xml };
}
