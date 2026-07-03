import { Link } from 'react-router-dom';
import {
  DISCOVERY_PRIORITY_LINKS,
  SEARCH_OPPORTUNITY_CLUSTERS,
} from '../data/seoPriorityLinks.js';
import { toTitleCase } from '../utils/textFormatting.js';

export default function SearchOpportunityLinks({
  title = 'Search Console priority pages',
  intro = 'These links give important discovered pages and high-impression clusters clearer crawl paths from central pages.',
  showDiscovery = true,
  compact = false,
}) {
  const clusters = compact ? SEARCH_OPPORTUNITY_CLUSTERS.slice(0, 3) : SEARCH_OPPORTUNITY_CLUSTERS;

  return (
    <section className="search-opportunity-links" aria-labelledby="search-opportunity-heading">
      <div className="search-opportunity-head">
        <h2 id="search-opportunity-heading">{toTitleCase(title)}</h2>
        <p>{intro}</p>
      </div>

      <div className="search-opportunity-grid">
        {clusters.map(cluster => (
          <article className="search-opportunity-card" key={cluster.title}>
            <h3>{toTitleCase(cluster.title)}</h3>
            <p>{cluster.intro}</p>
            <div className="search-opportunity-card-links">
              {cluster.links.map(link => (
                <Link key={link.to} to={link.to}>{toTitleCase(link.label)}</Link>
              ))}
            </div>
          </article>
        ))}
      </div>

      {showDiscovery && (
        <div className="discovery-priority-links">
          <h3>{toTitleCase('Discovered-not-indexed sample links')}</h3>
          <p>
            The pages below now have explicit internal links from the browse graph instead of relying on sitemap discovery alone.
          </p>
          <div className="discovery-priority-list">
            {DISCOVERY_PRIORITY_LINKS.map(link => (
              <Link key={link.to} to={link.to}>
                <span>{toTitleCase(link.label)}</span>
                <small>{link.note}</small>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
