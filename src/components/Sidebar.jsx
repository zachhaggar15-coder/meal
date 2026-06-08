import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PLAN_COUNT } from '../data/planSeeds.js';

const NAV = [
  {
    label: 'By Goal',
    items: [
      { to: '/plans/aldi-weight-loss-1500',           label: 'Weight Loss' },
      { to: '/plans/aldi-budget-fat-loss-1500',        label: 'Budget Fat Loss' },
      { to: '/plans/aldi-high-protein-low-cal-1500',   label: 'High Protein Low Cal' },
      { to: '/plans/aldi-muscle-gain-2000',            label: 'Muscle Gain' },
      { to: '/plans/aldi-gym-beginner-1800',           label: 'Gym Beginner' },
      { to: '/plans/aldi-budget-bodybuilding-2000',    label: 'Budget Bodybuilding' },
      { to: '/plans/aldi-cheap-student-1800',          label: 'Cheap Student' },
      { to: '/plans/aldi-cheap-hp-1800',               label: 'Cheap High Protein' },
      { to: '/plans/aldi-low-effort-1800',             label: 'Low Effort' },
      { to: '/plans/aldi-busy-professional-1800',      label: 'Busy Professional' },
    ],
  },
  {
    label: 'By Supermarket',
    items: [
      { to: '/plans/aldi-weight-loss-1800',            label: 'Aldi' },
      { to: '/plans/lidl-weight-loss-1800',            label: 'Lidl' },
      { to: '/plans/tesco-weight-loss-1800',           label: 'Tesco' },
      { to: '/plans/asda-weight-loss-1800',            label: 'Asda' },
      { to: '/plans/sainsburys-weight-loss-1800',      label: "Sainsbury's" },
      { to: '/plans/morrisons-weight-loss-1800',       label: 'Morrisons' },
      { to: '/plans/iceland-weight-loss-1800',         label: 'Iceland' },
    ],
  },
  {
    label: 'By Calories',
    items: [
      { to: '/plans/any-weight-loss-1500',             label: '~1,500 kcal' },
      { to: '/plans/any-weight-loss-1800',             label: '~1,800 kcal' },
      { to: '/plans/any-muscle-gain-2000',             label: '~2,000 kcal' },
      { to: '/plans/any-muscle-gain-2500',             label: '~2,500 kcal' },
    ],
  },
  {
    label: 'Diet Type',
    items: [
      { to: '/plans/aldi-veg-low-cal-1500',            label: 'Vegetarian Low Cal' },
      { to: '/plans/aldi-hp-veg-1800',                 label: 'High Protein Vegetarian' },
      { to: '/plans/aldi-vegan-low-cal-1500',          label: 'Vegan Low Calorie' },
      { to: '/plans/aldi-pescatarian-1800',            label: 'Pescatarian' },
    ],
  },
  {
    label: 'Blog',
    items: [
      { to: '/blog/how-to-lose-weight-fast-uk',              label: 'How to Lose Weight Fast' },
      { to: '/blog/how-to-build-a-calorie-deficit',          label: 'Calorie Deficit Guide' },
      { to: '/blog/how-many-calories-to-lose-weight',        label: 'How Many Calories?' },
      { to: '/blog/how-to-lose-belly-fat-uk',                label: 'How to Lose Belly Fat' },
      { to: '/blog/high-protein-breakfast-uk',               label: 'High Protein Breakfast' },
      { to: '/blog/high-protein-low-calorie-meals',          label: 'High Protein Meals' },
      { to: '/blog/high-protein-snacks-uk',                  label: 'High Protein Snacks' },
      { to: '/blog/low-calorie-snacks-uk',                   label: 'Low Calorie Snacks' },
      { to: '/blog/how-much-protein-when-dieting',           label: 'Protein When Dieting' },
      { to: '/blog/anti-inflammatory-diet-meal-plan-uk',     label: 'Anti-Inflammatory Diet' },
      { to: '/blog/menopause-diet-plan-uk',                  label: 'Menopause Diet Plan' },
      { to: '/blog/endurance-running-nutrition-uk',          label: 'Endurance Nutrition' },
      { to: '/blog/cutting-diet-plan-uk',                    label: 'Cutting Phase Diet' },
      { to: '/blog/muscle-building-meal-plan-uk',            label: 'Muscle Building Diet' },
      { to: '/blog/intermittent-fasting-meal-plan-uk',       label: 'Intermittent Fasting' },
      { to: '/blog/meal-prep-for-beginners-uk',              label: 'Meal Prep for Beginners' },
      { to: '/blog/batch-cooking-for-beginners-uk',          label: 'Batch Cooking Guide' },
      { to: '/blog/best-cheap-high-protein-foods-uk',        label: 'Cheap High Protein Foods' },
      { to: '/blog/vegan-meal-prep-uk',                      label: 'Vegan Meal Prep' },
      { to: '/blog/vegetarian-meal-prep-uk',                 label: 'Vegetarian Meal Prep' },
      { to: '/blog/aldi-vs-tesco-meal-prep',                 label: 'Aldi vs Tesco' },
      { to: '/blog/sainsburys-meal-prep-uk',                 label: "Sainsbury's Meal Prep" },
      { to: '/blog/asda-meal-prep-uk',                       label: 'Asda Meal Prep' },
      { to: '/blog/meal-prep-containers-uk',                 label: 'Meal Prep Containers' },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState({ 'By Goal': true });

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
          <Link
            to="/quiz"
            className="sidebar-quiz-cta"
            onClick={onClose}
          >
            🎯 Find My Plan — Take the Quiz
          </Link>

          <Link
            to="/browse"
            className={`sidebar-top-link${location.pathname === '/browse' ? ' sidebar-link--active' : ''}`}
            onClick={onClose}
          >
            Browse All {PLAN_COUNT} Plans
          </Link>

          <Link
            to="/"
            className={`sidebar-top-link${location.pathname === '/' ? ' sidebar-link--active' : ''}`}
            onClick={onClose}
          >
            Home
          </Link>

          <Link
            to="/stickers"
            className={`sidebar-top-link${location.pathname === '/stickers' ? ' sidebar-link--active' : ''}`}
            onClick={onClose}
          >
            Meal Prep Containers
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
