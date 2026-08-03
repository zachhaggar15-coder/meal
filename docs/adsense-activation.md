# Activating Google AdSense ads

The site is ready for AdSense, but ads are switched off by default. While they are off, no ad boxes, placeholders or empty spaces appear on any page.

## After AdSense approves the site

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

## Keeping ads off

Leave `VITE_ADS_ENABLED` unset or set it to `false`. You can also leave either slot ID unset to keep only that placement absent. Disabled or unconfigured placements render nothing and reserve no page space.
