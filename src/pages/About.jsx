import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { SITE_CONTACT_EMAIL } from '../constants/site.js';

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
    email: SITE_CONTACT_EMAIL,
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
          <h2>Who runs this site</h2>
          <p>
            MealPrep.org.uk is an independent UK site, not a brand, retailer or clinical service.
            It is run by a small editorial team, funded by Amazon UK affiliate commission on some
            container and accessory links, and free to use with no account and no paywall. Nobody
            here is a dietitian, nutritionist or doctor, and we do not claim to be — where a page
            leans on public health guidance it links to the NHS or Food Standards Agency source so
            you can read it directly.
          </p>
          <p>
            If you want the detail of how the plans, nutrition figures, shopping lists and cost
            estimates are actually produced, that is set out in full on the{' '}
            <Link to="/methodology">methodology page</Link>, including what the site cannot
            guarantee.
          </p>
        </section>

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
          <h2>How Plans Are Created</h2>
          <p>
            Meal plans are assembled from a curated UK meal library with supermarket, diet,
            calorie, budget and preparation rules. The generator only shows combinations that
            can be turned into a usable 7-day plan with recipes, macro estimates and a grouped
            shopping list.
          </p>
          <p>
            Automation helps scale the plan library and route coverage, but pages are structured
            around practical tasks: what the reader is trying to buy, cook, print or
            compare. Priority pages are reviewed for duplicated copy, broken internal links,
            unrealistic budgets and unsupported nutrition claims before release.
          </p>
        </section>

        <section id="meal-plan-costs">
          <h2>How Our Meal-Plan Costs Are Estimated</h2>
          <p>
            Weekly costs are broad planning ranges based on the plan&rsquo;s budget tier and the UK
            supermarket it targets. They are not a live basket quote, they can assume small amounts
            of cupboard staples are already available, and they cannot price every pack-size
            leftover. Your actual spend changes with brands, pack sizes, substitutions, promotions
            and regional prices.
          </p>
          <p>
            The tiers themselves, and everything the estimate does not claim, are set out on the{' '}
            <Link to="/methodology#costs">methodology page</Link>.
          </p>
        </section>

        <section>
          <h2>Contact and Corrections</h2>
          <p>
            For editorial corrections, source questions, product updates or business enquiries,
            contact <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>, or use the{' '}
            <Link to="/contact">contact page</Link> or <Link to="/feedback">feedback form</Link>.
            Corrections are prioritised when they affect safety, nutrition context, prices,
            availability or whether a page still reflects current UK supermarket meal prep.
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
