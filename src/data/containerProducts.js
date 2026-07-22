const STORE_TAG = 'amazonaf063dc-21';

function amazonProductUrl(slug, asin) {
  // Canonical minimal affiliate link: attribution is by tag alone. We drop the
  // SiteStripe linkCode/linkId pair rather than emit linkCode=ll2 with no
  // linkId, which is a malformed half-link.
  return `https://www.amazon.co.uk/${slug}/dp/${asin}?tag=${STORE_TAG}`;
}

export const AFFILIATE_DISCLOSURE =
  'As an Amazon Associate I earn from qualifying purchases. Product prices and availability can change on Amazon UK.';

export const CONTAINER_PRODUCTS = {
  'budget-compartment-50-pack': {
    name: 'Vinsani 3 Compartment Meal Prep Containers',
    shortName: 'Vinsani 20-pack',
    asin: 'B0DN32KNK3',
    priceBand: 'Budget: around \u00a315-\u00a325 target',
    material: 'Reusable plastic',
    bestFor: 'Bulk weekday lunches, freezer portions, and beginner meal prep',
    href: amazonProductUrl('Vinsani-Compartment-Containers-Reusable-Stackable', 'B0DN32KNK3'),
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
    name: 'Igluu Meal Prep Containers Reusable (10 Pack)',
    shortName: 'Igluu 10-pack',
    asin: 'B073N49WSY',
    priceBand: 'Budget: around \u00a315-\u00a325 target',
    material: 'BPA-free plastic',
    bestFor: 'Simple one-compartment lunches and stacked fridge storage',
    href: amazonProductUrl('Igluu-Containers-Reusable-Stackable-Dishwasher', 'B073N49WSY'),
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
    name: 'Harbour Housewares Reusable Meal Prep Containers',
    shortName: 'Harbour 10-pack',
    asin: 'B0H2HQBZ8S',
    priceBand: 'Budget: around \u00a315-\u00a325 target',
    material: 'BPA-free plastic',
    bestFor: 'Portion-controlled lunches where foods need to stay separate',
    href: amazonProductUrl('Harbour-Housewares-Reusable-Containers-Compartment', 'B0H2HQBZ8S'),
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
    name: 'Rubbermaid TakeAlongs On the Go Food Storage Containers',
    shortName: 'Rubbermaid On the Go',
    asin: 'B098KJHWVD',
    priceBand: 'Budget: around \u00a315-\u00a325 target',
    material: 'Plastic',
    bestFor: 'Cheap lunch boxes, leftovers, snacks, and flexible kitchen storage',
    href: amazonProductUrl('Rubbermaid-TakeAlongs-Storage-Containers-2115739', 'B098KJHWVD'),
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
    name: '10 Pack 3 Compartment Meal Prep Containers With Lids',
    shortName: '10-pack 3-comp',
    asin: 'B0GY1TXBRK',
    priceBand: 'Budget: around \u00a315-\u00a325 target',
    material: 'Plastic',
    bestFor: 'Macro-style portions where each food group stays separate',
    href: amazonProductUrl('Compartment-Meal-Prep-Containers-Lids', 'B0GY1TXBRK'),
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
    priceBand: 'Budget: around \u00a315-\u00a325 target',
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
    name: 'Harbour Housewares Glass Containers with Airtight Lids',
    shortName: 'Harbour 5-pack',
    asin: 'B0DXQ8WSRP',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'A balanced glass upgrade without paying premium-set prices',
    href: amazonProductUrl('Harbour-Housewares-Glass-Containers-Airtight', 'B0DXQ8WSRP'),
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
    name: 'MFY 5 Pack 36oz Glass Containers with Lids',
    shortName: 'MFY 5-pack',
    asin: 'B0F1YLJPL6',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'Leak-resistant glass lunches and oven-to-fridge meal prep',
    href: amazonProductUrl('MFY-Glass-Containers-Lids-Reusable', 'B0F1YLJPL6'),
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
    name: 'Borosilicate Glass Food Storage Containers with Clip Lids (5 Pack)',
    shortName: '5-pack borosilicate set',
    asin: 'B06Y31WGWR',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Borosilicate glass',
    bestFor: 'A compact glass set for weekday lunches and leftovers',
    href: amazonProductUrl('5-Pack-Food-storage-glass-containers', 'B06Y31WGWR'),
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
    name: 'Glass Meal Prep & Food Storage Containers with Lids (5 Pack)',
    shortName: '5-pack glass prep set',
    asin: 'B07JK1LGHQ',
    priceBand: 'Mid range: \u00a315-\u00a330 target',
    material: 'Glass',
    bestFor: 'Batch-cooked lunches that need sturdy glass bases',
    href: amazonProductUrl('5-Pack-Food-storage-glass-containers', 'B07JK1LGHQ'),
    image: 'https://m.media-amazon.com/images/I/916+D-0w5cL._AC_UL320_.jpg',
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
    material: 'Premium plastic (leak-focused)',
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

const CONTAINER_PRODUCT_DETAILS = {
  'budget-compartment-50-pack': {
    setSize: '20 pack',
    layout: '3 compartments',
    sealType: 'Press-on plastic lids',
    reheatFit: 'Best for microwave reheating with lid removed if the listing permits',
    storageFit: 'Excellent for freezer batches and high-volume prep',
    buyIf: 'You want the lowest cost per usable lunch tub.',
    avoidIf: 'You want a premium eating experience or stain-resistant bases.',
    pros: ['Strong container count', 'Clear portion sections', 'Good for freezer rotation'],
    cons: ['Can stain with tomato or curry', 'Still takes cupboard space'],
  },
  'bentgo-prep-10-pack': {
    setSize: '10 pack',
    layout: '1 compartment',
    sealType: 'Clip-style plastic lids',
    reheatFit: 'Good for simple lunches; check live listing before reheating',
    storageFit: 'Stacks neatly for fridge lunches',
    buyIf: 'You prefer one flexible compartment for pasta, chilli, curry or salads.',
    avoidIf: 'You want rice, protein and vegetables kept separate.',
    pros: ['Simple open layout', 'Good starter quantity', 'Easy fridge stacking'],
    cons: ['No dividers', 'Plastic can mark over time'],
  },
  'sistema-klip-it': {
    setSize: '10 pack',
    layout: '3 compartments',
    sealType: 'Clip-style plastic lids',
    reheatFit: 'Useful for portioned lunches; follow listing guidance',
    storageFit: 'Good for fridge stacks and calorie-controlled lunches',
    buyIf: 'You want budget portion control without glass weight.',
    avoidIf: 'You batch cook soups, pasta bakes or large one-pot meals.',
    pros: ['Three-section layout', 'Good for macro-style meals', 'Light enough to commute with'],
    cons: ['Less flexible than one-compartment tubs', 'Sauces can be awkward across dividers'],
  },
  'amazon-basics-plastic-set': {
    setSize: '4 pack',
    layout: '1 compartment',
    sealType: 'Flexible plastic lids',
    reheatFit: 'Better for leftovers and snacks than heavy daily reheating',
    storageFit: 'Good simple lunch-and-leftover starter set',
    buyIf: 'You need cheap containers for lunches, snacks and leftovers.',
    avoidIf: 'You want five identical meal-prep lunches.',
    pros: ['Low upfront cost', 'Useful mixed sizes', 'Good for general storage'],
    cons: ['Less structured for weekly lunches', 'Not as robust as glass'],
  },
  'freshware-3-compartment': {
    setSize: 'Multipack',
    layout: '3 compartments',
    sealType: 'Press-on plastic lids',
    reheatFit: 'Best for balanced plate lunches; check live listing for microwave guidance',
    storageFit: 'Good for stacked gym-style prep',
    buyIf: 'You want a predictable protein, carb and vegetable layout.',
    avoidIf: 'You prefer saucy one-pot meals.',
    pros: ['Clear macro layout', 'Often good value per tub', 'Simple weekly portioning'],
    cons: ['Dividers reduce capacity flexibility', 'Plastic can stain'],
  },
  'deli-twist-lid-tubs': {
    setSize: '100-piece style multipack',
    layout: 'Mixed plastic tubs',
    sealType: 'Plastic lids',
    reheatFit: 'Better for storage and freezer portions than premium reheating',
    storageFit: 'Strong for shared households and bulk cooking',
    buyIf: 'You batch cook for more than one person or freeze many portions.',
    avoidIf: 'You only need a tidy five-day work lunch set.',
    pros: ['Huge storage coverage', 'Useful for freezer batches', 'Good shared-house option'],
    cons: ['Needs cupboard space', 'Mixed sizes can be less tidy'],
  },
  'harbour-housewares-glass-5-pack': {
    setSize: '5 pack',
    layout: '1 compartment',
    sealType: 'Airtight-style clip lids',
    reheatFit: 'Glass bases are a strong fit for reheated lunches; remove lids',
    storageFit: 'Best all-round workweek glass setup',
    buyIf: 'You want one sensible glass lunch box for each weekday.',
    avoidIf: 'You commute with several meals at once and need lightweight tubs.',
    pros: ['Good workweek format', 'Glass resists stains', 'Strong mid-range value signal'],
    cons: ['Heavier than plastic', 'Only five containers'],
  },
  'prep-naturals-glass-5-pack': {
    setSize: '5 pack',
    layout: '1 compartment or divided depending on listing',
    sealType: 'Clip-lock lids',
    reheatFit: 'Good glass-base reheating option; verify exact listing format',
    storageFit: 'Good for a five-lunch routine',
    buyIf: 'You want a well-known glass meal prep style.',
    avoidIf: 'You need mixed sizes for snacks and leftovers too.',
    pros: ['Recognisable glass format', 'Good stain resistance', 'Lunch-friendly shape'],
    cons: ['Listing variants can differ', 'Less flexible than a mixed set'],
  },
  'm-mcirco-glass-5-pack': {
    setSize: 'Mixed or multi-piece glass set',
    layout: 'Mixed glass storage',
    sealType: 'Clip-lock lids',
    reheatFit: 'Strong for reheating leftovers and lunches; remove lids',
    storageFit: 'Good brand-led kitchen storage',
    buyIf: 'You want familiar glass storage from a recognised brand.',
    avoidIf: 'You want identical lunch portions only.',
    pros: ['Trusted brand feel', 'Good for leftovers', 'Useful range ecosystem'],
    cons: ['May be more storage set than meal-prep set', 'Sizes vary by listing'],
  },
  'joyjolt-glass-storage': {
    setSize: '5 pack',
    layout: '1 compartment',
    sealType: 'Clip-lock lids',
    reheatFit: 'Good for compact glass lunch reheating; remove lids',
    storageFit: 'Good for smaller kitchens',
    buyIf: 'You want a compact glass set without buying a large pack.',
    avoidIf: 'You prep lunches, dinners and snacks together.',
    pros: ['Compact five-pack', 'Glass resists odour', 'Good workweek size'],
    cons: ['Limited total capacity', 'Less useful for family prep'],
  },
  'pyrex-cook-and-go': {
    setSize: 'Glass multipack',
    layout: '1 compartment',
    sealType: 'Clip-lock lids',
    reheatFit: 'Good for sturdy reheated lunches; remove lids',
    storageFit: 'Strong for batch-cooked lunches',
    buyIf: 'You want a durable-feeling glass alternative to the main five-packs.',
    avoidIf: 'You mainly carry food on foot and need very light boxes.',
    pros: ['Sturdy glass feel', 'Good for sauces', 'Useful rectangular format'],
    cons: ['Heavier than plastic', 'Lid care matters'],
  },
  'verones-divided-glass': {
    setSize: 'Mixed glass set',
    layout: 'Mixed sizes',
    sealType: 'Clip-lock lids',
    reheatFit: 'Good for reheating varied portions; remove lids',
    storageFit: 'Good for lunches, sides and leftovers',
    buyIf: 'You want glass containers for more than just weekday lunches.',
    avoidIf: 'You want five identical full-meal containers.',
    pros: ['Flexible mixed sizing', 'Stain-resistant bases', 'Good side-container coverage'],
    cons: ['Less uniform in the fridge', 'May include smaller containers than expected'],
  },
  'borohouse-10-pack-glass': {
    setSize: '10 pack',
    layout: 'Mixed glass storage',
    sealType: 'Clip-lock lids',
    reheatFit: 'Strong for weekly reheating; remove lids',
    storageFit: 'Excellent for full-week glass meal prep',
    buyIf: 'You want one larger glass system for lunches, dinners and leftovers.',
    avoidIf: 'You have limited cupboard space or only need lunch boxes.',
    pros: ['Full-week coverage', 'Borosilicate glass signal', 'Good for freezer and fridge organisation'],
    cons: ['Heavy as a full set', 'Takes more storage space'],
  },
  'black-blum-stainless-set': {
    setSize: 'Premium lunch set',
    layout: 'Designed lunch containers',
    sealType: 'Premium fitted lids',
    reheatFit: 'Check the live listing carefully for microwave guidance',
    storageFit: 'Best for desk lunches and commuting',
    buyIf: 'You care about carrying and eating experience as much as storage.',
    avoidIf: 'You want the cheapest cost per portion.',
    pros: ['Premium daily-use feel', 'Good desk-lunch presentation', 'Durable design focus'],
    cons: ['Higher upfront cost', 'Reheating rules need checking'],
  },
  'oxo-smart-seal-glass': {
    setSize: 'Mixed glass set',
    layout: 'Mixed sizes',
    sealType: 'Smart-seal clip lids',
    reheatFit: 'Good glass reheating option; remove lids',
    storageFit: 'Best for seal quality and leftovers',
    buyIf: 'Leaky lids are your main frustration.',
    avoidIf: 'You only want matching lunch-size containers.',
    pros: ['Strong seal reputation', 'Useful mixed sizes', 'Premium kitchen feel'],
    cons: ['Less efficient for five identical lunches', 'Premium price per container'],
  },
  'rubbermaid-brilliance-glass': {
    setSize: 'Premium mixed set',
    layout: 'Mixed storage',
    sealType: 'Leak-focused locking lids',
    reheatFit: 'Good for leftovers and saucy meals; follow listing guidance',
    storageFit: 'Best for leak resistance and visibility',
    buyIf: 'You carry saucy meals or hate uncertain lids.',
    avoidIf: 'You specifically want glass bases for every meal.',
    pros: ['Leak-focused design', 'Clear fridge visibility', 'Premium storage feel'],
    cons: ['May be plastic depending on exact listing', 'Can cost more per meal-size tub'],
  },
  'joseph-joseph-nest-lock': {
    setSize: 'Nested mixed set',
    layout: 'Mixed nesting sizes',
    sealType: 'Locking plastic lids',
    reheatFit: 'Better for storage and mixed leftovers than heavy reheating',
    storageFit: 'Best for small kitchens',
    buyIf: 'Cupboard space is your biggest problem.',
    avoidIf: 'You want glass for tomato-heavy reheating.',
    pros: ['Space-saving nested design', 'Easy lid matching', 'Useful mixed sizes'],
    cons: ['Still plastic', 'Not optimised for five identical lunches'],
  },
  'pyrex-freshlock-large-set': {
    setSize: '10-piece glass set',
    layout: 'Mixed glass storage',
    sealType: 'Freshlock clip lids',
    reheatFit: 'Good brand-led glass reheating option; remove lids',
    storageFit: 'Strong for long-term kitchen storage',
    buyIf: 'You want a familiar glass brand for a full storage refresh.',
    avoidIf: 'You need the lowest price or the lightest commute option.',
    pros: ['Recognisable Pyrex brand', 'Good mixed storage coverage', 'Long-term glass upgrade'],
    cons: ['Sizes vary by set', 'May be more than one person needs'],
  },
};

export function getContainerProduct(productId) {
  const product = CONTAINER_PRODUCTS[productId];
  if (!product) return null;
  return { id: productId, ...product, ...(CONTAINER_PRODUCT_DETAILS[productId] || {}) };
}

const LONG_TAIL_CONTAINER_GUIDES = {
  glass: {
    slug: 'glass',
    path: '/meal-prep-containers/glass',
    title: 'Glass Meal Prep Containers UK - Best Sets for Lunches and Reheating',
    description:
      'Compare glass meal prep containers UK: five-pack lunch boxes, mixed glass storage sets and larger freezer-friendly glass systems with Amazon UK picks.',
    h1: 'Glass Meal Prep Containers UK',
    kicker: 'Glass container guide',
    priceBand: 'Glass and borosilicate picks',
    summaryText:
      'Compare six glass-focused Amazon UK picks for work lunches, reheating, stain resistance and fuller weekly prep.',
    heroProductId: 'harbour-housewares-glass-5-pack',
    heroImage: '/meal-containers-ad.jpg',
    intro:
      'Glass meal prep containers are the cleanest upgrade when plastic tubs are staining, smelling, or feeling flimsy after repeated reheating. Start with five lunch-sized boxes if you mainly prep work lunches, then move to a larger glass set when you prep lunches, dinners and leftovers together.',
    productIds: [
      'harbour-housewares-glass-5-pack',
      'prep-naturals-glass-5-pack',
      'joyjolt-glass-storage',
      'm-mcirco-glass-5-pack',
      'verones-divided-glass',
      'borohouse-10-pack-glass',
    ],
    sections: [
      {
        h2: 'Who should buy glass meal prep containers?',
        paragraphs: [
          'Choose glass if you regularly reheat curry, chilli, pasta sauce, tomato dishes or stews. Glass bases resist stains and odours better than plastic, and they feel better to eat from when lunch is part of your everyday routine.',
          'The trade-off is weight. If you carry several meals on foot, buy one glass work-lunch set and keep plastic or silicone bags for freezer overflow.',
        ],
      },
      {
        h2: 'Best glass size for UK meal prep',
        paragraphs: [
          'For most lunches, aim for roughly 900ml to 1 litre. Smaller glass tubs are useful for snacks, sauces and overnight oats, but they are not reliable full-meal containers.',
          'Mixed glass sets are useful when you want leftovers and batch sauces covered too, but five identical lunch boxes are easier to stack and repeat every week.',
        ],
      },
      {
        h2: 'Glass container verdict',
        paragraphs: [
          'Start with a five-pack rectangular glass set for work lunches. Choose a larger 10-piece glass system only when you already prep lunches, dinners and freezer portions in the same week.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are glass meal prep containers worth it?',
        a: 'Yes, if you reheat food often or cook tomato-heavy meals. Glass costs more and weighs more than plastic, but it usually lasts longer and stains less.',
      },
      {
        q: 'Can glass meal prep containers go in the microwave?',
        a: 'Most glass bases are microwave suitable, but lids usually need to be removed. Always follow the live Amazon listing and product instructions before reheating.',
      },
      {
        q: 'How many glass meal prep containers do I need?',
        a: 'Five lunch-sized glass boxes is the best starting point for one person. Ten pieces is better if you prep lunches, dinners and leftovers together.',
      },
    ],
  },
  plastic: {
    slug: 'plastic',
    path: '/meal-prep-containers/plastic',
    title: 'Plastic Meal Prep Containers UK - Cheap Tubs, 10 Packs and Bulk Sets',
    description:
      'Compare plastic meal prep containers UK: cheap tubs, 10-packs, divided lunch boxes and bulk freezer sets with Amazon UK affiliate picks.',
    h1: 'Plastic Meal Prep Containers UK',
    kicker: 'Plastic container guide',
    priceBand: 'Budget plastic and bulk packs',
    summaryText:
      'Compare plastic Amazon UK picks for low cost, light commuting, divided portions and high-volume freezer prep.',
    heroProductId: 'budget-compartment-50-pack',
    heroImage: '/budget-containers-ad.jpg',
    intro:
      'Plastic meal prep containers are the practical route when you need lots of boxes quickly. They are light, cheap and easy to stack, which makes them useful for beginners, students, family batch cooking and freezer portions.',
    productIds: [
      'budget-compartment-50-pack',
      'bentgo-prep-10-pack',
      'sistema-klip-it',
      'freshware-3-compartment',
      'amazon-basics-plastic-set',
      'deli-twist-lid-tubs',
    ],
    sections: [
      {
        h2: 'Who should buy plastic meal prep containers?',
        paragraphs: [
          'Plastic is best when cost per tub matters more than premium feel. It works well for beginner meal prep, work lunches carried in a bag, freezer portions and kitchens that need many spare tubs.',
          'Avoid relying only on plastic if you reheat tomato sauce, curry or turmeric-heavy meals every day. Those dishes can stain cheaper bases over time.',
        ],
      },
      {
        h2: 'Divided or one-compartment plastic boxes?',
        paragraphs: [
          'Choose divided boxes for protein, carbs and vegetables when you want simple portion control. Choose one-compartment boxes for pasta, chilli, curry, salads and one-pot meals.',
          'Bulk multipacks are useful if you freeze meals or cook for more than one person, but they need cupboard space and can create lid clutter if the sizes are too mixed.',
        ],
      },
      {
        h2: 'Plastic container verdict',
        paragraphs: [
          'Buy plastic when you want volume, low weight and low upfront cost. Upgrade only the meals you reheat most often to glass once the habit is established.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are plastic meal prep containers safe?',
        a: 'Use containers sold as food-safe and follow the listing guidance for microwave, freezer and dishwasher use. Remove lids when required and replace tubs that warp or crack.',
      },
      {
        q: 'Are plastic meal prep tubs leakproof?',
        a: 'Some are leak-resistant, but cheap press-on lids are not as reliable as clip-lock or twist-lid designs for soup, chilli and sauce-heavy meals.',
      },
      {
        q: 'Should I buy 10, 20 or 50 plastic containers?',
        a: 'Ten is enough for one person testing meal prep. Twenty suits lunches and freezer rotation. Very large packs are best for family batch cooking or shared households.',
      },
    ],
  },
  leakproof: {
    slug: 'leakproof',
    path: '/meal-prep-containers/leakproof',
    title: 'Leakproof Meal Prep Containers UK - Best Lunch Boxes for Saucy Meals',
    description:
      'Compare leakproof meal prep containers UK for commuting, soup, chilli, curry and saucy work lunches with Amazon UK picks and lid-fit notes.',
    h1: 'Leakproof Meal Prep Containers UK',
    kicker: 'Leakproof buying guide',
    priceBand: 'Leak-resistant lunch boxes',
    summaryText:
      'Compare containers with stronger lid designs for commuting, sauces, soup-style meals and bag-friendly lunches.',
    heroProductId: 'rubbermaid-brilliance-glass',
    heroImage: '/meal-containers-ad.jpg',
    intro:
      'Leakproof meal prep containers matter most when food travels. If you carry chilli, curry, salad dressing, soup-style meals or overnight oats, lid reliability is more important than a big box count.',
    productIds: [
      'rubbermaid-brilliance-glass',
      'harbour-housewares-glass-5-pack',
      'prep-naturals-glass-5-pack',
      'oxo-smart-seal-glass',
      'deli-twist-lid-tubs',
      'black-blum-stainless-set',
    ],
    sections: [
      {
        h2: 'Who should buy leakproof containers?',
        paragraphs: [
          'Choose this page if you commute with food, carry meals in a gym bag, pack salad dressing or prep saucy meals. A stronger lid can matter more than material.',
          'For soup and liquid-heavy meals, test any new container with water over the sink before trusting it in a work bag.',
        ],
      },
      {
        h2: 'What makes a container leak resistant?',
        paragraphs: [
          'Look for clip-lock lids, twist lids, silicone seals and clear listing claims about leak resistance. Press-on budget lids are fine for dry meals, but they are not the safest choice for sauces.',
          'Glass bases help with reheating and stain resistance, while premium plastic can be lighter for commuting.',
        ],
      },
      {
        h2: 'Leakproof verdict',
        paragraphs: [
          'Buy fewer, better-sealed containers for travel meals. Keep cheap tubs for dry freezer portions and use the stronger lid set for anything that could spill.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are leakproof meal prep containers really leakproof?',
        a: 'Treat leakproof as leak-resistant until you have tested the container. Fill it with water, close it, shake gently and check the seal before commuting.',
      },
      {
        q: 'Are glass containers better for leakproof lunches?',
        a: 'Glass is better for reheating and stain resistance, but the lid design decides leak resistance. A good plastic clip-lock lid can beat a weak glass lid.',
      },
      {
        q: 'What containers are best for soup?',
        a: 'Use twist-lid tubs, premium clip-lock containers or products that explicitly mention liquid storage. Avoid shallow divided lunch boxes for soup.',
      },
    ],
  },
  'freezer-safe': {
    slug: 'freezer-safe',
    path: '/meal-prep-containers/freezer-safe',
    title: 'Freezer Safe Meal Prep Containers UK - Best Tubs for Batch Cooking',
    description:
      'Compare freezer safe meal prep containers UK: plastic tubs, glass sets and bulk multipacks for batch cooking, leftovers and freezer rotation.',
    h1: 'Freezer Safe Meal Prep Containers UK',
    kicker: 'Freezer container guide',
    priceBand: 'Freezer and batch-cooking picks',
    summaryText:
      'Compare freezer-friendly container sets for bulk cooking, leftovers, sauces and weekly portion rotation.',
    heroProductId: 'deli-twist-lid-tubs',
    heroImage: '/budget-containers-ad.jpg',
    intro:
      'Freezer-safe meal prep containers are best when you cook in batches and rotate portions through the week. The right set should stack neatly, label easily and avoid wasting freezer space.',
    productIds: [
      'deli-twist-lid-tubs',
      'budget-compartment-50-pack',
      'borohouse-10-pack-glass',
      'harbour-housewares-glass-5-pack',
      'pyrex-freshlock-large-set',
      'rubbermaid-brilliance-glass',
    ],
    sections: [
      {
        h2: 'Who should buy freezer-safe containers?',
        paragraphs: [
          'Choose freezer-focused containers if you batch cook chilli, curry, stew, soup, mince, rice or family portions. You need enough boxes to freeze meals without blocking your lunch routine.',
          'A large multipack makes sense when the freezer is the main storage location. For reheating straight from chilled meals, glass may be the better everyday set.',
        ],
      },
      {
        h2: 'What to look for in freezer containers',
        paragraphs: [
          'Choose stackable shapes with lids that do not pop off when food expands. Leave headroom for liquids and label dates so freezer portions do not become mystery meals.',
          'Rectangular boxes save space better than round tubs, but twist-lid tubs can be better for sauces, soup-style portions and overnight oats.',
        ],
      },
      {
        h2: 'Freezer-safe verdict',
        paragraphs: [
          'Use cheap plastic or twist-lid tubs for freezer volume, then keep a smaller glass set for the meals you reheat and eat most often.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can glass meal prep containers go in the freezer?',
        a: 'Many glass containers can go in the freezer, but you should follow the product instructions, avoid overfilling liquids and let hot food cool before freezing.',
      },
      {
        q: 'Are plastic containers better for freezer meal prep?',
        a: 'Plastic is lighter and cheaper for large freezer batches. Glass is better if you want to reheat and eat from the same container.',
      },
      {
        q: 'How many freezer containers do I need?',
        a: 'For one person, ten containers is a useful freezer rotation. Families or bulk cooks may need twenty or more, especially if freezing lunches and dinners.',
      },
    ],
  },
  'work-lunch': {
    slug: 'work-lunch',
    path: '/meal-prep-containers/work-lunch',
    title: 'Meal Prep Boxes for Work UK - Best Lunch Containers to Compare',
    description:
      'Compare meal prep boxes for work UK: glass lunch containers, light plastic boxes and premium commute-friendly sets with Amazon UK picks.',
    h1: 'Meal Prep Boxes for Work UK',
    kicker: 'Work lunch guide',
    priceBand: 'Work lunch containers',
    summaryText:
      'Compare lunch-friendly containers for office reheating, commuting, fridge stacking and five-day work prep.',
    heroProductId: 'harbour-housewares-glass-5-pack',
    heroImage: '/meal-containers-ad.jpg',
    intro:
      'Meal prep boxes for work should be easy to carry, easy to stack in a fridge and simple to reheat. The best starting point is usually five rectangular lunch containers around 900ml to 1 litre.',
    productIds: [
      'harbour-housewares-glass-5-pack',
      'prep-naturals-glass-5-pack',
      'bentgo-prep-10-pack',
      'sistema-klip-it',
      'black-blum-stainless-set',
      'joyjolt-glass-storage',
    ],
    sections: [
      {
        h2: 'What makes a good work lunch box?',
        paragraphs: [
          'A good work lunch box fits one full meal without forcing tiny portions, stacks neatly in a shared fridge and has a lid you trust in your bag.',
          'Glass is better when you microwave lunch at work. Plastic is better when weight matters or you carry several meals at once.',
        ],
      },
      {
        h2: 'Best size for work lunches',
        paragraphs: [
          'Aim for roughly 900ml to 1 litre for most lunches. Smaller containers are useful for snacks, sauces and fruit, but they are not a full lunch for most people.',
          'If you prep five lunches on Sunday, matching boxes save more time than mixed sets because lids are easier to pair and fridge stacks stay tidy.',
        ],
      },
      {
        h2: 'Work lunch verdict',
        paragraphs: [
          'Start with five matching rectangular containers. Choose glass if the office microwave matters, or plastic if your commute is long and weight matters more.',
        ],
      },
    ],
    faq: [
      {
        q: 'What size meal prep box is best for work?',
        a: 'Most people should start around 900ml to 1 litre. That size suits rice bowls, pasta, curry, chilli, salads and leftovers without making portions too small.',
      },
      {
        q: 'Are glass lunch boxes too heavy for work?',
        a: 'One glass lunch box is usually manageable, but several glass containers can be heavy. Use plastic if you carry multiple meals on foot.',
      },
      {
        q: 'How many work lunch containers should I buy?',
        a: 'Five matching lunch containers is the cleanest starting point for a Monday to Friday routine. Add small sauce tubs later if you need them.',
      },
    ],
  },
  'large-sets': {
    slug: 'large-sets',
    path: '/meal-prep-containers/large-sets',
    title: 'Large Meal Prep Container Sets UK - 10 Pack, 20 Pack and Bulk Boxes',
    description:
      'Compare large meal prep container sets UK: 10-pack glass systems, 20-pack plastic boxes and bulk multipacks for serious weekly prep.',
    h1: 'Large Meal Prep Container Sets UK',
    kicker: 'Large set guide',
    priceBand: '10 pack, 20 pack and bulk sets',
    summaryText:
      'Compare larger Amazon UK container sets for lunches, dinners, family prep and freezer rotation.',
    heroProductId: 'borohouse-10-pack-glass',
    heroImage: '/meal-containers-ad.jpg',
    intro:
      'Large meal prep container sets are for people who already cook in bulk. They make sense when five lunch boxes are not enough and you need coverage for dinners, leftovers, snacks or freezer portions too.',
    productIds: [
      'borohouse-10-pack-glass',
      'budget-compartment-50-pack',
      'deli-twist-lid-tubs',
      'pyrex-freshlock-large-set',
      'verones-divided-glass',
      'joseph-joseph-nest-lock',
    ],
    sections: [
      {
        h2: 'Who should buy a large container set?',
        paragraphs: [
          'Choose a large set if you prep lunches and dinners, batch cook for a household, or freeze several portions every week. If you only prep work lunches, a five-pack is usually cleaner and cheaper.',
          'Large sets can solve the problem of never having the right box available, but they can also create cupboard clutter if sizes are too mixed.',
        ],
      },
      {
        h2: '10 pack, 20 pack or bulk multipack?',
        paragraphs: [
          'A 10-pack glass set is the best premium route for lunches, dinners and leftovers. A 20-pack plastic set is better for low-cost weekday prep. A very large multipack is best for freezer rotation or shared households.',
          'Before buying a large set, check whether the containers are identical, mixed sizes or counted as pieces including lids.',
        ],
      },
      {
        h2: 'Large set verdict',
        paragraphs: [
          'Buy a large set only when you know the weekly routine needs it. Otherwise, start with five lunch containers and add freezer tubs as the habit grows.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is a 10-pack meal prep container set enough?',
        a: 'A 10-pack is enough for most single-person lunch and dinner prep. Families and freezer-heavy batch cooks may need more.',
      },
      {
        q: 'Are large glass container sets worth it?',
        a: 'They are worth it if you prep every week and reheat often. They are not ideal if cupboard space is tight or you only need work lunches.',
      },
      {
        q: 'Do container set counts include lids?',
        a: 'Some listings count lids as pieces, so a 20-piece set may mean ten containers and ten lids. Always check the live Amazon listing before buying.',
      },
    ],
  },
};

export const CONTAINER_GUIDES = {
  budget: {
    slug: 'budget',
    path: '/meal-prep-containers/budget',
    title: 'Budget Meal Prep Containers UK - Best Plastic Tubs & Boxes',
    description:
      'Compare budget meal prep containers UK: cheap plastic tubs, lunch boxes and batch-cooking multipacks with Amazon UK affiliate links and buyer-fit notes.',
    h1: 'Budget Meal Prep Containers UK',
    kicker: 'Budget buying guide',
    priceBand: 'Around \u00a315-\u00a325 target',
    heroProductId: 'budget-compartment-50-pack',
    heroImage: '/budget-containers-ad.jpg',
    intro:
      'Budget meal prep containers are best when you need a lot of plastic tubs quickly: weekday lunches, freezer portions, student cooking, or a first attempt at batch cooking. Prioritise quantity, stackability, and sensible lid fit over premium materials, and check the live Amazon price before buying.',
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
        h2: 'What to look for around \u00a315-\u00a325',
        paragraphs: [
          'Choose rectangular containers where possible because they use fridge space better than round tubs. If you batch cook protein, rice, and vegetables separately, three-compartment boxes keep meals looking tidy. If you cook chilli, soup, or overnight oats, a high-count multipack can be more useful than a small premium set.',
          'For conversion-focused buying, the best budget offer is usually a multipack. A five-pack is enough for work lunches; a 20-pack or 50-pack can justify a higher checkout price when the cost per container stays low.',
        ],
      },
      {
        h2: 'Budget verdict',
        paragraphs: [
          'Pick divided plastic boxes if you want classic gym-style meal prep. Pick one-compartment boxes for flexible lunches. Pick a large multipack if you want a low-cost storage refresh for the whole kitchen.',
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
    title: 'Best Meal Prep Containers UK - Glass, Plastic & Leakproof Picks',
    description:
      'Compare the best meal prep containers UK for everyday use, including glass boxes, leakproof lunch tubs, work containers and Amazon UK picks.',
    h1: 'Best Mid Range Meal Prep Containers UK',
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
    title: 'Premium Meal Prep Containers UK - Glass, Steel & Leakproof Sets',
    description:
      'Compare premium meal prep containers UK: larger glass sets, stainless steel lunch kits, leakproof boxes, nesting storage and Amazon UK picks.',
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
  ...LONG_TAIL_CONTAINER_GUIDES,
};

export const CONTAINER_GUIDE_GROUPS = [
  {
    label: 'Price bands',
    guides: [
      { slug: 'budget', label: 'Budget' },
      { slug: 'mid-range', label: 'Mid range' },
      { slug: 'premium', label: 'Premium' },
    ],
  },
  {
    label: 'Materials',
    guides: [
      { slug: 'glass', label: 'Glass' },
      { slug: 'plastic', label: 'Plastic' },
    ],
  },
  {
    label: 'Buyer needs',
    guides: [
      { slug: 'leakproof', label: 'Leakproof' },
      { slug: 'freezer-safe', label: 'Freezer safe' },
      { slug: 'work-lunch', label: 'Work lunches' },
      { slug: 'large-sets', label: 'Large sets' },
    ],
  },
];

export const CONTAINER_GUIDE_SLUGS = Object.keys(CONTAINER_GUIDES);

export function getContainerProducts(productIds) {
  return productIds.map(getContainerProduct).filter(Boolean);
}
