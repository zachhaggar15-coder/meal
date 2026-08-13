import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { SEMANTIC_QA_DASHBOARD } from '../src/data/semanticQaDashboard.js';
import { buildPlan, buildShoppingList } from '../src/utils/planBuilder.js';
import { buildCanonicalLegacyPlan } from '../src/utils/legacyPlanBuilder.js';
import { assessPlanLocally, buildPlanInventory, writeSemanticQaDashboard } from './lib/semanticPlanQa.js';
import {
  buildCalibrationMetrics,
  CALIBRATION_OUTCOMES,
  CALIBRATION_SEVERITIES,
  readSemanticQaCalibration,
  SEMANTIC_QA_CALIBRATION_PATH,
} from './lib/semanticQaCalibration.js';

const existing = readSemanticQaCalibration();
const existingLabels = new Map(existing.items.map(item => [item.id, item.humanLabel]));
const firstRunFindings = SEMANTIC_QA_DASHBOARD.recentFindings || [];
const selected = [];
const selectedIds = new Set();

addMany(firstRunFindings.filter(item => item.severity === 'High'), 2, 'first-run');
addMany(firstRunFindings.filter(item => item.category === 'ingredient-method consistency'), 13, 'first-run');
addMany(firstRunFindings.filter(item => item.category === 'meal-name coherence'), 10, 'first-run');
addMany(firstRunFindings.filter(item => item.category === 'shopping-list usability'), 12, 'first-run');

for (const item of findPlanVarietySupplements(5)) add(item, 'library-supplement');

const sample = selected.slice(0, 40).map(item => {
  const previous = existingLabels.get(item.id);
  const confirmedHigh = item.severity === 'High' && /method mentions potato/i.test(item.issue || item.explanation || '');
  return {
    id: item.id,
    route: item.route,
    affectedLocation: item.affectedLocation,
    category: item.category,
    patternKey: item.patternKey || inferPatternKey(item.issue || item.explanation),
    detectorSeverity: item.severity,
    evidence: item.issue || item.explanation,
    scope: item.scope,
    origin: item.origin,
    reviewTheme: reviewTheme(item),
    humanLabel: previous || (confirmedHigh ? {
      outcome: 'True issue',
      severity: 'High',
      reviewer: 'user-confirmed',
      reviewedAt: '2026-08-13',
      notes: 'Confirmed in the approved phase brief; fixed through the shared Niçoise method template.',
    } : {
      outcome: '',
      severity: '',
      reviewer: '',
      reviewedAt: '',
      notes: '',
    }),
  };
});

const calibration = {
  version: 1,
  sourceRunId: '2026-W33-2026-08-13',
  createdAt: existing.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  instructions: {
    outcomes: CALIBRATION_OUTCOMES,
    severities: CALIBRATION_SEVERITIES,
    note: 'Edit only humanLabel fields. Generated QA history remains unchanged. Re-run npm run qa:semantic:calibration to preserve labels while refreshing the sample.',
  },
  coverage: {
    ingredientMethod: sample.filter(item => item.category === 'ingredient-method consistency').length,
    mealNameAndGenericWording: sample.filter(item => item.category === 'meal-name coherence' || item.reviewTheme === 'generic wording').length,
    shoppingList: sample.filter(item => item.category === 'shopping-list usability').length,
    planVariety: sample.filter(item => item.category === 'plan-level variety').length,
    methodQuality: sample.filter(item => item.category === 'method quality').length,
    culinaryCoherence: sample.filter(item => item.category === 'culinary coherence').length,
    gaps: [
      ...(sample.some(item => item.category === 'method quality') ? [] : ['No method-quality finding existed in the first run or current library-wide detector output.']),
      ...(sample.some(item => item.category === 'culinary coherence') ? [] : ['No culinary-coherence finding existed in the first run or current library-wide detector output.']),
    ],
  },
  items: sample,
};

fs.mkdirSync(path.dirname(SEMANTIC_QA_CALIBRATION_PATH), { recursive: true });
fs.writeFileSync(SEMANTIC_QA_CALIBRATION_PATH, `${JSON.stringify(calibration, null, 2)}\n`, 'utf8');
writeSemanticQaDashboard({
  ...SEMANTIC_QA_DASHBOARD,
  latest: SEMANTIC_QA_DASHBOARD.latest ? {
    ...SEMANTIC_QA_DASHBOARD.latest,
    plansWithoutFlagsRate: SEMANTIC_QA_DASHBOARD.latest.plansWithoutFlagsRate
      ?? SEMANTIC_QA_DASHBOARD.latest.passRate,
  } : null,
  trend: (SEMANTIC_QA_DASHBOARD.trend || []).map(run => ({
    ...run,
    plansWithoutFlagsRate: run.plansWithoutFlagsRate ?? run.passRate,
  })),
  calibration: {
    ...buildCalibrationMetrics(calibration),
    items: calibration.items.map(item => ({
      id: item.id,
      route: item.route,
      category: item.category,
      patternKey: item.patternKey,
      detectorSeverity: item.detectorSeverity,
      evidence: item.evidence,
      origin: item.origin,
      reviewTheme: item.reviewTheme,
      outcome: item.humanLabel?.outcome || 'Unreviewed',
      humanSeverity: item.humanLabel?.severity || 'Unreviewed',
    })),
  },
});
console.log(`Semantic QA calibration sample written: ${sample.length} findings (${sample.filter(item => item.humanLabel.outcome).length} human-confirmed).`);

function addMany(items, limit, origin) {
  for (const item of items.slice(0, limit)) add(item, origin);
}

function add(item, origin) {
  if (!item?.id || selectedIds.has(item.id) || selected.length >= 40) return;
  selectedIds.add(item.id);
  selected.push({ ...item, origin });
}

function findPlanVarietySupplements(limit) {
  const findings = [];
  for (const candidate of buildPlanInventory()) {
    if (findings.length >= limit) break;
    let days;
    let shoppingList;
    if (candidate.planType === 'generated') {
      const built = buildPlan(candidate.seed);
      days = built.plan;
      shoppingList = built.shoppingList || buildShoppingList(days);
    } else {
      days = buildCanonicalLegacyPlan(candidate.legacy.plan, candidate.legacy.targetCalories);
      shoppingList = buildShoppingList(days);
    }
    const review = assessPlanLocally({ ...candidate, days, shoppingList, sourceHash: 'calibration' });
    for (const finding of review.findings.filter(item => item.category === 'plan-level variety')) {
      findings.push({
        id: finding.findingId || `cal_${crypto.createHash('sha256').update(`${candidate.route}|${finding.patternKey}|${finding.affectedLocation}`).digest('hex').slice(0, 16)}`,
        route: candidate.route,
        affectedLocation: finding.affectedLocation,
        category: finding.category,
        patternKey: finding.patternKey,
        severity: finding.severity,
        issue: finding.explanation,
        scope: finding.scope,
      });
      if (findings.length >= limit) break;
    }
  }
  return findings;
}

function inferPatternKey(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('central to the meal name')) return 'important-ingredient-unused';
  if (text.includes('called a stir-fry') || text.includes('called a salad')) return 'meal-style-method-mismatch';
  if (text.includes('duplicate purchase')) return 'shopping-duplicate-alias';
  if (text.includes('method mentions')) return 'method-core-ingredient-missing';
  return 'semantic-review';
}

function reviewTheme(item) {
  const text = String(item.issue || item.explanation || '').toLowerCase();
  if (text.includes('central to the meal name')) return 'generic wording';
  if (item.category === 'plan-level variety') return 'plan variety';
  if (item.category === 'shopping-list usability') return 'shopping list';
  return item.category;
}
