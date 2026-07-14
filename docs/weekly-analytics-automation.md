# Weekly Analytics Automation

This repo already sends browser analytics through GA4 in `src/utils/analytics.js`.
The weekly automation reads those reports back out, combines them with Search
Console query/page data, and writes three low-risk updates:

- `src/data/weeklySeoInsights.js` for the visible "Popular this week" links.
- `docs/search-console-weekly-tracker.csv` for the running query/page tracker.
- `docs/weekly-analytics-report.md` for the latest improvement checklist.

The scheduled workflow commits those generated files after the normal nutrition,
plan and build checks pass. It does not rewrite article copy automatically.

## Required GitHub Secrets

Add these repository secrets before enabling the weekly job:

- `GOOGLE_SERVICE_ACCOUNT_JSON`: the full service account JSON, or a base64
  encoded version of it.
- `SEARCH_CONSOLE_SITE_URL`: usually `https://www.mealprep.org.uk/` or the
  matching Search Console domain property.
- `GA4_PROPERTY_ID`: the numeric GA4 property ID, without the `G-` measurement
  prefix.

The service account must have access to the GA4 property and Search Console
property. Enable both APIs in the same Google Cloud project:

- Google Analytics Data API
- Google Search Console API

## Local Commands

Use the sample mode to check the pipeline without credentials:

```bash
npm run analytics:weekly:sample
```

Run against live data after setting credentials:

```bash
npm run analytics:weekly
npm run check:nutrition
npm run check:plans
npm run build
```

## Thresholds

The default Search Console opportunity window is:

- last 28 available days
- minimum 25 impressions
- average position 8 to 40
- CTR below a simple expected CTR curve for that position

Override these with `WEEKLY_ANALYTICS_DAYS`, `WEEKLY_ANALYTICS_MIN_IMPRESSIONS`,
`WEEKLY_ANALYTICS_MIN_POSITION`, and `WEEKLY_ANALYTICS_MAX_POSITION`.
