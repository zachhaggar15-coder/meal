// Writes the Pinterest release schedule and creatives into dist/ after the
// prerender.
//
// The creatives and dist/pinterest/schedule.json are static files on the CDN.
// The feeds themselves are served by api/pinterest-feed.js, which reads the
// schedule and shows only the Pins whose release date has passed - that is
// what lets new Pins reach Pinterest every day without a redeploy. Run as part
// of `npm run build`, immediately after prerender.js so the destination pages
// it validates against actually exist.
//
//   node scripts/generate-pinterest-assets.js            write into dist/
//   node scripts/generate-pinterest-assets.js --dry-run  validate, write nothing
//   node scripts/generate-pinterest-assets.js --report   also print the
//                                                        eligibility decisions

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import jpeg from 'jpeg-js';
import { SITE_URL } from '../src/constants/site.js';
import {
  FEED_ITEM_LIMIT,
  PINTEREST_BASE_PATH,
  PINTEREST_BOARDS,
  PINTEREST_ENABLED,
  PINTEREST_MASTER_FEED,
  PIN_IMAGE_HEIGHT,
  PIN_IMAGE_WIDTH,
  QUEUE_WARNING_DAYS,
} from '../src/pinterest/config.js';
import { buildPinterestPlan, renderPinterestFeeds, withImageBytes } from '../src/pinterest/index.js';
import { PINTEREST_SCHEDULE_FILENAME, PINTEREST_SCHEDULE_VERSION, scheduleDocument } from '../src/pinterest/scheduleFile.js';
import { queueStatus } from '../src/pinterest/schedule.js';
import { PDF_SHOP_PATH, isRealCheckoutUrl } from '../src/pinterest/products.js';
import { parseXml, childrenNamed, childText } from './lib/xmlLite.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const report = args.has('--report');

// The creatives are drawn with the site's own typeface. The files are checked
// in (assets/fonts) and system fonts are switched off, so a build machine
// without DM Sans installed - every CI runner - renders exactly what a local
// build renders.
const FONT_FILES = [
  path.join(root, 'assets/fonts/DMSans-Regular.ttf'),
  path.join(root, 'assets/fonts/DMSans-Bold.ttf'),
];

function fail(messages) {
  console.error('\ngenerate-pinterest-assets FAILED\n');
  for (const message of messages) console.error(`  - ${message}`);
  console.error('');
  process.exit(1);
}

// Photo Pins (.jpg) are encoded as JPEG from the rendered pixels; everything
// else stays PNG. See pinImageType in src/pinterest/metadata.js.
const JPEG_QUALITY = 84;

function renderImage(image) {
  if (!image.filename.endsWith('.jpg')) return renderPng(image.svg);
  const rendered = renderRaster(image.svg);
  return jpeg.encode({ data: rendered.pixels, width: rendered.width, height: rendered.height }, JPEG_QUALITY).data;
}

function renderPng(svg) {
  return renderRaster(svg).asPng();
}

function renderRaster(svg) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: PIN_IMAGE_WIDTH },
    font: { loadSystemFonts: false, fontFiles: FONT_FILES, defaultFontFamily: 'DM Sans' },
  });
  const rendered = resvg.render();
  if (rendered.width !== PIN_IMAGE_WIDTH || rendered.height !== PIN_IMAGE_HEIGHT) {
    throw new Error(`creative rendered at ${rendered.width}x${rendered.height}, expected ${PIN_IMAGE_WIDTH}x${PIN_IMAGE_HEIGHT}`);
  }
  return rendered;
}

// ── Validation ───────────────────────────────────────────────────────────────

/**
 * Why a page can no longer be Pinned, or '' if it still can.
 *
 * Content moves: slugs get retired (see src/data/retiredPlanRedirects.js),
 * pages get renamed, an article gets set to noindex. None of that is a defect
 * in this system, and none of it should stop an unrelated release shipping -
 * so an entry that no longer resolves is dropped from the feed with a warning
 * rather than failing the build. Pins already published are unaffected;
 * Pinterest simply stops seeing the entry.
 *
 * Defects in our own output - malformed XML, duplicate GUIDs, broken UTMs, a
 * wrongly sized image - still fail hard in validateFeeds. Those are never
 * acceptable and are always ours to fix.
 */
function unresolvableReason(record) {
  const url = new URL(record.link);
  const page = path.join(dist, url.pathname.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(page)) return `no page at ${url.pathname} in this build`;

  const html = fs.readFileSync(page, 'utf8');
  const robots = /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i.exec(html)?.[1] || '';
  if (/noindex/i.test(robots)) return `${url.pathname} is now noindex`;

  const canonical = /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i.exec(html)?.[1] || '';
  if (canonical && canonical !== record.canonical) return `${url.pathname} now canonicalises to ${canonical}`;

  // Never advertise something nobody can buy. A product page without a live
  // checkout link shows an "Available soon" button (ShopProductPage.jsx), and
  // the shop page shows "Available soon" instead of a price on every tile.
  if (record.kind === 'product') {
    if (/class="[^"]*\bshop-available-soon"/.test(html)) return `${url.pathname} is not on sale yet (its page says "Available soon")`;
    if (url.pathname === PDF_SHOP_PATH) {
      if (!/shop-tile-status">£/.test(html)) return `${url.pathname} has nothing on sale yet`;
    } else {
      // The buy button must be a real Lemon Squeezy checkout, not a
      // placeholder or a mistyped env var.
      const button = /<a\b[^>]*data-event="pdf_checkout_click"[^>]*>/.exec(html)?.[0] || '';
      const href = /\bhref="([^"]*)"/.exec(button)?.[1] || '';
      if (!isRealCheckoutUrl(href)) return `${url.pathname} has no real Lemon Squeezy checkout link (found "${href || 'none'}")`;
    }
  }

  return '';
}

/**
 * Drop entries whose destination no longer resolves, returning the trimmed
 * plan and a warning per dropped page.
 */
function dropUnresolvableEntries(plan) {
  const dropped = [];
  const keptPages = new Set();

  // Every Pin for a page shares its destination, so each page is checked once,
  // through its first Pin.
  for (const record of plan.records.filter(item => item.variant === 1)) {
    const reason = unresolvableReason(record);
    if (reason) dropped.push(`dropped ${record.pageId}: ${reason}`);
    else keptPages.add(record.pageId);
  }

  if (!dropped.length) return { plan, dropped };

  return {
    plan: {
      ...plan,
      entries: plan.entries.filter(entry => keptPages.has(entry.id)),
      records: plan.records.filter(record => keptPages.has(record.pageId)),
      images: plan.images.filter(image => keptPages.has(image.pageId)),
    },
    dropped,
  };
}

function validateFeeds(documents, { requirePages, warnings = [] }) {
  const errors = [];
  const guidsAcrossBoards = new Map();

  for (const document of documents) {
    let channel;
    try {
      const rss = parseXml(document.xml);
      if (rss.name !== 'rss') throw new Error(`root element is <${rss.name}>, expected <rss>`);
      if (rss.attributes.version !== '2.0') throw new Error('rss version is not 2.0');
      [channel] = childrenNamed(rss, 'channel');
      if (!channel) throw new Error('no <channel>');
    } catch (error) {
      errors.push(`${document.filename}: ${error.message}`);
      continue;
    }

    const items = childrenNamed(channel, 'item');
    if (!items.length && document.board.board) {
      // A board can legitimately empty out if every page it held was retired
      // between deploys. Pinterest simply publishes nothing from it, which is
      // not worth blocking an unrelated release over.
      warnings.push(`${document.filename}: board feed has no items`);
    }

    const guidsInFeed = new Set();
    for (const item of items) {
      const guid = childText(item, 'guid');
      const link = childText(item, 'link');
      const title = childText(item, 'title');
      const where = `${document.filename} -> ${guid || title || '(no guid)'}`;

      if (!guid) errors.push(`${where}: missing guid`);
      if (guidsInFeed.has(guid)) errors.push(`${where}: duplicate guid within the feed`);
      guidsInFeed.add(guid);

      // The same page may not appear on two boards: Pinterest would publish it
      // twice. The feeds are built as a partition, so this is the assertion
      // that the partition really is one.
      if (document.board.board) {
        const seenIn = guidsAcrossBoards.get(guid);
        if (seenIn) errors.push(`${where}: also published on ${seenIn}`);
        else guidsAcrossBoards.set(guid, document.filename);
      }

      if (!title) errors.push(`${where}: missing title`);
      if (!childText(item, 'description')) errors.push(`${where}: missing description`);

      for (const [label, value] of [['link', link], ['guid', guid]]) {
        if (!value) continue;
        if (!value.startsWith(`${SITE_URL}/`)) errors.push(`${where}: ${label} is not on ${SITE_URL} (${value})`);
        if (/localhost|127\.0\.0\.1|\.vercel\.app/.test(value)) errors.push(`${where}: ${label} points at a non-production host`);
      }

      const url = link ? new URL(link) : null;
      if (url) {
        if (url.searchParams.get('utm_source') !== 'pinterest') errors.push(`${where}: link is missing utm_source=pinterest`);
        if (url.searchParams.get('utm_medium') !== 'organic') errors.push(`${where}: link is missing utm_medium=organic`);
        if (!url.searchParams.get('utm_campaign')) errors.push(`${where}: link is missing utm_campaign`);
        // A first Pin's GUID is the clean canonical URL. A later Pin for the
        // same page adds #pin-N, and its link says pin-N in utm_content.
        const [base, fragment] = String(guid).split('#');
        if (base !== `${url.origin}${url.pathname}`) errors.push(`${where}: guid is not the clean canonical URL`);
        if (fragment && !/^pin-\d+$/.test(fragment)) errors.push(`${where}: guid fragment is not #pin-N`);
        if ((url.searchParams.get('utm_content') || '') !== (fragment || '')) errors.push(`${where}: utm_content does not match the guid`);
      }

      const [media] = childrenNamed(item, 'media:content');
      if (!media) {
        errors.push(`${where}: no media:content image`);
      } else {
        if (Number(media.attributes.width) !== PIN_IMAGE_WIDTH || Number(media.attributes.height) !== PIN_IMAGE_HEIGHT) {
          errors.push(`${where}: image is not ${PIN_IMAGE_WIDTH}x${PIN_IMAGE_HEIGHT}`);
        }
        const file = path.join(dist, media.attributes.url.replace(SITE_URL, ''));
        if (!dryRun && !fs.existsSync(file)) errors.push(`${where}: image file is missing (${file})`);
      }

      // Destinations are resolved before the feeds are built - see
      // unresolvableEntries - so anything left here is a bug in this script
      // rather than a retired page, and should fail.
      if (requirePages && url) {
        const page = path.join(dist, url.pathname.replace(/^\//, ''), 'index.html');
        if (!fs.existsSync(page)) errors.push(`${where}: destination page is not in dist (${url.pathname})`);
      }
    }
  }

  return errors;
}

// ── Main ─────────────────────────────────────────────────────────────────────

if (!PINTEREST_ENABLED) {
  console.log('Pinterest publishing is disabled (PINTEREST_ENABLED=false in src/pinterest/config.js). Nothing written.');
  process.exit(0);
}

const requirePages = !dryRun;
if (requirePages && !fs.existsSync(dist)) {
  fail(['dist/ not found - run the build (and prerender) first, or pass --dry-run']);
}

const rawPlan = buildPinterestPlan();
if (!rawPlan.entries.length) fail(['no pages are eligible for Pinterest - check src/pinterest/config.js']);

// Retired, renamed or newly-noindexed destinations leave the feed quietly; see
// unresolvableReason. Skipped on --dry-run, which has no dist/ to check.
const warnings = [];
const { plan, dropped } = requirePages ? dropUnresolvableEntries(rawPlan) : { plan: rawPlan, dropped: [] };
warnings.push(...dropped);

// Everything vanishing at once is not content churn, it is a broken build.
if (!plan.entries.length) {
  fail(['every eligible page failed to resolve in dist/ - the build output looks wrong', ...dropped]);
}

const imageBytes = new Map();
const renderErrors = [];
for (const image of plan.images) {
  try {
    const file = renderImage(image);
    imageBytes.set(image.filename, file.length);
    image.file = file;
  } catch (error) {
    renderErrors.push(`${image.filename}: ${error.message}`);
  }
}
if (renderErrors.length) fail(renderErrors);

// Validate every Pin the schedule will ever release, not just today's: render
// each feed as it will look once the whole queue has gone out.
const endOfQueue = new Date(8.64e15);
const allDocuments = renderPinterestFeeds(plan, { imageBytes, now: endOfQueue, limit: Infinity });
const now = new Date();
const documents = renderPinterestFeeds(plan, { imageBytes, now });

const schedule = scheduleDocument({
  records: withImageBytes(plan.records, imageBytes),
  feeds: [...PINTEREST_BOARDS, PINTEREST_MASTER_FEED],
  generatedAt: now,
});

if (!dryRun) {
  const feedDir = path.join(dist, PINTEREST_BASE_PATH.replace(/^\//, ''));
  const imageDir = path.join(feedDir, 'img');
  fs.mkdirSync(imageDir, { recursive: true });
  for (const image of plan.images) fs.writeFileSync(path.join(imageDir, image.filename), image.file);
  // No .xml is written: a static file at /pinterest/<board>.xml would shadow
  // the rewrite to api/pinterest-feed.js and freeze the feed at build time,
  // which is exactly the failure this schedule exists to fix.
  fs.writeFileSync(path.join(feedDir, PINTEREST_SCHEDULE_FILENAME), `${JSON.stringify(schedule)}\n`);
}

const errors = validateFeeds(allDocuments, { requirePages, warnings });
for (const document of documents) {
  try {
    parseXml(document.xml);
  } catch (error) {
    errors.push(`${document.filename} as served today: ${error.message}`);
  }
}
if (errors.length) fail(errors);

const status = queueStatus(plan.records, now);
if (status.daysLeft < QUEUE_WARNING_DAYS) {
  warnings.push(
    status.pending
      ? `only ${status.daysLeft} day(s) of new Pins left in the queue (last on ${status.lastReleaseAt.slice(0, 10)}) - add pages or raise the limits in src/pinterest/config.js`
      : 'the release queue is empty, so Pinterest is getting no new Pins - add pages or raise the limits in src/pinterest/config.js',
  );
}

for (const warning of warnings) console.warn(`  ! Pinterest: ${warning}`);

const totalBytes = [...imageBytes.values()].reduce((sum, bytes) => sum + bytes, 0);
console.log(
  `\nPinterest: ${plan.entries.length} page(s), ${plan.records.length} Pin(s) across ${documents.length - 1} board feed(s) + the master feed.`,
);
console.log(`  ${status.released} released, ${status.pending} queued; the queue runs until ${status.lastReleaseAt.slice(0, 10)} (${status.daysLeft} day(s))`);
console.log(`  Feeds as served now (newest ${FEED_ITEM_LIMIT} per board, by api/pinterest-feed.js):`);
for (const document of documents) {
  console.log(`  ${PINTEREST_BASE_PATH}/${document.filename.padEnd(20)} ${String(document.records.length).padStart(3)} item(s)${document.board.board ? ` -> "${document.board.board}"` : ' (diagnostic)'}`);
}
console.log(`  ${plan.images.length} creative(s) at ${PIN_IMAGE_WIDTH}x${PIN_IMAGE_HEIGHT}, ${(totalBytes / 1024 / 1024).toFixed(2)} MB total`);
console.log(`  schedule: ${PINTEREST_BASE_PATH}/${PINTEREST_SCHEDULE_FILENAME} (v${PINTEREST_SCHEDULE_VERSION})`);
console.log(`  ${plan.rejected.length} page(s) ineligible, ${plan.suppressed.length} held back by the duplicate and size caps\n`);

if (report) {
  console.log('Published:');
  for (const entry of plan.entries) {
    console.log(`  ${String(entry.score).padStart(3)}  ${entry.board.key.padEnd(14)} ${entry.path}`);
  }
  console.log('\nNext 14 days of the queue:');
  const horizon = now.getTime() + 14 * 86_400_000;
  const upcoming = plan.records
    .filter(record => Date.parse(record.releaseAt) > now.getTime() && Date.parse(record.releaseAt) <= horizon)
    .sort((a, b) => a.releaseAt.localeCompare(b.releaseAt));
  for (const record of upcoming) {
    console.log(`  ${record.releaseAt.slice(0, 16).replace('T', ' ')}  ${record.boardKey.padEnd(14)} pin ${record.variant}  ${record.path}`);
  }
  console.log('\nHeld back:');
  for (const item of plan.suppressed) console.log(`  ${item.path} - ${item.reasons.join('; ')}`);
}
