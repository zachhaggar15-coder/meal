import { Link } from 'react-router-dom';
import {
  AFFILIATE_DISCLOSURE,
  getContainerProduct,
  getContainerProducts,
} from '../data/containerProducts.js';
import { toTitleCase } from '../utils/textFormatting.js';

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
}) {
  const items = resolveComparisonItems({ picks, productIds, fallbackSearch });

  if (!items.length) return null;

  const headingRank = headingLevel === 'h1' ? 1 : headingLevel === 'h3' ? 3 : 2;
  const HeadingTag = `h${headingRank}`;
  const CardHeadingTag = `h${Math.min(headingRank + 1, 4)}`;
  const headingId = `${sourcePage}-heading`.replace(/[^a-z0-9_-]/gi, '-');

  return (
    <section className="container-direct-compare" aria-labelledby={headingId}>
      <div className="container-direct-head">
        <div>
          <span className="offer-kicker">{toTitleCase(eyebrow)}</span>
          <HeadingTag id={headingId}>{title}</HeadingTag>
        </div>
        {intro && <p>{intro}</p>}
      </div>

      <div className={`container-snapshot-strip container-snapshot-strip--${Math.min(items.length, 3)}`} aria-label="Container options at a glance">
        {items.map(({ product, sizeLabel, sizeFocus }) => (
          <a
            key={`${product.id}-snapshot`}
            href={product.href}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="container-snapshot-item"
            data-event="container_product_click"
            data-source-page={`${sourcePage}-snapshot`}
            data-offer={product.name}
            aria-label={`See ${product.shortName} on Amazon UK`}
          >
            <span>{sizeLabel}</span>
            <strong>{sizeFocus}</strong>
            <small>{product.material}</small>
          </a>
        ))}
      </div>

      <div className={`container-direct-grid container-direct-grid--${Math.min(items.length, 3)}`}>
        {items.map(({ product, searchedFor, sizeLabel, sizeFocus, fit, guidePath }) => (
          <article key={product.id} className="container-direct-card">
            <div className="container-direct-media">
              <img
                src={product.image}
                alt={`${product.shortName} meal prep containers`}
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="container-direct-body">
              <span className="container-search-chip">You searched: {searchedFor}</span>
              <CardHeadingTag>{sizeLabel}</CardHeadingTag>
              <strong className="container-size-focus">{sizeFocus}</strong>
              <p>{fit}</p>
              <dl className="container-direct-facts">
                <div>
                  <dt>Material</dt>
                  <dd>{product.material}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>{product.setSize}</dd>
                </div>
                <div>
                  <dt>Layout</dt>
                  <dd>{product.layout}</dd>
                </div>
              </dl>
              <div className="container-direct-actions">
                <a
                  href={product.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="btn-primary"
                  data-event="container_product_click"
                  data-source-page={sourcePage}
                  data-offer={product.name}
                >
                  See Amazon price
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
