import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PLAN_COUNT } from '../data/planSeeds.js';
import {
  buildCalorieChooserPath,
  buildDietChooserPath,
  buildPlanChooserPath,
  buildSupermarketChooserPath,
  CALORIE_CHOICES,
  DIET_CHOICES,
  GOAL_CHOOSER_ITEMS,
  SUPERMARKET_CHOICES,
} from '../data/planChooser.js';

const NAV = [
  {
    label: 'Meal Plan Hubs',
    items: [
      { to: '/meal-plans/weight-loss',                 label: 'Weight Loss Plans' },
      { to: '/meal-plans/1500-calorie',                label: '1500 Calorie Plans' },
      { to: '/meal-plans/high-protein',                label: 'High Protein Plans' },
      { to: '/meal-plans/muscle-gain',                 label: 'Muscle Gain Plans' },
      { to: '/meal-plans/3000-calorie',                label: '3000 Calorie Plans' },
      { to: '/meal-plans/3500-calorie',                label: '3500 Calorie Plans' },
      { to: '/meal-plans/vegetarian',                  label: 'Vegetarian Plans' },
      { to: '/meal-plans/generic-uk-supermarket',      label: 'Generic UK Plans' },
      { to: '/meal-plans/aldi',                        label: 'Aldi Meal Plans' },
      { to: '/meal-plans/tesco-weight-loss',           label: 'Tesco Weight Loss' },
      { to: '/meal-plans/printable-meal-plans',        label: 'Printable PDF Plans' },
      { to: '/meal-plans/meal-plans-with-shopping-list', label: 'Plans with Shopping Lists' },
    ],
  },
  {
    label: 'By Goal',
    items: GOAL_CHOOSER_ITEMS.map(item => ({
      to: buildPlanChooserPath(item.value),
      label: item.label,
    })),
  },
  {
    label: 'By Supermarket',
    items: SUPERMARKET_CHOICES.map(item => ({
      to: buildSupermarketChooserPath(item.value),
      label: item.label,
    })),
  },
  {
    label: 'By Calories',
    items: CALORIE_CHOICES.map(item => ({
      to: buildCalorieChooserPath(item.value),
      label: `~${item.label}`,
    })),
  },
  {
    label: 'Diet Type',
    items: DIET_CHOICES.map(item => ({
      to: buildDietChooserPath(item.value),
      label: item.label,
    })),
  },
  {
    label: 'Container Guides',
    items: [
      { to: '/meal-prep-containers/budget',             label: 'Budget Containers' },
      { to: '/meal-prep-containers/mid-range',          label: 'Mid Range Containers' },
      { to: '/meal-prep-containers/premium',            label: 'Premium Containers' },
      { to: '/blog/best-meal-prep-containers-uk',       label: 'Best Containers UK' },
      { to: '/blog/leakproof-meal-prep-containers-uk',  label: 'Leakproof Containers' },
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
      { to: '/blog/3000-vs-3500-calorie-meal-plan-uk',       label: '3000 vs 3500 Calories' },
      { to: '/blog/intermittent-fasting-meal-plan-uk',       label: 'Intermittent Fasting' },
      { to: '/blog/meal-prep-for-beginners-uk',              label: 'Meal Prep for Beginners' },
      { to: '/blog/batch-cooking-for-beginners-uk',          label: 'Batch Cooking Guide' },
      { to: '/blog/best-cheap-high-protein-foods-uk',        label: 'Cheap High Protein Foods' },
      { to: '/blog/vegan-meal-prep-uk',                      label: 'Vegan Meal Prep' },
      { to: '/blog/vegetarian-meal-prep-uk',                 label: 'Vegetarian Meal Prep' },
      { to: '/blog/aldi-vs-tesco-meal-prep',                 label: 'Aldi vs Tesco' },
      { to: '/blog/aldi-vs-lidl-meal-prep',                  label: 'Aldi vs Lidl' },
      { to: '/blog/best-supermarket-for-high-protein-meal-prep-uk', label: 'Best High Protein Supermarket' },
      { to: '/blog/sainsburys-meal-prep-uk',                 label: "Sainsbury's Meal Prep" },
      { to: '/blog/asda-meal-prep-uk',                       label: 'Asda Meal Prep' },
      { to: '/blog/meal-prep-containers-uk',                 label: 'Meal Prep Containers' },
      { to: '/blog/best-meal-prep-containers-uk',            label: 'Best Meal Prep Containers' },
      { to: '/blog/glass-vs-plastic-meal-prep-containers',   label: 'Glass vs Plastic Containers' },
      { to: '/blog/meal-prep-container-size-guide',          label: 'Container Size Guide' },
      { to: '/blog/budget-vs-premium-meal-prep-containers',  label: 'Budget vs Premium Containers' },
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
            to="/meal-prep-containers/mid-range"
            className={`sidebar-top-link${location.pathname.startsWith('/meal-prep-containers') ? ' sidebar-link--active' : ''}`}
            onClick={onClose}
          >
            Meal Prep Containers
          </Link>

          <Link
            to="/blog"
            className={`sidebar-top-link${location.pathname === '/blog' ? ' sidebar-link--active' : ''}`}
            onClick={onClose}
          >
            Blog
          </Link>

          <Link
            to="/tools"
            className={`sidebar-top-link${location.pathname === '/tools' ? ' sidebar-link--active' : ''}`}
            onClick={onClose}
          >
            Tools
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
