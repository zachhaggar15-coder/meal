import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import ProductPicks from '../components/ProductPicks.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { ACCESSORY_NAV_LINKS } from '../data/navigation.js';
import { getMealPrepProducts } from '../data/mealPrepProducts.js';
import { SITE_CONTACT_EMAIL } from '../constants/site.js';
import { toTitleCase } from '../utils/textFormatting.js';

const ACCESSORY_PRODUCT_IDS = [
  'lifewit-9l-insulated-lunch-bag',
  'fit-fresh-bree-meal-prep-bag',
  'fit-fresh-slim-ice-packs',
  'bentgo-buddies-ice-packs',
  'sistema-dressing-pots',
  'vitever-glass-dressing-containers',
  'smarch-overnight-oats-jars',
  'bubblewally-overnight-oats-containers',
  'thermopro-tp02s-thermometer',
  'doqaus-folding-food-thermometer',
  'milu-450ml-food-flask',
  'stanley-classic-food-jar-400ml',
  'fullstar-pro-vegetable-chopper',
  'oxo-good-grips-vegetable-chopper',
  'cosori-air-fryer-accessory-kit',
  'square-silicone-air-fryer-liners',
  'blenderbottle-classic-v2',
  'myprotein-600ml-shaker',
  'nuoshen-removable-food-labels',
  'innoveem-easy-peel-freezer-labels',
];

const accessoryProducts = getMealPrepProducts(ACCESSORY_PRODUCT_IDS);
const accessoryGuideLinks = ACCESSORY_NAV_LINKS.filter(link => link.to !== '/meal-prep-accessories');

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Meal Prep Accessories UK',
    description:
      'Compare meal prep accessories UK: insulated lunch bags, ice packs, sauce pots, oats jars, food flasks, choppers, shakers and freezer labels.',
    url: 'https://www.mealprep.org.uk/meal-prep-accessories',
    datePublished: '2026-07-23',
    dateModified: '2026-07-23',
    author: {
      '@type': 'Organization',
      name: 'MealPrep.org.uk',
      url: 'https://www.mealprep.org.uk/about',
      email: SITE_CONTACT_EMAIL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MealPrep.org.uk',
      url: 'https://www.mealprep.org.uk',
      email: SITE_CONTACT_EMAIL,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: accessoryProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.name,
        url: product.href,
      })),
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk' },
      { '@type': 'ListItem', position: 2, name: 'Meal Prep Accessories', item: 'https://www.mealprep.org.uk/meal-prep-accessories' },
    ],
  },
];

export default function AccessoriesHub() {
  return (
    <>
      <SEO
        title="Meal Prep Accessories UK: Bags, Ice Packs, Labels and Prep Tools"
        description="Compare practical meal prep accessories for UK kitchens: lunch bags, ice packs, sauce pots, oats jars, thermometers, food flasks, choppers, shakers and labels."
        canonical="/meal-prep-accessories"
        ogType="article"
        ogImage="https://www.mealprep.org.uk/images/meal-plans/weekly-prep.webp"
        jsonLd={jsonLd}
      />

      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>&rsaquo;</span>{' '}
          <span>Meal Prep Accessories</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />

        <h1>Meal Prep Accessories UK</h1>
        <p className="content-intro">
          Small accessories make meal prep easier to carry, cool, label and repeat.
          Use this page as the hub for the new product guides, then compare the
          individual Amazon UK picks inside each category.
        </p>

        <section className="container-search-match" aria-labelledby="accessory-guides-heading">
          <div className="section-head-inline">
            <div>
              <span className="offer-kicker">Meal Prep Accessories</span>
              <h2 id="accessory-guides-heading">Accessory Guides</h2>
              <p>
                Start with the job you need to fix: carrying lunches, keeping food cold,
                labelling freezer portions, speeding up prep or packing breakfast.
              </p>
            </div>
          </div>

          <div className="container-search-grid">
            {accessoryGuideLinks.map(link => (
              <article key={link.to} className="container-search-card">
                <span>Guide</span>
                <h3>{toTitleCase(link.label)}</h3>
                <p>{link.description}</p>
                <Link to={link.to}>Open guide</Link>
              </article>
            ))}
          </div>
        </section>

        <ProductPicks
          title="Meal prep accessory products"
          intro="All product links use the existing Amazon UK affiliate tag and open on Amazon for live price and availability."
          productIds={ACCESSORY_PRODUCT_IDS}
          sourcePage="meal-prep-accessories-hub"
          showQuickComparison={false}
        />

        <section>
          <h2>{toTitleCase('What to buy first')}</h2>
          <p>
            Start with the item that removes the biggest weekly friction. If lunch
            warms up in a bag, buy an insulated bag and ice packs. If freezer portions
            become anonymous, buy labels. If prep takes too long, compare choppers,
            air-fryer liners and sauce pots before buying larger kitchen kit.
          </p>
          <p>
            The container guides still sit separately, because tubs and boxes are the
            foundation. Accessories are the second layer: useful only when they make
            the meals easier to carry, store, reheat or eat.
          </p>
        </section>
      </div>

      <Footer />
    </>
  );
}
