export default function StickerPromo() {
  return (
    <div className="sticker-promo">
      <div className="sticker-promo-icon" aria-hidden="true">🏷️</div>
      <div className="sticker-promo-text">
        <h3 className="sticker-promo-headline">Meal prepping this week?</h3>
        <p className="sticker-promo-body">
          Keep meals organised with freezer-safe meal prep labels for dates, portions, calories,
          protein, and reheating notes.
        </p>
        <a
          href="https://ebay.us/m/w68ZOg"
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="sticker-promo-btn"
          data-event="sticker_promo_click"
        >
          View meal prep labels &rarr;
        </a>
        <p className="sticker-promo-note">
          Useful if you batch cook, freeze meals, or prep multiple portions.
        </p>
      </div>
    </div>
  );
}
