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
  const [showOptions, setShowOptions] = useState(false);
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

  function chooseAnalytics(next) {
    setAnalyticsConsent(next);
    setConsent(next);
  }

  function chooseAdvertising(next) {
    setAdConsent(next);
    setAdConsentState(next);
  }

  function keepAllOff() {
    if (analyticsPending) chooseAnalytics('denied');
    if (adsPending) chooseAdvertising('denied');
  }

  function acceptAll() {
    if (analyticsPending) chooseAnalytics('granted');
    if (adsPending) chooseAdvertising('granted');
  }

  function acceptAnalyticsOnly() {
    chooseAnalytics('granted');
    chooseAdvertising('denied');
  }

  function acceptAdvertisingOnly() {
    chooseAnalytics('denied');
    chooseAdvertising('granted');
  }

  const bothPending = analyticsPending && adsPending;
  const heading = bothPending
    ? 'Cookies on MealPrep.org.uk'
    : adsPending
      ? 'Advertising choice'
      : 'Help improve MealPrep.org.uk?';
  const keepOffLabel = bothPending
    ? 'Reject all'
    : adsPending
      ? 'Keep advertising off'
      : 'Keep analytics off';
  const acceptLabel = bothPending
    ? 'Accept all'
    : adsPending
      ? 'Accept advertising'
      : 'Accept analytics';

  return (
    <div className="analytics-consent" role="region" aria-label="Privacy choices">
      <div className="analytics-consent-copy">
        <strong>{heading}</strong>
        <span>
          {analyticsPending && 'Optional analytics show which pages, clicks and journeys are useful. Quiz-answer URLs, exact calorie and macro targets, email addresses and typed form answers are not stored.'}
          {analyticsPending && adsPending && ' '}
          {adsPending && 'Advertising consent allows Google to set advertising cookies to fund the site.'}
          {bothPending && ' Accept all, reject all, or use More options to allow only one.'}
          {' The site works with either or both switched off.'}
        </span>
      </div>
      <div className="analytics-consent-actions">
        <button type="button" className="btn-primary" onClick={acceptAll}>
          {acceptLabel}
        </button>
        <button type="button" className="btn-primary" onClick={keepAllOff}>
          {keepOffLabel}
        </button>
        {bothPending && (
          <button
            type="button"
            className="consent-more-options"
            aria-expanded={showOptions}
            aria-controls="consent-purpose-options"
            onClick={() => setShowOptions(open => !open)}
          >
            More options
          </button>
        )}
        <a href="/privacy">Privacy</a>
      </div>
      {bothPending && showOptions && (
        <div
          id="consent-purpose-options"
          className="analytics-consent-options"
          role="group"
          aria-label="Choose one optional purpose"
        >
          <span>Allow only:</span>
          <button type="button" className="btn-secondary" onClick={acceptAnalyticsOnly}>
            Analytics only
          </button>
          <button type="button" className="btn-secondary" onClick={acceptAdvertisingOnly}>
            Advertising only
          </button>
        </div>
      )}
    </div>
  );
}
