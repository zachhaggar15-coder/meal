import { AFFILIATE_DISCLOSURE, getContainerProducts } from '../data/containerProducts.js';
import { CONTAINER_LAST_CHECKED } from '../utils/containerSetup.js';
import { toTitleCase } from '../utils/textFormatting.js';
import ContainerQuickComparison from './ContainerQuickComparison.jsx';
import { affiliateLinkData } from '../utils/affiliateAnalytics.js';
import ProductSpecPlate from './ProductSpecPlate.jsx';

export default function AffiliateProductGrid({
  title = 'Recommended meal prep containers',
  intro,
  productIds = [],
  sourcePage = 'container-guide',
  showDisclosure = true,
  showQuickComparison = true,
  recommendationSource,
  compact = false,
}) {
  const products = getContainerProducts(productIds);

  if (!products.length) return null;

  return (
    <section className="affiliate-product-section">
      <div className="affiliate-section-head">
        <h2>{toTitleCase(title)}</h2>
        {intro && <p>{intro}</p>}
      </div>

      {showDisclosure && (
        <p className="affiliate-disclosure">{AFFILIATE_DISCLOSURE}</p>
      )}

      <p className="affiliate-claims-note">
        Product formats and care details follow current Amazon listing or manufacturer information,
        not hands-on testing. Check the live listing before buying.
      </p>

      {showQuickComparison && products.length > 1 && (
        <ContainerQuickComparison
          eyebrow="Quick comparison"
          title={`${toTitleCase(title)}: quick comparison`}
          intro={`Compare ${Math.min(products.length, 3)} options first, then scroll for the longer buying notes.`}
          picks={products.slice(0, 3).map(product => ({
            product,
            searchedFor: title,
            sizeLabel: product.badge,
            sizeFocus: `${product.setSize} - ${product.layout}`,
            fit: product.bestFor,
          }))}
          headingLevel="h3"
          sourcePage={`${sourcePage}-quick-comparison`}
          showDisclosure={false}
          recommendationSource={recommendationSource}
        />
      )}

      <div className="affiliate-product-grid">
        {products.map((product, index) => (
          <article key={product.name} className={`affiliate-product-card${compact ? ' affiliate-product-card--compact' : ''}`}>
            {!compact && (
              <ProductSpecPlate product={product} className="affiliate-product-media" />
            )}
            <div className="affiliate-product-body">
              <span className="affiliate-product-badge">{product.badge}</span>
              <h3>{product.name}</h3>
              <p className="affiliate-product-summary">{product.summary}</p>
              {!compact && (
                <div className="affiliate-product-verdict-grid">
                  <p><strong>Best for:</strong> {product.bestFor}</p>
                  {product.buyIf && <p><strong>Buy if:</strong> {product.buyIf}</p>}
                  {product.avoidIf && <p><strong>Avoid if:</strong> {product.avoidIf}</p>}
                </div>
              )}
              <dl className="affiliate-product-facts">
                <div>
                  <dt>Price level</dt>
                  <dd>{product.priceBand}</dd>
                </div>
                <div>
                  <dt>Material</dt>
                  <dd>{product.material}</dd>
                </div>
                <div>
                  <dt>Set format</dt>
                  <dd>{product.setSize}</dd>
                </div>
                {!compact && (
                  <div>
                    <dt>Last checked</dt>
                    <dd>{product.lastChecked || CONTAINER_LAST_CHECKED}</dd>
                  </div>
                )}
              </dl>
              <p className="affiliate-watchout"><strong>Watch out:</strong> {product.watchOut}</p>
              <a
                href={product.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="btn-primary affiliate-product-cta"
                {...affiliateLinkData({
                  product,
                  productCategory: 'meal-prep-containers',
                  sourcePage,
                  placement: 'detailed_card',
                  listPosition: index + 1,
                  recommendationSource,
                })}
              >
                See Amazon price &rarr;
              </a>
              <details className="affiliate-product-details">
                <summary>Pros, cons and key features</summary>
                <div className="affiliate-product-detail-body">
                  <dl className="affiliate-product-facts affiliate-product-detail-facts">
                    <div>
                      <dt>Layout</dt>
                      <dd>{product.layout}</dd>
                    </div>
                    <div>
                      <dt>Storage fit</dt>
                      <dd>{product.storageFit}</dd>
                    </div>
                  </dl>
                  <div className="affiliate-pro-con-grid">
                    <div>
                      <strong>Pros</strong>
                      <ul>
                        {product.pros?.map(item => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <strong>Cons</strong>
                      <ul>
                        {product.cons?.map(item => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                  <ul className="content-bullets affiliate-product-bullets">
                    {product.keyFeatures?.map(feature => <li key={feature}>{feature}</li>)}
                  </ul>
                </div>
              </details>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
