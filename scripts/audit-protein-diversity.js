// Same-day lunch/dinner primary-protein collisions across every indexable plan.
//
// Weekly repetition is fine and often deliberate (batch cooking, repeated
// breakfasts). This measures only the thing a reader would notice as lazy:
// eating the same principal protein at both main meals on one day.
import { getAllPlanMeta, getPlanBySlug } from '../src/utils/planBuilder.js';
import { sharedPrimaryProteins, primaryProteinSignature } from '../src/utils/ingredientRoles.js';
import { MEALS } from '../src/data/mealLibrary.js';

const byName = new Map(MEALS.map(meal => [meal.name, meal]));
/** Plan days carry rendered meals; look the real record up for its ingredients. */
function resolve(planMeal) {
  return byName.get(planMeal?.name) || planMeal;
}

export function collisionsForPlan(plan) {
  const found = [];
  for (const day of plan.plan || []) {
    const lunch = (day.meals || []).find(m => /lunch/i.test(m.type));
    const dinner = (day.meals || []).find(m => /dinner/i.test(m.type));
    if (!lunch || !dinner) continue;
    const shared = sharedPrimaryProteins(resolve(lunch), resolve(dinner));
    if (shared.length) {
      found.push({ day: day.day, lunch: lunch.name, dinner: dinner.name, shared });
    }
  }
  return found;
}

function main() {
  const metas = getAllPlanMeta();
  let planDays = 0, collisions = 0;
  const plansAffected = new Set();
  const byProtein = {}, byDiet = {}, byGoal = {}, byEffort = {};
  const examples = [];

  for (const meta of metas) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan) continue;
    planDays += (plan.plan || []).length;
    for (const hit of collisionsForPlan(plan)) {
      collisions += 1;
      plansAffected.add(meta.slug);
      for (const protein of hit.shared) byProtein[protein] = (byProtein[protein] || 0) + 1;
      byDiet[meta.dietType] = (byDiet[meta.dietType] || 0) + 1;
      byGoal[meta.goal] = (byGoal[meta.goal] || 0) + 1;
      byEffort[meta.effort] = (byEffort[meta.effort] || 0) + 1;
      if (examples.length < 10) {
        examples.push(`${meta.slug} ${hit.day}: ${hit.lunch} + ${hit.dinner} [${hit.shared}]`);
      }
    }
  }

  const sort = obj => Object.fromEntries(Object.entries(obj).sort((a, b) => b[1] - a[1]));
  console.log(`plans: ${metas.length}  plan-days: ${planDays}`);
  console.log(`same-day collisions: ${collisions}`);
  console.log(`plans with >=1 collision: ${plansAffected.size} (${(plansAffected.size / metas.length * 100).toFixed(1)}%)`);
  console.log('by protein:', JSON.stringify(sort(byProtein)));
  console.log('by diet:   ', JSON.stringify(sort(byDiet)));
  console.log('by effort: ', JSON.stringify(sort(byEffort)));
  console.log('by goal (top 6):', JSON.stringify(Object.fromEntries(Object.entries(sort(byGoal)).slice(0, 6))));
  if (examples.length) { console.log('examples:'); examples.forEach(e => console.log('  ', e)); }

  // Secondary diagnostic: weekly reliance on a single protein.
  const concentrated = [];
  for (const meta of metas) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan) continue;
    const counts = {};
    let mains = 0;
    for (const day of plan.plan || []) {
      for (const meal of day.meals || []) {
        if (!/lunch|dinner/i.test(meal.type)) continue;
        mains += 1;
        for (const family of primaryProteinSignature(resolve(meal))) {
          counts[family] = (counts[family] || 0) + 1;
        }
      }
    }
    const [top, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
    if (top && n / mains >= 0.7) concentrated.push(`${meta.slug}: ${top} in ${n}/${mains} main meals`);
  }
  console.log(`\nweekly concentration (one protein in >=70% of main meals): ${concentrated.length} plans`);
  concentrated.slice(0, 6).forEach(c => console.log('  ', c));
}

if (process.argv[1] && process.argv[1].endsWith('audit-protein-diversity.js')) main();
