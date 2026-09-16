import { Link } from 'react-router-dom';
import { getPdfProductBySlug } from '../data/mealPrepPdfProducts.js';

// Promotes the paid 6-week PDF bundle on a supermarket's own hub page
// (/meal-plans/aldi, /meal-plans/lidl). Distinct from PdfUpsell, which picks
// one single-plan PDF matched to a specific free plan's goal — a hub page
// covers every goal for that supermarket, so this promotes the bundle
// alongside both singles instead of guessing at one.
export default function ShopHubPromo({ supermarket }) {
  const key = String(supermarket || '').toLowerCase();
  if (key !== 'aldi' && key !== 'lidl') return null;

  const bundle = getPdfProductBySlug(`${key}-bundle`);
  const dinner = getPdfProductBySlug(`${key}-dinner-plan`);
  const protein = getPdfProductBySlug(`${key}-high-protein-plan`);
  if (!bundle || !dinner || !protein) return null;

  return (
    <section className="pdf-hub-promo" aria-label="6-week PDF meal plans">
      <div className="mealprep-plus-section-head">
        <span className="offer-kicker">Want it done for six weeks, not one?</span>
        <h2>The {bundle.supermarket} 6-Week PDF Plans</h2>
        <p>
          A printable dinner planner for two, six weeks at a time — one dinner-focused, one
          higher-protein. Weekly shopping lists organised by aisle, 24 recipes with the nutrition
          worked out, and a blank week seven onwards.
        </p>
      </div>
      <div className="mealprep-plus-grid pdf-hub-promo-grid">
        {[dinner, protein, bundle].map(p => (
          <Link className="mealprep-plus-tile shop-tile-link" to={`/meal-prep-pdfs/${p.slug}`} key={p.slug}>
            <h3>{p.name}</h3>
            <p>{p.tagline} · £{p.priceGBP.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
