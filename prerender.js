import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, 'dist');

const ROUTES = [
  '/',
  '/meal-plan/1500-calorie-meal-plan',
  '/meal-plan/1800-calorie-meal-plan',
  '/meal-plan/2000-calorie-meal-plan',
  '/meal-plan/high-protein-low-calorie-meal-plan',
  '/meal-plan/tesco-low-calorie-meal-plan',
  '/meal-plan/vegetarian-low-calorie-meal-plan',
  '/blog/how-to-build-a-calorie-deficit',
  '/blog/best-low-calorie-foods-uk',
  '/blog/high-protein-low-calorie-meals',
  '/blog/tesco-low-calorie-shopping-list',
  '/blog/how-to-meal-plan-for-weight-loss',
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
  console.log('\nPrerender complete: 12 routes written to dist/\n');
}

prerender().catch(err => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
