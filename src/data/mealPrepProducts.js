// Generic (non-container) product catalogue for meal prep tools and cookbooks:
// slow cookers, rice cookers, kitchen scales, blenders, freezer bags, vacuum
// sealers and cookbooks. Every ASIN below was verified against a live Amazon
// UK listing before being added here. Uses the same affiliate tag and URL
// pattern as src/data/containerProducts.js.
const STORE_TAG = 'amazonaff01d8-21';

function amazonProductUrl(slug, asin) {
  return `https://www.amazon.co.uk/${slug}/dp/${asin}?tag=${STORE_TAG}&linkCode=ll2`;
}

export const AFFILIATE_DISCLOSURE =
  'As an Amazon Associate I earn from qualifying purchases. Product prices and availability can change on Amazon UK.';

export const MEALPREP_PRODUCTS = {
  'crockpot-3-5l-red': {
    name: 'Crock-Pot Slow Cooker, 3.5L',
    category: 'Slow cooker',
    priceBand: 'Budget-to-mid range',
    bestFor: 'A standard household batch cooking stews, curries and casseroles',
    summary: 'The classic entry-level Crock-Pot: two heat settings, a removable ceramic bowl for easy cleaning, and a size that suits most households cooking 3-5 portions at once.',
    href: amazonProductUrl('Crock-Pot-Slow-Cooker-3-5-Red', 'B007XEJ322'),
    watchOut: 'No timer or digital display on this entry model, so you set it and check back manually.',
  },
  'crockpot-2-4l-compact': {
    name: 'Crock-Pot Slow Cooker, 2.4L (Black)',
    category: 'Slow cooker',
    priceBand: 'Budget',
    bestFor: '1-2 people, smaller kitchens, energy-efficient small batches',
    summary: 'A compact Crock-Pot sized for one or two people, with a keep-warm function so batch-cooked portions do not overcook while you are out.',
    href: amazonProductUrl('Crock-Pot-CSC046-Cooker-Stoneware-liters', 'B0716XV7VM'),
    watchOut: 'Too small for weekly batch cooking for a family; pair it with freezer portioning if you want to build up a stock of meals.',
  },
  'russell-hobbs-rice-cooker': {
    name: 'Russell Hobbs Electric Rice Cooker, 27030',
    category: 'Rice cooker',
    priceBand: 'Budget',
    bestFor: 'Simple, reliable rice batches for meal prep, around 6 portions',
    summary: 'A straightforward one-button rice cooker with a removable non-stick bowl and steamer basket, sized for a realistic weekly rice batch.',
    href: amazonProductUrl('Russell-Hobbs-27030-Medium-Cooker', 'B083V96Q9G'),
    watchOut: 'Basic model without a delay timer; best for cooking rice in one go rather than scheduling ahead.',
  },
  'cosori-rice-cooker-steamer': {
    name: 'COSORI Rice Cooker, Slow Cooker & Steamer, 5L',
    category: 'Rice cooker',
    priceBand: 'Mid range',
    bestFor: 'People who want one appliance that covers rice, steaming and slow cooking',
    summary: 'A larger multi-function cooker with fuzzy logic temperature control, useful if you want a single appliance covering rice, steamed vegetables and slow cooking.',
    href: amazonProductUrl('COSORI-Steamer-Ceramic-Capacity-Functions', 'B0BZY2HGW1'),
    watchOut: 'Larger footprint than a dedicated rice cooker, so check you have the counter or cupboard space.',
  },
  'salter-arc-scale': {
    name: 'Salter Arc Digital Kitchen Scale',
    category: 'Kitchen scale',
    priceBand: 'Budget',
    bestFor: 'Weighing portions accurately for calorie or macro tracking',
    summary: 'A slim, add-and-weigh digital scale with a 3kg capacity, useful for portioning rice, protein and vegetables precisely rather than guessing by eye.',
    href: amazonProductUrl('Salter-Arc-Digital-Kitchen-Scales', 'B00140VYEG'),
    watchOut: 'No liquid measurement mode; for sauces and liquids, a scale with an Aquatronic function is more useful.',
  },
  'salter-disc-scale': {
    name: 'Salter Disc Digital Kitchen Scale',
    category: 'Kitchen scale',
    priceBand: 'Budget',
    bestFor: 'Weighing both solids and liquids for recipes and portioning',
    summary: 'A 5kg-capacity scale with a liquid measurement mode, useful if your meal prep routine involves sauces, marinades or oils as well as solid portions.',
    href: amazonProductUrl('Salter-Digital-Kitchen-Weighing-Scales', 'B000ZNNDTM'),
    watchOut: 'The glass platform needs to be dried fully before storing to avoid streaking.',
  },
  'nutribullet-600': {
    name: 'nutribullet Original 600',
    category: 'Blender',
    priceBand: 'Budget',
    bestFor: 'Simple single-portion protein shakes and smoothies',
    summary: 'A compact single-serve blender with a 600W motor, enough for blending oats, yogurt, fruit and protein powder into a smooth shake without a full-size jug blender.',
    href: amazonProductUrl('nutribullet-Original-Accessories-Smoothies-Multifunctional', 'B00QV9T7XU'),
    watchOut: 'Not designed for very large batches; best for one or two servings at a time.',
  },
  'nutribullet-900': {
    name: 'nutribullet Blender 900 Series',
    category: 'Blender',
    priceBand: 'Mid range',
    bestFor: 'Frozen fruit, ice and thicker smoothie bowls',
    summary: 'A more powerful 900W extractor that handles frozen fruit and ice more easily, useful if your meal prep smoothies are made from frozen batches rather than fresh.',
    href: amazonProductUrl('nutribullet-Blender-900-Extractor-Oversized', 'B01N39HGLD'),
    watchOut: 'Louder than the smaller models when blending ice; worth factoring in for shared or early-morning use.',
  },
  'moonmoon-silicone-bags': {
    name: 'Moonmoon Reusable Silicone Food Storage Bags (Set of 2, 1500ml)',
    category: 'Freezer bags',
    priceBand: 'Budget',
    bestFor: 'Flat-freezing soups, sauces and batch-cooked mince',
    summary: 'Reusable, dishwasher and microwave-safe silicone bags that let you freeze food flat, which stacks more efficiently in a freezer than rigid tubs.',
    href: amazonProductUrl('Moonmoon-Reusable-Silicone-Extra-1500ml', 'B09WDYT3L3'),
    watchOut: 'Wash and dry thoroughly between uses; residual moisture can lead to odours if bags are sealed away damp.',
  },
  'anpro-silicone-bags': {
    name: 'Anpro 11-Pack Reusable Silicone Freezer Bags',
    category: 'Freezer bags',
    priceBand: 'Budget',
    bestFor: 'Building up a full set of sizes for snacks, sandwiches and larger portions',
    summary: 'An 11-piece set across three sizes, useful for covering everything from snack portions to full meal-sized freezer bags in one purchase.',
    href: amazonProductUrl('Reusable-Sandwich-Bags-Food-Storage', 'B07Y6817V4'),
    watchOut: 'Smaller bags in the set are better suited to snacks than full meals.',
  },
  'foodsaver-everyday': {
    name: 'FoodSaver Everyday Vacuum Sealer Machine (VS0290)',
    category: 'Vacuum sealer',
    priceBand: 'Mid range',
    bestFor: 'Extending freezer life on batch-cooked meat, fish and portions',
    summary: 'A compact vacuum sealer that removes air before freezing, which reduces freezer burn and can extend how long batch-cooked portions stay in good condition.',
    href: amazonProductUrl('FoodSaver-Everyday-Machine-Compact-Efficient', 'B0BYXKBZV1'),
    watchOut: 'Requires specific vacuum sealer bags or rolls rather than any freezer bag.',
  },
  'foodsaver-handheld': {
    name: 'FoodSaver Handheld Cordless Vacuum Sealer (VS1199)',
    category: 'Vacuum sealer',
    priceBand: 'Mid range',
    bestFor: 'Smaller kitchens or occasional use without a full-size machine',
    summary: 'A cordless handheld sealer with a charging dock and reusable zipper bags, a lower-commitment option than a full benchtop machine.',
    href: amazonProductUrl('FoodSaver-Handheld-Cordless-Container-VS1199', 'B086XSH5DP'),
    watchOut: 'Less powerful suction than a full-size machine, so it suits shorter-term fridge storage better than long-term freezing.',
  },
  'nadiya-cook-once-eat-twice': {
    name: "Nadiya Hussain: Cook Once, Eat Twice",
    category: 'Cookbook',
    priceBand: 'Standard book price',
    bestFor: 'UK batch cooking recipes built around cooking once and reusing components',
    summary: 'Nadiya Hussain’s BBC2 tie-in cookbook, built entirely around cooking efficiently and turning one cook into two meals, including a chapter on using ingredients you would normally throw away.',
    href: amazonProductUrl('Cook-Once-Eat-Twice-ultimate', '0241620058'),
    watchOut: 'Focused on family-style home cooking rather than strict calorie or macro tracking.',
  },
  'batch-lady-grab-and-cook': {
    name: 'The Batch Lady: Grab and Cook',
    category: 'Cookbook',
    priceBand: 'Standard book price',
    bestFor: 'Fast, freezer-friendly recipes designed specifically for batch cooking',
    summary: "Suzanne Mulholland's bestselling batch-cooking cookbook, written specifically around freezer-friendly recipes you prep once and grab through the week.",
    href: amazonProductUrl('Batch-Lady-Grab-Cook-prep-ahead', '152992202X'),
    watchOut: 'Recipes are family-portion sized by default; halve or scale ingredients if cooking for one.',
  },
  'batch-lady-healthy-family': {
    name: 'The Batch Lady: Healthy Family Favourites',
    category: 'Cookbook',
    priceBand: 'Standard book price',
    bestFor: 'Healthier batch-cooking recipes for families',
    summary: 'A follow-up Batch Lady book focused on lighter, healthier versions of family batch-cooking staples, from the Channel 4 batch-cooking presenter.',
    href: amazonProductUrl('Suzanne-Mulholland-2', '0008373248'),
    watchOut: 'Still family-portion focused rather than aimed at strict calorie targets.',
  },
};

export function getMealPrepProduct(productId) {
  const product = MEALPREP_PRODUCTS[productId];
  if (!product) return null;
  return { id: productId, ...product };
}

export function getMealPrepProducts(productIds) {
  return (productIds || []).map(getMealPrepProduct).filter(Boolean);
}
