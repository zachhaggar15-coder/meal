import { repeatingMeals } from './meals.mjs';
import { dinnersA } from './dinners-a.mjs';
import { dinnersB } from './dinners-b.mjs';
import { weeks } from './schedule.mjs';
import { content } from './content.mjs';

export default {
  slug: 'aldi-high-protein',
  store: 'Aldi',
  planType: 'high-protein',
  title: 'The Aldi High-Protein Plan',
  subtitle: 'Six weeks of dinners for two adults, with the protein already counted.',
  footer: 'MealPrep.org.uk · The Aldi High-Protein Plan',
  cost: { tier: 'Moderate tier', range: '£40–£55 per person per week', checked: '29 July 2026' },
  shopNotes: {
    'skyr': 'Aldi groups its higher-protein dairy together online, which makes comparing labels quick.',
    'protein yogurt': 'Any high-protein yogurt. Skyr works identically.',
    'king prawns': 'Frozen is the more forgiving buy; take out what the recipe needs.',
    'cottage cheese': 'One of the least expensive proteins in the chiller.',
  },
  meals: { ...repeatingMeals, ...dinnersA, ...dinnersB },
  weeks,
  content,
  sections: content.sections,
  appendices: content.appendices,
};
