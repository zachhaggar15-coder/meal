import { MEALS } from '../src/data/mealLibrary.js';
import {
  COVERAGE_FILTER_VALUES,
  COVERAGE_GOAL_PROFILES,
  COVERAGE_PLAN_SEEDS,
  INDEXABLE_PLAN_SEEDS,
  PLAN_SEEDS,
  isCoverageCombinationFeasible,
} from '../src/data/planSeeds.js';
import {
  COMBO_LANDING_PAGES,
  filterPlansForCombo,
} from '../src/data/comboLandingPages.js';
import { buildPlan, getAllPlanMeta } from '../src/utils/planBuilder.js';

const sourceByName = new Map(MEALS.map(meal => [meal.name, meal]));
const seedSlugs = new Set(PLAN_SEEDS.map(seed => seed.slug));
const planFilterKeys = new Set(PLAN_SEEDS.map(planFilterKey));
const errors = [];

if (seedSlugs.size !== PLAN_SEEDS.length) {
  errors.push(`duplicate plan slugs detected: ${PLAN_SEEDS.length - seedSlugs.size} duplicate(s)`);
}

const detailCheckSeeds = getDetailCheckSeeds();
for (const seed of detailCheckSeeds) {
  const plan = buildPlan(seed);

  if (!Array.isArray(plan.plan) || plan.plan.length !== 7) {
    errors.push(`${seed.slug}: expected 7 days`);
    continue;
  }

  for (const day of plan.plan) {
    if (!Array.isArray(day.meals) || day.meals.length < 3) {
      errors.push(`${seed.slug}: ${day.day} has too few meals`);
    }

    if (day.totals?.kcal !== seed.calories) {
      errors.push(`${seed.slug}: ${day.day} totals ${day.totals?.kcal} kcal, expected ${seed.calories}`);
    }

    for (const meal of day.meals || []) {
      const text = [
        meal.type,
        meal.name,
        meal.desc,
        meal.portion_size,
        ...(meal.ingredients || []),
        ...(meal.recipe || []),
      ].join(' ');

      if (/\b(undefined|null|NaN)\b/i.test(text)) {
        errors.push(`${seed.slug}: ${day.day} contains broken text in ${meal.name}`);
      }
    }
  }

  for (const [group, items] of Object.entries(plan.shoppingList || {})) {
    for (const item of items || []) {
      if (/\b(undefined|null|NaN)\b/i.test(item) || /\d+\/\s+\d/.test(item)) {
        errors.push(`${seed.slug}: malformed shopping item in ${group}: ${item}`);
      }
    }
  }

  if (seed.effort === 'batch') {
    const weekdays = plan.plan.slice(0, 5);
    const weekdayLunches = uniqueMeals(weekdays, 'Lunch');
    const weekdayDinners = uniqueMeals(weekdays, 'Dinner');

    if (weekdayLunches.length > 1) {
      errors.push(`${seed.slug}: batch weekdays use ${weekdayLunches.length} lunch bases`);
    }

    if (weekdayDinners.length > 2) {
      errors.push(`${seed.slug}: batch weekdays use ${weekdayDinners.length} dinner bases`);
    }

    if (!plan.prepPlan?.steps?.length) {
      errors.push(`${seed.slug}: missing Sunday prep plan`);
    }

    for (const mealName of [...weekdayLunches, ...weekdayDinners]) {
      const source = sourceByName.get(mealName);
      if (!source?.tags?.includes('batch-friendly')) {
        errors.push(`${seed.slug}: ${mealName} is not tagged batch-friendly`);
      }
    }
  }
}

const feasibleCoverageCombos = validateCoverageCombos();

const allPlanMeta = getAllPlanMeta();
for (const [slug, comboPage] of Object.entries(COMBO_LANDING_PAGES)) {
  const matchingPlans = filterPlansForCombo(allPlanMeta, comboPage);
  if (matchingPlans.length === 0) {
    errors.push(`${slug}: combo landing page has no matching plans`);
  }

  for (const preferredSlug of comboPage.preferredSlugs || []) {
    if (!seedSlugs.has(preferredSlug)) {
      errors.push(`${slug}: unknown preferred plan slug ${preferredSlug}`);
    }
  }

  for (const relatedSlug of comboPage.relatedSlugs || []) {
    if (!COMBO_LANDING_PAGES[relatedSlug]) {
      errors.push(`${slug}: unknown related combo slug ${relatedSlug}`);
    }
  }

  for (const link of comboPage.supportingLinks || []) {
    if (!link.label || !link.to?.startsWith('/')) {
      errors.push(`${slug}: malformed supporting link ${JSON.stringify(link)}`);
    }
  }
}

if (errors.length) {
  console.error(`Plan sanity check failed with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 80)) {
    console.error(`- ${error}`);
  }
  if (errors.length > 80) {
    console.error(`...and ${errors.length - 80} more`);
  }
  process.exit(1);
}

console.log(`Plan sanity check passed for ${PLAN_SEEDS.length} plans, ${detailCheckSeeds.length} detail-built plans, ${feasibleCoverageCombos} feasible filter combinations, and ${Object.keys(COMBO_LANDING_PAGES).length} combo pages.`);

function uniqueMeals(days, type) {
  return [...new Set(
    days
      .flatMap(day => day.meals || [])
      .filter(meal => meal.type === type)
      .map(meal => meal.name)
      .filter(Boolean),
  )];
}

function getDetailCheckSeeds() {
  const seeds = new Map();
  for (const seed of INDEXABLE_PLAN_SEEDS) {
    seeds.set(seed.slug, seed);
  }

  const stride = Math.max(1, Math.floor(COVERAGE_PLAN_SEEDS.length / 1500));
  for (let i = 0; i < COVERAGE_PLAN_SEEDS.length; i += 1) {
    const seed = COVERAGE_PLAN_SEEDS[i];
    if (
      i % stride === 0 ||
      (seed.goal === 'budget-bodybuilding' && seed.supermarket === 'sainsburys' && seed.calories === 2500) ||
      (seed.goal === 'cheap-high-protein' && seed.supermarket === 'sainsburys') ||
      (seed.goal === 'endurance-athlete' && seed.supermarket === 'morrisons')
    ) {
      seeds.set(seed.slug, seed);
    }
  }

  return [...seeds.values()];
}

function validateCoverageCombos() {
  let checked = 0;

  for (const goal of COVERAGE_FILTER_VALUES.goals) {
    const profile = COVERAGE_GOAL_PROFILES[goal];
    for (const supermarket of COVERAGE_FILTER_VALUES.supermarkets) {
      for (const dietType of profile.dietTypes) {
        for (const calories of profile.calories) {
          for (const budget of COVERAGE_FILTER_VALUES.budgets) {
            for (const effort of COVERAGE_FILTER_VALUES.efforts) {
              const combo = { goal, supermarket, dietType, calories, budget, effort };
              if (!isCoverageCombinationFeasible(combo)) continue;

              checked += 1;
              if (!planFilterKeys.has(planFilterKey(combo))) {
                errors.push(`missing feasible plan filter combo: ${planFilterKey(combo)}`);
              }
            }
          }
        }
      }
    }
  }

  const impossibleCombos = [
    { goal: 'budget-bodybuilding', supermarket: 'sainsburys', dietType: 'standard', calories: 3500, budget: 'very-cheap', effort: 'batch' },
    { goal: 'muscle-gain', supermarket: 'tesco', dietType: 'standard', calories: 3500, budget: 'very-cheap', effort: 'standard' },
    { goal: 'weight-loss', supermarket: 'aldi', dietType: 'standard', calories: 3500, budget: 'budget', effort: 'standard' },
  ];

  for (const combo of impossibleCombos) {
    if (planFilterKeys.has(planFilterKey(combo))) {
      errors.push(`impossible combo unexpectedly has a plan: ${planFilterKey(combo)}`);
    }
  }

  if (!PLAN_SEEDS.some(seed => (
    seed.goal === 'budget-bodybuilding' &&
    seed.supermarket === 'sainsburys' &&
    seed.calories === 2500
  ))) {
    errors.push("screenshot query still has no Sainsbury's 2500 kcal Budget Bodybuilding plan");
  }

  return checked;
}

function planFilterKey(seed) {
  return [
    seed.goal,
    seed.supermarket,
    seed.dietType,
    seed.calories,
    seed.budget,
    seed.effort,
  ].join('|');
}
