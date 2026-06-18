import { useId } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_LINKS = [
  { label: 'low calorie foods UK', to: '/blog/best-low-calorie-foods-uk' },
  { label: 'printable 1500 calorie meal plan', to: '/meal-plans/1500-calorie' },
  { label: 'high protein snacks UK', to: '/blog/high-protein-snacks-uk' },
  { label: 'best meal prep containers UK', to: '/blog/best-meal-prep-containers-uk' },
  { label: 'low calorie ready meals UK', to: '/blog/best-low-calorie-ready-meals-uk' },
  { label: 'free online diet plans UK', to: '/meal-plans/free-online-diet-plans-uk' },
  { label: 'what does 1500 calories look like?', to: '/blog/what-does-1500-calories-look-like-uk' },
  { label: 'cheap protein foods UK', to: '/blog/best-cheap-high-protein-foods-uk' },
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
        <h2 id={headingId}>{title}</h2>
        <p>{intro}</p>
      </div>
      <div className="popular-searches-links">
        {links.map(link => (
          <Link key={link.to} to={link.to}>{link.label}</Link>
        ))}
      </div>
    </section>
  );
}

export { DEFAULT_LINKS as POPULAR_SEARCH_LINKS };
