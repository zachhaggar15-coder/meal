// Post-build guard for Google crawlability and search appearance basics.
//
// This checks the generated HTML because prerendered output is what Googlebot
// can inspect first: canonicals, robots meta, sitemap URLs, internal links,
// titles, descriptions, images, and sponsored affiliate link attributes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://www.mealprep.org.uk';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error('check-google-indexing: dist/ not found. Run the build first.');
  process.exit(1);
}

const { redirects = [] } = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const redirectMap = new Map(redirects.map(rule => [normalisePath(rule.source), normalisePath(rule.destination)]));
const htmlFiles = findHtmlFiles(dist).filter(file => !path.relative(dist, file).startsWith(`ssr${path.sep}`));
const routeFiles = new Map(htmlFiles.map(file => [routeFromFile(file), file]));
const pages = [];
const errors = [];

for (const file of htmlFiles) {
  const route = routeFromFile(file);
  const html = fs.readFileSync(file, 'utf8');
  const title = textContent(matchFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const description = attr(matchFirst(html, /<meta\b[^>]*name=["']description["'][^>]*>/i), 'content');
  const canonicals = matchAll(html, /<link\b[^>]*rel=["']canonical["'][^>]*>|<link\b[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/gi)
    .map(tag => attr(tag, 'href'))
    .filter(Boolean);
  const robots = matchAll(html, /<meta\b[^>]*name=["']robots["'][^>]*>/gi)
    .map(tag => attr(tag, 'content') || '');
  const h1s = matchAll(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map(textContent);

  if (!title) errors.push(`${route}: missing <title>`);
  if (!description) errors.push(`${route}: missing meta description`);
  if (h1s.length !== 1) errors.push(`${route}: expected exactly one h1, found ${h1s.length}`);
  if (canonicals.length !== 1) errors.push(`${route}: expected exactly one canonical URL, found ${canonicals.length}`);

  const canonicalPath = validateCanonical(route, canonicals[0]);
  const isNoindex = robots.some(value => /\bnoindex\b/i.test(value));

  validateImages(route, html);
  validateInternalLinks(route, html);
  validateSponsoredLinks(route, html);

  pages.push({ route, title, description, canonicalPath, isNoindex });
}

validateSitemaps(pages);
validateDuplicateMetadata(pages);

if (errors.length) {
  console.error(`\ncheck-google-indexing FAILED with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 80)) console.error(`  - ${error}`);
  if (errors.length > 80) console.error(`  ...and ${errors.length - 80} more`);
  console.error('\nFix crawlability/search-appearance issues before deploying.\n');
  process.exit(1);
}

const indexablePages = pages.filter(page => !page.isNoindex && page.canonicalPath === page.route).length;
console.log(
  `check-google-indexing passed: ${indexablePages} indexable canonical page(s), ` +
  `${htmlFiles.length} generated HTML file(s).`,
);

function validateCanonical(route, canonical) {
  if (!canonical) return null;

  let url;
  try {
    url = new URL(canonical);
  } catch {
    errors.push(`${route}: canonical is not an absolute URL (${canonical})`);
    return null;
  }

  if (url.origin !== SITE_ORIGIN) {
    errors.push(`${route}: canonical origin is ${url.origin}, expected ${SITE_ORIGIN}`);
  }
  if (url.search || url.hash) {
    errors.push(`${route}: canonical URL must not contain query strings or fragments`);
  }

  const canonicalPath = normalisePath(url.pathname);
  if (!routeFiles.has(canonicalPath)) {
    errors.push(`${route}: canonical target is not prerendered (${canonicalPath})`);
  }

  return canonicalPath;
}

function validateSitemaps(pages) {
  const sitemapIndex = path.join(dist, 'sitemap.xml');
  if (!fs.existsSync(sitemapIndex)) {
    errors.push('sitemap.xml is missing from dist/');
    return;
  }

  const sitemapLocs = readXmlLocs(sitemapIndex);
  const childSitemaps = sitemapLocs.filter(loc => loc.endsWith('.xml'));
  const sitemapUrls = childSitemaps.length
    ? childSitemaps.flatMap(loc => {
        const file = path.join(dist, new URL(loc).pathname.slice(1));
        if (!fs.existsSync(file)) {
          errors.push(`sitemap child missing from dist/: ${loc}`);
          return [];
        }
        return readXmlLocs(file);
      })
    : sitemapLocs;

  const pageByRoute = new Map(pages.map(page => [page.route, page]));
  const sitemapPaths = new Set();

  for (const loc of sitemapUrls) {
    let url;
    try {
      url = new URL(loc);
    } catch {
      errors.push(`sitemap contains invalid URL: ${loc}`);
      continue;
    }

    if (url.origin !== SITE_ORIGIN) errors.push(`sitemap URL has wrong origin: ${loc}`);
    const route = normalisePath(url.pathname);
    sitemapPaths.add(route);
    const page = pageByRoute.get(route);

    if (!page) {
      errors.push(`sitemap URL is not prerendered: ${route}`);
      continue;
    }
    if (page.isNoindex) errors.push(`sitemap URL is noindex: ${route}`);
    if (page.canonicalPath !== route) {
      errors.push(`sitemap URL canonicalises elsewhere: ${route} -> ${page.canonicalPath}`);
    }
  }

  for (const page of pages) {
    if (page.route === '/404.html') continue;
    if (!page.isNoindex && page.canonicalPath === page.route && !sitemapPaths.has(page.route)) {
      errors.push(`indexable canonical page missing from sitemap: ${page.route}`);
    }
  }
}

function validateDuplicateMetadata(pages) {
  const titleMap = new Map();
  const descriptionMap = new Map();

  for (const page of pages) {
    if (page.isNoindex || page.canonicalPath !== page.route) continue;
    if (page.title) titleMap.set(page.title, [...(titleMap.get(page.title) || []), page.route]);
    if (page.description) {
      descriptionMap.set(page.description, [...(descriptionMap.get(page.description) || []), page.route]);
    }
  }

  for (const [title, routes] of titleMap) {
    if (routes.length > 1) {
      errors.push(`duplicate title "${title}" on ${routes.slice(0, 6).join(', ')}`);
    }
  }

  for (const [description, routes] of descriptionMap) {
    if (routes.length > 1) {
      errors.push(`duplicate meta description "${description}" on ${routes.slice(0, 6).join(', ')}`);
    }
  }
}

function validateImages(route, html) {
  for (const tag of matchAll(html, /<img\b[^>]*>/gi)) {
    const src = attr(tag, 'src');
    if (attr(tag, 'alt') === null) errors.push(`${route}: image missing alt text (${src || 'no src'})`);
    if (src) validateLocalAsset(route, src, 'image');
  }

  for (const tag of matchAll(html, /<meta\b[^>]*property=["']og:image["'][^>]*>/gi)) {
    const image = attr(tag, 'content');
    if (!image) errors.push(`${route}: og:image missing content`);
    else validateLocalAsset(route, image, 'og:image');
  }
}

function validateInternalLinks(route, html) {
  for (const tag of matchAll(html, /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const href = decodeHtmlEntities(attr(tag, 'href') || '');
    if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) continue;

    let url;
    try {
      url = new URL(href, SITE_ORIGIN);
    } catch {
      errors.push(`${route}: invalid link href ${href}`);
      continue;
    }

    if (url.origin !== SITE_ORIGIN) continue;
    if (isAssetPath(url.pathname)) continue;

    const target = normalisePath(url.pathname);
    if (redirectMap.has(target)) {
      errors.push(`${route}: internal link points to redirected URL ${target} -> ${redirectMap.get(target)}`);
    } else if (!routeFiles.has(target)) {
      errors.push(`${route}: internal link target is not prerendered (${target})`);
    }
  }
}

function validateSponsoredLinks(route, html) {
  for (const tag of matchAll(html, /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const href = decodeHtmlEntities(attr(tag, 'href') || '');
    if (!/amazon\.co\.uk/i.test(href)) continue;

    const rel = (attr(tag, 'rel') || '').toLowerCase();
    if (!rel.includes('sponsored') || !rel.includes('nofollow')) {
      errors.push(`${route}: Amazon affiliate link missing sponsored/nofollow rel (${href})`);
    }
  }
}

function validateLocalAsset(route, value, label) {
  let url;
  try {
    url = new URL(decodeHtmlEntities(value), SITE_ORIGIN);
  } catch {
    errors.push(`${route}: invalid ${label} URL (${value})`);
    return;
  }

  if (url.origin !== SITE_ORIGIN) return;

  const cleanPath = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!fs.existsSync(path.join(dist, cleanPath))) {
    errors.push(`${route}: ${label} asset is missing (${url.pathname})`);
  }
}

function readXmlLocs(file) {
  const xml = fs.readFileSync(file, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => decodeHtmlEntities(match[1]));
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

function textContent(value) {
  return decodeHtmlEntities(String(value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
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

function normalisePath(value) {
  if (!value || value === '/') return '/';
  return `/${String(value).replace(/^\//, '').replace(/\/$/, '')}`;
}

function isAssetPath(value) {
  return (
    value.startsWith('/assets/') ||
    /\.(?:js|css|png|jpe?g|webp|gif|svg|ico|xml|json|txt|pdf|woff2?)$/i.test(value)
  );
}
