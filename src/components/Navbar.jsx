import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ menuOpen = false, onMenuToggle }) {
  const location = useLocation();
  const quizActive = location.pathname === '/quiz' || location.pathname === '/quiz/results';

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

        <div className="nav-right">
          <Link
            to="/quiz"
            className={quizActive ? 'nav-quiz-btn nav-quiz-btn--active' : 'nav-quiz-btn'}
            aria-current={quizActive ? 'page' : undefined}
          >
            Find my plan
          </Link>
        </div>
      </div>
    </nav>
  );
}
