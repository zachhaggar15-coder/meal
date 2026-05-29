import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const QUICK_PLANS = [
  { to: '/plans/aldi-weight-loss-1500',        label: 'Aldi Weight Loss 1,500 kcal', tag: 'Popular' },
  { to: '/plans/tesco-weight-loss-1800',       label: 'Tesco Weight Loss 1,800 kcal', tag: '' },
  { to: '/plans/aldi-high-protein-low-cal-1500',label: 'High Protein Low Cal', tag: '' },
  { to: '/plans/aldi-muscle-gain-2000',        label: 'Muscle Gain 2,000 kcal', tag: '' },
  { to: '/plans/aldi-cheap-student-1800',      label: 'Cheap Student', tag: '' },
  { to: '/plans/aldi-veg-low-cal-1500',        label: 'Vegetarian Low Cal', tag: '' },
  { to: '/plans/aldi-vegan-low-cal-1500',      label: 'Vegan Low Cal', tag: '' },
  { to: '/browse',                             label: 'All 250 plans →', tag: '' },
];

export default function Navbar({ onMenuToggle }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <button className="nav-menu-toggle" onClick={onMenuToggle} aria-label="Toggle navigation menu" type="button">
        ☰
      </button>
      <div className="nav-inner">
        <Link to="/" className="nav-brand">MealPrep.org.uk</Link>
        <div className="nav-right" ref={menuRef}>
          <Link to="/quiz" className="nav-quiz-btn">Find My Plan</Link>
          <button
            className="nav-plans-btn"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-haspopup="menu"
          >
            Browse Plans <span aria-hidden="true">{open ? '▴' : '▾'}</span>
          </button>
          {open && (
            <div className="nav-dropdown" role="menu">
              {QUICK_PLANS.map(p => (
                <Link
                  key={p.to}
                  to={p.to}
                  className="nav-dropdown-item"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  {p.label}
                  {p.tag && <span className="nav-dd-tag">{p.tag}</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
