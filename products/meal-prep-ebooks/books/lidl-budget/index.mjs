import { repeatingMeals } from './meals.mjs';
import { dinnersA } from './dinners-a.mjs';
import { dinnersB } from './dinners-b.mjs';
import { weeks } from './schedule.mjs';
import { content } from './content.mjs';

export default {
  slug: 'lidl-budget',
  store: 'Lidl',
  planType: 'budget',
  title: 'The Lidl Dinner Plan',
  subtitle: 'Six weeks of dinners for two adults, decided before you start.',
  footer: 'MealPrep.org.uk · The Lidl Dinner Plan',
  cost: { tier: 'Budget tier', range: '£30–£40 per person per week', checked: '29 July 2026' },
  shopNotes: {
    'sourdough bread': 'A bakery loaf bought on the day, used across three days. A day-old loaf toasts better than a fresh one.',
    'firm tofu': 'Press it before cooking; it is the difference between browning and steaming.',
    'quorn mince': 'Any meat-free mince. Green lentils work if the range has moved on.',
    'tinned sardines': 'The best-value protein in this book by some distance.',
  },
  meals: { ...repeatingMeals, ...dinnersA, ...dinnersB },
  weeks,
  content,
  sections: content.sections,
  appendices: content.appendices,
};
