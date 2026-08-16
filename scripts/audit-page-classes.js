// Do equivalent pages carry equivalent furniture?
//
// This site has repeatedly ended up with two implementations of one concept —
// generated plans beside legacy plans, a chooser beside a hub — and the second
// one quietly misses whatever the first one gained. That is how 90 pages ended
// up with no footer, and how the routing defect survived page-level tests.
//
// So rather than checking any single page, this groups the built corpus into
// classes and reports members that lack something the rest of their class has.
// A "class marker" here is a shared element the class agreed on: a footer, a
// byline, a disclosure, an allergen note. The test is relative — 100% of the
// class or a named exception — so it keeps working as the site grows.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

/** Route → page class. Order matters: first match wins. */
const CLASSES = [
  [/^\/plans\/[^/]+\/$/, 'generated-plan'],
  [/^\/meal-plan\/[^/]+\/$/, 'legacy-plan'],
  [/^\/meal-plans\/[^/]+\/$/, 'supermarket-or-goal-hub'],
  [/^\/blog\/[^/]+\/$/, 'editorial'],
  [/^\/browse\/page\/\d+\/$/, 'browse-page'],
  [/^\/meal-prep-containers(?:\/[^/]+)?\/$/, 'container-page'],
  [/^\/(?:quiz|tools|browse|saved-plans)\/$/, 'app-page'],
  // The choosers are the class that produced the routing defect, so they are
  // the last class that should be missing from a consistency check.
  [/^\/choose-(?:plan|supermarket|calories|diet)\/[^/]+\/$/, 'chooser'],
  [/^\/(?:blog|meal-plans|meal-prep-accessories)\/$/, 'index-page'],
];

/** Structural markers, as they appear in the prerendered HTML. */
const MARKERS = {
  footer: /<footer|class="site-footer/i,
  nav: /class="site-nav|Main navigation/i,
  canonical: /<link[^>]+rel="canonical"/i,
  // react-helmet stamps data-rh on the tag, so the attribute must be allowed.
  title: /<title[^>]*>[^<]{10,}<\/title>/i,
  metaDescription: /<meta[^>]+name="description"[^>]+content="[^"]{30,}/i,
  h1: /<h1[^>]*>/i,
  jsonLd: /application\/ld\+json/i,
  // Visible byline only. Matching the editorial-team string anywhere also hit
  // the JSON-LD review author, which made the container hub look like it had
  // lost a byline when it simply has no product review schema.
  byline: /Written by/i,
  allergenNote: /allergen|Allergens/i,
  storageNote: /store it|storage|fridge for|freezer/i,
  affiliateDisclosure: /Amazon Associate I earn|Sponsored #ad/i,
};

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name === 'index.html') files.push(full);
  }
  return files;
}

function classify(route) {
  for (const [pattern, name] of CLASSES) if (pattern.test(route)) return name;
  return null;
}

if (!fs.existsSync(DIST)) {
  console.error('audit-page-classes: no dist/. Build first.');
  process.exit(1);
}

const groups = new Map();
for (const file of walk(DIST)) {
  const route = `/${path.relative(DIST, file).split(path.sep).join('/').replace(/index\.html$/, '')}`;
  const pageClass = classify(route);
  if (!pageClass) continue;
  const html = fs.readFileSync(file, 'utf8');
  const present = {};
  for (const [marker, re] of Object.entries(MARKERS)) present[marker] = re.test(html);
  if (!groups.has(pageClass)) groups.set(pageClass, []);
  groups.get(pageClass).push({ route, present });
}

// A marker "belongs" to a class when most of the class has it. Anything below
// the threshold is the class's own choice; anything above it with stragglers is
// drift.
const BELONGS_THRESHOLD = 0.9;
const drift = [];

console.log('Page-class consistency');
for (const [pageClass, members] of [...groups].sort()) {
  const counts = {};
  for (const marker of Object.keys(MARKERS)) {
    counts[marker] = members.filter(m => m.present[marker]).length;
  }
  const expected = Object.keys(MARKERS)
    .filter(marker => counts[marker] / members.length >= BELONGS_THRESHOLD);
  const incomplete = expected.filter(marker => counts[marker] < members.length);

  console.log(`  ${pageClass}: ${members.length} pages`);
  console.log(`    shared: ${expected.join(', ') || '(none)'}`);
  for (const marker of incomplete) {
    const missing = members.filter(m => !m.present[marker]).map(m => m.route);
    console.log(`    DRIFT ${marker}: ${missing.length} of ${members.length} missing`);
    for (const route of missing.slice(0, 5)) console.log(`      ${route}`);
    drift.push({ pageClass, marker, missing });
  }
}

const OUT = path.join(ROOT, 'audit-artifacts', 'page-classes.json');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ groups: [...groups].map(([k, v]) => [k, v.length]), drift }, null, 2));
console.log(`\n${drift.length} drift finding(s). Report: ${OUT}`);
if (process.argv.includes('--strict') && drift.length) process.exit(1);
