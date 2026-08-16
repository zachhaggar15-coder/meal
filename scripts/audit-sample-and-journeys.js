// A random sample of the finished site, and journeys walked through it.
//
// Every other audit here targets a defect class someone already found. This one
// exists to catch what nobody thought to look for: it picks pages at random
// across every public page class, scores them against signals that describe a
// page being genuinely useful rather than merely valid, and then walks real
// journeys by following the links the pages actually contain.
//
// Sampling is seeded so a run is reproducible and cannot be quietly re-rolled
// until it looks good.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visibleText } from './audit-rendered-corpus.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

/** Deterministic PRNG so the sample is reproducible from the seed alone. */
function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const CLASSES = [
  [/^\/plans\/[^/]+\/$/, 'generated plan'],
  [/^\/meal-plan\/[^/]+\/$/, 'legacy plan'],
  [/^\/meal-plans\/[^/]+\/$/, 'hub'],
  [/^\/blog\/[^/]+\/$/, 'editorial'],
  [/^\/browse(?:\/page\/\d+)?\/$/, 'browse'],
  [/^\/meal-prep-(?:containers|accessories|stickers)/, 'affiliate/container'],
  [/^\/(?:quiz|tools|saved-plans|feedback|about|methodology|privacy|contact)\/$/, 'app/other'],
  [/^\/[^/]+\/$/, 'app/other'],
];

function classify(route) {
  for (const [re, name] of CLASSES) if (re.test(route)) return name;
  return 'app/other';
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name === 'index.html') files.push(full);
  }
  return files;
}

function routeOf(file) {
  return `/${path.relative(DIST, file).split(path.sep).join('/').replace(/index\.html$/, '')}`;
}

// ── Page scoring ────────────────────────────────────────────────────────────
//
// Deductions describe a page failing the reader, not failing a validator. A
// page with a title, a heading, real body text, working internal links and no
// contradiction is Excellent; each real problem costs it.
// Utility routes are thin and chrome-less on purpose: /admin/ is a noindex
// password gate, /404/ is the error page. Both are excluded from the content
// ratings and reported separately rather than silently dropped, so the sample
// cannot be cleaned up by quietly widening this list.
const UTILITY_ROUTES = new Set(['/admin/', '/404/']);

function scorePage(route, html) {
  const text = visibleText(html);
  const issues = [];
  if (UTILITY_ROUTES.has(route)) {
    return { route, rating: 'Utility (excluded)', issues: [], bodyLength: text.length };
  }

  const title = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] || '';
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
  const description = /<meta[^>]+name="description"[^>]+content="([^"]*)"/i.exec(html)?.[1] || '';

  if (!title || title.length < 12) issues.push({ severity: 'major', note: 'missing or stub title' });
  if (!h1) issues.push({ severity: 'major', note: 'no h1' });
  if (!description || description.length < 50) issues.push({ severity: 'review', note: 'thin meta description' });
  if (!/<footer|site-footer/i.test(html)) issues.push({ severity: 'major', note: 'no footer' });
  if (!/rel="canonical"/i.test(html)) issues.push({ severity: 'review', note: 'no canonical' });

  // Body substance. Nav and footer alone run to roughly 300 characters.
  const bodyLength = text.length;
  if (bodyLength < 1200) issues.push({ severity: 'major', note: `very thin body (${bodyLength} chars)` });
  else if (bodyLength < 2200) issues.push({ severity: 'review', note: `thin body (${bodyLength} chars)` });

  // Signs of a broken render rather than a thin one.
  if (/\[object Object\]|\bundefined\b|\bNaN\b|\$\{/.test(text)) {
    issues.push({ severity: 'major', note: 'unrendered value in visible text' });
  }
  if (/\ba (?:Aldi|Asda|Iceland|Ocado|anti-inflammatory)\b|\bthe (?:a|an) \b/.test(text)) {
    issues.push({ severity: 'review', note: 'article/determiner error' });
  }
  if (/\b([A-Za-z]{4,})\s+\1\b/.test(text.replace(/Accessories Accessories|Containers Containers/g, ''))) {
    issues.push({ severity: 'review', note: 'doubled word' });
  }

  // Does the h1 bear any relation to the title? A page whose heading and tab
  // name share nothing is usually a template wired to the wrong data.
  if (title && h1) {
    const words = (s) => new Set(s.toLowerCase().match(/[a-z]{4,}/g) || []);
    const titleWords = words(title);
    const shared = [...words(h1)].filter(w => titleWords.has(w));
    if (titleWords.size >= 2 && shared.length === 0) {
      issues.push({ severity: 'review', note: `h1 unrelated to title ("${h1}" vs "${title}")` });
    }
  }

  const majors = issues.filter(i => i.severity === 'major').length;
  const reviews = issues.filter(i => i.severity === 'review').length;
  let rating;
  if (majors > 0) rating = 'Major';
  else if (reviews > 1) rating = 'Needs Review';
  else if (reviews === 1) rating = 'Good';
  else rating = 'Excellent';

  return { route, rating, issues, bodyLength };
}

// ── Journeys ────────────────────────────────────────────────────────────────
//
// A journey is a real path a reader can take: start on an entry page, follow an
// internal link it actually renders, then follow another. Each hop must resolve
// to a page the build serves. This is what page-level testing misses — every
// destination existed while the control that led there promised something else.
function internalLinks(html) {
  const links = [];
  const re = /<a[^>]+href="(\/[^"#?]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(html))) {
    const href = match[1].endsWith('/') ? match[1] : `${match[1]}/`;
    const label = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (label) links.push({ href, label });
  }
  return links;
}

if (!fs.existsSync(DIST)) {
  console.error('audit-sample-and-journeys: no dist/. Build first.');
  process.exit(1);
}

const files = walk(DIST);
const served = new Set(files.map(routeOf));
const byClass = new Map();
for (const file of files) {
  const route = routeOf(file);
  const cls = classify(route);
  if (!byClass.has(cls)) byClass.set(cls, []);
  byClass.get(cls).push({ route, file });
}

const SEED = Number(process.argv.find(a => a.startsWith('--seed='))?.split('=')[1] || 20260816);
const random = makeRandom(SEED);

// Quotas across the required mix; the sample must not be all plan pages just
// because there are 1,059 of them.
const QUOTA = {
  'generated plan': 22,
  'editorial': 20,
  'hub': 12,
  'legacy plan': 6,
  'browse': 6,
  'affiliate/container': 6,
  'app/other': 6,
};

const sample = [];
for (const [cls, wanted] of Object.entries(QUOTA)) {
  const pool = [...(byClass.get(cls) || [])];
  const take = Math.min(wanted, pool.length);
  for (let i = 0; i < take; i += 1) {
    const idx = Math.floor(random() * pool.length);
    sample.push({ cls, ...pool.splice(idx, 1)[0] });
  }
}

const results = sample.map(({ cls, route, file }) => ({
  cls, ...scorePage(route, fs.readFileSync(file, 'utf8')),
}));

const tally = results.reduce((acc, r) => { acc[r.rating] = (acc[r.rating] || 0) + 1; return acc; }, {});

console.log(`Unseen-URL sample (seed ${SEED}): ${results.length} URLs`);
for (const [cls, wanted] of Object.entries(QUOTA)) {
  const got = results.filter(r => r.cls === cls).length;
  console.log(`  ${cls}: ${got}/${wanted}`);
}
const utility = results.filter(r => r.rating === 'Utility (excluded)');
console.log(`  content pages rated: ${results.length - utility.length}`
  + ` (utility excluded: ${utility.map(u => u.route).join(', ') || 'none'})`);
console.log(`  Excellent=${tally.Excellent || 0} Good=${tally.Good || 0} `
  + `NeedsReview=${tally['Needs Review'] || 0} Major=${tally.Major || 0}`);
for (const r of results.filter(r => r.rating === 'Major' || r.rating === 'Needs Review')) {
  console.log(`  ${r.rating}: ${r.route}`);
  for (const issue of r.issues) console.log(`      - [${issue.severity}] ${issue.note}`);
}

// Journeys: 3 hops from a spread of entry points.
const ENTRY_CLASSES = ['app/other', 'browse', 'hub', 'editorial', 'generated plan', 'affiliate/container'];
const journeys = [];
const journeyRandom = makeRandom(SEED + 7);
let attempts = 0;
while (journeys.length < 52 && attempts < 400) {
  attempts += 1;
  const cls = ENTRY_CLASSES[Math.floor(journeyRandom() * ENTRY_CLASSES.length)];
  const pool = byClass.get(cls) || [];
  if (!pool.length) continue;
  const start = pool[Math.floor(journeyRandom() * pool.length)];

  const hops = [{ route: start.route, label: '(entry)' }];
  let current = start;
  let broken = null;
  for (let depth = 0; depth < 3; depth += 1) {
    const html = fs.readFileSync(current.file, 'utf8');
    const links = internalLinks(html).filter(l => !hops.some(h => h.route === l.href));
    if (!links.length) break;
    const chosen = links[Math.floor(journeyRandom() * links.length)];
    if (!served.has(chosen.href)) {
      broken = `${chosen.href} (from "${chosen.label}")`;
      hops.push({ route: chosen.href, label: chosen.label, broken: true });
      break;
    }
    const nextFile = files.find(f => routeOf(f) === chosen.href);
    hops.push({ route: chosen.href, label: chosen.label });
    current = { route: chosen.href, file: nextFile };
  }
  if (hops.length < 2) continue;
  journeys.push({ entryClass: cls, hops, broken });
}

const brokenJourneys = journeys.filter(j => j.broken);
console.log(`\nJourneys walked: ${journeys.length} (3 hops max, links followed as rendered)`);
const entryTally = journeys.reduce((acc, j) => { acc[j.entryClass] = (acc[j.entryClass] || 0) + 1; return acc; }, {});
console.log(`  entry points: ${Object.entries(entryTally).map(([k, v]) => `${k}=${v}`).join(', ')}`);
console.log(`  total hops: ${journeys.reduce((n, j) => n + j.hops.length, 0)}`);
console.log(`  journeys hitting an unserved route: ${brokenJourneys.length}`);
for (const j of brokenJourneys.slice(0, 10)) {
  console.log(`    ${j.hops.map(h => h.route).join(' -> ')}  BROKEN: ${j.broken}`);
}

const OUT = path.join(ROOT, 'audit-artifacts', 'sample-and-journeys.json');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ seed: SEED, results, journeys }, null, 2));
console.log(`\nReport: ${OUT}`);

const failed = results.filter(r => r.rating === 'Major').length + brokenJourneys.length;
if (process.argv.includes('--strict') && failed) process.exit(1);
