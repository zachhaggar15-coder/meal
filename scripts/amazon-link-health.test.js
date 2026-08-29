// Contracts for the weekly Amazon link check.
//
// The costly failure mode here is a false alarm: reporting a healthy listing as
// dead because Amazon served a CAPTCHA, or reporting stock we never actually
// checked. Most of these tests pin exactly that boundary.

import assert from 'node:assert/strict';
import test from 'node:test';

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { assertBuildIsComplete, classifyHost, extractAsin, groupByAsin } from './lib/amazonLinks.js';
import { asinsFromError, marketplaceFor, verdictForError, verdictForItem } from './lib/amazonPaapi.js';
import { classifyProbe } from './check-amazon-links.js';

test('extractAsin reads every product URL shape the site emits', () => {
  assert.equal(extractAsin('/Vinsani-Compartment-Containers/dp/B0DN32KNK3'), 'B0DN32KNK3');
  assert.equal(extractAsin('/dp/B0DN32KNK3?tag=amazonaf063dc-21'), 'B0DN32KNK3');
  assert.equal(extractAsin('/gp/product/B073N49WSY'), 'B073N49WSY');
  assert.equal(extractAsin('/-/en/dp/B0FFH1DW9W'), 'B0FFH1DW9W');
  // Books use a 10-character ISBN that ends in a letter.
  assert.equal(extractAsin('/Batch-Lady-Grab-Cook-prep-ahead/dp/152992202X'), '152992202X');
  assert.equal(extractAsin('/s?k=meal+prep+containers'), null);
});

test('classifyHost accepts Amazon marketplaces and shorteners, rejects lookalikes', () => {
  assert.equal(classifyHost('www.amazon.co.uk'), 'amazon');
  assert.equal(classifyHost('amazon.de'), 'amazon');
  assert.equal(classifyHost('amzn.to'), 'shortener');
  assert.equal(classifyHost('notamazon.example.com'), null);
  assert.equal(classifyHost('amazon.co.uk.phishing.test'), null);
});

test('groupByAsin collapses duplicate links and isolates the ones with no ASIN', () => {
  const links = [
    { url: 'https://www.amazon.co.uk/a/dp/B000000001', hostname: 'www.amazon.co.uk', asin: 'B000000001' },
    { url: 'https://www.amazon.co.uk/b/dp/B000000001', hostname: 'www.amazon.co.uk', asin: 'B000000001' },
    { url: 'https://www.amazon.co.uk/c/dp/B000000002', hostname: 'www.amazon.co.uk', asin: 'B000000002' },
    { url: 'https://amzn.to/abc', hostname: 'amzn.to', asin: null },
  ];
  const { byAsin, withoutAsin } = groupByAsin(links);

  assert.equal(byAsin.length, 2, 'two distinct ASINs, so two GetItems lookups');
  assert.equal(byAsin.find(group => group.asin === 'B000000001').links.length, 2);
  assert.equal(withoutAsin.length, 1);
});

test('a CAPTCHA or throttle is reported as blocked, never as a dead link', () => {
  assert.equal(classifyProbe(503, 'Sorry, something went wrong').status, 'blocked');
  assert.equal(classifyProbe(429, '').status, 'blocked');
  // The bot wall is served with a 200 status often enough to matter.
  assert.equal(classifyProbe(200, 'Enter the characters you see below').status, 'blocked');
  assert.equal(classifyProbe(200, 'Type the characters you see in this image').status, 'blocked');
  assert.equal(classifyProbe(200, '<form action="/errors/validateCaptcha">').status, 'blocked');
});

test('probe reports a genuinely removed listing as dead', () => {
  assert.equal(classifyProbe(404, '').status, 'dead');
  assert.equal(classifyProbe(410, '').status, 'dead');
  // Amazon's not-found page comes back with a 200.
  assert.equal(classifyProbe(200, '<img src="/dogsofamazon/rico.jpg">').status, 'dead');
});

test('a 404 stays dead even though Amazon puts bot boilerplate on its 404 page', () => {
  // Regression: Amazon's ordinary not-found page carries the same "automated
  // access" wording as the bot wall. Reading that first classified a genuinely
  // delisted ASIN as "blocked" and silently suppressed the weekly alert.
  const notFoundPage = 'Sorry! We couldn\'t find that page. '
    + 'To discuss automated access to Amazon data please contact api-services-support@amazon.com.';
  assert.equal(classifyProbe(404, notFoundPage).status, 'dead');
});

test('a reachable page never claims a stock verdict', () => {
  const verdict = classifyProbe(200, '<html>Add to Basket</html>');
  assert.equal(verdict.status, 'reachable');
  assert.match(verdict.availability, /stock not verified/);
});

test('an unexpected status is unknown rather than dead', () => {
  assert.equal(classifyProbe(403, '').status, 'unknown');
  assert.equal(classifyProbe(500, 'internal').status, 'blocked', '5xx is Amazon shedding load, not link rot');
});

test('verdictForItem calls only Availability.Type "Now" in stock', () => {
  const listing = type => ({
    Offers: { Listings: [{ Availability: { Type: type, Message: 'msg' }, Price: { DisplayAmount: '£19.99' } }] },
    ItemInfo: { Title: { DisplayValue: 'Glass containers' } },
  });

  const inStock = verdictForItem(listing('Now'));
  assert.equal(inStock.status, 'in-stock');
  assert.equal(inStock.price, '£19.99');
  assert.equal(inStock.title, 'Glass containers');

  assert.equal(verdictForItem(listing('OutOfStock')).status, 'out-of-stock');
  assert.equal(verdictForItem(listing('PreorderableFuture')).status, 'out-of-stock');
});

test('an item with no buyable offer is out of stock, not dead', () => {
  const verdict = verdictForItem({ ItemInfo: { Title: { DisplayValue: 'Rice cooker' } }, Offers: { Listings: [] } });
  assert.equal(verdict.status, 'out-of-stock');
  assert.equal(verdict.title, 'Rice cooker');
});

test('a delisted ASIN is dead, other API errors stay unknown', () => {
  assert.equal(verdictForError({ Code: 'ItemNotAccessible', Message: 'not accessible' }).status, 'dead');
  assert.equal(verdictForError({ Code: 'InvalidParameterValue', Message: 'bad asin' }).status, 'dead');
  // Throttling must not be read as a verdict about the product.
  assert.equal(verdictForError({ Code: 'TooManyRequests', Message: 'slow down' }).status, 'unknown');
});

test('asinsFromError recovers the ASIN Amazon names in the message text', () => {
  const message = 'The ItemId B0DN32KNK3 provided in the request is invalid.';
  assert.deepEqual(asinsFromError({ Message: message }), ['B0DN32KNK3']);
  assert.deepEqual(asinsFromError({ Message: 'no asin here' }), []);
});

test('a half-written dist is refused instead of reported as an exhaustive scan', () => {
  // Regression: a concurrent build left dist/ holding 882 of 1,406 pages. The
  // scan happily reported 23 of the 57 links and stamped the artifact
  // "exhaustive: true", which would hide a dead link rather than surface it.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'amazon-links-'));
  try {
    fs.writeFileSync(
      path.join(dir, 'sitemap.xml'),
      '<urlset><url><loc>https://www.mealprep.org.uk/a</loc></url>'
      + '<url><loc>https://www.mealprep.org.uk/b</loc></url>'
      + '<url><loc>https://www.mealprep.org.uk/c</loc></url></urlset>',
    );

    assert.throws(() => assertBuildIsComplete(dir, 2), /mid-build/, 'fewer pages than the sitemap must fail');
    assert.doesNotThrow(() => assertBuildIsComplete(dir, 3), 'a complete build passes');
    // Extra HTML files (404.html, and pages excluded from the sitemap) are normal.
    assert.doesNotThrow(() => assertBuildIsComplete(dir, 9));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the sitemap index itself is not counted as a page', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'amazon-links-'));
  try {
    fs.writeFileSync(
      path.join(dir, 'sitemap.xml'),
      '<sitemapindex><sitemap><loc>https://www.mealprep.org.uk/sitemap-1.xml</loc></sitemap></sitemapindex>',
    );
    fs.writeFileSync(
      path.join(dir, 'sitemap-1.xml'),
      '<urlset><url><loc>https://www.mealprep.org.uk/a</loc></url></urlset>',
    );
    // One real page, so one HTML file is a complete build.
    assert.doesNotThrow(() => assertBuildIsComplete(dir, 1));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a dist with no sitemap yet is treated as an unfinished build', () => {
  // vite wipes dist/ and the sitemap is written last, so there is a window where
  // dist/ holds a few hundred pages and no sitemap. That must not scan silently.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'amazon-links-'));
  try {
    assert.throws(() => assertBuildIsComplete(dir, 344), /has not finished/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('marketplaceFor resolves the UK endpoint and refuses an unconfigured market', () => {
  assert.deepEqual(marketplaceFor('www.amazon.co.uk'), {
    host: 'webservices.amazon.co.uk',
    region: 'eu-west-1',
    marketplace: 'www.amazon.co.uk',
  });
  assert.throws(() => marketplaceFor('www.amazon.com.au'), /No Product Advertising API marketplace/);
});
