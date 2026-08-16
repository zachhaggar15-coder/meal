// Every served page carrying a tagged affiliate link must disclose it.
//
// This runs against the built output rather than the source, because what
// matters is what a reader — or an Associates reviewer — is actually served.
// It is a build step rather than a unit test for a sequencing reason: the test
// suite runs before the build, so a test reading dist/ would only ever check
// the previous build and would pass on exactly the run that broke it.
//
// Two pages failed when this was written. The accessories hub revealed its
// disclosure only after a problem was selected, so the initial HTML carried
// twenty tagged links and no notice at all; the tools page's container
// recommender had one link and none.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const STORE_TAG = 'amazonaf063dc-21';
const DISCLOSURE = /As an Amazon Associate I earn from qualifying purchases|Sponsored #ad|#ad\b/i;

// Amazon product imagery, in every form this repo has carried it.
const AMAZON_IMAGERY = /m\.media-amazon\.com|images-[a-z]{2}\.ssl-images-amazon\.com|\.images-amazon\.com|(?:meal-containers-ad|budget-containers-ad|meal-stickers-ad)\.(?:jpe?g|png|webp)|\/images\/products\//i;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

if (!fs.existsSync(DIST)) {
  console.error('check-affiliate-disclosure: no dist/ to check. Run the build first.');
  process.exit(1);
}

const pages = walk(DIST);
const undisclosed = [];
const withImagery = [];
let affiliatePages = 0;

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const route = `/${path.relative(DIST, page).split(path.sep).join('/').replace(/index\.html$/, '')}`;

  if (AMAZON_IMAGERY.test(html)) withImagery.push(route);
  if (!html.includes(STORE_TAG)) continue;
  affiliatePages += 1;
  if (!DISCLOSURE.test(html)) undisclosed.push(route);
}

const problems = [
  ...undisclosed.map(route => `affiliate link with no disclosure: ${route}`),
  ...withImagery.map(route => `Amazon product imagery: ${route}`),
];

if (problems.length) {
  console.error(`check-affiliate-disclosure FAILED with ${problems.length} issue(s):`);
  for (const problem of problems.slice(0, 20)) console.error(`  - ${problem}`);
  if (problems.length > 20) console.error(`  ...and ${problems.length - 20} more`);
  process.exit(1);
}

console.log(
  `check-affiliate-disclosure passed: ${affiliatePages} page(s) carry a tagged affiliate link, `
  + `all disclosed; 0 of ${pages.length} pages reference Amazon product imagery.`,
);
