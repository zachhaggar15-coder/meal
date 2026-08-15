import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { SITE_CONTACT_EMAIL } from '../constants/site.js';
import { UK_ALLERGENS } from '../utils/allergens.js';

// The public version of the engineering documentation that governs how plans,
// nutrition, costs and quality checks actually work. Everything on this page is
// a description of behaviour that exists in the codebase — it deliberately does
// not claim human recipe testing, professional review or live pricing, because
// none of those happen.

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'How MealPrep.org.uk works',
  description:
    'How MealPrep.org.uk builds meal plans, calculates nutrition, estimates costs, applies diet filters, handles allergens and food safety, and what the site cannot guarantee.',
  url: 'https://www.mealprep.org.uk/methodology',
};

export default function Methodology() {
  return (
    <>
      <SEO
        title="Methodology: How MealPrep.org.uk Builds Plans"
        description="How our meal plans are built, how calories and macros are calculated, where nutrition data comes from, how cost estimates work, and what we cannot guarantee."
        canonical="/methodology"
        jsonLd={jsonLd}
      />

      <div className="content-page methodology-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">Methodology</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />
        <h1>How MealPrep.org.uk works</h1>
        <p className="content-intro">
          This page explains how the plans, nutrition figures, shopping lists and cost
          estimates on this site are produced — and, just as importantly, what they do not
          claim. If a number here matters to you, this is the page that tells you how much
          weight it can carry.
        </p>

        <nav className="methodology-toc" aria-label="On this page">
          <h2>On this page</h2>
          <ul>
            <li><a href="#plans">How plans are built</a></li>
            <li><a href="#nutrition">How calories and macros are calculated</a></li>
            <li><a href="#data">Where the nutrition data comes from</a></li>
            <li><a href="#targets">What a &ldquo;1,500 calorie plan&rdquo; means</a></li>
            <li><a href="#shopping">How shopping lists are built</a></li>
            <li><a href="#supermarkets">What a supermarket-specific plan means</a></li>
            <li><a href="#costs">How cost estimates work</a></li>
            <li><a href="#diets">How diet filters are decided</a></li>
            <li><a href="#allergens">Allergens: what we can and cannot tell you</a></li>
            <li><a href="#food-safety">Food safety and storage</a></li>
            <li><a href="#automation">Automation and human involvement</a></li>
            <li><a href="#qa">Quality checks before anything ships</a></li>
            <li><a href="#limits">What this site does not do</a></li>
          </ul>
        </nav>

        <section id="plans">
          <h2>How plans are built</h2>
          <p>
            Plans are assembled from a curated library of UK meals rather than written one at a
            time. Each meal carries a quantified ingredient list, a meal type, a diet
            classification, a preparation time and practicality tags. A plan is a selection from
            that library that satisfies the constraints attached to it: calorie target, goal,
            diet, supermarket orientation, budget tier and cooking effort.
          </p>
          <p>
            A combination is only published when it can actually be turned into a usable seven-day
            plan — with recipes, calculated nutrition and a grouped shopping list. Combinations
            that cannot meet their own constraints are not shown rather than being filled with
            approximations.
          </p>
          <p>
            Recipe methods are generated deterministically from the ingredient list using
            recipe-family rules, so a stir-fry is written as a stir-fry, a roast uses the oven,
            and a cold salad is not routed through a hot cooking step. The same input always
            produces the same method.
          </p>
        </section>

        <section id="nutrition">
          <h2>How calories and macros are calculated</h2>
          <p>
            The quantified ingredient list is the single source of truth. Calories, protein,
            carbohydrate, fat and fibre are calculated from those ingredients at full precision
            and rounded once, at the point of display. Any stored headline figure on a meal is a
            synchronised copy of that calculation, never an independent number.
          </p>
          <ul className="content-bullets">
            <li>
              Ingredient lines are parsed into a quantity, a unit, a food name and any raw or
              cooked qualifier.
            </li>
            <li>
              Quantities are converted to grams, millilitres or a food-specific count weight.
              Tablespoons and teaspoons use food-specific densities where treating them as water
              would be materially wrong — oils, honey and nut butters, for example.
            </li>
            <li>
              Raw and cooked foods are separate records. Dry grains never borrow cooked values and
              cooked quantities never borrow dry values.
            </li>
            <li>
              Values are summed with decimals intact and rounded once to whole units. Day totals
              sum the displayed meal values; weekly figures average the seven days.
            </li>
            <li>
              Water, herbs, seasoning and garnishes only contribute zero when the ingredient
              explicitly says it is excluded from the estimate. Oils, sauces and dressings are
              always counted.
            </li>
          </ul>
          <p>
            <strong>Carbohydrate</strong> is available carbohydrate using the UK convention, which
            excludes fibre; fibre is reported separately. Sugars, saturated fat and salt are not
            calculated, so the site does not display them rather than showing a guess.
          </p>
          <p>
            These are estimates of edible ingredient weight. They do not model cooking losses,
            drained weight beyond what an ingredient states, bioavailability, or how accurately
            you measure a portion in your own kitchen.
          </p>
        </section>

        <section id="data">
          <h2>Where the nutrition data comes from</h2>
          <p>
            The site uses a local reference set of{' '}
            <strong>230 canonical food records</strong> with reviewed aliases. Every record has
            explicit values for each stored macro — no macro is inferred from calories or from
            another macro, and no value is produced by fuzzy-matching an unfamiliar food to a
            vaguely similar one.
          </p>
          <p>Records are sourced, in order of preference:</p>
          <ul className="content-bullets">
            <li>
              The{' '}
              <a
                href="https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid"
                target="_blank"
                rel="noopener noreferrer"
              >
                UK Composition of Foods Integrated Dataset (CoFID)
              </a>{' '}
              where a suitable deterministic match exists.
            </li>
            <li>
              <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">
                USDA FoodData Central
              </a>{' '}
              where CoFID has no suitable match.
            </li>
            <li>
              A representative current UK manufacturer or retailer nutrition panel for
              branded-style products such as prepared sauces and dressings.
            </li>
          </ul>
          <p>
            These mappings are stored locally. Neither the site build nor any page you load
            depends on an external nutrition service, so figures cannot silently change
            underneath a plan you have saved.
          </p>
        </section>

        <section id="targets">
          <h2>What a &ldquo;1,500 calorie plan&rdquo; means</h2>
          <p>
            A calorie label describes the target the plan is built around, not a promise that
            every day lands on that exact number. Real meals come in real portions, and forcing
            each day onto an exact figure would mean inventing portion sizes nobody would cook.
          </p>
          <p>Instead, a plan only earns a calorie label when it meets a stated tolerance:</p>
          <ul className="content-bullets">
            <li>
              Its <strong>seven-day mean is within ±3%</strong> of the stated target.
            </li>
            <li>
              <strong>Every individual day is within ±7.5%</strong> of the target.
            </li>
            <li>
              A protein target must be within ±5&nbsp;g or ±5% on average, whichever is larger,
              and every day within ±10%.
            </li>
            <li>
              A <strong>high-protein</strong> label requires at least 20% of the plan&rsquo;s
              calculated energy to come from protein.
            </li>
          </ul>
          <p>
            If any ingredient, unit or serving yield cannot be resolved, the plan becomes
            ineligible for that claim and is rejected rather than published with guessed numbers.
          </p>
          <p>
            One consequence worth knowing: a plan viewed on its own can show a slightly different
            calorie figure for the same recipe than the same recipe inside a plan, because
            portions are scaled to hit the plan&rsquo;s daily target. That is the scaling working,
            not an error.
          </p>
        </section>

        <section id="shopping">
          <h2>How shopping lists are built</h2>
          <p>
            A shopping list is generated from the plan&rsquo;s own ingredient quantities. Identical
            foods are combined across the week, units are normalised so the same ingredient does
            not appear twice in different measures, and items are grouped into supermarket
            sections.
          </p>
          <p>
            The list shows the quantity the plan <em>uses</em>. It is not a pack list: you cannot
            buy 192&nbsp;ml of sauce or three-fifths of a bag of spinach, so expect to buy whole
            packs and have some left over. Small amounts of salt, pepper and water are not
            itemised.
          </p>
        </section>

        <section id="supermarkets">
          <h2>What a supermarket-specific plan means</h2>
          <p>
            A supermarket-oriented plan is built around the kind of shop that retailer supports
            well — the ranges it is known for, the staples it reliably carries, and how its
            own-brand pricing tends to behave. Iceland plans lean on freezer-friendly components;
            Aldi and Lidl plans lean on a shorter list of low-cost staples; Tesco, Asda and
            Sainsbury&rsquo;s plans assume broader ranges and easier substitutions.
          </p>
          <p>
            It does <strong>not</strong> mean we have checked today&rsquo;s stock, or that every
            ingredient maps to a specific product code in your local store. We do not hold live
            retailer data, so a supermarket-named plan is a shopping approach, not an availability
            guarantee. Every ingredient is a common UK supermarket item that can be substituted.
          </p>
        </section>

        <section id="costs">
          <h2>How cost estimates work</h2>
          <p>
            Weekly costs are planning ranges, not basket quotations. Generated plans use four
            one-person weekly tiers, which scale when you add household portions:
          </p>
          <div className="table-scroll">
            <table className="content-table">
              <caption>Weekly cost tiers for one person</caption>
              <thead>
                <tr>
                  <th scope="col">Tier</th>
                  <th scope="col">Displayed estimate</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row">Very cheap</th><td>£20–£30</td></tr>
                <tr><th scope="row">Budget</th><td>£30–£40</td></tr>
                <tr><th scope="row">Moderate</th><td>£40–£55</td></tr>
                <tr><th scope="row">Flexible</th><td>£50–£70</td></tr>
              </tbody>
            </table>
          </div>
          <p>The estimate assumes a seven-day shop using common UK own-brand ingredients. It:</p>
          <ul className="content-bullets">
            <li>is not connected to any live retailer pricing;</li>
            <li>does not guarantee a checkout total, delivery fees or membership prices;</li>
            <li>does not guarantee stock, promotions, loyalty pricing or a particular pack size;</li>
            <li>
              does not separately price salt, water or negligible seasoning, and does not subtract
              what you already have in the cupboard;
            </li>
            <li>cannot model pack-size leftovers, waste or regional price differences exactly.</li>
          </ul>
          <p>
            A small number of older editorial plans carry a separately reviewed supermarket range
            with the date it was checked. Where that date is shown, it is the date of that check —
            prices will have moved since.
          </p>
        </section>

        <section id="diets">
          <h2>How diet filters are decided</h2>
          <p>
            Vegetarian, vegan and pescatarian classifications are applied to each meal from its
            actual ingredient list, not from its name, and an automated check runs across the
            whole library on every release. A meal cannot be labelled vegan if any ingredient
            resolves to an animal-derived food, and high-confidence incompatibilities block the
            build rather than producing a warning somebody has to notice.
          </p>
          <p>
            The limitation is the same one that applies to cost and allergens: the site models
            generic foods. Where a real product&rsquo;s suitability depends on the specific brand —
            some stocks, sauces, cheeses and dressings do — the classification reflects the
            ordinary UK form of that ingredient, and you should check the label if a specific
            product matters to you.
          </p>
        </section>

        <section id="allergens">
          <h2>Allergens: what we can and cannot tell you</h2>
          <p>
            UK law requires 14 allergens to be declared when they are used as an ingredient. Every
            food in our reference set has been mapped against that list, so a plan can tell you
            which of the 14 appear in its ingredients:
          </p>
          <ul className="allergen-legal-list">
            {Object.entries(UK_ALLERGENS).map(([key, label]) => (
              <li key={key}>{label}</li>
            ))}
          </ul>
          <p>
            Where an allergen genuinely depends on the product you buy — stock cubes, protein
            powder, granola, sauces — it is shown as <strong>check the label</strong> rather than
            asserted either way.
          </p>
          <p>
            <strong>
              We do not make allergen-free claims, and you should not read the absence of an
              allergen as one.
            </strong>{' '}
            We work from generic ingredient names. We cannot see which brand you buy, whether a
            manufacturer has reformulated a product, or whether a food was made in a factory that
            handles other allergens. Cross-contamination cannot be inferred from an ingredient
            name at all. If you are allergic or intolerant, the label on the product in your
            basket is the only reliable source — see the{' '}
            <a
              href="https://www.food.gov.uk/safety-hygiene/food-allergy-and-intolerance"
              target="_blank"
              rel="noopener noreferrer"
            >
              Food Standards Agency&rsquo;s allergy and intolerance advice
            </a>
            .
          </p>
        </section>

        <section id="food-safety">
          <h2>Food safety and storage</h2>
          <p>
            Meal prep and food safety pull in opposite directions, so the site follows current UK
            public-health guidance rather than what would be most convenient for a weekly plan. In
            particular, a seven-day plan is <em>not</em> an instruction to cook everything on
            Sunday and refrigerate it until Friday.
          </p>
          <ul className="content-bullets">
            <li>
              Cool cooked food and refrigerate it within one to two hours; keep the fridge between
              0°C and 5°C.
            </li>
            <li>Eat refrigerated leftovers within 48 hours, or freeze them instead.</li>
            <li>
              Cooked rice is stricter: cool within one hour, use within 24 hours, and never reheat
              more than once.
            </li>
            <li>
              Reheat until steaming hot throughout — at least 70°C in the middle — and reheat only
              once.
            </li>
            <li>
              Defrost in the fridge, then treat the food as fresh and use it within 24 hours.
            </li>
          </ul>
          <p>
            Sources:{' '}
            <a
              href="https://www.food.gov.uk/safety-hygiene/how-to-chill-freeze-and-defrost-food-safely"
              target="_blank"
              rel="noopener noreferrer"
            >
              FSA — how to chill, freeze and defrost food safely
            </a>
            ,{' '}
            <a
              href="https://www.nhs.uk/common-health-questions/food-and-diet/can-reheating-rice-cause-food-poisoning/"
              target="_blank"
              rel="noopener noreferrer"
            >
              NHS — reheating rice
            </a>
            .
          </p>
        </section>

        <section id="automation">
          <h2>Automation and human involvement</h2>
          <p>
            We would rather be plain about this than let you guess. Plan assembly, recipe-method
            wording, nutrition calculation, shopping-list aggregation and page generation are all
            automated and deterministic. That is what makes it possible to offer this many
            combinations, and it is why the same plan always produces the same numbers.
          </p>
          <p>What is <strong>not</strong> automated:</p>
          <ul className="content-bullets">
            <li>The meal library itself is curated, and its ingredient quantities are set by hand.</li>
            <li>
              Every nutrition record and alias is entered and reviewed manually against a named
              source.
            </li>
            <li>
              Recipe-family rules, diet rules and quality invariants are written and tested by a
              person after reviewing real output.
            </li>
            <li>Guides and editorial pages are written and edited, not bulk-generated.</li>
          </ul>
          <p>
            What we do not claim: no recipe on this site has been physically cooked and
            photographed by us, no product has been bought and bench-tested by us, and no page has
            been reviewed by a dietitian, nutritionist or doctor. If you ever see wording on this
            site implying otherwise, it is a mistake and we would like to hear about it.
          </p>
        </section>

        <section id="qa">
          <h2>Quality checks before anything ships</h2>
          <p>
            Every release has to pass an automated gate before it can be deployed. It is not a
            spot check: it runs across the whole library, and a failure blocks the release.
          </p>
          <ul className="content-bullets">
            <li>
              <strong>Nutrition audit</strong> — every ingredient occurrence must resolve to a
              known food with a valid unit. An unresolved ingredient fails the build.
            </li>
            <li>
              <strong>Dietary audit</strong> — every meal&rsquo;s diet label is re-derived from its
              ingredients and compared with the label it claims.
            </li>
            <li>
              <strong>Plan audit</strong> — plan combinations are checked against their calorie and
              protein tolerances.
            </li>
            <li>
              <strong>Recipe invariants</strong> — checks that raw proteins get a cooking step, that
              a method only cooks ingredients the recipe actually has, that dishes needing liquid
              are given one, and that recipe families match their ingredients.
            </li>
            <li>
              <strong>Regression corpus</strong> — every defect we have fixed is kept as a permanent
              test so it cannot come back.
            </li>
            <li>
              <strong>Link, metadata, schema, accessibility and performance audits</strong> across
              every generated route.
            </li>
          </ul>
          <p>
            Findings that need human judgement rather than a deterministic fix are tracked in an
            internal ledger until they are resolved, so they are not quietly forgotten.
          </p>
        </section>

        <section id="limits">
          <h2>What this site does not do</h2>
          <ul className="content-bullets">
            <li>
              It does not give medical, clinical or personalised dietary advice. Calorie targets
              are general planning figures, and the right intake for you depends on your body,
              activity, health and goals.
            </li>
            <li>
              It does not replace professional guidance if you are pregnant or breastfeeding, are
              managing a medical condition, have a history of disordered eating, or have been
              given a clinical diet to follow. Please speak to a GP or registered dietitian.
            </li>
            <li>It does not make allergen-free claims or account for cross-contamination.</li>
            <li>It does not quote live supermarket prices, stock or promotions.</li>
            <li>
              It does not store your plans on an account. Saved plans, shopping-list ticks and
              quiz progress live in your own browser and disappear if you clear site data.
            </li>
          </ul>
        </section>

        <section>
          <h2>Found something wrong?</h2>
          <p>
            Corrections that affect safety, nutrition or a plan&rsquo;s usability are prioritised.
            Report a problem through the <Link to="/contact">contact page</Link> or the{' '}
            <Link to="/feedback">feedback form</Link>, or email{' '}
            <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>. Including the page
            URL and what looked wrong makes it much faster to fix.
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
