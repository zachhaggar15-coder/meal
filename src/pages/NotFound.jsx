import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found — MealPrep.org.uk"
        description="Sorry, that page doesn't exist. Browse our free UK meal plans or generate a personalised plan in 30 seconds."
        canonical="/404"
      />
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="page content-page">
        <article>
          <h1>Page Not Found</h1>
          <p className="content-intro">
            Sorry — that page doesn&apos;t exist or has moved. Here are some useful places to go
            instead:
          </p>
          <ul className="plan-links">
            <li><Link to="/">Free UK Meal Plan Generator</Link></li>
            <li><Link to="/meal-plan/1500-calorie-meal-plan">1500 Calorie Meal Plan</Link></li>
            <li><Link to="/meal-plan/1800-calorie-meal-plan">1800 Calorie Meal Plan</Link></li>
            <li><Link to="/meal-plan/high-protein-low-calorie-meal-plan">High Protein Low Calorie Plan</Link></li>
            <li><Link to="/blog/how-to-build-a-calorie-deficit">How to Build a Calorie Deficit</Link></li>
          </ul>
        </article>
      </div>
      <Footer />
    </>
  );
}
