import test from 'node:test';
import assert from 'node:assert/strict';
import { HUB_FEATURED_PLAN_SLUGS, selectHubFeaturedPlans } from '../src/data/hubFeaturedPlans.js';
import { MEAL_PLAN_HUBS, filterPlansForHub } from '../src/data/mealPlanHubs.js';
import { getAllPlanMeta } from '../src/utils/planBuilder.js';
import { isPlanIndexed } from '../src/data/planIndexAllowlist.js';
import { buildBrowsePlanUrl } from '../src/data/planChooser.js';
import middleware from '../middleware.js';

test('chooser links bypass the reported redirect without discarding extra filters', () => {
  const destination = buildBrowsePlanUrl({ goal: 'budget-bodybuilding', calories: 2000 });
  const redirect = middleware(new Request('https://www.mealprep.org.uk/browse?goal=budget-bodybuilding&calories=2000'));
  assert.equal(destination, new URL(redirect.headers.get('location')).pathname);
  assert.equal(middleware(new Request(`https://www.mealprep.org.uk${destination}`)), undefined);
  for (const additional of [{ supermarket: 'aldi' }, { diet: 'vegetarian' }, { budget: 'budget' }, { effort: 'batch' }, { search: 'tofu' }]) {
    const url = buildBrowsePlanUrl({ goal: 'budget-bodybuilding', calories: 2000, ...additional });
    assert.ok(url.startsWith('/browse?'));
    const params = new URL(url, 'https://www.mealprep.org.uk').searchParams;
    for (const [key, value] of Object.entries(additional)) assert.equal(params.get(key), value);
  }
  assert.equal(buildBrowsePlanUrl({ goal: 'budget-bodybuilding', calories: 2500 }), '/browse?goal=budget-bodybuilding&calories=2500');
});

test('coverage recovery plans appear on relevant hubs without replacing the leading recommendation', () => {
  const allPlans = getAllPlanMeta();
  for (const [slug, featured] of Object.entries(HUB_FEATURED_PLAN_SLUGS)) {
    const matches = filterPlansForHub(allPlans, MEAL_PLAN_HUBS[slug]);
    const shown = selectHubFeaturedPlans(matches, slug);
    assert.equal(shown[0], matches[0]);
    assert.equal(shown.length, Math.min(matches.length, 12));
    assert.equal(new Set(shown.map(plan => plan.slug)).size, shown.length);
    for (const planSlug of featured) {
      assert.ok(isPlanIndexed(planSlug), `${planSlug} must remain eligible for search`);
      assert.ok(shown.some(plan => plan.slug === planSlug), `${slug} must show matching plan ${planSlug}`);
    }
  }
});

test('unconfigured hubs retain their existing order and empty hubs stay empty', () => {
  const plans = [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }];
  assert.deepEqual(selectHubFeaturedPlans(plans, 'unconfigured', 2), plans.slice(0, 2));
  assert.deepEqual(selectHubFeaturedPlans([], 'vegetarian'), []);
});
