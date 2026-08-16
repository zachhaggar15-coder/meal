import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ACCESSORY_PROBLEMS,
  ACCESSORY_PRODUCT_IDS,
  getAccessoryProblem,
} from '../data/accessoryProblems.js';
import { ACCESSORY_NAV_LINKS } from '../data/navigation.js';
import {
  AFFILIATE_DISCLOSURE,
  getMealPrepProducts,
} from '../data/mealPrepProducts.js';
import {
  ACCESSORY_PROBLEM_SELECTED_EVENT,
  affiliateLinkData,
  getViewportCategory,
} from '../utils/affiliateAnalytics.js';
import { trackEvent } from '../utils/analytics.js';

const accessoryProducts = getMealPrepProducts(ACCESSORY_PRODUCT_IDS);
const productById = new Map(accessoryProducts.map(product => [product.id, product]));
const accessoryGuideLinks = ACCESSORY_NAV_LINKS.filter(link => link.to !== '/meal-prep-accessories');

const REHEATING_GUIDES = [
  { to: '/blog/glass-vs-plastic-meal-prep-containers', label: 'Compare glass and plastic containers' },
  { to: '/blog/microwave-safe-meal-prep-containers-uk', label: 'Read the microwave-safe container guide' },
];

function guideTrackingData(problemId, route, placement) {
  return {
    'data-event': 'accessory_guide_clicked',
    'data-source-page': '/meal-prep-accessories',
    'data-selected-problem': problemId || undefined,
    'data-recommendation-source': 'accessories_hub',
    'data-placement': placement,
    'data-target-route': route,
  };
}

function RecommendationCard({ recommendation, problem, index }) {
  const product = productById.get(recommendation.productId);
  if (!product) return null;

  return (
    <article className="accessory-recommendation-card" data-accessory-product={product.id}>
      <div className="accessory-recommendation-topline">
        <span>{recommendation.role}</span>
        <small>{product.category}</small>
      </div>
      <h3>{product.name}</h3>
      <dl className="accessory-decision-list">
        <div>
          <dt>Best for</dt>
          <dd>{product.bestFor}</dd>
        </div>
        <div>
          <dt>Why it helps</dt>
          <dd>{product.whyItHelps}</dd>
        </div>
        <div>
          <dt>Main drawback</dt>
          <dd>{product.drawback}</dd>
        </div>
        <div>
          <dt>Skip if</dt>
          <dd>{product.skipIf}</dd>
        </div>
        <div>
          <dt>Product information</dt>
          <dd>{product.summary}</dd>
        </div>
      </dl>
      <a
        href={product.href}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="btn-primary accessory-amazon-cta"
        {...affiliateLinkData({
          product,
          sourcePage: `meal-prep-accessories-problem-${problem.id}`,
          placement: index === 0 ? 'recommendation_card_lead' : 'recommendation_card_alternative',
          listPosition: index + 1,
          selectedProblem: problem.id,
          recommendationSource: 'accessories_hub',
        })}
      >
        Check on Amazon <span aria-hidden="true">&rarr;</span>
      </a>
    </article>
  );
}

function ProblemResult({ problem }) {
  if (!problem) {
    return (
      <p className="accessory-problem-empty" role="status">
        Choose one problem above to see a focused recommendation. Nothing is selected yet.
      </p>
    );
  }

  return (
    <section className="accessory-problem-result" aria-labelledby="accessory-problem-result-heading">
      <div className="accessory-result-intro">
        <span className="offer-kicker">Your selected problem</span>
        <h2 id="accessory-problem-result-heading">{problem.label}</h2>
        <p>{problem.summary}</p>
        {problem.guidance.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </div>

      <div className={`accessory-recommendation-grid${problem.recommendations.length === 1 ? ' accessory-recommendation-grid--single' : ''}`}>
        {problem.recommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.productId}
            recommendation={recommendation}
            problem={problem}
            index={index}
          />
        ))}
      </div>

      <nav className="accessory-next-links" aria-label={`${problem.label} guides`}>
        <strong>Useful next steps</strong>
        <div>
          {problem.guides.map((guide, index) => (
            <Link
              key={guide.to}
              to={guide.to}
              data-list-position={index + 1}
              {...guideTrackingData(problem.id, guide.to, 'selected_problem_guide')}
            >
              {guide.label} <span aria-hidden="true">&rarr;</span>
            </Link>
          ))}
        </div>
      </nav>
    </section>
  );
}

function AccessoryCatalogue({ isOpen, onToggle, selectedProblem }) {
  const selectedProductIds = new Set(
    selectedProblem?.recommendations.map(recommendation => recommendation.productId) || [],
  );
  const catalogueProducts = accessoryProducts
    .map((product, index) => ({ product, originalPosition: index + 1 }))
    .filter(({ product }) => !selectedProductIds.has(product.id));

  return (
    <section className="accessory-catalogue" aria-labelledby="accessory-catalogue-heading">
      <div>
        <span className="offer-kicker">Optional catalogue</span>
        <h2 id="accessory-catalogue-heading">Compare more accessories</h2>
        <p>
          All 20 products remain available. Open the catalogue only if you want to compare beyond the focused recommendation.
        </p>
      </div>
      <button
        type="button"
        className="accessory-catalogue-toggle"
        aria-expanded={isOpen}
        aria-controls="accessory-catalogue-products"
        onClick={onToggle}
      >
        {isOpen ? 'Hide product catalogue' : 'Show all 20 products'}
      </button>

      {isOpen && (
        <div id="accessory-catalogue-products" className="accessory-catalogue-products">
          {selectedProblem && (
            <p className="accessory-catalogue-note">
              {selectedProblem.recommendations.length} selected {selectedProblem.recommendations.length === 1 ? 'recommendation remains' : 'recommendations remain'} in the decision panel above; the other {catalogueProducts.length} products are listed here.
            </p>
          )}
          <div className="accessory-catalogue-grid">
            {catalogueProducts.map(({ product, originalPosition }) => (
              <article key={product.id} className="accessory-catalogue-card" data-accessory-product={product.id}>
                <div>
                  <span>{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.bestFor}</p>
                </div>
                <a
                  href={product.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  {...affiliateLinkData({
                    product,
                    sourcePage: 'meal-prep-accessories-catalogue',
                    placement: 'catalogue_card',
                    listPosition: originalPosition,
                    selectedProblem: selectedProblem?.id,
                    recommendationSource: 'accessories_hub',
                  })}
                >
                  View on Amazon <span aria-hidden="true">&rarr;</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function AccessoryProblemSolver() {
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const selectedProblem = getAccessoryProblem(selectedProblemId);

  function selectProblem(problem) {
    if (problem.id === selectedProblemId) return;
    trackEvent(ACCESSORY_PROBLEM_SELECTED_EVENT, {
      problem_id: problem.id,
      problem_label: problem.label,
      source_page: '/meal-prep-accessories',
      viewport_category: getViewportCategory(window.innerWidth),
      previous_problem: selectedProblemId || undefined,
    });
    setSelectedProblemId(problem.id);
  }

  return (
    <>
      <section className="accessory-solver" aria-labelledby="accessory-solver-heading">
        <div className="accessory-solver-head">
          <span className="offer-kicker">Start with the problem</span>
          <h2 id="accessory-solver-heading">What do you need help with?</h2>
          <p>
            Choose the part of meal prep you want to make easier. We’ll show the most relevant option first, plus an alternative only where it genuinely helps.
          </p>
        </div>

        {/* The disclosure used to appear only once a problem was selected or
            the catalogue was opened, so this page could serve twenty tagged
            affiliate links with nothing disclosed at all. The Associates
            agreement wants it wherever those links are, so it is stated up
            front and the two conditional copies below are redundant. */}
        <p className="affiliate-disclosure">{AFFILIATE_DISCLOSURE}</p>

        <div className="accessory-problem-selector" aria-label="Choose a meal-prep problem">
          {ACCESSORY_PROBLEMS.map(problem => {
            const isSelected = problem.id === selectedProblemId;
            return (
              <button
                key={problem.id}
                type="button"
                className={isSelected ? 'accessory-problem-button accessory-problem-button--selected' : 'accessory-problem-button'}
                aria-pressed={isSelected}
                aria-controls="accessory-problem-result"
                data-problem-id={problem.id}
                data-problem-label={problem.label}
                data-source-page="/meal-prep-accessories"
                data-previous-problem={selectedProblemId || undefined}
                onClick={() => selectProblem(problem)}
              >
                {problem.label}
              </button>
            );
          })}
        </div>

        <div id="accessory-problem-result" className="accessory-problem-result-shell" aria-live="polite">
          <ProblemResult problem={selectedProblem} />
        </div>
      </section>

      <aside className="accessory-reheating-note" aria-labelledby="accessory-reheating-heading">
        <span className="offer-kicker">Reheating guidance</span>
        <h2 id="accessory-reheating-heading">Choose around the facilities you actually use</h2>
        <p>
          Glass and plastic have different weight, stain and breakage trade-offs. At work, check whether a microwave is available, vent or remove lids as the manufacturer directs, and follow the current care and reheating instructions for your container.
        </p>
        <div>
          {REHEATING_GUIDES.map((guide, index) => (
            <Link
              key={guide.to}
              to={guide.to}
              data-list-position={index + 1}
              {...guideTrackingData(selectedProblemId, guide.to, 'reheating_guidance')}
            >
              {guide.label} <span aria-hidden="true">&rarr;</span>
            </Link>
          ))}
        </div>
      </aside>

      <AccessoryCatalogue
        isOpen={catalogueOpen}
        onToggle={() => setCatalogueOpen(open => !open)}
        selectedProblem={selectedProblem}
      />

      <section className="accessory-guide-directory" aria-labelledby="accessory-guide-directory-heading">
        <div>
          <span className="offer-kicker">Specialist guides</span>
          <h2 id="accessory-guide-directory-heading">Browse all accessory guides</h2>
          <p>Use these when you need a fuller comparison for one type of equipment.</p>
        </div>
        <nav className="accessory-guide-list" aria-label="Meal prep accessory guides">
          {accessoryGuideLinks.map((guide, index) => (
            <Link
              key={guide.to}
              to={guide.to}
              data-list-position={index + 1}
              {...guideTrackingData(selectedProblemId, guide.to, 'compact_guide_directory')}
            >
              <strong>{guide.label}</strong>
              <span>{guide.description}</span>
            </Link>
          ))}
        </nav>
      </section>
    </>
  );
}
