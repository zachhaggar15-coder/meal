// Supermarket-specific editorial substance.
//
// An audit found that supermarket-named articles would survive a find-and-
// replace of the store name: general meal-prep advice with a retailer named in
// the introduction. These tests hold the line, because the failure is quiet —
// a page stays technically fine while ceasing to be about its retailer.
import test from 'node:test';
import assert from 'node:assert/strict';

import { SUPERMARKET_PROFILES } from '../src/data/supermarketProfiles.js';
import {
  buildSupermarketContext,
  buildSupermarketPlanSummary,
  supermarketsWithEvidence,
} from '../src/utils/supermarketContext.js';
import { blogPostsData } from '../src/data/blogPosts.js';
import { getAllPlanMeta } from '../src/utils/planBuilder.js';

const PLAN_SLUGS = new Set(getAllPlanMeta().map(plan => plan.slug));

// ── The evidence itself must be real and traceable ──────────────────────────

test('every researched retailer records a source and the date it was checked', () => {
  const problems = [];
  for (const key of supermarketsWithEvidence()) {
    const evidence = SUPERMARKET_PROFILES[key].mealPrepEvidence;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(evidence.checked || '')) problems.push(`${key}: no check date`);
    if (!evidence.source) problems.push(`${key}: no source named`);
    if (!/^https:\/\//.test(evidence.sourceUrl || '')) problems.push(`${key}: no source URL`);
    if (!evidence.angle || evidence.angle.length < 60) problems.push(`${key}: no substantive angle`);
    if (!Array.isArray(evidence.findings) || evidence.findings.length < 2) {
      problems.push(`${key}: fewer than two findings`);
    }
  }
  assert.deepEqual(problems, []);
});

test('retailer evidence points at that retailer own site', () => {
  // A finding sourced from a third-party SEO article is not first-party
  // evidence, which is the whole point of the field.
  const expectedHost = {
    aldi: 'aldi.co.uk',
    lidl: 'lidl.co.uk',
    tesco: 'tesco.com',
    asda: 'asda.com',
    sainsburys: 'sainsburys.co.uk',
    morrisons: 'morrisons.com',
    iceland: 'iceland.co.uk',
  };
  for (const key of supermarketsWithEvidence()) {
    const host = expectedHost[key];
    if (!host) continue;
    const url = SUPERMARKET_PROFILES[key].mealPrepEvidence.sourceUrl;
    assert.ok(url.includes(host), `${key}: source ${url} is not ${host}`);
  }
});

test('no retailer evidence quotes a price, which would decay within weeks', () => {
  const offenders = [];
  for (const key of supermarketsWithEvidence()) {
    const evidence = SUPERMARKET_PROFILES[key].mealPrepEvidence;
    const text = [evidence.angle, ...(evidence.findings || [])].join(' ');
    if (/£\s?\d/.test(text)) offenders.push(`${key}: quotes a price`);
    if (/\b(cheapest|best value supermarket|lowest price)\b/i.test(text)) {
      offenders.push(`${key}: makes a cheapest-supermarket claim`);
    }
    if (/\bwe (tried|tested|tasted|bought)\b/i.test(text)) {
      offenders.push(`${key}: implies first-hand shopping we have not done`);
    }
  }
  assert.deepEqual(offenders, []);
});

test('each retailer angle is distinct, not a template with the name swapped', () => {
  const angles = supermarketsWithEvidence()
    .map(key => SUPERMARKET_PROFILES[key].mealPrepEvidence.angle);
  assert.equal(new Set(angles).size, angles.length, 'two retailers share an angle');

  // And the angle must not simply be the retailer name plus generic filler:
  // strip the name and the remainder should still be substantial.
  for (const key of supermarketsWithEvidence()) {
    const { label, mealPrepEvidence } = SUPERMARKET_PROFILES[key];
    const withoutName = mealPrepEvidence.angle.replaceAll(label, '').trim();
    assert.ok(withoutName.length > 80, `${key}: angle is mostly the store name`);
  }
});

// ── First-party plan data ───────────────────────────────────────────────────

test('retailer plan summaries are computed from real plans', () => {
  for (const key of supermarketsWithEvidence()) {
    const summary = buildSupermarketPlanSummary(key);
    assert.ok(summary, `${key}: no plan summary`);
    const actual = getAllPlanMeta().filter(plan => plan.supermarket === key).length;
    assert.equal(summary.planCount, actual, `${key}: plan count does not match the library`);
    assert.ok(summary.examplePlan && PLAN_SLUGS.has(summary.examplePlan.slug), `${key}: example plan does not exist`);
    assert.ok(summary.calorieRange.min <= summary.calorieRange.max);
    assert.ok(summary.medianProtein > 0, `${key}: implausible protein figure`);
  }
});

test('two retailers never produce an identical plan summary', () => {
  const summaries = supermarketsWithEvidence().map(key => {
    const { examplePlan: _examplePlan, ...rest } = buildSupermarketPlanSummary(key) || {};
    return JSON.stringify(rest);
  });
  assert.equal(new Set(summaries).size, summaries.length, 'retailer plan summaries are not differentiating');
});

// ── Articles are wired to their retailer ────────────────────────────────────

test('every supermarket-intent article declares which retailers it is about', () => {
  // Derived from the slug so a new retailer article cannot ship untagged.
  const RETAILER_IN_SLUG = /\b(aldi|lidl|tesco|asda|sainsburys|morrisons|iceland|waitrose|ocado)\b/;
  const untagged = [];
  for (const [slug, post] of Object.entries(blogPostsData)) {
    if (!RETAILER_IN_SLUG.test(slug)) continue;
    if (!Array.isArray(post.supermarkets) || !post.supermarkets.length) untagged.push(slug);
  }
  assert.deepEqual(untagged, [], 'these retailer articles carry no supermarkets tag');
});

test('article retailer tags name retailers the site actually knows', () => {
  const invalid = [];
  for (const [slug, post] of Object.entries(blogPostsData)) {
    for (const retailer of post.supermarkets || []) {
      if (!SUPERMARKET_PROFILES[retailer]) invalid.push(`${slug} -> ${retailer}`);
    }
  }
  assert.deepEqual(invalid, []);
});

test('every tagged article can render real retailer substance', () => {
  // The tag is only worth anything if it resolves to evidence or plan data.
  const empty = [];
  for (const [slug, post] of Object.entries(blogPostsData)) {
    for (const retailer of post.supermarkets || []) {
      const context = buildSupermarketContext(retailer);
      if (!context || (!context.evidence && !context.planSummary)) empty.push(`${slug} -> ${retailer}`);
    }
  }
  assert.deepEqual(empty, []);
});
