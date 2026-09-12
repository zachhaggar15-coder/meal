// Aldi Budget - the repeating meals.
//
// Breakfasts, the daily extra and the three Monday lunches. These carry most of
// the plan's repetition on purpose: they are the meals eaten on autopilot, and
// making them identical is what removes decisions from the mornings.
//
// Quantities are for two adults. Yield is 2 because both adults eat one portion.

import { negligible } from '../../build/plan.mjs';

const ing = (line, display) => ({ line, display: display || line });

export const repeatingMeals = {
  /* ── breakfasts ──────────────────────────────────────────────────── */

  'porridge-banana': {
    name: 'Porridge with Banana and Honey',
    kind: 'breakfast',
    tagline: 'Monday to Friday, every week, without a decision attached to it.',
    time: '5 min',
    yield: 2,
    ingredients: [
      ing('100g rolled oats', '100g porridge oats'),
      ing('450ml semi-skimmed milk'),
      ing('2 banana', '2 bananas, sliced'),
      ing('2 tsp honey'),
      ing('15g mixed seeds'),
      ing(negligible('salt'), 'a pinch of salt'),
    ],
    method: [
      'Put the oats, milk and a pinch of salt in a pan over a medium heat.',
      'Stir fairly constantly for 4&ndash;5 minutes until it thickens and the oats lose their chalky edge. Salt is what stops porridge tasting of nothing.',
      'Slice the banana over the top, add the seeds and trickle on the honey.',
    ],
    swap: 'Half milk, half water if you want it lighter. Oat milk works, usually at a little more cost.',
    leftovers: 'Make it fresh. Porridge sets to a brick in the fridge.',
  },

  'eggs-beans-toast': {
    name: 'Eggs and Beans on Toast',
    kind: 'breakfast',
    tagline: 'The weekend one. Twice the protein of the weekday breakfast and about ten minutes of work.',
    time: '12 min',
    yield: 2,
    ingredients: [
      ing('4 egg', '4 eggs'),
      ing('4 slices wholemeal bread'),
      ing('250g reduced-sugar baked beans'),
      ing('20g cheddar', '20g cheddar, grated'),
      ing('5g butter'),
      ing(negligible('black pepper'), 'black pepper'),
    ],
    method: [
      'Warm the beans in a small pan over a low heat.',
      'Poach or fry the eggs, two each, however you prefer them.',
      'Toast and butter the bread, pile the beans on, then the eggs, then the cheese so it melts on contact. Plenty of pepper.',
    ],
    swap: 'Scrambled works if you would rather; beat the eggs with a splash of milk and keep the heat low.',
    leftovers: 'None. Cook it, eat it.',
  },

  /* ── the daily extra ─────────────────────────────────────────────── */

  'yogurt-berries-peanuts': {
    name: 'Yogurt, Frozen Berries and Peanuts',
    kind: 'extra',
    tagline: 'The same extra every day. It closes the gap to 2,000 calories and asks nothing of you.',
    time: '2 min',
    yield: 2,
    ingredients: [
      ing('300g low-fat greek yogurt'),
      ing('200g mixed berries', '200g frozen mixed berries'),
      ing('30g peanuts', '30g peanuts, roughly chopped'),
      ing('2 tsp honey'),
    ],
    method: [
      'Spoon the yogurt into two bowls.',
      'Tip the berries on straight from the freezer and leave them ten minutes. They thaw into the yogurt and bleed colour through it.',
      'Peanuts and honey over the top.',
    ],
    swap: 'Any frozen fruit. Frozen fruit is usually the better buy for this and it does not spoil halfway through the week.',
    leftovers: 'Assemble fresh; it takes two minutes.',
  },

  /* ── Monday lunches, the only lunch not cooked the night before ──── */

  'cheese-salad-sandwich': {
    name: 'Cheese and Pickle Salad Sandwich',
    kind: 'lunch',
    tagline: 'Monday has no dinner behind it, so Monday gets a sandwich. Built in the morning, not the night before.',
    time: '8 min',
    yield: 2,
    ingredients: [
      ing('6 slices wholemeal bread'),
      ing('100g cheddar', '100g cheddar, sliced'),
      ing('60g mixed leaves'),
      ing('100g cucumber', '100g cucumber, sliced'),
      ing('100g cherry tomatoes', '100g cherry tomatoes, halved'),
      ing('2 tsp mustard'),
      ing('2 apple', '2 apples'),
      ing('30g mixed seeds'),
    ],
    method: [
      'Spread the mustard right to the edges of the bread.',
      'Layer cheese first, then the leaves, cucumber and tomatoes, and press the sandwich down firmly so it holds together in a bag.',
      'Cut in half. An apple and a small handful of seeds each alongside.',
    ],
    swap: 'Any hard cheese, or hummus if you want it meat- and dairy-free.',
    leftovers: 'Build it the morning you eat it. A sandwich made the night before is a wet paper bag by noon.',
  },

  'hummus-pitta-plate': {
    name: 'Hummus, Pitta and Everything Left in the Drawer',
    kind: 'lunch',
    tagline: 'A plate rather than a recipe, and the best use of a vegetable drawer halfway through a plan.',
    time: '8 min',
    yield: 2,
    ingredients: [
      ing('200g hummus'),
      ing('3 wholemeal pitta', '3 wholemeal pittas'),
      ing('2 carrot', '2 carrots, cut into sticks'),
      ing('150g cucumber', '150g cucumber, in batons'),
      ing('150g cherry tomatoes'),
      ing('100g olives'),
      ing('2 apple', '2 apples'),
    ],
    method: [
      'Warm the pittas for a minute in a dry pan or the toaster and cut them into strips.',
      'Everything else goes on the plate as it is.',
      'If you are taking it out, the hummus travels better in its own tub than spread on anything.',
    ],
    swap: 'Any raw vegetable that needs using. Peppers, celery and radishes all work.',
    leftovers: 'Nothing to keep beyond the hummus, which lives to its own date once opened.',
  },

  'jacket-tuna-sweetcorn': {
    name: 'Jacket Potato with Tuna and Sweetcorn',
    kind: 'lunch',
    tagline: 'Five minutes of work and an hour of ignoring the oven, so it suits a Monday you are working from home.',
    time: '1 hr, 5 min of it yours',
    yield: 2,
    ingredients: [
      ing('600g potato baked', '2 large baking potatoes, about 300g each'),
      ing('200g tinned tuna in spring water', '2 tins tuna, drained'),
      ing('150g sweetcorn', '150g tinned sweetcorn, drained'),
      ing('40g light mayo'),
      ing('60g low-fat natural yogurt'),
      ing('40g cheddar', '40g cheddar, grated'),
      ing('2 spring onion', '2 spring onions, sliced'),
      ing(negligible('salt and black pepper'), 'salt and black pepper'),
    ],
    method: [
      'Heat the oven to 200&deg;C fan. Prick the potatoes all over, rub with a little oil and plenty of salt.',
      'Put them straight on the oven shelf, not on a tray and not in foil &mdash; both steam the skin, and the skin is the point.',
      'Bake 55&ndash;65 minutes, until a knife meets no resistance.',
      'Mix the tuna, sweetcorn, mayonnaise, yogurt and spring onion with a lot of black pepper.',
      'Split the potatoes, fluff the insides with a fork, load them up and finish with the cheese.',
    ],
    swap: 'Tinned salmon or mackerel instead of tuna, or leftover chilli from an earlier week.',
    leftovers: 'Put a third potato in while the oven is hot; it keeps two days and reheats well in the oven.',
  },
};
