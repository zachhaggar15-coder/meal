#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runWeeklySemanticQa } from './lib/semanticPlanQa.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const trackerPath = path.join(rootDir, 'docs', 'search-console-weekly-tracker.csv');

loadDotEnv(path.join(rootDir, '.env'));

const args = parseArgs(process.argv.slice(2));
const dryRun = args.has('dry-run');
const sampleSize = positiveNumber(args.get('sample-size') || process.env.SEMANTIC_QA_SAMPLE_SIZE, 30);
const useModel = !args.has('no-model') && Boolean(process.env.OPENAI_API_KEY);
const currentSearchRows = readLatestTrackerRows(trackerPath);

const result = await runWeeklySemanticQa({
  currentSearchRows,
  sampleSize,
  persist: !dryRun,
  useModel,
});

const reasons = result.reviews.reduce((counts, review) => {
  const reason = review.sampleReason || 'coverage';
  counts[reason] = Number(counts[reason] || 0) + 1;
  return counts;
}, {});

console.log([
  `Semantic plan QA: ${result.run.sampleSize} plan(s), ${result.run.passRate}% pass rate.`,
  `Severity: ${Object.entries(result.run.severity).map(([name, count]) => `${name} ${count}`).join(', ')}.`,
  `Sampling: ${Object.entries(reasons).map(([name, count]) => `${name} ${count}`).join(', ')}.`,
  `Systemic patterns: ${result.run.systemicIssueCount}.`,
  `Model review: ${result.run.model.status}${result.run.model.model ? ` (${result.run.model.model})` : ''}.`,
  `History: ${dryRun ? 'not written (dry run)' : 'updated'}.`,
].join('\n'));

for (const review of result.reviews.filter(item => item.overallStatus !== 'Pass')) {
  console.log(`- ${review.highestSeverity}: ${review.route} (${review.findingCount} finding${review.findingCount === 1 ? '' : 's'})`);
}

function readLatestTrackerRows(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = parseCsvLine(lines[0]);
  const indexes = Object.fromEntries(['date', 'page', 'impressions', 'clicks'].map(name => [name, header.indexOf(name)]));
  if (Object.values(indexes).some(index => index < 0)) return [];
  const rows = lines.slice(1).map(line => {
    const cells = parseCsvLine(line);
    return {
      date: cells[indexes.date],
      page: cells[indexes.page],
      impressions: Number(cells[indexes.impressions] || 0),
      clicks: Number(cells[indexes.clicks] || 0),
    };
  }).filter(row => row.date && row.page);
  const latestDate = rows.reduce((latest, row) => row.date > latest ? row.date : latest, '');
  return rows.filter(row => row.date === latestDate);
}

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (inQuotes && character === '"' && line[index + 1] === '"') {
      current += '"';
      index += 1;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (character === ',' && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += character;
    }
  }
  cells.push(current);
  return cells;
}

function parseArgs(values) {
  const parsed = new Map();
  for (let index = 0; index < values.length; index += 1) {
    const raw = values[index];
    if (!raw.startsWith('--')) continue;
    const [name, inlineValue] = raw.slice(2).split('=', 2);
    const next = values[index + 1];
    if (inlineValue !== undefined) parsed.set(name, inlineValue);
    else if (next && !next.startsWith('--')) {
      parsed.set(name, next);
      index += 1;
    } else parsed.set(name, true);
  }
  return parsed;
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : fallback;
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || Object.hasOwn(process.env, match[1])) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}
