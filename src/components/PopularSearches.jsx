import { useId } from 'react';
import { Link } from 'react-router-dom';
import { toTitleCase } from '../utils/textFormatting.js';

const DEFAULT_LINKS = [
  { label: 'Aldi 1500 calorie meal plan', to: '/meal-plans/aldi-1500-calorie-meal-plan' },
  { label: 'Tesco high protein meal plan', to: '/meal-plans/tesco-high-protein-meal-plan' },
  { label: 'work lunch meal prep UK', to: '/meal-plans/work-lunch-meal-prep-uk' },
  { label: 'low calorie foods UK', to: '/blog/best-low-calorie-foods-uk' },
  { label: 'printable 1500 calorie meal plan', to: '/meal-plans/1500-calorie' },
  { label: 'lose weight meal plan UK', to: '/meal-plans/weight-loss' },
  { label: 'cheap protein UK', to: '/blog/best-cheap-high-protein-foods-uk' },
  { label: 'protein porridge UK', to: '/blog/protein-porridge-and-yogurt-breakfasts-uk' },
  { label: 'generate weekly meal plan', to: '/quiz' },
  { label: 'high protein snacks UK', to: '/blog/high-protein-snacks-uk' },
  { label: 'best meal prep containers UK', to: '/meal-prep-containers' },
  { label: 'low calorie ready meals UK', to: '/blog/best-low-calorie-ready-meals-uk' },
  { label: 'cheap student Aldi meal prep', to: '/meal-plans/cheap-student-meal-prep-aldi' },
  { label: 'vegetarian batch cooking meal plan', to: '/meal-plans/vegetarian-batch-cooking-meal-plan' },
];

export default function PopularSearches({
  title = 'Popular UK Searches',
  intro = 'Jump to the guides and plan hubs people are already searching for.',
  links = DEFAULT_LINKS,
  className = '',
}) {
  const headingId = useId();

  return (
    <section className={['popular-searches', className].filter(Boolean).join(' ')} aria-labelledby={headingId}>
      <div className="popular-searches-head">
        <h2 id={headingId}>{toTitleCase(title)}</h2>
        <p>{intro}</p>
      </div>
      <div className="popular-searches-links">
        {links.map(link => (
          <Link key={link.to} to={link.to}>{toTitleCase(link.label)}</Link>
        ))}
      </div>
    </section>
  );
}

export { DEFAULT_LINKS as POPULAR_SEARCH_LINKS };
