# Performance and accessibility baseline

Last reviewed: 3 August 2026

## Build baseline

The production build is inspected exhaustively by `npm run audit:performance`:

| Measure | Current | Release budget |
|---|---:|---:|
| Initial JavaScript | 189.5 KB gzip | 205.1 KB gzip |
| Initial CSS | 34.0 KB gzip | 43.9 KB gzip |
| Largest lazy JavaScript chunk | 120.1 KB gzip | 136.7 KB gzip |
| Largest image | 459.1 KB | 732.4 KB |
| Largest route HTML | 365.2 KB raw / 28.5 KB gzip | 390.6 KB raw / 58.6 KB gzip |
| Initial local JS/CSS requests | 7 | 12 |
| Third-party scripts before consent | 0 | 0 |

The large raw HTML route is `/blog`, which preserves the visible guide index and
compresses to about 29 KB. Third-party GA4, Plausible and Ahrefs scripts are added
only after consent.

The previous repeatable local homepage lab recorded mobile FCP 2.28 s, LCP 3.50 s
and CLS 0; desktop recorded FCP 0.50 s, LCP 0.70 s and CLS 0. These are diagnostic
lab observations, not field Core Web Vitals. Interaction to Next Paint requires
real-user data. The production tracker now records navigation-scoped LCP, INP,
CLS, FCP and TTFB after analytics consent. The private dashboard and weekly
analytics report calculate route-level p75 values; they explicitly show
"awaiting data" until consented production visits exist.

The production mobile Lighthouse sample taken immediately before responsive hero
delivery recorded 541,612 transferred bytes, 7.77 s LCP, 0 CLS and 0 ms TBT. The
same harness after adding a 720 px source recorded 473,737 bytes, 7.02 s LCP,
0 CLS and 0 ms TBT. Lighthouse's estimated image-delivery waste fell from 81,171
bytes to zero. These are single-run diagnostic comparisons; field LCP and INP
remain the decision metrics.

## Accessibility baseline

`npm run audit:accessibility` inspects every emitted page for document language,
one main landmark, skip link, duplicate IDs, image alternatives, accessible
button/link/form names and heading order.

Current exhaustive static coverage after the browse-template fix:

- 1,405 HTML files and 1,377 canonical pages.
- 82,098 form controls.
- 48,375 buttons.
- 104,718 links.
- 3,533 images.
- Zero blocking static defects expected; the gate fails if any occur.

Static checks cannot prove colour contrast, visible focus, keyboard behaviour,
screen-reader announcements or touch ergonomics. Representative mobile and
desktop flows therefore remain a required browser release check.

## Known performance opportunities

The largest lazy blog chunk is deliberately route-scoped. Initial JavaScript
still contains generated plan data and a blog data dependency that should be
profiled before further splitting. The homepage now offers a 49.7 KB, 720 px
WebP alongside the 117.7 KB, 1,200 px source; field data should confirm the
benefit across real devices and connection speeds. Neither remaining profiling
question currently breaks the release budget.
