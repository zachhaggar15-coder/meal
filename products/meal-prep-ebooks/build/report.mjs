// Generates the build report from the assembled books, so every figure in it is
// read from the same objects the PDFs were rendered from rather than retyped.

import { assemble } from './assemble.mjs';
import { runQa } from './qa.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUGS = ['aldi-budget', 'aldi-high-protein', 'lidl-budget', 'lidl-high-protein'];

const rows = [];
for (const slug of SLUGS) {
  const { default: def } = await import(pathToFileURL(path.join(ROOT, 'books', slug, 'index.mjs')).href);
  const book = assemble(def);
  const qa = runQa(book);

  // Page count comes from the render log rather than by re-opening the PDF, so
  // this script needs no dependency outside the repo.
  let pages = null;
  try {
    const log = readFileSync(path.join(ROOT, 'dist', 'qa', `${slug}.qa.txt`), 'utf8');
    pages = Number((log.match(/(\d+) pages ->/) || [])[1]) || null;
  } catch { /* not rendered yet */ }

  const dinnerCounts = new Map();
  for (const w of book.weeks) for (const d of w.days) dinnerCounts.set(d.dinner.id, (dinnerCounts.get(d.dinner.id) || 0) + 1);

  rows.push({
    slug,
    store: book.store,
    plan: book.planType,
    pages,
    recipes: Object.keys(book.meals).length,
    uniqueDinners: dinnerCounts.size,
    repeatedDinners: [...dinnerCounts.values()].filter((n) => n > 1).length,
    onceOnly: [...dinnerCounts.values()].filter((n) => n === 1).length,
    meanKcal: Math.round(qa.summary.meanKcal),
    minKcal: qa.summary.minDayKcal,
    maxKcal: qa.summary.maxDayKcal,
    meanProtein: Math.round(qa.summary.meanProtein),
    proteinPct: qa.summary.proteinEnergyPercent.toFixed(1),
    tier: `${book.cost.tier} — ${book.cost.range}`,
    unresolved: qa.checks.find((c) => c.id === 'G').failures.length,
    shopFails: qa.checks.find((c) => c.id === 'E').failures.length,
    leftoverFails: qa.checks.find((c) => c.id === 'F').failures.length,
    critical: qa.criticalFailures,
    checks: qa.checks.map((c) => `${c.id}:${c.pass ? 'pass' : c.critical ? 'FAIL' : 'warn'}`).join(' '),
  });
}

const pad = (s, n) => String(s).padEnd(n);
const lines = [];
lines.push('# Build report\n');
lines.push(`Generated ${new Date().toISOString().slice(0, 10)} from the assembled books.\n`);
lines.push('| Book | Pages | Recipes | Unique dinners | Repeated | Cooked once | kcal/day (mean) | min | max | Protein/day | % energy | Cost tier |');
lines.push('|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  lines.push(`| ${r.slug} | ${r.pages} | ${r.recipes} | ${r.uniqueDinners} | ${r.repeatedDinners} | ${r.onceOnly} | ${r.meanKcal} | ${r.minKcal} | ${r.maxKcal} | ${r.meanProtein}g | ${r.proteinPct}% | ${r.tier} |`);
}
lines.push('\n## Reconciliation (all must be zero)\n');
lines.push('| Book | Unresolved ingredients | Shopping-list failures | Leftover failures | Critical QA failures |');
lines.push('|---|---|---|---|---|');
for (const r of rows) {
  lines.push(`| ${r.slug} | ${r.unresolved} | ${r.shopFails} | ${r.leftoverFails} | ${r.critical} |`);
}
lines.push('\n## Check status per book\n');
for (const r of rows) lines.push(`- **${r.slug}** — ${r.checks}`);

const out = lines.join('\n') + '\n';
writeFileSync(path.join(ROOT, 'dist', 'BUILD-REPORT.md'), out);
console.log(out);
