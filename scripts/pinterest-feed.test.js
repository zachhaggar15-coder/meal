// Contract tests for the Pinterest distribution system.
//
// The feeds are published to a third party that gives no feedback when it
// stops working: a malformed date, an unescaped ampersand or a duplicate GUID
// simply stops Pins appearing. These tests are the only place that failure
// surfaces before it costs a month of distribution.

import test from 'node:test';
import assert from 'node:assert/strict';

import { SITE_URL } from '../src/constants/site.js';
import {
  MIN_ELIGIBILITY_SCORE,
  PINTEREST_BOARDS,
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
import { buildPinSvg, templateFor, TEMPLATES } from '../src/pinterest/creative.js';
import { buildRssFeed, escapeXml, rfc822 } from '../src/pinterest/feed.js';
import { buildPinterestPlan, renderPinterestFeeds } from '../src/pinterest/index.js';
import { parseXml, childrenNamed, childText, XmlError } from './lib/xmlLite.js';

const plan = buildPinterestPlan();
const documents = renderPinterestFeeds(plan, { buildDate: new Date('2026-09-15T09:00:00Z') });
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
      assert.equal(guid, `${link.origin}${link.pathname}`);
      assert.ok(!guid.includes('utm_'), 'the GUID carries no tracking parameters');
    }
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
      assert.equal(media.attributes.type, 'image/png');
      assert.ok(media.attributes.url.startsWith(`${SITE_URL}/pinterest/img/`), 'image is served from the public asset path');
      assert.ok(media.attributes.url.endsWith('.png'), 'Pinterest cannot use SVG');
    }
  }
});

test('image URLs are stable and unique per page', () => {
  const urls = plan.entries.map(entry => pinImageUrl(entry));
  assert.equal(new Set(urls).size, urls.length, 'no two pages share a creative');
  const entry = plan.entries[0];
  assert.equal(pinImageUrl(entry), pinImageUrl({ ...entry, score: 0, board: null }), 'the URL does not depend on ranking');
});

test('three templates cover the library, chosen from the page’s own data', () => {
  assert.deepEqual(TEMPLATES, ['supermarket', 'target', 'guide']);
  assert.equal(templateFor({ supermarketLabel: 'Aldi', calorieTarget: 1500 }), 'supermarket');
  assert.equal(templateFor({ supermarketLabel: '', calorieTarget: 1500 }), 'target');
  assert.equal(templateFor({ supermarketLabel: '', calorieTarget: null }), 'guide');

  const used = new Set(plan.images.map(image => image.template));
  assert.ok(used.size >= 2, 'the library exercises more than one template');
});

test('creatives are valid, correctly sized SVG with escaped copy', () => {
  for (const entry of plan.entries) {
    const { svg } = buildPinSvg(entry);
    const root = parseXml(svg);
    assert.equal(root.name, 'svg');
    assert.equal(Number(root.attributes.width), PIN_IMAGE_WIDTH);
    assert.equal(Number(root.attributes.height), PIN_IMAGE_HEIGHT);
    assert.equal(root.attributes.viewBox, `0 0 ${PIN_IMAGE_WIDTH} ${PIN_IMAGE_HEIGHT}`);
  }

  const { svg } = buildPinSvg({
    title: `Sainsbury's & <b>Tesco</b>`,
    kicker: 'Test',
    supermarketLabel: "Sainsbury's",
    benefits: ['A & B'],
    clusters: [],
    kind: 'hub',
  });
  assert.doesNotThrow(() => parseXml(svg));
  assert.ok(!svg.includes('<b>'), 'markup in a title is escaped, not rendered');
});

test('a creative never prints more than three facts', () => {
  for (const entry of plan.entries) {
    const { svg } = buildPinSvg(entry);
    const bullets = (svg.match(/rx="3"/g) || []).length;
    assert.ok(bullets <= 4, `${entry.path} draws ${bullets} rules`);
  }
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

  for (const document of boardDocuments) {
    const entries = plan.entries.filter(entry => entry.board.key === document.board.key);
    const signatures = entries.map(duplicateSignature);
    assert.equal(new Set(signatures).size, signatures.length, `${document.filename} has one Pin per proposition`);
  }
});

test('titles are distinct, human-length and free of the brand tail', () => {
  const titles = plan.records.map(record => record.title);
  assert.equal(new Set(titles).size, titles.length, 'no two Pins share a title');
  for (const title of titles) {
    assert.ok(title.length >= 12 && title.length <= 64, `"${title}" is ${title.length} characters`);
    assert.ok(!/MealPrep\.org\.uk/i.test(title), `"${title}" repeats the brand Pinterest already shows`);
    assert.ok(!/[!]{1,}|\.{3}$|FREE!!/.test(title), `"${title}" reads as clickbait`);
  }
});

test('every feed respects its own size limit', () => {
  for (const document of boardDocuments) {
    const board = PINTEREST_BOARDS.find(item => item.key === document.board.key);
    assert.ok(document.records.length <= board.limit, `${document.filename} holds ${document.records.length} of ${board.limit}`);
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
    assert.ok(record.description.endsWith('Free on MealPrep.org.uk.'), `${record.guid} ends with the site attribution`);
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
