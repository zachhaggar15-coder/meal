# Internal-linking logic

Last reviewed: 29 July 2026

Internal links should help a person take the next useful step and help crawlers
understand the same hierarchy.

## Route roles

- Guides link to the closest exact plans first; otherwise to a relevant
  supermarket/calorie hub, tool or quiz.
- Hubs link to a curated set of qualifying plans and related hubs.
- Plans link to related plans selected from real seed attributes, a filtered
  comparison route, the quiz, applicable guides and tools.
- Commercial equipment guides lead to the container calculator before broad
  product collections when calculation would narrow the choice.
- Global navigation exposes only primary product areas, including device-local
  Saved plans. It does not expose hundreds of plan URLs.

`src/utils/contextualJourney.js` chooses the blog next step from exact plan links,
equipment intent, named supermarket and calorie intent in that order.
`src/utils/planBuilder.js` chooses plan alternatives. Curated acquisition clusters
live in `src/data/seoPriorityLinks.js`.

## Rules

- Use descriptive anchor text that names the destination or task.
- Prefer two to five contextual alternatives over large unrelated link blocks.
- Do not link to redirects, missing routes, filter states that are not useful to
  users or noindex utilities as an SEO shortcut.
- Preserve the user's context in query parameters only where the destination uses
  it; canonicals never include those parameters.
- Affiliate links must be labelled, disclosed and treated as external.
- New pages must receive a contextual incoming link before becoming indexable.

## Enforcement

The build crawl currently resolves 104,718 internal-link occurrences across 1,405
HTML files. `npm run audit:links` fails broken targets and internal links to
redirects. `npm run audit:seo` records incoming and outgoing counts so orphan and
over-linking patterns can be reviewed.
