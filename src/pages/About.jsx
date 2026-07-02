import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About MealPrep.org.uk',
  url: 'https://www.mealprep.org.uk/about',
  mainEntity: {
    '@type': 'Organization',
    name: 'MealPrep.org.uk',
    url: 'https://www.mealprep.org.uk',
    logo: 'https://www.mealprep.org.uk/favicon.svg',
    description:
      'Free UK meal plan generator and library of calorie-controlled meal plans built around UK supermarket ingredients.',
  },
};

export default function About() {
  return (
    <>
      <SEO
        title="About MealPrep.org.uk — Who We Are & How Our Meal Plans Are Built"
        description="Who is behind MealPrep.org.uk, how our free UK meal plans are created, where our calorie data comes from, and our editorial standards."
        canonical="/about"
        jsonLd={jsonLd}
      />
      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span> <span>About</span>
        </nav>

        <article>
          <h1>About MealPrep.org.uk</h1>
          <p className="content-intro">
            MealPrep.org.uk is a free UK meal planning site. We build calorie-controlled,
            high-protein weekly meal plans around ingredients you can actually buy at Tesco, Aldi,
            Sainsbury&apos;s, Asda, Morrisons, Lidl, and Iceland — with shopping lists and realistic
            weekly costs included.
          </p>

          <section>
            <h2>Who We Are</h2>
            <p>
              MealPrep.org.uk is run by a small UK-based team of meal prep enthusiasts and home
              cooks. We started the site because most meal plans online are written for American
              readers, priced in dollars, and built around ingredients that are hard to find in a
              British supermarket. Every plan on this site is written for UK shoppers, uses metric
              measurements, and is costed against real UK supermarket prices.
            </p>
          </section>

          <section>
            <h2>How Our Meal Plans Are Built</h2>
            <p>
              Each plan starts from a daily calorie target and a minimum protein threshold. Meals
              are chosen to be simple to cook (most take under 30 minutes), affordable, and built
              from widely stocked supermarket staples — chicken breast, eggs, oats, Greek yogurt,
              tinned fish, lentils, and frozen vegetables.
            </p>
            <p>
              Calorie and protein figures are estimated from standard nutritional databases and
              supermarket product data. They are intended as a practical guide, not a clinical
              tool — individual products vary, so always check labels if you need precision.
            </p>
          </section>

          <section>
            <h2>Our Editorial Standards</h2>
            <ul className="content-bullets">
              <li>
                Weight-loss guidance follows{' '}
                <a href="https://www.nhs.uk/live-well/healthy-weight/" target="_blank" rel="noopener noreferrer">
                  NHS healthy weight advice
                </a>{' '}
                — we never recommend deficits below NHS-recommended minimum intakes.
              </li>
              <li>Every plan includes a full shopping list and honest weekly cost estimate.</li>
              <li>We update plans when supermarket ranges or prices change materially.</li>
              <li>
                We clearly flag that our content is general information, not medical advice. For
                medical conditions, pregnancy, eating disorders, or clinical dietary needs, speak
                to a GP or registered dietitian.
              </li>
            </ul>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              Spotted an error, have a suggestion, or want to say hello? Visit our{' '}
              <Link to="/contact">contact page</Link> — we read everything.
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </>
  );
}
