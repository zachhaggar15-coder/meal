// Weekly health check for every outbound Amazon link the site ships.
//
// Two modes, picked automatically:
//
//   paapi        Product Advertising API GetItems. Answers both questions the
//                check exists for: does the ASIN still resolve, and is it
//                buyable right now. Needs AMAZON_PAAPI_ACCESS_KEY,
//                AMAZON_PAAPI_SECRET_KEY and AMAZON_PAAPI_PARTNER_TAG.
//
//   reachability No credentials available. Probes the product URL over HTTP and
//                reports only whether it still resolves. Amazon serves CAPTCHAs
//                to datacentre IPs, so a blocked probe is reported as "blocked"
//                and never as a dead link. Stock is NOT checked in this mode.
//
// Exit codes: 0 healthy, 1 link problems found, 2 the check itself could not run.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { collectAmazonLinks, groupByAsin, projectRoot } from './lib/amazonLinks.js';
import { auditArtifactsDir, writeAuditJson } from './lib/auditOutput.js';
import {
  MAX_ITEMS_PER_REQUEST,
  asinsFromError,
  getItems,
  readCredentials,
  verdictForError,
  verdictForItem,
} from './lib/amazonPaapi.js';

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const hit = args.find(arg => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const requestedMode = argValue('mode', 'auto');
// Point at a snapshot of dist/ when something else may rebuild underneath us.
const distDir = argValue('dist', '');
const failOn = argValue('fail-on', 'stock'); // stock | dead | none
const quiet = args.includes('--quiet');

// PA-API's default rate limit is one request per second. Stay under it.
const PAAPI_DELAY_MS = Number(argValue('paapi-delay', '1200'));
// Amazon rate-limits an IP that probes 57 URLs flat out, and every result then
// comes back as a CAPTCHA, which tells us nothing. Probe gently by default.
const PROBE_CONCURRENCY = Number(argValue('concurrency', '2'));
const PROBE_DELAY_MS = Number(argValue('probe-delay', '750'));
const PROBE_TIMEOUT_MS = Number(argValue('timeout', '20000'));

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

const PROBLEM_STATUSES = ['dead', 'out-of-stock'];
const INCONCLUSIVE_STATUSES = ['blocked', 'unknown'];

// Guarded so the test file can import classifyProbe without running the check.
const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch(error => {
    console.error(`Amazon link check could not run: ${error.message}`);
    process.exit(2);
  });
}

async function main() {
  const { links, pageCount } = collectAmazonLinks(distDir ? { dir: path.resolve(distDir) } : {});

  if (!links.length) {
    console.log('Amazon link check: no Amazon links found in dist/. Nothing to verify.');
    return;
  }

  const credentials = readCredentials();
  const mode = resolveMode(requestedMode, credentials);
  if (mode === 'paapi' && !credentials) {
    throw new Error(
      '--mode=paapi requires AMAZON_PAAPI_ACCESS_KEY, AMAZON_PAAPI_SECRET_KEY and AMAZON_PAAPI_PARTNER_TAG.',
    );
  }

  const results = mode === 'paapi'
    ? await checkViaPaapi(links, credentials)
    : await checkViaReachability(links);

  const report = buildReport({ mode, results, links, pageCount });
  const jsonPath = writeAuditJson('amazon-link-health.json', report);
  const markdownPath = writeMarkdown(report);

  printSummary(report, jsonPath, markdownPath);

  const blocking = blockingProblems(report, failOn);
  if (blocking.length) {
    console.error(`\nAmazon link check failed: ${blocking.length} link(s) need attention.`);
    process.exit(1);
  }
}

function resolveMode(requested, credentials) {
  if (requested === 'paapi' || requested === 'reachability') return requested;
  return credentials ? 'paapi' : 'reachability';
}

// ---------------------------------------------------------------- PA-API mode

async function checkViaPaapi(links, credentials) {
  const { byAsin, withoutAsin } = groupByAsin(links);
  const verdicts = new Map();

  const byHost = new Map();
  for (const group of byAsin) {
    if (!byHost.has(group.hostname)) byHost.set(group.hostname, []);
    byHost.get(group.hostname).push(group);
  }

  for (const [hostname, groups] of byHost) {
    for (let index = 0; index < groups.length; index += MAX_ITEMS_PER_REQUEST) {
      const batch = groups.slice(index, index + MAX_ITEMS_PER_REQUEST);
      const asins = batch.map(group => group.asin);
      const response = await requestWithRetry({ asins, hostname, credentials });

      for (const item of response.items) {
        if (item?.ASIN) verdicts.set(`${hostname}|${item.ASIN}`, { ...verdictForItem(item), source: 'paapi' });
      }

      // Per-ASIN errors are the delisted-product signal, and are safe to trust.
      for (const error of response.errors) {
        for (const asin of asinsFromError(error)) {
          if (asins.includes(asin)) {
            verdicts.set(`${hostname}|${asin}`, { ...verdictForError(error), source: 'paapi' });
          }
        }
      }

      // Anything Amazon neither returned nor named in an error stays unknown
      // rather than being guessed at.
      for (const asin of asins) {
        const key = `${hostname}|${asin}`;
        if (!verdicts.has(key)) {
          verdicts.set(key, {
            status: 'unknown',
            title: null,
            availability: 'Not returned by GetItems and not named in an error',
            price: null,
            merchant: null,
            source: 'paapi',
          });
        }
      }

      if (index + MAX_ITEMS_PER_REQUEST < groups.length) await sleep(PAAPI_DELAY_MS);
    }
  }

  const results = [];
  for (const group of byAsin) {
    const verdict = verdicts.get(`${group.hostname}|${group.asin}`);
    for (const link of group.links) results.push({ ...link, ...verdict, stockChecked: true });
  }

  // Shorteners and non-product URLs have no ASIN to ask about; fall back to the
  // HTTP probe so they are still covered.
  if (withoutAsin.length) {
    results.push(...(await checkViaReachability(withoutAsin)));
  }

  return results.sort((a, b) => a.url.localeCompare(b.url));
}

async function requestWithRetry({ asins, hostname, credentials, attempt = 1 }) {
  try {
    return await getItems({ asins, hostname, credentials });
  } catch (error) {
    if (error.retryable && attempt < 4) {
      await sleep(PAAPI_DELAY_MS * 2 ** attempt);
      return requestWithRetry({ asins, hostname, credentials, attempt: attempt + 1 });
    }
    throw error;
  }
}

// ---------------------------------------------------- Reachability probe mode

async function checkViaReachability(links) {
  const results = [];
  const queue = [...links];

  const workers = Array.from({ length: Math.min(PROBE_CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const link = queue.shift();
      results.push({ ...link, ...(await probe(link.url)), stockChecked: false });
      if (queue.length && PROBE_DELAY_MS > 0) await sleep(PROBE_DELAY_MS);
    }
  });
  await Promise.all(workers);

  return results.sort((a, b) => a.url.localeCompare(b.url));
}

async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': BROWSER_UA, 'accept-language': 'en-GB,en;q=0.9' },
    });
    const body = await response.text();
    return classifyProbe(response.status, body);
  } catch (error) {
    return {
      status: 'unknown',
      title: null,
      availability: `Request failed: ${error.name === 'AbortError' ? 'timed out' : error.message}`,
      price: null,
      merchant: null,
      source: 'probe',
    };
  } finally {
    clearTimeout(timer);
  }
}

export function classifyProbe(httpStatus, body) {
  const base = { title: null, price: null, merchant: null, source: 'probe' };
  const text = String(body ?? '');

  // A hard 404/410 is unambiguous and is checked first. Amazon's ordinary
  // not-found page carries the "automated access" boilerplate that also appears
  // on the bot wall, so testing for the bot wall first would misread a genuinely
  // dead listing as merely blocked and suppress the alert.
  if (httpStatus === 404 || httpStatus === 410) {
    return { ...base, status: 'dead', availability: `HTTP ${httpStatus}` };
  }

  // Bot mitigation and load shedding: never let a CAPTCHA or a 5xx masquerade
  // as link rot. Both say something about Amazon, not about the listing.
  const botChecked = /validateCaptcha|Enter the characters you see below|Type the characters you see in this image/i
    .test(text);
  if (httpStatus >= 500 || httpStatus === 429 || botChecked) {
    return { ...base, status: 'blocked', availability: `Amazon bot check or outage (HTTP ${httpStatus})` };
  }

  // Amazon also serves its "dogs of Amazon" not-found page with a 200 status.
  if (/dogsofamazon|the Web address you entered is not a functioning page/i.test(text)) {
    return { ...base, status: 'dead', availability: 'Amazon not-found page (HTTP 200)' };
  }
  if (httpStatus >= 400) {
    return { ...base, status: 'unknown', availability: `HTTP ${httpStatus}` };
  }
  // Deliberately no stock verdict here: the signed-out product page does not
  // reliably expose availability, and guessing would produce false alarms.
  return { ...base, status: 'reachable', availability: `HTTP ${httpStatus} (stock not verified)` };
}

// ------------------------------------------------------------------ Reporting

function buildReport({ mode, results, links, pageCount }) {
  const counts = results.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    mode,
    stockChecked: mode === 'paapi',
    coverage: {
      htmlPagesScanned: pageCount,
      distinctAmazonLinks: links.length,
      linkOccurrences: links.reduce((sum, link) => sum + link.occurrences, 0),
      exhaustive: true,
    },
    counts,
    links: results.map(result => ({
      url: result.url,
      asin: result.asin,
      tag: result.tag,
      status: result.status,
      title: result.title ?? null,
      availability: result.availability,
      price: result.price ?? null,
      merchant: result.merchant ?? null,
      stockChecked: result.stockChecked,
      source: result.source,
      occurrences: result.occurrences,
      routes: result.routes,
    })),
  };
}

function blockingProblems(report, mode) {
  if (mode === 'none') return [];
  const statuses = mode === 'dead' ? ['dead'] : PROBLEM_STATUSES;
  return report.links.filter(link => statuses.includes(link.status));
}

function writeMarkdown(report) {
  // Generated output lives with the other audit reports, which are gitignored.
  const outputPath = path.join(auditArtifactsDir, 'amazon-link-health.md');
  const problems = report.links.filter(link => PROBLEM_STATUSES.includes(link.status));
  const unclear = report.links.filter(link => INCONCLUSIVE_STATUSES.includes(link.status));

  const lines = [
    '# Amazon link health',
    '',
    '<!-- Generated by scripts/check-amazon-links.js. Do not edit by hand. -->',
    '',
    `Generated ${report.generatedAt} in \`${report.mode}\` mode.`,
    '',
    report.stockChecked
      ? 'Stock was verified against the Amazon Product Advertising API.'
      : '**Stock was not verified.** No Product Advertising API credentials were available, so this run only'
        + ' confirms each product URL still resolves.',
    '',
    `- Pages scanned: ${report.coverage.htmlPagesScanned.toLocaleString('en-GB')}`,
    `- Distinct Amazon links: ${report.coverage.distinctAmazonLinks}`,
    `- Link occurrences across the site: ${report.coverage.linkOccurrences.toLocaleString('en-GB')}`,
    '',
    '## Status counts',
    '',
    ...Object.entries(report.counts).sort().map(([status, count]) => `- \`${status}\`: ${count}`),
    '',
  ];

  if (problems.length) {
    lines.push('## Needs attention', '');
    lines.push('| ASIN | Status | Availability | Product | Pages affected |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const link of problems) {
      lines.push(
        `| [${link.asin ?? 'n/a'}](${link.url}) | ${link.status} | ${escapeCell(link.availability)} `
        + `| ${escapeCell(link.title ?? '-')} | ${link.routes.length} |`,
      );
    }
    lines.push('');
    for (const link of problems) {
      lines.push(`### ${link.asin ?? link.url}`, '', ...link.routes.map(route => `- \`${route}\``), '');
    }
  } else {
    lines.push('## Needs attention', '', 'None. Every Amazon link passed this run.', '');
  }

  if (unclear.length) {
    lines.push(
      '## Inconclusive',
      '',
      'Not confirmed either way, usually Amazon bot mitigation or a transient error.'
      + ' These are reported, not failed.',
      '',
    );
    for (const link of unclear) {
      lines.push(`- [${link.asin ?? link.url}](${link.url}) - ${escapeCell(link.availability)}`);
    }
    lines.push('');
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`);
  return outputPath;
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function printSummary(report, jsonPath, markdownPath) {
  const counts = Object.entries(report.counts).sort().map(([status, count]) => `${status}=${count}`).join(', ');
  console.log(
    `Amazon link check (${report.mode}): ${report.coverage.distinctAmazonLinks} distinct link(s) across `
    + `${report.coverage.htmlPagesScanned.toLocaleString('en-GB')} pages - ${counts}`,
  );
  if (!report.stockChecked) {
    console.log('Stock was NOT verified: no Product Advertising API credentials. Reachability only.');
  }
  if (!quiet) {
    for (const link of report.links.filter(item => PROBLEM_STATUSES.includes(item.status))) {
      console.error(`- ${link.status}: ${link.asin ?? link.url} (${link.availability}) - ${link.routes.length} page(s)`);
    }
    for (const link of report.links.filter(item => INCONCLUSIVE_STATUSES.includes(item.status))) {
      console.warn(`- ${link.status}: ${link.asin ?? link.url} (${link.availability})`);
    }
  }
  console.log(`Report: ${path.relative(projectRoot, jsonPath)} and ${path.relative(projectRoot, markdownPath)}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
