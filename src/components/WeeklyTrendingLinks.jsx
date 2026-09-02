import { Link } from 'react-router-dom';
import { WEEKLY_TRENDING_LINKS } from '../data/weeklySeoInsights.js';

// "This week" was not true on either count: WEEKLY_SEO_INSIGHTS carries a
// 28-day range, and it is written by a job (scripts/weekly-analytics-
// improvements.js) that has to be run - the committed file was nine days stale
// when this was written. So the copy describes the window the data covers and
// claims no refresh cadence, which stays true however long the job goes
// unrun.
export default function WeeklyTrendingLinks({
  title = 'Popular this month',
  intro = 'What readers opened most over the last four weeks of site analytics.',
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
