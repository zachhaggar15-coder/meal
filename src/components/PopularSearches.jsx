import { useId } from 'react';
import { Link } from 'react-router-dom';
import { toTitleCase } from '../utils/textFormatting.js';

const DEFAULT_LINKS = [
  { label: 'Aldi 1500 Calorie Meal Plan', to: '/meal-plans/aldi-1500-calorie-meal-plan' },
  { label: 'Tesco High Protein Meal Plan', to: '/meal-plans/tesco-high-protein-meal-plan' },
  { label: 'Work Lunch Meal Prep UK', to: '/meal-plans/work-lunch-meal-prep-uk' },
  { label: 'Low Calorie Foods UK', to: '/blog/best-low-calorie-foods-uk' },
  { label: 'Printable 1500 Calorie Meal Plan', to: '/meal-plans/1500-calorie' },
  { label: 'Lose Weight Meal Plan UK', to: '/meal-plans/weight-loss' },
  { label: 'Cheap Protein UK', to: '/blog/best-cheap-high-protein-foods-uk' },
  { label: 'Protein Porridge UK', to: '/blog/protein-porridge-and-yogurt-breakfasts-uk' },
  { label: 'Generate Weekly Meal Plan', to: '/quiz' },
  { label: 'Summer Meals UK', to: '/blog/summer-meals-uk' },
  { label: 'High Protein Snacks UK', to: '/blog/high-protein-snacks-uk' },
  { label: 'Best Meal Prep Containers UK', to: '/meal-prep-containers' },
  { label: 'Low Calorie Ready Meals UK', to: '/blog/best-low-calorie-ready-meals-uk' },
  { label: 'Cheap Student Aldi Meal Prep', to: '/meal-plans/cheap-student-meal-prep-aldi' },
  { label: 'Vegetarian Batch Cooking Meal Plan', to: '/meal-plans/vegetarian-batch-cooking-meal-plan' },
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
