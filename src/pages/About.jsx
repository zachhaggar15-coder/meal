import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About MealPrep.org.uk',
  description: 'Editorial and safety notes for MealPrep.org.uk, a free UK meal planning website.',
  url: 'https://www.mealprep.org.uk/about',
  mainEntity: {
    '@type': 'Organization',
    name: 'MealPrep.org.uk',
    url: 'https://www.mealprep.org.uk',
  },
};

export default function About() {
  return (
    <>
      <SEO
        title="About MealPrep.org.uk - Editorial Notes & Nutrition Safety"
        description="Learn how MealPrep.org.uk creates free UK meal plans, shopping-list guides and nutrition content, including editorial notes and safety disclaimers."
        canonical="/about"
        jsonLd={jsonLd}
      />

      <div className="content-page about-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">About</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />
        <h1>About MealPrep.org.uk</h1>
        <p className="content-intro">
          MealPrep.org.uk helps UK shoppers turn calorie targets, supermarket choices and diet
          preferences into practical weekly meal plans with recipes, macros, PDFs and shopping lists.
        </p>

        <section>
          <h2>Editorial Approach</h2>
          <p>
            Guides are written for realistic UK supermarket shopping and reviewed for clarity,
            usefulness and safety. Nutrition pages prioritise familiar ingredients, repeatable
            meals, visible portion guidance and links to relevant plan hubs rather than extreme
            dieting rules.
          </p>
          <p>
            Health and nutrition content is general information only. It is not medical advice,
            diagnosis or treatment, and it should not replace guidance from a qualified healthcare
            professional.
          </p>
        </section>

        <section>
          <h2>Sources and Review Dates</h2>
          <p>
            Priority nutrition pages include source notes where NHS guidance or other public health
            references are used. Pages with health, calorie or nutrition advice show a material
            review date so readers can see when the guidance was last checked.
          </p>
          <p>
            Product pages and Amazon UK affiliate guides are kept separate from medical claims.
            Affiliate links may earn commission, but recommendations are written around buyer fit,
            materials, storage, reheating and everyday meal-prep use.
          </p>
        </section>

        <section>
          <h2>Useful Starting Points</h2>
          <ul className="plan-links">
            <li><Link to="/meal-plans/free-online-diet-plans-uk">Free online diet plans UK</Link></li>
            <li><Link to="/meal-plans/1500-calorie">Printable 1500 calorie meal plan</Link></li>
            <li><Link to="/blog/best-low-calorie-foods-uk">Low calorie foods UK</Link></li>
            <li><Link to="/blog/high-protein-snacks-uk">High protein snacks UK</Link></li>
          </ul>
        </section>
      </div>
      <Footer />
    </>
  );
}
