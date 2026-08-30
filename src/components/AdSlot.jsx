import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  areAdsEnabled,
  getAdsenseClientId,
  hasAdConsent,
  onAdConsentChange,
} from '../utils/adConsent.js';
import { isMonetisableRoute } from '../utils/adPlacement.js';

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
  const { pathname } = useLocation();
  const clientId = getAdsenseClientId();
  const resolvedSlotId = String(slotId || '').trim();
  const configured = Boolean(areAdsEnabled() && clientId && resolvedSlotId);
  const eligible = configured && isMonetisableRoute(pathname);

  // The script used to load on mount regardless of what the visitor had
  // chosen, which for a UK site means setting advertising cookies before the
  // question was asked. Nothing is requested until consent is granted, and the
  // subscription means granting it later fills the slot without a reload.
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (!eligible) return undefined;
    setConsented(hasAdConsent());
    return onAdConsentChange(next => setConsented(next === 'granted'));
  }, [eligible]);

  useEffect(() => {
    if (!eligible || !consented) return;
    ensureAdsenseScript(clientId);
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // A blocked or failed request leaves the reserved space empty rather
      // than breaking the page around it.
    }
  }, [clientId, consented, eligible, resolvedSlotId]);

  if (!eligible || !consented) return null;

  // `display: block` alone let a late-arriving ad push the article down as it
  // loaded. The wrapper reserves the height the unit will take, so the content
  // below it does not move.
  return (
    <div className="ad-slot" data-ad-placement={placement}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={resolvedSlotId}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
        data-ad-placement={placement}
      />
    </div>
  );
}
