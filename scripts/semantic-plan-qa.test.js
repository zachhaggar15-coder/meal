import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  aggregateSystemicIssues,
  assessPlanLocally,
  buildDashboardData,
  normaliseSeverity,
  parseModelReviewOutput,
  selectSemanticQaSample,
} from './lib/semanticPlanQa.js';
import { buildCalibrationMetrics } from './lib/semanticQaCalibration.js';

const NOW = new Date('2026-08-13T12:00:00.000Z');

test('weekly semantic sample is deterministic and stratified for the same ISO week', () => {
  const inventory = syntheticInventory(80);
  const input = { inventory, history: emptyHistory(), now: NOW, sampleSize: 30 };
  const first = selectSemanticQaSample(input);
  const second = selectSemanticQaSample(input);

  assert.deepEqual(first.map(item => item.route), second.map(item => item.route));
  assert.equal(first.length, 30);
  assert.ok(new Set(first.map(item => item.supermarket)).size >= 5);
  assert.ok(new Set(first.map(item => item.diet)).size >= 3);
  assert.ok(new Set(first.map(item => calorieBand(item.calorieTarget))).size >= 4);
  assert.ok(first.some(item => item.planType === 'editorial'));
  assert.ok(first.some(item => item.planType === 'generated'));
});

test('cooldown excludes recently sampled plans while unsampled plans are available', () => {
  const inventory = syntheticInventory(40);
  const history = emptyHistory();
  for (const plan of inventory.slice(0, 15)) {
    history.perPlan[plan.route] = { lastQaAt: '2026-08-06T12:00:00.000Z', lastStatus: 'Pass' };
  }

  const sample = selectSemanticQaSample({ inventory, history, now: NOW, sampleSize: 20 });
  assert.equal(sample.length, 20);
  assert.ok(sample.every(plan => !history.perPlan[plan.route]));
});

test('high traffic does not bypass cooldown unless a shared change creates regression priority', () => {
  const inventory = syntheticInventory(35);
  const cooledRoute = inventory[0].route;
  const history = emptyHistory();
  history.perPlan[cooledRoute] = { lastQaAt: '2026-08-06T12:00:00.000Z', lastStatus: 'Pass' };
  const trafficByRoute = { [cooledRoute]: { impressions: 10000, clicks: 500, pageViews: 1000 } };

  const ordinary = selectSemanticQaSample({ inventory, history, trafficByRoute, now: NOW, sampleSize: 20 });
  assert.ok(!ordinary.some(plan => plan.route === cooledRoute));

  const regression = selectSemanticQaSample({
    inventory, history, trafficByRoute, now: NOW, sampleSize: 20,
    recentActivity: { files: ['src/utils/recipeQuality.js'] },
  });
  assert.ok(regression.some(plan => plan.route === cooledRoute && plan.sampleReason === 'regression'));
});

test('traffic and recent shared generator changes influence sampling without breaking determinism', () => {
  const inventory = syntheticInventory(50);
  const trafficRoute = inventory[41].route;
  const sample = selectSemanticQaSample({
    inventory,
    history: emptyHistory(),
    trafficByRoute: { [trafficRoute]: { impressions: 5000, clicks: 50, pageViews: 500 } },
    recentActivity: { files: ['src/utils/planBuilder.js'] },
    now: NOW,
    sampleSize: 12,
  });

  assert.ok(sample.some(plan => plan.route === trafficRoute && plan.sampleReason === 'traffic'));
  assert.equal(sample.filter(plan => plan.sampleReason === 'regression').length, 3);
});

test('severity normalization uses the approved Critical/High/Medium/Low scale', () => {
  assert.equal(normaliseSeverity('critical'), 'Critical');
  assert.equal(normaliseSeverity('HIGH'), 'High');
  assert.equal(normaliseSeverity('Medium'), 'Medium');
  assert.equal(normaliseSeverity('unexpected'), 'Low');
});

test('model enrichment accepts fenced strict JSON and rejects malformed or extra fields', () => {
  const valid = {
    reviews: [{
      planId: 'test',
      findings: [{
        severity: 'Medium', category: 'method quality', explanation: 'Review this step.',
        affectedLocation: 'Monday dinner', confidence: 'medium', scope: 'uncertain', patternKey: 'method-review',
      }],
    }],
  };
  assert.deepEqual(parseModelReviewOutput(`\`\`\`json\n${JSON.stringify(valid)}\n\`\`\``), valid);
  assert.throws(() => parseModelReviewOutput('{"reviews": ['), /Malformed JSON/);
  assert.throws(
    () => parseModelReviewOutput(JSON.stringify({ ...valid, commentary: 'guess' })),
    /only a reviews array/,
  );
});

test('calibration metrics stay unavailable until enough human labels exist', () => {
  const calibration = {
    items: [
      calibrationItem('True issue'),
      calibrationItem('Useful warning'),
      calibrationItem('False positive'),
      calibrationItem('Uncertain'),
      calibrationItem(''),
    ],
  };
  const metrics = buildCalibrationMetrics(calibration);

  assert.equal(metrics.reviewed, 4);
  assert.equal(metrics.unreviewed, 1);
  assert.equal(metrics.rates.usefulSignalPrecision, null);
  assert.equal(metrics.sufficientForOverallRates, false);
});

test('shopping semantic checks do not misclassify green beans through an unsafe bean substring', () => {
  const plan = semanticPlan({
    shoppingList: { protein: [], carbs: [], vegetables: [], dairy: [], extras: ['190g green beans'] },
  });
  const review = assessPlanLocally(plan, NOW);
  assert.ok(!review.findings.some(item => item.patternKey === 'shopping-category-protein'));
});

test('a large weekly ingredient total is surfaced as review evidence, not an automatic failure', () => {
  const plan = semanticPlan({
    shoppingList: { protein: [], carbs: [], vegetables: ['Tinned tomatoes 1300g (about 1280g used)'], dairy: [], extras: [] },
  });
  const review = assessPlanLocally(plan, NOW);
  const accumulation = review.findings.find(item => item.patternKey === 'weekly-ingredient-accumulation');

  assert.ok(accumulation);
  assert.equal(accumulation.severity, 'Medium');
  assert.equal(review.overallStatus, 'Pass');
  assert.equal(review.actionableFindingCount, 0);
  assert.equal(review.advisoryCount, 1);
});

test('a small, ordinary weekly ingredient total does not trigger the accumulation flag', () => {
  const plan = semanticPlan({
    shoppingList: { protein: [], carbs: [], vegetables: ['Cherry tomatoes 210g (about 200g used)'], dairy: [], extras: [] },
  });
  const review = assessPlanLocally(plan, NOW);
  assert.ok(!review.findings.some(item => item.patternKey === 'weekly-ingredient-accumulation'));
});

test('container recommendations account for reuse across the week', () => {
  const days = Array.from({ length: 7 }, (_, index) => ({
    day: `Day ${index + 1}`,
    meals: [
      { type: 'Breakfast', name: 'Egg white omelette' },
      { type: 'Lunch', name: 'Chicken bowl' },
      { type: 'Dinner', name: 'Turkey bolognese' },
    ],
  }));
  const plan = semanticPlan({ days });
  const review = assessPlanLocally(plan, NOW);
  const outlier = review.findings.find(item => item.patternKey === 'container-count-outlier');

  assert.equal(outlier, undefined);
});

test('explicitly prepared potato state is flagged when a method contradicts it', () => {
  const plan = semanticPlan({
    days: [{
      day: 'Monday',
      meals: [{
        type: 'Dinner',
        name: 'Potato bowl',
        preparation: { potato: 'mashed' },
        ingredients: ['200g mashed potato', '100g peas'],
        calculationIngredients: ['200g mashed potato', '100g peas'],
        cookingIngredients: ['200g mashed potato', '100g peas'],
        recipe: ['Boil the mashed potato until tender, then serve.'],
      }],
    }],
  });
  const review = assessPlanLocally(plan, NOW);
  const contradiction = review.findings.find(item => item.patternKey === 'potato-state-contradiction');
  assert.ok(contradiction);
  assert.equal(contradiction.severity, 'High');
});

test('prepared mash can be baked as the topping of an assembled pie', () => {
  const plan = semanticPlan({
    days: [{
      day: 'Monday',
      meals: [{
        type: 'Dinner',
        name: "Mushroom and Lentil Shepherd's Pie",
        preparation: { potato: 'mashed' },
        ingredients: ['200g cooked lentils', '250g sweet potato mash'],
        calculationIngredients: ['200g cooked lentils', '250g sweet potato mash'],
        cookingIngredients: ['200g cooked lentils', '250g sweet potato mash'],
        recipe: [
          'Spread the sweet potato mash over the cooked filling.',
          'Bake the pie for 20 minutes until the topping is golden.',
        ],
      }],
    }],
  });
  const review = assessPlanLocally(plan, NOW);
  assert.equal(review.findings.some(item => item.patternKey === 'potato-state-contradiction'), false);
});

test('repeated patterns are aggregated as potential systemic issues with first-detected history', () => {
  const finding = {
    severity: 'High',
    patternKey: 'potato-state-contradiction',
    explanation: 'Contradictory prepared potato method.',
  };
  const previousDate = '2026-07-30T12:00:00.000Z';
  const issues = aggregateSystemicIssues([
    { route: '/plans/one', findings: [finding] },
    { route: '/plans/two', findings: [finding] },
  ], [{ runAt: previousDate, systemicIssues: [{ patternKey: finding.patternKey, firstDetected: previousDate }] }], NOW);

  assert.equal(issues.length, 1);
  assert.equal(issues[0].affectedSampledPlans, 2);
  assert.equal(issues[0].severity, 'High');
  assert.equal(issues[0].firstDetected, previousDate);
  assert.match(issues[0].likelySharedComponent, /preparation-state resolver/);
});

test('private dashboard data includes coverage, trend, severity and recent findings', () => {
  const inventory = syntheticInventory(10);
  const latestRun = {
    runAt: NOW.toISOString(), sampleSize: 2, passed: 1, flagged: 1, passRate: 50,
    severity: { Critical: 0, High: 1, Medium: 0, Low: 0 },
    systemicIssueCount: 0, systemicIssues: [], model: { status: 'not_configured' },
    reviews: [{
      route: inventory[0].route, supermarket: inventory[0].supermarket,
      calorieTarget: inventory[0].calorieTarget, diet: inventory[0].diet,
      goal: inventory[0].goal, planType: inventory[0].planType,
      overallStatus: 'Review required', findings: [{
        findingId: 'qa_test', severity: 'High', category: 'method quality',
        explanation: 'Test evidence.', affectedLocation: 'Monday dinner', scope: 'plan-specific', reviewStatus: 'New',
      }],
    }],
  };
  const history = {
    ...emptyHistory(),
    perPlan: { [inventory[0].route]: { lastQaAt: NOW.toISOString() } },
    runs: [{ runAt: NOW.toISOString(), sampleSize: 2, passRate: 50, severity: latestRun.severity, coverageAfterRun: { plansEverSampled: 1 } }],
  };
  const dashboard = buildDashboardData({ history, inventory, latestRun });

  assert.equal(dashboard.coverage.totalPublishedPlans, 10);
  assert.equal(dashboard.coverage.plansEverSampled, 1);
  assert.equal(dashboard.latest.severity.High, 1);
  assert.equal(dashboard.trend[0].cumulativeCoverage, 1);
  assert.equal(dashboard.recentFindings[0].reviewStatus, 'New');
});

test('semantic QA detail stays behind the private admin API and dashboard route', () => {
  const apiSource = fs.readFileSync('api/admin-stats.js', 'utf8');
  const adminSource = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
  const publicSources = [
    'src/pages/Home.jsx',
    'src/pages/BrowsePlans.jsx',
    'src/components/WeeklyTrendingLinks.jsx',
    'src/data/weeklySeoInsights.js',
  ].map(file => fs.readFileSync(file, 'utf8')).join('\n');

  assert.match(apiSource, /SEMANTIC_QA_DASHBOARD/);
  assert.match(adminSource, /Plan Quality/);
  assert.doesNotMatch(publicSources, /semanticQaDashboard|recentFindings|systemicIssues/);
});

function syntheticInventory(count) {
  const supermarkets = ['aldi', 'tesco', 'asda', 'lidl', 'morrisons', 'sainsburys'];
  const diets = ['standard', 'vegetarian', 'vegan', 'pescatarian'];
  const goals = ['weight-loss', 'muscle-gain', 'budget', 'general'];
  const calories = [1400, 1500, 1800, 2000, 2500, 3000];
  return Array.from({ length: count }, (_, index) => ({
    route: `/plans/test-${index}`,
    planId: `test-${index}`,
    planType: index % 9 === 0 ? 'editorial' : 'generated',
    title: `Test plan ${index}`,
    supermarket: supermarkets[index % supermarkets.length],
    calorieTarget: calories[index % calories.length],
    diet: diets[index % diets.length],
    goal: goals[index % goals.length],
    modifiers: index % 2 ? ['batch'] : ['low-effort'],
  }));
}

function semanticPlan(overrides = {}) {
  return {
    route: '/plans/test', planId: 'test', planType: 'generated', title: 'Test plan',
    supermarket: 'aldi', calorieTarget: 1800, diet: 'standard', goal: 'general',
    modifiers: [], sampleReason: 'coverage', sourceHash: 'hash', days: [],
    shoppingList: { protein: [], carbs: [], vegetables: [], dairy: [], extras: [] },
    ...overrides,
  };
}

function emptyHistory() {
  return { version: 1, perPlan: {}, runs: [], reviewStatuses: {} };
}

function calorieBand(value) {
  if (value <= 1500) return 'low';
  if (value <= 2000) return 'medium';
  if (value <= 2500) return 'high';
  return 'very-high';
}

function calibrationItem(outcome) {
  return {
    category: 'method quality',
    detectorSeverity: 'Medium',
    humanLabel: { outcome },
  };
}
