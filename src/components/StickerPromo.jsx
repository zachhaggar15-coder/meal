import { Link } from 'react-router-dom';
import { MEAL_PREP_STICKERS, BUDGET_CONTAINERS } from '../data/offers.js';

export default function StickerPromo({ sourcePage = 'unknown', compact = false }) {
  return (
    <aside className={`sticker-promo${compact ? ' sticker-promo--compact' : ''}`}>
      <a
        href={MEAL_PREP_STICKERS.href}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="sticker-promo-media"
        data-event={MEAL_PREP_STICKERS.eventName}
        data-source-page={sourcePage}
        data-offer={MEAL_PREP_STICKERS.name}
      >
        <img src={MEAL_PREP_STICKERS.image} alt="BOROHOUSE 10-pack glass food storage containers" />
      </a>
      <div className="sticker-promo-text">
        <span className="offer-kicker">Sponsored #ad</span>
        <h3 className="sticker-promo-headline">Glass meal prep containers for organised portions</h3>
        <p className="sticker-promo-body">
          Airtight borosilicate glass containers for batch-cooked meals — fridge, freezer,
          and microwave safe. 10-pack to cover a full week of portions.
        </p>
        <div className="sticker-promo-actions">
          <a
            href={MEAL_PREP_STICKERS.href}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="sticker-promo-btn"
            data-event={MEAL_PREP_STICKERS.eventName}
            data-source-page={sourcePage}
            data-offer={MEAL_PREP_STICKERS.name}
          >
            View on Amazon
          </a>
          <Link
            to={MEAL_PREP_STICKERS.internalPath}
            className="sticker-promo-link"
            data-event={MEAL_PREP_STICKERS.promoEventName}
            data-source-page={sourcePage}
            data-offer={MEAL_PREP_STICKERS.name}
          >
            Learn more
          </Link>
        </div>
        <div className="offer-proof-row" aria-label="Product highlights">
          <span>Airtight lids</span>
          <span>Microwave-safe</span>
          <span>Stackable</span>
        </div>
        <p className="sponsored-note">{MEAL_PREP_STICKERS.disclosure}</p>
        <p className="sticker-promo-budget-alt">
          On a budget?{' '}
          <a
            href={BUDGET_CONTAINERS.href}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            data-event={BUDGET_CONTAINERS.promoEventName}
            data-source-page={sourcePage}
            data-offer={BUDGET_CONTAINERS.name}
          >
            Cheaper compartment containers also available →
          </a>
        </p>
      </div>
    </aside>
  );
}
