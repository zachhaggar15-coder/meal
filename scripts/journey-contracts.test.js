// Journey contracts beyond the plan choosers.
//
// The routing defect that prompted this file was invisible to page-level tests:
// every destination existed, returned 200 and contained valid data, while the
// control that led there promised something else. So these tests assert the
// relationship a user experiences — visible promise === structured intent ===
// resulting content — for the other systems that resolve one thing from
// another.
//
// Companion to scripts/plan-routing.test.js, which covers the chooser pages.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getAllPlanMeta, getPlanBySlug } from '../src/utils/planBuilder.js';
import { MEAL_PLAN_HUBS, filterPlansForHub } from '../src/data/mealPlanHubs.js';
import { COMBO_LANDING_PAGES } from '../src/data/comboLandingPages.js';
import { blogPostsData } from '../src/data/blogPosts.js';
import { mealPlansData } from '../src/data/mealPlans.js';
import {
  DIET_CHOICES,
  GOAL_CHOOSER_ITEMS,
  SUPERMARKET_CHOICES,
} from '../src/data/planChooser.js';
import { buildHubContextLinks, buildHubDataSummary } from '../src/utils/hubContext.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const ALL_PLANS = getAllPlanMeta();
const PLANS_BY_SLUG = new Map(ALL_PLANS.map(plan => [plan.slug, plan]));

// Mirrors MealPlanHubPage: a supermarket hub with no direct matches falls back
// to the generic-supermarket plans, and says so.
function getHubPlanMatches(hub) {
  const direct = filterPlansForHub(ALL_PLANS, hub);
  const supermarket = hub.match?.supermarkets?.[0];
  if (direct.length || !supermarket) return { plans: direct, usedFallback: false };
  const generic = { ...hub, match: { ...hub.match, supermarkets: ['any'] } };
  return { plans: filterPlansForHub(ALL_PLANS, generic), usedFallback: true };
}

// ── Identity vocabularies are single-source and collision-free ───────────────

test('supermarket ids are consistent between the chooser list and plan data', () => {
  const planMarkets = new Set(ALL_PLANS.map(plan => plan.supermarket));
  const chooserMarkets = new Set(SUPERMARKET_CHOICES.map(choice => choice.value));
  const unknownInData = [...planMarkets].filter(value => !chooserMarkets.has(value));
  assert.deepEqual(unknownInData, [], 'plan data uses a supermarket the chooser vocabulary does not know');
});

test('no identifier is a prefix or substring of another in the same vocabulary', () => {
  // A resolver that ever falls back to substring matching would silently let
  // one concept absorb another. Ids are kept non-overlapping so that even a
  // future mistake cannot produce a plausible-looking wrong answer.
  const vocabularies = {
    goal: GOAL_CHOOSER_ITEMS.map(item => item.value),
    supermarket: SUPERMARKET_CHOICES.map(item => item.value),
    diet: DIET_CHOICES.map(item => item.dietType),
  };
  const collisions = [];
  for (const [name, values] of Object.entries(vocabularies)) {
    for (const a of values) {
      for (const b of values) {
        if (a !== b && b.includes(a)) collisions.push(`${name}: "${a}" is contained in "${b}"`);
      }
    }
  }
  assert.deepEqual(collisions, []);
});

test('goal labels that share words still map to distinct goal ids', () => {
  // "Weight Loss", "Budget Fat Loss" and "Cheap High Protein" overlap in
  // wording; their ids must not.
  const ids = GOAL_CHOOSER_ITEMS.map(item => item.value);
  assert.equal(new Set(ids).size, ids.length);
  const labels = GOAL_CHOOSER_ITEMS.map(item => item.label.toLowerCase());
  assert.equal(new Set(labels).size, labels.length);
});

// ── Hub pages: every plan a hub shows really matches what the hub claims ─────

test('every hub shows only plans that satisfy its own match rules', () => {
  const failures = [];
  for (const hub of Object.values(MEAL_PLAN_HUBS)) {
    const { plans, usedFallback } = getHubPlanMatches(hub);
    if (usedFallback) continue; // fallback is an explicit, declared behaviour
    const match = hub.match || {};
    for (const plan of plans) {
      if (match.goals && !match.goals.includes(plan.goal)) {
        failures.push(`${hub.path}: ${plan.slug} goal ${plan.goal}`);
      }
      if (match.supermarkets && !match.supermarkets.includes(plan.supermarket)) {
        failures.push(`${hub.path}: ${plan.slug} supermarket ${plan.supermarket}`);
      }
      if (match.diets && !match.diets.includes(plan.dietType)) {
        failures.push(`${hub.path}: ${plan.slug} diet ${plan.dietType}`);
      }
      if (match.calories && !match.calories.includes(plan.calories)) {
        failures.push(`${hub.path}: ${plan.slug} calories ${plan.calories}`);
      }
    }
  }
  assert.deepEqual(failures.slice(0, 12), []);
});

test('every hub link target exists', () => {
  const hubPaths = new Set(Object.values(MEAL_PLAN_HUBS).map(hub => hub.path));
  const failures = [];
  for (const hub of Object.values(MEAL_PLAN_HUBS)) {
    const { plans } = getHubPlanMatches(hub);
    for (const link of buildHubContextLinks({ hub, allHubs: MEAL_PLAN_HUBS, plans })) {
      const isPlan = link.to.startsWith('/plans/');
      const ok = isPlan ? PLANS_BY_SLUG.has(link.to.replace('/plans/', '')) : hubPaths.has(link.to);
      if (!ok) failures.push(`${hub.path} -> ${link.to}`);
    }
  }
  assert.deepEqual(failures, []);
});

test('hub context links never point back at the hub itself', () => {
  for (const hub of Object.values(MEAL_PLAN_HUBS)) {
    const { plans } = getHubPlanMatches(hub);
    const links = buildHubContextLinks({ hub, allHubs: MEAL_PLAN_HUBS, plans });
    assert.ok(!links.some(link => link.to === hub.path), `${hub.path} links to itself`);
    assert.ok(links.length <= 6, `${hub.path} has ${links.length} context links (policy caps at 6)`);
    const targets = links.map(link => link.to);
    assert.equal(new Set(targets).size, targets.length, `${hub.path} has duplicate context links`);
  }
});

test('hub data summaries describe the hub own plans, not a generic default', () => {
  // Two different hubs must not produce identical stat blocks unless their
  // matched plan sets are genuinely identical.
  const summaries = new Map();
  for (const hub of Object.values(MEAL_PLAN_HUBS)) {
    const { plans } = getHubPlanMatches(hub);
    const summary = buildHubDataSummary(plans);
    if (!summary) continue;
    assert.equal(summary.planCount, plans.length, `${hub.path} miscounts its plans`);
    summaries.set(hub.path, JSON.stringify(summary));
  }
  assert.ok(summaries.size > 20, 'expected most hubs to produce a summary');
  const distinct = new Set(summaries.values());
  assert.ok(
    distinct.size > summaries.size * 0.5,
    `hub summaries are not differentiating: ${distinct.size} distinct of ${summaries.size}`,
  );
});

// ── Combo landing pages ──────────────────────────────────────────────────────

test('combo landing pages only surface plans matching their declared filters', () => {
  const failures = [];
  for (const page of Object.values(COMBO_LANDING_PAGES)) {
    const match = page.match || {};
    const plans = ALL_PLANS.filter(plan => (
      (!match.goals || match.goals.includes(plan.goal))
      && (!match.supermarkets || match.supermarkets.includes(plan.supermarket))
      && (!match.calories || match.calories.includes(plan.calories))
      && (!match.dietTypes || match.dietTypes.includes(plan.dietType))
      && (!match.efforts || match.efforts.includes(plan.effort))
      && (!match.budgets || match.budgets.includes(plan.budget))
    ));
    if (!plans.length) failures.push(`${page.path || page.slug}: no plans match its own filters`);
  }
  assert.deepEqual(failures, []);
});

// ── Cross-component consistency ──────────────────────────────────────────────

test('a plan has one canonical identity wherever it is referenced', () => {
  // Related-plan references embedded in plan data must agree with the plan
  // library about title and slug.
  const failures = [];
  for (const meta of ALL_PLANS.slice(0, 200)) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan) { failures.push(`${meta.slug} does not resolve`); continue; }
    for (const field of ['goal', 'supermarket', 'dietType', 'calories', 'title']) {
      if (plan[field] !== meta[field]) failures.push(`${meta.slug}: ${field} ${plan[field]} != ${meta[field]}`);
    }
    for (const related of plan.relatedSlugs || []) {
      const target = PLANS_BY_SLUG.get(related.slug);
      if (!target) { failures.push(`${meta.slug} -> missing related ${related.slug}`); continue; }
      if (related.title && related.title !== target.title) {
        failures.push(`${meta.slug} -> related "${related.title}" != "${target.title}"`);
      }
    }
  }
  assert.deepEqual(failures.slice(0, 12), []);
});

test('a plan never lists itself as a related plan', () => {
  const failures = [];
  for (const meta of ALL_PLANS.slice(0, 300)) {
    const plan = getPlanBySlug(meta.slug);
    if (plan?.relatedSlugs?.some(related => related.slug === meta.slug)) failures.push(meta.slug);
  }
  assert.deepEqual(failures, []);
});

// ── Homepage and editorial links use real, current identities ────────────────

test('hardcoded homepage plan links resolve and their labels match the plan data', () => {
  const source = read('src/pages/Home.jsx');
  const block = /const FEATURED_CATEGORIES = \[([\s\S]*?)\n\];/.exec(source);
  assert.ok(block, 'FEATURED_CATEGORIES not found in Home.jsx');

  const entries = [...block[1].matchAll(/\{\s*slug:\s*'([^']+)',\s*label:\s*'([^']+)'(?:,\s*path:\s*'([^']+)')?/g)];
  assert.ok(entries.length >= 12, `expected the featured grid to be populated, saw ${entries.length}`);

  const failures = [];
  for (const [, slug, label, explicitPath] of entries) {
    const target = explicitPath && explicitPath.startsWith('/plans/')
      ? explicitPath.replace('/plans/', '')
      : (explicitPath ? null : slug);
    if (!target) continue; // points at a hub or article, covered by the link audit
    const plan = PLANS_BY_SLUG.get(target);
    if (!plan) { failures.push(`${label} -> /plans/${target} does not exist`); continue; }

    const lower = label.toLowerCase();
    for (const [word, value] of [['aldi', 'aldi'], ['tesco', 'tesco'], ['lidl', 'lidl']]) {
      if (lower.includes(word) && plan.supermarket !== value) {
        failures.push(`${label} says ${word} but plan is ${plan.supermarket}`);
      }
    }
    const kcal = /([\d,]+)\s*kcal/.exec(label);
    if (kcal && Number(kcal[1].replace(/,/g, '')) !== plan.calories) {
      failures.push(`${label} says ${kcal[1]} kcal but plan is ${plan.calories}`);
    }
    if (lower.includes('vegan') && plan.dietType !== 'vegan') failures.push(`${label} is not a vegan plan`);
    if (lower.includes('pescatarian') && plan.dietType !== 'pescatarian') failures.push(`${label} is not pescatarian`);
  }
  assert.deepEqual(failures, []);
});

// ── Invalid combinations must fail deliberately, not silently ────────────────

test('an unsupported combination yields no plan rather than an unrelated one', async () => {
  const { recommendPlanForIntent } = await import('../src/utils/planRecommendation.js');
  const impossible = [
    { supermarket: 'ocado', goal: 'cheap-student' },
    { supermarket: 'marks-spencer', goal: 'budget-bodybuilding' },
    { supermarket: 'waitrose', goal: 'cheap-high-protein' },
  ];
  for (const intent of impossible) {
    const exists = ALL_PLANS.some(plan => (
      plan.supermarket === intent.supermarket && plan.goal === intent.goal
    ));
    if (exists) continue; // data has since filled this gap; nothing to assert
    assert.equal(
      recommendPlanForIntent(ALL_PLANS, intent),
      null,
      `${intent.supermarket}/${intent.goal} silently resolved to something`,
    );
  }
});

// ── Legacy editorial plans keep their promises too ───────────────────────────

test('legacy plan pages match the calorie target their own title claims', () => {
  const failures = [];
  for (const [slug, plan] of Object.entries(mealPlansData)) {
    const claimed = /(\d{4})[- ]calorie/.exec(slug);
    if (!claimed) continue;
    if (Number(claimed[1]) !== plan.targetCalories) {
      failures.push(`${slug}: slug says ${claimed[1]} but targetCalories is ${plan.targetCalories}`);
    }
  }
  assert.deepEqual(failures, []);
});

test('legacy plan pages named after a supermarket describe that supermarket', () => {
  const markets = ['aldi', 'lidl', 'tesco', 'asda', 'sainsburys', 'morrisons', 'iceland', 'waitrose'];
  const failures = [];
  for (const [slug, plan] of Object.entries(mealPlansData)) {
    const named = markets.find(market => slug.startsWith(`${market}-`));
    if (!named) continue;
    const haystack = `${plan.title} ${plan.h1} ${plan.description}`.toLowerCase();
    const alias = named === 'sainsburys' ? 'sainsbury' : named;
    if (!haystack.includes(alias)) failures.push(`${slug} never mentions ${named}`);
  }
  assert.deepEqual(failures, []);
});

// ── Editorial pages linking into the product ─────────────────────────────────

test('blog posts linking to a plan link to one that exists', () => {
  const failures = [];
  for (const [slug, post] of Object.entries(blogPostsData)) {
    const serialised = JSON.stringify(post);
    for (const match of serialised.matchAll(/\/plans\/([a-z0-9-]+)/g)) {
      if (!PLANS_BY_SLUG.has(match[1])) failures.push(`/blog/${slug} -> /plans/${match[1]}`);
    }
  }
  assert.deepEqual(failures, []);
});

// ── Publisher journeys a reader must always be able to complete ─────────────

test('every publisher page is reachable from site navigation and is routed', () => {
  const navigation = read('src/data/navigation.js');
  const app = read('src/App.jsx');
  for (const route of ['/about', '/methodology', '/contact', '/privacy', '/terms']) {
    assert.ok(navigation.includes(`'${route}'`), `${route} is not linked from navigation`);
    assert.ok(app.includes(`path="${route}"`), `${route} has no route`);
  }
});

test('pages that explain a limitation link to where it is explained in full', () => {
  // A claim like "estimate" is only useful if the reader can reach the
  // explanation. These are the components that carry those claims.
  const links = {
    'src/components/CostEstimateNote.jsx': '/methodology#costs',
    'src/components/AllergenNote.jsx': '/methodology#allergens',
    'src/components/StorageSafetyNote.jsx': '/methodology#food-safety',
    'src/components/TrustBox.jsx': '/methodology',
  };
  for (const [file, target] of Object.entries(links)) {
    assert.ok(read(file).includes(target), `${file} should link to ${target}`);
  }
});

// ── Browse pagination ───────────────────────────────────────────────────────
//
// 1,059 plans at 24 a page is 45 pages. Listing every number put 44 links in
// the footer of all 45 pages, at 32px each: too many to scan, too small to tap,
// and about two thousand internal links carrying no information.

test('the browse pagination window stays small on every page', async () => {
  const { buildBrowsePageWindow, BROWSE_PAGE_SIZE } = await import('../src/data/browsePagination.js');
  const pageCount = Math.ceil(getAllPlanMeta().length / BROWSE_PAGE_SIZE);
  assert.ok(pageCount > 20, `expected many pages, got ${pageCount}`);

  for (let page = 1; page <= pageCount; page += 1) {
    const window = buildBrowsePageWindow(page, pageCount);
    const numbers = window.filter(entry => entry !== 'gap');

    assert.ok(window.length <= 9, `page ${page} renders ${window.length} controls`);
    assert.ok(numbers.includes(1), `page ${page} loses the route to page 1`);
    assert.ok(numbers.includes(pageCount), `page ${page} loses the route to the last page`);
    assert.ok(numbers.includes(page), `page ${page} does not mark itself`);

    // Ascending, no duplicates, and never a gap standing in for one page.
    let previous = 0;
    for (let index = 0; index < window.length; index += 1) {
      const entry = window[index];
      if (entry === 'gap') {
        const next = window[index + 1];
        assert.ok(typeof next === 'number' && next - previous > 2,
          `page ${page} hides a single page behind an ellipsis`);
        continue;
      }
      assert.ok(entry > previous, `page ${page} window is not ascending`);
      previous = entry;
    }
  }
});

test('every browse page number resolves to a route the build serves', async () => {
  const { buildBrowsePageWindow, buildBrowsePagePath, buildBrowsePageRoutes, BROWSE_PAGE_SIZE } =
    await import('../src/data/browsePagination.js');
  const total = getAllPlanMeta().length;
  const pageCount = Math.ceil(total / BROWSE_PAGE_SIZE);
  const served = new Set(['/browse', ...buildBrowsePageRoutes(total)]);

  for (let page = 1; page <= pageCount; page += 1) {
    for (const entry of buildBrowsePageWindow(page, pageCount)) {
      if (entry === 'gap') continue;
      const href = buildBrowsePagePath(entry);
      assert.ok(served.has(href), `page ${page} links ${href}, which the build does not emit`);
    }
  }
});
