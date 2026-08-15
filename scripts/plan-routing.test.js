// Journey-level routing contract: what a card says must be what the user gets.
//
// The defect this protects against was invisible to every existing test. Each
// destination page existed, returned 200, had valid nutrition and valid
// recipes, and passed its own route checks — while the card that led there
// promised a different plan. Page-level correctness cannot catch that; only an
// assertion about the *relationship* between a card and its destination can.
//
// The tests are therefore written as general properties over the whole
// combination space, with a targeted regression for the reported case so the
// exact failure cannot return even if the property is later weakened.
import test from 'node:test';
import assert from 'node:assert/strict';

import { getAllPlanMeta, getPlanBySlug } from '../src/utils/planBuilder.js';
import {
  candidatePlans,
  comparePlansForIntent,
  planMatchesIntent,
  recommendPlanForIntent,
} from '../src/utils/planRecommendation.js';
import { planCardTitle } from '../src/utils/planCardMeta.js';
import {
  CALORIE_CHOICES,
  DIET_CHOICES,
  GOAL_CHOOSER_ITEMS,
  INDEXED_SUPERMARKET_CHOICES,
} from '../src/data/planChooser.js';

const ALL_PLANS = getAllPlanMeta();

// Every card the chooser pages can render, described by the intent it displays.
function everyCardIntent() {
  const intents = [];

  // /choose-supermarket/:supermarket — one card per goal.
  for (const market of INDEXED_SUPERMARKET_CHOICES) {
    for (const goal of GOAL_CHOOSER_ITEMS) {
      intents.push({
        label: `choose-supermarket/${market.value} → ${goal.value}`,
        intent: { supermarket: market.value, goal: goal.value, targetCalories: goal.defaultCalories },
      });
    }
  }

  // /choose-plan/:goal — one card per supermarket.
  for (const goal of GOAL_CHOOSER_ITEMS) {
    for (const market of INDEXED_SUPERMARKET_CHOICES) {
      intents.push({
        label: `choose-plan/${goal.value} → ${market.value}`,
        intent: { goal: goal.value, supermarket: market.value, targetCalories: goal.defaultCalories },
      });
    }
  }

  // /choose-diet/:diet — one card per supermarket.
  for (const diet of DIET_CHOICES) {
    for (const market of INDEXED_SUPERMARKET_CHOICES) {
      intents.push({
        label: `choose-diet/${diet.value} → ${market.value}`,
        intent: {
          supermarket: market.value,
          dietType: diet.dietType,
          goal: diet.defaultGoal,
          targetCalories: diet.defaultCalories,
        },
      });
    }
  }

  // /choose-calories/:calories — one card per goal.
  for (const calorie of CALORIE_CHOICES) {
    for (const goal of GOAL_CHOOSER_ITEMS) {
      intents.push({
        label: `choose-calories/${calorie.value} → ${goal.value}`,
        intent: { calories: calorie.calories, goal: goal.value, targetCalories: calorie.calories },
      });
    }
  }

  return intents;
}

const CARD_INTENTS = everyCardIntent();

test('the routing matrix covers every chooser combination the site can render', () => {
  const expected = (INDEXED_SUPERMARKET_CHOICES.length * GOAL_CHOOSER_ITEMS.length * 2)
    + (DIET_CHOICES.length * INDEXED_SUPERMARKET_CHOICES.length)
    + (CALORIE_CHOICES.length * GOAL_CHOOSER_ITEMS.length);
  assert.equal(CARD_INTENTS.length, expected);
  assert.ok(CARD_INTENTS.length >= 300, 'combination space unexpectedly small');
});

// ── Property: identity survives navigation ───────────────────────────────────

test('every card resolves to a plan with exactly the identity the card displays', () => {
  const failures = [];
  for (const { label, intent } of CARD_INTENTS) {
    const plan = recommendPlanForIntent(ALL_PLANS, intent);
    if (!plan) continue; // no plan for this combination is handled separately
    if (!planMatchesIntent(plan, intent)) failures.push(`${label}: resolved ${plan.slug}`);
  }
  assert.deepEqual(failures, []);
});

test('the destination page delivers the same identity the card resolved', () => {
  const failures = [];
  for (const { label, intent } of CARD_INTENTS) {
    const card = recommendPlanForIntent(ALL_PLANS, intent);
    if (!card) continue;

    const destination = getPlanBySlug(card.slug);
    assert.ok(destination, `${label}: /plans/${card.slug} does not resolve`);

    for (const field of ['goal', 'supermarket', 'dietType', 'calories']) {
      if (destination[field] !== card[field]) {
        failures.push(`${label}: destination.${field}=${destination[field]} card.${field}=${card[field]}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test('the title a card displays is the destination plan own title', () => {
  // This is the half of the fix that makes the failure class impossible rather
  // than merely unlikely: even when the only available plan is a specialised
  // variant, the card cannot advertise a plainer one.
  const failures = [];
  for (const { label, intent } of CARD_INTENTS) {
    const card = recommendPlanForIntent(ALL_PLANS, intent);
    if (!card) continue;
    const destination = getPlanBySlug(card.slug);
    if (planCardTitle(destination.title) !== planCardTitle(card.title)) failures.push(label);
  }
  assert.deepEqual(failures, []);
});

// ── Negative identity: overlapping goals must not absorb each other ──────────

test('a goal card never resolves to a different goal that shares words with it', () => {
  // "weight-loss" must not resolve to a plan whose canonical goal is
  // "budget-fat-loss" or any other goal, no matter how similar their titles.
  const failures = [];
  for (const market of INDEXED_SUPERMARKET_CHOICES) {
    for (const goal of GOAL_CHOOSER_ITEMS) {
      const plan = recommendPlanForIntent(ALL_PLANS, {
        supermarket: market.value,
        goal: goal.value,
        targetCalories: goal.defaultCalories,
      });
      if (!plan) continue;
      assert.equal(plan.goal, goal.value);
      for (const other of GOAL_CHOOSER_ITEMS) {
        if (other.value !== goal.value && plan.goal === other.value) {
          failures.push(`${market.value}/${goal.value} leaked into ${other.value}`);
        }
      }
    }
  }
  assert.deepEqual(failures, []);
});

test('a diet card never resolves to a plan of a different diet', () => {
  for (const diet of DIET_CHOICES) {
    for (const market of INDEXED_SUPERMARKET_CHOICES) {
      const plan = recommendPlanForIntent(ALL_PLANS, {
        supermarket: market.value,
        dietType: diet.dietType,
        goal: diet.defaultGoal,
        targetCalories: diet.defaultCalories,
      });
      if (!plan) continue;
      assert.equal(plan.dietType, diet.dietType, `${diet.value}/${market.value}`);
      assert.equal(plan.supermarket, market.value);
    }
  }
});

test('a calorie card resolves to a plan at that exact calorie target', () => {
  for (const calorie of CALORIE_CHOICES) {
    for (const goal of GOAL_CHOOSER_ITEMS) {
      const plan = recommendPlanForIntent(ALL_PLANS, {
        calories: calorie.calories,
        goal: goal.value,
        targetCalories: calorie.calories,
      });
      if (!plan) continue;
      assert.equal(plan.calories, calorie.calories, `${calorie.value}/${goal.value}`);
    }
  }
});

// ── Targeted regression for the reported failure ─────────────────────────────

test('regression: reported supermarket goal cards open their plain canonical plan', () => {
  // Reported live: "Lidl Weight Loss Plan" opened "Lidl Very Cheap Batch Cook
  // Weight Loss Plan - 1,500 kcal" because `batch` effort outscored `standard`
  // by one point. These four supermarkets were the ones a user hit by hand.
  const reported = [
    ['lidl', 'weight-loss'],
    ['lidl', 'high-protein-low-cal'],
    ['waitrose', 'weight-loss'],
    ['asda', 'weight-loss'],
    ['morrisons', 'weight-loss'],
  ];

  for (const [supermarket, goalValue] of reported) {
    const goal = GOAL_CHOOSER_ITEMS.find(item => item.value === goalValue);
    const plan = recommendPlanForIntent(ALL_PLANS, {
      supermarket,
      goal: goalValue,
      targetCalories: goal.defaultCalories,
    });
    assert.ok(plan, `${supermarket}/${goalValue} resolved nothing`);
    assert.equal(plan.supermarket, supermarket);
    assert.equal(plan.goal, goalValue);
    assert.equal(plan.calories, goal.defaultCalories);
    assert.equal(plan.dietType, 'standard');
    assert.notEqual(
      plan.effort,
      'batch',
      `${supermarket}/${goalValue} picked a batch-cook variant over the neutral plan`,
    );
  }
});

test('regression: where a base plan exists the card opens it, not a variant', () => {
  // `{supermarket}-{goal}-{calories}` is the unqualified plan for an identity.
  for (const [supermarket, goalValue] of [
    ['lidl', 'weight-loss'],
    ['aldi', 'weight-loss'],
    ['tesco', 'weight-loss'],
    ['morrisons', 'weight-loss'],
    ['lidl', 'high-protein-low-cal'],
  ]) {
    const goal = GOAL_CHOOSER_ITEMS.find(item => item.value === goalValue);
    const baseSlug = `${supermarket}-${goalValue}-${goal.defaultCalories}`;
    if (!ALL_PLANS.some(plan => plan.slug === baseSlug)) continue;
    const resolved = recommendPlanForIntent(ALL_PLANS, {
      supermarket,
      goal: goalValue,
      targetCalories: goal.defaultCalories,
    });
    assert.equal(resolved.slug, baseSlug);
  }
});

// ── Resolver behaviour ───────────────────────────────────────────────────────

test('the resolver returns null rather than an unrelated plan when nothing matches', () => {
  assert.equal(
    recommendPlanForIntent(ALL_PLANS, { supermarket: 'not-a-supermarket', goal: 'weight-loss' }),
    null,
  );
  assert.equal(
    recommendPlanForIntent(ALL_PLANS, { supermarket: 'lidl', goal: 'not-a-goal' }),
    null,
  );
  assert.equal(recommendPlanForIntent([], { goal: 'weight-loss' }), null);
});

test('resolution does not depend on the order candidates arrive in', () => {
  // A `.find()`-style resolver silently returns whichever similar plan happens
  // to come first. Reversing and rotating the candidate list must not change
  // the answer.
  const reversed = [...ALL_PLANS].reverse();
  const rotated = [...ALL_PLANS.slice(500), ...ALL_PLANS.slice(0, 500)];

  for (const market of INDEXED_SUPERMARKET_CHOICES) {
    for (const goal of GOAL_CHOOSER_ITEMS) {
      const intent = { supermarket: market.value, goal: goal.value, targetCalories: goal.defaultCalories };
      const base = recommendPlanForIntent(ALL_PLANS, intent);
      assert.equal(recommendPlanForIntent(reversed, intent)?.slug, base?.slug, `${market.value}/${goal.value} reversed`);
      assert.equal(recommendPlanForIntent(rotated, intent)?.slug, base?.slug, `${market.value}/${goal.value} rotated`);
    }
  }
});

test('candidate filtering never admits a plan of the wrong identity', () => {
  for (const market of INDEXED_SUPERMARKET_CHOICES) {
    const intent = { supermarket: market.value, goal: 'weight-loss' };
    for (const plan of candidatePlans(ALL_PLANS, intent)) {
      assert.equal(plan.supermarket, market.value);
      assert.equal(plan.goal, 'weight-loss');
    }
  }
});

test('the comparator is a strict ordering, so ranking cannot be ambiguous', () => {
  const intent = { supermarket: 'lidl', goal: 'weight-loss', targetCalories: 1500 };
  const compare = comparePlansForIntent(intent);
  const candidates = candidatePlans(ALL_PLANS, intent);
  assert.ok(candidates.length > 1, 'need several candidates to test ordering');

  for (const a of candidates) {
    assert.equal(compare(a, a), 0);
    for (const b of candidates) {
      // `+ 0` normalises -0, which strict assert would otherwise treat as
      // different from 0.
      assert.equal(
        Math.sign(compare(a, b)) + Math.sign(compare(b, a)) + 0,
        0,
        `${a.slug} vs ${b.slug} is not antisymmetric`,
      );
      if (a.slug !== b.slug) assert.notEqual(compare(a, b), 0, `${a.slug} ties with ${b.slug}`);
    }
  }
});

// ── Source-of-truth identifiers ──────────────────────────────────────────────

test('plan slugs are unique, so a card can never address two plans', () => {
  const seen = new Map();
  const duplicates = [];
  for (const plan of ALL_PLANS) {
    if (seen.has(plan.slug)) duplicates.push(plan.slug);
    seen.set(plan.slug, plan);
  }
  assert.deepEqual(duplicates, []);
});

test('chooser vocabularies have unique ids and resolve against real plan data', () => {
  const unique = items => new Set(items).size === items.length;
  assert.ok(unique(GOAL_CHOOSER_ITEMS.map(item => item.value)), 'duplicate goal id');
  assert.ok(unique(INDEXED_SUPERMARKET_CHOICES.map(item => item.value)), 'duplicate supermarket id');
  assert.ok(unique(DIET_CHOICES.map(item => item.value)), 'duplicate diet id');
  assert.ok(unique(CALORIE_CHOICES.map(item => item.value)), 'duplicate calorie id');

  const realGoals = new Set(ALL_PLANS.map(plan => plan.goal));
  const realMarkets = new Set(ALL_PLANS.map(plan => plan.supermarket));
  for (const goal of GOAL_CHOOSER_ITEMS) {
    assert.ok(realGoals.has(goal.value), `goal ${goal.value} matches no plan`);
  }
  for (const market of INDEXED_SUPERMARKET_CHOICES) {
    assert.ok(realMarkets.has(market.value), `supermarket ${market.value} matches no plan`);
  }
});

test('no chooser page silently renders an empty grid', () => {
  // A page whose every card resolved to null would look broken. Each chooser
  // page must still offer at least one real plan.
  for (const market of INDEXED_SUPERMARKET_CHOICES) {
    const resolved = GOAL_CHOOSER_ITEMS
      .map(goal => recommendPlanForIntent(ALL_PLANS, {
        supermarket: market.value, goal: goal.value, targetCalories: goal.defaultCalories,
      }))
      .filter(Boolean);
    assert.ok(resolved.length > 0, `/choose-supermarket/${market.value} has no plans at all`);
  }
  for (const goal of GOAL_CHOOSER_ITEMS) {
    const resolved = INDEXED_SUPERMARKET_CHOICES
      .map(market => recommendPlanForIntent(ALL_PLANS, {
        goal: goal.value, supermarket: market.value, targetCalories: goal.defaultCalories,
      }))
      .filter(Boolean);
    assert.ok(resolved.length > 0, `/choose-plan/${goal.value} has no plans at all`);
  }
});

// ── The chooser pages must keep using the shared resolver ────────────────────

test('chooser pages use the shared resolver rather than a local score', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

  for (const page of ['src/pages/ChoiceLandingPage.jsx', 'src/pages/PlanChooserPage.jsx']) {
    const source = fs.readFileSync(path.join(root, page), 'utf8');
    assert.ok(
      source.includes('recommendPlanForIntent'),
      `${page} must resolve cards through the shared recommender`,
    );
    assert.ok(
      !/function scorePlan\(/.test(source),
      `${page} reintroduced a local additive score — that is how the two pages drifted apart`,
    );
  }
});
