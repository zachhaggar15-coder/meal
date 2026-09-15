// The site's whole photographic image estate is built from one of two
// pipelines - the 1200x675 (16:9) category photos under /images/meal-plans/
// and the 1200x630 og-preview/blog cards under /og/ - so a page never needs
// to thread its own width/height through. Declaring the wrong pair (the
// previous hardcoded 1200x630 for every image, including the 675-tall ones)
// gives Google contradictory image signals, which is worse than omitting
// the dimensions entirely.
export function resolveImageDimensions(image) {
  const path = String(image || '').split('?')[0];
  if (/\/images\/meal-plans\//.test(path)) return { width: 1200, height: 675 };
  return { width: 1200, height: 630 };
}
