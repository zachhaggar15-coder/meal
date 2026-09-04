import fs from 'node:fs';
import path from 'node:path';

const SITE_ORIGIN = 'https://www.mealprep.org.uk';
const STRICT_HOST_SUFFIXES = [
  'ahrefs.com',
  'food.gov.uk',
  'gov.uk',
  'ico.org.uk',
  'nhs.uk',
  'ons.gov.uk',
];
const AMAZON_HOST = /(?:^|\.)(?:amazon\.[a-z.]+|amzn\.to)$/i;

export function isStrictSource(hostname) {
  const host = String(hostname || '').toLowerCase();
  return STRICT_HOST_SUFFIXES.some(suffix => host === suffix || host.endsWith(`.${suffix}`));
}

export function classifyExternalResponse(status) {
  if (status >= 200 && status < 400) return 'healthy';
  if (status === 401 || status === 403 || status === 429) return 'blocked';
  if (status === 404 || status === 410) return 'dead';
  return 'unknown';
}

export function collectExternalLinks(distRoot) {
  if (!fs.existsSync(distRoot)) throw new Error('dist/ is missing. Run npm run build first.');

  const links = new Map();
  for (const file of findHtmlFiles(distRoot)) {
    const relative = path.relative(distRoot, file);
    if (relative.startsWith(`ssr${path.sep}`)) continue;
    const route = routeFromFile(relative);
    const html = fs.readFileSync(file, 'utf8');

    for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
      const href = decode(match[1]);
      if (!/^https?:\/\//i.test(href)) continue;

      let url;
      try {
        url = new URL(href);
      } catch {
        continue;
      }
      if (url.origin === SITE_ORIGIN || AMAZON_HOST.test(url.hostname)) continue;

      url.hash = '';
      const key = url.href;
      if (!links.has(key)) {
        links.set(key, {
          url: key,
          hostname: url.hostname,
          strict: isStrictSource(url.hostname),
          pages: new Set(),
        });
      }
      links.get(key).pages.add(route);
    }
  }

  return [...links.values()]
    .map(link => ({ ...link, pages: [...link.pages].sort() }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

function findHtmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(file);
    return entry.isFile() && entry.name.endsWith('.html') ? [file] : [];
  });
}

function routeFromFile(relative) {
  const normalised = relative.split(path.sep).join('/');
  if (normalised === 'index.html') return '/';
  return `/${normalised.replace(/\/index\.html$/, '')}`;
}

function decode(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");
}
