import { Link } from 'react-router-dom';
import AccessoryProblemSolver from '../components/AccessoryProblemSolver.jsx';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { ACCESSORY_PRODUCT_IDS } from '../data/accessoryProblems.js';
import { getMealPrepProducts } from '../data/mealPrepProducts.js';
import { SITE_CONTACT_EMAIL } from '../constants/site.js';

const accessoryProducts = getMealPrepProducts(ACCESSORY_PRODUCT_IDS);

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
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>&rsaquo;</span>{' '}
          <span>Meal Prep Accessories</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />

        <h1>Meal Prep Accessories UK</h1>
        <p className="content-intro">
          Start with the part of meal prep that causes friction, then compare one
          focused recommendation and an alternative only when the trade-off is useful.
          You can still open the full 20-product catalogue if you want it.
        </p>

        <AccessoryProblemSolver />
      </div>

      <Footer />
    </>
  );
}
