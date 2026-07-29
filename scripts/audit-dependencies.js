import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const npmExecutable = process.env.npm_execpath;
const executable = npmExecutable ? process.execPath : 'npm';
const args = npmExecutable
  ? [npmExecutable, 'audit', '--json']
  : ['audit', '--json'];
const result = spawnSync(executable, args, {
  cwd: process.cwd(),
  encoding: 'utf8',
  shell: false,
});

let report;
try {
  report = JSON.parse(result.stdout || result.stderr);
} catch {
  console.error('Dependency audit did not return valid JSON.');
  console.error((result.stderr || result.stdout || '').slice(0, 2_000));
  process.exit(1);
}

const vulnerabilities = Object.entries(report.vulnerabilities || {});
const allowedAdvisory = 'https://github.com/advisories/GHSA-qwww-vcr4-c8h2';
const allowedPackages = new Set(['react-router', 'react-router-dom']);
const unexpected = vulnerabilities.filter(([name, detail]) => (
  !allowedPackages.has(name) || !isOnlyAllowedRouterAdvisory(name, detail)
));

const runtimeSource = [
  readFileSync('src/main.jsx', 'utf8'),
  readFileSync('src/entry-server.jsx', 'utf8'),
  readFileSync('src/App.jsx', 'utf8'),
].join('\n');
const rscServerPatterns = [
  /\bcreateRequestHandler\b/,
  /\bServerRouter\b/,
  /\bHydratedRouter\b/,
  /\bunstable_RSC\b/,
  /\bRSCStaticRouter\b/,
  /['"]use server['"]/,
];
const usesExpectedRouters = /\bBrowserRouter\b/.test(runtimeSource)
  && /\bStaticRouter\b/.test(runtimeSource);
const usesRscServerPath = rscServerPatterns.some(pattern => pattern.test(runtimeSource));

if (unexpected.length || !usesExpectedRouters || usesRscServerPath) {
  console.error('Dependency audit failed.');
  unexpected.forEach(([name, detail]) => {
    console.error(`- ${name}: ${detail.severity} (${describeVia(detail.via)})`);
  });
  if (!usesExpectedRouters) {
    console.error('- Expected BrowserRouter and StaticRouter architecture could not be verified.');
  }
  if (usesRscServerPath) {
    console.error('- React Server Components request handling is present, invalidating the advisory exception.');
  }
  process.exit(1);
}

const totals = report.metadata?.vulnerabilities || {};
if (vulnerabilities.length) {
  console.log(
    `Dependency audit passed with one documented non-applicable advisory affecting ` +
    `${vulnerabilities.length} package record(s): ${allowedAdvisory}.`,
  );
  console.log(
    'The site uses BrowserRouter plus build-time StaticRouter rendering and has no React ' +
    'Server Components actions or request handler, which are required for the reported CSRF path.',
  );
} else {
  console.log('Dependency audit passed with zero reported vulnerabilities.');
}
console.log(
  `Registry totals: ${totals.critical || 0} critical, ${totals.high || 0} high, ` +
  `${totals.moderate || 0} moderate, ${totals.low || 0} low.`,
);

function isOnlyAllowedRouterAdvisory(name, detail) {
  if (name === 'react-router-dom') {
    return Array.isArray(detail.via)
      && detail.via.length === 1
      && detail.via[0] === 'react-router';
  }
  return Array.isArray(detail.via)
    && detail.via.length === 1
    && detail.via[0]?.url === allowedAdvisory;
}

function describeVia(via) {
  return (via || [])
    .map(item => typeof item === 'string' ? item : item.url || item.title || item.name)
    .join(', ');
}
