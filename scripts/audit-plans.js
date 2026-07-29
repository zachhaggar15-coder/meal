import os from 'node:os';
import { Worker } from 'node:worker_threads';
import { PLAN_SEEDS } from '../src/data/planSeeds.js';
import { writeAuditJson } from './lib/auditOutput.js';

const workerCount = Math.min(8, Math.max(1, os.availableParallelism?.() || os.cpus().length || 1));
const chunkSize = Math.ceil(PLAN_SEEDS.length / workerCount);
const workers = [];
const startedAt = Date.now();

for (let workerIndex = 0; workerIndex < workerCount; workerIndex += 1) {
  const start = workerIndex * chunkSize;
  const end = Math.min(PLAN_SEEDS.length, start + chunkSize);
  if (start >= end) continue;
  workers.push(runWorker(start, end));
}

const parts = await Promise.all(workers);
const totals = parts.reduce((summary, part) => ({
  combinations: summary.combinations + part.combinations,
  uniquePlanOutputs: summary.uniquePlanOutputs + part.uniquePlanOutputs,
  days: summary.days + part.days,
  mealOccurrences: summary.mealOccurrences + part.mealOccurrences,
  ingredientOccurrences: summary.ingredientOccurrences + part.ingredientOccurrences,
  householdStates: summary.householdStates + part.householdStates,
  intentionalHighEnergySnackRepeats:
    summary.intentionalHighEnergySnackRepeats + part.intentionalHighEnergySnackRepeats,
  calorieMeanMinPercent: Math.min(summary.calorieMeanMinPercent, part.calorieMeanMinPercent),
  calorieMeanMaxPercent: Math.max(summary.calorieMeanMaxPercent, part.calorieMeanMaxPercent),
  failures: [...summary.failures, ...part.failures].slice(0, 1000),
}), {
  combinations: 0,
  uniquePlanOutputs: 0,
  days: 0,
  mealOccurrences: 0,
  ingredientOccurrences: 0,
  householdStates: 0,
  intentionalHighEnergySnackRepeats: 0,
  calorieMeanMinPercent: Number.POSITIVE_INFINITY,
  calorieMeanMaxPercent: Number.NEGATIVE_INFINITY,
  failures: [],
});

const report = {
  generatedAt: new Date().toISOString(),
  elapsedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(2)),
  workers: parts.length,
  coverage: {
    ...totals,
    combinationsExpected: PLAN_SEEDS.length,
    exhaustive: totals.combinations === PLAN_SEEDS.length,
  },
  thresholds: {
    sevenDayCalorieMeanPercent: 3,
    individualDayCaloriePercent: 7.5,
    proteinTarget: '±5g or ±5%, whichever is larger, when an exact gram target is requested',
    highProteinEnergyPercentMinimum: 20,
    displayedVsIngredientNutrition: 0,
    mealVsDayArithmetic: 0,
    invalidReferences: 0,
    householdStatesPerDistinctOutput: 7,
  },
  failures: totals.failures,
};
const outputPath = writeAuditJson('plan-combinations.json', report);

if (!report.coverage.exhaustive || totals.failures.length) {
  console.error(`Plan audit failed with ${totals.failures.length} captured issue(s).`);
  totals.failures.slice(0, 80).forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Plan audit passed exhaustively for ${totals.combinations.toLocaleString('en-GB')} combinations, ` +
  `${totals.days.toLocaleString('en-GB')} days and ${totals.householdStates.toLocaleString('en-GB')} ` +
  `household-state checks in ${report.elapsedSeconds}s. Report: ${outputPath}`,
);

function runWorker(start, end) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./audit-plan-worker.js', import.meta.url), {
      workerData: { start, end },
    });
    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', code => {
      if (code !== 0) reject(new Error(`Plan audit worker exited with code ${code}`));
    });
  });
}
