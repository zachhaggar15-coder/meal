#!/usr/bin/env node
// Site-wide numeric promise audit.
//
// Reads the prerendered articles and reports every place a stated numerical
// promise is contradicted by an example printed underneath it. Non-blocking by
// default so a noisy heuristic cannot stop a release; pass --strict to fail.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { findNumericContradictions, findCountPromises } from './lib/numericPromises.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const strict = process.argv.includes('--strict');

if (!fs.existsSync(dist)) {
  console.error('audit-numeric-promises: no dist/ — run the build first.');
  process.exit(1);
}

const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['assets', 'ssr', 'images', 'og'].includes(entry.name)) walk(full);
    } else if (entry.name === 'index.html') pages.push(full);
  }
})(dist);

const routeOf = file => ('/' + path.relative(dist, file).split(path.sep).join('/')
  .replace(/index[.]html$/, '').replace(/[/]$/, '')) || '/';

/** Splits rendered main content into reading-order blocks. */
function blocksOf(html) {
  const main = (/<main[^>]*>([\s\S]*?)<\/main>/i.exec(html) || [null, ''])[1];
  return main
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    // Block boundaries become separators so a promise and its examples stay
    // distinct lines rather than merging into one paragraph.
    // A section heading scopes the promises inside it: a lunch section's
    // "30–50 g of protein" must not still be governing the snack list further
    // down the page. Mark headings so the scanner can reset there.
    .replace(/<h[23][^>]*>/gi, '\n@@SECTION@@ ')
    .replace(/<\/(p|li|h[1-6]|td|th|div|section)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

const results = [];
let audited = 0;

for (const file of pages) {
  const route = routeOf(file);
  if (!route.startsWith('/blog/') && !route.startsWith('/meal-plans/') && !route.startsWith('/questions')) continue;
  audited += 1;

  const html = fs.readFileSync(file, 'utf8');
  const blocks = blocksOf(html);
  const contradictions = findNumericContradictions(blocks);
  if (contradictions.length) results.push({ route, contradictions });
}

console.log(`Numeric promise audit: ${audited} editorial pages checked.`);

if (!results.length) {
  console.log('No promise/example contradictions found.');
} else {
  const total = results.reduce((sum, item) => sum + item.contradictions.length, 0);
  console.log(`\n${total} contradiction(s) across ${results.length} page(s):\n`);
  for (const { route, contradictions } of results) {
    console.log(`  ${route}`);
    for (const finding of contradictions) {
      console.log(`    promise: ${finding.promise}`);
      console.log(`    example: ${finding.example}`);
    }
    console.log('');
  }
}

// Count promises are reported for review rather than asserted, because "30
// ideas" can legitimately be satisfied by variations the parser cannot count.
const countReport = [];
for (const file of pages) {
  const route = routeOf(file);
  if (!route.startsWith('/blog/')) continue;
  const html = fs.readFileSync(file, 'utf8');
  const heading = (/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html) || [])[1];
  if (!heading) continue;
  const promises = findCountPromises(heading.replace(/<[^>]+>/g, ''));
  if (promises.length) countReport.push({ route, promises });
}
if (countReport.length) {
  console.log(`${countReport.length} page(s) make a count promise in the H1 (review only):`);
  for (const { route, promises } of countReport.slice(0, 20)) {
    console.log(`  ${route} — ${promises.map(p => p.source).join(', ')}`);
  }
}

const reportPath = path.join(root, 'audit-artifacts', 'numeric-promises.json');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({ audited, results, countReport }, null, 2));
console.log(`\nReport: ${reportPath}`);

if (strict && results.length) {
  console.error('\nPromise/example contradictions found. Fix the copy or the examples.');
  process.exit(1);
}
