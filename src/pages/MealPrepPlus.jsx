import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import WaitlistSection from '../components/WaitlistSection.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { SITE_VISUALS } from '../data/visualAssets.js';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'MealPrep+',
  description: 'MealPrep+ is the planned weekly meal planning service from MealPrep.org.uk, built around UK supermarkets, budgets, calorie targets and simple shopping lists.',
  url: 'https://www.mealprep.org.uk/mealprep-plus',
  publisher: {
    '@type': 'Organization',
    name: 'MealPrep.org.uk',
    url: 'https://www.mealprep.org.uk',
  },
};

const weeklyItems = [
  'A fresh 7-day meal plan matched to your goal and preferred supermarket.',
  'Calories, protein estimates and simple portions for each day.',
  'A grouped shopping list built for normal UK supermarket aisles.',
  'Prep notes for busy weeks, leftovers and freezer-friendly meals.',
  'Easy swaps when a food, budget or schedule does not fit.',
];

const fitItems = [
  ['Busy weeks', 'A plan arrives before the shop, so you are not rebuilding meals from scratch.'],
  ['UK supermarkets', 'Meals are designed around familiar ingredients from Aldi, Lidl, Tesco, Asda and other UK shops.'],
  ['Clear goals', 'Weight loss, high protein, budget cooking, family meals and lower-effort weeks all need different plans.'],
  ['Less waste', 'Repeated ingredients and grouped shopping lists make the basket easier to use up.'],
];

export default function MealPrepPlus() {
  return (
    <>
      <SEO
        title="MealPrep+ | Weekly UK Meal Planning Waitlist"
        description="Join the MealPrep+ waitlist for a planned weekly UK meal planning service with supermarket shopping lists, recipes, calories and prep notes."
        canonical="/mealprep-plus"
        jsonLd={jsonLd}
      />

      <div className="mealprep-plus-page">
        <section className="mealprep-plus-hero">
          <div className="mealprep-plus-hero-copy">
            <span className="offer-kicker">MealPrep+ waitlist</span>
            <h1>Weekly meal planning, already sorted before you shop.</h1>
            <p>
              MealPrep+ is the next step for MealPrep.org.uk: a simple weekly service
              that sends you a fresh meal plan, recipes and shopping list built around
              your supermarket, budget, calorie target and food preferences.
            </p>
            <div className="mealprep-plus-actions">
              <a href="#mealprep-plus-signup" className="btn-primary">Join the waitlist</a>
              <Link to="/browse" className="btn-secondary">Browse free plans</Link>
            </div>
          </div>
          <PageHeroVisual
            visual={SITE_VISUALS.printable}
            className="mealprep-plus-visual"
            priority
          />
        </section>

        <section className="mealprep-plus-band" aria-labelledby="mealprep-plus-weekly-heading">
          <div>
            <span className="offer-kicker">What it is</span>
            <h2 id="mealprep-plus-weekly-heading">A weekly plan without the weekly planning session.</h2>
            <p>
              The free site is great when you want to choose a plan yourself. MealPrep+
              is for people who want that decision made easier each week, with fresh
              ideas and a shopping list ready before the supermarket run.
            </p>
          </div>
          <ul className="mealprep-plus-checklist">
            {weeklyItems.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="mealprep-plus-fit" aria-labelledby="mealprep-plus-fit-heading">
          <div className="mealprep-plus-section-head">
            <span className="offer-kicker">Built for real weeks</span>
            <h2 id="mealprep-plus-fit-heading">Who MealPrep+ is for</h2>
          </div>
          <div className="mealprep-plus-grid">
            {fitItems.map(([title, copy]) => (
              <article className="mealprep-plus-tile" key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mealprep-plus-steps" aria-labelledby="mealprep-plus-steps-heading">
          <div className="mealprep-plus-section-head">
            <span className="offer-kicker">How it would work</span>
            <h2 id="mealprep-plus-steps-heading">From preferences to shopping list</h2>
          </div>
          <ol>
            <li>
              <strong>Choose your setup.</strong>
              <span>Tell us your supermarket, goal, diet style, budget and household size.</span>
            </li>
            <li>
              <strong>Get the plan.</strong>
              <span>Receive a realistic week of meals with calories, protein estimates and prep notes.</span>
            </li>
            <li>
              <strong>Shop once.</strong>
              <span>Use a grouped list with repeated ingredients, simple swaps and fewer one-off extras.</span>
            </li>
          </ol>
        </section>

        <div id="mealprep-plus-signup">
          <WaitlistSection sourcePage="mealprep-plus" className="waitlist--mealprep-plus" />
        </div>

        <section className="mealprep-plus-note" aria-label="MealPrep+ launch note">
          <h2>No payment today</h2>
          <p>
            The waitlist helps decide whether MealPrep+ should be built first, and what
            it should include. Joining means you want updates if the service launches.
          </p>
        </section>
      </div>

      <Footer />
    </>
  );
}
