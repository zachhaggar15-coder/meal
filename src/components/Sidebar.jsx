import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV = [
  {
    label: 'Calorie Targets',
    items: [
      { to: '/meal-plan/1500-calorie-meal-plan', label: '1500 Calorie' },
      { to: '/meal-plan/1800-calorie-meal-plan', label: '1800 Calorie' },
      { to: '/meal-plan/2000-calorie-meal-plan', label: '2000 Calorie' },
      { to: '/meal-plan/2500-calorie-meal-plan', label: '2500 Calorie' },
    ],
  },
  {
    label: 'By Supermarket',
    items: [
      { to: '/meal-plan/aldi-low-calorie-meal-plan', label: 'Aldi – Low Calorie' },
      { to: '/meal-plan/aldi-1800-calorie-meal-plan', label: 'Aldi – 1800 Calorie' },
      { to: '/meal-plan/aldi-high-protein-meal-plan', label: 'Aldi – High Protein' },
      { to: '/meal-plan/asda-1500-calorie-meal-plan', label: 'Asda – 1500 Calorie' },
      { to: '/meal-plan/asda-1800-calorie-meal-plan', label: 'Asda – 1800 Calorie' },
      { to: '/meal-plan/iceland-budget-meal-plan', label: 'Iceland – Budget' },
      { to: '/meal-plan/lidl-1800-calorie-meal-plan', label: 'Lidl – 1800 Calorie' },
      { to: '/meal-plan/morrisons-low-calorie-meal-plan', label: 'Morrisons – Low Cal' },
      { to: '/meal-plan/morrisons-1800-calorie-meal-plan', label: 'Morrisons – 1800 Cal' },
      { to: '/meal-plan/sainsburys-low-calorie-meal-plan', label: "Sainsbury's – Low Cal" },
      { to: '/meal-plan/sainsburys-1800-calorie-meal-plan', label: "Sainsbury's – 1800 Cal" },
      { to: '/meal-plan/tesco-low-calorie-meal-plan', label: 'Tesco – Low Calorie' },
      { to: '/meal-plan/tesco-1800-calorie-meal-plan', label: 'Tesco – 1800 Calorie' },
      { to: '/meal-plan/tesco-high-protein-meal-plan', label: 'Tesco – High Protein' },
    ],
  },
  {
    label: 'By Goal',
    items: [
      { to: '/meal-plan/high-protein-low-calorie-meal-plan', label: 'High Protein Low Cal' },
      { to: '/meal-plan/budget-fat-loss-meal-plan-uk', label: 'Budget Fat Loss' },
      { to: '/meal-plan/muscle-gain-meal-plan-uk', label: 'Muscle Gain' },
      { to: '/meal-plan/gym-beginner-meal-plan-uk', label: 'Gym Beginner' },
      { to: '/meal-plan/budget-bodybuilding-meal-plan-uk', label: 'Budget Bodybuilding' },
      { to: '/meal-plan/cheap-student-meal-plan-uk', label: 'Cheap Student' },
      { to: '/meal-plan/cheap-high-protein-meal-plan-uk', label: 'Cheap High Protein' },
      { to: '/meal-plan/low-effort-meal-plan-uk', label: 'Low Effort' },
      { to: '/meal-plan/busy-professional-meal-plan-uk', label: 'Busy Professional' },
    ],
  },
  {
    label: 'Diet Type',
    items: [
      { to: '/meal-plan/vegetarian-low-calorie-meal-plan', label: 'Vegetarian Low Cal' },
      { to: '/meal-plan/high-protein-vegetarian-meal-plan-uk', label: 'High Protein Vegetarian' },
      { to: '/meal-plan/vegan-low-calorie-meal-plan', label: 'Vegan Low Calorie' },
    ],
  },
  {
    label: 'Blog',
    items: [
      { to: '/blog/how-to-lose-weight-fast-uk', label: 'How to Lose Weight Fast' },
      { to: '/blog/how-to-build-a-calorie-deficit', label: 'Calorie Deficit Guide' },
      { to: '/blog/how-many-calories-to-lose-weight', label: 'How Many Calories?' },
      { to: '/blog/high-protein-breakfast-uk', label: 'High Protein Breakfast' },
      { to: '/blog/high-protein-low-calorie-meals', label: 'High Protein Meals' },
      { to: '/blog/how-much-protein-when-dieting', label: 'Protein When Dieting' },
      { to: '/blog/meal-prep-for-beginners-uk', label: 'Meal Prep for Beginners' },
      { to: '/blog/how-to-meal-plan-for-weight-loss', label: 'Meal Plan for Weight Loss' },
      { to: '/blog/best-low-calorie-foods-uk', label: 'Best Low Calorie Foods' },
      { to: '/blog/best-cheap-high-protein-foods-uk', label: 'Cheap High Protein Foods' },
      { to: '/blog/cheap-meal-prep-shopping-list-uk', label: 'Cheap Meal Prep List' },
      { to: '/blog/tesco-low-calorie-shopping-list', label: 'Tesco Shopping List' },
      { to: '/blog/aldi-vs-tesco-meal-prep', label: 'Aldi vs Tesco' },
      { to: '/blog/cheapest-uk-supermarket-meal-prep', label: 'Cheapest Supermarket' },
      { to: '/blog/1500-vs-1800-vs-2000-calories', label: '1500 vs 1800 vs 2000 Cal' },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState({ 'Calorie Targets': true });

  function toggle(label) {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  }

  function isActive(to) {
    return location.pathname === to;
  }

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden />}
      <nav className={`sidebar${open ? ' sidebar--open' : ''}`} aria-label="Site navigation">
        <div className="sidebar-inner">
          <Link to="/" className={`sidebar-home${location.pathname === '/' ? ' sidebar-link--active' : ''}`} onClick={onClose}>
            Generator
          </Link>
          <Link to="/stickers" className={`sidebar-top-link${location.pathname === '/stickers' ? ' sidebar-link--active' : ''}`} onClick={onClose}>
            Meal Prep Labels
          </Link>

          {NAV.map(group => (
            <div key={group.label} className="sidebar-group">
              <button
                className="sidebar-group-btn"
                onClick={() => toggle(group.label)}
                aria-expanded={!!expanded[group.label]}
                type="button"
              >
                <span>{group.label}</span>
                <span className="sidebar-arrow">{expanded[group.label] ? '▴' : '▾'}</span>
              </button>
              {expanded[group.label] && (
                <ul className="sidebar-list">
                  {group.items.map(item => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={`sidebar-link${isActive(item.to) ? ' sidebar-link--active' : ''}`}
                        onClick={onClose}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
