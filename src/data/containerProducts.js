const STORE_TAG = 'amazonaff01d8-21';

function amazonProductUrl(slug, asin) {
  return `https://www.amazon.co.uk/${slug}/dp/${asin}?tag=${STORE_TAG}&linkCode=ll2`;
}

export const AFFILIATE_DISCLOSURE =
  'As an Amazon Associate I earn from qualifying purchases. Product prices and availability can change on Amazon UK.';

export const CONTAINER_PRODUCTS = {
  'budget-compartment-50-pack': {
    name: '50 Pack 3-Compartment Meal Prep Containers',
    shortName: '50 pack compartment tubs',
    asin: 'B09KNNZ9FC',
    priceBand: 'Budget: under \u00a315 target',
    material: 'Reusable plastic',
    bestFor: 'Bulk weekday lunches, freezer portions, and beginner meal prep',
    href: amazonProductUrl('Pack-Meal-Containers-Compartment-Reusable', 'B09KNNZ9FC'),
    image: 'https://m.media-amazon.com/images/I/71pUFJ5k6+L._AC_SL1500_.jpg',
    badge: 'Best starter pack',
    summary:
      'A large divided-container pack for people who want low cost per tub and enough boxes for serious batch cooking.',
    keyFeatures: [
      'Three compartments for protein, carbs, and vegetables',
      'Lightweight enough for commuting or gym bags',
      'Good choice when you want many tubs for batch cooking',
    ],
    watchOut: 'Plastic tubs can stain with tomato sauces or curries over time.',
  },
  'bentgo-prep-10-pack': {
    name: 'Bentgo Prep 1-Compartment Meal Prep Containers',
    shortName: 'Bentgo Prep set',
    asin: 'B08CVTY9FS',
    priceBand: 'Budget: under \u00a315 target',
    material: 'BPA-free plastic',
    bestFor: 'Simple one-compartment lunches and stacked fridge storage',
    href: amazonProductUrl('Bentgo-Prep-Containers-Custom-Fit-Compartments', 'B08CVTY9FS'),
    image: 'https://m.media-amazon.com/images/I/81oVaOv3bEL._AC_SL1500_.jpg',
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
    name: 'Bentgo Prep 3-Compartment Meal Prep Containers',
    shortName: 'Bentgo divided set',
    asin: 'B08DKPC9WY',
    priceBand: 'Budget: under \u00a315 target',
    material: 'BPA-free plastic',
    bestFor: 'Portion-controlled lunches where foods need to stay separate',
    href: amazonProductUrl('Bentgo-3-Compartment-Meal-Prep-Containers-Custom-Fit', 'B08DKPC9WY'),
    image: 'https://m.media-amazon.com/images/I/81UNEItUwAL._AC_SL1500_.jpg',
    badge: 'Best divided budget pick',
    summary:
      'A divided budget set for classic protein, carb, and vegetable meal prep without moving up to glass.',
    keyFeatures: [
      'Three-section layout for balanced plates',
      'Useful for calorie-controlled batch cooking',
      'Matching boxes make fridge stacking easier',
    ],
    watchOut: 'Dividers reduce flexibility for soups, pasta bakes, and large single-pot meals.',
  },
  'amazon-basics-plastic-set': {
    name: 'Rubbermaid TakeAlongs Meal Prep Containers',
    shortName: 'Rubbermaid TakeAlongs',
    asin: 'B081D8SMVN',
    priceBand: 'Budget: under \u00a315 target',
    material: 'Plastic',
    bestFor: 'Cheap lunch boxes, leftovers, snacks, and flexible kitchen storage',
    href: amazonProductUrl('Rubbermaid-TakeAlongs-Storage-Containers-Containers', 'B081D8SMVN'),
    image: 'https://m.media-amazon.com/images/I/81t0ns3i7CL._AC_SL1500_.jpg',
    badge: 'Best flexible starter kit',
    summary:
      'A low-cost rectangular set for kitchens that need tubs for lunches, snacks, sauces, and leftovers.',
    keyFeatures: [
      'Multiple containers for a low upfront cost',
      'Good value when replacing old mismatched tubs',
      'Works for meal prep plus general kitchen storage',
    ],
    watchOut: 'Budget plastic is less satisfying for heavy daily reheating than glass.',
  },
  'freshware-3-compartment': {
    name: 'GoodCook 3-Compartment Meal Prep Containers',
    shortName: 'GoodCook divided tubs',
    asin: 'B07HQ26ZJ6',
    priceBand: 'Budget: under \u00a315 target',
    material: 'Plastic',
    bestFor: 'Macro-style portions where each food group stays separate',
    href: amazonProductUrl('GoodCook-Containers-Compartment-Microwave-Stackable', 'B07HQ26ZJ6'),
    image: 'https://m.media-amazon.com/images/I/710t7TThBcL._AC_SL1500_.jpg',
    badge: 'Best macro layout',
    summary:
      'A divided plastic option for gym-style prep, structured lunches, and predictable portions.',
    keyFeatures: [
      'Three-section layout for balanced plates',
      'Useful for calorie-controlled batch cooking',
      'Often sold in practical multipacks',
    ],
    watchOut: 'Check the live listing for microwave and dishwasher guidance.',
  },
  'deli-twist-lid-tubs': {
    name: 'Dealusy 100-Piece Meal Prep Containers',
    shortName: 'Dealusy multipack',
    asin: 'B0D3HYC8H1',
    priceBand: 'Budget: under \u00a315 target',
    material: 'Plastic',
    bestFor: 'High-volume batch cooking, freezer portions, and shared households',
    href: amazonProductUrl('Dealusy-100-Piece-Containers-Leakproof-Dishwasher', 'B0D3HYC8H1'),
    image: 'https://m.media-amazon.com/images/I/71oB3+94jBL._AC_SL1500_.jpg',
    badge: 'Best big multipack',
    summary:
      'A high-count plastic set for buyers who want lots of usable tubs rather than a premium material.',
    keyFeatures: [
      'Large piece count suits freezer batches',
      'Good for prepping for more than one person',
      'Cheap enough to keep many portions ready',
    ],
    watchOut: 'Large multipacks take cupboard space and can include mixed capacities.',
  },
  'harbour-housewares-glass-5-pack': {
    name: 'Harbour Housewares Glass Food Storage Containers',
    shortName: 'Harbour Housewares glass set',
    asin: 'B0DXQB6VPW',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'A balanced glass upgrade without paying premium-set prices',
    href: amazonProductUrl('Harbour-Housewares-Glass-Containers-Airtight', 'B0DXQB6VPW'),
    image: 'https://m.media-amazon.com/images/I/81mK-4MZ-XL._AC_SL1500_.jpg',
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
    asin: 'B081JQWZ7J',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'Leak-resistant glass lunches and oven-to-fridge meal prep',
    href: amazonProductUrl('PrepNaturals-Glass-Meal-Prep-Containers', 'B081JQWZ7J'),
    image: 'https://m.media-amazon.com/images/I/919s6bJjoWL._AC_SL1500_.jpg',
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
    name: 'Pyrex Freshlock Glass Storage Containers',
    shortName: 'Pyrex Freshlock glass',
    asin: 'B0BLPBV2MW',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'Brand-led glass lunches and leftovers with secure lids',
    href: amazonProductUrl('Pyrex-Freshlock-Glass-Storage-Containers', 'B0BLPBV2MW'),
    image: 'https://m.media-amazon.com/images/I/71ASFq5TvnL._AC_SL1500_.jpg',
    badge: 'Best brand confidence',
    summary:
      'A recognisable glass brand choice for buyers who value familiar lids, bases, and replacement options.',
    keyFeatures: [
      'Useful for reheating food away from home',
      'Good choice for stain-heavy meals',
      'Brand range usually includes multiple sizes',
    ],
    watchOut: 'Some branded glass sets are better for leftovers than identical meal-prep portions.',
  },
  'joyjolt-glass-storage': {
    name: 'BOROHOUSE 5-Pack Glass Storage Containers',
    shortName: 'BOROHOUSE 5-pack',
    asin: 'B0FFGWG4NH',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Borosilicate glass',
    bestFor: 'A compact glass set for weekday lunches and leftovers',
    href: amazonProductUrl('BOROHOUSE-5-Pack-Glass-Storage-Containers', 'B0FFGWG4NH'),
    image: 'https://m.media-amazon.com/images/I/716EF6j6r2L._AC_SL1500_.jpg',
    badge: 'Best compact glass set',
    summary:
      'A mid-range borosilicate glass set for buyers who want practical lunch boxes without a large 10-pack.',
    keyFeatures: [
      'Five-container format suits a working week',
      'Glass bases resist odours',
      'Useful if your current cupboard has no reliable lunch boxes',
    ],
    watchOut: 'Five packs are less flexible if you also prep breakfasts and snacks.',
  },
  'pyrex-cook-and-go': {
    name: 'Bayco Glass Meal Prep Containers',
    shortName: 'Bayco glass set',
    asin: 'B08DKDBY81',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'Batch-cooked lunches that need sturdy glass bases',
    href: amazonProductUrl('Bayco-Glass-Meal-Prep-Containers', 'B08DKDBY81'),
    image: 'https://m.media-amazon.com/images/I/81URaqmrQkL._AC_SL1500_.jpg',
    badge: 'Best sturdy feel',
    summary:
      'A mid-range glass set to compare when you want durability and matching lunch portions.',
    keyFeatures: [
      'Useful for reheating food away from home',
      'Glass bases resist staining from sauces',
      'Good alternative to Prep Naturals or Harbour Housewares',
    ],
    watchOut: 'Confirm lid care instructions; many glass sets require lid hand washing.',
  },
  'verones-divided-glass': {
    name: 'Susukkie Glass Food Storage Containers',
    shortName: 'Susukkie glass set',
    asin: 'B0DBGCLZ1K',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'Glass meal prep with mixed sizes for lunches and leftovers',
    href: amazonProductUrl('Susukkie-Glass-Food-Storage-Containers', 'B0DBGCLZ1K'),
    image: 'https://m.media-amazon.com/images/I/71bGQUg89NL._AC_SL1500_.jpg',
    badge: 'Best mixed glass option',
    summary:
      'A useful middle ground for buyers who want glass containers for lunches, sides, snacks, and leftovers.',
    keyFeatures: [
      'Mixed glass sizes cover more than lunch prep',
      'Glass resists staining better than plastic',
      'Good for curry, rice, salads, and reheated lunches',
    ],
    watchOut: 'Mixed sets may not give you five identical full-lunch containers.',
  },
  'borohouse-10-pack-glass': {
    name: 'BOROHOUSE 10-Pack Glass Storage Containers',
    shortName: 'BOROHOUSE 10-pack',
    asin: 'B0FFH1DW9W',
    priceBand: 'Premium: \u00a330+ target',
    material: 'Borosilicate glass',
    bestFor: 'A fuller glass setup for serious weekly meal prep',
    href: amazonProductUrl('BOROHOUSE-10-Pack-Glass-Storage-Containers', 'B0FFH1DW9W'),
    image: 'https://m.media-amazon.com/images/I/71umtWE-9mL._AC_SL1500_.jpg',
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
    name: 'Black+Blum Meal Prep Set',
    shortName: 'Black+Blum set',
    asin: 'B0BYPF5TV8',
    priceBand: 'Premium: \u00a330+ target',
    material: 'Stainless steel and glass mix',
    bestFor: 'Commuters who want a premium lunch setup',
    href: amazonProductUrl('Black-Blum-Meal-Prep-Set', 'B0BYPF5TV8'),
    image: 'https://m.media-amazon.com/images/I/710LgYRcuFL._AC_SL1500_.jpg',
    badge: 'Best premium commute pick',
    summary:
      'A premium route for buyers who want something more designed and durable than basic plastic tubs.',
    keyFeatures: [
      'Designed for repeat daily use',
      'Good-looking enough for desk lunches',
      'Useful when commuting experience matters as much as storage',
    ],
    watchOut: 'Check the live listing carefully for microwave guidance before reheating.',
  },
  'oxo-smart-seal-glass': {
    name: 'OXO Good Grips Smart Seal Glass Container Set',
    shortName: 'OXO Smart Seal',
    asin: 'B075GRTNN6',
    priceBand: 'Premium: \u00a330+ target',
    material: 'Glass',
    bestFor: 'Premium seals and mixed home storage',
    href: amazonProductUrl('OXO-Good-Grips-Container-4-Piece', 'B075GRTNN6'),
    image: 'https://m.media-amazon.com/images/I/71St+tcXeIL._AC_SL1500_.jpg',
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
    name: 'Rubbermaid Brilliance Storage Container Set',
    shortName: 'Rubbermaid Brilliance',
    asin: 'B08B7GLYZC',
    priceBand: 'Premium: \u00a330+ target',
    material: 'Plastic',
    bestFor: 'Leak-resistant premium leftovers and meal prep',
    href: amazonProductUrl('Rubbermaid-Brilliance-Storage-Container-Set', 'B08B7GLYZC'),
    image: 'https://m.media-amazon.com/images/I/81T0-lmYxPL._AC_SL1500_.jpg',
    badge: 'Best leak focus',
    summary:
      'A premium storage option to compare if your main frustration is weak lids or messy bags.',
    keyFeatures: [
      'Premium-style locking lids',
      'Clear bases for fridge visibility',
      'Good for sauces, leftovers, and batch cooking',
    ],
    watchOut: 'Premium mixed sets can cost more per lunch-sized container.',
  },
  'joseph-joseph-nest-lock': {
    name: 'Joseph Joseph Nest Lock Food Storage Set',
    shortName: 'Joseph Joseph Nest Lock',
    asin: 'B00IJBCBPE',
    priceBand: 'Premium: \u00a330+ target',
    material: 'Plastic',
    bestFor: 'Small kitchens where cupboard space matters',
    href: amazonProductUrl('Joseph-Nest-Lock-Storage-Containers', 'B00IJBCBPE'),
    image: 'https://m.media-amazon.com/images/I/81SwhLzNoIL._AC_SL1500_.jpg',
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
    name: 'Pyrex Freshlock 10-Piece Glass Storage Set',
    shortName: 'Pyrex Freshlock set',
    asin: 'B08V8CMQWS',
    priceBand: 'Premium: \u00a330+ target',
    material: 'Glass',
    bestFor: 'Brand-led premium glass storage with secure lids',
    href: amazonProductUrl('Pyrex-Freshlock-Glass-Storage-Containers', 'B08V8CMQWS'),
    image: 'https://images-na.ssl-images-amazon.com/images/P/B08V8CMQWS.01._SL1500_.jpg',
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
          'Choose rectangular containers where possible because they use fridge space better than round tubs. If you batch cook protein, rice, and vegetables separately, three-compartment boxes keep meals looking tidy. If you cook chilli, soup, or overnight oats, a high-count multipack can be more useful than a small premium set.',
          'For conversion-focused buying, the best budget offer is usually a multipack. A five-pack is enough for work lunches; a 20-pack or 50-pack is better if you freeze meals or prep for more than one person.',
        ],
      },
      {
        h2: 'Budget verdict',
        paragraphs: [
          'Pick divided plastic boxes if you want classic gym-style meal prep. Pick one-compartment boxes for flexible lunches. Pick a large multipack if you want one cheap storage refresh for the whole kitchen.',
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
        a: 'Some are leak-resistant, but very cheap hinged-lid boxes are rarely as reliable as clip-lock glass. Use tighter-seal containers for soup, chilli, and liquid-heavy meals.',
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
          'One-compartment glass containers are more flexible. They work for chilli, pasta, stir fry, curry, salad bowls, overnight oats, and leftovers. Mixed glass sets are better if you also want small tubs for snacks, sides, and sauces.',
          'If you only buy one set, choose rectangular one-compartment glass around the 900 ml to 1 litre mark. That size is the most reliable all-rounder for UK lunch meal prep.',
        ],
      },
      {
        h2: 'Mid range verdict',
        paragraphs: [
          'The Harbour Housewares-style five-pack is the natural place to start: enough containers for a work week, glass bases for reheating, and a sensible target price. Compare Prep Naturals, Pyrex, BOROHOUSE, Bayco, and mixed glass options before buying.',
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
          'The best premium choice is not always the most expensive. For serious home batch cooking, a larger borosilicate glass set is hard to beat. For commuting, a designed premium lunch kit can be more pleasant because it feels better to carry and eat from. For tiny kitchens, nesting plastic may be the most practical premium upgrade.',
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
          'For most committed meal preppers, the BOROHOUSE-style 10-pack glass route is the best overall premium setup. Compare Black+Blum if commuting experience matters, OXO or Rubbermaid if lid quality matters, Joseph Joseph if nesting storage matters, and Pyrex if you want a familiar long-term glass brand.',
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
