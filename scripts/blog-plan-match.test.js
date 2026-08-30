// The blog email capture is only worth having if the plan it offers is one the
// API can actually build and a reader would recognise as relevant. These tests
// guard both halves: the committed index covers every post with a buildable
// plan, and the obvious signals in a slug survive the match.
//
// The resolver is pure and the catalogue is injected, so these run against a
// small fixture rather than building 1,059 plans.

import test from 'node:test';
import assert from 'node:assert/strict';

import { blogPostsData } from '../src/data/blogPosts.js';
import { BLOG_PLAN_INDEX } from '../src/data/blogPlanIndex.js';
import {
  buildPlanIndex,
  detectCalories,
  detectDiet,
  detectGoal,
  detectSupermarket,
  resolveBlogPlanSlug,
} from '../src/utils/blogPlanMatch.js';

const FIXTURE = [
  { slug: 'any-maintenance-2000', supermarket: 'any', goal: 'maintenance', calories: 2000, dietType: 'standard', title: 'Maintenance 2000' },
  { slug: 'any-muscle-gain-2000', supermarket: 'any', goal: 'muscle-gain', calories: 2000, dietType: 'standard', title: 'Muscle Gain 2000' },
  { slug: 'any-muscle-gain-2500', supermarket: 'any', goal: 'muscle-gain', calories: 2500, dietType: 'standard', title: 'Muscle Gain 2500' },
  { slug: 'any-cutting-1400', supermarket: 'any', goal: 'cutting', calories: 1400, dietType: 'standard', title: 'Cutting 1400' },
  { slug: 'any-high-protein-low-cal-1500', supermarket: 'any', goal: 'high-protein-low-cal', calories: 1500, dietType: 'standard', title: 'HP 1500' },
  { slug: 'any-high-protein-low-cal-1800', supermarket: 'any', goal: 'high-protein-low-cal', calories: 1800, dietType: 'standard', title: 'HP 1800' },
  { slug: 'any-weight-loss-1500', supermarket: 'any', goal: 'weight-loss', calories: 1500, dietType: 'standard', title: 'WL 1500' },
  { slug: 'any-vegan-low-cal-1500', supermarket: 'any', goal: 'vegan-low-cal', calories: 1500, dietType: 'vegan', title: 'Vegan 1500' },
  { slug: 'any-cheap-student-1500', supermarket: 'any', goal: 'cheap-student', calories: 1500, dietType: 'standard', title: 'Student 1500' },
  { slug: 'lidl-high-protein-low-cal-1500', supermarket: 'lidl', goal: 'high-protein-low-cal', calories: 1500, dietType: 'standard', title: 'Lidl HP 1500' },
  { slug: 'aldi-high-protein-low-cal-1500', supermarket: 'aldi', goal: 'high-protein-low-cal', calories: 1500, dietType: 'standard', title: 'Aldi HP 1500' },
  { slug: 'tesco-weight-loss-1500', supermarket: 'tesco', goal: 'weight-loss', calories: 1500, dietType: 'standard', title: 'Tesco WL 1500' },
];

const index = buildPlanIndex(FIXTURE);
const emailablePlans = new Set(FIXTURE.map(p => p.slug));
const resolve = (slug, exactPlanLinks = []) =>
  resolveBlogPlanSlug({ slug, exactPlanLinks, index, emailablePlans });

test('the committed index covers every blog post', () => {
  const missing = Object.keys(blogPostsData).filter(slug => !BLOG_PLAN_INDEX[slug]?.planSlug);
  assert.deepEqual(missing, [], 'blog posts with no plan pairing in the committed index');
});

test('the committed index never offers an empty or malformed pairing', () => {
  for (const [slug, entry] of Object.entries(BLOG_PLAN_INDEX)) {
    assert.ok(entry.planSlug, `${slug} has no planSlug`);
    assert.ok(entry.title, `${slug} has no plan title to show the reader`);
  }
});

test('a supermarket in the slug keeps the reader on that supermarket', () => {
  for (const [slug, market] of [
    ['lidl-high-protein-food-ideas-uk', 'lidl'],
    ['aldi-high-protein-shopping-list-uk', 'aldi'],
    ['tesco-low-calorie-meal-plan', 'tesco'],
  ]) {
    assert.equal(detectSupermarket(slug), market);
    assert.ok(
      resolve(slug).startsWith(`${market}-`),
      `${slug} should match a ${market} plan, got ${resolve(slug)}`,
    );
  }
});

test('a calorie-led post gets a plan at that calorie target', () => {
  assert.equal(detectCalories('1400-calorie-meal-plan-uk'), 1400);
  assert.equal(resolve('1400-calorie-meal-plan-uk'), 'any-cutting-1400');
  assert.equal(resolve('2500-calorie-meal-plan'), 'any-muscle-gain-2500');
});

test('a calorie-led post prefers an everyday goal over a training programme', () => {
  // 2000 kcal exists under both maintenance and muscle-gain. A reader
  // searching the bare number is not necessarily bulking.
  assert.equal(resolve('2000-calorie-meal-plan'), 'any-maintenance-2000');
});

test('a dietary slug does not resolve to a plan that breaks the diet', () => {
  assert.equal(detectDiet('vegan-meal-prep-uk'), 'vegan');
  assert.equal(resolve('vegan-meal-prep-uk'), 'any-vegan-low-cal-1500');
});

test('editorial plan links win over the heuristic, and hub routes are skipped', () => {
  assert.equal(
    resolve('anything-at-all', [
      { to: '/meal-plans/a-hub-page-not-a-plan' },
      { to: '/plans/any-cutting-1400' },
    ]),
    'any-cutting-1400',
  );
});

test('an unmatched post still falls back to a buildable plan', () => {
  assert.equal(resolve('a-post-about-nothing-in-particular'), 'any-high-protein-low-cal-1500');
});

test('goal detection reads the post, not the calorie number', () => {
  assert.equal(detectGoal('student-meal-prep-budget-uk'), 'cheap-student');
  assert.equal(detectGoal('1400-calorie-meal-plan-uk'), null);
});
