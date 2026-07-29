import { crawlDist } from './lib/crawlDist.js';
import { writeAuditJson } from './lib/auditOutput.js';

const { pages } = crawlDist();
const broken = pages.flatMap(page => page.internalLinks
  .filter(link => link.status === 'broken' || link.status === 'invalid')
  .map(link => ({ source: page.route, ...link })));
const redirected = pages.flatMap(page => page.internalLinks
  .filter(link => link.status === 'redirect')
  .map(link => ({ source: page.route, ...link })));
const report = {
  generatedAt: new Date().toISOString(),
  coverage: {
    htmlPages: pages.length,
    internalLinkOccurrences: pages.reduce((sum, page) => sum + page.internalLinks.length, 0),
    exhaustive: true,
  },
  threshold: { brokenLinks: 0, internalLinksToRedirects: 0 },
  broken,
  internalLinksToRedirects: redirected,
};
const outputPath = writeAuditJson('broken-links.json', report);

if (broken.length || redirected.length) {
  console.error(`Link audit failed: ${broken.length} broken link(s), ${redirected.length} link(s) to redirects.`);
  [...broken, ...redirected].slice(0, 80).forEach(item => console.error(`- ${item.source} -> ${item.href}`));
  process.exit(1);
}

console.log(
  `Link audit passed exhaustively for ${pages.length} HTML pages and ` +
  `${report.coverage.internalLinkOccurrences.toLocaleString('en-GB')} internal link occurrences. Report: ${outputPath}`,
);
