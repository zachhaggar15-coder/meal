const THANK_YOU_URL = 'https://www.mealprep.org.uk/meal-prep-pdfs/thank-you';

// Turns a product's configured Lemon Squeezy "Buy Link" into a checkout URL,
// or returns null when that product isn't sellable yet.
//
// The env var holds the full buy link Lemon Squeezy gives you per product
// (Dashboard → Products → variant → Copy buy link), not a bare variant id —
// pasting the whole link avoids guessing at Lemon Squeezy's URL format.
//
// Products created in test mode do not carry over when a Lemon Squeezy store
// is approved for live sales — approval requires "Copy to Live Mode" on each
// product, which creates a new product with its own new buy link. Until that
// live-mode link is set as the named env var, checkoutUrl() returns null and
// callers should show an "Available soon" state instead of a broken or
// test-mode checkout.
export function checkoutUrl(checkoutEnvVar) {
  const raw = import.meta.env[checkoutEnvVar];
  if (!raw) return null;

  try {
    const url = new URL(raw);
    url.searchParams.set('redirect_url', THANK_YOU_URL);
    return url.toString();
  } catch {
    return null;
  }
}

export function isCheckoutConfigured(checkoutEnvVar) {
  return checkoutUrl(checkoutEnvVar) !== null;
}
