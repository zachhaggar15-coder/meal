import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, 'dist');

const ROUTES = [
  '/',
  // Meal plan pages — calorie targets
  '/meal-plan/1500-calorie-meal-plan',
  '/meal-plan/1800-calorie-meal-plan',
  '/meal-plan/2000-calorie-meal-plan',
  '/meal-plan/2500-calorie-meal-plan',
  // Meal plan pages — goal/identity
  '/meal-plan/high-protein-low-calorie-meal-plan',
  '/meal-plan/high-protein-vegetarian-meal-plan-uk',
  '/meal-plan/cheap-student-meal-plan-uk',
  '/meal-plan/budget-bodybuilding-meal-plan-uk',
  '/meal-plan/gym-beginner-meal-plan-uk',
  '/meal-plan/budget-fat-loss-meal-plan-uk',
  '/meal-plan/muscle-gain-meal-plan-uk',
  '/meal-plan/cheap-high-protein-meal-plan-uk',
  '/meal-plan/low-effort-meal-plan-uk',
  '/meal-plan/busy-professional-meal-plan-uk',
  // Meal plan pages — supermarket
  '/meal-plan/tesco-low-calorie-meal-plan',
  '/meal-plan/tesco-1800-calorie-meal-plan',
  '/meal-plan/tesco-high-protein-meal-plan',
  '/meal-plan/aldi-low-calorie-meal-plan',
  '/meal-plan/aldi-1800-calorie-meal-plan',
  '/meal-plan/aldi-high-protein-meal-plan',
  '/meal-plan/asda-1800-calorie-meal-plan',
  '/meal-plan/asda-1500-calorie-meal-plan',
  '/meal-plan/sainsburys-1800-calorie-meal-plan',
  '/meal-plan/lidl-1800-calorie-meal-plan',
  '/meal-plan/morrisons-1800-calorie-meal-plan',
  '/meal-plan/iceland-budget-meal-plan',
  // Meal plan pages — diet type
  '/meal-plan/vegetarian-low-calorie-meal-plan',
  '/meal-plan/vegan-low-calorie-meal-plan',
  // Product page
  '/stickers',
  // Blog posts
  '/blog/how-to-build-a-calorie-deficit',
  '/blog/best-low-calorie-foods-uk',
  '/blog/high-protein-low-calorie-meals',
  '/blog/tesco-low-calorie-shopping-list',
  '/blog/how-to-meal-plan-for-weight-loss',
  '/blog/how-many-calories-to-lose-weight',
  '/blog/best-cheap-high-protein-foods-uk',
  '/blog/aldi-vs-tesco-meal-prep',
  '/blog/cheapest-uk-supermarket-meal-prep',
  '/blog/1500-vs-1800-vs-2000-calories',
  '/blog/how-much-protein-when-dieting',
  '/blog/cheap-meal-prep-shopping-list-uk',
];

async function prerender() {
  const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');
  const ssrBundle = pathToFileURL(path.join(dist, 'ssr', 'entry-server.js')).href;
  const { render } = await import(ssrBundle);

  console.log('\nPrerendering routes...');

  for (const route of ROUTES) {
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
    console.log(`  ✓ ${route}`);
  }

  fs.rmSync(path.join(dist, 'ssr'), { recursive: true, force: true });
  console.log(`\nPrerender complete: ${ROUTES.length} routes written to dist/\n`);
}

prerender().catch(err => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
