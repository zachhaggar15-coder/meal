import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SiteSearch from './SiteSearch.jsx';
import './Sidebar.css';
import {
  MOBILE_NAV_GROUPS,
  PLAN_COUNT_LABEL,
} from '../data/navigation.js';

const DEFAULT_EXPANDED = MOBILE_NAV_GROUPS.reduce((state, group) => ({
  ...state,
  [group.label]: !!group.defaultOpen,
}), {});

const MOBILE_DRAWER_QUERY = '(max-width: 999px)';
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(DEFAULT_EXPANDED);
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);

  function toggle(label) {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  }

  useEffect(() => {
    if (!open || typeof window === 'undefined') return undefined;

    const drawer = drawerRef.current;
    const mainContent = document.getElementById('main-content');
    const mediaQuery = window.matchMedia(MOBILE_DRAWER_QUERY);
    const returnFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const mainWasInert = mainContent?.hasAttribute('inert') || false;
    const previousBodyOverflow = document.body.style.overflow;
    let active = false;
    let focusFrame = 0;

    function focusableElements() {
      return drawer ? [...drawer.querySelectorAll(FOCUSABLE_SELECTOR)] : [];
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = focusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        drawer?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!drawer?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }

    function activateDrawer() {
      if (active) return;
      active = true;
      mainContent?.setAttribute('inert', '');
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    }

    function deactivateDrawer() {
      if (!active) return;
      active = false;
      if (!mainWasInert) mainContent?.removeAttribute('inert');
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (focusFrame) window.cancelAnimationFrame(focusFrame);
    }

    function syncDrawerMode() {
      if (mediaQuery.matches) activateDrawer();
      else deactivateDrawer();
    }

    syncDrawerMode();
    mediaQuery.addEventListener('change', syncDrawerMode);
    return () => {
      mediaQuery.removeEventListener('change', syncDrawerMode);
      deactivateDrawer();
      if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, [open, onClose]);

  function isActive(to) {
    const [path, hash] = to.split('#');
    if (hash) {
      return location.pathname === path && location.hash === `#${hash}`;
    }
    return location.pathname === path;
  }

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden />}
      <nav
        ref={drawerRef}
        id="site-sidebar"
        className={open ? 'sidebar sidebar--open' : 'sidebar'}
        aria-label="Site navigation"
        tabIndex={-1}
      >
        <div className="sidebar-inner">
          <div className="sidebar-head">
            <Link to="/" className="sidebar-brand" onClick={onClose}>MealPrep</Link>
            <button ref={closeButtonRef} className="sidebar-close-btn" onClick={onClose} type="button">
              Close
            </button>
          </div>

          <div className="sidebar-search-wrap">
            <SiteSearch
              id="sidebar-site-search"
              className="site-search--sidebar"
              maxResults={6}
              onNavigate={onClose}
            />
          </div>

          <div className="sidebar-priority-actions" role="group" aria-label="Recommended actions">
            <Link to="/quiz" className="sidebar-quiz-cta" onClick={onClose}>
              Find My Plan
            </Link>
            <Link
              to="/saved-plans"
              className={`sidebar-browse-cta${location.pathname === '/saved-plans' ? ' sidebar-link--active' : ''}`}
              onClick={onClose}
            >
              Saved Plans
            </Link>
            <Link
              to="/meal-prep-accessories"
              className={`sidebar-browse-cta${location.pathname === '/meal-prep-accessories' ? ' sidebar-link--active' : ''}`}
              onClick={onClose}
            >
              Meal Prep Accessories
            </Link>
            <Link
              to="/browse"
              className={`sidebar-browse-cta${location.pathname === '/browse' ? ' sidebar-link--active' : ''}`}
              onClick={onClose}
            >
              Browse {PLAN_COUNT_LABEL} Plans
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
                        data-event="nav_link_clicked"
                        data-cta-location="sidebar"
                        data-target-route={item.to}
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
