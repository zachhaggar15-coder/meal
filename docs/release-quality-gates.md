# Release quality gates

The production release is allowed only when the commands below exit successfully. Generated audit JSON is ignored by Git but uploaded by CI for inspection.

## Complete local and CI gate

```text
npm ci
npm run check
```

`npm run check` runs lint, unit/integration tests, API security tests, the dependency advisory policy, the production build, sampled plan sanity and every exhaustive audit.

## Individual gates

| Command | Scope | Blocking rule |
|---|---|---|
| `npm run lint` | all JavaScript and JSX | zero errors and zero warnings |
| `npm test` | calculation and product-funnel regression tests | zero failures |
| `npm run test:security` | API request size, method and rate guards | zero failures |
| `npm run audit:dependencies` | installed dependency advisory report | zero unexpected high/critical advisories |
| `npm run audit:nutrition` | 169 shared meals, 112 legacy occurrences and every ingredient | zero unresolved quantities/foods/units, negative/non-finite values or stored/display drift |
| `npm run audit:recipes` | all shared recipe ingredients and methods | zero critical instruction defects and zero missing material quantities |
| `npm run audit:dietary` | all 169 shared meal labels | zero prohibited ingredients; high-protein ≥20% energy |
| `npm run check:plans` | all 76,246 seed definitions plus 3,385 detail builds | valid references and filters; detail builds meet calorie tolerances |
| `npm run audit:plans` | all 76,246 combinations and seven household states per distinct output | seven-day mean ±3%; each day ±7.5%; exact arithmetic; no accidental duplicate; no invalid references |
| `npm run build` | client, SSR, 1,403 prerender routes, protected URLs, schema and sitemap | zero build/prerender/protection/schema/indexing failures |
| `npm run audit:seo` | all 1,404 built HTML files and 1,377 canonicals | complete metadata, canonical/indexing/sitemap agreement, meaningful main content, valid JSON-LD |
| `npm run audit:schema` | all generated structured data | zero invalid or misleading eligible entities |
| `npm run audit:links` | every built internal link | zero broken links or internal links to redirects |
| `npm run audit:live -- https://www.mealprep.org.uk` | every production sitemap canonical | HTTP 200, no redirect, self-canonical, indexable, title/H1/main present |

## Dependency advisory policy

The current registry reports GHSA-qwww-vcr4-c8h2 against React Router's React Server Components action processing. MealPrep.org.uk uses BrowserRouter at runtime and StaticRouter only during build-time HTML rendering. It does not expose the React Server Components request/action handler required by the advisory.

`npm run audit:dependencies` permits only that exact advisory and only while the expected non-RSC architecture is machine-verifiable. Any different advisory, any new affected package or the introduction of an RSC request handler fails the gate. This is an explicit applicability decision, not suppression of the registry scan.

## Deployment and rollback

1. Confirm the complete gate passes from a clean dependency installation.
2. Commit only relevant repository changes; exclude `.claude` workspace files.
3. Push the audited branch.
4. Create a Vercel deployment from that commit and promote that saved deployment to production.
5. Run browser checks and `audit:live` against the production alias.
6. Inspect production runtime/build logs.

The preserved pre-audit rollback deployment is `dpl_EgnEVcJ7eR1yo1X6o1Eqsfwm78Gx`. If production smoke tests reveal a release-blocking issue, promote that deployment back to production.

## Severity

- P0: false or impossible nutrition, unsafe serving arithmetic, false dietary label, false schema, broken canonical/index route, exposed secret or serious exploitable security defect. Zero allowed.
- P1: target miss, material ingredient omission, shopping mismatch, critical recipe defect, misleading schema, broken key link or valueless index page. Zero allowed unless external and explicitly documented.
- P2: non-critical clarity, metadata, performance or maintenance improvement. Resolve practical items and list each remaining one.
