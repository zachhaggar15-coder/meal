import { Link } from 'react-router-dom';
import {
  AFFILIATE_DISCLOSURE,
  getContainerProduct,
  getContainerProducts,
} from '../data/containerProducts.js';
import { toTitleCase } from '../utils/textFormatting.js';
import { affiliateLinkData } from '../utils/affiliateAnalytics.js';
import ProductSpecPlate from './ProductSpecPlate.jsx';

function resolveComparisonItems({ picks, productIds, fallbackSearch }) {
  if (picks?.length) {
    return picks
      .map(pick => {
        const product = pick.product || getContainerProduct(pick.id);
        if (!product) return null;
        return {
          ...pick,
          product,
          searchedFor: pick.searchedFor || fallbackSearch || product.badge,
          sizeLabel: pick.sizeLabel || product.badge,
          sizeFocus: pick.sizeFocus || product.setSize,
          fit: pick.fit || product.bestFor,
        };
      })
      .filter(Boolean);
  }

  return getContainerProducts(productIds)
    .slice(0, 3)
    .map(product => ({
      product,
      searchedFor: fallbackSearch || product.badge,
      sizeLabel: product.badge,
      sizeFocus: product.setSize,
      fit: product.bestFor,
    }));
}

export default function ContainerQuickComparison({
  eyebrow = 'Quick comparison',
  title,
  intro,
  picks,
  productIds = [],
  fallbackSearch,
  fastPick,
  headingLevel = 'h2',
  sourcePage = 'container-quick-comparison',
  showDisclosure = true,
  showSnapshotStrip = true,
  compact = false,
  recommendationSource,
}) {
  const items = resolveComparisonItems({ picks, productIds, fallbackSearch });

  if (!items.length) return null;

  const headingRank = headingLevel === 'h1' ? 1 : headingLevel === 'h3' ? 3 : 2;
  const HeadingTag = `h${headingRank}`;
  const CardHeadingTag = `h${Math.min(headingRank + 1, 4)}`;
  const headingId = `${sourcePage}-heading`.replace(/[^a-z0-9_-]/gi, '-');

  return (
    <section className={`container-direct-compare${compact ? ' container-direct-compare--compact' : ''}`} aria-labelledby={headingId}>
      <div className="container-direct-head">
        <div>
          <span className="offer-kicker">{toTitleCase(eyebrow)}</span>
          <HeadingTag id={headingId}>{title}</HeadingTag>
        </div>
        {intro && <p>{intro}</p>}
      </div>

      {showSnapshotStrip && (
        <div className={`container-snapshot-strip container-snapshot-strip--${Math.min(items.length, 3)}`} aria-label="Container options at a glance">
        {items.map(({ product, sizeLabel, sizeFocus, searchedFor }, index) => (
          <a
            key={`${product.id}-snapshot`}
            href={product.href}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="container-snapshot-item"
            {...affiliateLinkData({
              product,
              productCategory: 'meal-prep-containers',
              sourcePage: `${sourcePage}-snapshot`,
              placement: 'quick_comparison_snapshot',
              listPosition: index + 1,
              selectedProblem: searchedFor,
              recommendationSource,
            })}
            aria-label={`See ${product.shortName} on Amazon UK`}
          >
            <span>{sizeLabel}</span>
            <strong>{sizeFocus}</strong>
            <small>{product.material}</small>
          </a>
        ))}
        </div>
      )}

      <div className={`container-direct-grid container-direct-grid--${Math.min(items.length, 3)}`}>
        {items.map(({ product, searchedFor, sizeLabel, sizeFocus, fit, guidePath }, index) => (
          <article key={product.id} className="container-direct-card container-direct-card--specs">
            {/* tone="plain" drops the plate's own badge. The card already carries
                two positioning labels - the "Best for:" chip and the size heading -
                so the badge made a third name for one product in the same column. */}
            <ProductSpecPlate product={product} className="container-direct-media" tone="plain" />
            <div className="container-direct-body">
              <span className="container-search-chip">Best for: {searchedFor}</span>
              <CardHeadingTag>{sizeLabel}</CardHeadingTag>
              <strong className="container-size-focus">{sizeFocus}</strong>
              <p>{fit}</p>
              {!compact && <p className="container-direct-summary">{product.summary}</p>}
              <dl className="container-direct-facts">
                <div>
                  <dt>Material</dt>
                  <dd>{product.material}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>{product.setSize}</dd>
                </div>
                {!compact && (
                  <div>
                    <dt>Layout</dt>
                    <dd>{product.layout}</dd>
                  </div>
                )}
              </dl>
              {product.avoidIf && (
                <p className="container-direct-avoid"><strong>Avoid if:</strong> {product.avoidIf}</p>
              )}
              <div className="container-direct-actions">
                <a
                  href={product.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="btn-primary"
                  {...affiliateLinkData({
                    product,
                    productCategory: 'meal-prep-containers',
                    sourcePage,
                    placement: 'quick_picks',
                    listPosition: index + 1,
                    selectedProblem: searchedFor,
                    recommendationSource,
                  })}
                >
                  See Amazon price &rarr;
                </a>
                {guidePath && <Link to={guidePath} className="btn-secondary">More like this</Link>}
              </div>
            </div>
          </article>
        ))}
      </div>

      {fastPick && (
        <div className="container-quick-answer" aria-label="Quick answer">
          <strong>Fast pick</strong>
          <span>{fastPick}</span>
        </div>
      )}

      {showDisclosure && <p className="affiliate-disclosure">{AFFILIATE_DISCLOSURE}</p>}
    </section>
  );
}
