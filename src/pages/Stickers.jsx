import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { MEAL_PREP_STICKERS, BUDGET_CONTAINERS } from '../data/offers.js';
import ProductSpecPlate from '../components/ProductSpecPlate.jsx';

const glassContainerJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Glass Meal Prep Container Deal UK',
    url: 'https://www.mealprep.org.uk/glass-meal-prep-containers',
    description:
      'A quick UK buying page for glass meal prep containers: best premium 10-pack, budget alternative, summary, comparison and deeper buying notes.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk' },
      { '@type': 'ListItem', position: 2, name: 'Meal Prep Containers', item: 'https://www.mealprep.org.uk/meal-prep-containers' },
      { '@type': 'ListItem', position: 3, name: 'Glass Container Deal', item: 'https://www.mealprep.org.uk/glass-meal-prep-containers' },
    ],
  },
];

export default function Stickers() {
  return (
    <>
      <SEO
        title="Glass Meal Prep Container Deal UK | Quick Compare"
        description="See a glass meal prep container pick quickly, compare it with a budget plastic alternative, then scroll for deeper buying notes."
        canonical="/glass-meal-prep-containers"
        jsonLd={glassContainerJsonLd}
      />
      <div className="page content-page product-placement-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>&rsaquo;</span>{' '}
          <Link to="/meal-prep-containers">Meal Prep Containers</Link>{' '}
          <span aria-hidden>&rsaquo;</span> <span>Glass Container Deal</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />
        <section className="sticker-hero product-placement-hero">
          <div className="sticker-hero-copy">
            <span className="offer-kicker">Sponsored #ad - quick pick</span>
            <h1>Glass Meal Prep Containers: Quick Compare</h1>
            <p className="content-intro">
              See the main glass pick first, compare it with a cheaper plastic option,
              then scroll for the longer buying notes if you need them.
            </p>
            <dl className="product-placement-facts">
              <div>
                <dt>Top pick</dt>
                <dd>10-pack borosilicate glass</dd>
              </div>
              <div>
                <dt>Best for</dt>
                <dd>Full-week prep and reheating</dd>
              </div>
              <div>
                <dt>Watch-out</dt>
                <dd>Heavier and needs cupboard space</dd>
              </div>
            </dl>
            <div className="sticker-hero-actions">
              <a
                href={MEAL_PREP_STICKERS.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="btn-primary"
                data-event={MEAL_PREP_STICKERS.eventName}
                data-source-page="glass-container-hero"
                data-offer={MEAL_PREP_STICKERS.name}
              >
                See Amazon price
              </a>
              <a href="#why-glass" className="btn-secondary">
                Buying notes
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
            data-source-page="glass-container-image"
            data-offer={MEAL_PREP_STICKERS.name}
          >
            <ProductSpecPlate product={MEAL_PREP_STICKERS} />
          </a>
        </section>

        <section className="conversion-panel" aria-label="Glass container quick answer">
          <div>
            <strong>At a glance</strong>
            <span>Choose glass for reheating and stain resistance. Choose budget plastic if low cost and light commuting matter more.</span>
          </div>
          <a
            href={MEAL_PREP_STICKERS.href}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="conversion-panel-btn"
            data-event={MEAL_PREP_STICKERS.eventName}
            data-source-page="glass-container-benefit-strip"
            data-offer={MEAL_PREP_STICKERS.name}
          >
            See Amazon price
          </a>
        </section>

        <div className="product-comparison-grid product-comparison-grid--buying">
          <div className="sticker-product-card">
            <a
              href={MEAL_PREP_STICKERS.href}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="product-card-image-link"
              data-event={MEAL_PREP_STICKERS.eventName}
              data-source-page="glass-container-product-card-img"
              data-offer={MEAL_PREP_STICKERS.name}
            >
              <ProductSpecPlate product={MEAL_PREP_STICKERS} className="product-card-img" />
            </a>
            <div className="sticker-product-card-inner">
              <span className="product-badge product-badge--premium">Glass - Premium</span>
              <h2>BOROHOUSE 10-Pack Glass Storage Containers</h2>
              <p className="product-card-verdict">
                Best if you want one larger glass setup for lunches, dinners, leftovers and freezer portions.
              </p>
              <ul className="content-bullets">
                <li>Borosilicate glass for fridge, freezer and reheating routines</li>
                <li>Snap-lock airtight lids for short fridge storage and freezer portions</li>
                <li>10-pack supports a fuller meal prep rotation</li>
              </ul>
              <a
                href={MEAL_PREP_STICKERS.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="btn-primary"
                data-event={MEAL_PREP_STICKERS.eventName}
                data-source-page="glass-container-product-card"
                data-offer={MEAL_PREP_STICKERS.name}
              >
                See Amazon price
              </a>
              <p className="sponsored-note">{MEAL_PREP_STICKERS.disclosure}</p>
            </div>
          </div>

          <div className="sticker-product-card sticker-product-card--budget">
            <a
              href={BUDGET_CONTAINERS.href}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="product-card-image-link"
              data-event={BUDGET_CONTAINERS.eventName}
              data-source-page="glass-container-product-card-img"
              data-offer={BUDGET_CONTAINERS.name}
            >
              <ProductSpecPlate product={BUDGET_CONTAINERS} className="product-card-img" />
            </a>
            <div className="sticker-product-card-inner">
              <span className="product-badge product-badge--budget">Plastic - Budget</span>
              <h2>Compartment Meal Prep Containers</h2>
              <p className="product-card-verdict">
                Best if you want cheaper, lighter boxes for beginner meal prep or work bags.
              </p>
              <ul className="content-bullets">
                <li>Divided compartments keep proteins, carbs and veg separate</li>
                <li>Reusable and lightweight for work or gym bags</li>
                <li>Good entry-level option if you are new to meal prep</li>
              </ul>
              <a
                href={BUDGET_CONTAINERS.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="btn-secondary"
                data-event={BUDGET_CONTAINERS.eventName}
                data-source-page="glass-container-product-card"
                data-offer={BUDGET_CONTAINERS.name}
              >
                See Amazon price
              </a>
              <p className="sponsored-note">{BUDGET_CONTAINERS.disclosure}</p>
            </div>
          </div>
        </div>

        <h2 id="why-glass">Why Use Glass Containers for Meal Prep?</h2>
        <ul className="content-bullets">
          <li>No plastic base when reheating food regularly.</li>
          <li>Airtight lids support short fridge storage and freezer portions.</li>
          <li>Glass makes it easier to see what is inside each container.</li>
          <li>Durable containers can be cheaper than disposable alternatives long term.</li>
        </ul>

        <h2>Works Best With a Meal Plan</h2>
        <p>
          Glass containers are most useful when you know exactly what you are cooking. Use the free AI
          generator to build a personalised 7-day plan for your supermarket, calorie target, and
          dietary preferences, then batch-cook and portion everything into containers.
        </p>

        <div className="cta-box">
          <strong>Need the plan first?</strong>{' '}
          <Link
            to="/"
            data-event="generator_cta_click"
            data-source-page="glass-meal-prep-containers"
          >
            Generate a personalised UK meal plan &rarr;
          </Link>
        </div>

        <h2>Related Guides</h2>
        <ul className="plan-links">
          <li><Link to="/meal-prep-containers">Best Meal Prep Containers UK</Link></li>
          <li><Link to="/meal-prep-containers/glass">Glass Meal Prep Containers UK</Link></li>
          <li><Link to="/meal-prep-containers/budget">Budget Meal Prep Containers UK</Link></li>
          <li><Link to="/meal-prep-containers/mid-range">Mid Range Meal Prep Containers UK</Link></li>
          <li><Link to="/meal-prep-containers/premium">Premium Meal Prep Containers UK</Link></li>
          <li><Link to="/blog/best-meal-prep-containers-uk">Best Meal Prep Containers UK</Link></li>
          <li><Link to="/meal-plan/1800-calorie-meal-plan">7-Day 1800 Calorie Meal Plan UK</Link></li>
          <li><Link to="/meal-plan/high-protein-low-calorie-meal-plan">High Protein Low Calorie Meal Plan UK</Link></li>
        </ul>
      </div>
      <Footer />
    </>
  );
}
