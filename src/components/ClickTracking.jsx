import { useEffect } from 'react';
import { trackEvent } from '../utils/analytics.js';

export default function ClickTracking() {
  useEffect(() => {
    function handleClick(event) {
      const target = event.target instanceof Element
        ? event.target.closest('[data-event]')
        : null;

      if (!target) return;

      trackEvent(target.dataset.event, {
        source_page: target.dataset.sourcePage,
        offer: target.dataset.offer,
        target_calories: target.dataset.targetCalories,
        supermarket: target.dataset.supermarket,
        destination: target.href,
      });
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
