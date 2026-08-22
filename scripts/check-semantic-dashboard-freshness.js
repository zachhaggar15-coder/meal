import { LIBRARY_VALIDATED_ON } from '../src/constants/site.js';
import { PLAN_COUNT } from '../src/data/planSeeds.js';
import { SEMANTIC_QA_DASHBOARD } from '../src/data/semanticQaDashboard.js';

const reportedCount = Number(SEMANTIC_QA_DASHBOARD.coverage?.totalPublishedPlans);
const generatedDate = String(SEMANTIC_QA_DASHBOARD.generatedAt || '').slice(0, 10);

if (reportedCount !== PLAN_COUNT) {
  console.error(`Semantic QA dashboard reports ${reportedCount} plans; catalogue has ${PLAN_COUNT}.`);
  process.exit(1);
}

if (!generatedDate || generatedDate < LIBRARY_VALIDATED_ON) {
  console.error(`Semantic QA dashboard (${generatedDate || 'undated'}) predates plan validation (${LIBRARY_VALIDATED_ON}).`);
  process.exit(1);
}

console.log(`Semantic QA dashboard is current for ${PLAN_COUNT} plans (${generatedDate}).`);
