// Contract tests for the Pinterest distribution system.
//
// The feeds are published to a third party that gives no feedback when it
// stops working: a malformed date, an unescaped ampersand or a duplicate GUID
// simply stops Pins appearing. These tests are the only place that failure
// surfaces before it costs a month of distribution.

import test from 'node:test';
import assert from 'node:assert/strict';

import { SITE_URL } from '../src/constants/site.js';
import fs from 'node:fs';

import {
  FEED_ITEM_LIMIT,
  MIN_ELIGIBILITY_SCORE,
  PIN_VARIANTS_PER_PAGE,
  PINS_PER_DAY,
  PINTEREST_BOARDS,
  PINTEREST_DRIP_START,
  PINTEREST_LAUNCH_BATCH,
  PINTEREST_MASTER_FEED,
  PINTEREST_PRODUCT_ENTRIES,
  PIN_IMAGE_HEIGHT,
  PIN_IMAGE_WIDTH,
  TOTAL_ENTRY_LIMIT,
} from '../src/pinterest/config.js';
import {
  buildPinterestEntries,
  duplicateSignature,
  isExcludedPath,
} from '../src/pinterest/eligibility.js';
import {
  buildPinRecord,
  pinCampaign,
  pinDescription,
  pinDestinationUrl,
  pinImageUrl,
  pinTitle,
} from '../src/pinterest/metadata.js';
import { buildPinSvg, photoFor, PHOTOS, templateFor, TEMPLATES } from '../src/pinterest/creative.js';
import { buildRssFeed, escapeXml, renderFeedAt, rfc822 } from '../src/pinterest/feed.js';
import { buildPinterestPlan, renderPinterestFeeds, withImageBytes } from '../src/pinterest/index.js';
import { assignReleaseDates, queueStatus, releasedRecords } from '../src/pinterest/schedule.js';
import { feedForFilename, scheduleDocument, scheduleProblems } from '../src/pinterest/scheduleFile.js';
import { MEAL_PREP_PDF_PRODUCTS } from '../src/data/mealPrepPdfProducts.js';
import { PDF_SHOP_PATH, formatPrice, isRealCheckoutUrl } from '../src/pinterest/products.js';
import { PINTEREST_PHOTO_DIR } from '../src/pinterest/index.js';
import pinterestFeedHandler, { clearScheduleCache, scheduleUrl } from '../api/pinterest-feed.js';
import { parseXml, childrenNamed, childText, XmlError } from './lib/xmlLite.js';

const plan = buildPinterestPlan();
// Every feed as it will look once the whole queue has gone out, so the tests
// below see every Pin the schedule will ever publish.
const END_OF_QUEUE = new Date(8.64e15);
const documents = renderPinterestFeeds(plan, { now: END_OF_QUEUE, limit: Infinity });
const boardDocuments = documents.filter(document => document.board.board);
const { published, rejected } = buildPinterestEntries();

function channelOf(xml) {
  const rss = parseXml(xml);
  assert.equal(rss.name, 'rss');
  assert.equal(rss.attributes.version, '2.0');
  const [channel] = childrenNamed(rss, 'channel');
  assert.ok(channel, 'feed has a <channel>');
  return channel;
}

// ── 1. Valid RSS XML ─────────────────────────────────────────────────────────

test('every feed is well-formed RSS 2.0 with the namespaces Pinterest reads', () => {
  for (const document of documents) {
    const rss = parseXml(document.xml);
    assert.equal(rss.attributes['xmlns:media'], 'http://search.yahoo.com/mrss/', `${document.filename} declares Media RSS`);
    assert.equal(rss.attributes['xmlns:content'], 'http://purl.org/rss/1.0/modules/content/');
    const channel = channelOf(document.xml);
    assert.ok(childText(channel, 'title'), `${document.filename} has a channel title`);
    assert.ok(childText(channel, 'description'), `${document.filename} has a channel description`);
    assert.equal(childText(channel, 'language'), 'en-gb');
    const [self] = childrenNamed(channel, 'atom:link');
    assert.equal(self.attributes.href, `${SITE_URL}/pinterest/${document.filename}`, 'atom:link self URL is stable');
  }
});

test('the parser the other tests rely on really does reject bad XML', () => {
  assert.throws(() => parseXml('<a><b></a>'), XmlError);
  assert.throws(() => parseXml('<a>Tesco & Aldi</a>'), XmlError);
  assert.throws(() => parseXml('<a href=x>1</a>'), XmlError);
  assert.doesNotThrow(() => parseXml('<a>Tesco &amp; Aldi</a>'));
});

test('publication dates are RFC 822, the only format RSS 2.0 allows', () => {
  assert.equal(rfc822('2026-06-17'), 'Wed, 17 Jun 2026 00:00:00 GMT');
  assert.equal(rfc822(new Date('2026-01-02T03:04:05Z')), 'Fri, 02 Jan 2026 03:04:05 GMT');
  assert.equal(rfc822('not a date'), '');

  for (const document of documents) {
    const channel = channelOf(document.xml);
    assert.match(childText(channel, 'lastBuildDate'), /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/);
    for (const item of childrenNamed(channel, 'item')) {
      const pubDate = childText(item, 'pubDate');
      if (pubDate) assert.match(pubDate, /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/);
    }
  }
});

// ── 2. Escaping ──────────────────────────────────────────────────────────────

test('special characters are escaped rather than emitted raw', () => {
  assert.equal(escapeXml(`Tesco & Sainsbury's <b> "x"`), 'Tesco &amp; Sainsbury&apos;s &lt;b&gt; &quot;x&quot;');
  // Control characters are illegal anywhere in XML 1.0 and are dropped, not escaped.
  assert.equal(escapeXml(`a${String.fromCharCode(7)}b`), 'ab');
});

test('a hostile entry still produces a parseable feed', () => {
  const record = buildPinRecord({
    id: 'hub:test',
    kind: 'hub',
    path: '/meal-plans/test',
    title: `Sainsbury's & "Tesco" <script>alert(1)</script>`,
    description: 'A description with & and < and ]]> inside it, long enough to be realistic copy for a Pin.',
    proposition: 'A proposition with & and < and ]]> inside it, long enough to be realistic copy for a Pin.',
    benefits: ['Ampersand & more'],
    supermarkets: ['tesco'],
    supermarketLabel: 'Tesco',
    clusters: [],
    calorieTarget: 1500,
    board: PINTEREST_BOARDS[0],
    score: 99,
  });
  const xml = buildRssFeed(PINTEREST_BOARDS[0], [record], { buildDate: new Date('2026-09-15T09:00:00Z') });
  const channel = channelOf(xml);
  const [item] = childrenNamed(channel, 'item');

  assert.ok(!/<script>/.test(xml), 'markup in source data is not emitted as markup');
  assert.match(childText(item, 'title'), /Sainsbury's & "Tesco"/, 'entities round-trip back to the original text');
  assert.ok(childText(item, 'description').includes(']]>'), 'CDATA-terminating sequences survive intact');
});

// ── 3 & 4. Eligible in, ineligible out ───────────────────────────────────────

test('the feed carries a useful number of strong pages', () => {
  assert.ok(published.length >= 30, `expected at least 30 published pages, got ${published.length}`);
  assert.ok(published.length <= TOTAL_ENTRY_LIMIT, `expected at most ${TOTAL_ENTRY_LIMIT}, got ${published.length}`);
  for (const entry of published) {
    assert.ok(entry.score >= MIN_ELIGIBILITY_SCORE, `${entry.path} scored ${entry.score}`);
    assert.ok(entry.board, `${entry.path} is assigned to a board`);
  }
});

test('utility, account, legal and noindex routes can never be published', () => {
  for (const route of [
    '/quiz', '/quiz/results', '/saved-plans', '/admin', '/feedback', '/privacy',
    '/terms', '/about', '/contact', '/404', '/mealprep-plus', '/browse',
    '/browse/page/2', '/tools', '/choose-plan/weight-loss', '/choose-calories/1500',
  ]) {
    assert.ok(isExcludedPath(route), `${route} is excluded`);
  }
  assert.ok(!isExcludedPath('/meal-plans/aldi'));
  assert.ok(!isExcludedPath('/blog/high-protein-snacks-uk'));

  for (const entry of published) {
    assert.ok(!isExcludedPath(entry.path), `${entry.path} is not an excluded route`);
  }
});

test('thin pages are rejected with a stated reason', () => {
  assert.ok(rejected.length > 0, 'the gates actually reject something');
  for (const item of rejected) {
    assert.ok(item.reasons.length, `${item.path} has a rejection reason`);
  }
});

test('programmatic /plans/ routes stay out of the initial rollout', () => {
  for (const entry of published) {
    assert.ok(!entry.path.startsWith('/plans/'), `${entry.path} is a programmatic plan page`);
  }
});

// ── 5 & 6. Destination URLs and UTM parameters ───────────────────────────────

test('every link is the canonical production URL with the agreed UTMs', () => {
  for (const document of documents) {
    for (const item of childrenNamed(channelOf(document.xml), 'item')) {
      const link = new URL(childText(item, 'link'));
      assert.equal(link.origin, SITE_URL, `${link} is on the production origin`);
      assert.equal(link.searchParams.get('utm_source'), 'pinterest');
      assert.equal(link.searchParams.get('utm_medium'), 'organic');
      assert.ok(link.searchParams.get('utm_campaign'), 'campaign is set');
      assert.ok(!/localhost|127\.0\.0\.1|vercel\.app/.test(link.href), 'no preview or local host leaks into a Pin');
    }
  }
});

test('the campaign is the board key, so GA4 splits Pinterest traffic by board', () => {
  for (const document of boardDocuments) {
    for (const item of childrenNamed(channelOf(document.xml), 'item')) {
      const link = new URL(childText(item, 'link'));
      assert.equal(link.searchParams.get('utm_campaign'), document.board.key);
    }
  }
  assert.equal(pinCampaign({ board: { key: 'aldi' } }), 'aldi');
  assert.equal(pinCampaign({}), 'unassigned');
});

test('UTMs overwrite rather than duplicate any query the source already carries', () => {
  const entry = { path: '/meal-plans/aldi?ref=nav&utm_source=facebook', board: { key: 'aldi' } };
  const link = new URL(pinDestinationUrl(entry));
  assert.equal(link.pathname, '/meal-plans/aldi');
  assert.equal(link.searchParams.get('ref'), 'nav', 'an unrelated parameter is preserved');
  assert.equal(link.searchParams.getAll('utm_source').length, 1);
  assert.equal(link.searchParams.get('utm_source'), 'pinterest');
});

test('the GUID is the clean canonical URL, so attribution changes cannot re-Pin a page', () => {
  for (const document of documents) {
    for (const item of childrenNamed(channelOf(document.xml), 'item')) {
      const guid = childText(item, 'guid');
      const link = new URL(childText(item, 'link'));
      const [base, fragment] = guid.split('#');
      assert.equal(base, `${link.origin}${link.pathname}`);
      assert.ok(!guid.includes('utm_'), 'the GUID carries no tracking parameters');
      // A later Pin for the same page is #pin-N, and says so in utm_content.
      assert.equal(link.searchParams.get('utm_content') || undefined, fragment);
      if (fragment) assert.match(fragment, /^pin-\d+$/);
    }
  }
});

test('a page’s first Pin keeps exactly the GUID and link it launched with', () => {
  for (const record of plan.records.filter(item => item.variant === 1)) {
    assert.equal(record.guid, record.canonical);
    assert.ok(!new URL(record.link).searchParams.has('utm_content'), `${record.id} gained a utm_content`);
  }
});

// ── 7. Images ────────────────────────────────────────────────────────────────

test('every item advertises a 2:3 Pinterest image on the production domain', () => {
  for (const document of documents) {
    for (const item of childrenNamed(channelOf(document.xml), 'item')) {
      const [media] = childrenNamed(item, 'media:content');
      assert.ok(media, 'item carries media:content');
      assert.equal(Number(media.attributes.width), PIN_IMAGE_WIDTH);
      assert.equal(Number(media.attributes.height), PIN_IMAGE_HEIGHT);
      // Photo Pins are JPEG, text Pins PNG; Pinterest cannot use SVG.
      const expected = media.attributes.url.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
      assert.equal(media.attributes.type, expected);
      assert.ok(media.attributes.url.startsWith(`${SITE_URL}/pinterest/img/`), 'image is served from the public asset path');
      assert.match(media.attributes.url, /\.(png|jpg)$/);
    }
  }
});

test('image URLs are stable and unique per Pin', () => {
  const urls = plan.records.map(record => record.image.url);
  assert.equal(new Set(urls).size, urls.length, 'no two Pins share a creative');
  assert.equal(plan.images.length, plan.records.length, 'every Pin has its own creative');
  const entry = plan.entries[0];
  assert.equal(pinImageUrl(entry), pinImageUrl({ ...entry, score: 0, board: null }), 'the URL does not depend on ranking');
});

test('templates are chosen from the page’s own data, and a second Pin looks different', () => {
  assert.deepEqual(TEMPLATES, ['photo', 'checklist', 'product']);
  assert.equal(templateFor({ supermarketLabel: 'Aldi', calorieTarget: 1500 }), 'photo');
  assert.equal(templateFor({ supermarketLabel: 'Aldi', calorieTarget: 1500 }, { variant: 2 }), 'checklist');
  assert.equal(templateFor({ pins: [{}] }, { variant: 2 }), 'product');

  const used = new Set(plan.images.map(image => image.template));
  assert.ok(used.size >= 3, 'the library exercises several templates');
  const productPages = new Set(plan.entries.filter(entry => entry.kind === 'product').map(entry => entry.id));
  for (const image of plan.images) {
    if (productPages.has(image.pageId)) {
      assert.equal(image.template, 'product', `${image.id} is a product without the photo design`);
      continue;
    }
    assert.equal(image.template, image.variant > 1 ? 'checklist' : 'photo', `${image.id} uses the wrong design for its Pin`);
  }
});

test('first Pins are photo-led, with a photo that fits the page', () => {
  assert.equal(photoFor({ id: 'a', path: '/blog/vegan-meal-prep-uk' }), 'plant-based');
  assert.equal(photoFor({ id: 'a', path: '/blog/cold-lunch-ideas-for-work-uk' }), 'work-lunch');
  assert.ok(['muscle-gain', 'high-protein'].includes(photoFor({ id: 'a', path: '/meal-plans/high-protein' })));
  assert.ok(['low-calorie', 'weekly-prep'].includes(photoFor({ id: 'a', path: '/meal-plans/1500-calorie' })));
  assert.ok(['budget-shop', 'batch-cooking'].includes(photoFor({ id: 'a', path: '/meal-plans/cheap-student' })));

  for (const photo of PHOTOS) assert.ok(fs.existsSync(`${PINTEREST_PHOTO_DIR}${photo}.jpg`), `${photo}.jpg is checked in`);
  for (const image of plan.images.filter(item => item.template !== 'checklist')) {
    const href = /<image href="([^"]+)"/.exec(image.svg)?.[1] || '';
    assert.ok(PHOTOS.some(photo => href.endsWith(`/${photo}.jpg`)), `${image.id} uses ${href}`);
  }
  // Different pages on the same topic do not all look identical.
  const looks = new Set(plan.images.filter(item => item.template === 'photo').map(item => (
    `${/<image href="([^"]+)"/.exec(item.svg)[1]} ${/preserveAspectRatio="(\w+) slice"/.exec(item.svg)[1]} ${/<rect width="1000" height="1500" fill="([^"]+)"/.exec(item.svg)[1]}`
  )));
  assert.ok(looks.size >= 30, `only ${looks.size} distinct photo looks`);
});

test('every Pin has a short call to action and keeps the brand clear of the corner Pinterest covers', () => {
  for (const image of plan.images) {
    assert.match(image.svg, />(See the plans|Read the guide|Get the plan)</, `${image.id} has no call to action`);
    // The brand sits at the top, not in the bottom-right corner where the
    // save and share buttons are drawn.
    const brand = /<text x="(\d+)" y="(\d+)"[^>]*>MealPrep\.org\.uk</.exec(image.svg);
    assert.ok(brand && Number(brand[2]) < 300, `${image.id} puts the brand at y=${brand?.[2]}`);
  }
});

test('creatives are valid, correctly sized SVG with escaped copy', () => {
  for (const { svg } of plan.images) {
    const root = parseXml(svg);
    assert.equal(root.name, 'svg');
    assert.equal(Number(root.attributes.width), PIN_IMAGE_WIDTH);
    assert.equal(Number(root.attributes.height), PIN_IMAGE_HEIGHT);
    assert.equal(root.attributes.viewBox, `0 0 ${PIN_IMAGE_WIDTH} ${PIN_IMAGE_HEIGHT}`);
  }

  const hostile = {
    title: `Sainsbury's & <b>Tesco</b>`,
    metaTitle: `Sainsbury's & <i>Tesco</i> plans`,
    proposition: 'Cheap & <script>quick</script> meals.',
    kicker: 'Test',
    supermarketLabel: "Sainsbury's",
    benefits: ['A & B'],
    clusters: [],
    kind: 'hub',
  };
  for (const variant of [1, 2]) {
    const { svg } = buildPinSvg(hostile, { variant });
    assert.doesNotThrow(() => parseXml(svg));
    assert.ok(!/<(b|i|script)>/.test(svg), 'markup in page copy is escaped, not rendered');
  }
});

test('a creative never prints more than three facts', () => {
  for (const image of plan.images) {
    const bullets = (image.svg.match(/rx="3"/g) || []).length;
    const ticks = (image.svg.match(/<circle /g) || []).length;
    assert.ok(bullets <= 4, `${image.id} draws ${bullets} rules`);
    assert.ok(ticks <= 3, `${image.id} ticks ${ticks} facts`);
  }
});

test('a calorie target is stated once, not again as a stat label', () => {
  const entry = {
    title: 'Aldi 1500 Calorie Meal Plans UK',
    description: 'Free Aldi meal plans built to a daily target, with a shopping list for the week.',
    proposition: 'Start with an Aldi plan if you want a tight week.',
    kicker: 'Test',
    supermarketLabel: 'Aldi',
    calorieTarget: 1500,
    benefits: ['Aldi', '1,500 kcal focus', 'Multiple goals'],
    clusters: [],
    kind: 'combo',
  };
  for (const variant of [1, 2]) {
    const { svg } = buildPinSvg(entry, { variant });
    assert.equal((svg.match(/1,500/g) || []).length, 1, `pin ${variant} repeats the target`);
  }
  assert.equal((pinDescription(entry).match(/1,500 kcal/g) || []).length, 1);
});

// ── 8 & 9. Duplication and size limits ───────────────────────────────────────

test('no GUID repeats, inside a feed or across boards', () => {
  const acrossBoards = new Map();
  for (const document of documents) {
    const guids = childrenNamed(channelOf(document.xml), 'item').map(item => childText(item, 'guid'));
    assert.equal(new Set(guids).size, guids.length, `${document.filename} has unique GUIDs`);

    if (!document.board.board) continue;
    for (const guid of guids) {
      assert.ok(!acrossBoards.has(guid), `${guid} is on both ${acrossBoards.get(guid)} and ${document.filename}`);
      acrossBoards.set(guid, document.filename);
    }
  }
});

test('near-identical propositions are collapsed to one Pin per board', () => {
  assert.equal(
    duplicateSignature({ supermarkets: ['aldi'], topic: 'weight-loss', calorieTarget: 1500, clusters: [] }),
    duplicateSignature({ supermarkets: ['aldi'], topic: 'weight-loss', calorieTarget: 1500, clusters: ['budget'] }),
    'the same store, topic and target is the same idea',
  );

  // Templated pages collapse to one per idea. Articles do not: each is its own
  // piece of writing with its own title.
  for (const document of boardDocuments) {
    const entries = plan.entries.filter(entry => (
      entry.board.key === document.board.key && entry.kind !== 'guide' && entry.kind !== 'product'
    ));
    const signatures = entries.map(duplicateSignature);
    assert.equal(new Set(signatures).size, signatures.length, `${document.filename} has one templated page per proposition`);
  }
});

test('titles are distinct, human-length and free of the brand tail', () => {
  const firstPinTitles = plan.records.filter(record => record.variant === 1).map(record => record.title);
  assert.equal(new Set(firstPinTitles).size, firstPinTitles.length, 'no two pages share a title');
  const titles = plan.records.map(record => record.title);
  for (const title of titles) {
    assert.ok(title.length >= 12 && title.length <= 64, `"${title}" is ${title.length} characters`);
    assert.ok(!/MealPrep\.org\.uk/i.test(title), `"${title}" repeats the brand Pinterest already shows`);
    assert.ok(!/[!]{1,}|\.{3}$|FREE!!/.test(title), `"${title}" reads as clickbait`);
  }
});

test('every feed respects its own size limit', () => {
  for (const board of PINTEREST_BOARDS) {
    const pages = plan.entries.filter(entry => entry.board.key === board.key).length;
    assert.ok(pages <= board.limit, `${board.feed} holds ${pages} pages of ${board.limit}`);
  }
  for (const entry of plan.entries) {
    const pins = plan.records.filter(record => record.pageId === entry.id).length;
    assert.equal(pins, entry.pins?.length || PIN_VARIANTS_PER_PAGE, `${entry.path} has ${pins} Pins`);
  }

  // What is actually served is capped too, however far the queue has run.
  for (const document of renderPinterestFeeds(plan, { now: END_OF_QUEUE })) {
    if (document.board.board) assert.ok(document.records.length <= FEED_ITEM_LIMIT, `${document.filename} serves ${document.records.length}`);
  }
  assert.equal(
    documents.find(document => document.board.key === PINTEREST_MASTER_FEED.key).records.length,
    plan.records.length,
    'the master feed is the union of the boards',
  );
});

// ── 10. Paid products ────────────────────────────────────────────────────────

test('paid products flow through the same pipeline when they exist', () => {
  // The repository currently ships no first-party paid product, so this asserts
  // the wiring rather than a live entry: adding one config record must be
  // enough to put it in a feed, ahead of the free pages.
  assert.ok(Array.isArray(PINTEREST_PRODUCT_ENTRIES));
  for (const product of PINTEREST_PRODUCT_ENTRIES) {
    assert.ok(product.path?.startsWith('/'), 'a product declares a canonical path');
    assert.ok(product.title && product.description, 'a product declares its own copy');
    const entry = plan.entries.find(item => item.path === product.path);
    assert.ok(entry, `${product.path} reached a feed`);
    assert.equal(entry.kind, 'product');
  }
});

// ── 11. Metadata generation ──────────────────────────────────────────────────

test('descriptions explain what the reader gets without reading as filler', () => {
  for (const record of plan.records) {
    assert.ok(record.description.length >= 80, `${record.guid} description is ${record.description.length} characters`);
    assert.ok(record.description.length <= 460, `${record.guid} description is too long for Pinterest`);
    // A paid product must never be described as free.
    const tail = record.kind === 'product' ? 'From MealPrep.org.uk.' : 'Free on MealPrep.org.uk.';
    assert.ok(record.description.endsWith(tail), `${record.guid} ends with the site attribution`);
    if (record.kind === 'product') assert.ok(!/\bfree\b/i.test(record.description), `${record.guid} calls a paid product free`);
    assert.ok(!record.description.includes('[object Object]'), `${record.guid} leaked a raw object`);
    assert.ok(!record.description.includes('undefined'), `${record.guid} leaked an undefined value`);
    assert.ok(!/(\b\w+\b)(?:\s+\1\b){2,}/i.test(record.description), `${record.guid} repeats a word`);
  }
});

test('metadata is derived from the page, never invented', () => {
  const entry = {
    id: 'hub:aldi',
    kind: 'hub',
    path: '/meal-plans/aldi',
    title: 'Aldi Meal Plans UK',
    description: 'Browse free Aldi meal plans for weight loss, muscle gain and budget meal prep, with shopping lists and PDFs.',
    proposition: 'Aldi meal plans are ideal when you want simple UK supermarket ingredients and a tighter weekly budget.',
    supermarkets: ['aldi'],
    supermarketLabel: 'Aldi',
    calorieTarget: null,
    clusters: ['budget'],
    benefits: ['Aldi', 'Printable shopping lists'],
    board: { key: 'aldi', board: 'Aldi Meal Plans UK' },
  };
  assert.equal(pinTitle(entry), 'Aldi Meal Plans UK');
  const description = pinDescription(entry);
  assert.ok(description.startsWith(entry.description), 'the page’s own description leads');
  assert.ok(description.includes('Printable shopping lists.'), 'an on-page benefit is carried through');
  assert.ok(!/\bAldi\.\s/.test(description.replace(entry.description, '')), 'a bare store label is not repeated as a fact');
});

test('a page with no calorie target never has one asserted for it', () => {
  for (const entry of plan.entries) {
    if (entry.calorieTarget) continue;
    const { svg } = buildPinSvg(entry);
    assert.ok(!/kcal a day/.test(svg), `${entry.path} shows a calorie claim it does not make`);
  }
});

// ── 12. Segmentation ─────────────────────────────────────────────────────────

test('supermarket boards only ever carry that supermarket', () => {
  for (const key of ['aldi', 'lidl']) {
    const entries = plan.entries.filter(entry => entry.board.key === key);
    assert.ok(entries.length > 0, `the ${key} board has content`);
    for (const entry of entries) {
      assert.ok(entry.supermarkets.includes(key), `${entry.path} is on the ${key} board without being about ${key}`);
    }
  }

  const generalStore = plan.entries.filter(entry => entry.board.key === 'supermarket');
  for (const entry of generalStore) {
    assert.ok(entry.supermarkets.length, `${entry.path} is on the supermarket board with no store`);
    assert.ok(!entry.supermarkets.includes('aldi') && !entry.supermarkets.includes('lidl'), `${entry.path} belongs on its own chain board`);
  }
});

test('topic boards match the page’s own subject', () => {
  for (const key of ['calorie-plans', 'high-protein', 'budget', 'weight-loss']) {
    const board = PINTEREST_BOARDS.find(item => item.key === key);
    for (const entry of plan.entries.filter(item => item.board.key === key)) {
      assert.ok(board.match(entry), `${entry.path} does not satisfy the ${key} board rule`);
    }
  }
});

test('every board has a feed, a name and a stable URL', () => {
  const feeds = documents.map(document => document.filename);
  assert.equal(new Set(feeds).size, feeds.length, 'feed filenames are unique');
  for (const board of PINTEREST_BOARDS) {
    assert.ok(feeds.includes(board.feed), `${board.key} has a feed file`);
    assert.match(board.feed, /^[a-z-]+\.xml$/, `${board.feed} is a stable, lowercase filename`);
    assert.ok(board.board, `${board.key} names a Pinterest board`);
  }
  assert.ok(!PINTEREST_MASTER_FEED.board, 'the master feed is not meant for a board');
});

// ── 14. Resilience when content moves ────────────────────────────────────────

test('a retired, renamed or noindexed destination is a warning, not a build failure', () => {
  // The build generator drops such an entry and carries on: content churn in a
  // 1,500-page site must never block an unrelated release. The guarantee lives
  // in scripts/generate-pinterest-assets.js; this asserts the contract it
  // depends on, which is that dropping entries leaves a coherent plan.
  // Every Pin for the dropped page goes, not just the first.
  const droppedPage = plan.entries.find(entry => !entry.pins).id;
  const trimmed = {
    ...plan,
    entries: plan.entries.filter(entry => entry.id !== droppedPage),
    records: plan.records.filter(record => record.pageId !== droppedPage),
    images: plan.images.filter(image => image.pageId !== droppedPage),
  };

  assert.equal(trimmed.entries.length, plan.entries.length - 1);
  assert.equal(trimmed.images.length, plan.images.length - PIN_VARIANTS_PER_PAGE);
  assert.equal(trimmed.records.length, plan.records.length - PIN_VARIANTS_PER_PAGE);

  const droppedGuids = plan.records.filter(record => record.pageId === droppedPage).map(record => record.guid);
  const rebuilt = renderPinterestFeeds(trimmed, { now: END_OF_QUEUE, limit: Infinity });
  for (const document of rebuilt) {
    assert.doesNotThrow(() => parseXml(document.xml), `${document.filename} still parses`);
    const guids = childrenNamed(channelOf(document.xml), 'item').map(item => childText(item, 'guid'));
    assert.ok(!guids.some(guid => droppedGuids.includes(guid)), `${document.filename} no longer carries the dropped page`);
    assert.equal(new Set(guids).size, guids.length, `${document.filename} still has unique GUIDs`);
  }

  const master = rebuilt.find(document => !document.board.board);
  assert.equal(master.records.length, trimmed.records.length, 'the master feed shrinks with the boards');
});

// ── 15. Release queue ────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;

test('the launch batch keeps its launch date and nothing else is released before the drip starts', () => {
  const beforeDrip = new Date(`${PINTEREST_DRIP_START}T00:00:00Z`).getTime() - 1;
  const released = plan.records.filter(record => Date.parse(record.releaseAt) <= beforeDrip);
  const launched = new Set(PINTEREST_LAUNCH_BATCH);

  assert.equal(PINTEREST_LAUNCH_BATCH.length, 49);
  for (const record of released) {
    assert.equal(record.variant, 1, `${record.id} was released before the drip`);
    assert.ok(launched.has(record.path), `${record.path} was not in the launch batch`);
  }
  const stillPublished = PINTEREST_LAUNCH_BATCH.filter(path => plan.entries.some(entry => entry.path === path));
  assert.equal(released.length, stillPublished.length);
});

test('the queue releases a steady number of new Pins every day', () => {
  const start = Date.parse(`${PINTEREST_DRIP_START}T00:00:00Z`);
  const queued = plan.records.filter(record => Date.parse(record.releaseAt) >= start);
  assert.ok(queued.length > PINS_PER_DAY * 14, 'there are weeks of Pins queued, not days');

  const perDay = new Map();
  for (const record of queued) {
    const day = Math.floor((Date.parse(record.releaseAt) - start) / DAY_MS);
    perDay.set(day, (perDay.get(day) || 0) + 1);
  }
  const lastDay = Math.max(...perDay.keys());
  for (let day = 0; day <= lastDay; day += 1) {
    const count = perDay.get(day) || 0;
    assert.ok(count >= 1 && count <= PINS_PER_DAY, `day ${day} releases ${count}`);
  }
  // Full days while there are enough boards with Pins left.
  for (let day = 0; day < 14; day += 1) assert.equal(perDay.get(day), PINS_PER_DAY, `day ${day} is not full`);

  // Every feed, served on any day, changes from the day before until its board runs out.
  const onDay = day => renderPinterestFeeds(plan, { now: new Date(start + day * DAY_MS + DAY_MS - 1) });
  const today = onDay(3);
  const yesterday = onDay(2);
  const changed = today.filter((document, index) => document.xml !== yesterday[index].xml);
  assert.ok(changed.length >= PINS_PER_DAY, `only ${changed.length} feeds changed between two days`);
});

test('a page’s first Pin always goes out before its second, and the best pages go first', () => {
  const byId = new Map(plan.records.map(record => [record.id, record]));
  for (const record of plan.records.filter(item => item.variant > 1)) {
    const first = byId.get(record.pageId);
    assert.ok(Date.parse(first.releaseAt) < Date.parse(record.releaseAt), `${record.id} goes out before its first Pin`);
  }

  const records = [
    { id: 'a', path: '/a', boardKey: 'x', variant: 1, score: 50 },
    { id: 'b', path: '/b', boardKey: 'x', variant: 1, score: 90 },
    { id: 'b~v2', path: '/b', boardKey: 'x', variant: 2, score: 90 },
    { id: 'c', path: '/c', boardKey: 'y', variant: 1, score: 10 },
  ];
  const scheduled = assignReleaseDates(records, [{ key: 'x' }, { key: 'y' }], {
    launchDate: '2026-01-01', dripStart: '2026-02-01', perDay: 2, launchBatch: [],
  });
  const order = [...scheduled].sort((a, b) => a.releaseAt.localeCompare(b.releaseAt)).map(record => record.id);
  // Boards take turns, a board that runs out is skipped, and a board never
  // gets two Pins on one day even when it is the only one left.
  assert.deepEqual(order, ['b', 'c', 'a', 'b~v2']);
  const day = id => scheduled.find(record => record.id === id).releaseAt.slice(0, 10);
  assert.deepEqual(['b', 'c', 'a', 'b~v2'].map(day), ['2026-02-01', '2026-02-01', '2026-02-02', '2026-02-03']);
});

test('no board ever gets more than one new Pin a day, and Pins are spread through the day', () => {
  const start = Date.parse(`${PINTEREST_DRIP_START}T00:00:00Z`);
  const perBoardDay = new Map();
  const perDayHours = new Map();
  for (const record of plan.records.filter(item => Date.parse(item.releaseAt) >= start)) {
    const day = record.releaseAt.slice(0, 10);
    const key = `${record.boardKey} ${day}`;
    perBoardDay.set(key, (perBoardDay.get(key) || 0) + 1);
    perDayHours.set(day, [...(perDayHours.get(day) || []), record.releaseAt.slice(11, 13)]);
  }
  for (const [key, count] of perBoardDay) assert.equal(count, 1, `${key} releases ${count} Pins`);
  for (const [day, hours] of perDayHours) {
    assert.equal(new Set(hours).size, hours.length, `${day} releases two Pins in the same hour`);
  }
});

test('only a real Lemon Squeezy checkout counts as on sale', () => {
  assert.ok(isRealCheckoutUrl('https://mealprepuk.lemonsqueezy.com/checkout/buy/a1a031c4-f59d-4506-83a8-c5b3367eb69e?redirect_url=https%3A%2F%2Fwww.mealprep.org.uk'));
  assert.ok(isRealCheckoutUrl('https://mealprepuk.lemonsqueezy.com/buy/a1a031c4-f59d-4506-83a8-c5b3367eb69e'));
  assert.ok(isRealCheckoutUrl('https://mealprepuk.lemonsqueezy.com/checkout/buy/a1a031c4-f59d-4506-83a8-c5b3367eb69e?a=1&amp;b=2'));
  for (const fake of [
    '',
    'https://example.lemonsqueezy.com/buy/test',
    'http://mealprepuk.lemonsqueezy.com/checkout/buy/a1a031c4-f59d-4506-83a8-c5b3367eb69e',
    'https://lemonsqueezy.com.evil.example/checkout/buy/a1a031c4-f59d-4506-83a8-c5b3367eb69e',
    'https://mealprepuk.lemonsqueezy.com/checkout/a1a031c4-f59d-4506-83a8-c5b3367eb69e',
    'VITE_LS_BUY_URL_ALDI_DINNER',
  ]) {
    assert.ok(!isRealCheckoutUrl(fake), `${fake} was accepted`);
  }
});

test('the queue is deterministic and does not depend on input order', () => {
  const reversed = assignReleaseDates([...plan.records].reverse(), PINTEREST_BOARDS);
  const byId = new Map(reversed.map(record => [record.id, record.releaseAt]));
  for (const record of plan.records) assert.equal(byId.get(record.id), record.releaseAt, record.id);
});

test('a feed shows only released Pins, newest first, dated by release', () => {
  const now = new Date(`${PINTEREST_DRIP_START}T12:00:00Z`);
  const released = releasedRecords(plan.records, now, Infinity);
  assert.ok(released.every(record => Date.parse(record.releaseAt) <= now.getTime()));
  for (let index = 1; index < released.length; index += 1) {
    assert.ok(released[index - 1].releaseAt >= released[index].releaseAt, 'newest first');
  }

  const aldi = PINTEREST_BOARDS.find(board => board.key === 'aldi');
  const { xml, records } = renderFeedAt(aldi, plan.records, { now });
  const items = childrenNamed(channelOf(xml), 'item');
  assert.equal(items.length, records.length);
  items.forEach((item, index) => {
    assert.equal(childText(item, 'pubDate'), rfc822(records[index].releaseAt), 'pubDate is the release date');
  });

  const status = queueStatus(plan.records, now);
  assert.equal(status.released + status.pending, plan.records.length);
  assert.ok(status.daysLeft > 14, 'the queue has more than two weeks left in it');
});

// ── 16. Serving the feeds ────────────────────────────────────────────────────

function fakeResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; return this; },
    end() { return this; },
  };
}

async function serve(feed, { schedule, ok = true, method = 'GET' } = {}) {
  const realFetch = globalThis.fetch;
  clearScheduleCache();
  globalThis.fetch = async () => ({ ok, status: ok ? 200 : 500, json: async () => schedule });
  try {
    const res = fakeResponse();
    await pinterestFeedHandler({ method, query: { feed } }, res);
    return res;
  } finally {
    globalThis.fetch = realFetch;
    clearScheduleCache();
  }
}

const liveSchedule = scheduleDocument({
  records: withImageBytes(plan.records, new Map()),
  feeds: [...PINTEREST_BOARDS, PINTEREST_MASTER_FEED],
});

test('the schedule file round-trips through JSON and validates', () => {
  const parsed = JSON.parse(JSON.stringify(liveSchedule));
  assert.deepEqual(scheduleProblems(parsed), []);
  assert.ok(feedForFilename(parsed, 'aldi.xml'));
  assert.equal(feedForFilename(parsed, 'nope.xml'), null);
  assert.ok(scheduleProblems({ ...parsed, version: 99 }).length, 'an unknown version is refused');
  assert.ok(scheduleProblems(null).length);
});

test('the feed endpoint serves today’s released Pins as XML', async () => {
  const res = await serve('aldi.xml', { schedule: JSON.parse(JSON.stringify(liveSchedule)) });
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['content-type'], /^application\/xml/);
  assert.equal(res.headers['x-robots-tag'], 'noindex');
  const items = childrenNamed(channelOf(res.body), 'item');
  assert.ok(items.length > 0, 'the served feed has items');
  for (const item of items) {
    assert.ok(Date.parse(childText(item, 'pubDate')) <= Date.now(), 'nothing unreleased is served');
    assert.equal(new URL(childText(item, 'link')).searchParams.get('utm_campaign'), 'aldi');
  }
});

test('the feed endpoint refuses unknown feeds and survives a missing schedule', async () => {
  const schedule = JSON.parse(JSON.stringify(liveSchedule));
  assert.equal((await serve('../secret.xml', { schedule })).statusCode, 404);
  assert.equal((await serve('unknown.xml', { schedule })).statusCode, 404);
  assert.equal((await serve('aldi.xml', { schedule, method: 'POST' })).statusCode, 405);

  const down = await serve('aldi.xml', { schedule, ok: false });
  assert.equal(down.statusCode, 503);
  assert.equal(down.headers['cache-control'], 'no-store', 'an outage is never cached as the feed');

  const broken = await serve('aldi.xml', { schedule: { version: 99 } });
  assert.equal(broken.statusCode, 503);
});

test('production reads the production schedule; a preview reads its own', () => {
  assert.equal(scheduleUrl({ VERCEL_ENV: 'production', VERCEL_URL: 'x.vercel.app' }), `${SITE_URL}/pinterest/schedule.json`);
  assert.equal(scheduleUrl({ VERCEL_ENV: 'preview', VERCEL_URL: 'x.vercel.app' }), 'https://x.vercel.app/pinterest/schedule.json');
  assert.equal(scheduleUrl({}), `${SITE_URL}/pinterest/schedule.json`);
});

test('the board feed URLs are routed to the endpoint, not frozen as static files', () => {
  const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const rewrite = (vercel.rewrites || []).find(rule => rule.destination.startsWith('/api/pinterest-feed'));
  assert.ok(rewrite, 'vercel.json rewrites /pinterest/*.xml to the feed endpoint');
  assert.match(rewrite.source, /^\/pinterest\//);

  const generator = fs.readFileSync(new URL('./generate-pinterest-assets.js', import.meta.url), 'utf8');
  assert.ok(!/writeFileSync\([^)]*document\.filename/.test(generator), 'the build must not write static board feeds');
});

// ── 17. The 6-week PDF plans ─────────────────────────────────────────────────

const productEntries = plan.entries.filter(entry => entry.kind === 'product');
const productRecords = plan.records.filter(record => record.kind === 'product');

test('every 6-week PDF and the shop page are advertised on the Aldi and Lidl boards', () => {
  const paths = productEntries.map(entry => entry.path).sort();
  const expected = [PDF_SHOP_PATH, ...Object.keys(MEAL_PREP_PDF_PRODUCTS).map(slug => `${PDF_SHOP_PATH}/${slug}`)].sort();
  assert.deepEqual(paths, expected);

  // No new board: the plans go on the existing Aldi and Lidl boards.
  for (const entry of productEntries) {
    assert.ok(['aldi', 'lidl'].includes(entry.board.key), `${entry.path} is on ${entry.board.key}`);
    const store = /lidl/.test(entry.path) ? 'lidl' : /aldi/.test(entry.path) ? 'aldi' : null;
    if (store) assert.equal(entry.board.key, store, `${entry.path} is on the wrong chain's board`);
  }
  assert.ok(!PINTEREST_BOARDS.some(board => board.key === 'meal-prep-pdfs'), 'no board that would need creating');
  for (const key of ['aldi', 'lidl']) {
    assert.ok(productEntries.filter(entry => entry.board.key === key).length >= 3, `the ${key} board advertises the plans`);
  }
  for (const record of productRecords) {
    const link = new URL(record.link);
    assert.equal(link.searchParams.get('utm_campaign'), record.boardKey);
    assert.ok(link.pathname.startsWith(PDF_SHOP_PATH), `${record.link} does not go to the shop`);
  }
});

test('each product gets several different Pins, each with its own photo and title', () => {
  const titles = productRecords.map(record => record.title);
  assert.equal(new Set(titles).size, titles.length, 'no two product Pins share a title');
  for (const title of titles) assert.ok(title.length <= 64 && !title.endsWith('…'), `"${title}" is cut off`);

  for (const entry of productEntries) {
    assert.ok(entry.pins.length >= 2, `${entry.path} has only ${entry.pins.length} Pin`);
    const photos = entry.pins.map(pin => pin.photo);
    assert.equal(new Set(photos).size, photos.length, `${entry.path} repeats a photo`);
    for (const photo of photos) {
      assert.ok(fs.existsSync(`${PINTEREST_PHOTO_DIR}${photo}.jpg`), `photo ${photo}.jpg is checked in`);
    }
  }
});

test('product Pins state the real price and never call a paid plan free', () => {
  for (const [slug, product] of Object.entries(MEAL_PREP_PDF_PRODUCTS)) {
    const entry = productEntries.find(item => item.path === `${PDF_SHOP_PATH}/${slug}`);
    const price = formatPrice(product.priceGBP);
    for (const variant of entry.pins.map((_, index) => index + 1)) {
      const { svg, template } = buildPinSvg(entry, { variant, photoBase: PINTEREST_PHOTO_DIR });
      assert.equal(template, 'product');
      assert.ok(svg.includes(`>${price}<`), `${slug} pin ${variant} shows its price tag`);
      assert.ok(!/\bfree\b/i.test(svg), `${slug} pin ${variant} calls a paid plan free`);
      assert.doesNotThrow(() => parseXml(svg));
      const prices = [...svg.matchAll(/£\d+\.\d{2}/g)].map(match => match[0]);
      const known = new Set(Object.values(MEAL_PREP_PDF_PRODUCTS).map(item => formatPrice(item.priceGBP)));
      const separate = (product.bundleOf || []).reduce((sum, item) => sum + MEAL_PREP_PDF_PRODUCTS[item].priceGBP, 0);
      if (separate) known.add(formatPrice(separate));
      for (const shown of prices) assert.ok(known.has(shown), `${slug} pin ${variant} shows ${shown}, which no product costs`);
    }
  }
});

test('product Pins are mixed in with the free pages, never back to back on a board', () => {
  for (const key of ['aldi', 'lidl']) {
    const queued = plan.records
      .filter(record => record.boardKey === key && Date.parse(record.releaseAt) >= Date.parse(`${PINTEREST_DRIP_START}T00:00:00Z`))
      .sort((a, b) => a.releaseAt.localeCompare(b.releaseAt));
    const pages = queued.filter(record => record.kind !== 'product').length;
    // While free pages remain, two products never go out one after the other.
    let pagesLeft = pages;
    for (let index = 1; index < queued.length && pagesLeft > 0; index += 1) {
      if (queued[index - 1].kind !== 'product') pagesLeft -= 1;
      if (pagesLeft > 0) {
        assert.ok(!(queued[index].kind === 'product' && queued[index - 1].kind === 'product'), `${key} posts two products in a row at ${queued[index].releaseAt}`);
      }
    }
  }
});

test('product Pins start going out as soon as the queue starts, and keep going', () => {
  const start = Date.parse(`${PINTEREST_DRIP_START}T00:00:00Z`);
  const times = productRecords.map(record => Date.parse(record.releaseAt)).sort((a, b) => a - b);
  assert.ok(times[0] < start + DAY_MS, 'the first product Pin goes out on the first day');
  assert.ok(times.at(-1) - times[0] > 14 * DAY_MS, 'product Pins are spread over weeks, not dumped at once');
  const sameDay = new Map();
  for (const time of times) {
    const day = Math.floor(time / DAY_MS);
    sameDay.set(day, (sameDay.get(day) || 0) + 1);
  }
  assert.equal(Math.max(...sameDay.values()), 1, 'at most one product Pin a day');
});
