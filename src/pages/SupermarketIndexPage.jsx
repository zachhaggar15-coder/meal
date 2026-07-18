import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { INDEXED_SUPERMARKET_CHOICES } from '../data/planChooser.js';
import { chooseSupermarketVisual, SITE_VISUALS } from '../data/visualAssets.js';
import { toTitleCase } from '../utils/textFormatting.js';

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Choose a UK Supermarket Meal Plan',
    description: `Choose ${INDEXED_SUPERMARKET_CHOICES.map(market => market.label).join(', ')} before selecting your meal plan goal.`,
    url: 'https://www.mealprep.org.uk/meal-plans',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: INDEXED_SUPERMARKET_CHOICES.map((market, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${market.label} meal plans`,
        url: `https://www.mealprep.org.uk/choose-supermarket/${market.value}`,
      })),
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk/' },
      { '@type': 'ListItem', position: 2, name: 'Supermarkets', item: 'https://www.mealprep.org.uk/meal-plans' },
    ],
  },
];

export default function SupermarketIndexPage() {
  return (
    <>
      <SEO
        title="Choose a UK Supermarket Meal Plan | MealPrep.org.uk"
        description="Choose your supermarket first, then pick a goal, calorie target and diet type for a free printable UK meal plan."
        canonical="/meal-plans"
        jsonLd={jsonLd}
      />

      <div className="content-page supermarket-index-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">Supermarkets</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />

        <header className="supermarket-index-hero">
          <div>
            <span className="offer-kicker">{toTitleCase('Choose supermarket first')}</span>
            <h1>UK Meal Plans by Supermarket</h1>
            <p className="content-intro">
              Start with where you shop, then choose the goal that fits this week:
              weight loss, high protein, muscle gain, student meals, low effort or busy work lunches.
            </p>
            <div className="supermarket-index-actions">
              <Link className="btn-primary" to="/quiz">Find my best match</Link>
              <Link className="btn-secondary" to="/browse">Browse all plans</Link>
            </div>
          </div>
          <PageHeroVisual visual={SITE_VISUALS.supermarket} className="supermarket-index-visual" priority />
        </header>

        <section className="supermarket-index-grid" aria-label="Choose a supermarket">
          {INDEXED_SUPERMARKET_CHOICES.map(market => {
            const cardVisual = chooseSupermarketVisual(market.value);
            return (
              <Link key={market.value} to={`/choose-supermarket/${market.value}`} className="supermarket-index-card">
                <img
                  src={cardVisual.src}
                  alt=""
                  width={cardVisual.width}
                  height={cardVisual.height}
                  loading="lazy"
                  decoding="async"
                />
                <span>{toTitleCase(market.label)}</span>
                <small>{market.description}</small>
              </Link>
            );
          })}
        </section>
      </div>
      <Footer />
    </>
  );
}
