import { useEffect, useState } from 'react';
import {
  getAnalyticsConsent,
  isAnalyticsConsentRequired,
  setAnalyticsConsent,
} from '../utils/analytics.js';

export default function AnalyticsConsentBanner() {
  const [consent, setConsent] = useState('denied');

  useEffect(() => {
    setConsent(getAnalyticsConsent());
  }, []);

  if (!isAnalyticsConsentRequired() || consent !== 'unset') return null;

  function choose(nextConsent) {
    setAnalyticsConsent(nextConsent);
    setConsent(nextConsent);
  }

  return (
    <div className="analytics-consent" role="region" aria-label="Analytics consent">
      <div className="analytics-consent-copy">
        <strong>Help improve MealPrep.org.uk?</strong>
        <span>
          Optional analytics show which pages, clicks and journeys are useful. We do not store
          email addresses or typed form answers in this behaviour log.
        </span>
      </div>
      <div className="analytics-consent-actions">
        <a href="/privacy">Privacy</a>
        <button type="button" className="btn-secondary" onClick={() => choose('denied')}>
          Keep off
        </button>
        <button type="button" className="btn-primary" onClick={() => choose('granted')}>
          Accept analytics
        </button>
      </div>
    </div>
  );
}
