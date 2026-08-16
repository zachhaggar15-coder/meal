// Quiz outcome contracts: answers -> interpreted preferences -> recommendation
// -> destination.
//
// The quiz is a ranking system, not an exact resolver, so it is *allowed* to
// return a plan that does not satisfy everything. What it must never do is
// return one silently. These tests therefore separate two things that look
// identical from the outside:
//
//   an acceptable explicit compromise — the plan misses something and the
//   result says so, in matchDetails, matchSummary and compromises; and
//   a silent wrong recommendation — the plan misses something and the result
//   presents it as satisfied.
//
// They also probe the specific failure classes that produced the chooser
// routing defect: additive scoring letting a low-priority preference outweigh a
// high-priority one, first-match/array-order resolution, and a display label
// that disagrees with the destination.
import test from 'node:test';
import assert from 'node:assert/strict';

import { getTopMatches } from '../src/utils/quizScorer.js';
import { INDEXABLE_PLAN_SEEDS } from '../src/data/planSeeds.js';
import { getAllPlanMeta, getPlanBySlug } from '../src/utils/planBuilder.js';

const ALL_PLANS = getAllPlanMeta();
const PLANS_BY_SLUG = new Map(ALL_PLANS.map(plan => [plan.slug, plan]));

// Representative profiles across every dimension the quiz actually offers.
// Each is a real combination a user could select, not a synthetic fixture.
const PROFILES = [
  {
    name: 'Aldi weight loss, 1500 kcal, very cheap, standard prep',
    answers: { goal: 'weight-loss', diet: 'standard', supermarket: 'aldi', calories: '1500', budget: 'very-cheap', effort: 'standard' },
  },
  {
    name: 'Lidl vegan, 1500 kcal, budget, standard prep',
    answers: { goal: 'vegan-low-cal', diet: 'vegan', supermarket: 'lidl', calories: '1500', budget: 'budget', effort: 'standard' },
  },
  {
    name: 'Tesco pescatarian, 1800 kcal, moderate, standard prep',
    answers: { goal: 'pescatarian', diet: 'pescatarian', supermarket: 'tesco', calories: '1800', budget: 'moderate', effort: 'standard' },
  },
  {
    name: 'Asda muscle gain, 3000 kcal, budget, batch cooking',
    answers: { goal: 'muscle-gain', diet: 'standard', supermarket: 'asda', calories: '3000', budget: 'budget', effort: 'batch' },
  },
  {
    name: 'Vegetarian, high protein, Sainsbury\'s, 1800 kcal',
    answers: { goal: 'high-protein-vegetarian', diet: 'vegetarian', supermarket: 'sainsburys', calories: '1800', budget: 'moderate', effort: 'batch' },
  },
  {
    name: 'Iceland low effort, 1800 kcal, very cheap',
    answers: { goal: 'low-effort', diet: 'standard', supermarket: 'iceland', calories: '1800', budget: 'very-cheap', effort: 'minimal' },
  },
  {
    name: 'No supermarket preference, budget fat loss',
    answers: { goal: 'budget-fat-loss', diet: 'standard', supermarket: 'any', calories: '1500', budget: 'very-cheap', effort: 'standard' },
  },
  {
    name: 'Unsure about calories',
    answers: { goal: 'weight-loss', diet: 'standard', supermarket: 'tesco', calories: 'unsure', budget: 'budget', effort: 'standard' },
  },
  {
    name: 'Preset macro preference',
    answers: { goal: 'muscle-gain', diet: 'standard', supermarket: 'aldi', calories: '2500', budget: 'budget', effort: 'batch', macroMode: 'preset', macros: { protein: 70, carbs: 60, fats: 40, fibre: 50 } },
  },
  {
    name: 'Custom macro grams',
    answers: { goal: 'muscle-gain', diet: 'standard', supermarket: 'tesco', calories: '2500', budget: 'moderate', effort: 'batch', macroMode: 'custom-grams', macros: { protein: 180, carbs: 260, fats: 80, fibre: 35 } },
  },
];

// A profile that cannot be satisfied exactly: Waitrose has no cheap-student
// plan, so the quiz has to compromise on something and say which.
const NEAR_MATCH_PROFILE = {
  name: 'Waitrose cheap student (no such plan exists)',
  answers: { goal: 'cheap-student', diet: 'standard', supermarket: 'waitrose', calories: '1800', budget: 'very-cheap', effort: 'standard' },
};

// ── The recommendation is a real, reachable plan ─────────────────────────────

test('every profile returns recommendations that resolve to real plans', () => {
  for (const profile of [...PROFILES, NEAR_MATCH_PROFILE]) {
    const matches = getTopMatches(profile.answers, 3);
    assert.ok(matches.length > 0, `${profile.name}: no recommendation at all`);
    for (const match of matches) {
      assert.ok(PLANS_BY_SLUG.has(match.slug), `${profile.name}: ${match.slug} is not a real plan`);
      assert.ok(getPlanBySlug(match.slug), `${profile.name}: /plans/${match.slug} does not build`);
    }
  }
});

test('the recommendation card describes the plan it links to', () => {
  // The chooser defect was a card describing one plan and opening another.
  for (const profile of [...PROFILES, NEAR_MATCH_PROFILE]) {
    for (const match of getTopMatches(profile.answers, 3)) {
      const destination = getPlanBySlug(match.slug);
      for (const field of ['goal', 'supermarket', 'calories', 'dietType']) {
        assert.equal(
          match[field],
          destination[field],
          `${profile.name}: card ${field}=${match[field]} but /plans/${match.slug} is ${destination[field]}`,
        );
      }
      assert.equal(match.title, destination.title, `${profile.name}: title differs from destination`);
    }
  }
});

// ── Preferences are actually interpreted ─────────────────────────────────────

test('a stated diet is never violated, across every supermarket the quiz offers', () => {
  // Diet is the one dimension where the wrong answer is not a compromise but a
  // failure. Exhaustive rather than sampled: four supermarkets genuinely have
  // no vegan, vegetarian or pescatarian plans at all, and the quiz must fall
  // back to a generic-supermarket plan that still honours the diet rather than
  // to a local plan that does not.
  const supermarkets = [...new Set(INDEXABLE_PLAN_SEEDS.map(seed => seed.supermarket))];
  const diets = {
    vegan: 'vegan-low-cal',
    vegetarian: 'vegetarian-low-cal',
    pescatarian: 'pescatarian',
  };

  let checked = 0;
  for (const [diet, goal] of Object.entries(diets)) {
    for (const supermarket of supermarkets) {
      for (const calories of ['1500', '1800']) {
        const matches = getTopMatches({ goal, diet, supermarket, calories, budget: 'budget', effort: 'standard' }, 3);
        assert.ok(matches.length > 0, `${diet}/${supermarket}/${calories}: no recommendation`);
        for (const match of matches) {
          checked += 1;
          if (match.dietType === diet) continue;
          // If a non-matching diet is ever recommended it must be declared.
          const flagged = match.compromises.some(item => item.type === 'diet');
          assert.ok(
            flagged,
            `${diet}/${supermarket}/${calories}: recommended ${match.slug} (${match.dietType}) with no diet compromise`,
          );
        }
      }
    }
  }
  assert.ok(checked > 150, `expected broad coverage, only checked ${checked} recommendations`);
});

test('a supermarket with no plans for a diet falls back generically, not to the wrong diet', () => {
  // Waitrose, Ocado, M&S and Co-op have no vegan plans. The honest answer is a
  // generic-supermarket vegan plan with the supermarket difference stated --
  // not a Waitrose plan that is not vegan.
  for (const supermarket of ['waitrose', 'ocado', 'marks-spencer', 'coop']) {
    const hasOwn = INDEXABLE_PLAN_SEEDS.some(seed => seed.supermarket === supermarket && seed.dietType === 'vegan');
    if (hasOwn) continue; // data has since filled the gap

    const best = getTopMatches({ goal: 'vegan-low-cal', diet: 'vegan', supermarket, calories: '1500', budget: 'moderate', effort: 'standard' }, 1)[0];
    assert.equal(best.dietType, 'vegan', `${supermarket}: fell back to a ${best.dietType} plan for a vegan user`);
    assert.ok(
      best.compromises.some(item => item.type === 'supermarket'),
      `${supermarket}: substituted a different supermarket without saying so`,
    );
    assert.ok(!best.isExactMatch, `${supermarket}: a substituted plan was flagged as an exact match`);
  }
});

test('a stated supermarket is either honoured or the difference is stated', () => {
  for (const supermarket of ['aldi', 'lidl', 'tesco', 'asda', 'morrisons', 'iceland', 'waitrose']) {
    for (const match of getTopMatches({ goal: 'weight-loss', diet: 'standard', supermarket, calories: '1500', budget: 'budget', effort: 'standard' }, 3)) {
      if (match.supermarket === supermarket) continue;
      const flagged = match.compromises.find(item => item.type === 'supermarket');
      assert.ok(flagged, `${supermarket}: recommended a ${match.supermarket} plan with no supermarket compromise`);
      assert.ok(flagged.text.length > 10, `${supermarket}: compromise text is not explanatory`);
    }
  }
});

test('a calorie target more than the tolerance away is reported as a trade-off', () => {
  for (const match of getTopMatches({ goal: 'weight-loss', diet: 'standard', supermarket: 'aldi', calories: '1500', budget: 'budget', effort: 'standard' }, 10)) {
    const detail = match.matchDetails.find(item => item.type === 'calories');
    if (!detail) continue;
    const diff = Math.abs(match.calories - 1500);
    if (diff <= 100) assert.equal(detail.status, 'exact', `${match.slug} is ${diff} kcal away but reported exact`);
    else if (diff <= 300) assert.equal(detail.status, 'close', `${match.slug} is ${diff} kcal away but reported ${detail.status}`);
    else assert.equal(detail.status, 'tradeoff', `${match.slug} is ${diff} kcal away but reported ${detail.status}`);
  }
});

// ── Exact match beats near match ─────────────────────────────────────────────

test('when a plan satisfies everything it is ranked first and scores 100', () => {
  // Built from real seeds so the profile is guaranteed satisfiable.
  const probes = INDEXABLE_PLAN_SEEDS.filter(seed => (
    ['aldi', 'tesco', 'lidl', 'asda'].includes(seed.supermarket) && seed.dietType === 'standard'
  )).slice(0, 12);

  for (const seed of probes) {
    const answers = {
      goal: seed.goal,
      diet: seed.dietType,
      supermarket: seed.supermarket,
      calories: String(seed.calories),
      budget: seed.budget,
      effort: seed.effort,
    };
    const matches = getTopMatches(answers, 5);
    assert.equal(matches[0].score, 100, `${seed.slug}: a fully satisfying profile did not score 100`);
    assert.ok(matches[0].isExactMatch, `${seed.slug}: top match not flagged exact`);
    assert.equal(matches[0].compromises.length, 0, `${seed.slug}: top match has compromises`);

    // No plan that compromises on anything may outrank one that compromises on
    // nothing — that is the additive-scoring failure the chooser suffered.
    const firstCompromised = matches.findIndex(match => match.compromises.length > 0);
    const lastClean = matches.map(match => match.compromises.length === 0).lastIndexOf(true);
    if (firstCompromised !== -1) {
      assert.ok(firstCompromised > lastClean, `${seed.slug}: a compromised plan outranked a clean one`);
    }
  }
});

test('isExactMatch means every dimension was satisfied, not merely within tolerance', () => {
  // A 1,800 kcal plan for a 1,500 kcal request sits inside the near-miss
  // threshold and raises no compromise, but it is not an exact match.
  const matches = getTopMatches({ goal: 'weight-loss', diet: 'standard', supermarket: 'aldi', calories: '1500', budget: 'very-cheap', effort: 'standard' }, 10);
  for (const match of matches) {
    if (!match.isExactMatch) continue;
    assert.ok(
      match.matchDetails.every(item => item.status === 'exact'),
      `${match.slug} claims an exact match while reporting ${match.matchSummary}`,
    );
    assert.equal(match.calories, 1500, `${match.slug} claims exact but is ${match.calories} kcal`);
    assert.equal(match.supermarket, 'aldi');
    assert.equal(match.goal, 'weight-loss');
  }
});

// ── Compromises are visible, never silent ────────────────────────────────────

test('an unsatisfiable profile compromises openly rather than silently', () => {
  const matches = getTopMatches(NEAR_MATCH_PROFILE.answers, 3);
  const best = matches[0];

  const satisfiesEverything = best.goal === 'cheap-student'
    && best.supermarket === 'waitrose'
    && best.calories === 1800;

  assert.ok(!satisfiesEverything, 'test premise changed: Waitrose now has a cheap-student plan');
  assert.ok(best.compromises.length > 0, 'a plan that cannot satisfy the answers reported no compromise');
  assert.ok(!best.isExactMatch, 'a compromised plan was flagged as an exact match');
  assert.ok(best.matchSummary && best.matchSummary.length > 0, 'no match summary rendered');
  assert.notEqual(best.matchLabel, 'Best Match', 'a compromised plan was labelled Best Match');
});

test('a hard miss caps the match label however high the score', () => {
  for (const profile of [...PROFILES, NEAR_MATCH_PROFILE]) {
    for (const match of getTopMatches(profile.answers, 3)) {
      if (!match.compromises.some(item => item.severity === 'hard')) continue;
      assert.equal(
        match.matchLabel,
        'Closest Match',
        `${profile.name}: ${match.slug} has a hard miss but is labelled "${match.matchLabel}"`,
      );
    }
  }
});

test('every compromise names the dimension and reads as a sentence', () => {
  for (const profile of [...PROFILES, NEAR_MATCH_PROFILE]) {
    for (const match of getTopMatches(profile.answers, 3)) {
      for (const item of match.compromises) {
        assert.ok(['calories', 'supermarket', 'diet'].includes(item.type), `unknown compromise type ${item.type}`);
        assert.ok(['hard', 'soft'].includes(item.severity), `unknown severity ${item.severity}`);
        assert.match(item.text, /[a-z]{3,}.*\./i, `compromise text is not a sentence: "${item.text}"`);
      }
    }
  }
});

// ── The failure classes that produced the chooser routing defect ─────────────

test('recommendations do not depend on the order the seed data happens to be in', () => {
  // A `.find()`-style or bare score sort leaves ties to array position, so
  // reordering the data silently changes what the user is recommended.
  const original = [...INDEXABLE_PLAN_SEEDS];
  const baseline = new Map();
  for (const profile of PROFILES) {
    baseline.set(profile.name, getTopMatches(profile.answers, 3).map(match => match.slug).join(','));
  }

  const permutations = {
    reversed: [...original].reverse(),
    rotated: [...original.slice(400), ...original.slice(0, 400)],
  };

  try {
    for (const [label, order] of Object.entries(permutations)) {
      INDEXABLE_PLAN_SEEDS.length = 0;
      INDEXABLE_PLAN_SEEDS.push(...order);
      for (const profile of PROFILES) {
        assert.equal(
          getTopMatches(profile.answers, 3).map(match => match.slug).join(','),
          baseline.get(profile.name),
          `${profile.name}: recommendation changed when seed order was ${label}`,
        );
      }
    }
  } finally {
    INDEXABLE_PLAN_SEEDS.length = 0;
    INDEXABLE_PLAN_SEEDS.push(...original);
  }
});

test('identical answers always produce an identical recommendation', () => {
  for (const profile of PROFILES) {
    const first = getTopMatches(profile.answers, 3).map(match => match.slug);
    const second = getTopMatches({ ...profile.answers }, 3).map(match => match.slug);
    assert.deepEqual(second, first, `${profile.name} is not deterministic`);
  }
});

test('a goal is matched on its identifier, never on overlapping words', () => {
  // "weight-loss" must not absorb "budget-fat-loss" or vice versa.
  for (const goal of ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'cheap-high-protein']) {
    const top = getTopMatches({ goal, diet: 'standard', supermarket: 'aldi', calories: '1500', budget: 'budget', effort: 'standard' }, 1)[0];
    const related = top.goal === goal;
    assert.ok(
      related || top.compromises.length > 0 || top.matchDetails.find(item => item.type === 'goal')?.status !== 'exact',
      `${goal}: returned goal ${top.goal} while reporting an exact goal match`,
    );
  }
});

test('a low-priority preference cannot outrank the goal and diet', () => {
  // Budget and effort are worth 5 points each against 30 for goal and 25 for
  // diet, so no combination of them may promote a plan that misses both.
  const answers = { goal: 'muscle-gain', diet: 'vegan', supermarket: 'aldi', calories: '2500', budget: 'moderate', effort: 'batch' };
  for (const match of getTopMatches(answers, 3)) {
    const goalDetail = match.matchDetails.find(item => item.type === 'goal');
    const dietDetail = match.matchDetails.find(item => item.type === 'diet');
    assert.ok(
      goalDetail?.status !== 'tradeoff' || dietDetail?.status !== 'tradeoff',
      `${match.slug} misses both goal and diet yet was recommended`,
    );
  }
});

// ── Result shape stays honest ────────────────────────────────────────────────

test('scores stay inside the range the labels are calibrated against', () => {
  for (const profile of [...PROFILES, NEAR_MATCH_PROFILE]) {
    for (const match of getTopMatches(profile.answers, 3)) {
      assert.ok(Number.isFinite(match.score), `${match.slug}: non-numeric score`);
      assert.ok(match.score >= 0 && match.score <= 100, `${match.slug}: score ${match.score} out of range`);
      assert.ok(match.matchLabel, `${match.slug}: no match label`);
      assert.ok(Array.isArray(match.matchDetails) && match.matchDetails.length > 0, `${match.slug}: no match details`);
    }
  }
});

test('results are ranked by score, best first', () => {
  for (const profile of [...PROFILES, NEAR_MATCH_PROFILE]) {
    const scores = getTopMatches(profile.answers, 3).map(match => match.score);
    const sorted = [...scores].sort((a, b) => b - a);
    assert.deepEqual(scores, sorted, `${profile.name}: results are not ordered by score`);
  }
});
