import { MEALS } from '../src/data/mealLibrary.js';
import { buildPracticalRecipeSteps, validateRecipeQuality } from '../src/utils/recipeQuality.js';

const issues = [];

for (const meal of MEALS) {
  const recipe = buildPracticalRecipeSteps(meal);
  const mealIssues = validateRecipeQuality({ ...meal, recipe });
  if (mealIssues.length) {
    issues.push({
      id: meal.id || meal.name,
      name: meal.name,
      issues: mealIssues,
    });
  }
}

const blocking = issues.filter(item => (
  item.issues.includes('placeholder language') ||
  item.issues.includes('missing cooking method') ||
  item.issues.includes('ingredient missing quantity') ||
  item.issues.some(issue => issue.startsWith('instruction mentions'))
));

if (blocking.length) {
  console.error(`Recipe quality check found ${blocking.length} blocking issue(s):`);
  for (const item of blocking.slice(0, 40)) {
    console.error(`- ${item.id}: ${item.issues.join(', ')}`);
  }
  process.exit(1);
}

console.log(
  `Recipe quality check passed for ${MEALS.length} shared meals with zero unresolved quantity defects.`,
);
