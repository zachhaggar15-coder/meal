import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import { MEAL_PREP_STICKERS, BUDGET_CONTAINERS } from '../data/offers.js';

const containerJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Glass Meal Prep Containers UK',
    url: 'https://www.mealprep.org.uk/stickers',
    description:
      'Airtight borosilicate glass food storage containers for UK batch cooking — fridge, freezer, and microwave safe. 10-pack.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk' },
      { '@type': 'ListItem', position: 2, name: 'Meal Prep Containers', item: 'https://www.mealprep.org.uk/stickers' },
    ],
  },
];

export default function Stickers() {
  return (
    <>
      <SEO
        title="Glass Meal Prep Containers UK | 10-Pack Airtight Storage"
        description="Airtight borosilicate glass food containers for UK batch cooking. Fridge, freezer, and microwave safe — 10-pack to cover a full week of portions."
        canonical="/stickers"
        ogImage="https://www.mealprep.org.uk/meal-containers-ad.jpg"
        jsonLd={containerJsonLd}
      />
      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>&rsaquo;</span>{' '}
          <span>Meal Prep Containers</span>
        </nav>

        <section className="sticker-hero">
          <div className="sticker-hero-copy">
            <span className="offer-kicker">Sponsored #ad</span>
            <h1>Glass Meal Prep Containers for Batch Cooking</h1>
            <p className="content-intro">
              Store your batch-cooked portions in airtight borosilicate glass containers — go straight
              from fridge or freezer to microwave without switching dishes.
            </p>
            <div className="sticker-hero-actions">
              <a
                href={MEAL_PREP_STICKERS.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="btn-primary"
                data-event={MEAL_PREP_STICKERS.eventName}
                data-source-page="stickers-hero"
                data-offer={MEAL_PREP_STICKERS.name}
              >
                View on Amazon &rarr;
              </a>
              <a href="#why-glass" className="btn-secondary">
                Why glass containers
              </a>
            </div>
            <p className="sponsored-note">{MEAL_PREP_STICKERS.disclosure}</p>
          </div>
          <a
            href={MEAL_PREP_STICKERS.href}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="sticker-hero-image"
            data-event={MEAL_PREP_STICKERS.eventName}
            data-source-page="stickers-image"
            data-offer={MEAL_PREP_STICKERS.name}
          >
            <img src={MEAL_PREP_STICKERS.image} alt="BOROHOUSE 10-pack glass food storage containers" />
          </a>
        </section>

        <section className="conversion-panel" aria-label="Glass container benefits">
          <div>
            <strong>Useful for</strong>
            <span>Batch-cooked lunches, freezer meals, portioned dinners, snacks, and leftovers.</span>
          </div>
          <a
            href={MEAL_PREP_STICKERS.href}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="conversion-panel-btn"
            data-event={MEAL_PREP_STICKERS.eventName}
            data-source-page="stickers-benefit-strip"
            data-offer={MEAL_PREP_STICKERS.name}
          >
            View on Amazon
          </a>
        </section>

        <h2 id="why-glass">Why Use Glass Containers for Meal Prep?</h2>
        <ul className="content-bullets">
          <li>No plastic chemicals leaching into reheated food — safe for everyday use.</li>
          <li>Airtight lids keep meals fresh in the fridge for 4–5 days.</li>
          <li>Go straight from freezer to microwave without switching dishes.</li>
          <li>See exactly what&apos;s inside each container without opening it.</li>
          <li>Durable enough to last years — cheaper than disposable alternatives long-term.</li>
        </ul>

        <div className="product-comparison-grid">
          {/* Premium glass option */}
          <div className="sticker-product-card">
            <a
              href={MEAL_PREP_STICKERS.href}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="product-card-image-link"
              data-event={MEAL_PREP_STICKERS.eventName}
              data-source-page="stickers-product-card-img"
              data-offer={MEAL_PREP_STICKERS.name}
            >
              <img src={MEAL_PREP_STICKERS.image} alt={MEAL_PREP_STICKERS.imageAlt} className="product-card-img" />
            </a>
            <div className="sticker-product-card-inner">
              <span className="product-badge product-badge--premium">Glass · Premium</span>
              <h2>BOROHOUSE 10-Pack Glass Storage Containers</h2>
              <ul className="content-bullets">
                <li>Borosilicate glass — oven, microwave, dishwasher, freezer, and fridge safe</li>
                <li>Snap-lock airtight lids to keep portions fresh all week</li>
                <li>10-pack covers a full week of breakfast, lunch, dinner, and snacks</li>
                <li>Stackable design to keep your fridge and freezer tidy</li>
              </ul>
              <a
                href={MEAL_PREP_STICKERS.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="btn-primary"
                data-event={MEAL_PREP_STICKERS.eventName}
                data-source-page="stickers-product-card"
                data-offer={MEAL_PREP_STICKERS.name}
              >
                View on Amazon &rarr;
              </a>
              <p className="sponsored-note">{MEAL_PREP_STICKERS.disclosure}</p>
            </div>
          </div>

          {/* Budget compartment option */}
          <div className="sticker-product-card sticker-product-card--budget">
            <a
              href={BUDGET_CONTAINERS.href}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="product-card-image-link"
              data-event={BUDGET_CONTAINERS.eventName}
              data-source-page="stickers-product-card-img"
              data-offer={BUDGET_CONTAINERS.name}
            >
              <img src={BUDGET_CONTAINERS.image} alt={BUDGET_CONTAINERS.imageAlt} className="product-card-img" />
            </a>
            <div className="sticker-product-card-inner">
              <span className="product-badge product-badge--budget">Plastic · Budget</span>
              <h2>Compartment Meal Prep Containers</h2>
              <ul className="content-bullets">
                <li>Divided compartments keep proteins, carbs, and veg separate</li>
                <li>Reusable and lightweight — easy to carry to work or the gym</li>
                <li>Leak-resistant lids suitable for fridge and freezer storage</li>
                <li>Great entry-level option if you are new to meal prep</li>
              </ul>
              <a
                href={BUDGET_CONTAINERS.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="btn-secondary"
                data-event={BUDGET_CONTAINERS.eventName}
                data-source-page="stickers-product-card"
                data-offer={BUDGET_CONTAINERS.name}
              >
                View on Amazon &rarr;
              </a>
              <p className="sponsored-note">{BUDGET_CONTAINERS.disclosure}</p>
            </div>
          </div>
        </div>

        <h2>Works Best With a Meal Plan</h2>
        <p>
          Glass containers are most useful when you know exactly what you&apos;re cooking. Use the free AI
          generator to build a personalised 7-day plan for your supermarket, calorie target, and
          dietary preferences, then batch-cook and portion everything into containers.
        </p>

        <div className="cta-box">
          <strong>Need the plan first?</strong>{' '}
          <Link
            to="/"
            data-event="generator_cta_click"
            data-source-page="stickers"
          >
            Generate a personalised UK meal plan &rarr;
          </Link>
        </div>

        <h2>Related Meal Plans</h2>
        <ul className="plan-links">
          <li><Link to="/meal-plan/1800-calorie-meal-plan">7-Day 1800 Calorie Meal Plan UK</Link></li>
          <li><Link to="/meal-plan/high-protein-low-calorie-meal-plan">High Protein Low Calorie Meal Plan UK</Link></li>
          <li><Link to="/meal-plan/aldi-1800-calorie-meal-plan">Aldi 1800 Calorie Meal Plan UK</Link></li>
          <li><Link to="/meal-plan/tesco-low-calorie-meal-plan">Tesco Low Calorie Meal Plan UK</Link></li>
          <li><Link to="/meal-plan/cheap-student-meal-plan-uk">Cheap Student Meal Plan UK</Link></li>
        </ul>
      </div>
      <Footer />
    </>
  );
}
