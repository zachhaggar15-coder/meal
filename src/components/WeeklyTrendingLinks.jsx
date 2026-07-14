import { Link } from 'react-router-dom';
import { WEEKLY_TRENDING_LINKS } from '../data/weeklySeoInsights.js';
import { toTitleCase } from '../utils/textFormatting.js';

export default function WeeklyTrendingLinks({
  title = 'Popular this week',
  intro = 'Current search and site analytics are pointing readers toward these UK meal prep guides.',
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
          <Link key={`${link.to}-${link.sourceQuery || link.label}`} to={link.to} className="weekly-trending-card">
            <strong>{toTitleCase(link.label)}</strong>
            <span>{link.reason ? toTitleCase(link.reason) : 'Current Reader Demand'}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
