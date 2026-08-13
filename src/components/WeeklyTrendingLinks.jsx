import { Link } from 'react-router-dom';
import { WEEKLY_TRENDING_LINKS } from '../data/weeklySeoInsights.js';

export default function WeeklyTrendingLinks({
  title = 'Popular this week',
  intro = 'Guides and meal-planning routes readers are finding useful right now.',
  compact = false,
  className = '',
}) {
  const links = compact ? WEEKLY_TRENDING_LINKS.slice(0, 4) : WEEKLY_TRENDING_LINKS.slice(0, 8);

  if (!links.length) return null;

  return (
    <section className={`weekly-trending-links ${className}`.trim()} aria-labelledby="weekly-trending-heading">
      <div className="weekly-trending-head">
        <h2 id="weekly-trending-heading">{title}</h2>
        <p>{intro}</p>
      </div>

      <div className="weekly-trending-grid">
        {links.map(link => (
          <Link key={`${link.to}-${link.label}`} to={link.to} className="weekly-trending-card">
            <strong>{link.label}</strong>
            {link.description && <span>{link.description}</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
