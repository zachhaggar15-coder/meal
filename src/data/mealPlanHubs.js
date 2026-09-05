
const REVIEWED_DATE = '18 June 2026';

const COMMON_NUTRITION_SOURCES = [
  {
    label: 'NHS Eatwell Guide',
    url: 'https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/',
  },
  {
    label: 'NHS healthy weight guidance',
    url: 'https://www.nhs.uk/live-well/healthy-weight/',
  },
];

const GUIDE_LINKS = {
  lowCalorieFoods: { label: 'Low calorie foods UK', to: '/blog/best-low-calorie-foods-uk' },
  lowCalorieReadyMeals: { label: 'Low calorie ready meals UK', to: '/blog/best-low-calorie-ready-meals-uk' },
  highProteinSnacks: { label: 'High protein snacks UK', to: '/blog/high-protein-snacks-uk' },
  cheapProtein: { label: 'Cheap protein UK', to: '/blog/best-cheap-high-protein-foods-uk' },
  proteinPorridge: { label: 'Protein porridge UK', to: '/blog/protein-porridge-and-yogurt-breakfasts-uk' },
  mealPrepBeginners: { label: 'Meal prep for beginners UK', to: '/blog/meal-prep-for-beginners-uk' },
  shoppingList: { label: 'Meal plans with shopping lists', to: '/meal-plans/meal-plans-with-shopping-list' },
  printable: { label: 'Printable meal plan PDFs', to: '/meal-plans/printable-meal-plans' },
  containers: { label: 'Best meal prep containers UK', to: '/meal-prep-containers' },
};


// Structure is shared; prose is not.
//
// This used to take a single `budgetNote` and generate everything else, which
// meant eleven pages whose intro, both section headings, every paragraph and
// both FAQ answers were identical with the chain name swapped in. Measured,
// they came out at 91% repeated sentence shapes on about 173 words - a
// template with the nouns changed, which is exactly what the content rules
// forbid and what a manual ad review looks for.
//
// `intro`, `sections` and `faq` are now required per chain. The goal table,
// the sources, the supporting guides and the page shape stay shared, because
// repeated layout is fine - it is repeated writing that is the problem.
function createSupermarketHub({ key, label, intro, sections, faq, stats, relatedSlugs = ['weight-loss', '1500-calorie', 'high-protein', 'meal-plans-with-shopping-list'] }) {
  if (!intro || !sections?.length || !faq?.length) {
    throw new Error(`Supermarket hub "${key}" needs its own intro, sections and FAQ. See the note above createSupermarketHub.`);
  }

  return {
    slug: key,
    path: `/meal-plans/${key}`,
    title: `${label} Meal Plans UK - Free Weekly Plans + Shopping Lists`,
    description:
      `Browse free ${label} meal plans for UK weight loss, high protein, vegetarian, vegan, muscle gain and budget goals, with PDFs and shopping lists.`,
    h1: `${label} Meal Plans UK`,
    kicker: 'Supermarket plan hub',
    intro,
    match: { supermarkets: [key] },
    stats: stats || [`${label} plans`, 'Supermarket shopping lists', 'PDF export'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      ...sections,
      {
        h2: `Choosing your ${label} plan by goal`,
        paragraphs: [
          'Pick the goal first and the calorie target second. Every plan below states its own daily average and weekly cost estimate on its page.',
        ],
        table: {
          headers: ['Goal', 'Best starting plan', 'Why'],
          rows: [
            ['Weight loss', `${label} weight loss or high-protein low-calorie`, 'Keeps calories structured while using familiar ingredients'],
            ['Budget control', `${label} budget fat loss or cheap student`, 'Uses repeatable staples and fewer niche products'],
            ['High protein', `${label} high protein or muscle gain`, 'Builds each meal around a clear protein source'],
            ['Meat-free', `${label} vegetarian, vegan or pescatarian`, 'Filters plans by diet type before shopping'],
          ],
        },
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList, GUIDE_LINKS.containers],
    faq,
    relatedSlugs,
  };
}

// Same rule as the supermarket hubs: shared structure, per-page writing.
//
// This used to generate both sections and both FAQ answers from the label, so
// seven goal hubs shared everything but their intro - 70-78% repeated sentence
// shapes. `sections` and `faq` are now required.
function createGoalHub({ key, titleLabel, h1Label = titleLabel, goals = [key], diets, intro, bestFor, sections, faq, relatedSlugs = ['free-online-diet-plans-uk', '1500-calorie', 'high-protein', 'meal-plans-with-shopping-list'] }) {
  if (!intro || !sections?.length || !faq?.length) {
    throw new Error(`Goal hub "${key}" needs its own intro, sections and FAQ.`);
  }

  return {
    slug: key,
    path: `/meal-plans/${key}`,
    title: `${titleLabel} Meal Plans UK - Free PDFs + Shopping Lists`,
    description:
      `Browse free ${titleLabel.toLowerCase()} meal plans for UK supermarkets, with 7-day menus, macros, recipes, printable PDFs and shopping lists.`,
    h1: `${h1Label} Meal Plans UK`,
    kicker: 'Goal plan hub',
    intro,
    match: diets ? { diets } : { goals },
    stats: [bestFor, 'UK supermarket plans', 'PDF and shopping list'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections,
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq,
    relatedSlugs,
  };
}

// Shared structure, per-page writing - see createGoalHub above.
function createShoppingListHub({ key, titleLabel, match, intro, sections, faq, relatedSlugs = ['printable-meal-plans', 'weight-loss', 'high-protein', 'generic-uk-supermarket'] }) {
  if (!intro || !sections?.length || !faq?.length) {
    throw new Error(`Shopping-list hub "${key}" needs its own intro, sections and FAQ.`);
  }

  return {
    slug: key,
    path: `/meal-plans/${key}`,
    title: `${titleLabel} UK - Free Meal Plans + Printable Lists`,
    description:
      `Browse free ${titleLabel.toLowerCase()} for UK supermarkets, with 7-day meal plans, recipes, macros, PDF export and grouped weekly lists.`,
    h1: `${titleLabel} UK`,
    kicker: 'Shopping-list hub',
    intro,
    match,
    stats: ['Grouped shopping lists', 'Printable PDFs', 'UK supermarket ingredients'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections,
    supportingGuides: [GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.containers],
    faq,
    relatedSlugs,
  };
}

const CALORIE_AUTHORITY_HUBS = {
  '1800-calorie': {
    slug: '1800-calorie',
    path: '/meal-plans/1800-calorie',
    title: '1,800 Calorie Meal Plans UK - Printable PDFs + Shopping Lists',
    description:
      'Free 1,800 calorie meal plans for UK supermarkets, with 7-day menus, macros, recipes, printable PDFs and shopping lists.',
    h1: '1,800 Calorie Meal Plans UK',
    kicker: 'Moderate calorie plan hub',
    intro:
      '1,800 kcal is where most people should probably start, and where fewer people do. It is high enough that a week does not run on willpower, and for most adults still low enough to lose weight steadily - which is why it has more plans behind it than any other target on the site.',
    match: { calories: [1800] },
    stats: ['523 plans at 1,800 kcal', 'The largest calorie bucket', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Why the middle target usually wins',
        paragraphs: [
          'A deficit only works for as long as you keep to it, and the aggressive targets are the ones people abandon in week three. 1,800 kcal leaves room for a proper evening meal, a snack and some social eating, which is usually the difference between a plan that lasts a month and one that lasts four days.',
          'It also leaves enough headroom to hit protein and fibre comfortably from ordinary food, without the careful engineering a 1,400 kcal week needs.',
        ],
      },
      {
        h2: 'Who it does not suit',
        paragraphs: [
          'If you are smaller, older or largely sedentary, 1,800 may be close to maintenance rather than a deficit, and the weight will not move. If you are training hard or doing physical work, it may be too low to recover on. Neither is a reason to abandon the target so much as a reason to check it against what actually happens over two or three weeks.',
          'The plans state their own daily averages, so use those and your own weight trend rather than assuming the number is right because it is popular.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.printable],
    faq: [
      {
        q: 'Is 1,800 calories enough to lose weight?',
        a: 'For many adults, yes - it depends on your size, age and activity, not on the number alone. If two or three weeks pass with no change in the trend, the target is too high for you rather than the plan being wrong.',
      },
      {
        q: 'Should I start at 1,800 or go lower?',
        a: 'Starting here and moving down if needed is usually more effective than starting low and rebounding. A deficit you can keep to beats a bigger one you cannot.',
      },
    ],
    relatedSlugs: ['1500-calorie', 'weight-loss', 'high-protein', 'meal-plans-with-shopping-list'],
  },
  '2000-calorie': {
    slug: '2000-calorie',
    path: '/meal-plans/2000-calorie',
    title: '2,000 Calorie Meal Plans UK - Printable PDFs + Shopping Lists',
    description:
      'Free 2,000 calorie meal plans for UK supermarkets, with 7-day menus, macros, recipes, printable PDFs and shopping lists.',
    h1: '2,000 Calorie Meal Plans UK',
    kicker: 'Balanced calorie plan hub',
    intro:
      '2,000 kcal is the most misunderstood number in nutrition, because it is the one printed on food labels. The %RI figures on a UK pack are calculated against 2,000 - but that is a reference value for labelling, not a recommendation for you.',
    match: { calories: [2000, 2200] },
    stats: ['244 plans at 2,000-2,200 kcal', 'Maintenance and active weeks', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'What the label number actually means',
        paragraphs: [
          'The 2,000 kcal reference intake exists so that packaging can show a consistent percentage. It is not a target, and your own maintenance figure may be several hundred calories either side of it depending on your size, activity and job.',
          'Treated as an actual target it suits a lot of people well: maintenance for many adults, or a gentle deficit for someone larger or more active. That is why these plans sit here rather than being labelled a weight-loss set.',
        ],
      },
      {
        h2: 'Maintenance is a skill worth practising',
        paragraphs: [
          'Most diet advice is about losing, and almost none is about the part afterwards where you hold a weight steady. A structured maintenance week is genuinely useful, and it is easier to do deliberately from a plan than by guessing.',
          'This hub also covers 2,200 kcal plans, which suit active work or regular training without moving into a deliberate surplus.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.printable],
    faq: [
      {
        q: 'Is 2,000 calories a day right for me?',
        a: 'It is a labelling reference rather than a personal target. Your maintenance level depends on body size, composition, activity and daily movement - use the number as a starting point and adjust from your own weight trend over a few weeks.',
      },
      {
        q: 'Can I lose weight on 2,000 calories?',
        a: 'If your maintenance is above it, yes. For a larger or very active person 2,000 kcal is a real deficit; for a smaller sedentary person it may be a surplus. The figure is not the deciding factor on its own.',
      },
    ],
    relatedSlugs: ['1800-calorie', '2500-calorie', 'high-protein', 'meal-plans-with-shopping-list'],
  },
  '2500-calorie': {
    slug: '2500-calorie',
    path: '/meal-plans/2500-calorie',
    title: '2,500 Calorie Meal Plans UK - Printable PDFs + Shopping Lists',
    description:
      'Free 2,500 calorie meal plans for UK supermarkets, with 7-day menus, macros, recipes, printable PDFs and shopping lists.',
    h1: '2,500 Calorie Meal Plans UK',
    kicker: 'Higher calorie plan hub',
    intro:
      'Above about 2,300 kcal the problem inverts. Every lower target is an exercise in restraint; at 2,500 the difficulty is actually eating it all, consistently, without feeling stuffed or reaching for food that leaves you no better off.',
    match: { calories: [2500] },
    stats: ['54 plans at 2,500 kcal', 'Surplus and heavy training', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Volume becomes the obstacle',
        paragraphs: [
          'Filling foods are helpful in a deficit and a nuisance in a surplus. A plate of vegetables and lean chicken is satisfying at 1,500 kcal and exhausting to repeat at 2,500, because you run out of appetite before you run out of calories.',
          'These plans deal with that by adding eating occasions rather than enlarging plates, and by leaning on calorie-dense but useful foods - oats, rice, pasta, olive oil, nuts, whole milk and yogurt - instead of simply doubling portions.',
        ],
      },
      {
        h2: 'Protein does not scale with calories',
        paragraphs: [
          'A common mistake at this level is adding calories evenly and assuming protein takes care of itself. It does not: carbohydrates and fats are the easiest things to add, so protein can drift proportionally down even while total intake rises.',
          'Each plan states its own protein figure. If you are training, check that number rather than the calorie total, because it is the one doing the work.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.cheapProtein, GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.printable],
    faq: [
      {
        q: 'Do I need to eat 2,500 calories to build muscle?',
        a: 'Not necessarily. A surplus helps, but the size of it matters less than protein intake and training. A smaller surplus with adequate protein generally produces a better result than a large one.',
      },
      {
        q: 'How do I eat this much without feeling overfull?',
        a: 'More eating occasions rather than bigger plates, and choosing denser foods. Liquid calories - milk, yogurt drinks, smoothies - also help when appetite is the limiting factor rather than time.',
      },
    ],
    relatedSlugs: ['muscle-gain', '3000-calorie', 'high-protein', '2000-calorie'],
  },
};

const SUPERMARKET_AUTHORITY_HUBS = {
  tesco: createSupermarketHub({
    key: 'tesco',
    label: 'Tesco',
    stats: ['163 Tesco plans', 'Clubcard-aware costs', 'Shopping list and PDF'],
    intro:
      'Tesco is the tier-shopping supermarket. The same meal can be built at three different price points without ever leaving own-label, which is what makes it forgiving when your budget moves partway through the month.',
    sections: [
      {
        h2: 'What the depth of the own-brand range buys you',
        paragraphs: [
          'Most recipes here can be built up or down in cost without changing what you cook. A chilli made with standard mince and one made with the value tier is the same plan at two prices, and the swap takes no planning. That is unusual - at a discounter you get one option per line and the decision is made for you.',
          'The free-from and speciality shelves are also the deepest of the mainstream stores, so gluten-free, dairy-free and vegan weeks tend to work here without a second shop.',
        ],
      },
      {
        h2: 'Clubcard is not optional',
        paragraphs: [
          'Non-Clubcard prices are noticeably higher, and the weekly cost estimates on these plans assume you have the card. Clubcard Prices frequently cover chicken, mince and dairy, which is where a protein-led plan spends most of its money.',
          'One thing to watch: the Stockwell & Co economy tier has been shrinking, and some lines that used to sit there have moved up a tier. If you last shopped the value range a year ago, check the shelf rather than assuming.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are the cost estimates based on Clubcard prices?',
        a: 'They assume you are using a Clubcard, because the gap between Clubcard and non-Clubcard pricing is large enough to change the weekly total. Without one, expect to pay meaningfully more than the estimate on the plan page.',
      },
      {
        q: 'Is Tesco a good choice for a restrictive diet?',
        a: 'It is the strongest of the mainstream stores for this. The free-from and speciality ranges are deeper than at the discounters, so gluten-free, dairy-free and vegan plans can usually be shopped in one trip.',
      },
    ],
    relatedSlugs: ['tesco-weight-loss', 'weight-loss', '1500-calorie', 'high-protein'],
  }),
  lidl: createSupermarketHub({
    key: 'lidl',
    label: 'Lidl',
    stats: ['142 Lidl plans', 'Own-brand dairy and Vemondo', 'Shopping list and PDF'],
    intro:
      'Lidl and Aldi are closely matched on basket price, so the reason to pick one over the other is what the plan leans on. Lidl is the discounter to choose when it leans on dairy or plant protein, because its own-brand range covers both deliberately rather than incidentally.',
    sections: [
      {
        h2: 'Where Lidl beats the other discounter',
        paragraphs: [
          'The own-brand dairy line - quark, skyr, high-protein yogurt - is priced at discounter level rather than as a premium product, which matters because those are the ingredients that make a high-protein day affordable. The Vemondo plant-based range does the same job for vegan and vegetarian weeks, which are usually more expensive at mainstream stores, not less.',
          'Bakery and fresh produce are also strong for the price point. Where Aldi wins is large fresh meat packs; if your plan is built on mince and chicken rather than dairy, that is the better fit.',
        ],
      },
      {
        h2: 'Lidl Plus, and what not to plan around',
        paragraphs: [
          'Meat and dairy are the costliest items in a prep shop and they are what Lidl Plus tends to discount. If you are shopping the same plan for several weeks, checking the app first is worth more here than at a store whose scheme pays out later or in points.',
          'The middle aisle is the opposite: do not plan around it. Stock is not reliable enough to repeat next week, so treat anything you find there as a bonus rather than a staple. Store-to-store availability varies more than at the big four generally.',
        ],
      },
    ],
    faq: [
      {
        q: 'Lidl or Aldi for meal prep?',
        a: 'On price, close to identical. Choose Lidl if the plan leans on dairy, plant protein or bakery, and Aldi if it leans on large packs of fresh mince and chicken.',
      },
      {
        q: 'Is a vegan week actually cheaper at Lidl?',
        a: 'Usually yes, relative to mainstream stores, because the Vemondo range is priced as an own-brand line rather than as a speciality product. It is one of the few places where a meat-free week does not cost more than the meat version.',
      },
    ],
    relatedSlugs: ['lidl-high-protein-low-cal', 'weight-loss', 'vegan', 'high-protein'],
  }),
  asda: createSupermarketHub({
    key: 'asda',
    label: 'Asda',
    stats: ['142 Asda plans', 'Just Essentials basket', 'Shopping list and PDF'],
    intro:
      'Asda is the one to choose when the whole basket has to come from the value tier. Just Essentials reaches into fresh meat and fish rather than stopping at cupboard goods, which is what makes a genuinely cheap week possible without eating badly.',
    sections: [
      {
        h2: 'A value range that covers the whole plate',
        paragraphs: [
          'Most economy ranges cover tins, pasta and cereal and stop there, which leaves protein at full price - and protein is the expensive part. Just Essentials goes further, so a plan can sit almost entirely in the value tier rather than half in and half out.',
          'It is also typically the cheapest of the big four on a like-for-like basket, which compounds: a value-tier basket at the cheapest mainstream store is about as low as a full weekly shop goes without moving to a discounter.',
        ],
      },
      {
        h2: 'Two things to know before you shop',
        paragraphs: [
          'The value lines sell out, and inconsistently, which is the trade for the low price. Keeping a second choice in mind for your two or three highest-volume items is the difference between a plan that survives a bad shop and one that does not.',
          'Rewards is also worth understanding before you count on it: it pays cashback into a wallet rather than cutting the bill at the till, so it will not reduce what you spend this week.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is Asda cheaper than Aldi or Lidl?',
        a: 'Usually not on a like-for-like basket - the discounters still tend to win on price. Asda\'s advantage is range: you can do a full weekly shop including speciality items in one trip, which is harder at a discounter.',
      },
      {
        q: 'Can I build a whole plan from Just Essentials?',
        a: 'Close to it, which is unusual. Because the range covers fresh meat and fish as well as cupboard staples, most of a plan can come from it - subject to availability, which is the main caveat.',
      },
    ],
    relatedSlugs: ['asda-muscle-gain', 'weight-loss', 'cheap-student', 'budget-shopping-list'],
  }),
  sainsburys: createSupermarketHub({
    key: 'sainsburys',
    label: 'Sainsbury\'s',
    stats: ['105 Sainsbury\'s plans', 'Nectar-aware costs', 'Shopping list and PDF'],
    intro:
      'At Sainsbury\'s the loyalty card is not a rounding error. Nectar Prices reach meat, fish and poultry, which is exactly where a high-protein plan spends most of its money, and the difference is large enough to change which plans are affordable.',
    sections: [
      {
        h2: 'Where the money actually moves',
        paragraphs: [
          'List prices here sit above Asda and well above the discounters, and on that basis Sainsbury\'s looks like a poor choice for a budget plan. Nectar Prices close most of that gap, and because they regularly apply to meat and dairy staples rather than just to treats, they land on the part of the shop that costs the most.',
          'Without a card the effective basket cost is meaningfully higher, so the weekly estimates on these plans assume you have one.',
        ],
      },
      {
        h2: 'Good for fish, and for weeks with no time',
        paragraphs: [
          'The fresh produce and fish counters are reliable, which matters for pescatarian plans and for anything you intend to cook properly rather than reheat. The chilled ready-prepared vegetable range is the other quiet advantage: it removes most of the chopping from a low-effort week at a modest cost premium.',
          'The Stamford Street value range has been trimmed since it was consolidated, so there are fewer economy lines than there were a couple of years ago. Plan on Nectar Prices rather than on the value tier.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do I need a Nectar card for these plans?',
        a: 'For the cost estimates to hold, yes. The gap between Nectar and non-Nectar pricing on meat and dairy is wide enough that a high-protein plan can cost noticeably more without one.',
      },
      {
        q: 'Is Sainsbury\'s good for pescatarian meal prep?',
        a: 'It is one of the better mainstream options, because of the fish counter and the consistency of the fresh range. If a plan asks for a specific fish, you are more likely to find it here than at a discounter.',
      },
    ],
    relatedSlugs: ['weight-loss', 'pescatarian', 'high-protein', '1500-calorie'],
  }),
  morrisons: createSupermarketHub({
    key: 'morrisons',
    label: 'Morrisons',
    stats: ['98 Morrisons plans', 'Counter-cut portions', 'Shopping list and PDF'],
    intro:
      'Morrisons is the one supermarket where you can ask for the exact cut and weight you want. That removes the most persistent annoyance in meal prep - packs that do not divide into the portions your plan actually calls for.',
    sections: [
      {
        h2: 'Why buying by weight changes prep',
        paragraphs: [
          'A plan that needs 840g of chicken across the week does not fit a 650g pack, so you either buy two and waste some or adjust the portions and lose the calorie accuracy. At the butcher and fish counters you buy the amount the plan asks for, which makes the macros on the page match what you actually cook.',
          'The Market Street ranges are the practical version of this: protein in the quantity you need rather than the quantity the packer chose. For batch cooking across several days, that is worth more than a small price difference.',
        ],
      },
      {
        h2: 'The catch, and it is a real one',
        paragraphs: [
          'Counter service is not available in every store, or at every hour. If you shop late or use a smaller branch, you may find the counters closed and be back to fixed packs - so it is worth knowing your store\'s hours before building a week around exact weights.',
          'The Savers range has also been cut back, with some lines moved to standard pricing. Morrisons is mid-priced against the rest of the big four; the counters are the reason to choose it, not the value tier.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is it cheaper to buy from the counter?',
        a: 'Not usually per kilo. It is cheaper per plan, because you buy what you need instead of rounding up to the next pack and wasting the remainder.',
      },
      {
        q: 'What if my local store has no counter?',
        a: 'Then most of the advantage disappears and another store may suit you better. The plans work with pre-packed meat too, but you lose the exact-portion benefit that makes Morrisons worth choosing.',
      },
    ],
    relatedSlugs: ['weight-loss', 'muscle-gain', 'high-protein', 'meal-plans-with-shopping-list'],
  }),
  iceland: createSupermarketHub({
    key: 'iceland',
    label: 'Iceland',
    stats: ['62 Iceland plans', 'Frozen portion control', 'Shopping list and PDF'],
    intro:
      'Iceland is not a weekly shop, and treating it as one is why people bounce off it. It is the freezer half of a plan - strong on protein and vegetables that keep, weak on everything you would buy fresh - and the plans here are built around that split rather than pretending it does not exist.',
    sections: [
      {
        h2: 'What Iceland covers, and what it does not',
        paragraphs: [
          'The frozen protein and vegetable ranges are cheap, keep indefinitely and cover most of what a plan needs for its main meals. Fresh produce, cupboard staples and most dairy are where the range thins out, so the shopping lists on these plans mark which items are realistically an Iceland purchase and which are not.',
          'That makes Iceland a good second shop and a poor only shop. Used that way it is one of the cheapest ways to cover the expensive part of a plan.',
        ],
      },
      {
        h2: 'Which goals suit it',
        paragraphs: [
          'Weight loss and low-effort weeks work best here, because both benefit from food that is portioned and ready to cook. Higher-calorie muscle-gain plans are harder, since a surplus needs volume and variety that the frozen range alone does not cover.',
          'The Bonus Card is worth having but will not transform the basket - Iceland is already priced low on the lines these plans use, so there is less headroom than at a store where loyalty pricing does the heavy lifting.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is Iceland actually cheaper for meal prep?',
        a: 'On frozen protein and vegetables, usually yes, and waste is close to zero because you only cook what you take out. Across a full basket the discounters still tend to win, because Iceland cannot supply the rest of the shop.',
      },
      {
        q: 'Do I need a big freezer?',
        a: 'More than you might expect, and it is the constraint people hit rather than cost. A week of frozen protein and vegetables takes real space, and a standard under-counter freezer fills quickly once anything batch-cooked goes in alongside.',
      },
    ],
    relatedSlugs: ['iceland-low-effort', 'weight-loss', 'meal-plans-with-shopping-list', 'printable-meal-plans'],
  }),
  waitrose: createSupermarketHub({
    key: 'waitrose',
    label: 'Waitrose',
    stats: ['30 Waitrose plans', 'Essential-range costs', 'Shopping list and PDF'],
    intro:
      'Waitrose has a reputation for being unaffordable for a weekly shop, and the Essential range is the reason that is not quite true. It covers most of what a prep plan actually needs, and a plan built inside it costs far less than the name suggests.',
    sections: [
      {
        h2: 'Quality matters more when food is reheated',
        paragraphs: [
          'Most meal prep is cooked once and eaten across several days, which is harder on ingredients than cooking fresh each night. Produce and meat that were good on day one hold up better on day four, and that is where the price difference here shows up as something you can taste rather than something abstract.',
          'The free-from and speciality range is also strong, so restrictive diets tend to work without a second shop.',
        ],
      },
      {
        h2: 'Stay inside Essential',
        paragraphs: [
          'This is the whole discipline of shopping here. The Essential line covers over 700 products including the core prep staples, and a plan that stays within it is competitive on price. Stray outside it and the weekly cost rises quickly - faster than at any of the mainstream stores.',
          'There are also fewer stores nationally and a smaller convenience footprint, so a mid-week top-up is less likely to be practical than it would be with one of the big four.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is Waitrose realistic on a budget?',
        a: 'Inside the Essential range, more realistic than most people expect. Outside it, no - the gap against the discounters widens fast, and these plans are costed on the assumption you stay in Essential.',
      },
      {
        q: 'Why are there fewer Waitrose plans than Tesco ones?',
        a: 'The catalogue is smaller here, and honestly so - Waitrose plans start at the moderate budget tier because a very cheap Waitrose basket is not a credible thing to publish.',
      },
    ],
    relatedSlugs: ['weight-loss', 'high-protein', 'pescatarian', '1500-calorie'],
  }),
  ocado: createSupermarketHub({
    key: 'ocado',
    label: 'Ocado',
    stats: ['26 Ocado plans', 'Widest UK catalogue', 'Shopping list and PDF'],
    intro:
      'Ocado is online-only, and that changes what it is good for. The catalogue is the widest of any UK grocer, so a speciality ingredient is rarely the thing that blocks a plan - but there is no popping in on the way home if something runs out.',
    sections: [
      {
        h2: 'Built for repeating the same shop',
        paragraphs: [
          'A saved trolley plus a booked delivery slot makes running the same weekly prep shop genuinely low-effort, which is the part most people give up on by week three. If you have settled on a plan you intend to repeat, this is the easiest place to do it.',
          'Ocado also publishes a minimum-life-on-delivery policy, which suits shopping once and cooking across the week rather than topping up. Check the current policy before relying on it for anything with a short shelf life.',
        ],
      },
      {
        h2: 'Delivery costs change the maths on a small shop',
        paragraphs: [
          'Delivery fees and minimum basket sizes are part of the real cost, and on a single-person week they can be a meaningful percentage of the total. For a larger household or a fortnightly shop they matter much less.',
          'The other constraint is that there is no physical store, so there is no mid-week top-up if a plan slips or something spoils. Plans here assume you shop once and cook to it.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is Ocado worth it for one person?',
        a: 'Often not on a small weekly shop, once delivery and the minimum basket are counted. It makes more sense for a bigger household, or if you shop fortnightly and freeze.',
      },
      {
        q: 'Does Ocado stock M&S food?',
        a: 'Yes - the M&S range sits alongside Ocado\'s own label, which is part of why the catalogue is so wide. That also means it is easy to spend well above the plan estimate if you shop by brand rather than by list.',
      },
    ],
    relatedSlugs: ['weight-loss', 'high-protein', 'meal-plans-with-shopping-list', '1500-calorie'],
  }),
  'marks-spencer': createSupermarketHub({
    key: 'marks-spencer',
    label: 'M&S',
    stats: ['29 M&S plans', 'Remarksable Value staples', 'Shopping list and PDF'],
    intro:
      'M&S is the priciest option here, and the Remarksable Value range is what makes a prep plan feasible at all. Where it genuinely earns its place is time: the prepared and part-prepared ingredients cut real minutes off a week you have no capacity to cook in.',
    sections: [
      {
        h2: 'Paying for preparation rather than food',
        paragraphs: [
          'Trimmed, chopped and part-cooked ingredients are the expensive kind of convenience, and on a low-effort week they are also the useful kind. If the alternative to a slightly pricier basket is not cooking at all, the maths looks different from the way it looks on a spreadsheet.',
          'Produce quality is consistently high, which matters more here than the price comparison suggests: food cooked on Sunday and eaten on Thursday is a harder test than food eaten the day it is bought.',
        ],
      },
      {
        h2: 'Pack sizes suit one or two people',
        paragraphs: [
          'This is the practical limit. M&S packs are smaller than at the big four, which is fine for a single person or a couple and awkward for bulk batch cooking - you end up buying three of something where another store sells one large pack more cheaply.',
          'Outside Remarksable Value, costs rise sharply against every other retailer here. Staying inside it is the difference between a viable plan and an expensive one.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is M&S sensible for meal prep at all?',
        a: 'For one or two people who value time over cost, yes - particularly on low-effort plans. For bulk batch cooking on a budget it is the wrong choice, and Asda or a discounter will serve you better.',
      },
      {
        q: 'Why are there so few M&S plans?',
        a: 'The catalogue here starts at the moderate budget tier, because a very cheap M&S basket is not a real thing. That deliberately limits how many plans can exist rather than padding the number with ones that would not work.',
      },
    ],
    relatedSlugs: ['weight-loss', 'high-protein', 'printable-meal-plans', 'meal-plans-with-shopping-list'],
  }),
  coop: createSupermarketHub({
    key: 'coop',
    label: 'Co-op',
    stats: ['28 Co-op plans', 'Honest Value staples', 'Shopping list and PDF'],
    intro:
      'Co-op is a convenience shop rather than a big-shop destination, and the plans here treat it that way. Its real advantage is that there is probably one near you, which makes it the store that rescues a plan when the week does not go as intended.',
    sections: [
      {
        h2: 'The store that covers the slip',
        paragraphs: [
          'Most meal plans fail somewhere around Wednesday, when something gets eaten early or a dinner does not happen. The local footprint means a top-up is realistic rather than a special trip, and that is worth more to whether a plan survives the week than a small price difference is.',
          'Honest Value, launched at the end of 2024, also reaches fresh meat, produce and dairy rather than stopping at cupboard goods, so a value basket here covers more of the plate than it used to.',
        ],
      },
      {
        h2: 'Small stores, and membership matters',
        paragraphs: [
          'Bulk buying for batch cooking is harder here - smaller stores carry less stock, and a plan that needs three large packs of chicken may simply clear the shelf. The plans here are built around smaller, more frequent shopping rather than one big one.',
          'Non-member prices are noticeably higher on the same items, so member pricing is assumed in the weekly estimates.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is Co-op too expensive for weekly meal prep?',
        a: 'At non-member prices, often yes. With membership and inside Honest Value it is reasonable for smaller, more frequent shops - which is how these plans are structured.',
      },
      {
        q: 'Can I batch cook from Co-op?',
        a: 'For one or two people, usually. For a large batch, stock levels in a small store become the limit rather than price, so a big-four store will be less frustrating.',
      },
    ],
    relatedSlugs: ['weight-loss', 'budget-shopping-list', 'cheap-student', 'meal-plans-with-shopping-list'],
  }),
};


const GOAL_AUTHORITY_HUBS = {
  vegan: createGoalHub({
    key: 'vegan',
    titleLabel: 'Vegan',
    diets: ['vegan'],
    intro: 'Vegan meal plans work best when protein is planned first. These UK plans use tofu, beans, lentils, chickpeas, soy yogurt, meat-free pieces, grains, vegetables and practical supermarket staples.',
    bestFor: 'Plant-based plans',
    sections: [
      {
        h2: 'Plan the protein first, then the rest',
        paragraphs: [
          'A vegan week falls apart in the same place every time: protein gets treated as whatever is left after the vegetables. Building it the other way round - deciding the protein anchor for each meal before anything else - is the single change that makes these plans work, and it is why every plan here names one.',
          'Tofu, tempeh, seitan, lentils, chickpeas, beans, soya yogurt and meat-free mince all do the job at UK supermarket prices. Lidl and Aldi price their plant ranges as own-brand lines rather than as speciality products, which is why a vegan week can genuinely cost less at a discounter.',
        ],
      },
      {
        h2: 'The nutrients worth paying attention to',
        paragraphs: [
          'B12 is the one that matters most, because it is not reliably available from plant foods - the NHS advises a supplement or fortified foods for anyone eating no animal products. Iron, calcium, iodine and omega-3 need a little thought too, though all are achievable from ordinary food.',
          'These plans use fortified soya products and a mix of pulses, grains, nuts and seeds rather than assuming variety will cover it. They are general planning information, not a substitute for advice from a GP or dietitian if you have a specific concern.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is a vegan meal plan more expensive?',
        a: 'Not necessarily, and often less. Pulses, tofu, grains and frozen vegetables are among the cheapest food in a UK supermarket. Cost climbs when a plan leans on branded meat substitutes, so these plans use those sparingly.',
      },
      {
        q: 'How do I get enough protein without powders?',
        a: 'Every meal in these plans has a named protein anchor from whole food - pulses, tofu, tempeh or soya dairy. Powder is optional and nothing here depends on it.',
      },
    ],
  }),
  pescatarian: createGoalHub({
    key: 'pescatarian',
    titleLabel: 'Pescatarian',
    diets: ['pescatarian'],
    intro: 'Pescatarian meal plans are useful when you want fish, eggs, dairy, beans and plant foods without meat. These plans use familiar UK supermarket ingredients and balanced weekly shopping lists.',
    bestFor: 'Fish and meat-free plans',
    sections: [
      {
        h2: 'Fish is the axis, and frozen is fine',
        paragraphs: [
          'The practical question in a pescatarian week is not whether to eat fish but how often, and whether you can afford it. Frozen fillets solve both: they cost substantially less than the fresh counter, portion cleanly, and the nutritional difference is small because freezing happens close to the catch.',
          'Tinned fish does more work than people expect. Sardines, mackerel and salmon are cheap, keep indefinitely and carry the oily-fish nutrients that white fish does not.',
        ],
      },
      {
        h2: 'Oily fish, and the rest of the week',
        paragraphs: [
          'NHS guidance is at least two portions of fish a week, one of them oily - salmon, mackerel, sardines, trout or herring. These plans build that in rather than leaving it to chance, and spread the rest across eggs, dairy, pulses and grains so the week is not entirely fish.',
          'Anyone pregnant or trying to conceive should check the NHS advice on limits for oily fish and on species to avoid, because the guidance differs from the general population.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is frozen fish as good as fresh?',
        a: 'For these plans, yes. It is frozen soon after catch, which often makes it fresher on arrival than counter fish that has travelled. It is also cheaper and easier to portion, which is why the plans lean on it.',
      },
      {
        q: 'Can I use these plans if I do not eat much fish?',
        a: 'Partly. They assume fish two or three times a week; the rest is eggs, dairy and pulses. If you want less than that, a vegetarian plan will fit better than adapting one of these.',
      },
    ],
  }),
  menopause: createGoalHub({
    key: 'menopause',
    titleLabel: 'Menopause Diet',
    h1Label: 'Menopause Nutrition',
    goals: ['menopause-nutrition'],
    intro: 'Menopause nutrition meal plans focus on protein, fibre, calcium-rich foods, healthy fats and practical meals. They are general planning information, not medical advice.',
    bestFor: 'Menopause nutrition',
    sections: [
      {
        h2: 'What these plans actually do',
        paragraphs: [
          'They focus on three things that are practical to plan for: enough protein spread across the day, enough calcium and vitamin D for bone health, and enough fibre. None of that is specific to menopause - it is ordinary good eating - but the reason to plan it deliberately is that requirements do not stay still, and appetite and routine often change at the same time.',
          'Protein matters more here than most plans assume, because muscle is harder to hold onto and easier to lose. The plans spread it across meals rather than concentrating it in the evening.',
        ],
      },
      {
        h2: 'What this is not',
        paragraphs: [
          'This is general meal planning, not medical advice, and no meal plan treats menopause symptoms. Evidence for specific foods or supplements changing symptoms is mixed and often weak, and anything sold on a strong claim is worth treating with suspicion.',
          'If symptoms are affecting daily life, that is a conversation with a GP. The NHS pages on menopause and on bone health are a better starting point than a meal plan for that question.',
        ],
      },
    ],
    faq: [
      {
        q: 'Will these plans help with menopause symptoms?',
        a: 'They are not designed to and no meal plan can promise that. What they do is make it easier to eat consistently, with enough protein, calcium and fibre - which is worth doing regardless of symptoms.',
      },
      {
        q: 'Do I need a supplement?',
        a: 'That depends on your diet and your bloods, and it is a question for a GP rather than a website. The NHS does advise most adults consider vitamin D in autumn and winter, which applies to everyone rather than being menopause-specific.',
      },
    ],
  }),
  endurance: createGoalHub({
    key: 'endurance',
    titleLabel: 'Endurance Nutrition',
    h1Label: 'Endurance and Running',
    goals: ['endurance-athlete'],
    intro: 'Endurance meal plans are designed for runners, cyclists and active weeks where carbohydrate, protein and recovery meals need to be planned rather than improvised.',
    bestFor: 'Running and endurance',
    sections: [
      {
        h2: 'Under-fuelling is the usual mistake',
        paragraphs: [
          'Most people planning meals around running or cycling are trying to eat less, and the two goals fight each other. Training on too little leaves you slower, more injury-prone and hungrier later, and the weight rarely moves the way you wanted anyway.',
          'These plans are built to fuel the training first. Carbohydrate is not the enemy here: it is what the session runs on, and cutting it is what makes weeks fall apart around the third hard run.',
        ],
      },
      {
        h2: 'Timing matters more than at any other goal',
        paragraphs: [
          'For most other goals it barely matters when you eat. For endurance it does. A meal with carbohydrate a few hours before a long session, and something with both carbohydrate and protein reasonably soon after, is the part that actually changes how the next session feels.',
          'The plans mark which meals sit around training. If your sessions move, move those meals rather than rebuilding the week.',
        ],
      },
    ],
    faq: [
      {
        q: 'How many calories do I need for endurance training?',
        a: 'More than most calculators suggest once weekly volume is high, and it varies enormously with session length and intensity. These plans run from 2,500 upwards; use your own weight trend and how sessions feel rather than a fixed number.',
      },
      {
        q: 'Can I lose weight while training for a distance event?',
        a: 'It is possible but hard to do well, and a training block is usually the wrong time to try. If you do, keep the deficit small and protect the meals around your key sessions.',
      },
    ],
    relatedSlugs: ['2500-calorie', '3000-calorie', 'high-protein', 'meal-plans-with-shopping-list'],
  }),
  'cheap-student': createGoalHub({
    key: 'cheap-student',
    titleLabel: 'Cheap Student',
    goals: ['cheap-student'],
    intro: 'Cheap student meal plans focus on low-cost UK supermarket staples, repeatable breakfasts, simple lunches and dinners that do not need a full kitchen of equipment.',
    bestFor: 'Student budget plans',
    sections: [
      {
        h2: 'The constraint is usually the kitchen, not the money',
        paragraphs: [
          'Most budget advice assumes a full kitchen and a freezer you control. In a shared house you may have one shelf, two working rings, no scales and someone else\'s washing-up in the sink. These plans assume that: short ingredient lists, few pans, and meals that do not need equipment beyond a hob and an oven tray.',
          'They also assume you cannot leave things in a communal fridge and expect to find them. Cupboard and freezer staples do more of the work here than fresh produce that needs using within three days.',
        ],
      },
      {
        h2: 'Repetition is the thing that actually saves money',
        paragraphs: [
          'Variety is expensive. Buying five different vegetables in small quantities costs more and wastes more than buying two in larger ones, and waste is where a student budget really goes - not on the shop itself.',
          'These plans repeat breakfasts and lunches deliberately and put the variety in the evening meal, which is the one people actually notice.',
        ],
      },
    ],
    faq: [
      {
        q: 'How cheap are these plans really?',
        a: 'Each states its own weekly estimate, and the cheapest sit in the lowest budget tier. The figure assumes you already have basic cupboard staples - oil, spices, stock - which is where a first shop costs more than the estimate suggests.',
      },
      {
        q: 'What if I only have a microwave?',
        a: 'Some of these work and some do not. Filter for the minimal-effort plans, which lean on assembly rather than cooking, rather than trying to adapt a plan built around an oven.',
      },
    ],
  }),
  'budget-bodybuilding': createGoalHub({
    key: 'budget-bodybuilding',
    titleLabel: 'Budget Bodybuilding',
    goals: ['budget-bodybuilding'],
    intro: 'Budget bodybuilding meal plans aim for higher protein and enough calories without turning the weekly shop into premium products. They use eggs, oats, rice, pasta, chicken, tuna, beans, yogurt and freezer staples.',
    bestFor: 'Budget muscle gain',
    sections: [
      {
        h2: 'Protein per pound, not protein per serving',
        paragraphs: [
          'A surplus with enough protein is expensive if you shop the way the fitness industry suggests. It stops being expensive when you buy protein by cost rather than by brand: eggs, milk, tinned fish, chicken thighs rather than breast, own-brand yogurt, dried pulses and frozen fish all deliver protein at a fraction of the price of anything marketed for training.',
          'These plans are built from that list. Nothing here depends on a supplement, though a shake is a reasonable way to replace one of the dairy servings if it suits you.',
        ],
      },
      {
        h2: 'Where a cheap surplus usually goes wrong',
        paragraphs: [
          'The easy way to add calories cheaply is carbohydrate and oil, which works right up until protein has quietly drifted down as a proportion of the total. The plans state protein in grams for exactly this reason - it is the number to check, not the calorie figure.',
          'The other failure is buying in bulk and then not cooking it. Large packs only save money if they get eaten, which is why these lean on batch cooking and freezing rather than on a big fresh shop.',
        ],
      },
    ],
    faq: [
      {
        q: 'How much protein do I actually need?',
        a: 'Common guidance for people training for muscle is somewhere around 1.6-2.2g per kg of bodyweight daily, with little evidence of benefit above that. Each plan states its own figure so you can match it to your weight.',
      },
      {
        q: 'Are supplements worth it on a budget?',
        a: 'Whey is a cheap source of protein per gram, so it can help. It is not necessary - every plan here reaches its protein target from food alone.',
      },
    ],
    relatedSlugs: ['muscle-gain', '2500-calorie', '3000-calorie', 'high-protein'],
  }),
};

const SHOPPING_LIST_AUTHORITY_HUBS = {
  'low-calorie-shopping-list': createShoppingListHub({
    key: 'low-calorie-shopping-list',
    titleLabel: 'Low Calorie Shopping List',
    match: { goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'vegetarian-low-cal', 'vegan-low-cal', 'cutting'], calories: [1400, 1500, 1600, 1800] },
    intro: 'A low calorie shopping list should make the week easier, not smaller. These plans focus on lean protein, high-volume vegetables, fruit, filling carbohydrates and simple sauces.',
    sections: [
      {
        h2: 'A low-calorie list should be big, not small',
        paragraphs: [
          'The instinct on a deficit is to buy less, and it is the reason most low-calorie weeks end in a takeaway. A list that works is physically large: high-volume vegetables, fruit, potatoes, oats and pulses take up room in a trolley and in a stomach, and that is the point.',
          'What comes off the list is not food but calorie density - oils used by the tablespoon rather than the glug, sauces chosen deliberately, and fewer things eaten by the handful.',
        ],
      },
      {
        h2: 'Protein and fibre are what stop the hunger',
        paragraphs: [
          'Both slow you down and keep you full, and both are easy to under-buy when you are shopping for a smaller total. The lists here anchor every meal to a protein source and put fibre in from vegetables, pulses, oats and fruit rather than from a supplement.',
          'The practical test of a low-calorie shop is whether you are hungry on Thursday. If you are, the problem is usually the protein and fibre in the basket rather than a lack of willpower.',
        ],
      },
    ],
    faq: [
      {
        q: 'What should I take off the list first?',
        a: 'Not food - calorie-dense extras. Cooking oil, cheese, sauces, spreads and snacks account for a surprising share of a day and are easier to reduce than meals.',
      },
      {
        q: 'Do I need to weigh everything?',
        a: 'No. Weighing the calorie-dense items - oils, nuts, cheese, cereal - gets most of the accuracy for a fraction of the effort. Vegetables barely matter.',
      },
    ],
    relatedSlugs: ['low-calorie', '1500-calorie', 'weight-loss', 'high-protein', 'meal-plans-with-shopping-list'],
  }),
  'high-protein-shopping-list': createShoppingListHub({
    key: 'high-protein-shopping-list',
    titleLabel: 'High Protein Shopping List',
    match: { goals: ['high-protein-low-cal', 'cheap-high-protein', 'high-protein-vegetarian', 'budget-bodybuilding', 'muscle-gain', 'body-recomp'] },
    intro: 'A high protein shopping list works best when every meal has a clear protein anchor. These plans use UK supermarket staples such as eggs, yogurt, chicken, tuna, tofu, beans, lentils and fish.',
    sections: [
      {
        h2: 'This is really a cost problem',
        paragraphs: [
          'Hitting a protein target is easy if money is no object. The reason people fail is that protein is the most expensive thing in the trolley, so the useful skill is knowing which sources deliver the most per pound: eggs, milk, own-brand yogurt, tinned fish, chicken thighs, dried pulses and frozen white fish.',
          'Chicken breast and anything branded for fitness sit at the wrong end of that list. Neither is necessary, and swapping them out changes the weekly total more than any other single decision.',
        ],
      },
      {
        h2: 'Spread it across the day',
        paragraphs: [
          'A protein total reached almost entirely at dinner is worse than the same total spread across meals, and it is also harder to hit. The lists here put a protein source in breakfast and lunch rather than treating those as carbohydrate meals.',
          'Dairy does most of that work because it is cheap, needs no cooking and keeps. Yogurt, milk, quark and cottage cheese are the reason a high-protein week is affordable at all.',
        ],
      },
    ],
    faq: [
      {
        q: 'What is the cheapest protein in a UK supermarket?',
        a: 'Eggs, milk, dried pulses and own-brand yogurt are consistently among the cheapest per gram. Tinned fish and frozen white fish are close behind and need no preparation.',
      },
      {
        q: 'Do I need protein powder?',
        a: 'No. It is a convenient and reasonably cheap source, but every plan behind these lists reaches its target from ordinary food.',
      },
    ],
    relatedSlugs: ['high-protein', 'muscle-gain', '2500-calorie', 'meal-plans-with-shopping-list'],
  }),
  'budget-shopping-list': createShoppingListHub({
    key: 'budget-shopping-list',
    titleLabel: 'Budget Meal Prep Shopping List',
    match: { budgets: ['very-cheap', 'budget'], goals: ['budget-fat-loss', 'cheap-student', 'cheap-high-protein', 'budget-bodybuilding', 'weight-loss'] },
    intro: 'A budget meal prep shopping list should repeat useful staples while keeping enough variety to avoid giving up by Wednesday. These plans prioritise cheap protein, filling carbs, frozen veg and simple batch cooks.',
    sections: [
      {
        h2: 'Waste is the hidden cost',
        paragraphs: [
          'The thing that makes a weekly shop expensive is usually not the prices but what gets thrown away. Fresh produce bought hopefully on Saturday and binned on Thursday is money spent twice - once on the food, once on the takeaway that replaced it.',
          'These lists lean on frozen vegetables, tinned pulses and cupboard staples that cannot spoil, and keep fresh produce to what will realistically be eaten in the first few days.',
        ],
      },
      {
        h2: 'Fewer ingredients, bought in larger amounts',
        paragraphs: [
          'Buying five vegetables in small packs costs more and wastes more than buying two in bigger ones. The same is true of protein: one large pack divided across three meals beats three different proteins in small packs.',
          'That is why these lists look repetitive on paper. The repetition is the saving, and it is concentrated in breakfast and lunch so the evening meal can still vary.',
        ],
      },
    ],
    faq: [
      {
        q: 'How much should a weekly shop cost?',
        a: 'Each plan gives its own estimate by budget tier, from the low twenties upwards per person. The figure assumes cupboard staples are already in, which is why a first shop runs higher.',
      },
      {
        q: 'Is own-brand always cheaper?',
        a: 'Almost always, and the value tiers now reach fresh meat and fish at several chains rather than stopping at cupboard goods. Asda\'s Just Essentials and Co-op\'s Honest Value both go further than economy ranges used to.',
      },
    ],
    relatedSlugs: ['cheap-student', 'budget-bodybuilding', 'aldi', 'lidl'],
  }),
};

export const MEAL_PLAN_HUBS = {
  'aldi-weight-loss': {
    slug: 'aldi-weight-loss',
    path: '/meal-plans/aldi-weight-loss',
    title: 'Aldi Weight Loss Meal Plans UK - Free Plans + Shopping Lists',
    description: 'Free Aldi weight loss meal plans from 1,400 to 1,800 kcal, built around Everyday Essentials, with shopping lists, macros and printable PDFs.',
    h1: 'Aldi Weight Loss Meal Plans UK',
    kicker: 'Aldi fat loss hub',
    intro: 'Aldi is a short list done cheaply. It carries one or two options per line where a big-four store carries ten, and for a calorie deficit that constraint is mostly a help: fewer decisions in the aisle, and a basket that stays under control without much thought.',
    match: { supermarkets: ['aldi'], goals: ['weight-loss'] },
    stats: ['23 Aldi plans', '1,400-1,800 kcal', 'Shopping list and PDF'],
    sections: [
      {
        h2: 'What Aldi is good at for a deficit',
        paragraphs: [
          'Three things carry these plans. The fresh mince and chicken come in large packs that divide cleanly into portions, so a single tray covers three or four dinners rather than one. Frozen vegetables and fruit are cheap enough to use as the default rather than the fallback, which keeps the weekly cost flat even when fresh produce prices move. And the own-brand dairy line - Greek-style yogurt, cottage cheese, skyr - lands at discounter prices, which matters because those are the ingredients that make a low-calorie day feel like enough food.',
          'The practical effect is that a deficit at Aldi tends to hold up over several weeks, where a plan built on a specialist range often does not.',
        ],
      },
      {
        h2: 'Plan a fallback for anything named',
        paragraphs: [
          'Aldi rotates its ranges and stock varies between stores, so treat any single named product as a preference rather than a requirement. If a plan calls for skyr and the chiller is empty, Greek-style yogurt does the same job at a similar protein cost. If a specific mince percentage is missing, the next one up works with a slightly smaller portion.',
          'This is the one habit worth building before you shop here. It is also why these plans lean on categories - lean mince, frozen mixed vegetables, plain high-protein yogurt - rather than on particular products.',
        ],
      },
      {
        h2: 'Where Aldi is the wrong choice',
        paragraphs: [
          'If you need free-from or speciality lines, Aldi carries fewer of them than the big four, and a restrictive diet can end up needing a second shop anyway. In that case a Tesco or Sainsbury\'s plan will be less frustrating even though the basket costs a little more.',
        ],
      },
    ],
    faq: [
      {
        q: 'How low do the Aldi weight loss plans go?',
        a: '1,400 kcal is the lowest here. Below that it becomes difficult to hit protein and fibre from ordinary supermarket food without supplements, so the catalogue stops there rather than going lower for the sake of it.',
      },
      {
        q: 'Are there vegetarian and vegan versions?',
        a: 'Yes - the Aldi weight loss plans cover standard, vegetarian, vegan and pescatarian weeks. The vegan ones lean on frozen vegetables, tinned pulses and own-brand soya, which are the parts of the range that stay reliably in stock.',
      },
      {
        q: 'Can I cook these ahead?',
        a: 'Some of them. The effort levels here run from minimal through to full batch weeks, so if you would rather cook twice and reheat, filter for the batch plans rather than adapting a standard one.',
      },
    ],
    relatedSlugs: ['aldi', 'weight-loss', '1500-calorie'],
  },

  'lidl-high-protein-low-cal': {
    slug: 'lidl-high-protein-low-cal',
    path: '/meal-plans/lidl-high-protein-low-cal',
    title: 'Lidl High Protein Low Calorie Meal Plans UK - Free Plans',
    description: 'Free Lidl high-protein low-calorie meal plans from 1,500 to 1,800 kcal, using own-brand dairy and Vemondo, with shopping lists and macros.',
    h1: 'Lidl High Protein Low Calorie Meal Plans UK',
    kicker: 'Lidl high-protein hub',
    intro: 'Protein is the expensive part of a low-calorie week, and it is the part most plans quietly skimp on. Lidl is the discounter to pick when a plan leans on high-protein dairy, because its own-brand range covers that deliberately rather than incidentally.',
    match: { supermarkets: ['lidl'], goals: ['high-protein-low-cal'] },
    stats: ['10 Lidl plans', '1,500-1,800 kcal', 'Shopping list and PDF'],
    sections: [
      {
        h2: 'Why the dairy aisle does the work here',
        paragraphs: [
          'Hitting a high protein target under 1,800 kcal is mostly an exercise in getting protein without much fat or sugar attached. Quark, skyr, cottage cheese and plain high-protein yogurt do that better than almost anything else in a supermarket, and Lidl prices them at discounter level rather than as a premium line.',
          'That is why these plans put dairy at breakfast and around training, and use meat and fish for the evening meal where there is more calorie headroom.',
        ],
      },
      {
        h2: 'Lidl Plus coupons are worth timing',
        paragraphs: [
          'Meat and dairy are the costliest items in a high-protein shop, and they are also what Lidl Plus tends to discount. If you are shopping the same plan for several weeks, checking the app before you go is worth more here than at a store whose loyalty scheme pays out later or in points.',
          'Do not build a week around a coupon, though. Treat it as a discount on a shop you were doing anyway.',
        ],
      },
      {
        h2: 'Vegetarian weeks are cheaper at Lidl than most places',
        paragraphs: [
          'The Vemondo range makes a meat-free high-protein week genuinely affordable, which is not true at every mainstream store. Two of the plans here are vegetarian and lean on it alongside dairy and pulses.',
          'One caution: middle-aisle stock is not reliable enough to plan around. If you see a protein product there, treat it as a bonus rather than a staple you can repeat next week.',
        ],
      },
    ],
    faq: [
      {
        q: 'How much protein do these plans actually hit?',
        a: 'Each plan states its own daily average on the plan page, alongside carbohydrate, fat and fibre. They sit high relative to the calorie target - that is the point of the goal - but the figure varies by plan, so check the one you pick rather than assuming a single number.',
      },
      {
        q: 'Is Lidl or Aldi better for high protein?',
        a: 'They are closely matched on basket price. Lidl edges it when the plan leans on dairy and plant protein, because of the own-brand dairy line and Vemondo. Aldi is the better pick when the plan is built on fresh mince and chicken in large packs.',
      },
    ],
    relatedSlugs: ['lidl', 'high-protein', 'aldi'],
  },

  'asda-muscle-gain': {
    slug: 'asda-muscle-gain',
    path: '/meal-plans/asda-muscle-gain',
    title: 'Asda Muscle Gain Meal Plans UK - Free High Calorie Plans',
    description: 'Free Asda muscle gain meal plans from 2,000 to 3,500 kcal built on Just Essentials, with shopping lists, macros and printable PDFs.',
    h1: 'Asda Muscle Gain Meal Plans UK',
    kicker: 'Asda muscle gain hub',
    intro: 'Eating in a surplus is a volume problem before it is a nutrition problem. At 3,000 kcal you are buying roughly twice the food of a cutting week, every week, which is where Asda earns its place: Just Essentials reaches into fresh meat and fish rather than stopping at cupboard staples, so the whole basket can sit in the value tier.',
    match: { supermarkets: ['asda'], goals: ['muscle-gain'] },
    stats: ['16 Asda plans', '2,000-3,500 kcal', 'Shopping list and PDF'],
    sections: [
      {
        h2: 'Where the money goes in a surplus',
        paragraphs: [
          'The backbone of these plans is rice, pasta, oats and tinned pulses, which Asda prices well and which carry most of the extra calories. Protein comes from multipack meat and the frozen range, both of which suit cooking in bulk on one or two days rather than every evening.',
          'The plans run from 2,000 to 3,500 kcal. Above about 3,000, most people find they need a fourth or fifth eating occasion rather than larger plates, so the higher-calorie plans are structured that way.',
        ],
      },
      {
        h2: 'Two things about Asda specifically',
        paragraphs: [
          'Just Essentials lines sell out, and inconsistently. When you are buying the same items in quantity every week that matters more than it would on a smaller shop, so it is worth having a second choice in mind for the two or three items you buy most of.',
          'Asda Rewards pays cashback into a wallet rather than reducing the bill at the till. It is real money, but it will not make this week\'s shop cheaper, which is worth knowing if you are budgeting weekly rather than monthly.',
        ],
      },
      {
        h2: 'Vegetarian and pescatarian surpluses',
        paragraphs: [
          'Both are covered here. A meat-free surplus is harder because plant proteins tend to arrive with more volume and fibre attached, which fills you up before the calories are in. The vegetarian plans handle that with more dairy and oils and slightly denser meals rather than simply scaling up the portions.',
        ],
      },
    ],
    faq: [
      {
        q: 'How fast should I expect to gain on these?',
        a: 'That depends on your starting point, training and activity, and it is not something a meal plan can predict. The plans give you a consistent calorie and protein intake to work from; judge the rate from your own weight trend over a few weeks and adjust the calorie target up or down.',
      },
      {
        q: 'Do I need supplements to hit these protein targets?',
        a: 'No. Every plan reaches its protein figure from ordinary supermarket food. If you use a shake it can replace one of the dairy servings, but nothing in the plans depends on it.',
      },
    ],
    relatedSlugs: ['asda', 'muscle-gain', 'high-protein'],
  },

  'iceland-low-effort': {
    slug: 'iceland-low-effort',
    path: '/meal-plans/iceland-low-effort',
    title: 'Iceland Low Effort Meal Plans UK - Frozen Meal Prep Plans',
    description: 'Free Iceland low-effort meal plans from 1,500 to 2,000 kcal using frozen protein and vegetables, with shopping lists, macros and PDFs.',
    h1: 'Iceland Low Effort Meal Plans UK',
    kicker: 'Iceland frozen prep hub',
    intro: 'Iceland solves the portioning problem rather than the price problem. Bagged frozen protein lets you take out exactly the number of portions you need, which removes both the waste and most of the weighing - and that is why it suits a week where you have very little time to cook.',
    match: { supermarkets: ['iceland'], goals: ['low-effort'] },
    stats: ['9 Iceland plans', '1,500-2,000 kcal', 'Shopping list and PDF'],
    sections: [
      {
        h2: 'Why frozen makes low-effort weeks easier',
        paragraphs: [
          'Consistent pack sizes do most of the work. When a portion of chicken or fish is already the right size, calorie control stops depending on a set of scales and a decision at the end of a long day. Frozen vegetables need no washing, trimming or rescuing before they go off, and nothing is wasted because you only take out what you cook.',
          'These plans are built around that: short ingredient lists, few pans, and meals that go from freezer to plate without a preparation stage in between.',
        ],
      },
      {
        h2: 'You will need a second shop',
        paragraphs: [
          'This is the honest limitation. Iceland is a frozen specialist, not a full weekly shop - the fresh produce and store-cupboard ranges are limited, so most of these plans assume you pick up basics like oats, rice, fruit or dairy elsewhere. The shopping list separates them so you can see what is coming from where before you set off.',
          'If you would rather do one shop, a Tesco or Asda plan will suit you better even though you lose some of the freezer advantages.',
        ],
      },
      {
        h2: 'Freezer space is the real constraint',
        paragraphs: [
          'Budget is rarely what stops these plans working. Space is. A week of frozen protein and vegetables, plus anything you batch-cook and store, needs more room than a standard under-counter freezer usually has spare. It is worth checking what you can actually fit before shopping for a full week rather than discovering it with a full trolley.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is frozen food less nutritious than fresh?',
        a: 'Not meaningfully for the vegetables and fish in these plans. Freezing happens soon after harvest or catch, and the nutritional difference against fresh produce that has spent days in transit and storage is small. The NHS Eatwell Guide counts frozen vegetables towards your five a day on the same basis as fresh.',
      },
      {
        q: 'How much cooking do these plans actually involve?',
        a: 'The effort levels run from minimal through to batch. The minimal plans are built around single-pan or oven-tray meals; the batch ones ask for one longer cooking session and reheating for the rest of the week. Pick by how much time you have on your least busy day, not your average one.',
      },
    ],
    relatedSlugs: ['iceland', 'meal-plans-with-shopping-list'],
  },

  ...CALORIE_AUTHORITY_HUBS,
  ...SUPERMARKET_AUTHORITY_HUBS,
  ...GOAL_AUTHORITY_HUBS,
  ...SHOPPING_LIST_AUTHORITY_HUBS,
  '1500-calorie': {
    slug: '1500-calorie',
    path: '/meal-plans/1500-calorie',
    title: '1500 Calorie Meal Plan UK: Printable 7-Day PDF',
    description:
      'Free printable 1500 calorie meal plans for UK weight loss, with simple 7-day menus, high-protein options, vegetarian plans, PDFs and shopping lists.',
    h1: '1500 Calorie Meal Plan UK',
    kicker: 'Low calorie plan hub',
    intro:
      'A 1500 calorie meal plan works best when it is simple, filling and easy to shop for in UK supermarkets. Use this hub to compare printable 7-day plans, high-protein options, vegetarian and vegan weeks, PDF exports and shopping lists without building every meal from scratch.',
    match: { calories: [1500, 1400, 1600], goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'vegetarian-low-cal', 'vegan-low-cal', 'cutting'] },
    stats: ['1500 kcal/day options', 'Printable PDF plans', 'Weekly shopping lists'],
    modified: '2026-07-02',
    reviewed: '2 July 2026',
    supportingGuides: [
      GUIDE_LINKS.lowCalorieFoods,
      { label: 'What 1500 calories looks like', to: '/blog/what-does-1500-calories-look-like-uk' },
      { label: '1500 vs 1800 vs 2000 calories', to: '/blog/1500-vs-1800-vs-2000-calories' },
      GUIDE_LINKS.highProteinSnacks,
      GUIDE_LINKS.containers,
    ],
    sections: [
      {
        h2: 'Quick answer: what does 1500 calories look like?',
        paragraphs: [
          'For most people, a realistic 1500 calorie day is breakfast, lunch, dinner and one or two snacks rather than tiny meals. The exact split can change, but the best plans keep protein visible at every meal and use vegetables, fruit, beans, potatoes, oats, rice or wholemeal bread for volume.',
          'A simple UK supermarket day might look like Greek yogurt with berries and oats, a chicken or tofu wrap with salad, turkey chilli with rice, and a snack such as fruit with cottage cheese or skyr.',
        ],
        table: {
          headers: ['Meal', 'UK example', 'Calories', 'Protein'],
          rows: [
            ['Breakfast', '0% Greek yogurt, berries and oats', '350-400 kcal', '25-35g'],
            ['Lunch', 'Chicken, tuna, egg or tofu wrap with salad', '400-450 kcal', '30-45g'],
            ['Dinner', 'Turkey chilli, lentil curry or salmon with potatoes', '500-600 kcal', '35-50g'],
            ['Snacks', 'Fruit, skyr, cottage cheese, boiled eggs or soup', '150-250 kcal', '10-25g'],
          ],
        },
      },
      {
        h2: 'How to choose a 1500 calorie meal plan',
        paragraphs: [
          'Start with diet type and supermarket before choosing exact meals. A realistic 1500 calorie plan should still include breakfast, lunch, dinner and enough protein to keep the day satisfying.',
          'If you are hungry on 1500 calories, choose high-fibre or high-protein plans first. If your week is busy, use batch-cook plans so lunch and dinner are easier to repeat.',
        ],
      },
      {
        h2: 'Choose the right 1500 calorie plan',
        paragraphs: [
          'Weight loss and budget fat loss plans are the safest starting points. High-protein low-calorie plans suit gym users, while vegetarian and vegan low-calorie plans are better when you want plant-forward meals without building the week yourself.',
        ],
        table: {
          headers: ['Intent', 'Best starting point', 'Why it works'],
          rows: [
            ['Simple 1500 calorie meal plan', 'Standard weight loss plans', 'Familiar UK meals, clear portions and no unusual products'],
            ['High protein 1500 calorie plan', 'High protein low calorie plans', 'More chicken, tuna, eggs, yogurt, tofu, beans and lean mince'],
            ['Vegetarian 1500 calorie plan', 'Vegetarian low calorie plans', 'Uses eggs, dairy, tofu, lentils, beans and meat-free protein'],
            ['Free 1500 calorie diet plan', 'This hub or the quiz', 'No account, no app, shopping-list pages and printable plan views'],
            ['Printable 1500 calorie PDF', 'Any matching plan page', 'Every plan includes a weekly PDF summary and shopping list'],
          ],
        },
      },
      {
        h2: 'Shopping for a 1500 calorie plan in the UK',
        paragraphs: [
          'The most useful basket is not complicated: oats, 0% Greek yogurt or skyr, eggs, chicken, tuna, tofu or beans, frozen vegetables, salad, potatoes, rice, wraps, fruit, cottage cheese and a few low-calorie sauces.',
          'Aldi and Lidl are strong for basic low-cost weeks. Tesco, Asda and Sainsbury\'s are helpful when you want more specific vegetarian, high-protein, ready-to-eat or free-from options. Generic UK supermarket plans use common ingredients and average UK supermarket pricing when you do not want to pick one shop.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do these 1500 calorie meal plans include shopping lists?',
        a: 'Yes. Every plan includes a weekly shopping list, estimated macros and an export/print PDF option.',
      },
      {
        q: 'Are 1500 calorie meal plans suitable for everyone?',
        a: 'No. Calorie needs vary by body size, activity, health status and goals. These plans are general information only and are not medical advice.',
      },
      {
        q: 'Can I print a 1500 calorie meal plan as a PDF?',
        a: 'Yes. Open any matching plan and use the export or print PDF section to save the full week, recipes, calories, macros and shopping list.',
      },
    ],
    relatedSlugs: ['free-online-diet-plans-uk', 'low-calorie', 'weight-loss', 'high-protein', 'meal-plans-with-shopping-list', 'printable-meal-plans'],
  },
  'low-calorie': {
    slug: 'low-calorie',
    path: '/meal-plans/low-calorie',
    title: 'Low Calorie Meal Plans UK - Free Weekly Plans + Shopping Lists',
    description:
      'Browse free low calorie weekly meal plans for UK supermarkets, with 7-day menus, 1400-1800 calorie options, macros, PDFs and shopping lists.',
    h1: 'Low Calorie Meal Plans UK',
    kicker: 'Low calorie weekly plan hub',
    intro:
      'Low calorie meal plans work best when they still feel like proper meals. Use this hub to compare free UK weekly plans with 1400, 1500, 1600 and 1800 calorie options, supermarket filters, printable PDFs and shopping lists.',
    match: {
      calories: [1400, 1500, 1600, 1800],
      goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'vegetarian-low-cal', 'vegan-low-cal', 'cutting'],
    },
    stats: ['Low calorie weekly plans', '1400-1800 kcal options', 'Shopping lists and PDFs'],
    modified: '2026-07-13',
    reviewed: '13 July 2026',
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Quick answer: what is a good low calorie weekly meal plan?',
        paragraphs: [
          'A good low calorie weekly meal plan usually gives you breakfast, lunch, dinner and a planned snack rather than tiny meals. It should include protein at each meal, vegetables or fruit for volume, filling carbohydrates and a shopping list you can actually use.',
          'For many UK shoppers, the strongest starting point is a 1500 or 1600 calorie plan. More active users may prefer 1800 calories, while 1400 calorie plans need extra care around hunger, protein and energy.',
        ],
        table: {
          headers: ['What you need', 'Best starting page', 'Why'],
          rows: [
            ['Low calorie weekly meal plan', 'This low calorie hub', 'Compares weekly plans across calories and supermarkets'],
            ['1500 calorie meal plan', '1500 calorie hub', 'Most direct lower-calorie printable target'],
            ['Weight loss meal plan', 'Weight loss hub', 'Adds goal-specific fat-loss structure'],
            ['Low calorie shopping list', 'Low calorie shopping-list hub', 'Starts from the basket rather than the plan'],
          ],
        },
      },
      {
        h2: 'How to choose the right low calorie plan',
        paragraphs: [
          'Choose the calorie target first, then supermarket, diet type and effort level. Standard plans give more variety, batch-cook plans reduce weekday decisions, and high-protein low-calorie plans are useful when hunger is the main barrier.',
          'If a plan looks close but not perfect, open the full plan page and adjust meals rather than restarting. Swapping one protein, carb or vegetable is usually easier than rebuilding the whole week.',
        ],
      },
      {
        h2: 'What to look for in a low calorie shopping list',
        paragraphs: [
          'The best low calorie shopping lists repeat useful staples: eggs, chicken, tuna, tofu, beans, lentils, skyr or Greek yogurt, oats, potatoes, rice, wraps, frozen vegetables, salad, fruit and a few low-calorie sauces.',
          'Avoid plans that are low calorie only because the portions are tiny. A practical week needs enough protein, fibre and volume to make the target repeatable.',
        ],
      },
    ],
    supportingGuides: [
      GUIDE_LINKS.lowCalorieFoods,
      GUIDE_LINKS.lowCalorieReadyMeals,
      GUIDE_LINKS.cheapProtein,
      GUIDE_LINKS.printable,
      GUIDE_LINKS.shoppingList,
    ],
    faq: [
      {
        q: 'Are these low calorie meal plans free?',
        a: 'Yes. The matching plans are free to browse and include recipes, macros, grouped shopping lists and printable PDF export.',
      },
      {
        q: 'Which low calorie meal plan should I start with?',
        a: 'Start with 1500 or 1600 calories if you want a lower-calorie week, or 1800 calories if you are more active or need a steadier deficit. Choose a supermarket you already use.',
      },
      {
        q: 'Do low calorie plans include enough protein?',
        a: 'The best options prioritise protein at each meal. Use high-protein low-calorie plans if hunger, gym training or muscle retention is a priority.',
      },
    ],
    relatedSlugs: ['1500-calorie', 'weight-loss', 'low-calorie-shopping-list', 'high-protein', 'printable-meal-plans'],
  },
  'free-online-diet-plans-uk': {
    slug: 'free-online-diet-plans-uk',
    path: '/meal-plans/free-online-diet-plans-uk',
    title: 'Free Online Diet Plans UK - 1000 Printable Meal Plans',
    description:
      'Browse free online diet plans for UK weight loss, high protein, vegetarian, muscle gain and budget goals, with PDFs, shopping lists and supermarket filters.',
    h1: 'Free Online Diet Plans UK',
    kicker: 'Free plan hub',
    intro:
      'Use this page when you want a free UK diet plan without signing up, paying for an app or starting from a blank spreadsheet. The plan library covers calorie targets, supermarkets, diet types, macros, PDFs and shopping lists so you can move from search to a usable week of food quickly.',
    match: {
      goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'muscle-gain', 'cheap-high-protein', 'vegetarian-low-cal', 'vegan-low-cal', 'maintenance'],
    },
    stats: ['Free online plans', 'PDF and shopping list', 'UK supermarket filters'],
    reviewed: '17 June 2026',
    sections: [
      {
        h2: 'Quick answer: what is included?',
        paragraphs: [
          'Each plan page includes a 7-day menu, calorie and macro estimates, simple recipes, a grouped shopping list and an export section for printing or saving as a PDF. You can browse by goal, supermarket, diet type, calorie target and budget.',
          'The best starting point is the quiz if you want a match, or the browse page if you already know your calories, supermarket or diet type.',
        ],
        table: {
          headers: ['What you need', 'Best page to use', 'What you get'],
          rows: [
            ['Diet plan UK free', 'This hub or the quiz', 'A no-sign-up route into matched 7-day plans'],
            ['Free nutrition plan', 'Browse filters', 'Calories, macros, recipes and shopping list'],
            ['Free online meal plan', 'Quiz results', 'Top matched plans for goal, diet and supermarket'],
            ['Printable diet plan', 'Any plan page', 'PDF summary with full weekly shopping list'],
          ],
        },
      },
      {
        h2: 'Choose by goal first',
        paragraphs: [
          'Weight loss plans focus on calorie control, protein, fibre and realistic portions. High-protein plans suit gym users, body recomposition and people who struggle with hunger. Muscle gain plans use higher calorie targets such as 2500, 3000 and 3500 calories with bigger snacks and more training-friendly carbohydrate.',
          'Vegetarian, vegan and pescatarian options keep the same structure but change the protein sources, using UK supermarket staples such as eggs, yogurt, tofu, beans, lentils, fish and meat-free alternatives.',
        ],
      },
      {
        h2: 'Choose by supermarket or use generic pricing',
        paragraphs: [
          'Named supermarket plans are useful if you shop mostly at Aldi, Lidl, Tesco, Asda, Sainsbury\'s, Morrisons, Iceland, Waitrose, Ocado, M&S or Co-op. Generic UK supermarket plans are better if you switch between shops or want average-price assumptions rather than one retailer.',
          'The shopping lists use common ingredients rather than niche diet products. That makes the plans easier to buy, cook and repeat in normal UK kitchens.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are the diet plans really free?',
        a: 'Yes. The plan pages, PDFs, shopping lists and browse filters are free to use without an account.',
      },
      {
        q: 'Can I get a free diet plan with a shopping list?',
        a: 'Yes. Every plan includes a grouped weekly shopping list and the PDF export summarises the meals, recipes, calories, macros and shopping list.',
      },
      {
        q: 'Do free online diet plans replace medical advice?',
        a: 'No. They are general meal-planning information only. Speak to a qualified professional if you have medical needs, a history of disordered eating or a specialist nutrition requirement.',
      },
    ],
    relatedSlugs: ['1500-calorie', 'low-calorie', 'weight-loss', 'high-protein', 'generic-uk-supermarket', 'meal-plans-with-shopping-list'],
  },
  'high-protein': {
    slug: 'high-protein',
    path: '/meal-plans/high-protein',
    title: 'High Protein Meal Plans UK - Free 7-Day Plans + Shopping Lists',
    description:
      'Find free high protein meal plans for UK supermarkets, including fat loss, muscle gain, vegetarian, gym beginner and body recomposition plans.',
    h1: 'High Protein Meal Plans UK',
    kicker: 'Protein-focused plan hub',
    intro:
      'High protein meal plans are useful for fat loss, muscle gain, body recomposition and more filling weekday lunches. These plans use familiar UK ingredients such as chicken, tuna, eggs, skyr, tofu, lentils, beans and lean mince.',
    match: {
      goals: ['high-protein-low-cal', 'cheap-high-protein', 'high-protein-vegetarian', 'budget-bodybuilding', 'gym-beginner', 'body-recomp', 'muscle-gain'],
      emphasis: ['lean-protein', 'recomp-protein'],
    },
    stats: ['Higher protein options', 'Gym-friendly meals', 'Meat and vegetarian plans'],
    sections: [
      {
        h2: 'What makes a good high protein meal plan?',
        paragraphs: [
          'The best high protein plans spread protein across breakfast, lunch, dinner and snacks instead of relying on one huge dinner. This makes the day easier to follow and gives each meal a clear protein anchor.',
          'For fat loss, choose high-protein low-calorie or body recomposition plans. For gaining size, choose muscle gain or budget bodybuilding plans with higher calorie targets.',
        ],
      },
      {
        h2: 'How much, and where the money goes',
        paragraphs: [
          'For most people training regularly, common guidance lands somewhere around 1.6 to 2.2g per kilogram of bodyweight a day, and there is little evidence of further benefit above that. If you are not training, less is fine - the reason to raise protein is usually fullness on a deficit rather than a performance target.',
          'The trap is the word itself. A product marketed as high-protein typically costs several times what the same protein costs as eggs, milk, yogurt or a tin of fish, and often delivers less per serving than the label implies. These plans are built from the ordinary version of each food.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do the high protein plans include vegetarian options?',
        a: 'Yes. The library includes high-protein vegetarian plans built around eggs, dairy, tofu, beans, lentils and meat-free proteins.',
      },
      {
        q: 'Can I print a high protein meal plan?',
        a: 'Yes. Open any plan and use the export/print PDF section to save a full weekly summary and shopping list.',
      },
      {
        q: 'Is there any harm in eating more protein than that?',
        a: 'For healthy adults, moderately higher intakes are not a concern in the evidence we have, but there is no benefit either, and the calories have to come from somewhere. Anyone with kidney disease or another medical reason to watch protein should follow their clinician rather than a general plan.',
      },
    ],
    relatedSlugs: ['free-online-diet-plans-uk', '1500-calorie', 'weight-loss', 'vegetarian', 'meal-plans-with-shopping-list'],
  },
  'muscle-gain': {
    slug: 'muscle-gain',
    path: '/meal-plans/muscle-gain',
    title: 'Muscle Gain Meal Plans UK - 2500, 3000 and 3500 Calorie Plans',
    description:
      'Browse free UK muscle gain meal plans with 2500, 3000 and 3500 calorie options, supermarket filters, macros, PDF export and shopping lists.',
    h1: 'Muscle Gain Meal Plans UK',
    kicker: 'Higher calorie plan hub',
    intro:
      'Muscle gain meal prep works best when calories are high enough, protein is spread through the day, and meals are still realistic to cook. These plans include bigger training-day options without asking you to build the week from scratch.',
    match: { goals: ['muscle-gain', 'budget-bodybuilding', 'gym-beginner', 'body-recomp'], calories: [2500, 3000, 3500, 2200, 2000] },
    stats: ['2500-3500 kcal options', 'High-protein meals', 'Supermarket shopping lists'],
    sections: [
      {
        h2: 'How to choose a muscle gain plan',
        paragraphs: [
          'Start with your calorie target. A 2500 calorie plan suits many lighter or less active users, while 3000 and 3500 calorie plans are better for larger users, hard gainers, active jobs or heavy training blocks.',
          'Choose budget bodybuilding when cost matters most, muscle gain when you want a balanced surplus, or endurance plans when your training needs more carbohydrate.',
        ],
      },
      {
        h2: 'What makes these plans realistic',
        paragraphs: [
          'Higher-calorie plans use extra snacks and larger but still readable ingredient amounts. That is easier to follow than one enormous dinner or vague instructions to multiply every ingredient.',
        ],
      },
      {
        h2: 'Protein and patience do most of the work',
        paragraphs: [
          'The surplus gets the attention and matters least. Beyond a modest amount above maintenance, extra calories mostly add fat rather than muscle, and the pace at which anyone can actually build tissue is slow enough that a large surplus cannot speed it up. Somewhere around a few hundred calories over maintenance is enough for most people.',
          'Protein is the number to hold steady, spread across the day rather than concentrated in one meal. Every plan here states its own figure, and that is the one worth checking when a plan is not working - far more often than the calorie total.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do the muscle gain plans include 3000 and 3500 calorie options?',
        a: 'Yes. The plan library includes 3000 and 3500 calorie muscle gain, budget bodybuilding and endurance-style options.',
      },
      {
        q: 'Can I print a muscle gain meal plan?',
        a: 'Yes. Open any plan and use the export or print PDF section to save the full week and shopping list.',
      },
      {
        q: 'How fast should I expect to gain?',
        a: 'Slowly, and more slowly the longer you have trained. Roughly a quarter to half a kilo a month is a reasonable rate for most people past the first year; faster than that is usually mostly fat, which then has to come back off.',
      },
    ],
    relatedSlugs: ['3000-calorie', '3500-calorie', 'high-protein', 'meal-plans-with-shopping-list'],
  },
  '3000-calorie': {
    slug: '3000-calorie',
    path: '/meal-plans/3000-calorie',
    title: '3000 Calorie Meal Plans UK - Muscle Gain + Shopping Lists',
    description:
      'Browse free 3000 calorie meal plans for UK muscle gain, endurance training and budget bodybuilding, with printable PDFs and shopping lists.',
    h1: '3000 Calorie Meal Plans UK',
    kicker: 'High calorie plan hub',
    intro:
      'A 3000 calorie meal plan needs enough food to support training without turning the day into constant cooking. These plans use familiar UK meals, extra snacks and supermarket-friendly ingredients.',
    match: { calories: [3000], goals: ['muscle-gain', 'budget-bodybuilding', 'endurance-athlete'] },
    stats: ['3000 kcal/day', 'Muscle gain options', 'PDF and shopping list'],
    sections: [
      {
        h2: 'Who a 3000 calorie plan suits',
        paragraphs: [
          'A 3000 calorie plan can suit active people, larger users, gym users trying to gain weight, and endurance athletes with higher weekly training demands.',
          'If this target feels too much, compare 2500 calorie plans first. If you still struggle to gain weight, look at the 3500 calorie options.',
        ],
      },
      {
        h2: 'Check that 3,000 is actually your number',
        paragraphs: [
          'More people arrive at this target than need it. A day of heavy training genuinely burns a lot, but a rest day after it does not, and weekly average is what determines whether you gain. The reliable test is boring: hold the target for two or three weeks and watch the weight trend rather than trusting a calculator.',
          'If the trend is climbing faster than roughly half a kilo a week, the surplus is bigger than useful and most of the extra is not going where you want it. If nothing is moving at all, you are probably not eating what you think you are - which is the more common finding.',
        ],
      },
    ],
    faq: [
      { q: 'Are these 3000 calorie plans only for bodybuilding?', a: 'No. Some are muscle gain or budget bodybuilding plans, while others are endurance-focused for higher training volume.' },
      { q: 'Do the 3000 calorie plans include shopping lists?', a: 'Yes. Each plan includes a full grouped shopping list and printable PDF export.' },
      {
        q: 'What if I cannot eat 3,000 calories a day?',
        a: 'That is usually an appetite and timing problem rather than a willpower one. More eating occasions, denser foods and drinkable calories like milk or yogurt all help. If it stays a struggle, a sustained 2,500 beats an inconsistent 3,000.',
      },
    ],
    relatedSlugs: ['muscle-gain', '3500-calorie', 'high-protein', 'printable-meal-plans'],
  },
  '3500-calorie': {
    slug: '3500-calorie',
    path: '/meal-plans/3500-calorie',
    title: '3500 Calorie Meal Plans UK - Bulking + Heavy Training Plans',
    description:
      'Browse free 3500 calorie meal plans for UK bulking, heavy training and hard gainers, including supermarket shopping lists and PDFs.',
    h1: '3500 Calorie Meal Plans UK',
    kicker: 'Very high calorie plan hub',
    intro:
      'A 3500 calorie meal plan is a specialist target for people with high energy needs. These plans are built for bulking, heavy training weeks and users who already know a lower target is not enough.',
    match: { calories: [3500], goals: ['muscle-gain', 'budget-bodybuilding', 'endurance-athlete'] },
    stats: ['3500 kcal/day', 'Bulking-friendly', 'Printable shopping list'],
    sections: [
      {
        h2: 'How to make 3500 calories easier to follow',
        paragraphs: [
          'Use breakfast, lunch, dinner and several snacks rather than forcing huge single meals. Higher-calorie plans should still use foods you can buy repeatedly: oats, rice, pasta, potatoes, yogurt, milk, eggs, chicken, tofu, fish, beans and olive oil.',
          'Because 3500 calories is high for many adults, use it when your weight trend, training demands or professional advice justify that target.',
        ],
      },
      {
        h2: 'At this level, eating becomes a schedule',
        paragraphs: [
          '3,500 kcal is not simply a bigger version of a normal day. It needs five or six eating occasions rather than three, which means it has to be planned around your actual hours - work, training, travel - or it does not happen. The plans mark the occasions for that reason.',
          'The prep load rises with it. A week at this intake is roughly twice the cooking of a weight-loss week, so batch cooking stops being optional. If you are hitting the target on paper and not in practice, the fix is almost always more preparation on one day rather than more discipline on all seven.',
        ],
      },
    ],
    faq: [
      { q: 'Is a 3500 calorie meal plan suitable for everyone?', a: 'No. It is a high intake target and is mainly for people with high energy needs, heavy training or deliberate weight gain goals.' },
      { q: 'Can I choose a supermarket for 3500 calorie plans?', a: 'Yes. Use the 3500 calorie chooser or browse filters to combine calorie target with supermarket.' },
      {
        q: 'I am not gaining weight on 3,000 - should I move to 3,500?',
        a: 'Only after checking that you actually hit 3,000 consistently for a few weeks. Under-eating against a target is far more common than needing a higher one, and moving up without fixing that just makes the gap larger.',
      },
    ],
    relatedSlugs: ['3000-calorie', 'muscle-gain', 'high-protein', 'meal-plans-with-shopping-list'],
  },
  'generic-uk-supermarket': {
    slug: 'generic-uk-supermarket',
    path: '/meal-plans/generic-uk-supermarket',
    title: 'Generic UK Supermarket Meal Plans - Average Price Shopping Lists',
    description:
      'Browse generic UK supermarket meal plans using average supermarket pricing, with calorie targets, goals, printable PDFs and shopping lists.',
    h1: 'Generic UK Supermarket Meal Plans',
    kicker: 'Average-price plan hub',
    intro:
          'Generic UK supermarket plans are useful when you do not want the plan tied to Aldi, Tesco, Asda, Waitrose, Ocado, M&S or another named store. They use common ingredients and average-price assumptions so you can shop where convenient.',
    match: { supermarkets: ['any'] },
    stats: ['Average UK pricing', 'No named-store default', 'Printable PDFs'],
    sections: [
      {
        h2: 'When to use the generic supermarket option',
        paragraphs: [
          'Choose the generic option if you switch supermarkets, use a mix of online shops and local stores, or want a plan that is not built around one retailer.',
          'The recipes use standard UK supermarket ingredients, so you can still shop at Aldi, Lidl, Tesco, Asda, Sainsbury\'s, Morrisons, Iceland, Waitrose, Ocado, M&S or Co-op.',
        ],
      },
      {
        h2: 'What you trade away, and what you get back',
        paragraphs: [
          'The one real cost is the price estimate. A named-store plan can be costed against that chain\'s own-brand lines; a generic plan has to use average UK supermarket assumptions, so treat its figure as a guide rather than a quote. Everything else about the plan - the meals, the macros, the shopping list - is unaffected.',
          'What you get back is a plan that survives a change of mind. Most people do not shop at one supermarket: there is a big shop somewhere cheap and a top-up somewhere close, and a plan tied to a single chain quietly stops matching reality by Wednesday. These plans are written so no meal depends on a product only one retailer sells.',
        ],
      },
    ],
    faq: [
      { q: 'Does generic mean no shopping list?', a: 'No. Generic plans still include a full shopping list, but the price estimate uses average UK supermarket assumptions.' },
      { q: 'Can I switch from generic to a named supermarket?', a: 'Yes. Use the supermarket chooser or browse filters to pick a named store.' },
      {
        q: 'How accurate is the price estimate on a generic plan?',
        a: 'It is an average across the main UK chains, so expect a discounter to come in under it and Waitrose, Ocado or M&S to come in over. If cost is the deciding factor, a named-store plan for the shop you actually use will give you a closer figure.',
      },
    ],
    relatedSlugs: ['weight-loss', '1500-calorie', 'muscle-gain', 'meal-plans-with-shopping-list'],
  },
  aldi: {
    slug: 'aldi',
    path: '/meal-plans/aldi',
    title: 'Aldi Meal Plans UK - Free Weekly Plans + Shopping Lists',
    description:
      'Browse free Aldi meal plans for weight loss, muscle gain, high protein, vegetarian, vegan and budget meal prep, with shopping lists and PDFs.',
    h1: 'Aldi Meal Plans UK',
    kicker: 'Supermarket plan hub',
    intro:
      'Aldi meal plans are ideal when you want simple UK supermarket ingredients and a tighter weekly budget. These plans are built around repeatable breakfasts, batch-friendly lunches and realistic dinners.',
    match: { supermarkets: ['aldi'] },
    stats: ['Aldi-focused plans', 'Budget-friendly meals', 'Printable shopping lists'],
    sections: [
      {
        h2: 'Why choose Aldi meal plans?',
        paragraphs: [
          'Aldi is a strong fit for structured meal prep because own-brand staples, frozen vegetables, oats, rice, pasta, tins, yogurts and lean proteins can keep the weekly shop predictable.',
          'Use Aldi plans when budget control matters. If you want the same structure without choosing one store, compare Tesco or Generic UK supermarket plans.',
        ],
      },
      {
        h2: 'A small range is the feature, not the limitation',
        paragraphs: [
          'Aldi carries a fraction of the lines a full-size supermarket does, and that is precisely why meal prep works here. Fewer options means fewer decisions, and a plan built on the core range is one you can repeat next week and the week after without the products moving or the price shifting.',
          'There is no loyalty scheme to work around either. What is on the shelf is what you pay, which makes weekly budgeting far more predictable than at a chain where the useful price depends on scanning an app.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do Aldi meal plans include budget options?',
        a: 'Yes. Aldi has budget fat loss, cheap student, cheap high protein and budget bodybuilding plans alongside standard weight loss and maintenance options.',
      },
      {
        q: 'Can I use an Aldi plan at another supermarket?',
        a: 'Yes. The ingredients are common UK supermarket foods, but prices and exact product names may differ.',
      },
      {
        q: 'Do Specialbuys and Super 6 affect these plans?',
        a: 'Deliberately not. Both rotate and sell through, so no plan here depends on them. Treat them as a bonus if something useful appears rather than as part of the week you are counting on.',
      },
    ],
    relatedSlugs: ['weight-loss', '1500-calorie', 'high-protein', 'tesco-weight-loss'],
  },
  vegetarian: {
    slug: 'vegetarian',
    path: '/meal-plans/vegetarian',
    title: 'Vegetarian Meal Plans UK - High Protein, Low Calorie + PDF',
    description:
      'Browse free vegetarian meal plans for UK meal prep, including high protein, low calorie, Aldi, Tesco and printable shopping-list plans.',
    h1: 'Vegetarian Meal Plans UK',
    kicker: 'Meat-free plan hub',
    intro:
      'Vegetarian meal prep is easiest when each meal has a clear protein source. These plans use eggs, Greek yogurt, cottage cheese, tofu, beans, lentils, halloumi, feta and meat-free proteins to keep the week practical.',
    match: { diets: ['vegetarian'], goals: ['vegetarian-low-cal', 'high-protein-vegetarian', 'maintenance', 'budget-fat-loss', 'weight-loss'] },
    stats: ['Meat-free plans', 'High-protein options', 'UK supermarket ingredients'],
    sections: [
      {
        h2: 'How to make vegetarian meal prep more filling',
        paragraphs: [
          'Choose plans that include protein at breakfast as well as lunch and dinner. Yogurt bowls, eggs on toast, tofu bowls and lentil meals usually work better than vegetable-only lunches.',
          'If you are cutting calories, pick vegetarian low-calorie plans. If you train regularly, start with high-protein vegetarian plans.',
        ],
      },
      {
        h2: 'Where vegetarian weeks usually go wrong',
        paragraphs: [
          'Not in the cooking - in the shopping. A vegetarian plan built from cheese and eggs alone gets repetitive by Wednesday and is higher in saturated fat than most people intend, while one built only from vegetables leaves you hungry. The fix is variety across the protein sources rather than variety across the vegetables.',
          'Pulses do the most work for the least money. Tinned chickpeas, lentils and beans need no soaking, keep indefinitely and cost a fraction of what meat-free mince does, which is why these plans use branded substitutes sparingly rather than as the backbone.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are the vegetarian meal plans high protein?',
        a: 'Some are designed specifically for higher protein. Use the high-protein vegetarian goal or the high-protein hub if protein is the priority.',
      },
      {
        q: 'Do vegetarian plans include shopping lists?',
        a: 'Yes. Each vegetarian plan includes a weekly shopping list and a printable PDF summary.',
      },
      {
        q: 'Do I need to worry about iron or B12 as a vegetarian?',
        a: 'Less than someone eating no animal products at all, since dairy and eggs supply B12. Iron from plant sources is absorbed less readily than from meat, so pairing pulses and leafy greens with a source of vitamin C at the same meal is a sensible habit. Speak to a GP if you have a specific concern.',
      },
    ],
    relatedSlugs: ['high-protein', '1500-calorie', 'weight-loss', 'printable-meal-plans'],
  },
  'weight-loss': {
    slug: 'weight-loss',
    path: '/meal-plans/weight-loss',
    title: 'Weight Loss Meal Plan UK - Free 7-Day Plans + Shopping Lists',
    description:
      'Browse free UK weight loss meal plans by supermarket, calories and diet, with printable PDFs, macros, recipes and weekly shopping lists.',
    h1: 'Weight Loss Meal Plan UK',
    kicker: 'Fat loss plan hub',
    intro:
      'A good weight loss meal plan is not the most extreme one. It is the one you can shop for, cook and repeat. These UK plans focus on calorie control, protein, fibre and realistic supermarket meals.',
    match: { goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'vegetarian-low-cal', 'vegan-low-cal', 'cutting'] },
    stats: ['Calorie-controlled plans', 'Supermarket filters', 'Free PDF export'],
    reviewed: '23 June 2026',
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Quick answer: which UK meal plan helps you lose weight?',
        paragraphs: [
          'The best weight loss meal plan UK shoppers can start with is usually a 1500, 1600 or 1800 calorie plan that includes protein at every meal, filling carbs, fruit, vegetables and a shopping list for the supermarket you actually use.',
          'Pick the lowest calorie target you can repeat without constant hunger. High-protein and high-fibre versions are useful when appetite is the main barrier, while budget versions help when the weekly shop needs to stay predictable.',
        ],
        table: {
          headers: ['Need', 'Best starting point', 'Why it works'],
          rows: [
            ['Simple fat loss', '1500 or 1800 calorie plans', 'Clear portions and familiar UK meals'],
            ['Hunger control', 'High-protein low-calorie plans', 'More protein, fibre and volume'],
            ['Lower weekly shop', 'Budget fat loss plans', 'Repeats cheap staples and avoids niche products'],
            ['Named supermarket', 'Aldi, Tesco, Lidl or Asda plans', 'Uses the store you already shop in'],
          ],
        },
      },
      {
        h2: 'How to choose a weight loss meal plan',
        paragraphs: [
          'Start with your calorie target, then choose a supermarket and diet type. If you are unsure, compare a 1500 calorie plan with an 1800 calorie plan before choosing a more specialised option.',
          'Use the shopping list before you start the week. A plan is much easier to follow when the protein, breakfast staples, lunch ingredients and snacks are already in the kitchen.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.cheapProtein, GUIDE_LINKS.proteinPorridge, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'What is the best weight loss meal plan UK?',
        a: 'For many people, the best weight loss meal plan UK starting point is a 1500, 1600 or 1800 calorie plan with protein at every meal, high-fibre foods, realistic portions and a supermarket shopping list.',
      },
      {
        q: 'Which weight loss meal plan should I start with?',
        a: 'Start with a supermarket you already use and a calorie target you can follow consistently. Then adjust with the AI meal edit tool if a meal does not suit you.',
      },
      {
        q: 'Are these weight loss meal plans free?',
        a: 'Yes. The plans are free to browse, print and save as PDF, with no account required.',
      },
    ],
    relatedSlugs: ['free-online-diet-plans-uk', 'low-calorie', '1500-calorie', 'high-protein', 'tesco-weight-loss', 'aldi'],
  },
  'tesco-weight-loss': {
    slug: 'tesco-weight-loss',
    path: '/meal-plans/tesco-weight-loss',
    title: 'Tesco Weight Loss Meal Plans UK - Free PDF Plans',
    description:
      'Browse Tesco weight loss meal plans with UK shopping lists, calories, macros, printable PDFs and low-calorie meal prep ideas.',
    h1: 'Tesco Weight Loss Meal Plans UK',
    kicker: 'Tesco fat loss hub',
    intro:
      'Tesco weight loss meal plans are useful when you want a broad UK supermarket range, easy swaps and familiar ingredients. These plans focus on calorie control without making the weekly shop complicated.',
    match: { supermarkets: ['tesco'], goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'cutting'] },
    stats: ['Tesco-focused plans', 'Weight loss goals', 'Printable shopping lists'],
    sections: [
      {
        h2: 'Why choose Tesco for weight loss meal prep?',
        paragraphs: [
          'Tesco is useful for weight loss meal prep because it has broad ranges of lean protein, ready vegetables, frozen fruit, tinned pulses, yogurts, wraps, rice and pasta. That makes swaps easier than relying on niche ingredients.',
          'Use Tesco plans when you want more choice than a discount supermarket while still keeping meals simple and repeatable.',
        ],
      },
      {
        h2: 'The breadth cuts both ways when you are cutting',
        paragraphs: [
          'The same range that makes swaps easy also puts far more in front of you than a discounter does, and a bigger shop means more decisions made while hungry. The plans deal with that by naming the products rather than leaving categories open, so the list is a set of specific items rather than an invitation to browse.',
          'Clubcard pricing needs the same care. The promoted price is genuine but it is not distributed evenly across the store, and following it too closely is how a weight-loss basket fills with things that were cheap rather than things that were planned. Use it on what is already on your list.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do Tesco weight loss plans include high protein options?',
        a: 'Yes. Tesco high-protein low-calorie and cutting plans are included where they match the weight loss goal.',
      },
      {
        q: 'Can I print the Tesco shopping list?',
        a: 'Yes. Open a plan and use the export/print PDF button to print the full plan and shopping list together.',
      },
      {
        q: 'Should I buy the reduced-calorie versions of products?',
        a: 'Sometimes, but check per 100g rather than per pack, because pack sizes differ and front-of-pack figures are often quoted per portion. On several categories the ordinary version in a smaller quantity works out better than the reduced-calorie one.',
      },
    ],
    relatedSlugs: ['weight-loss', '1500-calorie', 'high-protein', 'aldi'],
  },
  'printable-meal-plans': {
    slug: 'printable-meal-plans',
    path: '/meal-plans/printable-meal-plans',
    title: 'Printable Meal Plans UK: Free 7-Day PDF Plans with Shopping Lists',
    description:
      'Free printable UK meal plans: 7-day PDF summaries, weekly shopping lists, macros and recipes for weight loss, high protein and budget goals. Print or save as PDF.',
    h1: 'Printable Meal Plans UK',
    kicker: 'PDF meal plan hub',
    intro:
      'Printable meal plans are useful when you want the week on the fridge, in a kitchen folder or saved as a PDF before shopping. Every plan includes a print-friendly weekly summary and shopping list.',
    match: {},
    stats: ['PDF export', '7-day summaries', 'Shopping lists included'],
    sections: [
      {
        h2: 'What the printable PDF includes',
        paragraphs: [
          'The printable version summarises all seven days, daily calories, protein totals, meal names and the full grouped shopping list. It is designed for planning the weekly shop rather than reading one tab at a time.',
          'Use printable plans when you batch cook on Sunday, shop from a paper list, or want to keep the week visible in the kitchen.',
        ],
      },
      {
        h2: 'Paper still wins in a kitchen and an aisle',
        paragraphs: [
          'A phone screen locks, needs clean hands and puts you one notification away from something else. A sheet on the fridge does none of that, and it is visible to everyone in the house - which matters more than it sounds if you are not the only person who cooks or shops.',
          'There is a second, smaller effect worth having: a plan you can see is harder to quietly abandon. Crossing off days is a weak commitment device, but it is a free one, and it is the reason a printed week tends to survive longer than the same plan left in a browser tab.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can I save the meal plans as PDF?',
        a: 'Yes. Use the export/print PDF button on any plan page, then choose Save as PDF in your browser print dialog.',
      },
      {
        q: 'Does the PDF include the shopping list?',
        a: 'Yes. The print summary includes the full weekly shopping list grouped by category.',
      },
      {
        q: 'Should I print the whole plan or just the list?',
        a: 'Both, separately. The shopping list goes to the shop and the weekly summary goes on the fridge, and splitting them means you are not carrying seven days of recipes around a supermarket to read one column.',
      },
    ],
    relatedSlugs: ['meal-plans-with-shopping-list', 'weight-loss', '1500-calorie', 'high-protein'],
  },
  'meal-plans-with-shopping-list': {
    slug: 'meal-plans-with-shopping-list',
    path: '/meal-plans/meal-plans-with-shopping-list',
    title: 'Meal Plans With Shopping Lists UK - Free 7-Day Plans',
    description:
      'Browse free UK meal plans with weekly shopping lists, recipes, macros and PDF export for weight loss, high protein, vegetarian and budget goals.',
    h1: 'Meal Plans With Shopping Lists UK',
    kicker: 'Shopping-list plan hub',
    intro:
      'A meal plan is much easier to follow when the shopping list is already built. These plans include grouped weekly shopping lists so you can move from choosing a plan to doing the shop quickly.',
    match: {},
    stats: ['Grouped shopping lists', 'Recipes and macros', 'Free weekly plans'],
    sections: [
      {
        h2: 'Why shopping-list meal plans convert better into action',
        paragraphs: [
          'Without a shopping list, a meal plan is just an idea. The grouped lists on these pages make it clearer what to buy for protein, carbs, vegetables, dairy and extras.',
          'For the smoothest week, choose the plan first, export the PDF, then compare your cupboard staples before buying everything on the list.',
        ],
      },
      {
        h2: 'Why a grouped list beats a pile of recipes',
        paragraphs: [
          'Twenty-one meals written out as recipes gives you the same ingredient a dozen times over. A grouped list merges them, so rice appears once with the total you need rather than seven times in fragments - which is what stops you buying three bags and then finding two in the cupboard.',
          'It is also ordered the way a supermarket is, so protein, produce, chilled, frozen and cupboard come in the order you walk them. That sounds cosmetic and is not: the back-and-forth is where things get forgotten, and a forgotten ingredient is how a week turns into a takeaway.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are shopping lists included on every plan?',
        a: 'Yes. Every generated plan page includes a grouped weekly shopping list and a copy button.',
      },
      {
        q: 'Can I edit a meal and update the shopping list?',
        a: 'Yes. On plan pages, meal edits recalculate the day totals and rebuild the shopping list.',
      },
      {
        q: 'Should I buy everything on the list?',
        a: 'No - check the cupboard first. Oil, spices, stock and staples are usually already in, and the list includes them because it has no way of knowing. Crossing those off is normally the difference between the estimate and what you actually spend.',
      },
    ],
    relatedSlugs: ['printable-meal-plans', 'weight-loss', 'aldi', 'vegetarian'],
  },
  'asda-weight-loss': {
    slug: 'asda-weight-loss',
    path: '/meal-plans/asda-weight-loss',
    title: 'Asda Weight Loss Meal Plans UK - Free Plans + Shopping Lists',
    description: 'Free Asda weight loss meal plans from 1,400 to 1,800 kcal, built around Just Essentials and larger pack sizes, with shopping lists and printable PDFs.',
    h1: 'Asda Weight Loss Meal Plans UK',
    kicker: 'Asda fat loss hub',
    intro: 'Asda sells in bigger units than most of its rivals, and on a deficit that is the thing to plan around. The price per kilo is excellent and the quantity in the house is high, which are the same fact pointing in two directions.',
    match: { supermarkets: ['asda'], goals: ['weight-loss'] },
    stats: ['17 Asda plans', '1,400-1,800 kcal', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Portion on the day you shop, not the day you eat',
        paragraphs: [
          'A three-kilo bag of chicken is cheap and it is also three kilos of chicken sitting in a fridge, and portions taken from a big pack drift upward almost invisibly. The habit that fixes it costs ten minutes: split the meat and the fish into meal-sized bags the moment you get home, before anything goes in the fridge or freezer.',
          'Do the same with the things people never portion - grated cheese, nuts, granola. Those are the items where a large pack quietly adds a few hundred calories a day, and they are the reason a plan followed honestly can still stall.',
        ],
      },
      {
        h2: 'Budget and protein stop competing here',
        paragraphs: [
          'The usual trade on a cheap deficit is that value ranges cover cupboard goods and stop before the protein, so you save on rice and pay full price on chicken. Asda is unusual in that its value tier reaches fresh meat and fish, so the basket that keeps you full is also the basket that keeps the cost down.',
          'That matters more on a deficit than at any other goal, because protein is what makes a smaller day tolerable. It is why these plans lean on the value tier for the protein first and treat the savings elsewhere as incidental.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'Are Asda plans good for weight loss on a budget?',
        a: 'They are among the strongest, because the value range covers fresh meat and fish rather than stopping at cupboard staples. That removes the usual choice between eating cheaply and eating enough protein.',
      },
      {
        q: 'Do the large pack sizes work for one person?',
        a: 'Only if you split them on the day you shop. Portion into bags before anything goes in the fridge - portions taken straight from a big pack tend to grow, and that is the most common reason an Asda deficit stalls.',
      },
    ],
    relatedSlugs: ['asda', 'weight-loss', '1500-calorie', 'meal-plans-with-shopping-list'],
  },
  'sainsburys-weight-loss': {
    slug: 'sainsburys-weight-loss',
    path: '/meal-plans/sainsburys-weight-loss',
    title: 'Sainsbury\'s Weight Loss Meal Plans UK - Free Plans + Lists',
    description: 'Free Sainsbury\'s weight loss meal plans from 1,400 to 1,800 kcal, with Nectar-aware shopping notes, grouped lists, macros and printable PDFs.',
    h1: 'Sainsbury\'s Weight Loss Meal Plans UK',
    kicker: 'Sainsbury\'s fat loss hub',
    intro: 'Sainsbury\'s is a good shop for a deficit and an awkward one for a fixed plan, and both come from the same source: the prices move. Nectar pricing rotates week to week, so what was cheapest on Monday may not be next Monday.',
    match: { supermarkets: ['sainsburys'], goals: ['weight-loss'] },
    stats: ['17 Sainsbury\'s plans', '1,400-1,800 kcal', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Rotating prices suit a flexible cook, not a fixed week',
        paragraphs: [
          'If you enjoy building meals around whatever is cheap, rotating offers are a gift. If you are following a plan, they are noise - and chasing them is how a weight-loss basket fills with things that were discounted rather than things that were planned.',
          'The way to use the scheme without letting it drive the shop is to apply it to the two or three proteins you buy every single week, and ignore it everywhere else. Those are the items where a repeated saving compounds over a twelve-week phase; the rest is a one-off that costs you the plan.',
        ],
      },
      {
        h2: 'Repeatability is the point on a deficit',
        paragraphs: [
          'A deficit works because it is boring in the right places. The meals you repeat without thinking - the same breakfast, the same two lunches - are the ones that survive a bad week, and they only stay effortless if the ingredients are reliably there at a price you expected.',
          'So build the fixed part of the week from Sainsbury\'s own-brand staples rather than from whatever is promoted, and let the evening meal be where variety and offers come in. That keeps the plan intact and still gets you the saving.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'Is Nectar pricing worth using for weight loss?',
        a: 'Yes, but narrowly. Apply it to the two or three proteins you buy every week, where a repeated saving adds up over a long phase, and ignore it elsewhere - following offers around the store is how a planned basket becomes an unplanned one.',
      },
      {
        q: 'Are Sainsbury\'s plans more expensive than a discounter?',
        a: 'Generally yes on a like-for-like basket, though the gap narrows on own-brand staples with Nectar applied. If cost is the deciding factor rather than convenience, an Aldi or Lidl plan will come in lower.',
      },
    ],
    relatedSlugs: ['sainsburys', 'weight-loss', '1500-calorie', 'low-calorie'],
  },
  'lidl-weight-loss': {
    slug: 'lidl-weight-loss',
    path: '/meal-plans/lidl-weight-loss',
    title: 'Lidl Weight Loss Meal Plans UK - Free Plans + Shopping Lists',
    description: 'Free Lidl weight loss meal plans from 1,400 to 1,800 kcal, built around own-brand high-protein dairy, with grouped shopping lists and printable PDFs.',
    h1: 'Lidl Weight Loss Meal Plans UK',
    kicker: 'Lidl fat loss hub',
    intro: 'Lidl is cheap, well stocked for a deficit, and laid out in a way that works against you. The food you need is around the edges; the route to the tills is not.',
    match: { supermarkets: ['lidl'], goals: ['weight-loss'] },
    stats: ['17 Lidl plans', '1,400-1,800 kcal', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'The middle aisle is the actual risk',
        paragraphs: [
          'Not the prices, and not the range. Lidl puts non-food and seasonal stock down the centre of the store and the bakery near the entrance, and both are on the path you walk anyway. Neither is a moral failing to walk past, but a deficit is decided by what ends up in the trolley, and impulse buying is what these layouts are designed to produce.',
          'Two habits deal with it: shop the perimeter first and only go down the middle if you actually need something, and do not shop hungry, which is advice everyone has heard and few follow on the way home from work.',
        ],
      },
      {
        h2: 'What makes the deficit work here',
        paragraphs: [
          'The own-brand high-protein dairy is the reason to choose Lidl for this goal. Skyr, quark, high-protein yogurts and cottage cheese are priced as ordinary own-brand lines rather than as fitness products, and those are exactly the foods that make a smaller day feel like enough.',
          'Frozen vegetables and fruit do the rest. Used as the default rather than the fallback, they hold the weekly cost flat and remove the pressure to use fresh produce before it turns, which is where a lot of good intentions end up in the bin.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'Why is Lidl good for weight loss?',
        a: 'Cheap own-brand high-protein dairy - skyr, quark, cottage cheese - priced as ordinary lines rather than fitness products. Those are the foods that make a calorie deficit feel like enough food rather than a negotiation.',
      },
      {
        q: 'How do I avoid overspending at Lidl?',
        a: 'Shop the perimeter and treat the middle aisle as somewhere you go only for something specific. The layout puts non-food and the bakery on your route deliberately, and a deficit is decided by what actually reaches the trolley.',
      },
    ],
    relatedSlugs: ['lidl', 'weight-loss', '1500-calorie', 'low-calorie'],
  },
  'morrisons-weight-loss': {
    slug: 'morrisons-weight-loss',
    path: '/meal-plans/morrisons-weight-loss',
    title: 'Morrisons Weight Loss Meal Plans UK - Free Plans + Lists',
    description: 'Free Morrisons weight loss meal plans from 1,400 to 1,800 kcal, using loose produce and counter portions, with shopping lists and printable PDFs.',
    h1: 'Morrisons Weight Loss Meal Plans UK',
    kicker: 'Morrisons fat loss hub',
    intro: 'Most supermarkets sell you a pack and leave the portioning to you. Morrisons is the one where you can still buy the amount you actually want, and on a deficit that is worth more than a few pence per kilo.',
    match: { supermarkets: ['morrisons'], goals: ['weight-loss'] },
    stats: ['16 Morrisons plans', '1,400-1,800 kcal', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Loose produce solves the variety problem',
        paragraphs: [
          'Variety is what stops a deficit becoming unbearable, and pre-packed produce makes variety expensive - four different vegetables in fixed packs means four part-used bags and a bin full of the remainder by Friday. Buying loose means three peppers, one head of broccoli and exactly the mushrooms you need.',
          'Morrisons keeps a wider loose range than most, and for a single person on a plan that is the difference between a colourful week and a wasteful one. Buy for the days ahead rather than for the pack size, and the fruit and vegetable line of the shop stops being the part you throw away.',
        ],
      },
      {
        h2: 'The parts of the store to plan for',
        paragraphs: [
          'The counters let you ask for the weight the plan states rather than the nearest pack, which removes a small daily decision about whether to cook the extra hundred grams. Over a week that decision is worth several hundred calories.',
          'The other side of the same store is worth naming honestly: the cafe, the pie counter and the food-to-go section are good at what they do and none of it is on your list. Decide before you go in whether you are eating there, because deciding at the counter rarely goes the way you planned.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'Why shop at Morrisons for weight loss?',
        a: 'Loose produce and service counters let you buy the amount the plan actually calls for. Fixed pack sizes are a quiet source of both waste and calorie drift, and Morrisons is the mainstream chain that still lets you avoid them.',
      },
      {
        q: 'Can I follow these plans without using the counters?',
        a: 'Yes - every plan works from the pre-packed ranges too. The counters just make exact portions easier, particularly for meat and fish where a pack is often more than one meal needs.',
      },
    ],
    relatedSlugs: ['morrisons', 'weight-loss', '1500-calorie', 'meal-plans-with-shopping-list'],
  },
  'tesco-muscle-gain': {
    slug: 'tesco-muscle-gain',
    path: '/meal-plans/tesco-muscle-gain',
    title: 'Tesco Muscle Gain Meal Plans UK - Free Plans + Shopping Lists',
    description: 'Free Tesco muscle gain meal plans from 2,500 to 3,500 kcal, built for variety across a long surplus, with grouped shopping lists and printable PDFs.',
    h1: 'Tesco Muscle Gain Meal Plans UK',
    kicker: 'Tesco muscle gain hub',
    intro: 'The thing that ends most bulks is not the cooking or the cost. It is eating the same six meals until the sight of them is unwelcome, and that is the specific problem a big Tesco solves better than a discounter can.',
    match: { supermarkets: ['tesco'], goals: ['muscle-gain'] },
    stats: ['18 Tesco plans', '2,500-3,500 kcal', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'A surplus needs range more than it needs anything else',
        paragraphs: [
          'At 3,000 kcal you are eating roughly twice the food of a weight-loss week, and appetite is the limiting factor long before money is. Boredom compounds that - once a meal becomes a chore you eat less of it, and a surplus quietly turns into maintenance without anything obvious going wrong.',
          'Tesco carries enough depth in each category that the same protein can appear four different ways in a week without anything unusual in the trolley. That is a duller advantage than a headline price, and it is the one that decides whether a bulk lasts twelve weeks.',
        ],
      },
      {
        h2: 'Where to spend and where not to',
        paragraphs: [
          'Buy the bulk carriers cheaply - rice, oats, pasta, potatoes, milk, eggs and frozen vegetables carry the calories and there is nothing to gain from paying more for them. Put the difference into the protein and into whatever makes the food enjoyable enough to keep eating.',
          'Clubcard is worth having for exactly this, because it tends to bite hardest on the meat and dairy that a surplus consumes in volume. What it will not do is make a plan cheaper if you follow the promotions rather than the list.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'Why choose Tesco for a muscle gain plan?',
        a: 'Range. A surplus fails on boredom more often than on cost, and Tesco carries enough depth in each category to keep a high-calorie week varied without anything unusual in the basket.',
      },
      {
        q: 'How do I eat 3,000 calories without feeling stuffed?',
        a: 'More eating occasions rather than bigger plates, and denser foods - oats, rice, olive oil, whole milk, nuts. Liquid calories help when appetite rather than time is the constraint.',
      },
    ],
    relatedSlugs: ['tesco', 'muscle-gain', '3000-calorie', 'high-protein'],
  },
  'aldi-budget-fat-loss': {
    slug: 'aldi-budget-fat-loss',
    path: '/meal-plans/aldi-budget-fat-loss',
    title: 'Aldi Budget Fat Loss Meal Plans UK - Free Cheap Plans',
    description: 'Free Aldi budget fat loss meal plans from 1,400 to 1,800 kcal at the lowest weekly cost, with grouped shopping lists, macros and printable PDFs.',
    h1: 'Aldi Budget Fat Loss Meal Plans UK',
    kicker: 'Aldi budget fat loss hub',
    intro: 'Fat loss is a twelve-week job, not a one-week one, and that changes which kind of cheap actually matters. A single bargain is worth very little across three months. A shop that costs roughly the same every week is worth a great deal.',
    match: { supermarkets: ['aldi'], goals: ['budget-fat-loss'] },
    stats: ['18 Aldi plans', 'Lowest weekly cost', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Predictable beats cheap over a long phase',
        paragraphs: [
          'Most supermarket saving is conditional - it depends on an offer being on, an app being scanned, or a particular line being in stock. That works for a single shop and it makes budgeting over twelve weeks genuinely difficult, because the number moves for reasons outside your control.',
          'Aldi prices its core range low and leaves it there. You can put a figure on the week and have it hold, which is what makes a long deficit survivable financially. Over a phase, that steadiness is worth more than the occasional larger saving somewhere else.',
        ],
      },
      {
        h2: 'Keep the plan cheap without making it grim',
        paragraphs: [
          'The cheapest possible basket is also the bleakest, and a plan nobody wants to eat fails regardless of what it cost. Spend the small amount of headroom on the things that carry flavour rather than calories - spices, stock, mustard, vinegar, tinned tomatoes, frozen herbs, lemons.',
          'That handful of items costs a few pounds, lasts weeks, and is the difference between repeating a meal happily and abandoning it in week three. Everything else on these plans is built from the core range, where the price stability is.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'How cheap is a fat loss week at Aldi?',
        a: 'Each plan states its own estimate and the lowest tier sits at the bottom of what a full week costs anywhere. The figure assumes cupboard basics like oil, spices and stock are already in, which is why a first shop runs higher.',
      },
      {
        q: 'Why does price stability matter more than a bargain?',
        a: 'Because a fat loss phase runs for months. A shop that costs roughly the same every week can be budgeted for and held; a shop that depends on rotating offers cannot, and that is where long plans tend to come apart.',
      },
    ],
    relatedSlugs: ['aldi', 'weight-loss', 'low-calorie', 'cheap-student'],
  },
  'aldi-cheap-student': {
    slug: 'aldi-cheap-student',
    path: '/meal-plans/aldi-cheap-student',
    title: 'Aldi Student Meal Plans UK - Cheap Plans + Shopping Lists',
    description: 'Free cheap Aldi student meal plans built for shared kitchens and small budgets, with short ingredient lists, grouped shopping lists and printable PDFs.',
    h1: 'Aldi Student Meal Plans UK',
    kicker: 'Aldi student hub',
    intro: 'The useful thing about Aldi for a student is not only that it is cheap. It is that the range is small enough to learn. Six meals cooked confidently beats thirty attempted badly, and a store with two options per line pushes you towards the first.',
    match: { supermarkets: ['aldi'], goals: ['cheap-student'] },
    stats: ['15 Aldi plans', 'Lowest weekly cost', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Learn six meals, not thirty',
        paragraphs: [
          'The first year of cooking for yourself is mostly about repetition. A short list of meals you can make without a recipe, from ingredients you always have, is worth more than a wide repertoire you need to look up - and it is much cheaper, because the same eight or ten ingredients keep getting used rather than half-used.',
          'Aldi suits that because the core range barely changes. The chicken, mince, rice, pasta, tinned tomatoes, frozen vegetables and eggs are there every week at roughly the same price, so the meals you learn stay buildable.',
        ],
      },
      {
        h2: 'Plan for the kitchen you actually have',
        paragraphs: [
          'A shared kitchen means limited hob space at six in the evening, a fridge shelf you may not fully control, and washing up that is not always yours. These plans assume that: short ingredient lists, few pans, and meals that survive being cooked at an odd hour.',
          'It also means the freezer and the cupboard do more work than the fridge. Frozen vegetables, tinned pulses and dried staples cannot be borrowed by a housemate or go off while you are out, which is a practical advantage as much as a financial one.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'What should a student buy on the first Aldi shop?',
        a: 'The staples that appear in everything: oil, salt, pepper, a couple of spices, stock cubes, rice, pasta, tinned tomatoes, tinned beans, eggs, frozen vegetables. It costs more than a normal week and then makes every following week cheap.',
      },
      {
        q: 'Do these plans work in a shared kitchen?',
        a: 'They are written for one. Short ingredient lists, few pans, and a lean on cupboard and freezer items rather than fresh food that needs using within days or sitting in a communal fridge.',
      },
    ],
    relatedSlugs: ['aldi', 'cheap-student', 'low-calorie', 'meal-plans-with-shopping-list'],
  },
  'lidl-budget-bodybuilding': {
    slug: 'lidl-budget-bodybuilding',
    path: '/meal-plans/lidl-budget-bodybuilding',
    title: 'Lidl Budget Bodybuilding Meal Plans UK - Cheap High Protein',
    description: 'Free cheap Lidl bodybuilding meal plans from 2,500 to 3,500 kcal, built on own-brand protein at discounter prices, with shopping lists and PDFs.',
    h1: 'Lidl Budget Bodybuilding Meal Plans UK',
    kicker: 'Lidl budget bulk hub',
    intro: 'A surplus is where the price of protein really bites. You are not buying a bit more of everything - you are buying substantially more of the most expensive thing in the trolley, every week, for months.',
    match: { supermarkets: ['lidl'], goals: ['budget-bodybuilding'] },
    stats: ['14 Lidl plans', '2,500-3,500 kcal', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'The maths of a cheap surplus',
        paragraphs: [
          'Going from 2,000 to 3,000 kcal with protein held proportional means roughly half as much again of the meat, fish and dairy in the basket. At mainstream prices that is a noticeable weekly increase; at discounter prices it is manageable, and that difference is why the chain matters more for this goal than for most.',
          'Lidl helps specifically because its high-protein dairy - skyr, quark, protein puddings, cottage cheese - is priced as own-brand rather than as sports nutrition. Those products carry a lot of protein per pound and need no cooking, which is exactly what a high-calorie day short on time needs.',
        ],
      },
      {
        h2: 'Watch the protein share, not the calorie total',
        paragraphs: [
          'The cheap way to add calories is oil and carbohydrate, and both work - right up until protein has quietly fallen as a proportion of a much larger total. The number to check when a bulk is not producing what you expected is grams of protein, not the calorie figure.',
          'Each plan here states its own. If you are adjusting portions to fit your appetite or budget, scale the carbohydrate and fat first and leave the protein where it is.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'Can you bulk cheaply at Lidl?',
        a: 'It is one of the better places to try. The own-brand high-protein dairy is priced as an ordinary line rather than a fitness product, and that is where a surplus spends most of its extra money.',
      },
      {
        q: 'Do I need protein powder for these plans?',
        a: 'No. Every plan reaches its protein target from food. Powder is a cheap and convenient way to replace one of the dairy servings if it suits you, but nothing here depends on it.',
      },
    ],
    relatedSlugs: ['lidl', 'budget-bodybuilding', 'muscle-gain', '3000-calorie'],
  },
  'iceland-budget-fat-loss': {
    slug: 'iceland-budget-fat-loss',
    path: '/meal-plans/iceland-budget-fat-loss',
    title: 'Iceland Budget Fat Loss Meal Plans UK - Cheap Frozen Plans',
    description: 'Free cheap Iceland fat loss meal plans from 1,400 to 1,800 kcal built on frozen portions, with grouped shopping lists, macros and printable PDFs.',
    h1: 'Iceland Budget Fat Loss Meal Plans UK',
    kicker: 'Iceland budget fat loss hub',
    intro: 'Frozen food gets recommended for fat loss on the grounds that it is cheap, which is true and is not the interesting part. The useful part is that it is already divided up.',
    match: { supermarkets: ['iceland'], goals: ['budget-fat-loss'] },
    stats: ['10 Iceland plans', 'Lowest weekly cost', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Portion control without scales or willpower',
        paragraphs: [
          'A bag of frozen chicken breasts or white fish lets you take out exactly what you are cooking and put the rest back. Nothing is defrosted that needs using, so there is no half a pack in the fridge quietly arguing to be finished, and no decision to make at the end of a long day about whether to cook the extra piece.',
          'That is a genuinely different mechanism from weighing food. Weighing requires you to be accurate every time; taking two pieces out of a bag requires nothing. On a deficit, the second one holds up far better across a bad week.',
        ],
      },
      {
        h2: 'Be honest that this is half a shop',
        paragraphs: [
          'Iceland covers the protein and the vegetables and thins out quickly after that. Fresh fruit, most dairy and the cupboard staples come from somewhere else, and a plan that pretends otherwise falls apart on the first shop.',
          'Used deliberately as the freezer half of a week it is one of the cheapest ways to cover the expensive part of a deficit. The shopping lists on these plans separate what is realistically an Iceland purchase from what is not, so you can see the split before you set off.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'Is frozen food good for weight loss?',
        a: 'It is good for portion control, which matters more. You cook only what you take out of the bag, so there is no part-used pack in the fridge and no decision about whether to finish it.',
      },
      {
        q: 'Can I do a whole fat loss week at Iceland?',
        a: 'Rarely. It covers protein and vegetables well and thins out on fresh produce, dairy and cupboard staples, so expect a top-up elsewhere. Treated as the freezer half of the shop it works very well.',
      },
    ],
    relatedSlugs: ['iceland', 'weight-loss', 'low-calorie', '1500-calorie'],
  },
  'waitrose-weight-loss': {
    slug: 'waitrose-weight-loss',
    path: '/meal-plans/waitrose-weight-loss',
    title: 'Waitrose Weight Loss Meal Plans UK - Free Plans + Lists',
    description: 'Free Waitrose weight loss meal plans from 1,400 to 1,800 kcal built around the Essential range, with grouped shopping lists and printable PDFs.',
    h1: 'Waitrose Weight Loss Meal Plans UK',
    kicker: 'Waitrose fat loss hub',
    intro: 'If you are shopping at Waitrose, price is probably not the constraint on your week. The prepared food is, and it is very good, which is precisely the problem.',
    match: { supermarkets: ['waitrose'], goals: ['weight-loss'] },
    stats: ['11 Waitrose plans', '1,400-1,800 kcal', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'The risk here is convenience, not cost',
        paragraphs: [
          'Waitrose is unusually strong on ready meals, prepared salads, dips, bakery and food-to-go, and all of it is easy to justify because the quality is high. None of that is incompatible with losing weight, but it is the part of this shop that most often replaces the plan rather than supporting it.',
          'The practical answer is not restraint but sequence: shop the list first and give yourself a decision about anything else only after the basket already contains the week. Deciding at the chilled aisle, before the rest of the shop exists, rarely goes the way anyone intends.',
        ],
      },
      {
        h2: 'Essential is where these plans live',
        paragraphs: [
          'The Essential range is the reason a Waitrose plan can be costed sensibly at all. The basics in it - chicken, mince, fish, rice, pasta, tinned goods, frozen vegetables, dairy - are competitive with the other big chains, and they carry these plans almost entirely.',
          'Step outside it and the weekly figure moves quickly. That is a fair trade if you want it, but it is worth being deliberate about which items you are choosing to pay more for rather than drifting there by default.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'Is Waitrose too expensive for a weight loss plan?',
        a: 'Not if you stay inside the Essential range, which is competitive with the other big chains on the basics these plans use. The weekly cost climbs when the basket moves outside it.',
      },
      {
        q: 'What is the main thing to avoid?',
        a: 'Not a food - a sequence. Shop the list before considering the prepared food and bakery. Waitrose is very good at those, and they replace planned meals more often than they supplement them.',
      },
    ],
    relatedSlugs: ['waitrose', 'weight-loss', '1500-calorie', 'low-calorie'],
  },
  'marks-spencer-weight-loss': {
    slug: 'marks-spencer-weight-loss',
    path: '/meal-plans/marks-spencer-weight-loss',
    title: 'M&S Weight Loss Meal Plans UK - Free Plans + Shopping Lists',
    description: 'Free M&S weight loss meal plans from 1,400 to 1,800 kcal using smaller pack sizes for built-in portion control, with shopping lists and PDFs.',
    h1: 'M&S Weight Loss Meal Plans UK',
    kicker: 'M&S fat loss hub',
    intro: 'M&S is expensive per kilo and that is the wrong number to judge it by if you are cooking for one. What breaks most deficits is not the price of food but how much of it ends up on the plate, and small packs quietly settle that.',
    match: { supermarkets: ['marks-spencer'], goals: ['weight-loss'] },
    stats: ['10 M&S plans', '1,400-1,800 kcal', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Small packs are portion control you do not have to think about',
        paragraphs: [
          'A two-fillet pack of chicken is two meals. A 500g pack is two meals and an argument. For one or two people the smaller unit removes the daily decision about whether to cook the rest, and that decision is where calorie drift actually happens - not in the weighing, which most people do reasonably well when they do it at all.',
          'The same applies to the produce and the dairy. Buying close to what a week needs means less in the fridge, less to use up, and far less of the Friday cooking that exists only because something would otherwise be thrown away.',
        ],
      },
      {
        h2: 'Judge the cost per week, not per kilo',
        paragraphs: [
          'The honest comparison is not the shelf price against a discounter but what you actually spend and eat across a week. A cheaper large pack that produces one wasted portion and one oversized dinner is not obviously the better buy for a single person on a deficit.',
          'That said, the gap is real and these plans do not pretend otherwise. If weekly cost is the binding constraint rather than convenience or waste, an Aldi or Lidl plan will come in materially lower.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'Is M&S practical for weight loss?',
        a: 'For one or two people, yes. The smaller pack sizes give portion control without weighing, and less food in the fridge means less of the eating that happens simply because something needs using up.',
      },
      {
        q: 'Is it worth the extra cost?',
        a: 'That depends whether waste and portion drift are your problem or price is. If price is the binding constraint, a discounter plan will be cheaper; if you are cooking for one and throwing food away, the smaller packs can close much of the gap.',
      },
    ],
    relatedSlugs: ['marks-spencer', 'weight-loss', '1500-calorie', 'low-calorie'],
  },
  'ocado-weight-loss': {
    slug: 'ocado-weight-loss',
    path: '/meal-plans/ocado-weight-loss',
    title: 'Ocado Weight Loss Meal Plans UK - Free Plans + Shopping Lists',
    description: 'Free Ocado weight loss meal plans from 1,400 to 1,800 kcal built for online ordering, with grouped shopping lists, macros and printable PDFs.',
    h1: 'Ocado Weight Loss Meal Plans UK',
    kicker: 'Ocado fat loss hub',
    intro: 'Ocado has one advantage for a calorie deficit that no physical supermarket can offer, and it has nothing to do with range or price: you can see the whole basket, and change your mind, before you have committed to any of it.',
    match: { supermarkets: ['ocado'], goals: ['weight-loss'] },
    stats: ['8 Ocado plans', '1,400-1,800 kcal', 'Shopping list and PDF'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'The basket is the plan',
        paragraphs: [
          'In a shop you make a series of small decisions while walking, tired, and often hungry, and you find out what you bought at the till. Ordering online inverts that. The trolley sits in front of you as a list, you can take things out without any awkwardness, and nothing arrives that you did not deliberately choose.',
          'For anyone whose deficit is undone by impulse rather than by planning, that is the single most useful thing about this chain. Build the order against the plan, then read it back once before checkout - the second pass is where the things that crept in come out again.',
        ],
      },
      {
        h2: 'Plan the whole week, because there is no popping out',
        paragraphs: [
          'The trade is that a delivery slot is not a shop you can nip back to. A forgotten ingredient means either a substitute, a trip to a local store, or a meal that does not happen, and the third is what usually turns into a takeaway.',
          'So these plans are written to be ordered in one go, with the shopping list grouped so it can be checked against the basket before the slot closes. It is also worth setting substitution preferences deliberately rather than leaving them to chance, since a swapped product can change the calories of a meal more than people expect.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'Is online shopping better for weight loss?',
        a: 'It can be, for a specific reason: you see the entire basket as a list before committing and can remove things without any social awkwardness. If impulse buying rather than planning is what derails your week, that matters more than range or price.',
      },
      {
        q: 'What should I watch out for with Ocado?',
        a: 'Substitutions and the lack of a top-up. Set your substitution preferences deliberately, since a swapped product can change a meal’s calories, and order the full week in one go because there is no popping back for what you forgot.',
      },
    ],
    relatedSlugs: ['ocado', 'weight-loss', '1500-calorie', 'meal-plans-with-shopping-list'],
  },
};

export const MEAL_PLAN_HUB_SLUGS = Object.keys(MEAL_PLAN_HUBS);

// Resolve any calorie figure to the hub that actually covers it.
//
// Three pages used to build this path by interpolating the plan's own calorie
// value - `/meal-plans/${plan.calories}-calorie`. That silently assumed a hub
// existed for every target in the catalogue, so consolidating the calorie hubs
// left 80 internal links pointing at redirects, which check-google-indexing
// fails on. Reading the match ranges means the mapping cannot drift again:
// retire a hub and its plans follow whichever hub claims them.
const CALORIE_HUB_ENTRIES = Object.values(MEAL_PLAN_HUBS)
  .filter(hub => Array.isArray(hub.match?.calories) && /^\d+-calorie$/.test(hub.slug))
  .map(hub => ({ path: hub.path, calories: hub.match.calories }));

export function calorieHubPathFor(calories) {
  const target = Number(calories);
  if (!Number.isFinite(target)) return '/meal-plans/low-calorie';

  const exact = CALORIE_HUB_ENTRIES.find(entry => entry.calories.includes(target));
  if (exact) return exact.path;

  // No hub claims this target - fall back to the closest one rather than
  // linking somewhere that does not exist.
  let best = null;
  let bestGap = Infinity;
  for (const entry of CALORIE_HUB_ENTRIES) {
    for (const value of entry.calories) {
      const gap = Math.abs(value - target);
      if (gap < bestGap) {
        bestGap = gap;
        best = entry;
      }
    }
  }
  return best ? best.path : '/meal-plans/low-calorie';
}

const HUB_GOAL_PRIORITY = {
  'weight-loss': 1,
  'high-protein-low-cal': 2,
  'budget-fat-loss': 3,
  'cheap-high-protein': 4,
  'vegetarian-low-cal': 5,
  'high-protein-vegetarian': 6,
};

export function filterPlansForHub(plans, hub) {
  const match = hub.match || {};
  const filtered = plans.filter(plan => {
    if (match.calories && !match.calories.includes(plan.calories)) return false;
    if (match.goals && !match.goals.includes(plan.goal)) return false;
    if (match.supermarkets && !match.supermarkets.includes(plan.supermarket)) return false;
    if (match.diets && !match.diets.includes(plan.dietType)) return false;
    if (match.emphasis && !match.emphasis.includes(plan.emphasis)) return false;
    if (match.budgets && !match.budgets.includes(plan.budget)) return false;
    if (match.efforts && !match.efforts.includes(plan.effort)) return false;
    return true;
  });

  return filtered.sort((a, b) => scorePlanForHub(b, hub) - scorePlanForHub(a, hub));
}

function scorePlanForHub(plan, hub) {
  const match = hub.match || {};
  let score = 0;

  if (match.calories?.includes(plan.calories)) score += 8;
  if (match.goals?.includes(plan.goal)) score += 8;
  if (match.supermarkets?.includes(plan.supermarket)) score += 8;
  if (match.diets?.includes(plan.dietType)) score += 8;
  if (match.emphasis?.includes(plan.emphasis)) score += 5;
  if (match.budgets?.includes(plan.budget)) score += 5;
  if (match.efforts?.includes(plan.effort)) score += 4;
  if (plan.supermarket === 'aldi' || plan.supermarket === 'tesco') score += 2;
  if (plan.effort === 'batch' || plan.effort === 'standard') score += 2;
  if (plan.dietType === 'standard') score += 1;

  score += Math.max(0, 8 - (HUB_GOAL_PRIORITY[plan.goal] || 8));
  return score;
}
