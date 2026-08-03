import { useEffect, useRef } from 'react';

const ENV = import.meta.env || {};
const ADS_ENABLED = ['1', 'true', 'yes', 'on'].includes(
  String(ENV.VITE_ADS_ENABLED || '').trim().toLowerCase(),
);
const ADSENSE_SCRIPT_ID = 'mealprep-adsense-loader';
const ADSENSE_SCRIPT_BASE_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

function ensureAdsenseScript(clientId) {
  const existingScript = document.getElementById(ADSENSE_SCRIPT_ID)
    || document.querySelector(`script[src^="${ADSENSE_SCRIPT_BASE_URL}"]`);

  if (existingScript) return;

  const script = document.createElement('script');
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `${ADSENSE_SCRIPT_BASE_URL}?client=${encodeURIComponent(clientId)}`;
  document.head.appendChild(script);
}

export default function AdSlot({
  placement,
  slotId,
  format = 'auto',
  fullWidthResponsive = true,
}) {
  const requestQueued = useRef(false);
  const clientId = String(ENV.VITE_ADSENSE_CLIENT_ID || '').trim();
  const resolvedSlotId = String(slotId || '').trim();
  const isConfigured = Boolean(ADS_ENABLED && clientId && resolvedSlotId);

  useEffect(() => {
    if (!isConfigured || requestQueued.current || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    ensureAdsenseScript(clientId);

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      requestQueued.current = true;
    } catch {
      requestQueued.current = false;
    }
  }, [clientId, isConfigured, resolvedSlotId]);

  if (!isConfigured) return null;

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={clientId}
      data-ad-slot={resolvedSlotId}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      data-ad-placement={placement}
    />
  );
}
