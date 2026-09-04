import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeAuditJson, auditArtifactsDir } from './lib/auditOutput.js';
import { classifyExternalResponse, collectExternalLinks } from './lib/externalLinks.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(projectRoot, 'dist');
const CONCURRENCY = 6;
const TIMEOUT_MS = 15_000;
const USER_AGENT = 'MealPrep.org.uk weekly source audit (+https://www.mealprep.org.uk/contact)';

const links = collectExternalLinks(distRoot);
const results = await probeAll(links);
const strictDead = results.filter(result => result.strict && result.status === 'dead');
const report = {
  generatedAt: new Date().toISOString(),
  coverage: {
    uniqueExternalLinks: results.length,
    pageOccurrences: results.reduce((sum, result) => sum + result.pages.length, 0),
    amazonLinksExcluded: true,
  },
  policy: {
    failure: 'confirmed HTTP 404 or 410 from a strict authoritative/vendor source',
    retailerBlocking: 'reported only; never fails this audit',
  },
  counts: countStatuses(results),
  failures: strictDead,
  results,
};

const jsonPath = writeAuditJson('external-link-health.json', report);
const markdownPath = writeMarkdown(report);
console.log(`External link audit checked ${results.length} distinct non-Amazon URL(s).`);
console.log(`Healthy ${report.counts.healthy || 0}; blocked ${report.counts.blocked || 0}; dead ${report.counts.dead || 0}; unknown ${report.counts.unknown || 0}.`);
console.log(`Reports: ${jsonPath}, ${markdownPath}`);

if (strictDead.length) {
  console.error(`${strictDead.length} strict source link(s) returned a confirmed 404/410.`);
  process.exit(1);
}

async function probeAll(sourceLinks) {
  const queue = [...sourceLinks];
  const results = [];
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const link = queue.shift();
      results.push({ ...link, ...(await probe(link.url)) });
    }
  });
  await Promise.all(workers);
  return results.sort((a, b) => a.url.localeCompare(b.url));
}

async function probe(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
        range: 'bytes=0-1023',
      },
    });
    const status = classifyExternalResponse(response.status);
    await response.body?.cancel();
    return { status, httpStatus: response.status, finalUrl: response.url, error: null };
  } catch (error) {
    return {
      status: 'unknown',
      httpStatus: null,
      finalUrl: null,
      error: error?.name === 'TimeoutError' ? 'timed out' : String(error?.message || error),
    };
  }
}

function countStatuses(items) {
  return items.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});
}

function writeMarkdown(data) {
  fs.mkdirSync(auditArtifactsDir, { recursive: true });
  const file = path.join(auditArtifactsDir, 'external-link-health.md');
  const attention = data.results.filter(result => result.status !== 'healthy');
  const lines = [
    '# External link health',
    '',
    `Checked ${data.coverage.uniqueExternalLinks} distinct non-Amazon URLs across ${data.coverage.pageOccurrences} page occurrences.`,
    '',
    `- Healthy: ${data.counts.healthy || 0}`,
    `- Blocked: ${data.counts.blocked || 0}`,
    `- Dead: ${data.counts.dead || 0}`,
    `- Unknown: ${data.counts.unknown || 0}`,
    '',
    'Only confirmed 404/410 responses from strict sources fail the workflow. Retailer bot blocking is report-only.',
  ];
  if (attention.length) {
    lines.push('', '## Needs review', '');
    for (const result of attention) {
      lines.push(`- **${result.status}** ${result.httpStatus || ''} — ${result.url} (${result.pages.length} page(s))`);
    }
  }
  fs.writeFileSync(file, `${lines.join('\n')}\n`);
  return file;
}
