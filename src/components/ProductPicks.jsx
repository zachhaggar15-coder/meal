import { AFFILIATE_DISCLOSURE, getMealPrepProducts } from '../data/mealPrepProducts.js';
import { toTitleCase } from '../utils/textFormatting.js';
import { affiliateLinkData } from '../utils/affiliateAnalytics.js';
import ProductSpecPlate from './ProductSpecPlate.jsx';

// Generic (non-container) product recommendation cards: slow cookers, rice
// cookers, scales, blenders, freezer bags, vacuum sealers, cookbooks.
// Sibling to AffiliateProductGrid, which is container-specific.
export default function ProductPicks({
  title = 'Products mentioned in this guide',
  intro,
  productIds = [],
  sourcePage = 'blog-tool-recommendation',
  showDisclosure = true,
  showImages = false,
  showQuickComparison = true,
  recommendationSource,
}) {
  const products = getMealPrepProducts(productIds);

  if (!products.length) return null;

  return (
    <section className="product-picks-section">
      <div className="affiliate-section-head">
        <h2>{toTitleCase(title)}</h2>
        {intro && <p>{intro}</p>}
      </div>

      {showDisclosure && (
        <p className="affiliate-disclosure">{AFFILIATE_DISCLOSURE}</p>
      )}

      {showQuickComparison && products.length > 1 && (
        <div className="product-quick-compare" aria-label={`${title} quick comparison`}>
          <div className="product-quick-head">
            <span className="offer-kicker">Quick comparison</span>
            {/* The ": compare first" suffix used to be appended here, which read
                as "Insulated Meal Prep Bags To Compare: compare first" on the
                guides whose own title already says "to compare". The kicker
                above and the line below both already say what this block is
                for, so the descriptive title stands on its own. */}
            <h3>{toTitleCase(title)}</h3>
            <p>See the main difference before reading the full product notes.</p>
          </div>
          <div className="product-quick-grid">
            {products.slice(0, 3).map((product, index) => (
              <article key={product.id} className="product-quick-card">
                <span className="container-search-chip">Use case: {title}</span>
                <h4>{product.name}</h4>
                <dl>
                  <div>
                    <dt>Type</dt>
                    <dd>{product.category}</dd>
                  </div>
                  <div>
                    <dt>Price</dt>
                    <dd>{product.priceBand}</dd>
                  </div>
                  <div>
                    <dt>Best for</dt>
                    <dd>{product.bestFor}</dd>
                  </div>
                </dl>
                <a
                  href={product.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="btn-primary"
                  {...affiliateLinkData({
                    product,
                    sourcePage: `${sourcePage}-quick-comparison`,
                    placement: 'quick_picks',
                    listPosition: index + 1,
                    recommendationSource,
                  })}
                >
                  See Amazon price &rarr;
                </a>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="product-picks-grid">
        {products.map((product, index) => (
          <article key={product.id} className="product-pick-card">
            {showImages && (
              <a
                className="product-pick-image"
                href={product.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                {...affiliateLinkData({
                  product,
                  sourcePage: `${sourcePage}-image`,
                  placement: 'product_image',
                  listPosition: index + 1,
                  recommendationSource,
                })}
              >
                <ProductSpecPlate product={product} />
              </a>
            )}
            <div className="product-pick-top">
              <span className="product-pick-category">{product.category}</span>
              <span className="product-pick-price">{product.priceBand}</span>
            </div>
            <h3>{product.name}</h3>
            <p className="product-pick-summary">{product.summary}</p>
            <p className="product-pick-verdict">
              <strong>Best for</strong>
              {product.bestFor}
            </p>
            {product.watchOut && (
              <p className="product-pick-note">
                <strong>Good to know</strong>
                {product.watchOut}
              </p>
            )}
            <a
              href={product.href}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="btn-primary product-pick-cta"
              {...affiliateLinkData({
                product,
                sourcePage,
                placement: 'detailed_card',
                listPosition: index + 1,
                recommendationSource,
              })}
            >
              See Amazon price &rarr;
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
