#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { crawlDist, distRoot } from './lib/crawlDist.js';
import { writeAuditJson } from './lib/auditOutput.js';

const { pages } = crawlDist();
const assetsRoot = path.join(distRoot, 'assets');
const assets = fs.readdirSync(assetsRoot)
  .filter(name => fs.statSync(path.join(assetsRoot, name)).isFile())
  .map(name => assetStats(name));
const assetByName = new Map(assets.map(asset => [asset.file, asset]));
const indexHtml = fs.readFileSync(path.join(distRoot, 'index.html'), 'utf8');
const initialScripts = [...indexHtml.matchAll(/<script\b[^>]*\bsrc=["']\/assets\/([^"']+)["'][^>]*>/gi)]
  .map(match => match[1]);
const initialStyles = [...indexHtml.matchAll(/<link\b[^>]*\bhref=["']\/assets\/([^"']+\.css)["'][^>]*>/gi)]
  .map(match => match[1]);
const initialJs = resolveStaticGraph(initialScripts);
const initialCss = new Set(initialStyles);
const clientAssets = assets.filter(asset => !asset.file.endsWith('.map'));
const jsAssets = clientAssets.filter(asset => asset.file.endsWith('.js'));
const cssAssets = clientAssets.filter(asset => asset.file.endsWith('.css'));
const imageAssets = [
  ...clientAssets.filter(asset => /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(asset.file)),
  ...findPublicImages(distRoot),
];
const routeHtml = pages.map(page => ({
  route: page.route,
  ...fileTransferStats(path.join(distRoot, page.file)),
})).sort((left, right) => right.bytes - left.bytes);
const thirdPartyInitialScripts = [...indexHtml.matchAll(/<script\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["']/gi)]
  .map(match => match[1]);

const measures = {
  initialJavaScriptGzipBytes: sum([...initialJs].map(name => assetByName.get(name)?.gzipBytes || 0)),
  initialCssGzipBytes: sum([...initialCss].map(name => assetByName.get(name)?.gzipBytes || 0)),
  largestJavaScriptGzipBytes: max(jsAssets.map(asset => asset.gzipBytes)),
  largestCssGzipBytes: max(cssAssets.map(asset => asset.gzipBytes)),
  largestImageBytes: max(imageAssets.map(asset => asset.bytes)),
  largestRouteHtmlBytes: routeHtml[0]?.bytes || 0,
  largestRouteHtmlGzipBytes: max(routeHtml.map(route => route.gzipBytes)),
  initialLocalAssetRequests: new Set([...initialJs, ...initialCss]).size,
  thirdPartyScriptsBeforeConsent: thirdPartyInitialScripts.length,
};
const budgets = {
  initialJavaScriptGzipBytes: 210_000,
  initialCssGzipBytes: 45_000,
  largestJavaScriptGzipBytes: 140_000,
  largestCssGzipBytes: 45_000,
  largestImageBytes: 750_000,
  largestRouteHtmlBytes: 400_000,
  largestRouteHtmlGzipBytes: 60_000,
  initialLocalAssetRequests: 12,
  thirdPartyScriptsBeforeConsent: 0,
};
const errors = Object.entries(budgets)
  .filter(([key, budget]) => measures[key] > budget)
  .map(([key, budget]) => ({ metric: key, measured: measures[key], budget }));
const sourceRoot = path.resolve(distRoot, '..');
const vitalSource = readIfPresent(path.join(sourceRoot, 'src', 'utils', 'webVitals.js'));
const trackerSource = readIfPresent(path.join(sourceRoot, 'src', 'components', 'BehaviorAnalytics.jsx'));
const analyticsApiSource = readIfPresent(path.join(sourceRoot, 'api', 'analytics.js'));
const fieldMonitoring = {
  configured: ['LCP', 'INP', 'CLS'].every(metric => vitalSource.includes(`'${metric}'`))
    && trackerSource.includes("track('web_vital'")
    && analyticsApiSource.includes('analytics_events'),
  metrics: ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'],
  routeAware: vitalSource.includes('path,') && trackerSource.includes('{ path: page.path }'),
  consentAware: trackerSource.includes('hasAnalyticsConsent()'),
  endpoint: '/api/analytics',
  reporting: ['private admin dashboard', 'weekly analytics report'],
};
if (!fieldMonitoring.configured || !fieldMonitoring.routeAware || !fieldMonitoring.consentAware) {
  errors.push({
    metric: 'fieldCoreWebVitalsCollection',
    measured: fieldMonitoring,
    budget: 'LCP, INP and CLS collected by route after analytics consent',
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  coverage: {
    clientAssets: clientAssets.length,
    JavaScriptAssets: jsAssets.length,
    cssAssets: cssAssets.length,
    imageAssets: imageAssets.length,
    generatedHtmlFiles: pages.length,
    exhaustiveBuildArtifactInspection: true,
  },
  measures,
  budgets,
  errors,
  fieldMonitoring,
  initialGraph: {
    JavaScript: [...initialJs].map(name => assetByName.get(name)).filter(Boolean),
    css: [...initialCss].map(name => assetByName.get(name)).filter(Boolean),
    thirdPartyScripts: thirdPartyInitialScripts,
  },
  largestJavaScript: [...jsAssets].sort((left, right) => right.gzipBytes - left.gzipBytes).slice(0, 20),
  largestImages: [...imageAssets].sort((left, right) => right.bytes - left.bytes).slice(0, 20),
  largestHtml: routeHtml.slice(0, 20),
  limitations: [
    'Build budgets remain lab evidence; production field values come from consented real-user visits.',
    'Route-level p75 LCP, INP and CLS appear in the private dashboard and weekly report once the production sample is representative.',
  ],
};
const reportPath = writeAuditJson('performance.json', report);

if (errors.length) {
  console.error(`Performance audit failed with ${errors.length} budget breach(es).`);
  errors.forEach(error => console.error(`- ${error.metric}: ${error.measured} > ${error.budget}`));
  process.exit(1);
}

console.log(
  `Performance audit passed: initial JS ${formatKb(measures.initialJavaScriptGzipBytes)}, ` +
  `initial CSS ${formatKb(measures.initialCssGzipBytes)}, largest lazy JS ` +
  `${formatKb(measures.largestJavaScriptGzipBytes)}; report: ${reportPath}`,
);

function assetStats(name) {
  const stats = fileTransferStats(path.join(assetsRoot, name));
  return {
    file: name,
    ...stats,
  };
}

function fileTransferStats(file) {
  const bytes = fs.readFileSync(file);
  return {
    bytes: bytes.length,
    gzipBytes: zlib.gzipSync(bytes, { level: 9 }).length,
  };
}

function resolveStaticGraph(entries) {
  const resolved = new Set();
  const queue = [...entries];
  while (queue.length) {
    const name = queue.shift();
    if (!name || resolved.has(name) || !assetByName.has(name)) continue;
    resolved.add(name);
    if (!name.endsWith('.js')) continue;
    const source = fs.readFileSync(path.join(assetsRoot, name), 'utf8');
    for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*)["']\.\/([^"']+)["']/g)) {
      if (!resolved.has(match[1])) queue.push(match[1]);
    }
  }
  return resolved;
}

function findPublicImages(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === 'assets' || entry.name === 'ssr') return [];
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findPublicImages(fullPath);
    if (!entry.isFile() || !/\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(entry.name)) return [];
    return [{
      file: path.relative(distRoot, fullPath).split(path.sep).join('/'),
      bytes: fs.statSync(fullPath).size,
      gzipBytes: null,
    }];
  });
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function max(values) {
  return values.length ? Math.max(...values) : 0;
}

function formatKb(value) {
  return `${(value / 1024).toFixed(1)} KB gzip`;
}

function readIfPresent(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}
