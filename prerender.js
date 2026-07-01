import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { INDEXABLE_PLAN_SEEDS } from './src/data/planSeeds.js';
import { blogPostsData } from './src/data/blogPosts.js';
import { mealPlansData } from './src/data/mealPlans.js';
import { CONTAINER_GUIDE_SLUGS } from './src/data/containerProducts.js';
import { COMBO_LANDING_SLUGS } from './src/data/comboLandingPages.js';
import { MEAL_PLAN_HUB_SLUGS } from './src/data/mealPlanHubs.js';
import {
  CALORIE_CHOOSER_SLUGS,
  DIET_CHOOSER_SLUGS,
  GOAL_CHOOSER_SLUGS,
  SUPERMARKET_CHOOSER_SLUGS,
} from './src/data/planChooser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, 'dist');

// Legacy slug snapshot retained for reference. Static build routes come from INDEXABLE_PLAN_SEEDS.
const STATIC_PLAN_SLUGS = [
  // Weight Loss (30)
  'aldi-weight-loss-1500','aldi-weight-loss-1800','aldi-weight-loss-1500-v2','aldi-weight-loss-1800-vegan',
  'tesco-weight-loss-1500','tesco-weight-loss-1800','tesco-weight-loss-1800-veg',
  'asda-weight-loss-1500','asda-weight-loss-1800','asda-weight-loss-1500-vegan',
  'sainsburys-weight-loss-1500','sainsburys-weight-loss-1800','sainsburys-weight-loss-veg-1500',
  'lidl-weight-loss-1500','lidl-weight-loss-1800','lidl-weight-loss-veg-1800',
  'morrisons-weight-loss-1500','morrisons-weight-loss-1800','morrisons-weight-loss-vegan-1500',
  'aldi-weight-loss-1800-v3','tesco-weight-loss-1500-v2','asda-weight-loss-1800-v2',
  'sainsburys-weight-loss-1800-v2','lidl-weight-loss-1500-v2',
  'iceland-weight-loss-1800','iceland-weight-loss-1500',
  'morrisons-weight-loss-1800-v2',
  'any-weight-loss-1500','any-weight-loss-1800','any-weight-loss-1800-veg',
  // High Protein Low Calorie (25)
  'aldi-high-protein-low-cal-1500','aldi-high-protein-low-cal-1800',
  'tesco-high-protein-low-cal-1500','tesco-high-protein-low-cal-1800',
  'asda-high-protein-low-cal-1800','asda-high-protein-low-cal-1500',
  'sainsburys-high-protein-low-cal-1800',
  'lidl-high-protein-low-cal-1500','morrisons-high-protein-low-cal-1800',
  'iceland-high-protein-low-cal-1800',
  'aldi-high-protein-low-cal-veg-1800','tesco-high-protein-low-cal-veg-1500',
  'asda-high-protein-low-cal-pesc-1800','lidl-high-protein-low-cal-1800',
  'any-high-protein-low-cal-1500','any-high-protein-low-cal-1800',
  'morrisons-high-protein-low-cal-1500','sainsburys-high-protein-low-cal-1500',
  'aldi-high-protein-low-cal-1500-v2','tesco-high-protein-low-cal-pesc-1800',
  'any-high-protein-low-cal-veg-1800','asda-high-protein-low-cal-1800-v2',
  'lidl-high-protein-low-cal-veg-1800','iceland-high-protein-low-cal-1500',
  'morrisons-high-protein-low-cal-pesc-1800',
  // Muscle Gain (20)
  'aldi-muscle-gain-2000','aldi-muscle-gain-2500',
  'tesco-muscle-gain-2000','tesco-muscle-gain-2500',
  'asda-muscle-gain-2000','asda-muscle-gain-2500',
  'sainsburys-muscle-gain-2000',
  'lidl-muscle-gain-2000','lidl-muscle-gain-2500',
  'morrisons-muscle-gain-2000',
  'aldi-muscle-gain-2000-v2','tesco-muscle-gain-2000-veg','asda-muscle-gain-2500-v2',
  'lidl-muscle-gain-2000-v2',
  'any-muscle-gain-2000','any-muscle-gain-2500',
  'morrisons-muscle-gain-2500','sainsburys-muscle-gain-2500',
  'iceland-muscle-gain-2000','aldi-muscle-gain-2500-veg',
  // Budget Fat Loss (25)
  'aldi-budget-fat-loss-1500','aldi-budget-fat-loss-1800',
  'lidl-budget-fat-loss-1500','lidl-budget-fat-loss-1800',
  'iceland-budget-fat-loss-1500','iceland-budget-fat-loss-1800',
  'asda-budget-fat-loss-1500','asda-budget-fat-loss-1800',
  'tesco-budget-fat-loss-1500','tesco-budget-fat-loss-1800',
  'morrisons-budget-fat-loss-1500',
  'aldi-budget-fat-loss-veg-1800','lidl-budget-fat-loss-veg-1500',
  'aldi-budget-fat-loss-1500-v2','lidl-budget-fat-loss-1500-v2',
  'any-budget-fat-loss-1500','any-budget-fat-loss-1800',
  'iceland-budget-fat-loss-vegan-1800','asda-budget-fat-loss-vegan-1500',
  'aldi-budget-fat-loss-batch-1800','lidl-budget-fat-loss-1800-v2',
  'tesco-budget-fat-loss-1800-v2','morrisons-budget-fat-loss-1800',
  'sainsburys-budget-fat-loss-1500','aldi-budget-fat-loss-pesc-1800',
  // Cheap Student (25)
  'aldi-cheap-student-1800','lidl-cheap-student-1800','asda-cheap-student-1800',
  'tesco-cheap-student-1800','iceland-cheap-student-1800',
  'aldi-cheap-student-1500','lidl-cheap-student-2000','asda-cheap-student-2000',
  'tesco-cheap-student-1500',
  'aldi-cheap-student-veg-1800','lidl-cheap-student-veg-1800',
  'aldi-cheap-student-vegan-1800','asda-cheap-student-veg-1800',
  'morrisons-cheap-student-1800',
  'any-cheap-student-1800','any-cheap-student-1500',
  'iceland-cheap-student-1500','tesco-cheap-student-2000',
  'sainsburys-cheap-student-1800','lidl-cheap-student-vegan-1800',
  'asda-cheap-student-1500','morrisons-cheap-student-1500',
  'aldi-cheap-student-batch-2000','any-cheap-student-veg-1800',
  'iceland-cheap-student-2000',
  // Busy Professional (20)
  'aldi-busy-professional-1800','tesco-busy-professional-1800',
  'sainsburys-busy-professional-2000','sainsburys-busy-professional-1800',
  'asda-busy-professional-1800','tesco-busy-professional-2000',
  'lidl-busy-professional-1800','morrisons-busy-professional-1800',
  'aldi-busy-professional-2000','any-busy-professional-1800',
  'tesco-busy-professional-veg-1800','asda-busy-professional-2000',
  'sainsburys-busy-professional-veg-1800','lidl-busy-professional-2000',
  'aldi-busy-professional-1800-v2','morrisons-busy-professional-2000',
  'any-busy-professional-2000','iceland-busy-professional-1800',
  'tesco-busy-professional-pesc-1800','asda-busy-professional-veg-1800',
  // Low Effort (20)
  'aldi-low-effort-1800','tesco-low-effort-1800','asda-low-effort-1800',
  'iceland-low-effort-1800','lidl-low-effort-1800',
  'aldi-low-effort-1500','tesco-low-effort-2000','asda-low-effort-1500',
  'iceland-low-effort-1500','aldi-low-effort-veg-1800',
  'lidl-low-effort-1500','morrisons-low-effort-1800','sainsburys-low-effort-1800',
  'any-low-effort-1800','any-low-effort-1500',
  'tesco-low-effort-veg-1800','asda-low-effort-vegan-1800',
  'aldi-low-effort-2000','lidl-low-effort-veg-1800','iceland-low-effort-2000',
  // Vegetarian Low Cal (15)
  'aldi-veg-low-cal-1500','aldi-veg-low-cal-1800',
  'tesco-veg-low-cal-1500','tesco-veg-low-cal-1800',
  'asda-veg-low-cal-1500','asda-veg-low-cal-1800',
  'sainsburys-veg-low-cal-1500','lidl-veg-low-cal-1500',
  'morrisons-veg-low-cal-1800',
  'any-veg-low-cal-1500','any-veg-low-cal-1800',
  'aldi-veg-low-cal-batch-1800','tesco-veg-low-cal-easy-1800',
  'lidl-veg-low-cal-1800','sainsburys-veg-low-cal-1800',
  // Vegan Low Cal (15)
  'aldi-vegan-low-cal-1500','aldi-vegan-low-cal-1800',
  'tesco-vegan-low-cal-1500','tesco-vegan-low-cal-1800',
  'asda-vegan-low-cal-1500','asda-vegan-low-cal-1800',
  'sainsburys-vegan-low-cal-1500','lidl-vegan-low-cal-1500',
  'morrisons-vegan-low-cal-1800',
  'any-vegan-low-cal-1500','any-vegan-low-cal-1800',
  'aldi-vegan-low-cal-batch-1800','tesco-vegan-low-cal-easy-1800',
  'lidl-vegan-low-cal-1800','sainsburys-vegan-low-cal-1800',
  // High Protein Vegetarian (15)
  'aldi-hp-veg-1800','tesco-hp-veg-1800','asda-hp-veg-1800',
  'sainsburys-hp-veg-1800','lidl-hp-veg-1800','morrisons-hp-veg-1800',
  'aldi-hp-veg-2000','tesco-hp-veg-2000','asda-hp-veg-1500',
  'lidl-hp-veg-1500',
  'any-hp-veg-1800','any-hp-veg-2000',
  'sainsburys-hp-veg-2000','morrisons-hp-veg-1500','aldi-hp-veg-batch-1800',
  // Pescatarian (10)
  'aldi-pescatarian-1800','tesco-pescatarian-1800','asda-pescatarian-1800',
  'sainsburys-pescatarian-1800','lidl-pescatarian-1800','morrisons-pescatarian-1800',
  'aldi-pescatarian-1500','tesco-pescatarian-1500',
  'any-pescatarian-1800','any-pescatarian-1500',
  // Budget Bodybuilding (10)
  'aldi-budget-bodybuilding-2000','aldi-budget-bodybuilding-2500',
  'lidl-budget-bodybuilding-2000','asda-budget-bodybuilding-2000',
  'tesco-budget-bodybuilding-2000','lidl-budget-bodybuilding-2500',
  'iceland-budget-bodybuilding-2000','any-budget-bodybuilding-2000',
  'aldi-budget-bodybuilding-veg-2000','asda-budget-bodybuilding-2500',
  // Gym Beginner (10)
  'aldi-gym-beginner-1800','tesco-gym-beginner-1800',
  'asda-gym-beginner-2000','sainsburys-gym-beginner-2000',
  'lidl-gym-beginner-1800','morrisons-gym-beginner-1800',
  'any-gym-beginner-1800','any-gym-beginner-2000',
  'tesco-gym-beginner-2000','aldi-gym-beginner-2000',
  // Cheap High Protein (10)
  'aldi-cheap-hp-1800','lidl-cheap-hp-1800','asda-cheap-hp-1800',
  'tesco-cheap-hp-1800','iceland-cheap-hp-1800',
  'aldi-cheap-hp-2000','lidl-cheap-hp-1500',
  'any-cheap-hp-1800','aldi-cheap-hp-veg-1800','morrisons-cheap-hp-1800',
  // Maintenance (10)
  'aldi-maintenance-2000','tesco-maintenance-2000','asda-maintenance-2000',
  'sainsburys-maintenance-2000','lidl-maintenance-2000','morrisons-maintenance-2000',
  'any-maintenance-2000','aldi-maintenance-veg-2000',
  'tesco-maintenance-vegan-2000','any-maintenance-pesc-2000',
  // Anti-Inflammatory (10)
  'aldi-anti-inflammatory-1800','tesco-anti-inflammatory-1800',
  'sainsburys-anti-inflammatory-2000','asda-anti-inflammatory-1800',
  'lidl-anti-inflammatory-1800','morrisons-anti-inflammatory-1800',
  'aldi-anti-inflammatory-veg-1800','tesco-anti-inflammatory-vegan-1800',
  'any-anti-inflammatory-1800','sainsburys-anti-inflammatory-pesc-1800',
  // Menopause Nutrition (10)
  'aldi-menopause-1800','tesco-menopause-1800','sainsburys-menopause-1800',
  'asda-menopause-1800','morrisons-menopause-1800','lidl-menopause-1800',
  'any-menopause-1800','tesco-menopause-veg-1800',
  'sainsburys-menopause-1600','aldi-menopause-pesc-1800',
  // Endurance & Running (8)
  'aldi-endurance-2000','tesco-endurance-2200','sainsburys-endurance-2500',
  'asda-endurance-2000','lidl-endurance-2000','any-endurance-2000',
  'aldi-endurance-veg-2000','tesco-endurance-pesc-2000',
  // Cutting Phase (10)
  'aldi-cutting-1400','tesco-cutting-1400','asda-cutting-1400',
  'aldi-cutting-1600','lidl-cutting-1400','sainsburys-cutting-1600',
  'morrisons-cutting-1400','any-cutting-1400',
  'any-cutting-1600','tesco-cutting-pesc-1500',
];

const PLAN_SLUGS = INDEXABLE_PLAN_SEEDS.map(seed => seed.slug);
const LEGACY_MEAL_PLAN_SLUGS = Object.keys(mealPlansData);
const BLOG_SLUGS = Object.keys(blogPostsData);

function uniqueRoutes(routes) {
  return [...new Set(routes)];
}

const ROUTES = uniqueRoutes([
  '/',
  '/quiz',
  '/quiz/results',
  '/browse',
  '/stickers',
  '/meal-prep-containers',
  '/blog',
  '/tools',
  '/about',
  ...GOAL_CHOOSER_SLUGS.map(slug => `/choose-plan/${slug}`),
  ...SUPERMARKET_CHOOSER_SLUGS.map(slug => `/choose-supermarket/${slug}`),
  ...DIET_CHOOSER_SLUGS.map(slug => `/choose-diet/${slug}`),
  ...CALORIE_CHOOSER_SLUGS.map(slug => `/choose-calories/${slug}`),
  ...MEAL_PLAN_HUB_SLUGS.map(slug => `/meal-plans/${slug}`),
  ...COMBO_LANDING_SLUGS.map(slug => `/meal-plans/${slug}`),
  ...CONTAINER_GUIDE_SLUGS.map(slug => `/meal-prep-containers/${slug}`),
  // New plan library at /plans/:slug
  ...PLAN_SLUGS.map(slug => `/plans/${slug}`),
  // Legacy meal plan pages (preserved for SEO)
  ...LEGACY_MEAL_PLAN_SLUGS.map(slug => `/meal-plan/${slug}`),
  // Blog posts
  ...BLOG_SLUGS.map(slug => `/blog/${slug}`),
]);

const SITEMAP_ROUTES = ROUTES.filter(route => route !== '/quiz/results');

async function prerender() {
  const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');
  const ssrBundle = pathToFileURL(path.join(dist, 'ssr', 'entry-server.js')).href;
  const { render } = await import(ssrBundle);

  console.log(`\nPrerendering ${ROUTES.length} routes...\n`);

  let ok = 0;
  let failed = 0;

  for (const route of ROUTES) {
    try {
      const { html, helmet } = render(route);

      const headTags = [
        helmet?.title?.toString(),
        helmet?.meta?.toString(),
        helmet?.link?.toString(),
        helmet?.script?.toString(),
      ].filter(s => s?.trim()).join('\n    ');

      const page = template
        .replace('<!--app-head-->', headTags)
        .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

      const outDir = route === '/' ? dist : path.join(dist, route);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), page);
      ok++;
      if (ok % 50 === 0) console.log(`  ✓ ${ok} routes done…`);
    } catch (err) {
      console.error(`  ✗ ${route}: ${err.message}`);
      failed++;
    }
  }

  fs.rmSync(path.join(dist, 'ssr'), { recursive: true, force: true });
  console.log(`\nPrerender complete: ${ok} written, ${failed} failed. Total: ${ROUTES.length} routes.\n`);

  // ── Generate sitemap.xml ────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];

  function urlEntry(loc, priority, changefreq = 'monthly') {
    return `  <url>\n    <loc>https://www.mealprep.org.uk${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }

  function routePriority(route) {
    if (route === '/') return ['1.0', 'weekly'];
    if (route === '/browse') return ['0.9', 'weekly'];
    if (route.startsWith('/choose-plan/')) return ['0.9', 'weekly'];
    if (route.startsWith('/choose-supermarket/')) return ['0.9', 'weekly'];
    if (route.startsWith('/choose-diet/')) return ['0.9', 'weekly'];
    if (route.startsWith('/choose-calories/')) return ['0.9', 'weekly'];
    if (route.startsWith('/meal-plans/')) return ['0.9', 'weekly'];
    if (route === '/quiz') return ['0.9', 'monthly'];
    if (route === '/tools') return ['0.8', 'monthly'];
    if (route === '/blog') return ['0.8', 'weekly'];
    if (route === '/meal-prep-containers') return ['0.9', 'weekly'];
    if (route.startsWith('/meal-prep-containers/')) return ['0.8', 'weekly'];
    if (route.startsWith('/plans/')) return ['0.8', 'monthly'];
    if (route.startsWith('/meal-plan/')) return ['0.7', 'monthly'];
    if (route.startsWith('/blog/')) return ['0.7', 'monthly'];
    if (route === '/quiz/results') return ['0.6', 'monthly'];
    if (route === '/stickers') return ['0.5', 'monthly'];
    return ['0.5', 'monthly'];
  }

  const sitemapEntries = SITEMAP_ROUTES.map(route => {
    const [priority, changefreq] = routePriority(route);
    return urlEntry(route, priority, changefreq);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join('\n')}\n</urlset>\n`;

  fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
  console.log(`Sitemap written: ${sitemapEntries.length} URLs → dist/sitemap.xml\n`);
}

prerender().catch(err => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
