import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');

export const SEMANTIC_QA_CALIBRATION_PATH = path.join(rootDir, 'docs', 'semantic-qa', 'calibration.json');
export const CALIBRATION_OUTCOMES = ['True issue', 'Useful warning', 'False positive', 'Uncertain'];
export const CALIBRATION_SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'None'];

export function readSemanticQaCalibration(filePath = SEMANTIC_QA_CALIBRATION_PATH) {
  if (!fs.existsSync(filePath)) return emptyCalibration();
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return {
      ...emptyCalibration(),
      ...parsed,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      coverage: parsed.coverage || {},
    };
  } catch {
    return emptyCalibration();
  }
}

export function buildCalibrationMetrics(calibration = emptyCalibration()) {
  const items = Array.isArray(calibration.items) ? calibration.items : [];
  const reviewed = items.filter(item => CALIBRATION_OUTCOMES.includes(item.humanLabel?.outcome));
  const counts = countOutcomes(reviewed);

  return {
    sampleSize: items.length,
    reviewed: reviewed.length,
    unreviewed: Math.max(0, items.length - reviewed.length),
    outcomes: counts,
    rates: rateSummary(reviewed),
    byCategory: groupMetrics(reviewed, item => item.category),
    byDetectorSeverity: groupMetrics(reviewed, item => item.detectorSeverity),
    sufficientForOverallRates: reviewed.length >= 10,
    coverage: calibration.coverage || {},
    sourceRunId: calibration.sourceRunId || '',
  };
}

function groupMetrics(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = String(keyFn(item) || 'unknown');
    const rows = groups.get(key) || [];
    rows.push(item);
    groups.set(key, rows);
  }
  return [...groups.entries()].map(([name, rows]) => ({
    name,
    reviewed: rows.length,
    outcomes: countOutcomes(rows),
    rates: rateSummary(rows),
    sufficientForRates: rows.length >= 5,
  })).sort((left, right) => right.reviewed - left.reviewed || left.name.localeCompare(right.name));
}

function countOutcomes(items) {
  return Object.fromEntries(CALIBRATION_OUTCOMES.map(outcome => [
    outcome,
    items.filter(item => item.humanLabel?.outcome === outcome).length,
  ]));
}

function rateSummary(items) {
  const counts = countOutcomes(items);
  const determined = counts['True issue'] + counts['Useful warning'] + counts['False positive'];
  if (determined < 5) {
    return { trueIssueRate: null, falsePositiveRate: null, usefulSignalPrecision: null, denominator: determined };
  }
  return {
    trueIssueRate: round((counts['True issue'] / determined) * 100),
    falsePositiveRate: round((counts['False positive'] / determined) * 100),
    usefulSignalPrecision: round(((counts['True issue'] + counts['Useful warning']) / determined) * 100),
    denominator: determined,
  };
}

function emptyCalibration() {
  return {
    version: 1,
    sourceRunId: '',
    createdAt: '',
    updatedAt: '',
    items: [],
    coverage: {},
  };
}

function round(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}
