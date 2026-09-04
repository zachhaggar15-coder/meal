import { DINNER_TEMPLATES } from '../data/dinnerTemplates.js';

export function generateDinnerOptions(rows, targetCalories) {
  const ingredients = normaliseFridgeRows(rows);
  const primaryIngredient = ingredients[0];
  const calories = clamp(Number(targetCalories), 350, 1200);
  const ranked = DINNER_TEMPLATES
    .map((template, index) => {
      const matchedIngredients = ingredients.filter(ingredient => matchesTemplate(template, ingredient));
      return {
        template,
        index,
        matchedIngredients,
        usesPrimaryIngredient: primaryIngredient ? matchesTemplate(template, primaryIngredient) : false,
        score: scoreDinnerTemplate(template, matchedIngredients),
      };
    })
    .filter(({ usesPrimaryIngredient }) => usesPrimaryIngredient)
    .sort((a, b) => (b.score - a.score) || (a.index - b.index));

  return ranked.slice(0, 3).map(({ template, matchedIngredients }, index) => (
    buildDinnerOption(template, matchedIngredients, calories, index)
  ));
}

export function normaliseFridgeRows(rows = []) {
  return rows
    .map(row => ({
      name: (row.name || '').trim(),
      quantity: (row.quantity || '').trim(),
    }))
    .filter(row => row.name)
    .map(row => ({
      ...row,
      search: normaliseSearchText(`${row.name} ${row.quantity}`),
    }));
}

function matchesTemplate(template, ingredient) {
  const ingredientName = normaliseSearchText(ingredient.name);
  return template.keywords.some(keyword => {
    const keywordText = normaliseSearchText(keyword);
    return containsWholePhrase(ingredient.search, keywordText)
      || containsWholePhrase(keywordText, ingredientName);
  });
}

function scoreDinnerTemplate(template, matchedIngredients) {
  const keywordHits = matchedIngredients.reduce((total, ingredient) => (
    total + template.keywords.filter(keyword => (
      containsWholePhrase(ingredient.search, normaliseSearchText(keyword))
    )).length
  ), 0);
  return (matchedIngredients.length * 4) + keywordHits;
}

function buildDinnerOption(template, matchedIngredients, targetCalories, index) {
  const calorieOffsets = [-50, 0, 50];
  const kcal = clamp(Math.round((targetCalories + calorieOffsets[index]) / 25) * 25, 350, 1200);
  const factor = Math.max(0.75, Math.min(1.35, kcal / template.baseKcal));
  const fridgeIngredients = matchedIngredients.slice(0, 4).map(formatFridgeIngredient);
  const pantryIngredients = template.staples.slice(0, Math.max(3, 7 - fridgeIngredients.length));
  const ingredients = [...fridgeIngredients, ...pantryIngredients].slice(0, 8);

  return {
    id: template.id,
    type: 'Dinner',
    name: template.name,
    kcal,
    protein: Math.max(18, Math.round((template.baseProtein * Math.sqrt(factor)) + (matchedIngredients.length * 1.5))),
    prep: template.prep,
    desc: template.desc,
    fridgeIngredients,
    pantryIngredients,
    ingredients,
    portion_size: ingredients.slice(0, 4).join(', '),
    recipe: template.recipe,
    sourcePlan: template.sourcePlan,
    sourceLabel: template.sourceLabel,
  };
}

function normaliseSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function containsWholePhrase(value, phrase) {
  if (!value || !phrase) return false;
  return ` ${value} `.includes(` ${phrase} `);
}

function formatFridgeIngredient(row) {
  return row.quantity ? `${row.name} ${row.quantity}` : row.name;
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
