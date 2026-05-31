import { Link } from 'react-router-dom';
import { MEAL_PREP_STICKERS } from '../data/offers.js';

export default function StickerPromo({ offer = MEAL_PREP_STICKERS, sourcePage = 'unknown', compact = false }) {
  return (
    <aside className={`sticker-promo${compact ? ' sticker-promo--compact' : ''}`}>
      {offer.image && (
        <a
          href={offer.href}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="sticker-promo-media"
          data-event={offer.eventName}
          data-source-page={sourcePage}
          data-offer={offer.name}
        >
          <img src={offer.image} alt={offer.imageAlt || offer.name} />
        </a>
      )}
      <div className="sticker-promo-text">
        <span className="offer-kicker">Sponsored #ad</span>
        <h3 className="sticker-promo-headline">{offer.headline}</h3>
        <p className="sticker-promo-body">{offer.body}</p>
        <div className="sticker-promo-actions">
          <a
            href={offer.href}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="sticker-promo-btn"
            data-event={offer.eventName}
            data-source-page={sourcePage}
            data-offer={offer.name}
          >
            {offer.cta}
          </a>
          <Link
            to={offer.internalPath}
            className="sticker-promo-link"
            data-event={offer.promoEventName}
            data-source-page={sourcePage}
            data-offer={offer.name}
          >
            Learn more
          </Link>
        </div>
        {offer.proofPoints?.length > 0 && (
          <div className="offer-proof-row" aria-label="Product highlights">
            {offer.proofPoints.map(p => <span key={p}>{p}</span>)}
          </div>
        )}
        <p className="sponsored-note">{offer.disclosure}</p>
      </div>
    </aside>
  );
}
