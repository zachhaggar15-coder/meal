import { repeatingMeals } from './meals.mjs';
import { dinnersA } from './dinners-a.mjs';
import { dinnersB } from './dinners-b.mjs';
import { weeks } from './schedule.mjs';
import { content } from './content.mjs';

export default {
  slug: 'aldi-budget',
  store: 'Aldi',
  planType: 'budget',
  title: 'The Aldi Dinner Plan',
  subtitle: 'Six weeks of dinners for two adults, decided before you start.',
  footer: 'MealPrep.org.uk · The Aldi Dinner Plan',
  cost: { tier: 'Budget tier', range: '£30–£40 per person per week', checked: '29 July 2026' },
  shopNotes: {
    'lean beef mince': 'Two packs across the week; freeze the second on the day you buy it if it is for later.',
    'brown rice': 'Cooked fresh each night it appears, never stored between meals.',
    'mixed berries': 'Frozen. It does not spoil halfway through the week, which is the main reason it is here.',
    'chicken thighs': 'Thighs hold up to reheating better than breast does.',
  },
  meals: { ...repeatingMeals, ...dinnersA, ...dinnersB },
  weeks,
  content,
  sections: content.sections,
  appendices: content.appendices,
};
