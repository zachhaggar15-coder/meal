// Lidl High-Protein - the repeating meals.
//
// Built on the one thing Lidl's own-brand range does unusually well for a
// discounter: high-protein dairy. Skyr and high-protein yogurt carry the
// breakfast and the daily extra between them, which is roughly 60g of the day's
// protein settled before you cook anything.

import { negligible } from '../../build/plan.mjs';

const ing = (line, display) => ({ line, display: display || line });

export const repeatingMeals = {
  /* ── breakfasts ──────────────────────────────────────────────────── */

  'skyr-berry-bowl': {
    name: 'Skyr, Berry and Seed Bowl',
    kind: 'breakfast',
    tagline: 'Monday to Friday. Two minutes, no pan, and about 35g of protein before you have left the kitchen.',
    time: '4 min',
    yield: 2,
    ingredients: [
      ing('450g skyr'),
      ing('70g rolled oats', '70g porridge oats'),
      ing('200g mixed berries', '200g frozen mixed berries'),
      ing('25g mixed seeds'),
      ing('2 tsp honey'),
      ing('1 banana', '1 banana, sliced'),
    ],
    method: [
      'Tip the frozen berries into two bowls and leave them while the kettle boils; they thaw in about ten minutes.',
      'Spoon the skyr over, then the oats, seeds and banana.',
      'Honey over the top. If you want it softer, stir the oats in the night before with a splash of milk.',
    ],
    swap: 'High-protein Greek-style yogurt, or quark loosened with a little milk. Plain Greek yogurt costs less and gives up roughly 8g of protein per serving.',
    leftovers: 'Assemble fresh, or build both bowls the night before and lid them.',
  },

  'weekend-eggs-haddock': {
    name: 'Poached Eggs with Smoked Fish and Rye',
    kind: 'breakfast',
    tagline: 'The weekend one, and worth the eight minutes. Smoked fish at breakfast is a very good habit to acquire.',
    time: '15 min',
    yield: 2,
    ingredients: [
      ing('3 egg', '3 eggs'),
      ing('100g smoked mackerel fillet', '100g smoked mackerel, skin off'),
      ing('2 slices rye bread'),
      ing('150g baby spinach'),
      ing('100g cherry tomatoes', '100g cherry tomatoes, halved'),
      ing('1 lemon'),
      ing('1 tbsp olive oil'),
      ing(negligible('black pepper'), 'black pepper'),
    ],
    method: [
      'Wilt the spinach with the tomatoes in the oil in a wide pan for 2 minutes, then divide between two plates.',
      'Poach the eggs in barely simmering water for 3 minutes for a soft yolk.',
      'Toast the rye bread.',
      'Flake the mackerel over the spinach, checking for bones, add the eggs and toast, and finish with lemon and a lot of pepper.',
    ],
    swap: 'Smoked salmon trimmings, or hot-smoked salmon. Scrambled eggs if poaching is not your morning.',
    leftovers: 'None. Poached eggs do not keep.',
  },

  /* ── the daily extra ─────────────────────────────────────────────── */

  'protein-pot-fruit': {
    name: 'High-Protein Yogurt with Apple and Almonds',
    kind: 'extra',
    tagline: 'The same thing every day, chosen because it needs no thought and travels in a bag.',
    time: '2 min',
    yield: 2,
    ingredients: [
      ing('300g high-protein yogurt pot', '2 high-protein yogurt pots'),
      ing('2 apple', '2 apples'),
      ing('25g almonds', '25g almonds'),
    ],
    method: [
      'Slice the apples.',
      'Eat the yogurt with the almonds scattered over and the apple alongside.',
      'That is the whole thing, and it is the same every day on purpose.',
    ],
    swap: 'Skyr, or quark with a spoon of honey. Any nut, any hard fruit.',
    leftovers: 'Nothing to keep.',
  },

  /* ── Monday lunches ──────────────────────────────────────────────── */

  'quark-rye-plate': {
    name: 'Smoked Fish, Quark and Rye Plate',
    kind: 'lunch',
    tagline: 'No cooking at all, and the highest-protein lunch in the book. Assembled in the time it takes to toast the bread.',
    time: '10 min',
    yield: 2,
    ingredients: [
      ing('150g smoked mackerel fillet', '150g smoked mackerel, flaked'),
      ing('200g cottage cheese'),
      ing('4 slices rye bread'),
      ing('150g cucumber', '150g cucumber, sliced'),
      ing('150g cherry tomatoes', '150g cherry tomatoes, halved'),
      ing('60g mixed leaves'),
      ing('1 lemon'),
      ing(negligible('black pepper'), 'black pepper'),
    ],
    method: [
      'Toast the rye bread.',
      'Spread the cottage cheese over it and flake the mackerel on top, checking for bones.',
      'Lemon squeezed over, plenty of pepper, and the salad on the side.',
    ],
    swap: 'Tinned mackerel or salmon. Hummus for a version with no fish in it, though the protein drops.',
    leftovers: 'Build it the morning you eat it; rye bread with a wet topping goes soft quickly.',
  },

  'chicken-quinoa-box': {
    name: 'Chicken and Quinoa Lunch Box',
    kind: 'lunch',
    tagline: 'Poached chicken and quinoa, dressed with yogurt and lemon. Cooked in twenty minutes, mostly unattended.',
    time: '25 min',
    yield: 2,
    ingredients: [
      ing('300g chicken breast'),
      ing('120g quinoa dry', '120g quinoa'),
      ing('150g cherry tomatoes', '150g cherry tomatoes, halved'),
      ing('100g cucumber', '100g cucumber, diced'),
      ing('240g tinned chickpeas', '1 x 400g tin chickpeas, drained'),
      ing('100g low-fat greek yogurt'),
      ing('1 lemon'),
      ing('1 tbsp olive oil'),
      ing('60g mixed leaves'),
    ],
    method: [
      'Cover the chicken with boiling water in a small pan, bring back to a bare simmer and cook 14 minutes. Check the middle is white throughout, then shred it with two forks.',
      'Cook the quinoa in plenty of salted water for 14 minutes, drain well and spread it out to cool.',
      'Whisk the yogurt, lemon juice, oil, salt and pepper together.',
      'Fold the quinoa, chickpeas, tomatoes and cucumber through the dressing, add the chicken, and box it with the leaves on top.',
    ],
    swap: 'Couscous or bulgur instead of quinoa. Tinned tuna instead of the chicken, with no cooking at all.',
    leftovers: 'Keeps 48 hours. Add the leaves on the morning rather than the night before.',
  },

  'cottage-cheese-jackets': {
    name: 'Jacket Potato with Cottage Cheese and Ham',
    kind: 'lunch',
    tagline: 'An hour of the oven doing the work while you do something else, and two minutes of assembly.',
    time: '1 hr, 5 min of it yours',
    yield: 2,
    ingredients: [
      ing('600g potato baked', '2 large baking potatoes, about 300g each'),
      ing('300g cottage cheese'),
      ing('120g turkey breast slices', '120g sliced ham or turkey'),
      ing('4 spring onion', '4 spring onions, sliced'),
      ing('150g cherry tomatoes', '150g cherry tomatoes, halved'),
      ing('40g cheddar', '40g cheddar, grated'),
      ing(negligible('black pepper'), 'salt and black pepper'),
    ],
    method: [
      'Heat the oven to 200&deg;C fan. Prick the potatoes, rub with a little oil and plenty of salt, and put them straight on the shelf &mdash; no tray, no foil.',
      'Bake 55&ndash;65 minutes until a knife meets no resistance.',
      'Mix the cottage cheese with the spring onions, tomatoes and a lot of pepper, and chop the ham through it.',
      'Split the potatoes, fork up the insides, pile the mixture in and scatter the cheddar over.',
    ],
    swap: 'Sweet potato, ten minutes less. Tinned tuna instead of the ham.',
    leftovers: 'Bake a third potato while the oven is hot; it keeps two days.',
  },
};
