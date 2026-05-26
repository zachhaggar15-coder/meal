import { Link } from 'react-router-dom';
import { MEAL_PREP_STICKERS } from '../data/offers.js';

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
        <img src={MEAL_PREP_STICKERS.image} alt="Meal prep labels and marker pens" />
      </a>
      <div className="sticker-promo-text">
        <span className="offer-kicker">Sponsored prep add-on</span>
        <h3 className="sticker-promo-headline">Batch cooking this week? Label every portion.</h3>
        <p className="sticker-promo-body">
          Freezer-safe meal prep labels make it easier to mark dates, calories, protein,
          portions, and reheating notes before the containers stack up.
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
            View sticker kit
          </a>
          <Link
            to={MEAL_PREP_STICKERS.internalPath}
            className="sticker-promo-link"
            data-event={MEAL_PREP_STICKERS.promoEventName}
            data-source-page={sourcePage}
            data-offer={MEAL_PREP_STICKERS.name}
          >
            See why labels help
          </Link>
        </div>
        <div className="offer-proof-row" aria-label="Product highlights">
          <span>Freezer-safe</span>
          <span>Date fields</span>
          <span>Portion tracking</span>
        </div>
      </div>
    </aside>
  );
}
