# Behaviour Analytics

This project now has a first-party analytics layer for understanding real visitor journeys beyond page views.

## What it records

- Anonymous session start and landing context.
- Page views and page exits.
- Time on page, active/visible time, and heartbeat events.
- Scroll milestones at 25%, 50%, 75%, 90%, and 100%.
- Headings or marked sections that enter the viewport.
- Link, button, CTA, outbound, affiliate, and product clicks.
- Site search submissions, search result clicks, and browse filter changes.
- Coarse device category, viewport size, referrer host/source, UTM fields, language, and timezone.
- Exploration score, calculated in the admin API from pages visited, categories explored, searches, clicks, scroll depth, and sections seen.

The browser does not send email addresses, payment data, IP addresses, or typed meal-plan form answers to the behaviour analytics endpoint.

## Setup

1. In Supabase, run:

   ```sql
   supabase/migrations/0002_behavior_analytics.sql
   ```

2. Confirm these server-side environment variables are set wherever the site runs:

   ```text
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ADMIN_DASHBOARD_TOKEN=...
   ```

3. Optional frontend switches:

   ```text
   VITE_BEHAVIOR_ANALYTICS=true
   VITE_ANALYTICS_REQUIRE_CONSENT=true
   ```

   Keep `VITE_ANALYTICS_REQUIRE_CONSENT=true` in production unless another compliant consent system controls analytics before this app loads.

## How to access it

1. Open `/admin` on the deployed site.
2. Enter the value of `ADMIN_DASHBOARD_TOKEN`.
3. Use the **Behaviour Analytics** section for:
   - Overview metrics.
   - Entry sources and original intent.
   - Recent click log.
   - Top clicked targets.
   - Content actually seen.
   - Scroll depth by page.
   - Session journeys.
   - Exploration beyond entry intent.
4. Use the toolbar buttons:
   - **Export event log** for raw analytics events.
   - **Export sessions** for session-level context.
   - **Export waitlist** for the existing MealPrep+ waitlist CSV.

## Local testing

Use `vercel dev` rather than plain Vite if you want `/api/analytics` and `/api/admin-stats` to work locally.

1. Start the site:

   ```bash
   npm start
   ```

2. Open the local URL, accept analytics, click around, search, scroll, and leave a page.
3. Open `/admin`, enter the admin token, and press **Refresh**.

If the dashboard says analytics tables are not available, run the Supabase migration and refresh again.
