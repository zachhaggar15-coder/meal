import { useEffect, useRef, useState } from 'react';
import {
  getAnalyticsConsent,
  isAnalyticsConsentRequired,
  setAnalyticsConsent,
} from '../utils/analytics.js';
import { getAdConsent, isAdConsentRequired, setAdConsent } from '../utils/adConsent.js';
import { OPEN_PRIVACY_CHOICES_EVENT } from '../utils/consentRecord.js';

export default function AnalyticsConsentBanner() {
  const [consent, setConsent] = useState('denied');
  const [adConsent, setAdConsentState] = useState('denied');
  const [showOptions, setShowOptions] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const panelRef = useRef(null);
  // Ads are off by default, so the banner normally asks only the analytics
  // question. It picks up the advertising question automatically if and when
  // ads are switched on, rather than asking about something that never runs.
  const adsAsk = isAdConsentRequired();

  useEffect(() => {
    function refreshChoices() {
      setConsent(getAnalyticsConsent());
      setAdConsentState(getAdConsent());
    }

    function openPrivacyChoices() {
      refreshChoices();
      setShowOptions(true);
      setManageOpen(true);
    }

    refreshChoices();
    window.addEventListener(OPEN_PRIVACY_CHOICES_EVENT, openPrivacyChoices);
    return () => window.removeEventListener(OPEN_PRIVACY_CHOICES_EVENT, openPrivacyChoices);
  }, []);

  useEffect(() => {
    if (manageOpen) panelRef.current?.focus();
  }, [manageOpen]);

  const analyticsPending = isAnalyticsConsentRequired() && consent === 'unset';
  const adsPending = adsAsk && adConsent === 'unset';
  if (!analyticsPending && !adsPending && !manageOpen) return null;

  function chooseAnalytics(next) {
    setAnalyticsConsent(next);
    setConsent(next);
  }

  function chooseAdvertising(next) {
    setAdConsent(next);
    setAdConsentState(next);
  }

  function finishChoices(nextAnalytics, nextAdvertising) {
    const withdrewAnalytics = consent === 'granted' && nextAnalytics === 'denied';
    const withdrewAdvertising = adConsent === 'granted' && nextAdvertising === 'denied';

    if (nextAnalytics === 'granted' || nextAnalytics === 'denied') {
      chooseAnalytics(nextAnalytics);
    }
    if (adsAsk && (nextAdvertising === 'granted' || nextAdvertising === 'denied')) {
      chooseAdvertising(nextAdvertising);
    }

    setManageOpen(false);
    setShowOptions(false);

    // A reload is the reliable way to remove providers injected earlier in
    // this page view. The newly denied records are already stored, so none of
    // those optional scripts will be loaded again after the reload.
    if (withdrewAnalytics || withdrewAdvertising) {
      window.setTimeout(() => window.location.reload(), 0);
    }
  }

  function keepAllOff() {
    finishChoices(
      analyticsPending || manageOpen ? 'denied' : consent,
      adsPending || (manageOpen && adsAsk) ? 'denied' : adConsent,
    );
  }

  function acceptAll() {
    finishChoices(
      analyticsPending || manageOpen ? 'granted' : consent,
      adsPending || (manageOpen && adsAsk) ? 'granted' : adConsent,
    );
  }

  function acceptAnalyticsOnly() {
    finishChoices('granted', 'denied');
  }

  function acceptAdvertisingOnly() {
    finishChoices('denied', 'granted');
  }

  const analyticsVisible = analyticsPending || (manageOpen && isAnalyticsConsentRequired());
  const advertisingVisible = adsPending || (manageOpen && adsAsk);
  const bothVisible = analyticsVisible && advertisingVisible;
  const heading = manageOpen
    ? 'Privacy choices'
    : bothVisible
    ? 'Cookies on MealPrep.org.uk'
    : adsPending
      ? 'Advertising choice'
      : 'Help improve MealPrep.org.uk?';
  const keepOffLabel = bothVisible
    ? 'Reject all'
    : adsPending
      ? 'Keep advertising off'
      : manageOpen
        ? 'Turn analytics off'
        : 'Keep analytics off';
  const acceptLabel = bothVisible
    ? 'Accept all'
    : adsPending
      ? 'Accept advertising'
      : manageOpen
        ? 'Allow analytics'
        : 'Accept analytics';

  return (
    <div
      ref={panelRef}
      className="analytics-consent"
      role={manageOpen ? 'dialog' : 'region'}
      aria-label="Privacy choices"
      tabIndex={manageOpen ? -1 : undefined}
    >
      <div className="analytics-consent-copy">
        <strong>{heading}</strong>
        <span>
          {manageOpen && analyticsVisible && `Analytics is currently ${consent === 'granted' ? 'allowed' : 'off'}. `}
          {manageOpen && advertisingVisible && `Advertising is currently ${adConsent === 'granted' ? 'allowed' : 'off'}. `}
          {!manageOpen && analyticsPending && 'Optional analytics show which pages, clicks and journeys are useful. Quiz-answer URLs, exact calorie and macro targets, email addresses and typed form answers are not stored.'}
          {!manageOpen && analyticsPending && adsPending && ' '}
          {!manageOpen && adsPending && 'Advertising consent allows Google to set advertising cookies to fund the site.'}
          {bothVisible && ' Accept all, reject all, or use More options to allow only one.'}
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
        {bothVisible && (
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
        {manageOpen && (
          <button
            type="button"
            className="consent-more-options"
            onClick={() => setManageOpen(false)}
          >
            Close
          </button>
        )}
      </div>
      {bothVisible && showOptions && (
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
