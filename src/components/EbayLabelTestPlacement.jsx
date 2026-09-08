const EBAY_LISTING_URL = 'https://ebay.io/m/JrHrC9';

export default function EbayLabelTestPlacement({ sourcePage }) {
  return (
    <aside className="ebay-test-placement" aria-label="Sponsored meal prep label listing">
      <div className="ebay-test-placement__media" aria-hidden="true">
        <img src="/images/ebay/meal-prep-labels-markers.png" alt="" width="180" height="180" loading="lazy" decoding="async" />
        <img src="/images/ebay/meal-prep-labels-pack.png" alt="" width="104" height="104" loading="lazy" decoding="async" />
      </div>
      <div className="ebay-test-placement__body">
        <span className="ebay-test-placement__eyebrow">Sponsored listing · demand test</span>
        <h2>Label this week’s meal prep</h2>
        <p>Removable food labels and markers for naming portions, dates and freezer meals.</p>
        <a href={EBAY_LISTING_URL} target="_blank" rel="noopener noreferrer nofollow sponsored" data-event="ebay_test_listing_clicked" data-source-page={sourcePage} data-placement="small_in_content">
          View the eBay listing <span aria-hidden="true">→</span>
        </a>
      </div>
    </aside>
  );
}
