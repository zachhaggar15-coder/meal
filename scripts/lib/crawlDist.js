import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE_ORIGIN = 'https://www.mealprep.org.uk';
export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const distRoot = path.join(projectRoot, 'dist');

export function crawlDist() {
  if (!fs.existsSync(distRoot)) throw new Error('dist/ is missing. Run npm run build first.');
  const redirects = JSON.parse(fs.readFileSync(path.join(projectRoot, 'vercel.json'), 'utf8')).redirects || [];
  const redirectMap = new Map(redirects.map(rule => [normalisePath(rule.source), normalisePath(rule.destination)]));
  const htmlFiles = findHtmlFiles(distRoot).filter(file => !path.relative(distRoot, file).startsWith(`ssr${path.sep}`));
  const routeFiles = new Map(htmlFiles.map(file => [routeFromFile(file), file]));
  const sitemapPaths = readSitemapPaths();
  const pages = htmlFiles.map(file => parsePage(file, routeFiles, redirectMap, sitemapPaths));
  const incoming = new Map(pages.map(page => [page.route, 0]));

  for (const page of pages) {
    for (const link of page.internalLinks) {
      if (incoming.has(link.target)) incoming.set(link.target, incoming.get(link.target) + 1);
    }
  }
  for (const page of pages) page.incomingLinkCount = incoming.get(page.route) || 0;

  return { pages, routeFiles, redirectMap, sitemapPaths };
}

function parsePage(file, routeFiles, redirectMap, sitemapPaths) {
  const route = routeFromFile(file);
  const html = fs.readFileSync(file, 'utf8');
  const title = textContent(match(html, /<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  const description = attr(match(html, /<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0], 'content');
  const canonical = attr(match(html, /<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0], 'href')
    || attr(match(html, /<link\b[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/i)?.[0], 'href');
  const canonicalPath = canonical ? normalisePath(new URL(canonical, SITE_ORIGIN).pathname) : null;
  const robots = attr(match(html, /<meta\b[^>]*name=["']robots["'][^>]*>/i)?.[0], 'content') || '';
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(item => textContent(item[1]));
  const internalLinks = [];
  const outgoing = new Set();

  for (const item of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const href = decode(item[1]);
    if (!href || href.startsWith('#') || /^(?:mailto|tel|javascript):/i.test(href)) continue;
    let url;
    try {
      url = new URL(href, SITE_ORIGIN);
    } catch {
      internalLinks.push({ href, target: null, status: 'invalid' });
      continue;
    }
    if (url.origin !== SITE_ORIGIN) continue;
    if (/\.[a-z0-9]{2,6}$/i.test(url.pathname)) continue;
    const target = normalisePath(url.pathname);
    outgoing.add(target);
    internalLinks.push({
      href,
      target,
      status: redirectMap.has(target)
        ? 'redirect'
        : routeFiles.has(target) ? 'ok' : 'broken',
      redirectTarget: redirectMap.get(target) || null,
    });
  }

  const structuredDataTypes = [];
  for (const item of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      collectTypes(JSON.parse(decode(item[1])), structuredDataTypes);
    } catch {
      structuredDataTypes.push('INVALID_JSON_LD');
    }
  }
  const mainHtml = match(html, /<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html;
  const mainText = textContent(
    mainHtml
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' '),
  );

  return {
    route,
    file: path.relative(distRoot, file).split(path.sep).join('/'),
    status: 200,
    redirectChain: [],
    canonical,
    canonicalPath,
    indexable: !/\bnoindex\b/i.test(robots) && canonicalPath === route,
    robots,
    sitemapIncluded: sitemapPaths.has(route),
    h1: h1s[0] || '',
    h1Count: h1s.length,
    title,
    description,
    mainContentPresent: mainText.length >= 100,
    wordCount: mainText.split(/\s+/).filter(Boolean).length,
    contentFingerprint: hashText(mainText),
    incomingLinkCount: 0,
    outgoingLinkCount: outgoing.size,
    internalLinks,
    structuredDataTypes: [...new Set(structuredDataTypes)].sort(),
    mobileRenderability: 'prerendered responsive template; browser-verified separately',
    nutritionClaims: [...new Set(mainText.match(/\b\d{2,4}\s*(?:kcal|calories|g protein)\b/gi) || [])],
  };
}

function readSitemapPaths() {
  const indexPath = path.join(distRoot, 'sitemap.xml');
  if (!fs.existsSync(indexPath)) return new Set();
  const locs = readXmlLocs(indexPath);
  const childLocs = locs.filter(loc => loc.endsWith('.xml'));
  const urls = childLocs.length
    ? childLocs.flatMap(loc => readXmlLocs(path.join(distRoot, new URL(loc).pathname.slice(1))))
    : locs;
  return new Set(urls.map(loc => normalisePath(new URL(loc).pathname)));
}

function readXmlLocs(file) {
  if (!fs.existsSync(file)) return [];
  return [...fs.readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(item => decode(item[1]));
}

function collectTypes(value, types) {
  if (!value || typeof value !== 'object') return;
  if (value['@type']) types.push(...(Array.isArray(value['@type']) ? value['@type'] : [value['@type']]));
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) child.forEach(item => collectTypes(item, types));
    else collectTypes(child, types);
  }
}

function findHtmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

function routeFromFile(file) {
  const relative = path.relative(distRoot, file).split(path.sep).join('/');
  if (relative === 'index.html') return '/';
  if (relative === '404.html') return '/404.html';
  return `/${relative.replace(/\/index\.html$/, '')}`;
}

function attr(tag, name) {
  return tag?.match(new RegExp(`${name}=["']([^"']*)`, 'i'))?.[1] ? decode(tag.match(new RegExp(`${name}=["']([^"']*)`, 'i'))[1]) : null;
}

function match(value, pattern) {
  return String(value || '').match(pattern);
}

function textContent(value) {
  return decode(String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function decode(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function normalisePath(value) {
  if (!value || value === '/') return '/';
  return `/${String(value).replace(/^\//, '').replace(/\/$/, '')}`;
}

function hashText(value) {
  let hash = 2166136261;
  for (const char of String(value || '').toLowerCase()) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
