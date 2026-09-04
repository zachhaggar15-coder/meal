import { getMealPrepProduct } from '../data/mealPrepProducts.js';

// At most ONE kit product per plan page, and only when the plan's own stated
// method calls for it.
//
// Plan pages already carry a matched container recommendation, which is the
// accessory every meal prepper actually needs. A second product block therefore
// has to earn its place: it is offered only where the plan cannot reasonably be
// cooked the way it is written without the item. Most plans return null, and
// that is the intended outcome — the container cluster taught us that stacking
// commerce onto pages does not create demand for it.
//
// Precedence matters. A batch plan that also targets a protein number gets the
// slow cooker and not the scale, because the cap is one item per page.

const SLOW_COOK_MEAL = /chilli|curry|stew|casserole|soup|bolognese|ragu|tagine|hotpot|pulled|braise/i;

// Above this many portions per meal, the 3.5L bowl stops being able to hold a
// batch in one go and the family model is the honest recommendation.
const FAMILY_PORTION_THRESHOLD = 4;

const MACRO_GOAL = /high-protein|muscle/i;

function planMealText(plan) {
  const days = Array.isArray(plan?.plan) ? plan.plan : [];
  return days
    .flatMap(day => (day.meals || []).map(meal => `${meal.name || ''} ${meal.description || ''} ${meal.desc || ''}`))
    .join(' ');
}

function isBatchPlan(plan) {
  return plan?.effort === 'batch' || plan?.emphasis === 'batch-cooking';
}

function resolvePortions(plan, portions) {
  const direct = Number(portions ?? plan?.totalPortions ?? plan?.household?.totalPortions);
  return Number.isFinite(direct) && direct > 0 ? direct : 1;
}

// Returns { product, title, intro } for the single kit item this plan justifies,
// or null when nothing does.
export function getPlanKitPick(plan, { portions } = {}) {
  if (!plan) return null;

  if (isBatchPlan(plan) && SLOW_COOK_MEAL.test(planMealText(plan))) {
    const family = resolvePortions(plan, portions) >= FAMILY_PORTION_THRESHOLD;
    const product = getMealPrepProduct(family ? 'crockpot-6-5l-family' : 'crockpot-3-5l-red');
    if (!product) return null;
    return {
      product,
      title: 'The one appliance this plan assumes',
      intro: family
        ? 'This is a batch plan built around slow-cooked meals, and at this household size a batch fills a large bowl. A 6.5L slow cooker covers the week in one session. If you already own one, you need nothing else for this plan.'
        : 'This is a batch plan built around slow-cooked meals — the kind of cooking a slow cooker does unattended while you are out. A 3.5L bowl suits the portion counts here. If you already own one, you need nothing else for this plan.',
    };
  }

  if (MACRO_GOAL.test(String(plan?.goal || ''))) {
    const product = getMealPrepProduct('salter-arc-scale');
    if (!product) return null;
    return {
      product,
      title: 'The one tool this plan assumes',
      intro: 'The protein and calorie figures on this plan are calculated from weighed portions. Estimating by eye is where most high-protein plans quietly drift, so a set of digital scales is the difference between following this plan and approximating it. Any scale works — this is simply a cheap, accurate one.',
    };
  }

  return null;
}
