import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { inject } from '@vercel/analytics';
import App from './App.jsx';
import { hasAnalyticsConsent, onAnalyticsConsentChange } from './utils/analytics.js';
import '@fontsource-variable/dm-sans/wght.css';
import './index.css';

// Vercel Analytics used to be injected unconditionally at module load, which
// meant it ran before the consent banner had been answered — every other
// analytics provider on the site is gated. It now follows the same rule:
// nothing loads until consent is granted.
let vercelAnalyticsInjected = false;
function injectVercelAnalyticsIfConsented() {
  if (vercelAnalyticsInjected || !hasAnalyticsConsent()) return;
  vercelAnalyticsInjected = true;
  inject();
}

injectVercelAnalyticsIfConsented();
onAnalyticsConsentChange(injectVercelAnalyticsIfConsented);

const rootElement = document.getElementById('root');
const app = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
