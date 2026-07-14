import { Link } from 'react-router-dom';
import { WEEKLY_TRENDING_LINKS } from '../data/weeklySeoInsights.js';
import { toTitleCase } from '../utils/textFormatting.js';

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
        <h2 id="weekly-trending-heading">{toTitleCase(title)}</h2>
        <p>{intro}</p>
      </div>

      <div className="weekly-trending-grid">
        {links.map(link => (
          <Link key={`${link.to}-${link.label}`} to={link.to} className="weekly-trending-card">
            <strong>{toTitleCase(link.label)}</strong>
            <span>{link.description ? toTitleCase(link.description) : 'Useful For Planning This Week'}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
