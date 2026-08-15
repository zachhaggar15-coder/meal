// Canonical plan recommendation for "choose a plan" cards.
//
// WHY THIS EXISTS
// ---------------
// Two chooser pages independently reimplemented "pick the best plan for this
// supermarket + goal" as an additive score, and they drifted apart. In
// ChoiceLandingPage the drift inverted a tie-break: `batch` effort scored 6 and
// `standard` scored 5, so wherever a batch variant existed at the target
// calories it won by a single point — 94 vs 93. The card said
// "Lidl Weight Loss plan" and opened "Lidl Very Cheap Batch Cook Weight Loss
// Plan - 1,500 kcal". The plan's canonical identity was right (Lidl,
// weight-loss, 1,500 kcal, standard diet); it was simply the most specialised
// member of that identity rather than the plainest one, and it advertised
// budget and effort attributes the card had never offered. Aldi looked fine
// only because it happened to have no batch variant at that target.
//
// The lesson is that additive scores make unrelated preferences competitive
// with each other: a 6-vs-5 effort nudge could outvote anything worth less than
// a point. So ranking here is strictly lexicographic — each criterion is only
// consulted when every criterion above it has tied — and every criterion reads
// structured plan identity, never a display label.

// Requested identity is matched exactly. A plan is a candidate or it is not;
// there is no partial credit and no substring matching.
const IDENTITY_FIELDS = ['goal', 'supermarket', 'dietType'];

// How specialised each effort style is. `standard` is the neutral weekly plan a
// goal card is promising when it says nothing about prep style; everything else
// adds an attribute the card did not advertise.
const EFFORT_SPECIFICITY = ['standard', 'batch', 'low', 'minimal', 'high-variety'];

// Same idea for the recipe emphasis a plan is built around.
const EMPHASIS_SPECIFICITY = [
  'whole-food',
  'lean-protein',
  'batch-cooking',
  'minimal-effort',
  'low-cal-swaps',
  'frozen-friendly',
  'performance-protein',
  'high-carb-fuel',
  'recomp-protein',
  'high-variety',
];

function slugSegmentCount(slug) {
  return String(slug || '').split('-').length;
}

function specificityRank(list, value) {
  const index = list.indexOf(value);
  // An unknown value is treated as more specialised than every known one, so a
  // newly added variant can never silently outrank the neutral default.
  return index === -1 ? list.length : index;
}

/**
 * Filters to plans that match the requested identity exactly.
 *
 * `calories` is an identity field only when the caller asks for a specific
 * value. `targetCalories` is a preference used for ranking instead — that is
 * the distinction between "this card is for 1,500 kcal plans" and "this card
 * would ideally open a 1,500 kcal plan".
 */
export function candidatePlans(plans, intent = {}) {
  return (plans || []).filter(plan => {
    for (const field of IDENTITY_FIELDS) {
      if (intent[field] && plan[field] !== intent[field]) return false;
    }
    if (intent.calories && plan.calories !== Number(intent.calories)) return false;
    return true;
  });
}

/**
 * Orders candidates from most to least representative of the requested intent.
 *
 * Strictly lexicographic: calorie fit, then neutral diet, then the plainest
 * effort, then the plainest emphasis, then slug. The slug tie-break exists so
 * the choice is stable between builds rather than depending on array order.
 */
export function comparePlansForIntent(intent = {}) {
  const target = Number(intent.targetCalories ?? intent.calories ?? NaN);
  const wantsNeutralDiet = !intent.dietType;

  return (a, b) => {
    if (Number.isFinite(target)) {
      const gap = Math.abs(a.calories - target) - Math.abs(b.calories - target);
      if (gap !== 0) return gap;
    }

    if (wantsNeutralDiet) {
      const neutral = (a.dietType === 'standard' ? 0 : 1) - (b.dietType === 'standard' ? 0 : 1);
      if (neutral !== 0) return neutral;
    }

    const effort = specificityRank(EFFORT_SPECIFICITY, a.effort)
      - specificityRank(EFFORT_SPECIFICITY, b.effort);
    if (effort !== 0) return effort;

    // Slugs are built as `{supermarket}-{goal}-{calories}` plus a suffix for
    // each extra variant attribute, so segment count is a structured measure of
    // how specialised a plan is: `lidl-weight-loss-1500` is the base plan and
    // `lidl-weight-loss-1500-high-fibre` is a variant of it. This reads the
    // canonical slug, not a display title.
    const slugSpecificity = slugSegmentCount(a.slug) - slugSegmentCount(b.slug);
    if (slugSpecificity !== 0) return slugSpecificity;

    const emphasis = specificityRank(EMPHASIS_SPECIFICITY, a.emphasis)
      - specificityRank(EMPHASIS_SPECIFICITY, b.emphasis);
    if (emphasis !== 0) return emphasis;

    return String(a.slug).localeCompare(String(b.slug));
  };
}

/**
 * Returns the plan a card for `intent` should open, or null when no plan
 * matches the requested identity.
 *
 * Returning null is deliberate. Silently falling back to an unrelated plan is
 * the failure this module exists to prevent, so callers must decide what to
 * show when a combination genuinely has no plan yet.
 */
export function recommendPlanForIntent(plans, intent = {}) {
  const candidates = candidatePlans(plans, intent);
  if (!candidates.length) return null;
  return [...candidates].sort(comparePlansForIntent(intent))[0];
}

/**
 * The identity a card is promising, so a caller (or a test) can assert that the
 * destination it navigates to actually delivers it.
 */
export function planIdentity(plan) {
  if (!plan) return null;
  return {
    slug: plan.slug,
    goal: plan.goal,
    supermarket: plan.supermarket,
    dietType: plan.dietType,
    calories: plan.calories,
  };
}

/** True when `plan` satisfies every field `intent` actually specifies. */
export function planMatchesIntent(plan, intent = {}) {
  if (!plan) return false;
  for (const field of IDENTITY_FIELDS) {
    if (intent[field] && plan[field] !== intent[field]) return false;
  }
  if (intent.calories && plan.calories !== Number(intent.calories)) return false;
  return true;
}

export { EFFORT_SPECIFICITY, EMPHASIS_SPECIFICITY };
