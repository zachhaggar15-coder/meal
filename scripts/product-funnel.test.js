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
import {
  AFFILIATE_BASELINE_TIMESTAMP,
  AFFILIATE_PRODUCT_CLICK_EVENT,
  AFFILIATE_PRODUCT_IMPRESSION_EVENT,
  affiliateLinkData,
  buildAffiliateEventProperties,
  buildAffiliateImpressionKey,
  getAffiliatePlacementGroup,
  inferRecommendationSource,
  isAffiliateUrl,
} from '../src/utils/affiliateAnalytics.js';
import {
  buildAccessoryFunnelMeasurement,
  buildAffiliateMeasurement,
} from '../api/admin-stats.js';
import {
  ACCESSORY_PROBLEMS,
  ACCESSORY_PRODUCT_IDS,
  PROMINENT_ACCESSORY_PRODUCT_IDS,
} from '../src/data/accessoryProblems.js';
import { blogPostsData } from '../src/data/blogPosts.js';
import { MEALPREP_PRODUCTS } from '../src/data/mealPrepProducts.js';
import { CONTAINER_NAV_LINKS } from '../src/data/navigation.js';

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

test('affiliate analytics recognises Amazon boundaries without broad substring matching', () => {
  assert.equal(isAffiliateUrl('https://www.amazon.co.uk/item/dp/B0FFH1DW9W?tag=amazonaf063dc-21'), true);
  assert.equal(isAffiliateUrl('https://amzn.to/example'), true);
  assert.equal(isAffiliateUrl('https://example.com/amazon-affiliate-guide'), false);
  assert.equal(isAffiliateUrl('/blog/affiliate-marketing'), false);
});

test('canonical affiliate properties use stable page, placement and recommendation taxonomies', () => {
  const target = {
    href: 'https://www.amazon.co.uk/item/dp/B0FFH1DW9W?tag=amazonaf063dc-21',
    dataset: {
      productId: 'borohouse-10-pack-glass',
      productName: 'BOROHOUSE 10-Pack Glass Storage Containers',
      productCategory: 'meal-prep-containers',
      sourcePage: 'best-containers-quick-comparison',
      placement: 'quick_picks',
      listPosition: '2',
      selectedProblem: 'full-week prep',
      recommendationSource: 'container_buying_guide',
    },
  };

  assert.deepEqual(buildAffiliateEventProperties(target, {
    pathname: '/blog/best-meal-prep-containers-uk?source=home',
    viewportWidth: 390,
  }), {
    product_id: 'borohouse-10-pack-glass',
    product_name: 'BOROHOUSE 10-Pack Glass Storage Containers',
    product_category: 'meal-prep-containers',
    source_page: '/blog/best-meal-prep-containers-uk',
    source_page_type: 'article',
    placement: 'quick_picks',
    placement_group: 'quick_picks',
    list_position: 2,
    selected_problem: 'full-week prep',
    viewport_category: 'mobile',
    recommendation_source: 'container_buying_guide',
    source_component: 'best-containers-quick-comparison',
    destination: target.href,
  });
  assert.equal(inferRecommendationSource({ pathname: '/plans/aldi-high-protein-low-cal-1500' }), 'plan_derived');
});

test('affiliate impression keys deduplicate links within one product presentation', () => {
  const base = {
    source_page: '/meal-prep-accessories',
    product_id: 'lunch-bag',
    list_position: 1,
  };
  const image = buildAffiliateImpressionKey({
    ...base,
    source_component: 'accessories-starter-image',
    placement: 'product_image',
    placement_group: getAffiliatePlacementGroup('product_image'),
  });
  const cta = buildAffiliateImpressionKey({
    ...base,
    source_component: 'accessories-starter',
    placement: 'detailed_card',
    placement_group: getAffiliatePlacementGroup('detailed_card'),
  });

  assert.equal(image, cta);
  assert.equal(getAffiliatePlacementGroup('quick_comparison_snapshot'), 'comparison_section');
});

test('accessory problem map is bounded, route-valid and uses the maintained 20-product inventory', () => {
  assert.equal(ACCESSORY_PROBLEMS.length, 8);
  assert.equal(ACCESSORY_PRODUCT_IDS.length, 20);
  assert.equal(new Set(ACCESSORY_PRODUCT_IDS).size, 20);
  assert.equal(new Set(ACCESSORY_PROBLEMS.map(problem => problem.id)).size, 8);

  const containerRoutes = new Set(CONTAINER_NAV_LINKS.map(link => link.to));
  for (const problem of ACCESSORY_PROBLEMS) {
    assert.ok(problem.recommendations.length >= 1 && problem.recommendations.length <= 2);
    assert.equal(new Set(problem.recommendations.map(item => item.productId)).size, problem.recommendations.length);

    for (const recommendation of problem.recommendations) {
      assert.ok(ACCESSORY_PRODUCT_IDS.includes(recommendation.productId));
      assert.ok(MEALPREP_PRODUCTS[recommendation.productId]);
    }

    for (const guide of problem.guides) {
      if (guide.to.startsWith('/blog/')) {
        assert.ok(blogPostsData[guide.to.slice('/blog/'.length)], `Missing blog route: ${guide.to}`);
      } else {
        assert.ok(containerRoutes.has(guide.to), `Missing container route: ${guide.to}`);
      }
      assert.doesNotMatch(guide.label, /^(learn more|useful route|exact guide|search page)$/i);
    }
  }
});

test('every prominent accessory recommendation has explicit trust fields', () => {
  assert.equal(PROMINENT_ACCESSORY_PRODUCT_IDS.length, 13);
  for (const productId of PROMINENT_ACCESSORY_PRODUCT_IDS) {
    const product = MEALPREP_PRODUCTS[productId];
    for (const field of ['bestFor', 'whyItHelps', 'drawback', 'skipIf']) {
      assert.ok(product[field]?.trim(), `${productId} is missing ${field}`);
    }
  }

  assert.match(MEALPREP_PRODUCTS['fullstar-pro-vegetable-chopper'].skipIf, /knife/i);
  assert.match(MEALPREP_PRODUCTS['nuoshen-removable-food-labels'].drawback, /do not make.+freez/i);
  assert.match(MEALPREP_PRODUCTS['thermopro-tp02s-thermometer'].drawback, /storage/i);
});

test('accessory product images have reserved dimensions and non-keyword-stuffed alt text', () => {
  for (const productId of ACCESSORY_PRODUCT_IDS) {
    const product = MEALPREP_PRODUCTS[productId];
    if (!product.image) continue;

    assert.match(product.image, /^\/images\/products\/accessories\//, `${productId} image is not a local asset`);
    assert.ok(Number.isFinite(product.imageWidth) && product.imageWidth > 0, `${productId} missing imageWidth`);
    assert.ok(Number.isFinite(product.imageHeight) && product.imageHeight > 0, `${productId} missing imageHeight`);
    assert.ok(product.imageAlt?.trim(), `${productId} missing imageAlt`);
    assert.ok(product.imageAlt.length < 120, `${productId} imageAlt looks keyword-stuffed`);
    assert.doesNotMatch(product.imageAlt, /\b(best|cheap|uk|amazon)\b/i, `${productId} imageAlt looks keyword-stuffed`);
  }
});

test('accessory affiliate context uses one canonical event with stable selected-problem data', () => {
  const product = { id: 'fit-fresh-slim-ice-packs', name: 'Fit & Fresh ice packs', category: 'Reusable ice packs' };
  const data = affiliateLinkData({
    product,
    sourcePage: 'meal-prep-accessories-problem-keep-cold',
    placement: 'recommendation_card_lead',
    listPosition: 1,
    selectedProblem: 'keep-cold',
    recommendationSource: 'accessories_hub',
  });

  assert.equal(data['data-event'], AFFILIATE_PRODUCT_CLICK_EVENT);
  assert.equal(data['data-selected-problem'], 'keep-cold');
  assert.equal(data['data-list-position'], 1);
  assert.equal(data['data-recommendation-source'], 'accessories_hub');
});

test('accessories funnel keeps denominators and labels small samples without auto-optimising', () => {
  const baselineTimestamp = '2026-08-14T09:00:00.000Z';
  const ts = Date.parse(baselineTimestamp) + 1000;
  const path = '/meal-prep-accessories';
  const selected = { selected_problem: 'keep-cold', viewport_category: 'mobile' };
  const report = buildAccessoryFunnelMeasurement([
    { ts, event_name: 'page_view', path, metadata: {} },
    { ts, event_name: 'accessory_problem_selected', path, metadata: { problem_id: 'keep-cold', problem_label: 'Keep food cold' } },
    { ts, event_name: AFFILIATE_PRODUCT_IMPRESSION_EVENT, path, metadata: selected },
    { ts, event_name: AFFILIATE_PRODUCT_CLICK_EVENT, path, metadata: selected },
    { ts, event_name: 'accessory_guide_clicked', path, metadata: { target_route: '/blog/reusable-ice-packs-for-lunch-bags-uk' } },
  ], { baselineTimestamp });

  assert.equal(report.pageViews, 1);
  assert.equal(report.problemSelections, 1);
  assert.equal(report.problemSelectionRateNumerator, 1);
  assert.equal(report.problemSelectionRateDenominator, 1);
  assert.equal(report.clicks, 1);
  assert.equal(report.impressions, 1);
  assert.equal(report.affiliateCtrNumerator, 1);
  assert.equal(report.affiliateCtrDenominator, 1);
  assert.equal(report.guideClicks, 1);
  assert.equal(report.byProblem[0].problemLabel, 'Keep food cold');
  assert.equal(report.byProblem[0].sampleStatus, 'insufficient_data');
  assert.match(report.sampleNote, /never changes automatically/i);
});

test('commercial affiliate reporting retains CTR denominators and deployment boundary', () => {
  const after = Date.parse(AFFILIATE_BASELINE_TIMESTAMP) + 1000;
  const before = Date.parse(AFFILIATE_BASELINE_TIMESTAMP) - 1000;
  const events = [
    { ts: before, event_name: AFFILIATE_PRODUCT_CLICK_EVENT, path: '/blog/best-meal-prep-containers-uk', metadata: {} },
    { ts: after, event_name: 'page_view', path: '/blog/best-meal-prep-containers-uk', metadata: {} },
    ...Array.from({ length: 5 }, () => ({
      ts: after,
      event_name: AFFILIATE_PRODUCT_IMPRESSION_EVENT,
      path: '/blog/best-meal-prep-containers-uk',
      metadata: {
        product_id: 'starter-pack',
        product_category: 'meal-prep-containers',
        placement: 'quick_picks',
        list_position: 1,
        viewport_category: 'mobile',
        recommendation_source: 'container_buying_guide',
      },
    })),
    {
      ts: after,
      event_name: AFFILIATE_PRODUCT_CLICK_EVENT,
      path: '/blog/best-meal-prep-containers-uk',
      metadata: {
        product_id: 'starter-pack',
        product_category: 'meal-prep-containers',
        placement: 'quick_picks',
        list_position: 1,
        viewport_category: 'mobile',
        recommendation_source: 'container_buying_guide',
      },
    },
  ];
  const report = buildAffiliateMeasurement(events);

  assert.equal(report.baselineTimestamp, AFFILIATE_BASELINE_TIMESTAMP);
  assert.equal(report.clicks, 1);
  assert.equal(report.impressions, 5);
  assert.equal(report.affiliateCtr, 20);
  assert.equal(report.affiliateCtrNumerator, 1);
  assert.equal(report.affiliateCtrDenominator, 5);
  assert.deepEqual(report.byPlacement[0], {
    name: 'quick_picks', clicks: 1, impressions: 5, affiliateCtr: 20,
    affiliateCtrNumerator: 1, affiliateCtrDenominator: 5,
  });
});

test('affiliate link attributes expose one canonical conversion event', () => {
  const attributes = affiliateLinkData({
    product: { id: 'starter-pack', name: 'Starter pack', category: 'Containers' },
    sourcePage: 'buying-guide',
    placement: 'detailed_card',
    listPosition: 1,
    recommendationSource: 'container_buying_guide',
  });

  assert.equal(attributes['data-event'], AFFILIATE_PRODUCT_CLICK_EVENT);
  assert.equal(attributes['data-product-id'], 'starter-pack');
  assert.equal(attributes['data-list-position'], 1);
  assert.equal(attributes['data-recommendation-source'], 'container_buying_guide');
  assert.equal(Object.values(attributes).includes('affiliate_link_clicked'), false);
  assert.equal(Object.values(attributes).includes('affiliate_click'), false);
});
