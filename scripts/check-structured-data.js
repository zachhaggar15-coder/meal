// Post-build guard for Google rich-result structured data.
//
// Search Console flags Product snippets as invalid when a Product item lacks
// offers, review, or aggregateRating. This scans the prerendered HTML so a
// duplicate or incomplete Product node cannot slip into production.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error('check-structured-data: dist/ not found. Run the build first.');
  process.exit(1);
}

const htmlFiles = findHtmlFiles(dist)
  .filter(file => !path.relative(dist, file).startsWith(`ssr${path.sep}`));

const errors = [];
let productCount = 0;
let pagesWithProducts = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const route = routeFromFile(file);
  const structuredData = extractJsonLd(html, route);
  const products = structuredData.flatMap(item => collectProducts(item));

  if (products.length) pagesWithProducts += 1;
  productCount += products.length;

  for (const { value, jsonPath } of products) {
    if (value.offers || value.review || value.aggregateRating) continue;
    errors.push({
      route,
      name: value.name || value['@id'] || '(unnamed Product)',
      jsonPath,
      keys: Object.keys(value).sort().join(', '),
    });
  }
}

if (errors.length) {
  console.error(`\ncheck-structured-data FAILED with ${errors.length} invalid Product item(s):`);
  for (const error of errors.slice(0, 40)) {
    console.error(`  - ${error.route}: ${error.name}`);
    console.error(`    ${error.jsonPath} keys: ${error.keys}`);
  }
  if (errors.length > 40) console.error(`  ...and ${errors.length - 40} more`);
  console.error('\nEach Product JSON-LD item must include offers, review, or aggregateRating.\n');
  process.exit(1);
}

console.log(
  `check-structured-data passed: ${pagesWithProducts} pages contain ` +
  `${productCount} valid Product item(s).`,
);

function findHtmlFiles(dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...findHtmlFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
  }

  return files;
}

function routeFromFile(file) {
  const relative = path.relative(dist, file).split(path.sep).join('/');
  if (relative === 'index.html') return '/';
  return `/${relative.replace(/\/index\.html$/, '')}`;
}

function extractJsonLd(html, route) {
  const scripts = [...html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )];

  return scripts.map((match, index) => {
    try {
      return JSON.parse(decodeHtmlEntities(match[1]));
    } catch (error) {
      errors.push({
        route,
        name: `JSON-LD script ${index + 1} could not be parsed`,
        jsonPath: '$',
        keys: error.message,
      });
      return null;
    }
  }).filter(Boolean);
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function collectProducts(value, products = [], jsonPath = '$') {
  if (!value || typeof value !== 'object') return products;

  const type = value['@type'];
  const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'));
  if (isProduct) products.push({ value, jsonPath });

  for (const [key, child] of Object.entries(value)) {
    if (Array.isArray(child)) {
      child.forEach((item, index) => collectProducts(item, products, `${jsonPath}.${key}[${index}]`));
    } else {
      collectProducts(child, products, `${jsonPath}.${key}`);
    }
  }

  return products;
}
