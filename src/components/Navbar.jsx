import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteLogo from './SiteLogo.jsx';
import { PLAN_COUNT } from '../data/planSeeds.js';
import { buildPlanChooserPath } from '../data/planChooser.js';

const QUICK_PLANS = [
  { to: '/meal-plans/weight-loss',             label: 'Weight Loss Meal Plans', tag: 'Hub' },
  { to: '/meal-plans/high-protein',            label: 'High Protein Meal Plans', tag: '' },
  { to: '/plans/aldi-weight-loss-1500',        label: 'Aldi Weight Loss 1,500 kcal', tag: 'Popular' },
  { to: '/plans/tesco-weight-loss-1800',       label: 'Tesco Weight Loss 1,800 kcal', tag: '' },
  { to: buildPlanChooserPath('high-protein-low-cal'), label: 'High Protein Low Cal', tag: '' },
  { to: buildPlanChooserPath('muscle-gain'),   label: 'Muscle Gain', tag: '' },
  { to: buildPlanChooserPath('cheap-student'), label: 'Cheap Student', tag: '' },
  { to: '/plans/aldi-veg-low-cal-1500',        label: 'Vegetarian Low Cal', tag: '' },
  { to: '/plans/aldi-vegan-low-cal-1500',      label: 'Vegan Low Cal', tag: '' },
  { to: '/meal-plans/meal-plans-with-shopping-list', label: 'Plans with Shopping Lists', tag: '' },
  { to: '/browse',                             label: `All ${PLAN_COUNT} plans \u2192`, tag: '' },
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
        <SiteLogo variant="nav" showName />
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
