export const ACCESSORY_PRODUCT_IDS = Object.freeze([
  'lifewit-9l-insulated-lunch-bag',
  'fit-fresh-bree-meal-prep-bag',
  'fit-fresh-slim-ice-packs',
  'bentgo-buddies-ice-packs',
  'sistema-dressing-pots',
  'vitever-glass-dressing-containers',
  'smarch-overnight-oats-jars',
  'bubblewally-overnight-oats-containers',
  'thermopro-tp02s-thermometer',
  'doqaus-folding-food-thermometer',
  'milu-450ml-food-flask',
  'stanley-classic-food-jar-400ml',
  'fullstar-pro-vegetable-chopper',
  'oxo-good-grips-vegetable-chopper',
  'cosori-air-fryer-accessory-kit',
  'square-silicone-air-fryer-liners',
  'blenderbottle-classic-v2',
  'myprotein-600ml-shaker',
  'nuoshen-removable-food-labels',
  'innoveem-easy-peel-freezer-labels',
]);

export const ACCESSORY_PROBLEMS = Object.freeze([
  {
    id: 'carry-lunch',
    label: 'Carry lunch to work',
    summary: 'Match a practical bag to the containers and journey you already have.',
    guidance: [
      'Check the bag’s internal dimensions against your existing containers before buying. An insulated bag helps with transport, but does not guarantee food stays at a safe temperature.',
      'If you already have a suitable washable bag and quick access to a fridge, you may not need anything new.',
    ],
    recommendations: [
      { productId: 'lifewit-9l-insulated-lunch-bag', role: 'Lead recommendation' },
      { productId: 'fit-fresh-bree-meal-prep-bag', role: 'Complete-kit alternative' },
    ],
    guides: [
      { to: '/blog/insulated-meal-prep-bags-uk', label: 'Compare insulated lunch bags' },
      { to: '/meal-prep-containers/work-lunch', label: 'Choose containers for work lunches' },
    ],
  },
  {
    id: 'keep-cold',
    label: 'Keep food cold',
    summary: 'Add cold support without filling a lunch bag with a thick freezer block.',
    guidance: [
      'An ice pack complements an insulated bag. Its position, the journey time and access to refrigeration still matter, so it should not be treated as an indefinite food-safety guarantee.',
    ],
    recommendations: [
      { productId: 'fit-fresh-slim-ice-packs', role: 'Lead recommendation' },
    ],
    guides: [
      { to: '/blog/reusable-ice-packs-for-lunch-bags-uk', label: 'Compare reusable ice packs' },
      { to: '/blog/how-to-store-meal-prep-safely-uk', label: 'Read the safe-storage guide' },
    ],
  },
  {
    id: 'avoid-leaks',
    label: 'Avoid sauces and leaks',
    summary: 'Keep dressings separate, then choose a sealed main container independently.',
    guidance: [
      'A small sauce pot keeps dressing away from the meal until you eat. It does not make the main meal-prep box leakproof, so use the container guide when the whole lunch needs a secure seal.',
    ],
    recommendations: [
      { productId: 'sistema-dressing-pots', role: 'Lead recommendation' },
      { productId: 'vitever-glass-dressing-containers', role: 'Glass alternative' },
    ],
    guides: [
      { to: '/blog/best-sauce-pots-for-meal-prep-uk', label: 'Compare sauce pots' },
      { to: '/meal-prep-containers/leakproof', label: 'Choose a leakproof main container' },
    ],
  },
  {
    id: 'breakfast-prep',
    label: 'Prepare breakfast',
    summary: 'Choose between a glass breakfast jar and a lighter plastic pot.',
    guidance: [
      'Leave enough headroom for the prepared oats and liquid, and consider the weight of the container during your commute. A specialised oats jar is optional; an ordinary lidded jar can work too.',
    ],
    recommendations: [
      { productId: 'smarch-overnight-oats-jars', role: 'Lead recommendation' },
      { productId: 'bubblewally-overnight-oats-containers', role: 'Lighter plastic alternative' },
    ],
    guides: [
      { to: '/blog/overnight-oats-jars-for-meal-prep-uk', label: 'Compare overnight oats jars' },
    ],
  },
  {
    id: 'food-temperature',
    label: 'Check food temperature',
    summary: 'Use a direct reading during cooking without treating the tool as a storage fix.',
    guidance: [
      'A food thermometer helps check cooking temperature. It cannot correct unsafe cooling, storage or cross-contamination, and the probe still needs cleaning between foods.',
    ],
    recommendations: [
      { productId: 'thermopro-tp02s-thermometer', role: 'Lead recommendation' },
    ],
    guides: [
      { to: '/blog/best-food-thermometers-for-meal-prep-uk', label: 'Read the food-thermometer guide' },
    ],
  },
  {
    id: 'freezer-organisation',
    label: 'Organise freezer prep',
    summary: 'Make portions identifiable without confusing labelling with safe storage.',
    guidance: [
      'Labels help record contents and dates. They do not make a container freezer-safe, so choose the storage method separately and follow the container manufacturer’s instructions.',
    ],
    recommendations: [
      { productId: 'nuoshen-removable-food-labels', role: 'Lead recommendation' },
    ],
    guides: [
      { to: '/blog/freezer-labels-for-meal-prep-uk', label: 'Compare freezer labels' },
      { to: '/meal-prep-containers/freezer-bags', label: 'Compare reusable freezer bags' },
      { to: '/meal-prep-containers/freezer-safe', label: 'Choose freezer-safe containers' },
    ],
  },
  {
    id: 'faster-prep',
    label: 'Reduce chopping time',
    summary: 'Reduce repetitive knife work only when the cleanup trade-off makes sense.',
    guidance: [
      'A manual chopper is most useful for repeated batches of similar vegetables. Someone who already chops efficiently with a knife will probably save neither time nor washing up.',
    ],
    recommendations: [
      { productId: 'fullstar-pro-vegetable-chopper', role: 'Lead recommendation' },
      { productId: 'oxo-good-grips-vegetable-chopper', role: 'Small-batch alternative' },
    ],
    guides: [
      { to: '/blog/best-vegetable-choppers-for-meal-prep-uk', label: 'Compare vegetable choppers' },
    ],
  },
  {
    id: 'no-microwave',
    label: 'Eat without a microwave',
    summary: 'Compare a compact hot-food flask with deliberately cold lunch options.',
    guidance: [
      'A food flask is one solution when reheating is unavailable; a deliberately cold meal is another. Check the flask manufacturer’s preparation and care instructions rather than assuming it suits every lunch.',
    ],
    recommendations: [
      { productId: 'milu-450ml-food-flask', role: 'Lead recommendation' },
      { productId: 'stanley-classic-food-jar-400ml', role: 'Compact durable alternative' },
    ],
    guides: [
      { to: '/blog/insulated-food-flasks-for-meal-prep-uk', label: 'See the food-flask guide' },
      { to: '/blog/cold-lunch-ideas-for-work-uk', label: 'Browse cold lunch ideas for work' },
      { to: '/blog/meal-prep-without-a-microwave-uk', label: 'Plan meals without a microwave' },
    ],
  },
]);

export const PROMINENT_ACCESSORY_PRODUCT_IDS = Object.freeze([
  ...new Set(ACCESSORY_PROBLEMS.flatMap(problem => (
    problem.recommendations.map(recommendation => recommendation.productId)
  ))),
]);

export function getAccessoryProblem(problemId) {
  return ACCESSORY_PROBLEMS.find(problem => problem.id === problemId) || null;
}
