// Collects every outbound Amazon link the site actually ships.
//
// We read the prerendered HTML in dist/ rather than the source data modules
// because that is the ground truth: links are assembled by helpers
// (amazonProductUrl in containerProducts.js / mealPrepProducts.js) and by
// hand in offers.js and the blog corpus, so only the rendered output tells us
// what a visitor can really click.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const distRoot = path.join(projectRoot, 'dist');

// Marketplaces we know how to reach on the Product Advertising API. The site is
// amazon.co.uk only today; the rest are here so a new market fails loudly at
// the link collector rather than silently skipping the stock check.
export const MARKETPLACES = {
  'www.amazon.co.uk': { host: 'webservices.amazon.co.uk', region: 'eu-west-1', marketplace: 'www.amazon.co.uk' },
  'www.amazon.com': { host: 'webservices.amazon.com', region: 'us-east-1', marketplace: 'www.amazon.com' },
  'www.amazon.de': { host: 'webservices.amazon.de', region: 'eu-west-1', marketplace: 'www.amazon.de' },
  'www.amazon.fr': { host: 'webservices.amazon.fr', region: 'eu-west-1', marketplace: 'www.amazon.fr' },
  'www.amazon.it': { host: 'webservices.amazon.it', region: 'eu-west-1', marketplace: 'www.amazon.it' },
  'www.amazon.es': { host: 'webservices.amazon.es', region: 'eu-west-1', marketplace: 'www.amazon.es' },
};

const AMAZON_HOST = /^(?:[a-z0-9-]+\.)*amazon\.[a-z]{2,3}(?:\.[a-z]{2})?$/i;
const SHORTENER_HOST = /^amzn\.(?:to|eu|com)$/i;

// /dp/B0DN32KNK3, /gp/product/B0DN32KNK3, /product/B0DN32KNK3 and the
// /-/en/dp/... localised variant all carry the same 10-character ASIN.
const ASIN_PATTERN = /\/(?:dp|gp\/product|gp\/aw\/d|product)\/([A-Z0-9]{10})(?:[/?#]|$)/;

export function extractAsin(url) {
  return ASIN_PATTERN.exec(url)?.[1] ?? null;
}

export function classifyHost(hostname) {
  if (SHORTENER_HOST.test(hostname)) return 'shortener';
  if (AMAZON_HOST.test(hostname)) return 'amazon';
  return null;
}

// Collect Amazon hrefs from every prerendered page, keyed by the canonical
// product URL so one dead ASIN reports once with the full list of pages that
// link to it.
export function collectAmazonLinks({ dir = distRoot } = {}) {
  if (!fs.existsSync(dir)) {
    throw new Error(`${path.relative(projectRoot, dir) || dir}/ is missing. Run npm run build first.`);
  }

  const htmlFiles = findHtmlFiles(dir).filter(file => !path.relative(dir, file).startsWith(`ssr${path.sep}`));
  assertBuildIsComplete(dir, htmlFiles.length);
  const byUrl = new Map();

  for (const file of htmlFiles) {
    const route = routeFromFile(file, dir);
    const html = fs.readFileSync(file, 'utf8');

    for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
      const href = decodeEntities(match[1]).trim();
      if (!/amazon|amzn/i.test(href)) continue;

      let url;
      try {
        url = new URL(href);
      } catch {
        continue;
      }
      if (!/^https?:$/.test(url.protocol)) continue;

      const kind = classifyHost(url.hostname);
      if (!kind) continue;

      // Strip the fragment so /dp/X#reviews and /dp/X are one entry, but keep
      // the query: the affiliate tag lives there and we want to report it.
      url.hash = '';
      const canonical = url.toString();
      let entry = byUrl.get(canonical);
      if (!entry) {
        entry = {
          url: canonical,
          hostname: url.hostname,
          kind,
          asin: kind === 'amazon' ? extractAsin(url.pathname) : null,
          tag: url.searchParams.get('tag'),
          occurrences: 0,
          routes: [],
        };
        byUrl.set(canonical, entry);
      }
      entry.occurrences += 1;
      if (!entry.routes.includes(route)) entry.routes.push(route);
    }
  }

  const links = [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url));
  for (const link of links) link.routes.sort();

  return { links, pageCount: htmlFiles.length };
}

// Group links by the ASIN we will ask Amazon about. Links with no ASIN
// (shorteners, search or storefront URLs) come back under a null key so the
// caller can route them to the reachability probe instead.
export function groupByAsin(links) {
  const byAsin = new Map();
  const withoutAsin = [];
  for (const link of links) {
    if (!link.asin) {
      withoutAsin.push(link);
      continue;
    }
    const key = `${link.hostname}|${link.asin}`;
    if (!byAsin.has(key)) byAsin.set(key, { hostname: link.hostname, asin: link.asin, links: [] });
    byAsin.get(key).links.push(link);
  }
  return { byAsin: [...byAsin.values()], withoutAsin };
}

// A prerender in progress leaves dist/ holding a fraction of its pages while the
// previous sitemap is still on disk. Scanning that reports a subset of the
// site's links as if it were the whole site, so the report would claim
// "exhaustive" over a partial crawl and could miss a dead link entirely.
// Refuse to run rather than produce a confidently wrong artifact.
export function assertBuildIsComplete(dir, htmlFileCount) {
  const sitemapUrlCount = countSitemapUrls(dir);

  // The build writes the sitemap last, so a dist/ without one has not finished.
  if (sitemapUrlCount === null) {
    throw new Error(
      `dist/ has no sitemap, so the build has not finished (${htmlFileCount} HTML file(s) so far). `
      + 'Wait for the build to complete, then re-run.',
    );
  }

  if (htmlFileCount < sitemapUrlCount) {
    throw new Error(
      `dist/ looks mid-build: ${htmlFileCount} HTML file(s) present but the sitemap lists `
      + `${sitemapUrlCount} URL(s). Wait for the build to finish, then re-run.`,
    );
  }
}

function countSitemapUrls(dir) {
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter(name => /^sitemap.*\.xml$/i.test(name))
    : [];
  if (!files.length) return null;

  const locations = new Set();
  for (const name of files) {
    const xml = fs.readFileSync(path.join(dir, name), 'utf8');
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
      const value = match[1].trim();
      // The sitemap index points at the other sitemap files; those are not pages.
      if (!/\/sitemap[^/]*\.xml$/i.test(value)) locations.add(value);
    }
  }
  return locations.size || null;
}

function findHtmlFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findHtmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function routeFromFile(file, dir) {
  const rel = path.relative(dir, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`;
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&#x26;/gi, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
