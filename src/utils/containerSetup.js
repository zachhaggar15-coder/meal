export const CONTAINER_LAST_CHECKED = '13 July 2026';

export const CONTAINER_TIER_COPY = {
  budget: {
    label: 'Budget plastic setup',
    guidePath: '/meal-prep-containers/budget',
    guideLabel: 'Compare budget containers',
    material: 'Reusable plastic',
    fit: 'Best when low cost, freezer portions, student cooking, or a first meal-prep attempt matters most.',
    setup: 'Use a larger plastic multipack for the main meals, then add small tubs for snacks and sauces.',
  },
  'mid-range': {
    label: 'Mid-range glass setup',
    guidePath: '/meal-prep-containers/mid-range',
    guideLabel: 'Compare glass containers',
    material: 'Glass',
    fit: 'Best for regular weekday lunches, reheating at work, curry, chilli, pasta, and repeat washing.',
    setup: 'Start with five rectangular glass lunch boxes, then add small sauce tubs if the plan includes dressings or snacks.',
  },
  premium: {
    label: 'Full glass batch setup',
    guidePath: '/meal-prep-containers/premium',
    guideLabel: 'Compare premium containers',
    material: 'Glass or premium leak-resistant sets',
    fit: 'Best when you already prep most weeks, cook lunches and dinners, or want a longer-term storage system.',
    setup: 'Use a 10-piece glass or premium leak-resistant set so lunches, dinners, snacks, and freezer portions all have a place.',
  },
};

export function getContainerRecommendation({
  containerCount = 7,
  budget = 'mid',
  useCase = 'work',
  material = 'either',
  reheating = false,
  alreadyPreps = false,
} = {}) {
  const count = Number(containerCount) || 7;

  if (budget === 'low') return 'budget';
  if (budget === 'premium' && (alreadyPreps || count >= 10 || useCase === 'commute')) return 'premium';
  if (count >= 16 && budget !== 'low') return 'premium';
  if (material === 'glass' || reheating || useCase === 'microwave') return 'mid-range';
  if (useCase === 'freezer' && count >= 12) return 'premium';
  if (useCase === 'freezer') return 'budget';
  if (useCase === 'commute' && count >= 10 && budget !== 'low') return 'premium';

  return 'mid-range';
}

export function buildContainerSetup({
  plan,
  weeklyPlan,
  formValues,
  budget,
  useCase,
  material,
  spareContainers = 2,
} = {}) {
  const days = getPlanDays(plan, weeklyPlan);
  const prepMeals = getPrepFriendlyMeals(days);
  const fallbackDays = Number(formValues?.days) || days.length || 5;
  const fallbackMeals = Number(formValues?.meals) || 2;
  const portionMultiplier = getPortionMultiplier(plan);
  const baseMealCount = prepMeals.length || Math.max(1, fallbackDays * Math.min(fallbackMeals, 2));
  const sauceTubs = Math.max(2, Math.min(5, Math.ceil(baseMealCount / 5)));
  const freezerTubs = shouldNeedFreezerTubs(days, baseMealCount) ? 2 : 1;
  const containerCount = Math.max(3, Math.ceil(baseMealCount * portionMultiplier) + Number(spareContainers || 0));
  const hasSaucyMeals = days.some(day => (day.meals || []).some(isSaucyMeal));
  const hasReheatMeals = hasSaucyMeals || days.some(day => (day.meals || []).some(isReheatFriendlyMeal));
  const inferredBudget = budget || inferBudget(plan, formValues);
  const recommendation = getContainerRecommendation({
    containerCount,
    budget: inferredBudget,
    useCase: useCase || (hasReheatMeals ? 'microwave' : 'work'),
    material: material || (hasReheatMeals ? 'glass' : 'either'),
    reheating: hasReheatMeals,
    alreadyPreps: baseMealCount >= 10,
  });

  return {
    containerCount,
    sauceTubs,
    freezerTubs,
    prepMealCount: baseMealCount,
    portionMultiplier,
    recommendation,
    hasSaucyMeals,
    hasReheatMeals,
    copy: CONTAINER_TIER_COPY[recommendation],
  };
}

function getPlanDays(plan, weeklyPlan) {
  if (Array.isArray(plan?.plan)) return plan.plan;
  if (Array.isArray(plan?.weekly_plan)) return plan.weekly_plan;
  if (Array.isArray(weeklyPlan)) return weeklyPlan;
  return [];
}

function getPrepFriendlyMeals(days) {
  return days.flatMap(day => (day.meals || []).filter(meal => {
    const type = String(meal.type || '').toLowerCase();
    const name = String(meal.name || '').toLowerCase();
    if (type.includes('snack')) return false;
    if (type.includes('breakfast')) {
      return /oat|yogurt|yoghurt|smoothie|pudding|egg|frittata/.test(name);
    }
    return true;
  }));
}

function getPortionMultiplier(plan) {
  const direct = Number(plan?.totalPortions || plan?.household?.totalPortions);
  if (Number.isFinite(direct) && direct > 0) return Math.min(6, direct);

  const label = String(plan?.totalPortionLabel || plan?.household?.totalPortionLabel || '');
  const fromLabel = Number.parseFloat(label);
  if (Number.isFinite(fromLabel) && fromLabel > 0) return Math.min(6, fromLabel);

  return 1;
}

function inferBudget(plan, formValues) {
  const budget = String(plan?.budget || formValues?.budget || '').toLowerCase();
  if (budget.includes('cheap') || budget.includes('budget')) return 'low';
  if (budget.includes('premium') || budget.includes('flexible')) return 'premium';
  return 'mid';
}

function shouldNeedFreezerTubs(days, baseMealCount) {
  if (baseMealCount >= 12) return true;
  return days.some(day => (day.meals || []).some(meal => {
    const text = `${meal.name || ''} ${meal.description || ''} ${meal.desc || ''}`.toLowerCase();
    return /freezer|batch|chilli|curry|stew|soup|bolognese/.test(text);
  }));
}

function isSaucyMeal(meal) {
  const text = `${meal.name || ''} ${meal.description || ''} ${meal.desc || ''}`.toLowerCase();
  return /chilli|curry|stew|soup|pasta|bolognese|sauce|dressing/.test(text);
}

function isReheatFriendlyMeal(meal) {
  const text = `${meal.name || ''} ${meal.type || ''}`.toLowerCase();
  return /rice|pasta|bowl|potato|casserole|frittata|stir/.test(text);
}
