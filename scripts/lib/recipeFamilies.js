// Recipe title → method contracts.
//
// Existing recipe QA already checks that raw proteins get cooked, that dishes
// needing liquid get some, and that a method only cooks ingredients the recipe
// actually has. All of that can pass while the method still produces the wrong
// dish:
//
//   "Frozen Greek Yogurt and Berry Bark" — put yogurt in a bowl, top with
//   berries, eat straight away. Never frozen, never spread, never broken.
//
//   "Mushroom and Lentil Shepherd's Pie" — warm the filling, serve the mash
//   alongside. No topping, no layering, no bake.
//
// Both are edible and safe. Neither is the dish on the label.
//
// The contracts below are deliberately conservative. A family is only listed
// when its name genuinely implies a defining action, and each contract asks
// only for the action that makes the dish that dish — not for a full recipe.
// Families are taken from the real corpus of 268 recipe names.

/**
 * @typedef {object} FamilyContract
 * @property {string} id
 * @property {RegExp} title      matches the dish family in a recipe name
 * @property {RegExp} [exclude]  names that look like the family but are not
 * @property {RegExp} requires   the defining action the method must contain
 * @property {string} because    what a reader would otherwise be handed
 */

/** @type {FamilyContract[]} */
const FAMILY_CONTRACTS = [
  {
    id: 'bark',
    title: /\bbark\b/i,
    requires: /\bfreez(?:e|ing)\b/i,
    alsoRequires: /\b(spread|pour|layer)\b/i,
    because: 'bark is defined by being frozen flat and broken into pieces',
  },
  {
    id: 'shepherds-pie',
    title: /\b(shepherd'?s|cottage)\s+pie\b/i,
    requires: /\b(top|spread|layer|cover)\b/i,
    alsoRequires: /\b(bake|oven|grill|brown)\b/i,
    because: 'a shepherd\'s pie is a filling under a topping, finished in the oven',
  },
  {
    id: 'stir-fry',
    title: /\bstir[- ]?fry\b/i,
    requires: /\bstir[- ]?fry|\bhigh heat\b|\bwok\b/i,
    because: 'a stir-fry is defined by fast cooking over high heat',
  },
  {
    id: 'roast',
    title: /\broast(?:ed)?\b/i,
    exclude: /\bnut roast\b|\bpot roast\b/i,
    requires: /\broast|\boven\b/i,
    because: 'a roast has to be roasted',
  },
  {
    id: 'smoothie',
    title: /\bsmoothie\b/i,
    exclude: /\bsmoothie bowl\b/i,
    requires: /\bblend|\bblitz\b/i,
    because: 'a smoothie is blended',
  },
  {
    id: 'smoothie-bowl',
    title: /\bsmoothie bowl\b/i,
    requires: /\bblend|\bblitz\b/i,
    because: 'a smoothie bowl is blended, then topped',
  },
  {
    id: 'overnight-oats',
    title: /\bovernight oats\b/i,
    requires: /\b(overnight|chill|fridge|refrigerat)/i,
    because: 'overnight oats have to soak',
  },
  {
    id: 'pancake',
    title: /\bpancakes?\b|\bwaffles?\b/i,
    requires: /\bbatter\b/i,
    alsoRequires: /\b(cook|fry|griddle|pan)\b/i,
    because: 'pancakes and waffles need a batter that gets cooked',
  },
  {
    id: 'omelette',
    title: /\bomelette\b|\bfrittata\b/i,
    requires: /\b(beat|whisk|pour)\b/i,
    alsoRequires: /\b(pan|cook|fry|oven|grill|set)\b/i,
    because: 'an omelette or frittata is beaten egg set in a pan',
  },
  {
    id: 'soup',
    title: /\bsoup\b/i,
    requires: /\b(simmer|boil|blend|cook)\b/i,
    because: 'a soup has to be cooked in liquid',
  },
  {
    id: 'risotto',
    title: /\brisotto\b/i,
    requires: /\b(stir|simmer|ladle|absorb)\b/i,
    because: 'risotto rice is cooked by absorbing liquid gradually',
  },
  {
    id: 'jacket-potato',
    title: /\bjacket potato\b/i,
    requires: /\b(bake|oven|microwave|reheat)\b/i,
    because: 'a jacket potato is baked whole',
  },
  {
    id: 'curry',
    title: /\bcurry\b/i,
    requires: /\b(simmer|cook|fry|heat)\b/i,
    because: 'a curry is simmered rather than assembled cold',
  },
  {
    id: 'chilli',
    title: /\bchilli\b/i,
    exclude: /\bchilli (?:powder|flakes|sauce|oil)\b/i,
    requires: /\b(simmer|cook|fry|heat)\b/i,
    because: 'a chilli is simmered',
  },
  {
    id: 'stew-casserole',
    title: /\bstew\b|\bcasserole\b|\bhotpot\b/i,
    requires: /\b(simmer|cook|oven|braise)\b/i,
    because: 'a stew or casserole is slow-cooked in liquid',
  },
  {
    id: 'scrambled-eggs',
    title: /\bscrambled\b/i,
    requires: /\b(scramble|stir|pan|cook)\b/i,
    because: 'scrambled eggs are stirred as they set',
  },
];

/**
 * Checks one recipe against every family its title matches.
 * Returns an array of violations; empty means the method delivers the dish.
 */
export function checkFamilyContracts(name, methodSteps) {
  const title = String(name || '');
  const method = (methodSteps || []).join(' ');
  if (!title || !method) return [];

  const violations = [];
  for (const contract of FAMILY_CONTRACTS) {
    if (!contract.title.test(title)) continue;
    if (contract.exclude?.test(title)) continue;

    const missing = [];
    if (!contract.requires.test(method)) missing.push(String(contract.requires));
    if (contract.alsoRequires && !contract.alsoRequires.test(method)) {
      missing.push(String(contract.alsoRequires));
    }
    if (missing.length) {
      violations.push({
        family: contract.id,
        name: title,
        because: contract.because,
        missing,
        method: method.slice(0, 200),
      });
    }
  }
  return violations;
}

/** Families a given recipe name belongs to — useful for reporting coverage. */
export function familiesFor(name) {
  const title = String(name || '');
  return FAMILY_CONTRACTS
    .filter(contract => contract.title.test(title) && !contract.exclude?.test(title))
    .map(contract => contract.id);
}

export { FAMILY_CONTRACTS };
