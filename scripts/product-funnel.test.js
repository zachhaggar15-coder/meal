import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBrowsePlanUrl } from '../src/data/planChooser.js';
import { buildBlogNextStep } from '../src/utils/contextualJourney.js';
import { buildPracticalRecipeSteps, validateRecipeQuality } from '../src/utils/recipeQuality.js';
import { getTopMatches } from '../src/utils/quizScorer.js';
import {
  decodeQuizAnswers,
  encodeQuizAnswers,
  normaliseQuizAnswers,
} from '../src/utils/quizStorage.js';
import {
  buildPlanReference,
  getPlanLibrary,
  readPlanProgress,
  recordPlanView,
  toggleSavedPlan,
  writePlanProgress,
} from '../src/utils/planRetention.js';

test('calculator selections survive in browse URLs', () => {
  assert.equal(
    buildBrowsePlanUrl({
      goal: 'high-protein-low-cal',
      calories: 1800,
      search: '150g protein',
    }),
    '/browse?goal=high-protein-low-cal&calories=1800&search=150g+protein',
  );
});

test('quiz answer links are URL-safe, backwards-readable and input-bounded', () => {
  const answers = {
    goal: 'weight-loss',
    diet: 'vegetarian',
    supermarket: 'aldi',
    calories: '1500',
    budget: 'budget',
    effort: 'batch',
    macros: { protein: 160, carbs: 180, fats: 60, fibre: 30 },
    macroMode: 'custom-grams',
  };
  const encoded = encodeQuizAnswers(answers);

  assert.doesNotMatch(encoded, /[+/=]/);
  assert.deepEqual(decodeQuizAnswers(encoded), answers);
  assert.deepEqual(
    normaliseQuizAnswers({ ...answers, unknown: 'drop me', macros: { protein: 9999, carbs: 1 } }),
    { ...answers, macros: { protein: 260, carbs: 50 } },
  );
  assert.equal(decodeQuizAnswers('not valid!'), null);
});

test('quiz results explain concrete fit without a pseudo-precise percentage', () => {
  const [match] = getTopMatches({
    goal: 'weight-loss',
    diet: 'standard',
    supermarket: 'aldi',
    calories: '1500',
    budget: 'budget',
    effort: 'batch',
  }, 1);

  assert.ok(match.matchDetails.length >= 6);
  assert.match(match.matchSummary, /exact|close|trade-off/);
  assert.doesNotMatch(match.matchSummary, /%/);
  assert.ok(match.matchDetails.some(item => item.type === 'supermarket'));
  assert.ok(match.matchDetails.some(item => item.type === 'calories'));
});

test('saved plans and shopping progress survive corrupt local records safely', () => {
  const previousWindow = globalThis.window;
  const previousCustomEvent = globalThis.CustomEvent;
  const storage = new Map();

  try {
    globalThis.window = {
      localStorage: {
        getItem: key => storage.get(key) || null,
        setItem: (key, value) => storage.set(key, value),
      },
      dispatchEvent: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    };
    globalThis.CustomEvent = class CustomEvent {
      constructor(type) { this.type = type; }
    };

    const reference = buildPlanReference({
      route: '/plans/aldi-weight-loss-1500?source=quiz',
      slug: 'aldi-weight-loss-1500',
      title: 'Aldi Weight Loss Plan',
      supermarket: 'aldi',
      goal: 'Weight loss',
      calories: 1500,
    });
    assert.equal(reference.route, '/plans/aldi-weight-loss-1500');
    assert.equal(recordPlanView(reference).viewCount, 1);
    assert.deepEqual(toggleSavedPlan(reference), { ok: true, saved: true });
    assert.equal(getPlanLibrary().saved[0].route, reference.route);

    assert.equal(writePlanProgress(reference.route, {
      activeDayIdx: 3,
      checkedItems: ['protein:0', 'vegetables:2', 'invalid'],
    }), true);
    assert.deepEqual(readPlanProgress(reference.route).checkedItems, ['protein:0', 'vegetables:2']);
    assert.equal(readPlanProgress(reference.route).activeDayIdx, 3);

    storage.set('mealprep_saved_plans_v1', '{broken');
    assert.deepEqual(getPlanLibrary().saved, []);
  } finally {
    globalThis.window = previousWindow;
    globalThis.CustomEvent = previousCustomEvent;
  }
});

test('supermarket guides receive a supermarket-specific next step', () => {
  const journey = buildBlogNextStep({
    slug: 'tesco-low-calorie-shopping-list',
    data: {},
    exactPlanLinks: [],
  });

  assert.equal(journey.primary.to, '/meal-plans/tesco');
  assert.match(journey.primary.label, /Tesco/);
});

test('equipment guides lead to the container count tool', () => {
  const journey = buildBlogNextStep({
    slug: 'best-meal-prep-containers-uk',
    data: { affiliateDisclosure: 'affiliate' },
    exactPlanLinks: [],
  });

  assert.equal(journey.primary.to, '/tools#container-count-calculator');
});

test('pasta instructions name the actual starch instead of alternatives', () => {
  const meal = {
    name: 'Chicken Pesto Pasta',
    type: 'dinner',
    prepMins: 20,
    ingredients: ['Wholewheat pasta 80g', 'Chicken breast 150g', 'Pesto 1 tbsp'],
  };
  const recipe = buildPracticalRecipeSteps(meal);

  assert.match(recipe.join(' '), /Cook the pasta/i);
  assert.doesNotMatch(recipe.join(' '), /pasta,\s*rice or noodles/i);
  assert.deepEqual(validateRecipeQuality({ ...meal, recipe }), []);
});

test('smoked salmon is not given an unsupported frying instruction', () => {
  const meal = {
    name: 'Smoked Salmon Bagel',
    type: 'breakfast',
    prepMins: 5,
    ingredients: ['Wholemeal bagel 1', 'Smoked salmon 80g', 'Cream cheese 30g'],
  };
  const recipe = buildPracticalRecipeSteps(meal);

  assert.doesNotMatch(recipe.join(' '), /cook the salmon/i);
});

test('tofu scramble instructions do not introduce eggs', () => {
  const meal = {
    name: 'Tofu Scramble with Peppers',
    type: 'breakfast',
    prepMins: 12,
    ingredients: ['Firm tofu 200g', 'Mixed peppers 100g', 'Turmeric 0.5 tsp'],
  };
  const recipe = buildPracticalRecipeSteps(meal);

  assert.match(recipe.join(' '), /cook the tofu/i);
  assert.doesNotMatch(recipe.join(' '), /\beggs?\b/i);
  assert.deepEqual(validateRecipeQuality({ ...meal, recipe }), []);
});

test('cauliflower rice names do not introduce ordinary rice', () => {
  const meal = {
    name: 'Chicken Tikka with Cauliflower Rice and Raita',
    type: 'dinner',
    prepMins: 25,
    ingredients: ['Chicken breast 200g', 'Tikka paste 30g', 'Cauliflower 300g', 'Low-fat yogurt 80g'],
  };
  const recipe = buildPracticalRecipeSteps(meal);

  assert.doesNotMatch(recipe.join(' '), /cook the rice/i);
  assert.deepEqual(validateRecipeQuality({ ...meal, recipe }), []);
});

test('mount-safe analytics events are emitted only once per dedupe window', async () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousCustomEvent = globalThis.CustomEvent;
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const calls = [];
  let savedConsent = '';

  try {
    globalThis.window = {
      location: { pathname: '/quiz/results', search: '', href: 'https://www.mealprep.org.uk/quiz/results' },
      localStorage: {
        getItem: () => savedConsent,
        setItem: (_key, value) => { savedConsent = value; },
      },
      dispatchEvent: () => {},
      gtag: (...args) => calls.push(args),
    };
    globalThis.document = {
      title: 'Quiz results',
      querySelector: () => ({ dataset: {} }),
    };
    globalThis.CustomEvent = class CustomEvent {
      constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
      }
    };
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { doNotTrack: '0' },
    });

    const { setAnalyticsConsent, trackEventOnce } = await import('../src/utils/analytics.js');
    setAnalyticsConsent('granted');
    trackEventOnce('aldi-weight-loss-1500', 'quiz_result_viewed', { plan_slug: 'aldi-weight-loss-1500' }, 5000);
    trackEventOnce('aldi-weight-loss-1500', 'quiz_result_viewed', { plan_slug: 'aldi-weight-loss-1500' }, 5000);

    const resultEvents = calls.filter(args => args[0] === 'event' && args[1] === 'quiz_result_viewed');
    assert.equal(resultEvents.length, 1);
    assert.deepEqual(resultEvents[0][2], { plan_slug: 'aldi-weight-loss-1500' });
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
    globalThis.CustomEvent = previousCustomEvent;
    if (navigatorDescriptor) {
      Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
    } else {
      delete globalThis.navigator;
    }
  }
});
