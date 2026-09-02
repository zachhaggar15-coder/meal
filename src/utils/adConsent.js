// Advertising consent, kept separate from analytics consent on purpose.
//
// Analytics and advertising are different purposes under UK PECR, so one
// choice cannot stand in for the other: somebody who agreed to help us measure
// pages has not agreed to be profiled for ads. This module mirrors the shape
// of the analytics consent API in `analytics.js` (unset / granted / denied,
// Do Not Track wins, a change event so live components can react) but stores
// its answer under its own key.
//
// The banner only asks the advertising question when ads can actually run.
// While `VITE_ADS_ENABLED` is off there is nothing to consent to, and asking
// anyway would be asking about something that does not happen.

import { readConsentRecord, writeConsentRecord } from './consentRecord.js';

const ENV = import.meta.env || {};
const TRUTHY = ['1', 'true', 'yes', 'on'];

const CONSENT_KEY = 'mealprep_ads_consent';
const CONSENT_EVENT = 'mealprep:ads-consent';

let inMemoryConsent = null;

export function areAdsEnabled() {
  return TRUTHY.includes(String(ENV.VITE_ADS_ENABLED || '').trim().toLowerCase());
}

export function getAdsenseClientId() {
  return String(ENV.VITE_ADSENSE_CLIENT_ID || '').trim();
}

// Only ask the question when there is something to ask about.
export function isAdConsentRequired() {
  return areAdsEnabled() && Boolean(getAdsenseClientId());
}

export function getAdConsent() {
  if (typeof window === 'undefined') return 'denied';
  if (!isAdConsentRequired()) return 'denied';
  if (isDoNotTrackEnabled()) return 'denied';
  if (inMemoryConsent === 'granted' || inMemoryConsent === 'denied') return inMemoryConsent;

  try {
    return readConsentRecord(window.localStorage, CONSENT_KEY);
  } catch {
    // Storage blocked: treat as undecided rather than assuming agreement.
    return 'unset';
  }
}

export function hasAdConsent() {
  return getAdConsent() === 'granted';
}

export function setAdConsent(value) {
  if (typeof window === 'undefined') return;
  const next = value === 'granted' ? 'granted' : 'denied';
  inMemoryConsent = next;
  try {
    writeConsentRecord(window.localStorage, CONSENT_KEY, next);
  } catch {
    // Keep the choice for this page view only.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { consent: next } }));
}

export function onAdConsentChange(handler) {
  if (typeof window === 'undefined') return () => {};
  const listener = event => handler(event.detail?.consent || getAdConsent());
  window.addEventListener(CONSENT_EVENT, listener);
  return () => window.removeEventListener(CONSENT_EVENT, listener);
}

function isDoNotTrackEnabled() {
  if (typeof navigator === 'undefined') return false;
  return navigator.doNotTrack === '1'
    || window.doNotTrack === '1'
    || navigator.msDoNotTrack === '1';
}
