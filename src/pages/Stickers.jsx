import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';

export default function Stickers() {
  return (
    <>
      <SEO
        title="Meal Prep Labels UK | Freezer-Safe Stickers for Meal Prepping"
        description="Freezer-safe meal prep labels for UK meal preppers. Record dates, calories, protein, and reheating notes. Keep your batch-cooked meals organised all week."
        canonical="/stickers"
      />
      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span>{' '}
          <span>Meal Prep Labels</span>
        </nav>

        <h1>Meal Prep Labels — Keep Your Meal Prep Organised</h1>

        <p className="content-intro">
          If you batch cook, freeze portions, or prep meals for the week ahead, labelling your
          containers saves time and avoids wasted food. These freezer-safe stickers let you record
          the date, calorie count, protein, and reheating instructions — so you always know exactly
          what is in each container.
        </p>

        <div className="sticker-product-card">
          <div className="sticker-product-card-inner">
            <h2>Meal Prep Starter Kit — Labels &amp; Portion Trackers</h2>
            <ul className="content-bullets">
              <li>Freezer-safe adhesive — stays on through the freeze-thaw cycle</li>
              <li>Fields for date, meal name, calories, protein, and reheating notes</li>
              <li>Compatible with standard food storage containers and zip-lock bags</li>
              <li>Ideal for batch cooking, fridge organisation, and portion control</li>
              <li>Ships to all UK addresses</li>
            </ul>
            <a
              href="https://ebay.us/m/w68ZOg"
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="btn-primary"
              data-event="sticker_product_click"
              data-source-page="stickers"
            >
              View on eBay &rarr;
            </a>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '10px' }}>
              Sponsored listing.
            </p>
          </div>
        </div>

        <h2>Why Label Your Meal Prep?</h2>
        <ul className="content-bullets">
          <li>Know exactly what you prepped and when — no more mystery containers at the back of the freezer.</li>
          <li>Track calories and protein at a glance without re-weighing or recalculating each portion.</li>
          <li>Note reheating instructions so anyone in the household can heat meals correctly.</li>
          <li>Reduce food waste by clearly marking dates and rotating the oldest meals first.</li>
        </ul>

        <h2>Works Best With a Meal Plan</h2>
        <p>
          Labels are most useful when you are following a structured meal plan. If you do not have
          one yet, use the free AI generator to build a personalised 7-day plan for your preferred
          UK supermarket, calorie target, and dietary preferences.
        </p>

        <div className="cta-box">
          <strong>Need a meal plan first?</strong>{' '}
          <Link
            to="/"
            data-event="generator_cta_click"
            data-source-page="stickers"
          >
            Use the free AI generator to create a personalised UK meal plan &rarr;
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
