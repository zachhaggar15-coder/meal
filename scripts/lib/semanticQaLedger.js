// Persistent, append-only record of every QA finding ever seen — auto
// (detector) or manual (admin-added) — independent of any single weekly
// run's output. `history.reviewStatuses` already tracks a bare workflow
// status per finding forever; this ledger sits alongside it and adds the
// two things the admin workflow needs that history.json does not keep:
//   1. a human assessment axis independent of workflow status
//      (True issue / Useful warning / False positive / Uncertain), and
//   2. retained evidence + detected/resolved dates, so a "Fixed" finding
//      is not simply gone — it is still visible with its history.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');

export const SEMANTIC_QA_LEDGER_PATH = path.join(rootDir, 'docs', 'semantic-qa', 'findings-ledger.json');

export const WORKFLOW_STATUSES = ['New', 'Investigating', 'Fixed', 'Accepted'];
export const HUMAN_ASSESSMENTS = ['True issue', 'Useful warning', 'False positive', 'Uncertain'];
export const FINDING_CATEGORIES = [
  'Plan composition', 'Weekly ingredient practicality', 'Shopping list', 'Shopping category',
  'Recipe method', 'Ingredient mismatch', 'Macro consistency', 'Cost estimate',
  'Container recommendation', 'Dietary label', 'Breakfast repetition', 'Other',
];

export function readLedger(filePath = SEMANTIC_QA_LEDGER_PATH) {
  if (!fs.existsSync(filePath)) return emptyLedger();
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return { ...emptyLedger(), ...parsed, entries: parsed.entries || {} };
  } catch {
    return emptyLedger();
  }
}

export function writeLedger(ledger, filePath = SEMANTIC_QA_LEDGER_PATH) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const next = { ...ledger, updatedAt: new Date().toISOString() };
  fs.writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return next;
}

function emptyLedger() {
  return { version: 1, updatedAt: '', entries: {} };
}

// Called from the weekly QA run for every finding a detector produced this
// week. New findings are opened as "New"; findings seen again are
// timestamped but never have their human status/assessment overwritten —
// those belong to whoever reviewed them, not the detector.
export function upsertAutoFindings(ledger, reviews, now = new Date()) {
  const next = { ...ledger, entries: { ...ledger.entries } };
  const nowIso = new Date(now).toISOString();
  for (const review of reviews || []) {
    for (const item of review.findings || []) {
      if (!item.findingId) continue;
      const existing = next.entries[item.findingId];
      next.entries[item.findingId] = {
        id: item.findingId,
        source: 'auto',
        route: review.route,
        category: item.category,
        patternKey: item.patternKey,
        severity: item.severity,
        evidence: item.explanation,
        affectedLocation: item.affectedLocation,
        firstDetectedAt: existing?.firstDetectedAt || nowIso,
        lastDetectedAt: nowIso,
        lastRecheckAt: existing?.lastRecheckAt || '',
        lastRecheckResult: existing?.lastRecheckResult || '',
        resolvedAt: '', // re-detected this run, so it is not (or no longer) resolved
        status: existing?.status || 'New',
        humanAssessment: existing?.humanAssessment || 'Uncertain',
        humanNote: existing?.humanNote || '',
      };
    }
  }
  return next;
}

export function addManualFinding(ledger, {
  route, category, severity, note, evidence, dayOrMeal = '', addedAt = new Date(),
}) {
  if (!route) throw new Error('addManualFinding requires a route.');
  if (!FINDING_CATEGORIES.includes(category)) throw new Error(`Unknown category: ${category}`);
  if (!['Critical', 'High', 'Medium', 'Low'].includes(severity)) throw new Error(`Unknown severity: ${severity}`);

  const nowIso = new Date(addedAt).toISOString();
  const id = `manual_${sha256(`${route}|${category}|${evidence}|${nowIso}`).slice(0, 16)}`;
  const next = { ...ledger, entries: { ...ledger.entries } };
  next.entries[id] = {
    id,
    source: 'manual',
    route,
    category,
    patternKey: 'manual-finding',
    severity,
    evidence: evidence || note || '',
    affectedLocation: dayOrMeal || 'Plan',
    firstDetectedAt: nowIso,
    lastDetectedAt: nowIso,
    lastRecheckAt: '',
    lastRecheckResult: '',
    resolvedAt: '',
    status: 'New',
    humanAssessment: 'Uncertain',
    humanNote: note || '',
  };
  return { ledger: next, id };
}

export function setFindingStatus(ledger, findingId, status) {
  return updateEntry(ledger, findingId, entry => {
    if (!WORKFLOW_STATUSES.includes(status)) throw new Error(`Unknown status: ${status}`);
    return { ...entry, status };
  });
}

export function setFindingAssessment(ledger, findingId, assessment, note = '') {
  return updateEntry(ledger, findingId, entry => {
    if (!HUMAN_ASSESSMENTS.includes(assessment)) throw new Error(`Unknown assessment: ${assessment}`);
    return { ...entry, humanAssessment: assessment, humanNote: note || entry.humanNote };
  });
}

function updateEntry(ledger, findingId, updater) {
  const entry = ledger.entries?.[findingId];
  if (!entry) throw new Error(`No ledger entry for findingId ${findingId}`);
  return { ...ledger, entries: { ...ledger.entries, [findingId]: updater(entry) } };
}

// Reruns QA for exactly one route right now and reconciles against the
// ledger. Never touches plan generation — this only reports what the
// current deterministic checks find for that route today, and updates the
// ledger's recheck metadata. `assessRoute(route)` is injected so this module
// stays free of a circular import on semanticPlanQa.js.
export function recheckRoute(ledger, route, assessRoute, now = new Date()) {
  const nowIso = new Date(now).toISOString();
  let currentFindings;
  try {
    currentFindings = assessRoute(route);
  } catch (error) {
    return { ledger, result: { route, status: 'unable-to-determine', error: String(error.message || error) } };
  }
  const currentById = new Map(currentFindings.map(item => [item.findingId, item]));

  const next = { ...ledger, entries: { ...ledger.entries } };
  const stillDetected = [];
  const noLongerDetected = [];
  const knownIds = new Set(Object.keys(next.entries).filter(id => next.entries[id].route === route));

  for (const [id, entry] of Object.entries(next.entries)) {
    if (entry.route !== route || entry.source !== 'auto') continue;
    const detectedNow = currentById.has(id);
    next.entries[id] = {
      ...entry,
      lastRecheckAt: nowIso,
      lastRecheckResult: detectedNow ? 'still-detected' : 'no-longer-detected',
      lastDetectedAt: detectedNow ? nowIso : entry.lastDetectedAt,
      resolvedAt: detectedNow ? '' : (entry.resolvedAt || nowIso),
    };
    (detectedNow ? stillDetected : noLongerDetected).push(id);
  }

  // Findings the current check found that were never in the ledger for this
  // route are opened as new entries now — otherwise every subsequent
  // recheck would report the same findings as "new" forever instead of
  // "still detected".
  const newEntries = [...currentById.entries()].filter(([id]) => !knownIds.has(id));
  for (const [id, item] of newEntries) {
    next.entries[id] = {
      id,
      source: 'auto',
      route,
      category: item.category,
      patternKey: item.patternKey,
      severity: item.severity,
      evidence: item.explanation,
      affectedLocation: item.affectedLocation,
      firstDetectedAt: nowIso,
      lastDetectedAt: nowIso,
      lastRecheckAt: nowIso,
      lastRecheckResult: 'new',
      resolvedAt: '',
      status: 'New',
      humanAssessment: 'Uncertain',
      humanNote: '',
    };
  }

  return {
    ledger: next,
    result: {
      route,
      status: 'checked',
      recheckedAt: nowIso,
      stillDetected: stillDetected.length,
      noLongerDetected: noLongerDetected.length,
      newFindings: newEntries.length,
    },
  };
}

export function ledgerRows(ledger) {
  return Object.values(ledger.entries || {})
    .sort((left, right) => new Date(right.lastDetectedAt) - new Date(left.lastDetectedAt));
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}
