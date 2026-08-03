const ROOT_TRACKING_PARAMS = ['from', 'kcal', 'supermarket'];
const BROWSE_CANONICAL_REDIRECTS = [
  {
    params: { goal: 'high-protein-low-cal', supermarket: 'any' },
    destination: '/meal-plans/high-protein',
  },
  {
    params: { goal: 'budget-bodybuilding', calories: '2000' },
    destination: '/meal-plans/budget-bodybuilding',
  },
  {
    params: { goal: 'gym-beginner', calories: '2000' },
    destination: '/meal-plans/2000-calorie',
  },
];

export const config = {
  matcher: ['/', '/browse'],
};

export default function middleware(request) {
  const url = new URL(request.url);

  if (url.pathname === '/' && ROOT_TRACKING_PARAMS.some(param => url.searchParams.has(param))) {
    return permanentCanonicalRedirect(url, '/');
  }

  if (url.pathname === '/browse') {
    // Google retired sitelinks search boxes in 2024, but the old SearchAction
    // template can remain in its crawl queue. Its `q` parameter was never used
    // by the browse UI, so consolidate it directly to the clean browse page.
    if (url.searchParams.has('q')) {
      return permanentCanonicalRedirect(url, '/browse');
    }

    const canonicalRedirect = BROWSE_CANONICAL_REDIRECTS.find(rule => (
      hasExactParams(url.searchParams, rule.params)
    ));
    if (canonicalRedirect) {
      return permanentCanonicalRedirect(url, canonicalRedirect.destination);
    }
  }
}

function hasExactParams(searchParams, expected) {
  const actualEntries = [...searchParams.entries()];
  const expectedEntries = Object.entries(expected);

  return actualEntries.length === expectedEntries.length && expectedEntries.every(
    ([key, value]) => searchParams.get(key) === value,
  );
}

function permanentCanonicalRedirect(url, pathname) {
  url.pathname = pathname;
  url.search = '';
  url.hash = '';
  url.hostname = 'www.mealprep.org.uk';
  url.protocol = 'https:';
  return Response.redirect(url, 308);
}
