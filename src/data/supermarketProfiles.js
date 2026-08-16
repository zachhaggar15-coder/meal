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
//
// `mealPrepEvidence` was added 2026-08-16 after an audit found that supermarket-
// named articles would survive a find-and-replace of the store name. Each entry
// is researched from the retailer's own site, records the URL and the date it
// was checked, and deliberately holds durable facts — named ranges, product
// formats, store structures — rather than prices or stock levels, which decay
// within weeks. `angle` is the single reason someone would choose that retailer
// for meal prep specifically.

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
    mealPrepEvidence: {
      checked: '2026-08-16',
      source: 'aldi.co.uk category pages',
      sourceUrl: 'https://www.aldi.co.uk/products/higher-protein-food-drink/k/1588161424510127',
      angle: 'A short list done cheaply. Aldi carries one or two options per line rather than ten, which is a constraint when you want a specific product and an advantage when you just want the week bought quickly.',
      findings: [
        'Aldi lists a dedicated Higher Protein Food & Drink category online, so protein-led products are grouped rather than scattered through the aisles.',
        'The Slimwell range groups lower-calorie prepared products in one place.',
        'Specially Selected is the premium own-label tier; Everyday Essentials is the value tier.',
      ],
    },
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
    mealPrepEvidence: {
      checked: '2026-08-16',
      source: 'lidl.co.uk product and category pages',
      sourceUrl: 'https://www.lidl.co.uk/c/high-protein/a10036613',
      angle: 'Lidl is the discounter to pick when the plan leans on high-protein dairy, because its own-brand dairy line covers that specifically rather than incidentally.',
      findings: [
        'Milbona is the own-brand dairy label, and its high-protein line is unusually broad for a discounter: High Protein Skyr, High Protein Greek Style Yoghurt, Fat Free High Protein Yoghurt and a High Protein Drink are all listed as own-brand.',
        'Lidl groups these under a dedicated High Protein category online rather than leaving them in general dairy.',
        'Deluxe is the premium own-label tier.',
      ],
    },
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
    mealPrepEvidence: {
      checked: '2026-08-16',
      source: 'tesco.com own-label and Clubcard Prices pages',
      sourceUrl: 'https://www.tesco.com/shop/en-GB/buylists/new-ranges/new-tesco-own-label-products/tesco-high-protein-range',
      angle: 'Tesco is the tier-shopping supermarket: the same meal can be built at three different price points without leaving own-label, which is what makes it forgiving if your budget moves mid-month.',
      findings: [
        'Own-label runs across distinct tiers — Stockwell & Co for cupboard staples, the standard Tesco line, Hearty Food Co for prepared family dishes, and Tesco Finest at the top.',
        'Tesco lists its own High Protein range as a named own-label range rather than a filter.',
        'Clubcard Prices apply across own-label including fresh meat and fish, so the shelf price and the price you pay can differ materially.',
      ],
    },
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
    mealPrepEvidence: {
      checked: '2026-08-16',
      source: 'asda.com and corporate.asda.com',
      sourceUrl: 'https://www.asda.com/groceries/just-essentials',
      angle: 'Asda is the one to choose when the whole basket has to come from the value tier, because Just Essentials reaches into fresh meat and fish rather than stopping at cupboard goods.',
      findings: [
        'Just Essentials by Asda spans fresh meat, fish and poultry, bakery, frozen and cupboard staples — the value tier is not limited to ambient goods, which matters when protein is the expensive part of a plan.',
        'Asda launched a high-protein ready-meal range in 2026 formulated to be high in protein and to carry at least 80g of fruit or vegetables per 250g meal.',
        'Asda Rewards pays into a cashback wallet rather than discounting at the till, so it does not reduce the price of this week&rsquo;s shop.',
      ],
    },
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
    mealPrepEvidence: {
      checked: '2026-08-16',
      source: 'about.sainsburys.co.uk and sainsburys.co.uk',
      sourceUrl: 'https://www.about.sainsburys.co.uk/news/latest-news/2023/12-07-2023-sainsburys-nectr-prices-offers-savings-on-meat-fish-poultry',
      angle: 'At Sainsbury&rsquo;s the loyalty card is not a rounding error. Nectar Prices reach meat, fish and poultry, which is where a high-protein plan spends most of its money.',
      findings: [
        'Nectar Prices apply to meat, fish and poultry, not only to cupboard and treat lines, so the protein element of a plan is where the member price matters most.',
        'Taste the Difference is the premium own-label tier; Stamford Street Co is the consolidated value tier.',
        'Nectar Prices are excluded at Sainsbury&rsquo;s Local, so a top-up shop will not carry the same prices as a main shop.',
      ],
    },
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
    mealPrepEvidence: {
      checked: '2026-08-16',
      source: 'morrisons.com Market Street pages',
      sourceUrl: 'https://www.morrisons.com/inspiration/shopping-at-morrisons/market-street-hub',
      angle: 'Morrisons is the one supermarket where you can ask for the exact cut and weight you want, which removes the usual meal-prep problem of packs that do not divide into your portions.',
      findings: [
        'Market Street butchery counters cut beef, lamb, pork, turkey and chicken to order — a joint tied, a steak trimmed, a chicken deboned — rather than only selling fixed prepacks.',
        'Morrisons states it has more than 1,200 Market Street trained staff across its stores.',
        'Savers is the value own-label tier and The Best is the premium tier.',
      ],
    },
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
    mealPrepEvidence: {
      checked: '2026-08-16',
      source: 'iceland.co.uk product and category pages',
      sourceUrl: 'https://www.iceland.co.uk/frozen/frozen-meat-and-chicken/chicken',
      angle: 'Iceland solves the portioning problem rather than the price problem. Bagged frozen protein lets you take out exactly the number of portions you are cooking, which is the opposite of a fresh pack that has to be used within days.',
      findings: [
        'Own-label chicken breast fillets are sold frozen and bagged in 1kg and 1.2kg sizes, plus a mini-fillet bag, so portions come out of the freezer individually instead of committing you to a whole pack.',
        'Iceland stocks an exclusive Slimming World frozen range, which is the clearest example of a calorie-controlled line you cannot buy from the other supermarkets.',
        'The site separates a frozen and a fresh hierarchy, so the fresh basics a plan still needs are a distinct shop rather than an afterthought.',
      ],
    },
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
      'Ocado publishes a minimum-life-on-delivery policy, which suits plans that shop once and cook across the week. Check the current policy before relying on it.',
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
      'Ingredients are chosen from staples that most UK supermarkets carry, so the plan should work wherever you shop, though ranges still vary by store.',
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

// How each retailer nudges meal selection.
//
// This is what stops same-goal plans being identical across stores. The values
// are small on purpose: existing tag bonuses in scoreMealForSeed are +8 to +16,
// so ±5-9 reorders near-ties without overriding the goal and calorie matching
// that actually determines whether a plan is any good.
//
// Each nudge has to be justifiable from how the retailer really operates —
// a discounter plan leaning on budget-tagged meals, a frozen specialist leaning
// on batch-friendly ones. It is not randomisation dressed up as personalisation.
export const STORE_MEAL_BIAS = {
  aldi: { budget: 9, note: 'Leans on the cheapest staples, matching a discounter shop.' },
  lidl: { budget: 8, easy: 3, note: 'Discounter staples, with quicker meals for smaller shops.' },
  asda: { budget: 6, batch: 3, note: 'Value lines and bulk packs suit larger batch cooks.' },
  tesco: { protein: 3, note: 'Broad range, so selection stays close to the goal profile.' },
  sainsburys: { easy: 4, note: 'Leans on prepared and part-prepared ingredients.' },
  morrisons: { protein: 5, note: 'Counter-bought protein in exact prep quantities.' },
  iceland: { batch: 9, easy: 5, budget: 4, note: 'Freezer-led, prep-ahead meals.' },
  coop: { easy: 8, note: 'Quicker meals suited to smaller convenience shops.' },
  waitrose: { budget: -6, protein: 4, note: 'Not constrained to the cheapest lines.' },
  ocado: { budget: -5, variety: 5, note: 'Widest catalogue, so more varied selections.' },
  'marks-spencer': { budget: -7, easy: 5, note: 'Premium and part-prepared ingredients.' },
  any: { note: 'Balanced selection with no retailer bias.' },
};

export function getStoreMealBias(supermarket) {
  return STORE_MEAL_BIAS[supermarket] || STORE_MEAL_BIAS.any;
}

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
