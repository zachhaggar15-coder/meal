import { Link, useLocation } from 'react-router-dom';
import { MEAL_PREP_STICKERS } from '../data/offers.js';

function sourceFromPath(pathname) {
  if (pathname === '/') return 'home';
  return pathname.replace(/^\/+/, '').replaceAll('/', '-') || 'sitewide';
}

export default function SitewideOfferBar() {
  const location = useLocation();
  const sourcePage = `${sourceFromPath(location.pathname)}-sticky-bar`;

  return (
    <aside className="sitewide-offer-bar" aria-label="Sponsored meal prep offer">
      <a
        href={MEAL_PREP_STICKERS.href}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="sitewide-offer-thumb"
        data-event={MEAL_PREP_STICKERS.eventName}
        data-source-page={sourcePage}
        data-offer={MEAL_PREP_STICKERS.name}
      >
        <img src={MEAL_PREP_STICKERS.image} alt="" />
      </a>
      <div className="sitewide-offer-copy">
        <span>Sponsored prep add-on</span>
        <strong>Label every portion before it hits the freezer.</strong>
      </div>
      <div className="sitewide-offer-actions">
        <Link
          to={MEAL_PREP_STICKERS.internalPath}
          className="sitewide-offer-secondary"
          data-event={MEAL_PREP_STICKERS.promoEventName}
          data-source-page={sourcePage}
          data-offer={MEAL_PREP_STICKERS.name}
        >
          Details
        </Link>
        <a
          href={MEAL_PREP_STICKERS.href}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="sitewide-offer-primary"
          data-event={MEAL_PREP_STICKERS.eventName}
          data-source-page={sourcePage}
          data-offer={MEAL_PREP_STICKERS.name}
        >
          View kit
        </a>
      </div>
    </aside>
  );
}
