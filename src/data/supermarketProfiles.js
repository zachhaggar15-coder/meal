// Per-retailer context used to make plan pages genuinely differ by supermarket.
//
// Before this existed, supermarket was a cosmetic label: two plans with the same
// goal and calorie target had byte-identical meals, shopping lists, swaps and
// prep steps, differing only where the store name was interpolated into a
// sentence. That is near-duplicate content across hundreds of URLs.
//
// Everything here is a durable, publicly documented fact about how a retailer
// operates — own-brand tier names, loyalty pricing, range characteristics. It is
// deliberately NOT product-level pricing: those change weekly and we do not
// publish figures we cannot stand behind. Cost estimates continue to come from
// the plan's budget tier, not from here.
//
// Sources checked 2026-07-20: The Grocer, Which?, Grocery Gazette, Retail Gazette.

export const PRICING_CONTEXT_CHECKED = '2026-07-20';

export const SUPERMARKET_PROFILES = {
  aldi: {
    label: 'Aldi',
    tier: 'discounter',
    valueRange: 'Everyday Essentials',
    loyalty: null,
    positioning: 'A limited-range discounter: fewer lines per category, but consistently among the cheapest UK baskets.',
    prepStrengths: [
      'Large fresh meat and mince packs that portion well for batch cooking.',
      'Cheap frozen vegetables and fruit, which keep weekly costs stable.',
      'Own-brand dairy — Greek-style yogurt, cottage cheese, skyr — at discounter prices.',
    ],
    watchOuts: [
      'Ranges rotate and stock varies by store, so plan a fallback for any single named product.',
      'Fewer speciality and free-from lines than the big four, which matters for restrictive diets.',
    ],
    minBudgetTier: 'very-cheap',
  },

  lidl: {
    label: 'Lidl',
    tier: 'discounter',
    valueRange: 'Simply / own-brand core range',
    loyalty: 'Lidl Plus (app coupons and spend rewards)',
    positioning: 'The other major discounter, closely matched with Aldi on basket price and similarly limited in range.',
    prepStrengths: [
      'Strong bakery and fresh produce for the price point.',
      'Vemondo plant-based range makes vegan and vegetarian weeks cheaper than at most mainstream stores.',
      'Frequent Lidl Plus coupons on meat and dairy, which are the costliest part of a high-protein shop.',
    ],
    watchOuts: [
      'Middle-aisle stock is not reliable for weekly planning — treat it as a bonus, not a staple.',
      'Store-to-store availability varies more than at the big four.',
    ],
    minBudgetTier: 'very-cheap',
  },

  tesco: {
    label: 'Tesco',
    tier: 'mainstream',
    valueRange: 'Stockwell & Co (cupboard staples: tins, cereals, tea, baking)',
    loyalty: 'Clubcard Prices',
    positioning: 'The largest UK grocer. Widest range of the mainstream stores, with Clubcard pricing doing much of the value work.',
    prepStrengths: [
      'Deepest own-brand range across price tiers, so most recipes can be built up or down in cost.',
      'Strong free-from and speciality shelves for gluten-free, dairy-free and vegan weeks.',
      'Clubcard Prices frequently cover chicken, mince and dairy — the high-cost items in a protein-led plan.',
    ],
    watchOuts: [
      'Non-Clubcard prices are noticeably higher; the card is effectively required to hit the budget estimate.',
      'The Stockwell & Co economy tier has been shrinking, so some value lines have moved up a tier.',
    ],
    minBudgetTier: 'very-cheap',
  },

  asda: {
    label: 'Asda',
    tier: 'mainstream',
    valueRange: 'Just Essentials (formerly Smartprice)',
    loyalty: 'Asda Rewards (cashback to a wallet rather than instant discounts)',
    positioning: 'Typically the cheapest of the big four on a like-for-like basket, with a genuinely low economy tier.',
    prepStrengths: [
      'Just Essentials is usually the lowest-priced option in its category, which suits very cheap weeks.',
      'Large multipack meat and frozen ranges that suit bulk batch cooking.',
      'Good value on rice, pasta, oats and tinned pulses — the backbone of a budget prep plan.',
    ],
    watchOuts: [
      'Just Essentials lines sell out quickly and availability is inconsistent.',
      'Rewards pays into a wallet rather than reducing the shop at the till, so it will not lower this week\'s bill.',
    ],
    minBudgetTier: 'very-cheap',
  },

  sainsburys: {
    label: "Sainsbury's",
    tier: 'mainstream',
    valueRange: 'Stamford Street Co (consolidated value range since May 2023)',
    loyalty: 'Nectar Prices',
    positioning: 'Mid-market: pricier than Asda or the discounters at list price, but Nectar Prices close much of the gap.',
    prepStrengths: [
      'Reliable fresh produce and fish counters for pescatarian and higher-quality prep.',
      'Strong chilled ready-prepared vegetables, which cut prep time on low-effort plans.',
      'Nectar Prices regularly apply to meat and dairy staples.',
    ],
    watchOuts: [
      'Without a Nectar card the effective basket cost is meaningfully higher.',
      'The Stamford Street value range has been trimmed, so fewer economy lines than a couple of years ago.',
    ],
    minBudgetTier: 'very-cheap',
  },

  morrisons: {
    label: 'Morrisons',
    tier: 'mainstream',
    valueRange: 'Savers',
    loyalty: 'More Card',
    positioning: 'Strong on fresh counters and in-store production, mid-priced against the rest of the big four.',
    prepStrengths: [
      'Butcher and fish counters allow buying exact prep quantities rather than fixed packs.',
      'Market Street ranges are good for buying protein in the amount a plan actually calls for.',
      'Savers covers most cupboard staples needed for batch cooking.',
    ],
    watchOuts: [
      'The Savers range has been cut back, with some lines moved to standard pricing.',
      'Counter service is not available in every store or at every hour.',
    ],
    minBudgetTier: 'very-cheap',
  },

  iceland: {
    label: 'Iceland',
    tier: 'specialist',
    valueRange: 'Iceland own label',
    loyalty: 'Bonus Card',
    positioning: 'A frozen specialist rather than a full weekly shop — strongest as a top-up for the freezer half of a plan.',
    prepStrengths: [
      'Frozen protein and vegetables at low cost with effectively no waste, which suits prep-ahead weeks.',
      'Frozen portions make calorie control easier because pack sizes are consistent.',
      'Useful for freezer-friendly plans where batches are cooked and stored rather than eaten fresh.',
    ],
    watchOuts: [
      'Limited fresh produce and store-cupboard range — most plans need a second shop elsewhere.',
      'Freezer space is the practical constraint, not budget.',
    ],
    minBudgetTier: 'very-cheap',
  },

  waitrose: {
    label: 'Waitrose',
    tier: 'premium',
    valueRange: 'Waitrose Essential (700+ lines; introduced 2009, relaunched 2020)',
    loyalty: 'myWaitrose',
    positioning: 'Premium positioning, but the Essential range is competitive on staples and keeps a plan viable without paying premium prices throughout.',
    prepStrengths: [
      'Essential covers most core prep ingredients, so cost sits well below the headline Waitrose reputation.',
      'High produce and meat quality, which matters when food is cooked ahead and reheated later.',
      'Good free-from and speciality range for restrictive diets.',
    ],
    watchOuts: [
      'Straying outside Essential raises the weekly cost quickly.',
      'Fewer stores nationally, and a smaller convenience footprint than the big four.',
    ],
    minBudgetTier: 'moderate',
  },

  ocado: {
    label: 'Ocado',
    tier: 'premium',
    valueRange: 'Ocado Own Range (740+ own-label lines)',
    loyalty: 'Ocado Smart Pass',
    positioning: 'Online-only, with a very wide catalogue and the M&S food range alongside its own label.',
    prepStrengths: [
      'The widest catalogue of any UK grocer, so speciality and diet-specific ingredients are rarely a blocker.',
      'Delivery slots and a saved trolley make repeating the same weekly prep shop straightforward.',
      'Long product life on delivery is guaranteed, which helps plans that shop once and cook across the week.',
    ],
    watchOuts: [
      'Delivery fees and minimum basket sizes change the real cost of a small weekly shop.',
      'No physical stores, so there is no option to top up mid-week.',
    ],
    minBudgetTier: 'moderate',
  },

  'marks-spencer': {
    label: 'M&S',
    tier: 'premium',
    valueRange: 'Remarksable Value (100+ everyday staples)',
    loyalty: 'Sparks',
    positioning: 'Premium food retailer; Remarksable Value makes a weekly prep shop feasible, but it remains the priciest option here.',
    prepStrengths: [
      'Remarksable Value covers the staples a prep plan leans on most.',
      'Prepared and part-prepared ingredients cut cooking time substantially on low-effort plans.',
      'Consistently high produce quality, which holds up better across several days of storage.',
    ],
    watchOuts: [
      'Outside Remarksable Value, costs rise sharply against every other retailer here.',
      'Smaller pack sizes suit one or two people better than bulk batch cooking.',
    ],
    minBudgetTier: 'moderate',
  },

  coop: {
    label: 'Co-op',
    tier: 'convenience',
    valueRange: 'Honest Value (launched November 2024)',
    loyalty: 'Co-op Membership (member pricing)',
    positioning: 'Convenience-led with smaller stores. Priced above the big four, but member pricing and the Honest Value range keep everyday staples reasonable.',
    prepStrengths: [
      'Honest Value covers fresh meat, produce and dairy rather than just cupboard goods.',
      'Local store footprint makes topping up mid-week realistic when a plan slips.',
      'Member pricing applies to many staples used across prep plans.',
    ],
    watchOuts: [
      'Smaller stores carry less stock, so bulk buying for batch cooking is harder.',
      'Non-member prices are noticeably higher on the same items.',
    ],
    minBudgetTier: 'budget',
  },

  any: {
    label: 'Generic UK supermarket',
    tier: 'generic',
    valueRange: 'Own-brand equivalents at any major retailer',
    loyalty: null,
    positioning: 'Built from ingredients stocked by every major UK supermarket, using average UK pricing rather than one retailer.',
    prepStrengths: [
      'Every ingredient is available nationwide, so the plan works wherever you shop.',
      'Easy to swap to a specific retailer later without changing the meals.',
      'Costs reflect a mid-market average rather than the cheapest or priciest store.',
    ],
    watchOuts: [
      'Shopping entirely at a discounter will usually come in below the estimate; a premium store above it.',
      'No loyalty-scheme pricing is assumed.',
    ],
    minBudgetTier: 'very-cheap',
  },
};

const BUDGET_ORDER = ['very-cheap', 'budget', 'moderate', 'flexible'];

export function getSupermarketProfile(supermarket) {
  return SUPERMARKET_PROFILES[supermarket] || SUPERMARKET_PROFILES.any;
}

// Premium retailers should not advertise a "very cheap" weekly shop — a
// £20-30 week at M&S or Waitrose is not a claim we can support, and publishing
// it would undercut the cost guidance given elsewhere on the site.
export function isBudgetTierAllowed(supermarket, budget) {
  const profile = getSupermarketProfile(supermarket);
  return BUDGET_ORDER.indexOf(budget) >= BUDGET_ORDER.indexOf(profile.minBudgetTier);
}

export function lowestBudgetTierFor(supermarket) {
  return getSupermarketProfile(supermarket).minBudgetTier;
}
