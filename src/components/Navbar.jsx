import { Link } from 'react-router-dom';
import { PLAN_COUNT } from '../data/planSeeds.js';

const NAV_LINKS = [
  { to: '/browse', label: 'Plans' },
  { to: '/meal-plans', label: 'Supermarkets' },
  { to: '/blog', label: 'Guides' },
  { to: '/about', label: 'About' },
];

export default function Navbar({ menuOpen = false, onMenuToggle }) {
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

        <div className="nav-links" aria-label={`Browse ${PLAN_COUNT} meal plans`}>
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to}>{link.label}</Link>
          ))}
        </div>

        <Link to="/quiz" className="nav-quiz-btn">Find my plan</Link>
      </div>
    </nav>
  );
}
