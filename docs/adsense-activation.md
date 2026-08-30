# Activating Google AdSense ads

The site is ready for AdSense, but ads are switched off by default. While they are off, no ad boxes, placeholders or empty spaces appear on any page.

## After AdSense approves the site

0. **First, turn on a certified consent message.** In AdSense, open
   **Privacy & messaging** and enable Google's consent management solution for
   UK and EEA traffic. Google requires a certified CMP to serve there, and the
   site's own consent gate (`src/utils/adConsent.js`) does not produce a TCF
   string. Do this before step 4 — without it, ads will not serve to most of the
   site's audience.
1. In AdSense, create two responsive display ad units: one for articles and one for meal-plan pages.
2. Copy the numeric slot ID shown for each ad unit. The slot ID is the value AdSense labels as `data-ad-slot` in its code.
3. In the Vercel dashboard, open the MealPrep project and go to **Settings → Environment Variables**.
4. Add these variables to the Production environment:

   - `VITE_ADSENSE_CLIENT_ID` = `ca-pub-7917111630766281`
   - `VITE_AD_SLOT_IN_ARTICLE` = the slot ID from the article ad unit
   - `VITE_AD_SLOT_PLAN_INLINE` = the slot ID from the meal-plan ad unit
   - `VITE_ADS_ENABLED` = `true`

5. Trigger a new production deployment in Vercel so the new environment values are included in the site build.

No source-code change is needed. Setting the variables and triggering the redeployment is enough.

Once ads are on, the consent banner starts asking the advertising question
alongside the analytics one, and no AdSense script loads until a visitor
accepts. Readers who decline, or who send Do Not Track, see the site with no ad
requests made at all.

## Keeping ads off

Leave `VITE_ADS_ENABLED` unset or set it to `false`. You can also leave either slot ID unset to keep only that placement absent. Disabled or unconfigured placements render nothing and reserve no page space.
