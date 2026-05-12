import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PLANS = [
  { slug: '1500-calorie-meal-plan', label: '1500 Calorie Meal Plan', tag: 'Popular' },
  { slug: '1800-calorie-meal-plan', label: '1800 Calorie Meal Plan', tag: '' },
  { slug: '2000-calorie-meal-plan', label: '2000 Calorie Meal Plan', tag: '' },
  { slug: 'high-protein-low-calorie-meal-plan', label: 'High Protein Plan', tag: '' },
  { slug: 'tesco-low-calorie-meal-plan', label: 'Tesco Meal Plan', tag: '' },
  { slug: 'aldi-low-calorie-meal-plan', label: 'Aldi Meal Plan', tag: '' },
  { slug: 'vegetarian-low-calorie-meal-plan', label: 'Vegetarian Plan', tag: '' },
  { slug: 'vegan-low-calorie-meal-plan', label: 'Vegan Plan', tag: '' },
];

export default function Navbar({ onMenuToggle }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <div className="nav-inner">
        <button className="nav-menu-toggle" onClick={onMenuToggle} aria-label="Toggle navigation menu" type="button">
          ☰
        </button>
        <Link to="/" className="nav-brand">MealPrep.org.uk</Link>
        <div className="nav-right" ref={menuRef}>
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
              {PLANS.map(p => (
                <Link
                  key={p.slug}
                  to={`/meal-plan/${p.slug}`}
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
