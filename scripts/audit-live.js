import { writeAuditJson } from './lib/auditOutput.js';

const baseUrl = normaliseBaseUrl(process.argv[2] || process.env.AUDIT_BASE_URL);
if (!baseUrl) {
  console.error('Usage: npm run audit:live -- https://www.mealprep.org.uk');
  process.exit(1);
}

const startedAt = Date.now();
const sitemapIndexUrl = new URL('/sitemap.xml', baseUrl).href;
const sitemapUrls = await discoverSitemapUrls(sitemapIndexUrl);
const pageUrls = [...new Set((await Promise.all(sitemapUrls.map(readUrlSet))).flat())].sort();
const pages = new Array(pageUrls.length);
let cursor = 0;
const workerCount = Math.min(16, pageUrls.length);

await Promise.all(Array.from({ length: workerCount }, async () => {
  while (cursor < pageUrls.length) {
    const index = cursor;
    cursor += 1;
    pages[index] = await inspectPage(pageUrls[index]);
  }
}));

const errors = pages.flatMap(page => page.errors.map(error => `${page.url}: ${error}`));
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  elapsedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(2)),
  coverage: {
    sitemapFiles: sitemapUrls.length,
    canonicalUrls: pageUrls.length,
    fetchedPages: pages.length,
    exhaustive: pages.length === pageUrls.length,
  },
  thresholds: {
    responseStatus: 200,
    redirectChain: 0,
    selfCanonical: true,
    robotsNoindex: false,
    title: 'present',
    h1: 'present',
    main: 'present',
  },
  errors,
  pages,
};
const reportPath = writeAuditJson('live-canonical-crawl.json', report);

if (errors.length) {
  console.error(`Live audit failed with ${errors.length} issue(s).`);
  errors.slice(0, 80).forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Live audit passed for ${pages.length.toLocaleString('en-GB')} canonical URLs ` +
  `in ${report.elapsedSeconds}s. Report: ${reportPath}`,
);

async function discoverSitemapUrls(url) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  const xml = await response.text();
  const locations = extractLocations(xml);
  return /<sitemapindex\b/i.test(xml) ? locations : [url];
}

async function readUrlSet(url) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return extractLocations(await response.text());
}

async function inspectPage(url) {
  try {
    const response = await fetchWithTimeout(url);
    const html = await response.text();
    const canonical = extractAttribute(html, /<link\b[^>]*\brel=["'][^"']*\bcanonical\b[^"']*["'][^>]*>/i, 'href');
    const robots = extractAttribute(html, /<meta\b[^>]*\bname=["']robots["'][^>]*>/i, 'content');
    const errors = [];
    if (response.status !== 200) errors.push(`returned ${response.status}`);
    if (response.redirected) errors.push(`redirected to ${response.url}`);
    if (!canonical) errors.push('missing canonical');
    else if (normalisePageUrl(canonical) !== normalisePageUrl(url)) {
      errors.push(`canonical is ${canonical}`);
    }
    if (/\bnoindex\b/i.test(robots || '')) errors.push(`robots is ${robots}`);
    if (!/<title\b[^>]*>[\s\S]*?\S[\s\S]*?<\/title>/i.test(html)) errors.push('missing title');
    if (!/<h1\b[^>]*>[\s\S]*?\S[\s\S]*?<\/h1>/i.test(html)) errors.push('missing H1');
    if (!/<main\b[^>]*>[\s\S]*?\S/i.test(html)) errors.push('missing main content');
    return {
      url,
      status: response.status,
      finalUrl: response.url,
      canonical,
      robots,
      bytes: Buffer.byteLength(html),
      errors,
    };
  } catch (error) {
    return {
      url,
      status: null,
      finalUrl: null,
      canonical: null,
      robots: null,
      bytes: 0,
      errors: [error.message],
    };
  }
}

async function fetchWithTimeout(url) {
  return fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'MealPrep.org.uk release audit',
      accept: 'text/html,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(20_000),
  });
}

function extractLocations(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map(match => decodeXml(match[1].trim()));
}

function extractAttribute(html, tagPattern, attribute) {
  const tag = html.match(tagPattern)?.[0];
  if (!tag) return null;
  return tag.match(new RegExp(`\\b${attribute}=["']([^"']+)["']`, 'i'))?.[1] || null;
}

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function normaliseBaseUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

function normalisePageUrl(value) {
  try {
    const url = new URL(value);
    const pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
    return `${url.protocol}//${url.host}${pathname}`;
  } catch {
    return value;
  }
}
