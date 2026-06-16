const STORE_TAG = 'amazonaff01d8-21';

function amazonProductUrl(slug, asin) {
  return `https://www.amazon.co.uk/${slug}/dp/${asin}?tag=${STORE_TAG}&linkCode=ll2`;
}

function amazonSearchUrl(query) {
  return `https://www.amazon.co.uk/s?k=${encodeURIComponent(query)}&tag=${STORE_TAG}&linkCode=ll2`;
}

export const AFFILIATE_DISCLOSURE =
  'As an Amazon Associate I earn from qualifying purchases. Product prices and availability can change on Amazon UK.';

export const CONTAINER_PRODUCTS = {
  'budget-compartment-50-pack': {
    name: '50 Pack 3-Compartment Meal Prep Containers',
    shortName: '50 pack compartment tubs',
    priceBand: 'Budget: under \u00a315 target',
    material: 'Reusable plastic',
    bestFor: 'Bulk weekday lunches, freezer portions, and beginner meal prep',
    href: amazonProductUrl('Pack-Meal-Containers-Compartment-Reusable', 'B09KNNZ9FC'),
    image: '/budget-containers-ad.jpg',
    badge: 'Best starter pack',
    summary:
      'A large divided-container pack for people who want low cost per tub and do not need premium glass.',
    keyFeatures: [
      'Three compartments for protein, carbs, and vegetables',
      'Lightweight enough for commuting or gym bags',
      'Good choice when you want many tubs for batch cooking',
    ],
    watchOut: 'Plastic tubs can stain with tomato sauces or curries over time.',
  },
  'bentgo-prep-10-pack': {
    name: 'Bentgo Prep Reusable Food Storage Containers',
    shortName: 'Bentgo Prep set',
    priceBand: 'Budget: under \u00a315 target',
    material: 'BPA-free plastic',
    bestFor: 'Simple one-compartment lunches and stacked fridge storage',
    href: amazonSearchUrl('Bentgo Prep reusable food storage containers UK'),
    image: '/budget-containers-ad.jpg',
    badge: 'Best simple plastic set',
    summary:
      'A practical reusable-plastic option for people who prefer one open compartment instead of dividers.',
    keyFeatures: [
      'Straightforward single-compartment layout',
      'Stacks neatly in the fridge',
      'A sensible first upgrade from takeaway tubs',
    ],
    watchOut: 'Choose divided tubs instead if you dislike sauce touching sides.',
  },
  'sistema-klip-it': {
    name: 'Sistema KLIP IT Plus Food Storage Containers',
    shortName: 'Sistema KLIP IT',
    priceBand: 'Budget: under \u00a315 target',
    material: 'Plastic',
    bestFor: 'Sandwiches, salad bases, snacks, and mixed leftovers',
    href: amazonSearchUrl('Sistema KLIP IT Plus food storage containers meal prep'),
    image: '/budget-containers-ad.jpg',
    badge: 'Best everyday tub',
    summary:
      'A familiar UK cupboard staple that works well for low-cost lunches, snacks, and leftovers.',
    keyFeatures: [
      'Clip-lock lid style for everyday storage',
      'Useful range of sizes',
      'Easy to replace if a lid gets lost',
    ],
    watchOut: 'Not as premium-feeling as glass and less suitable for heavy reheating.',
  },
  'amazon-basics-plastic-set': {
    name: 'Amazon Basics Food Storage Container Set',
    shortName: 'Amazon Basics set',
    priceBand: 'Budget: under \u00a315 target',
    material: 'Plastic',
    bestFor: 'Building a cheap starter set with mixed sizes',
    href: amazonSearchUrl('Amazon Basics food storage containers BPA free meal prep'),
    image: '/budget-containers-ad.jpg',
    badge: 'Best mixed starter kit',
    summary:
      'A low-cost mixed-size set for kitchens that need tubs for lunches, snacks, sauces, and leftovers.',
    keyFeatures: [
      'Multiple sizes for flexible storage',
      'Good value when replacing old mismatched tubs',
      'Works for meal prep plus general kitchen storage',
    ],
    watchOut: 'Mixed sets usually include fewer full-lunch-sized containers.',
  },
  'freshware-3-compartment': {
    name: 'Freshware 3-Compartment Meal Prep Containers',
    shortName: 'Freshware divided tubs',
    priceBand: 'Budget: under \u00a315 target',
    material: 'Plastic',
    bestFor: 'Macro-style portions where each food group stays separate',
    href: amazonSearchUrl('Freshware meal prep containers 3 compartment UK'),
    image: '/budget-containers-ad.jpg',
    badge: 'Best macro layout',
    summary:
      'A divided plastic option for classic protein, carb, and veg meal prep.',
    keyFeatures: [
      'Three-section layout for balanced plates',
      'Useful for calorie-controlled batch cooking',
      'Often sold in large multipacks',
    ],
    watchOut: 'Check the live listing for microwave and dishwasher guidance.',
  },
  'deli-twist-lid-tubs': {
    name: 'Leakproof Deli Containers with Twist Lids',
    shortName: 'Twist-lid meal prep tubs',
    priceBand: 'Budget: under \u00a315 target',
    material: 'Plastic',
    bestFor: 'Soups, chilli, overnight oats, sauces, and freezer batches',
    href: amazonSearchUrl('leakproof deli containers twist lid meal prep tubs UK'),
    image: '/budget-containers-ad.jpg',
    badge: 'Best for soups',
    summary:
      'Round deli-style tubs are not elegant, but they are excellent for saucy batch cooking on a budget.',
    keyFeatures: [
      'Twist lids are useful for liquid-heavy meals',
      'Good for freezing individual portions',
      'Cheap enough to keep many portions ready',
    ],
    watchOut: 'Round tubs waste more fridge space than rectangular containers.',
  },
  'harbour-housewares-glass-5-pack': {
    name: 'Harbour Housewares Glass Food Storage Containers',
    shortName: 'Harbour Housewares glass set',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'A balanced glass upgrade without paying premium-set prices',
    href: amazonProductUrl('Harbour-Housewares-Glass-Containers-Airtight', 'B0DXQB6VPW'),
    image: '/meal-containers-ad.jpg',
    badge: 'Best balanced glass set',
    summary:
      'A strong mid-range pick for people moving from plastic to glass meal prep containers.',
    keyFeatures: [
      'Airtight-style lids for fridge storage',
      'Glass base avoids staining from curry or tomato sauce',
      'Good everyday size for weekday lunches',
    ],
    watchOut: 'Glass is heavier than plastic for commuting.',
  },
  'prep-naturals-glass-5-pack': {
    name: 'Prep Naturals 5-Pack Glass Meal Prep Containers',
    shortName: 'Prep Naturals glass',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'Leak-resistant glass lunches and oven-to-fridge meal prep',
    href: amazonSearchUrl('Prep Naturals 5 pack glass meal prep containers UK'),
    image: '/meal-containers-ad.jpg',
    badge: 'Best known glass pick',
    summary:
      'A popular glass meal prep format for anyone who wants identical lunch-sized containers.',
    keyFeatures: [
      'Five matching portions suit a working week',
      'Glass base handles staining foods better than plastic',
      'Rectangular shape stacks well in fridges',
    ],
    watchOut: 'Check whether the listing is one-compartment or divided before buying.',
  },
  'm-mcirco-glass-5-pack': {
    name: 'M MCIRCO Glass Meal Prep Containers',
    shortName: 'M MCIRCO glass set',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Borosilicate-style glass',
    bestFor: 'Batch-cooked lunches that need sturdy glass bases',
    href: amazonSearchUrl('M MCIRCO glass meal prep containers UK 5 pack'),
    image: '/meal-containers-ad.jpg',
    badge: 'Best sturdy feel',
    summary:
      'A mid-range glass set to compare when you want durability and matching portions.',
    keyFeatures: [
      'Often sold as identical rectangular portions',
      'Useful for reheating food away from home',
      'Good alternative to Prep Naturals or Harbour Housewares',
    ],
    watchOut: 'Confirm lid care instructions; many glass sets require lid hand washing.',
  },
  'joyjolt-glass-storage': {
    name: 'JoyJolt Glass Food Storage Containers',
    shortName: 'JoyJolt glass set',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'People who want a mix of storage sizes',
    href: amazonSearchUrl('JoyJolt glass food storage containers UK'),
    image: '/meal-containers-ad.jpg',
    badge: 'Best mixed glass set',
    summary:
      'A flexible glass storage option when you want containers for breakfasts, snacks, and leftovers as well as lunches.',
    keyFeatures: [
      'Mixed shapes and sizes can cover more than lunch prep',
      'Glass bases resist odours',
      'Useful if your current cupboard has no small tubs',
    ],
    watchOut: 'Mixed sets may not give you five identical lunch boxes.',
  },
  'pyrex-cook-and-go': {
    name: 'Pyrex Cook & Go Glass Food Storage Set',
    shortName: 'Pyrex Cook & Go',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'Brand-led glass storage and leftovers',
    href: amazonSearchUrl('Pyrex Cook and Go glass food storage containers set UK'),
    image: '/meal-containers-ad.jpg',
    badge: 'Best brand confidence',
    summary:
      'A recognisable glass brand choice for buyers who value a familiar name and easy replacement options.',
    keyFeatures: [
      'Works well for leftovers and lunch portions',
      'Good choice for stain-heavy meals',
      'Brand range usually includes multiple sizes',
    ],
    watchOut: 'Some Pyrex sets are better for leftovers than identical meal-prep portions.',
  },
  'verones-divided-glass': {
    name: 'Verones Divided Glass Meal Prep Containers',
    shortName: 'Verones divided glass',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'Glass meal prep with separate compartments',
    href: amazonSearchUrl('Verones divided glass meal prep containers UK'),
    image: '/meal-containers-ad.jpg',
    badge: 'Best divided glass option',
    summary:
      'A useful middle ground for buyers who want glass but still prefer separated foods.',
    keyFeatures: [
      'Dividers help keep meals structured',
      'Glass resists staining better than plastic',
      'Good for curry, rice, salads, and reheated lunches',
    ],
    watchOut: 'Divided glass is less flexible for soups and large single-pot meals.',
  },
  'borohouse-10-pack-glass': {
    name: 'BOROHOUSE 10-Pack Glass Storage Containers',
    shortName: 'BOROHOUSE 10-pack',
    priceBand: 'Premium: \u00a330+ target',
    material: 'Borosilicate glass',
    bestFor: 'A fuller glass setup for serious weekly meal prep',
    href: amazonProductUrl('BOROHOUSE-10-Pack-Glass-Storage-Containers', 'B0FFH1DW9W'),
    image: '/meal-containers-ad.jpg',
    badge: 'Best full-week glass set',
    summary:
      'A larger glass set for meal preppers who want enough containers for lunches, dinners, and leftovers.',
    keyFeatures: [
      'Ten-piece coverage for a fuller weekly prep',
      'Borosilicate glass bases suit reheating and freezer storage',
      'Airtight lids help keep batch-cooked meals fresh',
    ],
    watchOut: 'A larger glass set takes more cupboard space and is heavier to carry.',
  },
  'black-blum-stainless-set': {
    name: 'Black+Blum Stainless Steel Meal Prep Box Set',
    shortName: 'Black+Blum stainless set',
    priceBand: 'Premium: \u00a330+ target',
    material: 'Stainless steel',
    bestFor: 'Commuters who want a lighter premium alternative to glass',
    href: amazonSearchUrl('Black Blum stainless steel meal prep box set microwave safe UK'),
    image: '/meal-containers-ad.jpg',
    badge: 'Best premium commute pick',
    summary:
      'A premium route for buyers who dislike heavy glass but want something more durable than plastic.',
    keyFeatures: [
      'Stainless steel is lighter than glass',
      'Designed for repeat daily use',
      'Good-looking enough for desk lunches',
    ],
    watchOut: 'Only microwave stainless steel if the specific listing says it is microwave safe.',
  },
  'oxo-smart-seal-glass': {
    name: 'OXO Good Grips Smart Seal Glass Container Set',
    shortName: 'OXO Smart Seal',
    priceBand: 'Premium: \u00a330+ target',
    material: 'Glass',
    bestFor: 'Premium seals and mixed home storage',
    href: amazonSearchUrl('OXO Good Grips Smart Seal glass container set UK'),
    image: '/meal-containers-ad.jpg',
    badge: 'Best premium seal',
    summary:
      'A premium mixed glass set for people who care most about seal quality and long-term feel.',
    keyFeatures: [
      'Strong brand reputation for kitchen storage',
      'Useful mix of shapes for leftovers and prep',
      'Good option for organised fridges',
    ],
    watchOut: 'Mixed sizes are less efficient if you only want five identical lunches.',
  },
  'rubbermaid-brilliance-glass': {
    name: 'Rubbermaid Brilliance Glass Food Storage Set',
    shortName: 'Rubbermaid Brilliance glass',
    priceBand: 'Premium: \u00a330+ target',
    material: 'Glass',
    bestFor: 'Leak-resistant premium leftovers and meal prep',
    href: amazonSearchUrl('Rubbermaid Brilliance glass food storage set UK'),
    image: '/meal-containers-ad.jpg',
    badge: 'Best leak focus',
    summary:
      'A premium glass option to compare if your main frustration is weak lids or messy bags.',
    keyFeatures: [
      'Premium-style locking lids',
      'Clear glass bases for fridge visibility',
      'Good for sauces, leftovers, and batch cooking',
    ],
    watchOut: 'Premium mixed sets can cost more per lunch-sized container.',
  },
  'joseph-joseph-nest-lock': {
    name: 'Joseph Joseph Nest Lock Food Storage Set',
    shortName: 'Joseph Joseph Nest Lock',
    priceBand: 'Premium: \u00a330+ target',
    material: 'Plastic',
    bestFor: 'Small kitchens where cupboard space matters',
    href: amazonSearchUrl('Joseph Joseph Nest Lock food storage set UK'),
    image: '/budget-containers-ad.jpg',
    badge: 'Best space saver',
    summary:
      'A premium plastic option for buyers who want neat nesting storage more than glass reheating.',
    keyFeatures: [
      'Nesting design saves cupboard space',
      'Colour-coded lids reduce lid matching chaos',
      'Useful for mixed leftovers and lunches',
    ],
    watchOut: 'Still plastic, so glass remains better for stain-heavy reheating.',
  },
  'pyrex-freshlock-large-set': {
    name: 'Pyrex Freshlock Glass Storage Set',
    shortName: 'Pyrex Freshlock',
    priceBand: 'Premium: \u00a330+ target',
    material: 'Glass',
    bestFor: 'Brand-led premium glass storage with secure lids',
    href: amazonSearchUrl('Pyrex Freshlock glass food storage containers set UK'),
    image: '/meal-containers-ad.jpg',
    badge: 'Best branded glass set',
    summary:
      'A premium Pyrex route for people replacing plastic with a long-term glass storage system.',
    keyFeatures: [
      'Recognisable glass storage brand',
      'Good for leftovers, batch cooking, and freezer portions',
      'Useful when you want one system across the kitchen',
    ],
    watchOut: 'Check the set contents carefully because sizes vary by listing.',
  },
};

export const CONTAINER_GUIDES = {
  budget: {
    slug: 'budget',
    path: '/meal-prep-containers/budget',
    title: 'Budget Meal Prep Containers UK: Best Cheap Boxes Under \u00a315',
    description:
      'Compare budget meal prep containers, boxes, and tubs for UK batch cooking. Six affordable Amazon UK picks with affiliate links and buying advice.',
    h1: 'Budget Meal Prep Containers UK',
    kicker: 'Budget buying guide',
    priceBand: 'Under \u00a315 target',
    heroProductId: 'budget-compartment-50-pack',
    heroImage: '/budget-containers-ad.jpg',
    intro:
      'Budget meal prep containers are best when you need a lot of tubs quickly: weekday lunches, freezer portions, student cooking, or a first attempt at batch cooking. Prioritise quantity, stackability, and sensible lid fit over premium materials.',
    productIds: [
      'budget-compartment-50-pack',
      'bentgo-prep-10-pack',
      'sistema-klip-it',
      'amazon-basics-plastic-set',
      'freshware-3-compartment',
      'deli-twist-lid-tubs',
    ],
    sections: [
      {
        h2: 'Who should buy budget meal prep containers?',
        paragraphs: [
          'Budget containers make sense if you are still testing the meal prep habit, cooking for a student kitchen, freezing lots of portions, or replacing a cupboard full of mismatched takeaway tubs. The goal is not luxury; it is having enough clean containers ready on Sunday night.',
          'At this tier, plastic is usually the sensible material. It is light, cheap, and easy to take to work. The trade-off is that tomato, chilli, curry, and turmeric-heavy meals can stain the bases. If you reheat saucy meals every day, use budget containers as a stepping stone toward glass.',
        ],
      },
      {
        h2: 'What to look for under \u00a315',
        paragraphs: [
          'Choose rectangular containers where possible because they use fridge space better than round tubs. If you batch cook protein, rice, and vegetables separately, three-compartment boxes keep meals looking tidy. If you cook chilli, soup, or overnight oats, round twist-lid tubs are more useful.',
          'For conversion-focused buying, the best budget offer is usually a multipack. A five-pack is enough for work lunches; a 20-pack or 50-pack is better if you freeze meals or prep for more than one person.',
        ],
      },
      {
        h2: 'Budget verdict',
        paragraphs: [
          'Pick divided plastic boxes if you want classic gym-style meal prep. Pick twist-lid tubs if your food is saucy. Pick a mixed Amazon Basics or Sistema-style set if you want one cheap storage refresh for the whole kitchen.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are cheap meal prep containers worth it?',
        a: 'Yes, if you need lots of containers and are happy with plastic. They are ideal for beginners, students, freezer portions, and work lunches. Upgrade to glass later if staining or reheating becomes annoying.',
      },
      {
        q: 'Are budget plastic meal prep boxes leakproof?',
        a: 'Some are leak-resistant, but very cheap hinged-lid boxes are rarely as reliable as clip-lock glass or twist-lid tubs. Use twist-lid deli tubs for soup, chilli, and liquid-heavy meals.',
      },
      {
        q: 'How many budget meal prep tubs should I buy?',
        a: 'For one person, five lunch containers is the minimum. Ten gives enough room for dinners or freezer portions. Larger multipacks are useful if you batch cook for a family.',
      },
    ],
  },
  'mid-range': {
    slug: 'mid-range',
    path: '/meal-prep-containers/mid-range',
    title: 'Mid Range Meal Prep Containers UK: Best Glass Boxes \u00a315-\u00a330',
    description:
      'Compare mid range meal prep containers for UK meal prep. Six Amazon UK glass and divided-container picks in the \u00a315-\u00a330 target band.',
    h1: 'Mid Range Meal Prep Containers UK',
    kicker: 'Best balance',
    priceBand: '\u00a315-\u00a330 target',
    heroProductId: 'harbour-housewares-glass-5-pack',
    heroImage: '/meal-containers-ad.jpg',
    intro:
      'Mid range is the sweet spot for most UK meal preppers. You can step up from plastic into glass, get better lids, avoid staining, and still keep the purchase sensible.',
    productIds: [
      'harbour-housewares-glass-5-pack',
      'prep-naturals-glass-5-pack',
      'm-mcirco-glass-5-pack',
      'joyjolt-glass-storage',
      'pyrex-cook-and-go',
      'verones-divided-glass',
    ],
    sections: [
      {
        h2: 'Why mid range is the best tier for most people',
        paragraphs: [
          'Once you know you will meal prep every week, glass becomes much easier to justify. It does not hold food smells, it handles tomato sauces better, and it feels more pleasant to eat from than thin plastic. The best mid-range sets usually give you five practical lunch containers rather than a huge mixed collection.',
          'This tier is especially good for people who reheat lunches at work. In most glass sets, the glass base is microwave friendly while the lid should be removed before reheating. Always follow the live product instructions.',
        ],
      },
      {
        h2: 'One-compartment or divided glass?',
        paragraphs: [
          'One-compartment glass containers are more flexible. They work for chilli, pasta, stir fry, curry, salad bowls, overnight oats, and leftovers. Divided glass containers are better if you want your rice, vegetables, and protein kept separate.',
          'If you only buy one set, choose rectangular one-compartment glass around the 900 ml to 1 litre mark. That size is the most reliable all-rounder for UK lunch meal prep.',
        ],
      },
      {
        h2: 'Mid range verdict',
        paragraphs: [
          'The Harbour Housewares-style five-pack is the natural place to start: enough containers for a work week, glass bases for reheating, and a sensible target price. Compare Prep Naturals, M MCIRCO, Pyrex, JoyJolt, and divided Verones-style options before buying.',
        ],
      },
    ],
    faq: [
      {
        q: 'What is the best mid range meal prep container material?',
        a: 'Glass is usually best in the mid range because it resists stains and odours better than plastic. Plastic only wins if you need very light containers for commuting.',
      },
      {
        q: 'What size should mid range meal prep containers be?',
        a: 'For lunches and dinners, aim for roughly 900 ml to 1 litre. Smaller containers are useful for snacks, but they are not reliable full-meal boxes.',
      },
      {
        q: 'Are glass meal prep containers heavy?',
        a: 'Yes, they are heavier than plastic. For commuting, carry one glass lunch box at a time or choose premium stainless steel if weight is your main concern.',
      },
    ],
  },
  premium: {
    slug: 'premium',
    path: '/meal-prep-containers/premium',
    title: 'Premium Meal Prep Containers UK: Best Glass and Steel Boxes',
    description:
      'Compare premium meal prep containers from Amazon UK, including larger glass sets, stainless steel boxes, nesting sets, and leak-focused food storage.',
    h1: 'Premium Meal Prep Containers UK',
    kicker: 'Premium buying guide',
    priceBand: '\u00a330+ target',
    heroProductId: 'borohouse-10-pack-glass',
    heroImage: '/meal-containers-ad.jpg',
    intro:
      'Premium meal prep containers are for people who already batch cook consistently and want a long-term system: enough containers for lunches and dinners, stronger lids, better cupboard organisation, and materials that feel good after months of use.',
    productIds: [
      'borohouse-10-pack-glass',
      'black-blum-stainless-set',
      'oxo-smart-seal-glass',
      'rubbermaid-brilliance-glass',
      'joseph-joseph-nest-lock',
      'pyrex-freshlock-large-set',
    ],
    sections: [
      {
        h2: 'When premium containers are worth it',
        paragraphs: [
          'Premium sets make sense when the cheap set is already annoying you. If lids are warping, tubs are stained, your freezer has mystery portions, or you never have the right size available, a better system can improve the whole meal prep routine.',
          'The best premium choice is not always the most expensive. For serious home batch cooking, a larger borosilicate glass set is hard to beat. For commuting, premium stainless steel can be more pleasant because it is lighter than glass. For tiny kitchens, nesting plastic may be the most practical premium upgrade.',
        ],
      },
      {
        h2: 'Glass, stainless steel, or premium plastic?',
        paragraphs: [
          'Choose glass if reheating, stain resistance, and freezer visibility matter most. Choose stainless steel if you want a lighter premium container and the listing explicitly supports your reheating needs. Choose nesting premium plastic if storage space is the bigger problem than material.',
          'Premium buyers should think in systems. Five identical lunch boxes are tidy, but a 10-piece or mixed set can cover overnight oats, snacks, batch sauces, and leftovers as well as weekday meals.',
        ],
      },
      {
        h2: 'Premium verdict',
        paragraphs: [
          'For most committed meal preppers, the BOROHOUSE-style 10-pack glass route is the best overall premium setup. Compare Black+Blum if commuting weight matters, OXO or Rubbermaid if lid quality matters, Joseph Joseph if nesting storage matters, and Pyrex if you want a familiar long-term glass brand.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are premium meal prep containers worth the money?',
        a: 'They are worth it if you meal prep every week. Better materials, stronger lids, and a more organised set reduce friction every time you cook, store, reheat, and wash up.',
      },
      {
        q: 'Is stainless steel better than glass for meal prep?',
        a: 'Stainless steel is lighter and more durable for commuting. Glass is better for visibility, oven-style reheating, and avoiding stains. Only microwave stainless steel when the exact product listing says it is suitable.',
      },
      {
        q: 'What is the best premium setup for one person?',
        a: 'A strong setup is five 900 ml to 1 litre lunch containers, three smaller snack containers, and two larger batch containers. A 10-piece glass set often covers this better than buying singles.',
      },
    ],
  },
};

export const CONTAINER_GUIDE_SLUGS = Object.keys(CONTAINER_GUIDES);

export function getContainerProducts(productIds) {
  return productIds.map(id => CONTAINER_PRODUCTS[id]).filter(Boolean);
}
