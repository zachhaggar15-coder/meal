# Search-quality and technical audit

Audit date: 29 July 2026

## Standard

The review follows current official Google documentation: [Search Essentials](https://developers.google.com/search/docs/essentials), [helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [spam policies](https://developers.google.com/search/docs/essentials/spam-policies), [structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [Recipe structured data](https://developers.google.com/search/docs/appearance/structured-data/recipe), [canonicalisation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [mobile-first indexing](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing) and [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals).

No page was noindexed, redirected or padded with generic text merely to change a similarity score.

## Static crawl and count reconciliation

`npm run build` produces 1,403 routed pages plus the root document and writes 1,404 HTML files. Of those files, 1,377 are self-canonical and indexable and therefore appear in the four sitemap files. The remaining HTML files are deliberate non-indexable utility, admin, error or duplicate-file outputs. The independent protected-URL inventory contains 59 routes, while `vercel.json` contains 67 redirect rules. These inventories answer different questions and are not expected to equal the route count.

`npm run audit:seo` crawls the complete built output and checks title, description, one H1, canonical, robots, sitemap membership, prerendered main content and JSON-LD parsing. It also records word count, fingerprints, incoming/outgoing links, structured-data types and nutrition claims. `npm run audit:links` resolves every internal link against the built route and redirect inventory.

| Check | Exhaustive coverage | Blocking threshold | Result |
|---|---:|---|---|
| Generated HTML | 1,404 files | required title/description/canonical/H1/main content; valid JSON-LD | passed |
| Canonical/indexable URLs | 1,377 | self-canonical, indexable, sitemap included | passed |
| Published plan pages | 1,059 | route data, metadata and composition assessed | passed |
| Internal links | 92,986 occurrences | zero broken links and zero links to redirects | passed |
| Protected routes | 59 | must still resolve or deliberately redirect | passed |
| Redirect rules | 67 | target must exist; no live plan may be shadowed | passed |
| Recipe entities | seven qualifying pages | visible ingredients/instructions/nutrition must agree | passed |
| Product entities | 59 | no invented price, rating, review or availability | passed |

Machine-readable output is written to:

- `audit-artifacts/url-indexing.json`
- `audit-artifacts/duplicate-content-clusters.json`
- `audit-artifacts/broken-links.json`
- `audit-artifacts/live-canonical-crawl.json` after deployment

## Duplicate and scaled-page assessment

Composition fingerprints identified 31 exact meal-composition clusters and 43 near-duplicate pairs at Jaccard similarity ≥0.85 among the 1,059 published plans. Similarity alone is not treated as a defect. Each retained route must provide a genuine distinction through supermarket guidance, goal context, quantities, calculated macros, shopping list or preparation pattern. The machine report lists every route and differentiator for continued editorial review.

No new programmatic route was created. No filler copy was added. The sitemap and canonical policy remain unchanged because the crawl found no broken, empty, orphaned or incorrectly canonicalised index page requiring consolidation.

## Claim and content corrections

- Public language distinguishes 76,246 feasible generated combinations from 1,059 published plan pages.
- Exact calorie and protein filters use calculated plan values and documented tolerances.
- Weight-loss, menopause and anti-inflammatory content was revised to avoid guaranteed, treatment or disease-prevention implications.
- Meal plans remain general planning information and do not claim to replace medical advice.
- High-protein tags now have a machine-enforced criterion.
- Recipe-quality checks cover all 169 shared meals and fail on unresolved quantities or critical template defects.

## Structured data

Weekly plans are not represented as a single Recipe. Recipe markup is emitted only where the page exposes a qualifying visible recipe, serving context, ingredients and instructions. Product markup describes affiliate recommendations without pretending they are first-party stock and without invented commercial attributes.

The build validates all emitted JSON-LD, canonical URLs and local image paths. Representative live templates are also inspected in a browser after deployment.

## Performance

The global navigation search previously imported the complete article corpus, contributing to an approximately 830 KB blog-data chunk. The search now uses a generated 154-record, 62,084-byte index, while blog routes load article data in route-specific chunks. The production build no longer emits the previous large-chunk warning. The largest blog content chunk in the audited build is approximately 406.92 KB uncompressed and 124.08 KB gzip; it is not part of the initial payload for unrelated routes.

The site now self-hosts DM Sans instead of waiting for the cross-origin Google Fonts stylesheet. In the repeatable local mobile lab run this reduced homepage First Contentful Paint from 11.01 s to 2.28 s and Largest Contentful Paint from 11.43 s to 3.50 s, with Cumulative Layout Shift remaining 0. The desktop lab run recorded 0.50 s FCP, 0.70 s LCP and 0 CLS. The Windows Lighthouse harness introduced a separate unattributed multi-second task in both final traces, so the resulting Total Blocking Time is not treated as an application measurement; the largest desktop task attributable to the app was 90 ms.

These changes preserve prerendered article content, direct navigation and site search. Browser diagnostics across the ten representative templates found no horizontal overflow, broken images, dimensionless images or application console errors on desktop or at a true 390 px mobile viewport. Interaction to Next Paint is a field metric and requires post-release real-user data; lab testing uses attributable long tasks and interaction traces only as diagnostic proxies.

## Remaining P2 review items

- The 31 exact and 43 near-duplicate composition clusters are retained only where the route's user intent and generated details differ. They should be reviewed alongside Search Console performance before any consolidation.
- Responsive source sizing for the homepage imagery remains a P2 opportunity; the lab estimate indicates approximately 86 KB could be avoided on a narrow viewport.
- Nutrition remains an estimate because brands and ingredients vary; exact laboratory accuracy is not claimed.
