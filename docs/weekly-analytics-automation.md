# Weekly Analytics Automation

This repo already sends browser analytics through GA4 in `src/utils/analytics.js`.
The weekly automation reads those reports back out, combines them with Search
Console query/page data, and writes three low-risk updates:

- `src/data/weeklySeoInsights.js` for public-safe "Popular this week" links.
- `docs/search-console-weekly-tracker.csv` for the running query/page tracker.
- `docs/weekly-analytics-report.md` and `docs/seo-reports/YYYY-MM-DD.md` for
  the latest human-reviewed improvement checklist.

The scheduled workflow commits those generated files after the normal nutrition,
plan and build checks pass. It does not rewrite article copy, metadata, routes,
meal plans, blog posts or long-form content automatically. After a successful
run it emails the latest report and suggested action summary through Resend.

## Required GitHub Secrets

Add these repository secrets before enabling the weekly job:

- `GOOGLE_SERVICE_ACCOUNT_JSON`: the full service account JSON, or a base64
  encoded version of it.
- `SEARCH_CONSOLE_SITE_URL`: usually `https://www.mealprep.org.uk/` or the
  matching Search Console domain property.
- `GA4_PROPERTY_ID`: the numeric GA4 property ID, without the `G-` measurement
  prefix.
- `RESEND_API_KEY`: Resend API key for emailing the report after a successful
  run.

Optional email secrets:

- `WEEKLY_ANALYTICS_REPORT_EMAIL_TO`: recipient for the weekly report. Defaults
  to `zach.haggar15@gmail.com` if omitted.
- `MEALPREP_REPORT_FROM_EMAIL`: verified sender for report emails. Falls back
  to `MEALPREP_FROM_EMAIL`, then Resend's onboarding sender.

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
npm run analytics:weekly:email:dry-run
npm run check:nutrition
npm run check:plans
npm run build
```

## Thresholds

The default Search Console opportunity window is:

- last 28 available days
- minimum 50 impressions for minor consideration
- 100 impressions for stronger consideration
- 250 impressions for priority consideration
- average position 4 to 40
- CTR below a simple expected CTR curve for that position

Override these with `WEEKLY_ANALYTICS_DAYS`, `WEEKLY_ANALYTICS_MIN_IMPRESSIONS`,
`WEEKLY_ANALYTICS_STRONG_IMPRESSIONS`, `WEEKLY_ANALYTICS_PRIORITY_IMPRESSIONS`,
`WEEKLY_ANALYTICS_MIN_POSITION`, `WEEKLY_ANALYTICS_MAX_POSITION`, and
`WEEKLY_ANALYTICS_COOLDOWN_DAYS`.

## Safety Rules

- The scheduled workflow only stages generated insight/report files.
- Raw analytics metrics stay in docs reports and the tracker, not the frontend
  `weeklySeoInsights.js` module.
- Routes must exist in the same source inventory used by prerendering before
  they can appear in generated frontend links or report recommendations.
- Editorial changes are report-only recommendations until a human approves a
  separate improvement pass.

## Email Delivery

The email step runs after report generation, validation and the generated-file
commit. It sends:

- the analysed date range
- the recommended action for the week
- any warnings
- public links written
- top opportunity preview
- links to the GitHub report, workflow run and generated commit

If `RESEND_API_KEY` is missing or invalid, the workflow will fail at the email
step so the missing notification setup is visible.
