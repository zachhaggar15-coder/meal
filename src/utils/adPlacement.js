// Which routes may carry advertising.
//
// Google's inventory-value policy rules out screens "without publisher-content
// or with low-value content, that are under construction, that are used for
// alerts, navigation or other behavioral purposes". Rather than relying on
// nobody ever placing a slot on one of those screens, `AdSlot` asks this
// module and renders nothing when the answer is no.
//
// The classification behind each entry is in docs/adsense-page-suitability.md.

const NEVER_MONETISE_EXACT = new Set([
  // Error and utility screens with no publisher content.
  '/404',
  '/admin',
  '/feedback',
  '/saved-plans',
  // Input and decision flows — ads would sit beside action controls.
  '/quiz',
  '/quiz/results',
  '/browse',
  '/tools',
  // A waitlist for a service that does not exist yet.
  '/mealprep-plus',
  // Already carrying affiliate placements; ads would push paid content past
  // publisher content.
  '/meal-prep-accessories',
  '/meal-prep-containers',
]);

const NEVER_MONETISE_PREFIXES = [
  // The 32 chooser screens are routing surfaces, not articles.
  '/choose-plan/',
  '/choose-supermarket/',
  '/choose-diet/',
  '/choose-calories/',
  '/browse/page/',
];

export function isMonetisableRoute(pathname) {
  const clean = String(pathname || '').replace(/\/+$/, '') || '/';
  if (NEVER_MONETISE_EXACT.has(clean)) return false;
  return !NEVER_MONETISE_PREFIXES.some(prefix => `${clean}/`.startsWith(prefix));
}
