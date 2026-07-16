import { Link } from 'react-router-dom';
import { CONTAINER_GUIDE_GROUPS } from '../data/containerProducts.js';

export default function ContainerGuideNav({ currentSlug = 'hub' }) {
  return (
    <div className="container-guide-nav" aria-label="Meal prep container guide groups">
      <div className="container-guide-nav-group">
        <span>Start here</span>
        <div className="container-tier-nav">
          <Link
            to="/meal-prep-containers"
            className={currentSlug === 'hub' ? 'container-tier-link container-tier-link--active' : 'container-tier-link'}
          >
            Best containers
          </Link>
        </div>
      </div>

      {CONTAINER_GUIDE_GROUPS.map(group => (
        <div key={group.label} className="container-guide-nav-group">
          <span>{group.label}</span>
          <div className="container-tier-nav">
            {group.guides.map(guide => (
              <Link
                key={guide.slug}
                to={`/meal-prep-containers/${guide.slug}`}
                className={currentSlug === guide.slug ? 'container-tier-link container-tier-link--active' : 'container-tier-link'}
              >
                {guide.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
