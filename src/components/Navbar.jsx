import { Link, useLocation } from 'react-router-dom';
import {
  NAV_DROPDOWNS,
  PRIMARY_NAV_LINKS,
} from '../data/navigation.js';
import SiteSearch from './SiteSearch.jsx';

export default function Navbar({ menuOpen = false, onMenuToggle }) {
  const location = useLocation();
  const currentUrl = `${location.pathname}${location.search}`;

  function linkProps(link) {
    const active = link.match
      ? link.match(location.pathname, location.search)
      : location.pathname === link.to;
    return {
      className: active ? 'nav-link nav-link--active' : 'nav-link',
      'aria-current': active ? 'page' : undefined,
    };
  }

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <div className="nav-inner">
        <div className="nav-left">
          <button
            className="nav-menu-toggle"
            onClick={onMenuToggle}
            aria-controls="site-sidebar"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            type="button"
          >
            Menu
          </button>
          <Link to="/" className="nav-brand" aria-label="MealPrep home">MealPrep</Link>
        </div>

        <div className="nav-links" aria-label="Primary navigation">
          {PRIMARY_NAV_LINKS.slice(0, 2).map(link => (
            <Link key={link.to} to={link.to} {...linkProps(link)}>{link.label}</Link>
          ))}
          {NAV_DROPDOWNS.map(group => {
            const active = group.match?.(location.pathname, location.search);
            return (
              <details key={group.label} className={active ? 'nav-popover nav-popover--active' : 'nav-popover'}>
                <summary>{group.label}</summary>
                <div className="nav-popover-menu">
                  {group.items.map(item => {
                    const itemActive = currentUrl === item.to || location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={itemActive ? 'nav-popover-link nav-popover-link--active' : 'nav-popover-link'}
                        aria-current={itemActive ? 'page' : undefined}
                      >
                        <strong>{item.label}</strong>
                        {item.description && <span>{item.description}</span>}
                      </Link>
                    );
                  })}
                </div>
              </details>
            );
          })}
          {PRIMARY_NAV_LINKS.slice(2).map(link => (
            <Link key={link.to} to={link.to} {...linkProps(link)}>{link.label}</Link>
          ))}
        </div>

        <div className="nav-right">
          <SiteSearch id="nav-site-search" className="site-search--nav" maxResults={6} />
          <Link to="/quiz" className="nav-quiz-btn">Find my plan</Link>
        </div>
      </div>
    </nav>
  );
}
