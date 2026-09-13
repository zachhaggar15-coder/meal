import { Link } from 'react-router-dom';
import { MEAL_PREP_STICKERS } from '../data/offers.js';
import ProductSpecPlate from './ProductSpecPlate.jsx';
import { affiliateLinkData } from '../utils/affiliateAnalytics.js';

export default function StickerPromo({ offer = MEAL_PREP_STICKERS, sourcePage = 'unknown', compact = false }) {
  return (
    <aside className={`sticker-promo${compact ? ' sticker-promo--compact' : ''}`}>
      {(offer.proofPoints || []).length > 0 && (
        <a
          href={offer.href}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="sticker-promo-media"
          {...affiliateLinkData({
            product: offer,
            productCategory: 'meal-prep-containers',
            sourcePage,
            placement: 'body_promo_image',
          })}
        >
          <ProductSpecPlate product={offer} />
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
            {...affiliateLinkData({
              product: offer,
              productCategory: 'meal-prep-containers',
              sourcePage,
              placement: 'body_promo_cta',
            })}
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
            Learn about {offer.name}
          </Link>
        </div>
        {/* The proof points already appear in the spec plate on the left of this
            same card. Rendering them again as chips here printed the identical
            three strings twice, about 150px apart. */}
        <p className="sponsored-note">{offer.disclosure}</p>
      </div>
    </aside>
  );
}
