import { useEffect, useState } from 'react';
import {
  getAnalyticsConsent,
  isAnalyticsConsentRequired,
  setAnalyticsConsent,
} from '../utils/analytics.js';
import { getAdConsent, isAdConsentRequired, setAdConsent } from '../utils/adConsent.js';

export default function AnalyticsConsentBanner() {
  const [consent, setConsent] = useState('denied');
  const [adConsent, setAdConsentState] = useState('denied');
  // Ads are off by default, so the banner normally asks only the analytics
  // question. It picks up the advertising question automatically if and when
  // ads are switched on, rather than asking about something that never runs.
  const adsAsk = isAdConsentRequired();

  useEffect(() => {
    setConsent(getAnalyticsConsent());
    setAdConsentState(getAdConsent());
  }, []);

  const analyticsPending = isAnalyticsConsentRequired() && consent === 'unset';
  const adsPending = adsAsk && adConsent === 'unset';
  if (!analyticsPending && !adsPending) return null;

  function choose(next) {
    if (analyticsPending) {
      setAnalyticsConsent(next);
      setConsent(next);
    }
    if (adsPending) {
      setAdConsent(next);
      setAdConsentState(next);
    }
  }

  return (
    <div className="analytics-consent" role="region" aria-label="Privacy choices">
      <div className="analytics-consent-copy">
        <strong>{adsPending ? 'Your privacy choices' : 'Help improve MealPrep.org.uk?'}</strong>
        <span>
          Optional analytics show which pages, clicks and journeys are useful. Quiz-answer URLs,
          exact calorie and macro targets, email addresses and typed form answers are not stored.
          {adsPending && ' Accepting also allows Google to set advertising cookies to fund the site. Declining keeps both off; the site works either way.'}
        </span>
      </div>
      <div className="analytics-consent-actions">
        <a href="/privacy">Privacy</a>
        <button type="button" className="btn-secondary" onClick={() => choose('denied')}>
          Keep off
        </button>
        <button type="button" className="btn-primary" onClick={() => choose('granted')}>
          {adsPending ? 'Accept' : 'Accept analytics'}
        </button>
      </div>
    </div>
  );
}
