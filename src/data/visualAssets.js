const BASE = '/images/meal-plans/';

function visual(file, alt) {
  return {
    src: `${BASE}${file}`,
    alt,
    width: 1200,
    height: 675,
  };
}

export const SITE_VISUALS = {
  home: visual(
    'weekly-prep.webp',
    'Prepared weekly meals, supermarket ingredients and a meal planning list on a kitchen counter'
  ),
  browse: visual(
    'supermarket-shop.webp',
    'A weekly supermarket shop arranged with a blank shopping list for meal planning'
  ),
  tools: visual(
    'tools-calculator.webp',
    'Meal prep ingredients beside a kitchen scale, notebook and calculator'
  ),
  supermarket: visual(
    'supermarket-shop.webp',
    'UK supermarket staples arranged for a weekly meal plan'
  ),
  printable: visual(
    'printable-plan.webp',
    'A printable weekly meal plan and shopping list beside prepared meals'
  ),
};

export const PLAN_CATEGORY_VISUALS = {
  default: SITE_VISUALS.home,
  lowCalorie: visual(
    'low-calorie.webp',
    'Balanced lower calorie meal prep containers with vegetables and simple supermarket ingredients'
  ),
  highProtein: visual(
    'high-protein.webp',
    'High protein meal prep containers with eggs, yogurt, fish, lean protein and vegetables'
  ),
  muscleGain: visual(
    'muscle-gain.webp',
    'Higher calorie meal prep containers with rice, pasta, oats, nuts and protein foods'
  ),
  budget: visual(
    'budget-shop.webp',
    'Budget meal prep staples including oats, rice, pasta, eggs, tins and simple containers'
  ),
  plantBased: visual(
    'plant-based.webp',
    'Plant-based meal prep containers with tofu, chickpeas, lentils, grains and vegetables'
  ),
  workLunch: visual(
    'work-lunch.webp',
    'Work lunch meal prep containers packed with snacks and weekday lunch ingredients'
  ),
  batchCooking: visual(
    'batch-cooking.webp',
    'Batch cooked food being portioned into meal prep containers on a kitchen counter'
  ),
  shoppingList: SITE_VISUALS.supermarket,
  printable: SITE_VISUALS.printable,
  tools: SITE_VISUALS.tools,
};

export function choosePlanVisual(plan = {}) {
  const goal = normalise(plan.goal || plan.slug || plan.title || '');
  const diet = normalise(plan.dietType || '');
  const effort = normalise(plan.effort || plan.effortLabel || '');
  const budget = normalise(plan.budget || plan.priceEstimate || '');
  const calories = Number(plan.calories || 0);

  if (diet.includes('vegan') || diet.includes('vegetarian') || goal.includes('vegan') || goal.includes('vegetarian')) {
    return PLAN_CATEGORY_VISUALS.plantBased;
  }

  if (
    goal.includes('budget') ||
    goal.includes('cheap') ||
    goal.includes('student')
  ) {
    return PLAN_CATEGORY_VISUALS.budget;
  }

  if (
    goal.includes('muscle') ||
    goal.includes('bodybuilding') ||
    goal.includes('endurance') ||
    goal.includes('gym') ||
    calories >= 2500
  ) {
    return PLAN_CATEGORY_VISUALS.muscleGain;
  }

  if (
    goal.includes('protein') ||
    goal.includes('recomp') ||
    goal.includes('cutting') ||
    diet.includes('pescatarian')
  ) {
    return PLAN_CATEGORY_VISUALS.highProtein;
  }

  if (goal.includes('busy') || goal.includes('work') || goal.includes('low-effort') || effort.includes('minimal') || effort.includes('low')) {
    return PLAN_CATEGORY_VISUALS.workLunch;
  }

  if (goal.includes('loss') || goal.includes('low-cal') || calories <= 1600) {
    return PLAN_CATEGORY_VISUALS.lowCalorie;
  }

  if (effort.includes('batch')) {
    return PLAN_CATEGORY_VISUALS.batchCooking;
  }

  if (budget.includes('very-cheap')) {
    return PLAN_CATEGORY_VISUALS.budget;
  }

  return PLAN_CATEGORY_VISUALS.default;
}

export function chooseHubVisual(hub = {}) {
  const text = normalise([
    hub.slug,
    hub.h1,
    hub.title,
    hub.kicker,
    ...(hub.stats || []),
    ...(hub.match?.goals || []),
    ...(hub.match?.diets || []),
    ...(hub.match?.supermarkets || []),
  ].filter(Boolean).join(' '));

  if (text.includes('printable')) return PLAN_CATEGORY_VISUALS.printable;
  if (text.includes('shopping-list') || text.includes('shopping list')) return PLAN_CATEGORY_VISUALS.shoppingList;
  if (includesAny(text, ['aldi', 'lidl', 'tesco', 'asda', 'sainsbury', 'morrisons', 'iceland', 'supermarket'])) {
    return PLAN_CATEGORY_VISUALS.shoppingList;
  }
  if (includesAny(text, ['vegan', 'vegetarian', 'plant'])) return PLAN_CATEGORY_VISUALS.plantBased;
  if (includesAny(text, ['budget', 'cheap', 'student'])) return PLAN_CATEGORY_VISUALS.budget;
  if (includesAny(text, ['batch', 'sunday'])) return PLAN_CATEGORY_VISUALS.batchCooking;
  if (includesAny(text, ['work', 'lunch', 'busy'])) return PLAN_CATEGORY_VISUALS.workLunch;
  if (includesAny(text, ['muscle', 'endurance', '3000', '3500', '2500'])) return PLAN_CATEGORY_VISUALS.muscleGain;
  if (includesAny(text, ['protein', 'cutting', 'pescatarian'])) return PLAN_CATEGORY_VISUALS.highProtein;
  if (includesAny(text, ['weight', 'loss', 'low-calorie', '1200', '1400', '1500', '1600', '1800'])) {
    return PLAN_CATEGORY_VISUALS.lowCalorie;
  }

  return PLAN_CATEGORY_VISUALS.default;
}

export function chooseComboVisual(page = {}) {
  return chooseHubVisual({
    ...page,
    stats: [
      ...(page.supportingLinks || []).map(link => link.label),
      page.quickAnswer,
      page.shoppingFocus,
    ].filter(Boolean),
  });
}

export function chooseChooserVisual({ mode, choice, goalChoice } = {}) {
  if (mode === 'supermarket') return PLAN_CATEGORY_VISUALS.shoppingList;
  if (mode === 'diet') {
    return choosePlanVisual({
      goal: choice?.defaultGoal,
      dietType: choice?.dietType,
      calories: choice?.defaultCalories,
    });
  }
  if (mode === 'calories') {
    return choosePlanVisual({
      goal: choice?.defaultGoal,
      calories: choice?.calories,
    });
  }
  return choosePlanVisual({
    goal: goalChoice?.value,
    calories: goalChoice?.defaultCalories,
  });
}

export function chooseBlogVisual(slug = '') {
  const text = normalise(slug);

  if (includesAny(text, ['container', 'box', 'tub', 'lunch-bag', 'lid'])) return PLAN_CATEGORY_VISUALS.batchCooking;
  if (includesAny(text, ['vegan', 'vegetarian', 'plant', 'pescatarian'])) return PLAN_CATEGORY_VISUALS.plantBased;
  if (includesAny(text, ['protein', 'fibre', 'snack', 'breakfast', 'powder'])) return PLAN_CATEGORY_VISUALS.highProtein;
  if (includesAny(text, ['supermarket', 'aldi', 'lidl', 'tesco', 'asda', 'sainsbury', 'morrisons', 'iceland', 'shopping'])) {
    return PLAN_CATEGORY_VISUALS.shoppingList;
  }
  if (includesAny(text, ['batch', 'sunday', 'freezer', 'work-lunch', 'microwave', 'one-pan'])) {
    return PLAN_CATEGORY_VISUALS.batchCooking;
  }
  if (includesAny(text, ['3000', '3500', 'muscle', 'endurance', 'running'])) return PLAN_CATEGORY_VISUALS.muscleGain;
  if (includesAny(text, ['budget', 'cheap', 'student', 'family'])) return PLAN_CATEGORY_VISUALS.budget;
  if (includesAny(text, ['calorie', 'deficit', 'weight', 'belly-fat', 'cutting', 'low-calorie'])) {
    return PLAN_CATEGORY_VISUALS.lowCalorie;
  }

  return PLAN_CATEGORY_VISUALS.default;
}

function normalise(value) {
  return String(value || '').toLowerCase();
}

function includesAny(text, needles) {
  return needles.some(needle => text.includes(needle));
}
