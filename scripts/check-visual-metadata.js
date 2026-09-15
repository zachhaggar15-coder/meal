// Post-build guard for the image metadata Google Search, Google Images and
// Google Discover read: og:image dimensions that match the real file, alt
// text, max-image-preview:large on indexable pages, structured-data image
// URLs that are absolute production HTTPS, and no localhost/preview domain
// ever reaching a shipped page.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://www.mealprep.org.uk';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error('check-visual-metadata: dist/ not found. Run the build first.');
  process.exit(1);
}

const htmlFiles = findHtmlFiles(dist).filter(file => !path.relative(dist, file).startsWith(`ssr${path.sep}`));
const errors = [];
const dimensionCache = new Map();
let checkedImages = 0;

for (const file of htmlFiles) {
  const route = routeFromFile(file);
  const html = fs.readFileSync(file, 'utf8');
  const robots = matchAll(html, /<meta\b[^>]*name=["']robots["'][^>]*>/gi).map(tag => attr(tag, 'content') || '');
  const isNoindex = robots.some(value => /\bnoindex\b/i.test(value));

  validateNoPreviewDomains(route, html);
  validateOgImage(route, html, isNoindex, robots);
  validateStructuredDataImages(route, html);
}

if (errors.length) {
  console.error(`\ncheck-visual-metadata FAILED with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 80)) console.error(`  - ${error}`);
  if (errors.length > 80) console.error(`  ...and ${errors.length - 80} more`);
  console.error('\nFix image/social metadata issues before deploying.\n');
  process.exit(1);
}

console.log(`check-visual-metadata passed: ${checkedImages} og:image reference(s) verified across ${htmlFiles.length} page(s).`);

function validateOgImage(route, html, isNoindex, robots) {
  const imageTags = matchAll(html, /<meta\b[^>]*property=["']og:image["'][^>]*>/gi);
  if (imageTags.length !== 1) {
    errors.push(`${route}: expected exactly one og:image, found ${imageTags.length}`);
    return;
  }

  const image = attr(imageTags[0], 'content');
  if (!image) {
    errors.push(`${route}: og:image has no content`);
    return;
  }

  const width = Number(attr(matchFirst(html, /<meta\b[^>]*property=["']og:image:width["'][^>]*>/i), 'content'));
  const height = Number(attr(matchFirst(html, /<meta\b[^>]*property=["']og:image:height["'][^>]*>/i), 'content'));
  const alt = attr(matchFirst(html, /<meta\b[^>]*property=["']og:image:alt["'][^>]*>/i), 'content');
  const twitterAlt = attr(matchFirst(html, /<meta\b[^>]*name=["']twitter:image:alt["'][^>]*>/i), 'content');

  if (!Number.isFinite(width) || width <= 0) errors.push(`${route}: og:image:width is not a positive number (${width})`);
  if (!Number.isFinite(height) || height <= 0) errors.push(`${route}: og:image:height is not a positive number (${height})`);
  if (!alt || !alt.trim()) errors.push(`${route}: og:image:alt is missing or empty`);
  if (!twitterAlt || !twitterAlt.trim()) errors.push(`${route}: twitter:image:alt is missing or empty`);

  let url;
  try {
    url = new URL(image);
  } catch {
    errors.push(`${route}: og:image is not an absolute URL (${image})`);
    return;
  }

  if (url.origin !== SITE_ORIGIN) {
    errors.push(`${route}: og:image origin is ${url.origin}, expected ${SITE_ORIGIN} (never ship a preview/localhost image URL)`);
    return;
  }

  const localPath = path.join(dist, decodeURIComponent(url.pathname.replace(/^\//, '')));
  if (!fs.existsSync(localPath)) {
    errors.push(`${route}: og:image asset is missing from the build (${url.pathname})`);
    return;
  }

  checkedImages += 1;
  const actual = readImageDimensions(localPath);
  if (actual && Number.isFinite(width) && Number.isFinite(height)) {
    if (actual.width !== width || actual.height !== height) {
      errors.push(
        `${route}: og:image declares ${width}x${height} but ${url.pathname} is actually ${actual.width}x${actual.height}`,
      );
    }
  }

  // Google ignores max-image-preview on a noindex page, but an indexable
  // page must carry it or Google may serve a thumbnail-sized preview instead
  // of the large image the rest of this system exists to provide.
  if (!isNoindex && !robots.some(value => /max-image-preview:large/i.test(value))) {
    errors.push(`${route}: indexable page is missing max-image-preview:large`);
  }
}

function validateStructuredDataImages(route, html) {
  for (const tag of matchAll(html, /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const jsonText = tag.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '');
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch {
      continue; // malformed JSON-LD is check-structured-data's concern, not this script's
    }
    for (const image of collectImageValues(data)) {
      if (image.startsWith('data:')) {
        errors.push(`${route}: structured data "image" is a data URI, not a crawlable URL (${image.slice(0, 40)}...)`);
        continue;
      }
      let url;
      try {
        url = new URL(image);
      } catch {
        errors.push(`${route}: structured data "image" is not an absolute URL (${image})`);
        continue;
      }
      if (url.origin !== SITE_ORIGIN) {
        errors.push(`${route}: structured data "image" origin is ${url.origin}, expected ${SITE_ORIGIN}`);
      }
    }
  }
}

function collectImageValues(node, out = []) {
  if (Array.isArray(node)) {
    for (const item of node) collectImageValues(item, out);
    return out;
  }
  if (!node || typeof node !== 'object') return out;

  if (typeof node.image === 'string') out.push(node.image);
  else if (Array.isArray(node.image)) {
    for (const item of node.image) {
      if (typeof item === 'string') out.push(item);
      else if (item && typeof item.url === 'string') out.push(item.url);
    }
  } else if (node.image && typeof node.image.url === 'string') {
    out.push(node.image.url);
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') collectImageValues(value, out);
  }
  return out;
}

function validateNoPreviewDomains(route, html) {
  const bannedPatterns = [/localhost/i, /127\.0\.0\.1/, /0\.0\.0\.0/, /\.vercel\.app\b/i, /\bvercel-preview\b/i];
  for (const pattern of bannedPatterns) {
    if (pattern.test(html)) {
      errors.push(`${route}: shipped HTML references a non-production domain matching ${pattern}`);
    }
  }
}

// Every raster asset in this repo is either a PNG or a simple lossy WebP
// (VP8), so this reads just enough of each header to recover dimensions
// without a third-party image library.
function readImageDimensions(filePath) {
  if (dimensionCache.has(filePath)) return dimensionCache.get(filePath);

  const ext = path.extname(filePath).toLowerCase();
  let result = null;
  const buffer = fs.readFileSync(filePath);

  if (ext === '.png' && buffer.length >= 24 && buffer.toString('ascii', 1, 4) === 'PNG') {
    result = { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  } else if (ext === '.webp' && buffer.length >= 30 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    const fourCC = buffer.toString('ascii', 12, 16);
    if (fourCC === 'VP8 ') {
      result = {
        width: buffer.readUInt16LE(26) & 0x3fff,
        height: buffer.readUInt16LE(28) & 0x3fff,
      };
    } else if (fourCC === 'VP8L') {
      const bits = buffer.readUInt32LE(21);
      result = { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    } else if (fourCC === 'VP8X') {
      result = {
        width: (buffer.readUIntLE(24, 3) & 0xffffff) + 1,
        height: (buffer.readUIntLE(27, 3) & 0xffffff) + 1,
      };
    }
  }

  dimensionCache.set(filePath, result);
  return result;
}

function findHtmlFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...findHtmlFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
  }
  return files;
}

function routeFromFile(file) {
  const relative = path.relative(dist, file).split(path.sep).join('/');
  if (relative === 'index.html') return '/';
  if (relative === '404.html') return '/404.html';
  return `/${relative.replace(/\/index\.html$/, '')}`;
}

function attr(tag, name) {
  if (!tag) return null;
  const pattern = new RegExp(`${name}=["']([^"']*)`, 'i');
  const match = tag.match(pattern);
  return match ? decodeHtmlEntities(match[1]) : null;
}

function matchFirst(value, pattern) {
  const match = value.match(pattern);
  return match ? match[0] : '';
}

function matchAll(value, pattern) {
  return [...value.matchAll(pattern)].map(match => match[0]);
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
