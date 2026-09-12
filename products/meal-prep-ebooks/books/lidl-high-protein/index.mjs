import { repeatingMeals } from './meals.mjs';
import { dinnersA } from './dinners-a.mjs';
import { dinnersB } from './dinners-b.mjs';
import { weeks } from './schedule.mjs';
import { content } from './content.mjs';

export default {
  slug: 'lidl-high-protein',
  store: 'Lidl',
  planType: 'high-protein',
  title: 'The Lidl High-Protein Plan',
  subtitle: 'Six weeks of dinners for two adults, with the protein already counted.',
  footer: 'MealPrep.org.uk · The Lidl High-Protein Plan',
  cost: { tier: 'Moderate tier', range: '£40–£55 per person per week', checked: '29 July 2026' },
  shopNotes: {
    'skyr': 'Lidl groups its high-protein dairy together online, which makes comparing labels quick.',
    'high-protein yogurt pot': 'Any high-protein pot. Skyr or quark do the same job.',
    'smoked mackerel fillet': 'Already cooked and already seasoned, which is most of why it is here.',
    'quinoa': 'Cook it like pasta, in plenty of salted water, and drain it properly.',
  },
  meals: { ...repeatingMeals, ...dinnersA, ...dinnersB },
  weeks,
  content,
  sections: content.sections,
  appendices: content.appendices,
};
