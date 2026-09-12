// Lidl Budget - the repeating meals.
//
// This edition leans on two things Lidl is documented as doing well: a strong
// bakery for the price point, and a plant-based own-brand range that makes
// meat-free weeks cheaper than they usually are. The repeating meals reflect
// that - bread does more work here than in the Aldi budget book, and the daily
// extra is built on fruit and nuts rather than a large tub of Greek yogurt.

import { negligible } from '../../build/plan.mjs';

const ing = (line, display) => ({ line, display: display || line });

export const repeatingMeals = {
  /* ── breakfasts ──────────────────────────────────────────────────── */

  'bakery-toast-eggs': {
    name: 'Toast, Boiled Eggs and Fruit',
    kind: 'breakfast',
    tagline: 'Monday to Friday, and the whole argument for it is that good bread turns a dull breakfast into a decent one.',
    time: '10 min',
    yield: 2,
    ingredients: [
      ing('2 slices sourdough bread', '2 thick slices of bakery bread'),
      ing('3 egg', '3 eggs'),
      ing('5g butter'),
      ing('2 banana', '2 bananas'),
      ing(negligible('salt and black pepper'), 'salt and black pepper'),
    ],
    method: [
      'Lower the eggs into boiling water and set a timer for 7 minutes for a soft centre, 9 for firm.',
      'Toast and butter the bread while they cook.',
      'Run the eggs under the cold tap for thirty seconds before peeling &mdash; it makes the shells come away cleanly.',
      'Serve on the toast, crushed with a fork and seasoned, with a banana each alongside.',
    ],
    swap: 'Any bread. A bakery loaf that is a day old toasts better than a fresh one, which is convenient.',
    leftovers: 'Boil four extra eggs while the pan is on; they keep two days in the fridge in their shells.',
  },

  'weekend-beans-toast': {
    name: 'Baked Beans, Mushrooms and Cheese on Toast',
    kind: 'breakfast',
    tagline: 'The weekend one. Roasting the mushrooms rather than frying them is what keeps it from being a fry-up.',
    time: '15 min',
    yield: 2,
    ingredients: [
      ing('250g reduced-sugar baked beans'),
      ing('250g mushrooms', '250g mushrooms, halved'),
      ing('3 slices sourdough bread', '3 thick slices of bakery bread'),
      ing('30g cheddar', '30g cheddar, grated'),
      ing('150g cherry tomatoes'),
      ing('1 tbsp olive oil'),
      ing(negligible('black pepper'), 'black pepper'),
    ],
    method: [
      'Heat the grill. Toss the mushrooms and tomatoes in the oil with salt and grill them for 8 minutes, until the mushrooms have browned and the tomatoes have split.',
      'Warm the beans in a small pan.',
      'Toast the bread, pile on the beans, then the mushrooms and tomatoes, then the cheese so it melts on contact.',
    ],
    swap: 'Any tinned beans in tomato sauce. A plant-based cheese works if you want it dairy-free.',
    leftovers: 'None. Eat it while the toast is still toast.',
  },

  /* ── the daily extra ─────────────────────────────────────────────── */

  'apple-peanut-butter': {
    name: 'Apple, Peanut Butter and Oatcakes',
    kind: 'extra',
    tagline: 'The same thing every day. No tub to open, nothing to keep cold, and it survives a rucksack.',
    time: '2 min',
    yield: 2,
    ingredients: [
      ing('2 apple', '2 apples'),
      ing('30g peanut butter'),
      ing('4 oatcakes'),
    ],
    method: [
      'Slice the apples.',
      'Spread the peanut butter over the oatcakes.',
      'That is the whole recipe, and it is the same every day on purpose.',
    ],
    swap: 'Any nut butter, or a banana instead of the apple. Rice cakes if oatcakes are not there.',
    leftovers: 'Assemble fresh; it takes two minutes.',
  },

  /* ── Monday lunches ──────────────────────────────────────────────── */

  'hummus-falafel-flatbread': {
    name: 'Hummus, Falafel and Salad Flatbread',
    kind: 'lunch',
    tagline: 'Built out of the chilled aisle and the bakery, with no cooking at all.',
    time: '8 min',
    yield: 2,
    ingredients: [
      ing('150g hummus'),
      ing('160g falafel'),
      ing('3 wholemeal pitta', '3 pittas or flatbreads'),
      ing('100g cucumber', '100g cucumber, sliced'),
      ing('150g cherry tomatoes', '150g cherry tomatoes, halved'),
      ing('60g mixed leaves'),
      ing('1 lemon'),
      ing('1 tbsp olive oil'),
    ],
    method: [
      'Warm the flatbreads for a minute in a dry pan or the toaster.',
      'Spread the hummus over them, crumble the falafel on, and pile on the salad.',
      'Dress with the lemon juice and oil, and roll or fold them up.',
    ],
    swap: 'Any bean dip in place of hummus. Grilled halloumi instead of falafel if you want it hotter.',
    leftovers: 'Build it in the morning. A dressed flatbread made the night before goes soft.',
  },

  'cheese-pickle-doorstep': {
    name: 'Cheese, Pickle and Salad Doorsteps',
    kind: 'lunch',
    tagline: 'A sandwich cut thick enough to count as lunch, which is mostly a question of the bread.',
    time: '8 min',
    yield: 2,
    ingredients: [
      ing('4 slices sourdough bread', '4 thick slices of bakery bread'),
      ing('100g cheddar', '100g cheddar, sliced thick'),
      ing('2 tsp mustard'),
      ing('60g mixed leaves'),
      ing('100g cucumber', '100g cucumber, sliced'),
      ing('2 apple', '2 apples'),
      ing('30g mixed seeds'),
    ],
    method: [
      'Spread the mustard right to the edges.',
      'Layer the cheese, then the leaves and cucumber, and press the sandwich together firmly so it survives being carried.',
      'An apple and a handful of seeds each alongside.',
    ],
    swap: 'Any hard cheese. Hummus for a dairy-free version, with an extra handful of seeds.',
    leftovers: 'Make it the morning you eat it.',
  },

  'soup-and-bread': {
    name: 'Lentil Soup with Bakery Bread',
    kind: 'lunch',
    tagline: 'Twenty minutes on a Monday morning, or made on Sunday evening while something else is in the oven.',
    time: '25 min',
    yield: 2,
    ingredients: [
      ing('100g red lentils dry', '100g red lentils, rinsed'),
      ing('2 carrot', '2 carrots, diced'),
      ing('1 onion', '1 onion, diced'),
      ing('600ml vegetable stock'),
      ing('200g tinned tomatoes', '200g chopped tomatoes, half a tin'),
      ing('3 slices sourdough bread', '3 thick slices of bakery bread'),
      ing('30g cheddar', '30g cheddar, grated'),
      ing('1 tbsp olive oil'),
      ing(negligible('cumin'), '1 tsp cumin'),
    ],
    method: [
      'Cook the onion and carrot in the oil for 8 minutes with a pinch of salt.',
      'Add the cumin for a minute, then the lentils, tomatoes and stock.',
      'Simmer 15 minutes until the lentils have collapsed. Season well; lentils take more salt than you expect.',
      'Serve with the bread and the cheese grated over the top of the soup.',
    ],
    swap: 'Any root vegetable. A tin of green lentils instead of dried ones cuts it to ten minutes.',
    leftovers: 'Keeps 48 hours and thickens; loosen with a splash of water.',
  },
};
