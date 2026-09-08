// Contextual alternatives surfaced after the hub's leading recommendation.
// September 2026 coverage review: these indexed plans were reachable only
// through browse pagination. Keep selections within the hub's own matches.
export const HUB_FEATURED_PLAN_SLUGS = {
  vegetarian: ['any-veg-low-cal-1500-whole-food', 'aldi-hp-veg-1800-wholegrain-v3', 'lidl-veg-low-cal-1800-wholegrain-v3', 'lidl-hp-veg-1500-high-variety'],
  aldi: ['aldi-low-effort-veg-1800-batch-light'],
  vegan: ['lidl-vegan-low-cal-1500-protein-focused', 'sainsburys-high-protein-low-cal-1800-higher-protein-vegan-v3'],
  pescatarian: ['any-pescatarian-1500-batch-friendly-v3', 'tesco-body-recomp-pesc-2000-batch-cook', 'tesco-pescatarian-1800-higher-protein-v3'],
  endurance: ['sainsburys-endurance-3000-higher-carb'],
  'budget-bodybuilding': ['any-budget-bodybuilding-2000'],
  'weight-loss': ['any-cutting-1600-batch-cook'],
  'asda-weight-loss': ['asda-weight-loss-1500-quick-prep'],
  'asda-muscle-gain': ['asda-muscle-gain-3000-batch-friendly-pescatarian-v3'],
  '2000-calorie': ['lidl-maintenance-2000'],
};

export function selectHubFeaturedPlans(plans, hubSlug, limit = 12) {
  const featured = new Set(HUB_FEATURED_PLAN_SLUGS[hubSlug] || []);
  const ordered = [
    ...plans.slice(0, 1),
    ...plans.slice(1).filter(plan => featured.has(plan.slug)),
    ...plans.slice(1).filter(plan => !featured.has(plan.slug)),
  ];
  return ordered.slice(0, limit);
}
