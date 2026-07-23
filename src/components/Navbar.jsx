import { Link, useLocation } from 'react-router-dom';
import SiteSearch from './SiteSearch.jsx';
import { ACCESSORY_NAV_LINKS } from '../data/navigation.js';

const ACCESSORY_PATHS = new Set(ACCESSORY_NAV_LINKS.map(link => link.to));

const TOP_TABS = [
  { to: '/', label: 'Home', match: path => path === '/' },
  { to: '/quiz', label: 'Quiz', match: path => path === '/quiz' || path === '/quiz/results' },
  {
    to: '/meal-prep-accessories',
    label: 'Meal Prep Accessories',
    compactLabel: 'Accessories',
    match: path => path === '/meal-prep-accessories' || ACCESSORY_PATHS.has(path),
  },
  {
    to: '/meal-prep-containers',
    label: 'Meal prep containers',
    compactLabel: 'Containers',
    match: path => path.startsWith('/meal-prep-containers') && !ACCESSORY_PATHS.has(path),
  },
  { to: '/tools', label: 'Tools', match: path => path === '/tools' },
  { to: '/feedback', label: 'Feedback', match: path => path === '/feedback' },
];

export default function Navbar({ menuOpen = false, onMenuToggle }) {
  const location = useLocation();

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

        <div className="nav-tabs" aria-label="Quick links">
          {TOP_TABS.map(tab => {
            const active = tab.match(location.pathname);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={active ? 'nav-tab nav-tab--active' : 'nav-tab'}
                aria-current={active ? 'page' : undefined}
              >
                {tab.compactLabel ? (
                  <>
                    <span className="nav-tab-label--full">{tab.label}</span>
                    <span className="nav-tab-label--compact">{tab.compactLabel}</span>
                  </>
                ) : tab.label}
              </Link>
            );
          })}
        </div>

        <div className="nav-right">
          <Link to="/quiz" className="nav-mobile-quiz-btn">Find my plan</Link>
          <SiteSearch id="top-site-search" className="site-search--top" maxResults={6} />
        </div>
      </div>
    </nav>
  );
}
