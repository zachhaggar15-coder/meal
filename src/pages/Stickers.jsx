import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import { MEAL_PREP_STICKERS } from '../data/offers.js';

const stickerJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Meal Prep Labels UK',
    url: 'https://www.mealprep.org.uk/stickers',
    description:
      'Freezer-safe meal prep labels for UK batch cooking, portion tracking, calorie notes, and reheating instructions.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk' },
      { '@type': 'ListItem', position: 2, name: 'Meal Prep Labels', item: 'https://www.mealprep.org.uk/stickers' },
    ],
  },
];

export default function Stickers() {
  return (
    <>
      <SEO
        title="Meal Prep Labels UK | Freezer-Safe Stickers for Batch Cooking"
        description="Freezer-safe meal prep labels for UK batch cooking. Record dates, calories, protein, portions, and reheating notes so every container is easy to grab."
        canonical="/stickers"
        ogImage="https://www.mealprep.org.uk/meal-stickers-ad.png"
        jsonLd={stickerJsonLd}
      />
      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>&rsaquo;</span>{' '}
          <span>Meal Prep Labels</span>
        </nav>

        <section className="sticker-hero">
          <div className="sticker-hero-copy">
            <span className="offer-kicker">Sponsored</span>
            <h1>Meal Prep Labels for Batch Cooking</h1>
            <p className="content-intro">
              Mark the date, meal name, calories, protein, portion, and reheating note on every
              container before it goes in the fridge or freezer.
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
                View labels &rarr;
              </a>
              <a href="#why-labels" className="btn-secondary">
                Why labels help
              </a>
            </div>
            <p className="sponsored-note">Sponsored listing. Opens in a new tab.</p>
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
            <img src={MEAL_PREP_STICKERS.image} alt="Meal prep labels and marker pens" />
          </a>
        </section>

        <section className="conversion-panel" aria-label="Meal prep label benefits">
          <div>
            <strong>Useful for</strong>
            <span>Batch cooked lunches, freezer meals, calorie notes, leftovers, and family portions.</span>
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
            View labels
          </a>
        </section>

        <h2 id="why-labels">Why Label Your Meal Prep?</h2>
        <ul className="content-bullets">
          <li>Know what each container is before you open it.</li>
          <li>Track dates so the oldest portions get eaten first.</li>
          <li>Keep calories and protein visible without recalculating every meal.</li>
          <li>Add reheating notes so meals come out properly instead of dry or overdone.</li>
        </ul>

        <div className="sticker-product-card">
          <div className="sticker-product-card-inner">
            <h2>Meal Prep Label Kit</h2>
            <ul className="content-bullets">
              <li>Freezer-safe adhesive for batch-cooked portions</li>
              <li>Fields for date, meal name, calories, protein, and reheating notes</li>
              <li>Works with standard food storage containers and zip-lock bags</li>
              <li>Useful for fridge organisation, portion control, and reducing food waste</li>
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
              View labels &rarr;
            </a>
            <p className="sponsored-note">Sponsored listing.</p>
          </div>
        </div>

        <h2>Works Best With a Meal Plan</h2>
        <p>
          Labels are most useful when each container belongs to a planned week. Use the free AI
          generator to build a personalised 7-day plan for your supermarket, calorie target, and
          dietary preferences, then label the portions as you cook.
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
