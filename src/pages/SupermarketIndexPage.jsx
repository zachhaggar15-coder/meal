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

        <section className="meal-hub-copy-section supermarket-index-guidance">
          <h2>How to choose, if you are not sure</h2>
          <p>
            The honest answer is that the supermarket matters less than most comparisons suggest.
            Every plan here is built from the same kinds of food - a protein, a starch, vegetables
            and something to make it taste of something - and all of the big UK chains stock all of
            it. What changes between them is the price, the pack sizes and which own-brand ranges
            reach the expensive part of the basket.
          </p>
          <p>
            If cost is the binding constraint, start with Aldi or Lidl: their prices are stable week
            to week, which matters more across a twelve-week stretch than any single offer. If you
            want the widest choice for swaps and dietary needs, Tesco, Asda, Sainsbury's or
            Morrisons will fit better. If you are cooking for one or two, the smaller pack sizes at
            M&amp;S and the Co-op waste less than a discounter's larger ones, which can close more of
            the price gap than the shelf label suggests.
          </p>
          <p>
            Iceland is the specialist case and worth understanding rather than dismissing. It is not
            a full weekly shop, but frozen protein and vegetables come pre-portioned, so you cook
            only what you take out - which is portion control without weighing anything.
          </p>

          <h2>What changes between supermarkets, and what does not</h2>
          <p>
            What does not change: the structure of the week, the calorie and protein targets, the
            recipes and the way the shopping list is grouped. A 1,500 kcal weight-loss plan is the
            same plan whichever chain it is costed against.
          </p>
          <p>
            What does change: the weekly cost estimate, the specific own-brand products named in the
            list, and the swaps that make sense when something is out of stock. That is why these
            plans name categories - lean mince, frozen mixed vegetables, plain high-protein yoghurt -
            rather than particular products, which rotate.
          </p>
          <p>
            You are not locked in. If you shop across two stores, or change where you shop, the
            generic UK supermarket plans use average price assumptions and no chain-specific
            products, and every plan can be followed anywhere with the obvious substitutions.
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
