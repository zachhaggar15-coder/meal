// Run this before setting Lemon Squeezy buy links anywhere, and again
// whenever you come back to the checkout after time away.
//
// Products created in test mode do not carry over when a Lemon Squeezy store
// is approved for live sales — approval requires using "Copy to Live Mode"
// on each product, which creates a new product with its own new buy link. A
// buy link copied from test mode straight into production will check out
// real visitors against a test-mode product, which Lemon Squeezy renders
// with an orange TEST MODE banner across the page.
//
// This script does not touch dist/ or fail the build — it is a standalone
// reminder, run with `npm run check:checkout`.
import { MEAL_PREP_PDF_PRODUCTS } from '../src/data/mealPrepPdfProducts.js';

const WEBHOOK_VAR = 'LEMONSQUEEZY_WEBHOOK_SECRET';

const products = Object.values(MEAL_PREP_PDF_PRODUCTS);
const configured = products.filter(p => process.env[p.checkoutEnvVar]);
const unconfigured = products.filter(p => !process.env[p.checkoutEnvVar]);
const webhookSet = Boolean(process.env[WEBHOOK_VAR]);

console.log('\ncheck:checkout — Lemon Squeezy checkout status\n');

if (configured.length) {
  console.log(`⚠️  ${configured.length}/${products.length} buy link(s) are set:`);
  for (const p of configured) console.log(`   - ${p.checkoutEnvVar} (${p.name})`);
  console.log(
    '\n   Before this reaches production, confirm every one of these links was copied from LIVE\n' +
    '   mode in the Lemon Squeezy dashboard after store approval — not left over from test mode.\n' +
    '   A test-mode link shows real visitors a checkout with an orange TEST MODE banner.\n'
  );
} else {
  console.log('No buy links are set yet — shop pages will render "Available soon".');
  console.log('That is the expected, safe state before Lemon Squeezy approval lands.\n');
}

if (unconfigured.length && unconfigured.length !== products.length) {
  console.log(`Not yet configured (${unconfigured.length}):`);
  for (const p of unconfigured) console.log(`   - ${p.checkoutEnvVar} (${p.name})`);
  console.log('');
}

console.log(`${WEBHOOK_VAR}: ${webhookSet ? 'set' : 'not set'} (safe to set any time — it does not change on activation)\n`);
