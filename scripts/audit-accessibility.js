#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { crawlDist, distRoot } from './lib/crawlDist.js';
import { writeAuditJson } from './lib/auditOutput.js';

const { pages } = crawlDist();
const errors = [];
const warnings = [];
const totals = {
  images: 0,
  links: 0,
  buttons: 0,
  formControls: 0,
  headings: 0,
};

for (const page of pages) {
  const html = fs.readFileSync(path.join(distRoot, page.file), 'utf8');
  const visibleHtml = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '');
  const pageErrors = [];
  const pageWarnings = [];

  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) {
    pageErrors.push('missing document language');
  }
  if ((visibleHtml.match(/<main\b/gi) || []).length !== 1) {
    pageErrors.push('expected exactly one main landmark');
  }
  if (!/<a\b[^>]*href=["']#main-content["'][^>]*>/i.test(visibleHtml)) {
    pageErrors.push('missing skip link to #main-content');
  }

  const ids = [...visibleHtml.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) pageErrors.push(`duplicate IDs: ${duplicateIds.slice(0, 8).join(', ')}`);

  for (const match of visibleHtml.matchAll(/<img\b[^>]*>/gi)) {
    totals.images += 1;
    if (!/\balt=["'][^"']*["']/i.test(match[0])) pageErrors.push('image missing alt attribute');
  }

  for (const match of visibleHtml.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    totals.buttons += 1;
    if (!accessibleName(match[1], match[2])) pageErrors.push('button missing accessible name');
  }

  for (const match of visibleHtml.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    totals.links += 1;
    if (!accessibleName(match[1], match[2])) pageErrors.push('link missing accessible name');
  }

  const labelFors = new Set(
    [...visibleHtml.matchAll(/<label\b[^>]*for=["']([^"']+)["']/gi)].map(match => match[1]),
  );
  for (const match of visibleHtml.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const [fullTag, tagName, attributes] = match;
    if (tagName.toLowerCase() === 'input' && /\btype=["']hidden["']/i.test(attributes)) continue;
    totals.formControls += 1;
    const id = attribute(attributes, 'id');
    const labelled = /\baria-label(?:ledby)?=["'][^"']+["']/i.test(attributes)
      || /\btitle=["'][^"']+["']/i.test(attributes)
      || (id && labelFors.has(id))
      || insideOpenLabel(visibleHtml, match.index);
    if (!labelled) pageErrors.push(`form control missing accessible name: ${fullTag.slice(0, 120)}`);
  }

  const headingLevels = [...visibleHtml.matchAll(/<h([1-6])\b[^>]*>/gi)].map(match => Number(match[1]));
  totals.headings += headingLevels.length;
  for (let index = 1; index < headingLevels.length; index += 1) {
    if (headingLevels[index] > headingLevels[index - 1] + 1) {
      pageWarnings.push(`heading level jumps from h${headingLevels[index - 1]} to h${headingLevels[index]}`);
      break;
    }
  }

  for (const issue of [...new Set(pageErrors)]) errors.push({ route: page.route, issue });
  for (const issue of [...new Set(pageWarnings)]) warnings.push({ route: page.route, issue });
}

const report = {
  generatedAt: new Date().toISOString(),
  coverage: {
    generatedPages: pages.length,
    canonicalPages: pages.filter(page => page.indexable).length,
    ...totals,
    exhaustiveStaticMarkup: true,
  },
  thresholds: {
    missingAccessibleNames: 0,
    missingImageAltAttributes: 0,
    duplicateIds: 0,
    missingMainOrLanguageOrSkipLink: 0,
  },
  errors,
  warnings,
  limitations: [
    'Static markup checks cannot prove colour contrast, focus visibility, announcements or keyboard behaviour.',
    'Representative interactive and responsive flows are verified separately in a real browser.',
  ],
};
const reportPath = writeAuditJson('accessibility.json', report);

if (errors.length) {
  console.error(`Accessibility audit failed with ${errors.length} issue(s).`);
  errors.slice(0, 80).forEach(item => console.error(`- ${item.route}: ${item.issue}`));
  process.exit(1);
}

console.log(
  `Accessibility audit passed across ${pages.length} HTML files, ${totals.formControls} controls, ` +
  `${totals.buttons} buttons, ${totals.links} links and ${totals.images} images; report: ${reportPath}`,
);

function accessibleName(attributes, content) {
  if (/\baria-label(?:ledby)?=["'][^"']+["']/i.test(attributes)) return true;
  if (/\btitle=["'][^"']+["']/i.test(attributes)) return true;
  const text = stripTags(content);
  if (text) return true;
  return [...String(content || '').matchAll(/<img\b[^>]*\balt=["']([^"']+)["']/gi)]
    .some(match => stripTags(match[1]));
}

function insideOpenLabel(html, index) {
  return html.lastIndexOf('<label', index) > html.lastIndexOf('</label>', index);
}

function attribute(attributes, name) {
  return String(attributes || '').match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'))?.[1] || '';
}

function stripTags(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
