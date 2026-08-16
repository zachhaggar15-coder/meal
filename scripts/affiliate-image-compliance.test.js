// Amazon product imagery must not reappear.
//
// The site displayed 23 Amazon product photos hotlinked from their media
// servers and 11 more downloaded and re-hosted in public/. The Associates
// Programme Policies allow neither: under the IP Licence, Product Advertising
// Content — which explicitly includes images — may only be obtained through the
// Creators API or PA API, and even then an image link may be stored for at most
// 24 hours. A statically prerendered site bakes URLs into HTML at build time
// and cannot honour a 24-hour refresh, so there is no version of hotlinking
// that complies. Re-hosting is a plainer breach still: storing the image is
// prohibited outright.
//
// The licence terminates automatically on non-compliance, which for a site
// funded by Associates commissions is the whole business. Hence a test rather
// than a note in a README.
//
// This does NOT prohibit affiliate links, tracking parameters, the store tag,
// or the required disclosure — all of those are fine and are asserted elsewhere.
// It prohibits exactly one thing: Amazon's imagery.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SEARCH_DIRS = ['src', 'scripts', 'api', 'public'];
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'audit-artifacts', '.claude']);
const TEXT_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.json', '.css', '.html', '.md']);

// Amazon's image CDNs, in the forms that have actually appeared in this repo.
const AMAZON_IMAGE_HOST = /\b(?:m\.media-amazon\.com|images-na\.ssl-images-amazon\.com|images-[a-z]{2}\.ssl-images-amazon\.com|[a-z0-9-]*\.images-amazon\.com)\b/i;

// Product photography that was downloaded from Amazon and served from public/.
// Listed by name because the files are gone and must not come back.
const REHOSTED_PRODUCT_IMAGES = /\b(?:meal-containers-ad|budget-containers-ad|meal-stickers-ad)\.(?:jpe?g|png|webp)\b|\/images\/products\//i;

function walk(dir, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function sourceFiles() {
  return SEARCH_DIRS
    .flatMap(dir => walk(path.join(ROOT, dir)))
    .filter(file => TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()))
    // This file names the patterns it forbids, so it would match itself.
    .filter(file => path.basename(file) !== 'affiliate-image-compliance.test.js');
}

test('no source file references an Amazon image host', () => {
  const offenders = [];
  for (const file of sourceFiles()) {
    const text = fs.readFileSync(file, 'utf8');
    const match = AMAZON_IMAGE_HOST.exec(text);
    if (match) offenders.push(`${path.relative(ROOT, file)} references ${match[0]}`);
  }
  assert.deepEqual(offenders, []);
});

test('no re-hosted Amazon product photo returns to the repo', () => {
  const offenders = [];
  for (const file of sourceFiles()) {
    const text = fs.readFileSync(file, 'utf8');
    const match = REHOSTED_PRODUCT_IMAGES.exec(text);
    if (match) offenders.push(`${path.relative(ROOT, file)} references ${match[0]}`);
  }
  assert.deepEqual(offenders, []);

  // And the image files themselves must not exist.
  const strayFiles = walk(path.join(ROOT, 'public'))
    .filter(file => REHOSTED_PRODUCT_IMAGES.test(`/${path.relative(ROOT, file).replace(/\\/g, '/')}`))
    .map(file => path.relative(ROOT, file));
  assert.deepEqual(strayFiles, []);
});

test('the detector still recognises what it is looking for (control)', () => {
  // Positive controls: every form that has actually appeared in this codebase.
  for (const sample of [
    "image: 'https://m.media-amazon.com/images/I/71pUFJ5k6+L._AC_SL1500_.jpg',",
    "image: 'https://images-na.ssl-images-amazon.com/images/P/B08V8CMQWS.01._SL1500_.jpg',",
  ]) {
    assert.ok(AMAZON_IMAGE_HOST.test(sample), `should match: ${sample}`);
  }
  for (const sample of [
    "image: '/meal-containers-ad.webp',",
    "heroImage: '/budget-containers-ad.jpg',",
    "image: '/images/products/accessories/lifewit-9l-lunch-bag.jpg',",
  ]) {
    assert.ok(REHOSTED_PRODUCT_IMAGES.test(sample), `should match: ${sample}`);
  }

  // Negative controls: the things that are allowed and must keep working.
  for (const sample of [
    "href: 'https://www.amazon.co.uk/Vinsani-Compartment/dp/B0DN32KNK3?tag=amazonaf063dc-21',",
    "'As an Amazon Associate I earn from qualifying purchases.'",
    "ogImage: 'https://www.mealprep.org.uk/og-preview.png'",
    "image: '/mealprep-logo.webp'",
  ]) {
    assert.ok(!AMAZON_IMAGE_HOST.test(sample), `should not match: ${sample}`);
    assert.ok(!REHOSTED_PRODUCT_IMAGES.test(sample), `should not match: ${sample}`);
  }
});

test('the affiliate links, tag and disclosure all survive', () => {
  // The point of the removal was to protect the Associates account, not to
  // dismantle the affiliate integration. If this fails, the fix went too far.
  const containers = fs.readFileSync(path.join(ROOT, 'src/data/containerProducts.js'), 'utf8');
  assert.match(containers, /amazonaf063dc-21/, 'the store tag must remain');
  assert.match(containers, /As an Amazon Associate I earn from qualifying purchases/,
    'the required disclosure must remain');
  assert.ok((containers.match(/asin:/g) || []).length > 10, 'product records must remain');
});
