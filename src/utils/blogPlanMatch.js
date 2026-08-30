// Picks the meal plan a blog reader should be offered by email.
//
// Blog posts are 22% of search clicks but carried no email capture at all: the
// capture component needs a plan slug, and a post is not a plan. This resolves
// one from the post itself.
//
// The catalogue is passed in rather than imported. Resolving needs plan
// metadata, and the modules holding it are ~190KB and ~120KB — weight the blog
// bundle should not carry, on the pages whose ranking this work exists to
// protect. So the match runs at build time (scripts/generate-blog-plan-index.js)
// and ships as a small static index, and this module stays pure and cheap to
// test.
//
// The match is built from the live catalogue rather than hardcoded pairs.
// Calorie targets are goal-specific — 1400 exists only for cutting, 2500 only
// for the gain goals — so a naive goal x calorie grid misses most of the time.
// Instead each (supermarket, goal) bucket is indexed and the nearest available
// calorie target inside it is chosen, which degrades sensibly instead of
// falling through to an unrelated default.

const SUPERMARKET_PATTERNS = [
  ['sainsburys', /sainsbury/],
  ['marks-spencer', /marks-spencer|marks-and-spencer|m-and-s/],
  ['aldi', /aldi/],
  ['lidl', /lidl/],
  ['tesco', /tesco/],
  ['asda', /asda/],
  ['morrisons', /morrison/],
  ['iceland', /iceland/],
  ['waitrose', /waitrose/],
  ['ocado', /ocado/],
  ['coop', /co-?op\b/],
];

// Ordered — first match wins, so more specific goals precede general ones.
const GOAL_PATTERNS = [
  ['cheap-student', /student/],
  ['budget-bodybuilding', /budget-bodybuilding|budget-muscle|cheap-bodybuilding/],
  ['cheap-hp', /cheap-high-protein|budget-high-protein|cheap-protein|high-protein.*budget/],
  ['budget-fat-loss', /budget-(fat-loss|weight-loss)|cheap-weight-loss/],
  ['muscle-gain', /muscle-gain|bulk|build-muscle|mass-gain|gain-weight/],
  ['gym-beginner', /gym-beginner|beginner-gym|new-to-the-gym/],
  ['body-recomp', /body-recomp|recomp/],
  ['endurance-athlete', /endurance|marathon|running|cyclist|triathl/],
  ['cutting', /cutting|shred|lean-down/],
  ['menopause-nutrition', /menopause/],
  ['anti-inflammatory', /anti-inflammatory|inflammation/],
  ['vegan-low-cal', /vegan/],
  ['pescatarian', /pescatarian|fish-based/],
  ['busy-professional', /busy|work-lunch|office|commut/],
  ['low-effort', /low-effort|lazy|no-cook|quick|easy|minimal-effort|batch/],
  ['maintenance', /maintenance|maintain/],
  ['weight-loss', /weight-loss|fat-loss|slimming|calorie-deficit|low-calorie|lose-weight/],
  ['high-protein-low-cal', /high-protein|protein/],
];

const DIET_PATTERNS = [
  ['vegan', /vegan/],
  ['vegetarian', /vegetarian|veggie|meat-free/],
  ['pescatarian', /pescatarian/],
];

// Tried in order when the post's own goal has no plan for this supermarket.
const FALLBACK_GOALS = ['high-protein-low-cal', 'weight-loss', 'low-effort'];

export const DEFAULT_PLAN_SLUG = 'any-high-protein-low-cal-1500';

// A reader searching a bare calorie number wants a plan at that number for a
// normal week, not a training programme that happens to share the total. At
// targets where no everyday goal exists the specialised ones still win by
// default, because nothing more general is there to outrank them.
const CALORIE_LED_GOAL_ORDER = [
  'maintenance',
  'weight-loss',
  'high-protein-low-cal',
  'low-effort',
  'busy-professional',
];

export function detectSupermarket(slug = '') {
  const match = SUPERMARKET_PATTERNS.find(([, pattern]) => pattern.test(slug));
  return match ? match[0] : null;
}

export function detectGoal(slug = '') {
  const match = GOAL_PATTERNS.find(([, pattern]) => pattern.test(slug));
  return match ? match[0] : null;
}

export function detectDiet(slug = '') {
  const match = DIET_PATTERNS.find(([, pattern]) => pattern.test(slug));
  return match ? match[0] : null;
}

export function detectCalories(slug = '') {
  const match = String(slug).match(/(?:^|[^0-9])([123][0-9]{3})(?:[^0-9]|$)/);
  if (!match) return null;
  const value = Number(match[1]);
  return value >= 1200 && value <= 3600 ? value : null;
}

function calorieLedGoalRank(goal) {
  const rank = CALORIE_LED_GOAL_ORDER.indexOf(goal);
  return rank === -1 ? CALORIE_LED_GOAL_ORDER.length : rank;
}

function isCanonicalSlug(meta) {
  return `${meta.supermarket}-${meta.goal}-${meta.calories}` === meta.slug ? 1 : 0;
}

/** Build (supermarket -> goal -> plans), canonical slugs first. */
export function buildPlanIndex(planMeta = []) {
  const index = new Map();
  for (const meta of planMeta) {
    if (!index.has(meta.supermarket)) index.set(meta.supermarket, new Map());
    const bySupermarket = index.get(meta.supermarket);
    if (!bySupermarket.has(meta.goal)) bySupermarket.set(meta.goal, []);
    bySupermarket.get(meta.goal).push(meta);
  }
  for (const bySupermarket of index.values()) {
    for (const bucket of bySupermarket.values()) {
      // Variant slugs are the same plan re-cut. The canonical short slug is
      // the one worth emailing.
      bucket.sort((a, b) => isCanonicalSlug(b) - isCanonicalSlug(a) || a.calories - b.calories);
    }
  }
  return index;
}

function pickFromBucket(bucket, { calories, diet }) {
  if (!bucket?.length) return null;
  const dietMatched = diet ? bucket.filter(m => m.dietType === diet) : [];
  const standard = bucket.filter(m => !m.dietType || m.dietType === 'standard');
  const pool = dietMatched.length ? dietMatched : (standard.length ? standard : bucket);
  if (!calories) return pool[0];
  return pool.reduce((best, meta) => (
    Math.abs(meta.calories - calories) < Math.abs(best.calories - calories) ? meta : best
  ), pool[0]);
}

/**
 * Resolve the plan a blog reader should be offered.
 *
 * @param {object}   options
 * @param {string}   options.slug            blog post slug
 * @param {object[]} options.exactPlanLinks  editorial links for this post
 * @param {Map}      options.index           from buildPlanIndex()
 * @param {Set}      options.emailablePlans  every slug /api/email-plan can build
 * @returns {string|null}
 */
export function resolveBlogPlanSlug({
  slug = '',
  exactPlanLinks = [],
  index = new Map(),
  emailablePlans = new Set(),
} = {}) {
  // 1. Editorial links first — a human chose them for this post. Only
  //    /meal-plan/ and /plans/ resolve to a plan; /meal-plans/ is a hub page.
  for (const link of exactPlanLinks) {
    const candidate = String(link?.to || '').replace(/^\/(meal-plans?|plans)\//, '');
    if (candidate && emailablePlans.has(candidate)) return candidate;
  }

  const supermarket = detectSupermarket(slug);
  const goal = detectGoal(slug);
  const diet = detectDiet(slug);
  const calories = detectCalories(slug);

  const markets = [...new Set([supermarket, 'any'].filter(Boolean))];
  const goals = [...new Set([goal, ...FALLBACK_GOALS].filter(Boolean))];

  // A calorie-led post naming no goal is asking for that number above all
  // else. Goal-first ordering would answer it with the nearest calorie inside
  // a guessed goal, when an exact match exists under a goal never considered.
  if (calories && !goal) {
    for (const market of markets) {
      const exact = [...(index.get(market)?.values() || [])]
        .flatMap(bucket => bucket.filter(meta => meta.calories === calories))
        .sort((a, b) => calorieLedGoalRank(a.goal) - calorieLedGoalRank(b.goal));
      const picked = pickFromBucket(exact, { calories, diet });
      if (picked && emailablePlans.has(picked.slug)) return picked.slug;
    }
  }

  for (const market of markets) {
    for (const candidateGoal of goals) {
      const picked = pickFromBucket(index.get(market)?.get(candidateGoal), { calories, diet });
      if (picked && emailablePlans.has(picked.slug)) return picked.slug;
    }
  }

  return emailablePlans.has(DEFAULT_PLAN_SLUG) ? DEFAULT_PLAN_SLUG : null;
}
