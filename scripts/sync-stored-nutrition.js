import fs from 'node:fs';
import { MEALS } from '../src/data/mealLibrary.js';
import {
  PLAN_1500,
  PLAN_HIGH_PROTEIN,
  PLAN_VEGAN,
  PLAN_VEGETARIAN,
} from '../src/data/mealPlans.js';
import { computeMealNutrition } from '../src/utils/nutrition.js';

const libraryPath = new URL('../src/data/mealLibrary.js', import.meta.url);
const plansPath = new URL('../src/data/mealPlans.js', import.meta.url);
let librarySource = fs.readFileSync(libraryPath, 'utf8');
let plansSource = fs.readFileSync(plansPath, 'utf8');
let libraryUpdates = 0;
let legacyUpdates = 0;

for (const meal of MEALS) {
  const canonical = computeMealNutrition(meal.ingredients);
  const updated = updateAnchoredObject(
    librarySource,
    `id: '${meal.id}'`,
    { cal: canonical.kcal, pro: canonical.protein },
  );
  librarySource = updated.source;
  libraryUpdates += updated.changed ? 1 : 0;
}

const legacyPlans = { PLAN_1500, PLAN_HIGH_PROTEIN, PLAN_VEGAN, PLAN_VEGETARIAN };
for (const [planName, days] of Object.entries(legacyPlans)) {
  const arrayAnchor = `export const ${planName} = [`;
  for (const day of days) {
    for (const meal of day.meals || []) {
      const canonical = computeMealNutrition(meal.portion_size || meal.ingredients || []);
      const updated = updateLegacyMeal(
        plansSource,
        arrayAnchor,
        day.day,
        meal.name,
        { kcal: canonical.kcal, protein: canonical.protein },
      );
      plansSource = updated.source;
      legacyUpdates += updated.changed ? 1 : 0;
    }
  }
}

fs.writeFileSync(libraryPath, librarySource);
fs.writeFileSync(plansPath, plansSource);
console.log(`Synchronized ${libraryUpdates} shared meal record(s) and ${legacyUpdates} legacy meal occurrence(s).`);

function updateLegacyMeal(source, arrayAnchor, day, name, fields) {
  const arrayStart = source.indexOf(arrayAnchor);
  if (arrayStart < 0) throw new Error(`Missing ${arrayAnchor}`);
  const arrayEnd = findBalancedEnd(source, source.indexOf('[', arrayStart), '[', ']');
  const dayStart = source.indexOf(`day: '${day}'`, arrayStart);
  const nextDay = source.indexOf("day: '", dayStart + 6);
  const dayEnd = nextDay < 0 || nextDay > arrayEnd ? arrayEnd : nextDay;
  const nameAnchor = `name: '${String(name).replaceAll("'", "\\'")}'`;
  const mealStart = source.indexOf(nameAnchor, dayStart);
  if (mealStart < 0 || mealStart > dayEnd) throw new Error(`Missing ${day}/${name}`);
  return updateAnchoredObject(source, nameAnchor, fields, mealStart);
}

function updateAnchoredObject(source, anchor, fields, startAt = 0) {
  const anchorIndex = source.indexOf(anchor, startAt);
  if (anchorIndex < 0) throw new Error(`Missing anchor ${anchor}`);
  let start = anchorIndex;
  while (start >= 0 && source[start] !== '{') start -= 1;
  const end = findBalancedEnd(source, start, '{', '}');
  let objectSource = source.slice(start, end);
  let changed = false;

  for (const [field, value] of Object.entries(fields)) {
    const pattern = new RegExp(`(\\b${field}:\\s*)-?\\d+(?:\\.\\d+)?`);
    const next = objectSource.replace(pattern, `$1${value}`);
    if (next === objectSource && !pattern.test(objectSource)) {
      throw new Error(`Missing field ${field} near ${anchor}`);
    }
    changed ||= next !== objectSource;
    objectSource = next;
  }

  return { source: `${source.slice(0, start)}${objectSource}${source.slice(end)}`, changed };
}

function findBalancedEnd(source, start, open, close) {
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === open) depth += 1;
    if (source[index] === close) depth -= 1;
    if (depth === 0) return index + 1;
  }
  throw new Error(`Unbalanced ${open}${close} block`);
}
