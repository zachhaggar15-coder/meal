// Post-build guard for URLs Google has already indexed.
//
// Commit c75dfcc (2026-07-01) narrowed prerendering from PLAN_SEEDS to
// INDEXABLE_PLAN_SEEDS. That was the right call — 76,237 pages is far too many
// — but it silently orphaned 125 URLs that were already ranking, some at
// positions 4-11. The build stayed green because nothing verified what had
// actually been written to dist/.
//
// check-plans.js validates the seed data; this validates the built output, so a
// change to prerender.js (the thing that actually broke it) cannot slip past.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const protectedUrls = JSON.parse(
  fs.readFileSync(path.join(root, 'src/data/protectedUrls.json'), 'utf8'),
);
const { redirects = [] } = JSON.parse(
  fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'),
);

if (!fs.existsSync(dist)) {
  console.error('check-protected-urls: dist/ not found — run the build first.');
  process.exit(1);
}

const redirectSources = new Set(redirects.map(rule => rule.source));
const isBuilt = url => fs.existsSync(path.join(dist, url.replace(/^\//, ''), 'index.html'));

const errors = [];

// Must be a real page in dist/, or deliberately redirected.
for (const url of protectedUrls.mustResolve) {
  if (!isBuilt(url) && !redirectSources.has(url)) {
    errors.push(`${url} was indexed by Google but is not in dist/ and has no redirect`);
  }
}

// Must be redirected, or have come back as a real page.
for (const url of protectedUrls.mustRedirect) {
  if (!redirectSources.has(url) && !isBuilt(url)) {
    errors.push(`${url} lost its redirect and was not built as a page`);
  }
}

// A redirect pointing at a page that no longer exists sends traffic to a 404.
// Checked for every internal destination, not just /plans/ — content merges
// redirect between blog posts too.
for (const rule of redirects) {
  const { destination } = rule;
  const isInternalPage = destination.startsWith('/') && !destination.startsWith('//');
  if (isInternalPage && destination !== '/' && !isBuilt(destination)) {
    errors.push(`redirect ${rule.source} -> ${destination} targets a page that is not in dist/`);
  }
}

if (errors.length) {
  console.error(`\ncheck-protected-urls FAILED with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 40)) console.error(`  - ${error}`);
  if (errors.length > 40) console.error(`  ...and ${errors.length - 40} more`);
  console.error(
    '\nThese URLs are already in Google\'s index. Restore them, or add a redirect\n' +
    'to vercel.json pointing at the closest equivalent page.\n',
  );
  process.exit(1);
}

console.log(
  `check-protected-urls passed: ${protectedUrls.mustResolve.length} indexed URLs resolve, ` +
  `${protectedUrls.mustRedirect.length} redirect cleanly.`,
);
