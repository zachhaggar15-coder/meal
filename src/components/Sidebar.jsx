import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MOBILE_NAV_GROUPS,
  PLAN_COUNT,
} from '../data/navigation.js';
import SiteSearch from './SiteSearch.jsx';

const DEFAULT_EXPANDED = MOBILE_NAV_GROUPS.reduce((state, group) => ({
  ...state,
  [group.label]: !!group.defaultOpen,
}), {});

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(DEFAULT_EXPANDED);

  function toggle(label) {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
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
    return location.pathname === path;
  }

  return (
    <>
      <div className="sidebar-backdrop" onClick={onClose} aria-hidden />
      <nav id="site-sidebar" className="sidebar sidebar--open" aria-label="Site navigation">
        <div className="sidebar-inner">
          <div className="sidebar-head">
            <Link to="/" className="sidebar-brand" onClick={onClose}>MealPrep</Link>
            <button className="sidebar-close-btn" onClick={onClose} type="button">
              Close
            </button>
          </div>

          <div className="sidebar-search-wrap">
            <SiteSearch
              id="sidebar-site-search"
              className="site-search--sidebar"
              placeholder="Search plans, guides, tools..."
              maxResults={8}
              onNavigate={onClose}
            />
          </div>

          <div className="sidebar-priority-actions" aria-label="Recommended actions">
            <Link to="/quiz" className="sidebar-quiz-cta" onClick={onClose}>
              Find My Plan
            </Link>
            <Link
              to="/browse"
              className={`sidebar-browse-cta${location.pathname === '/browse' ? ' sidebar-link--active' : ''}`}
              onClick={onClose}
            >
              Browse {PLAN_COUNT} Plans
            </Link>
          </div>

          {MOBILE_NAV_GROUPS.map(group => (
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
                        aria-current={isActive(item.to) ? 'page' : undefined}
                        onClick={onClose}
                      >
                        <span>{item.label}</span>
                        {item.description && <small>{item.description}</small>}
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
