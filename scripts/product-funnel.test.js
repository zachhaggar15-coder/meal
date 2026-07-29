import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBrowsePlanUrl } from '../src/data/planChooser.js';
import { buildBlogNextStep } from '../src/utils/contextualJourney.js';
import { buildPracticalRecipeSteps, validateRecipeQuality } from '../src/utils/recipeQuality.js';

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
