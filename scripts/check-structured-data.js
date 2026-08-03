// Post-build guard for Google rich-result structured data.
//
// Search Console flags Product snippets as invalid when a Product item lacks
// offers, review, or aggregateRating. This scans the prerendered HTML so a
// duplicate, incomplete, or Google-incompatible Product node cannot slip into
// production.

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
let recipeCount = 0;
let pagesWithRecipes = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const route = routeFromFile(file);
  const structuredData = extractJsonLd(html, route);
  const products = structuredData.flatMap(item => collectProducts(item));
  const recipes = structuredData.flatMap(item => collectTypedNodes(item, 'Recipe'));
  const searchActions = structuredData.flatMap(item => collectTypedNodes(item, 'SearchAction'));

  if (products.length) pagesWithProducts += 1;
  if (recipes.length) pagesWithRecipes += 1;
  productCount += products.length;
  recipeCount += recipes.length;

  validateDuplicateRootBlocks(structuredData, route);

  for (const { value, jsonPath } of searchActions) {
    errors.push({
      route,
      name: value.name || 'SearchAction',
      jsonPath,
      reason: 'obsolete sitelinks search markup can expose template URLs to Googlebot',
      keys: Object.keys(value).sort().join(', '),
    });
  }

  for (const { value, jsonPath } of products) {
    const eligibility = productRichResultEligibility(value);
    if (eligibility.ok) continue;

    errors.push({
      route,
      name: value.name || value['@id'] || '(unnamed Product)',
      jsonPath,
      reason: eligibility.reason,
      keys: Object.keys(value).sort().join(', '),
    });
  }

  for (const { value, jsonPath } of recipes) {
    const eligibility = recipeEligibility(value);
    if (!eligibility.ok) {
      errors.push({
        route,
        name: value.name || value['@id'] || '(unnamed Recipe)',
        jsonPath,
        reason: eligibility.reason,
        keys: Object.keys(value).sort().join(', '),
      });
    }

    if (
      route.startsWith('/plans/') &&
      value.url &&
      normalisePath(new URL(value.url, 'https://www.mealprep.org.uk').pathname) === route
    ) {
      errors.push({
        route,
        name: value.name || '(unnamed Recipe)',
        jsonPath,
        reason: 'a seven-day plan must not be described as one Recipe',
        keys: Object.keys(value).sort().join(', '),
      });
    }
  }
}

if (errors.length) {
  console.error(`\ncheck-structured-data FAILED with ${errors.length} structured-data issue(s):`);
  for (const error of errors.slice(0, 40)) {
    console.error(`  - ${error.route}: ${error.name}`);
    console.error(`    ${error.jsonPath} ${error.reason}; keys: ${error.keys}`);
  }
  if (errors.length > 40) console.error(`  ...and ${errors.length - 40} more`);
  console.error('\nFix invalid, incomplete or duplicated structured data before deploying.\n');
  process.exit(1);
}

console.log(
  `check-structured-data passed: ${pagesWithProducts} pages contain ` +
  `${productCount} valid Product item(s); ${pagesWithRecipes} pages contain ` +
  `${recipeCount} sufficiently detailed Recipe item(s).`,
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

function collectTypedNodes(value, requestedType, nodes = [], jsonPath = '$') {
  if (!value || typeof value !== 'object') return nodes;

  const types = toArray(value['@type']);
  if (types.includes(requestedType)) nodes.push({ value, jsonPath });

  for (const [key, child] of Object.entries(value)) {
    if (Array.isArray(child)) {
      child.forEach((item, index) => collectTypedNodes(item, requestedType, nodes, `${jsonPath}.${key}[${index}]`));
    } else {
      collectTypedNodes(child, requestedType, nodes, `${jsonPath}.${key}`);
    }
  }

  return nodes;
}

function validateDuplicateRootBlocks(items, route) {
  const seen = new Set();

  items.forEach((item, index) => {
    const fingerprint = JSON.stringify(item);
    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      return;
    }

    errors.push({
      route,
      name: item.name || item['@id'] || `JSON-LD script ${index + 1}`,
      jsonPath: `$[${index}]`,
      reason: 'duplicate structured-data root block',
      keys: Object.keys(item).sort().join(', '),
    });
  });
}

function recipeEligibility(recipe) {
  if (!String(recipe.name || '').trim()) return { ok: false, reason: 'missing recipe name' };
  if (!toArray(recipe.recipeIngredient).filter(Boolean).length) {
    return { ok: false, reason: 'missing recipe ingredients' };
  }
  if (!toArray(recipe.recipeInstructions).filter(Boolean).length) {
    return { ok: false, reason: 'missing recipe instructions' };
  }
  if (!String(recipe.recipeYield || '').trim()) return { ok: false, reason: 'missing recipe yield' };
  if (!recipe.prepTime && !recipe.cookTime && !recipe.totalTime) {
    return { ok: false, reason: 'missing preparation or cooking time' };
  }
  if (!toArray(recipe.image).filter(Boolean).length) return { ok: false, reason: 'missing recipe image' };
  return { ok: true };
}

function productRichResultEligibility(product) {
  if (product.offers) return { ok: true };
  if (product.aggregateRating) return { ok: true };

  const reviews = toArray(product.review).filter(Boolean);
  if (!reviews.length) {
    return { ok: false, reason: 'missing offers, aggregateRating, or review' };
  }

  if (reviews.some(hasGoogleCompatibleReviewAuthor)) return { ok: true };

  return {
    ok: false,
    reason: 'review author must be a Person or Team with a name',
  };
}

function hasGoogleCompatibleReviewAuthor(review) {
  return toArray(review.author).some(isGoogleCompatibleReviewAuthor);
}

function isGoogleCompatibleReviewAuthor(author) {
  if (!author || typeof author !== 'object') return false;

  const types = toArray(author['@type']);
  const hasAllowedType = types.includes('Person') || types.includes('Team');
  return hasAllowedType && typeof author.name === 'string' && author.name.trim().length > 0;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function normalisePath(value) {
  if (!value || value === '/') return '/';
  return `/${String(value).replace(/^\//, '').replace(/\/$/, '')}`;
}
