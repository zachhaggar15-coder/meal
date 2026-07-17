import { useEffect, useState } from 'react';
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

const TOOL_LINKS = [
  { to: '/tools#fridge-dinner-builder', label: 'Fridge Dinner Builder' },
  { to: '/tools#calorie-calculator', label: 'Calorie Calculator' },
  { to: '/tools#protein-calculator', label: 'Protein Calculator' },
  { to: '/tools#shopping-budget-estimator', label: 'Shopping Budget Estimator' },
  { to: '/tools#container-count-calculator', label: 'Container Count Recommender' },
  { to: '/tools#printable-plans', label: 'Printable Plans' },
];

const NAV = [
  {
    label: 'Planning Tools',
    items: TOOL_LINKS,
  },
  {
    label: 'Meal Plan Hubs',
    items: [
      { to: '/meal-plans/free-online-diet-plans-uk', label: 'Free Online Diet Plans' },
      { to: '/meal-plans/weight-loss', label: 'Weight Loss Meal Plan UK' },
      { to: '/meal-plans/low-calorie', label: 'Low Calorie Meal Plans UK' },
      { to: '/meal-plans/1200-calorie', label: '1200 Calorie Plans' },
      { to: '/meal-plans/1400-calorie', label: '1400 Calorie Plans' },
      { to: '/meal-plans/1500-calorie', label: '1500 Calorie Plans' },
      { to: '/meal-plans/1800-calorie', label: '1800 Calorie Plans' },
      { to: '/meal-plans/2000-calorie', label: '2000 Calorie Plans' },
      { to: '/meal-plans/2500-calorie', label: '2500 Calorie Plans' },
      { to: '/meal-plans/high-protein', label: 'High Protein Plans' },
      { to: '/meal-plans/muscle-gain', label: 'Muscle Gain Plans' },
      { to: '/meal-plans/3000-calorie', label: '3000 Calorie Plans' },
      { to: '/meal-plans/3500-calorie', label: '3500 Calorie Plans' },
      { to: '/meal-plans/vegetarian', label: 'Vegetarian Plans' },
      { to: '/meal-plans/vegan', label: 'Vegan Plans' },
      { to: '/meal-plans/pescatarian', label: 'Pescatarian Plans' },
      { to: '/meal-plans/generic-uk-supermarket', label: 'Generic UK Plans' },
      { to: '/meal-plans/aldi', label: 'Aldi Meal Plans' },
      { to: '/meal-plans/tesco', label: 'Tesco Meal Plans' },
      { to: '/meal-plans/lidl', label: 'Lidl Meal Plans' },
      { to: '/meal-plans/printable-meal-plans', label: 'Printable PDF Plans' },
      { to: '/meal-plans/meal-plans-with-shopping-list', label: 'Plans with Shopping Lists' },
      { to: '/meal-plans/low-calorie-shopping-list', label: 'Low Calorie Shopping List' },
      { to: '/meal-plans/high-protein-shopping-list', label: 'High Protein Shopping List' },
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
      { to: '/meal-prep-containers', label: 'Best Meal Prep Containers' },
      { to: '/meal-prep-containers/budget', label: 'Budget Containers' },
      { to: '/meal-prep-containers/mid-range', label: 'Mid Range Containers' },
      { to: '/meal-prep-containers/premium', label: 'Premium Containers' },
      { to: '/blog/best-meal-prep-containers-uk', label: 'Best Containers UK' },
      { to: '/blog/leakproof-meal-prep-containers-uk', label: 'Leakproof Containers' },
    ],
  },
  {
    label: 'Blog',
    items: [
      { to: '/blog/how-to-lose-weight-fast-uk', label: 'How to Lose Weight Fast' },
      { to: '/blog/how-to-build-a-calorie-deficit', label: 'Calorie Deficit Guide' },
      { to: '/blog/how-many-calories-to-lose-weight', label: 'How Many Calories?' },
      { to: '/blog/what-does-1500-calories-look-like-uk', label: 'What 1500 Calories Looks Like' },
      { to: '/blog/how-to-lose-belly-fat-uk', label: 'How to Lose Belly Fat' },
      { to: '/blog/high-protein-breakfast-uk', label: 'High Protein Breakfast' },
      { to: '/blog/protein-porridge-and-yogurt-breakfasts-uk', label: 'Protein Porridge UK' },
      { to: '/blog/high-protein-low-calorie-meals', label: 'High Protein Meals' },
      { to: '/blog/high-protein-snacks-uk', label: 'High Protein Snacks' },
      { to: '/blog/best-low-calorie-ready-meals-uk', label: 'Low Calorie Ready Meals' },
      { to: '/blog/low-calorie-snacks-uk', label: 'Low Calorie Snacks' },
      { to: '/blog/how-much-protein-when-dieting', label: 'Protein When Dieting' },
      { to: '/blog/anti-inflammatory-diet-meal-plan-uk', label: 'Anti-Inflammatory Diet' },
      { to: '/blog/menopause-diet-plan-uk', label: 'Menopause Diet Plan' },
      { to: '/blog/endurance-running-nutrition-uk', label: 'Endurance Nutrition' },
      { to: '/blog/cutting-diet-plan-uk', label: 'Cutting Phase Diet' },
      { to: '/blog/muscle-building-meal-plan-uk', label: 'Muscle Building Diet' },
      { to: '/blog/3000-vs-3500-calorie-meal-plan-uk', label: '3000 vs 3500 Calories' },
      { to: '/blog/intermittent-fasting-meal-plan-uk', label: 'Intermittent Fasting' },
      { to: '/blog/meal-prep-for-beginners-uk', label: 'Meal Prep for Beginners' },
      { to: '/blog/batch-cooking-for-beginners-uk', label: 'Batch Cooking Guide' },
      { to: '/blog/best-cheap-high-protein-foods-uk', label: 'Cheap Protein UK' },
      { to: '/blog/cheap-protein-sources-uk-supermarkets', label: 'Cheap Protein Sources' },
      { to: '/blog/vegan-meal-prep-uk', label: 'Vegan Meal Prep' },
      { to: '/blog/vegetarian-meal-prep-uk', label: 'Vegetarian Meal Prep' },
      { to: '/blog/aldi-vs-tesco-meal-prep', label: 'Aldi vs Tesco' },
      { to: '/blog/aldi-vs-lidl-meal-prep', label: 'Aldi vs Lidl' },
      { to: '/blog/best-supermarket-for-high-protein-meal-prep-uk', label: 'Best High Protein Supermarket' },
      { to: '/blog/sainsburys-meal-prep-uk', label: "Sainsbury's Meal Prep" },
      { to: '/blog/asda-meal-prep-uk', label: 'Asda Meal Prep' },
      { to: '/blog/meal-prep-containers-uk', label: 'Meal Prep Containers' },
      { to: '/blog/best-meal-prep-containers-uk', label: 'Best Meal Prep Containers' },
      { to: '/blog/glass-vs-plastic-meal-prep-containers', label: 'Glass vs Plastic Containers' },
      { to: '/blog/meal-prep-container-size-guide', label: 'Container Size Guide' },
      { to: '/blog/budget-vs-premium-meal-prep-containers', label: 'Budget vs Premium Containers' },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState({ 'Planning Tools': true, 'By Goal': true, 'By Supermarket': true });

  function toggle(label) {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function isActive(to) {
    const [path, hash] = to.split('#');
    if (hash) {
      return location.pathname === path && location.hash === `#${hash}`;
    }
    return location.pathname === to;
  }

  return (
    <>
      <div className="sidebar-backdrop" onClick={onClose} aria-hidden />
      <nav id="site-sidebar" className="sidebar sidebar--open" aria-label="Site navigation">
        <div className="sidebar-inner">
          <button className="sidebar-close-btn" onClick={onClose} type="button">
            Close menu
          </button>

          <Link to="/quiz" className="sidebar-quiz-cta" onClick={onClose}>
            Find My Plan - Take the Quiz
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
            to="/meal-plans"
            className={`sidebar-top-link${location.pathname === '/meal-plans' ? ' sidebar-link--active' : ''}`}
            onClick={onClose}
          >
            Supermarkets
          </Link>

          <Link
            to="/meal-prep-containers"
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
            to="/about"
            className={`sidebar-top-link${location.pathname === '/about' ? ' sidebar-link--active' : ''}`}
            onClick={onClose}
          >
            About
          </Link>

          <Link
            to="/contact"
            className={`sidebar-top-link${location.pathname === '/contact' ? ' sidebar-link--active' : ''}`}
            onClick={onClose}
          >
            Contact
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
                <span className="sidebar-arrow" aria-hidden="true">{expanded[group.label] ? '-' : '+'}</span>
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
