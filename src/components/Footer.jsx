import { Link } from 'react-router-dom';
import { FOOTER_GROUPS } from '../data/navigation.js';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner footer-inner--grouped">
        <div className="footer-lead">
          <Link to="/" className="footer-brand">MealPrep</Link>
          <p>
            Free UK meal plans, shopping lists, calculators and container guidance for a simpler week.
          </p>
        </div>

        <nav className="footer-nav-grid" aria-label="Footer navigation">
          {FOOTER_GROUPS.map(group => (
            <div className="footer-col" key={group.label}>
              <h2>{group.label}</h2>
              <ul>
                {group.items.map(link => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <p className="footer-disclaimer">
        General meal-planning information only. Calories and macros are estimates; speak to a qualified professional for clinical dietary needs.
      </p>
      <span className="footer-copy">&copy; {new Date().getFullYear()} MealPrep.org.uk</span>
    </footer>
  );
}
