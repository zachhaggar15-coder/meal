const EBAY_LISTING_URL = 'https://ebay.io/m/JrHrC9';

export default function EbayProductCard({ sourcePage = 'related_plans' }) {
  return (
    <a
      href={EBAY_LISTING_URL}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="ebay-product-card"
      data-event="ebay_product_card_clicked"
      data-source-page={sourcePage}
      data-placement="related_plans_grid"
      aria-label="Removable meal prep labels - eBay listing"
    >
      <div className="epc-media">
        <img src="/images/ebay/meal-prep-labels-pack.png" alt="" width="120" height="120" loading="lazy" decoding="async" />
      </div>
      <div className="epc-body">
        <div className="epc-category">Featured product</div>
        <h3 className="epc-title">Removable meal prep labels</h3>
        <p className="epc-desc">Food labels and markers for naming portions and dates</p>
        <span className="epc-cta" aria-hidden="true">View on eBay →</span>
      </div>
    </a>
  );
}
