import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { to: '/browse', label: 'Plans' },
  { to: '/meal-plans', label: 'Supermarkets' },
  { to: '/blog', label: 'Guides' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/tools', label: 'Tools' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link to="/" className="footer-brand">MealPrep</Link>
        <nav className="footer-links" aria-label="Footer navigation">
          {FOOTER_LINKS.map(link => (
            <Link key={link.to} to={link.to}>{link.label}</Link>
          ))}
        </nav>
        <span className="footer-copy">&copy; {new Date().getFullYear()}</span>
      </div>
      <p className="footer-disclaimer">
        General meal-planning information only. Calories and macros are estimates; speak to a qualified professional for clinical dietary needs.
      </p>
    </footer>
  );
}
