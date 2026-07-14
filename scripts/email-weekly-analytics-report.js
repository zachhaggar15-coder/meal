#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  resolveEmailFrom,
  resolveReplyTo,
  sendResendEmail,
} from '../server/email.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const reportPath = path.join(rootDir, 'docs', 'weekly-analytics-report.md');
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');

loadDotEnv(path.join(rootDir, '.env'));

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});

async function main() {
  if (!fs.existsSync(reportPath)) {
    throw new Error('Weekly analytics report is missing. Run npm run analytics:weekly first.');
  }

  const report = fs.readFileSync(reportPath, 'utf8');
  const summary = extractReportSummary(report);
  const recipient = resolveReportRecipient();
  const subject = `MealPrep weekly analytics report: ${summary.currentRange || summary.reportDate || 'latest'}`;
  const commitSha = readGitSha();
  const links = buildGithubLinks(commitSha);
  const text = renderTextEmail({ summary, report, links });
  const html = renderHtmlEmail({ summary, report, links });

  if (dryRun) {
    console.log(`Would send report email to: ${recipient}`);
    console.log(`Subject: ${subject}`);
    console.log(`Recommended action: ${summary.recommendedAction || 'Not found'}`);
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is required to email the weekly analytics report.');
  }

  const data = await sendResendEmail({
    from: resolveEmailFrom(
      process.env.MEALPREP_REPORT_FROM_EMAIL ||
      process.env.MEALPREP_FROM_EMAIL,
    ),
    to: recipient,
    replyTo: resolveReplyTo(process.env.MEALPREP_REPLY_TO_EMAIL),
    subject,
    text,
    html,
    idempotencyKey: `weekly-analytics-report:${summary.reportDate || 'latest'}:${commitSha}`,
  });

  console.log(`Weekly analytics report emailed to ${recipient}. Resend id: ${data?.id || 'unknown'}`);
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = stripEnvQuotes(rawValue.trim());
  }
}

function stripEnvQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function resolveReportRecipient() {
  return (
    process.env.WEEKLY_ANALYTICS_REPORT_EMAIL_TO ||
    process.env.MEALPREP_REPORT_EMAIL_TO ||
    'zach.haggar15@gmail.com'
  );
}

function extractReportSummary(report) {
  const currentRange = extractLineValue(report, 'Current range');
  const previousRange = extractLineValue(report, 'Previous range');
  const generated = extractLineValue(report, 'Generated');
  const recommendedSection = extractSection(report, 'Recommended Action For The Week');
  const observationsSection = extractSection(report, 'Automated Data Observations');
  const warningsSection = extractSection(report, 'Warnings');
  const opportunitiesSection = extractSection(report, 'Top Page Opportunities');
  const publicLinksSection = extractSection(report, 'Public Links Written');

  return {
    generated,
    currentRange,
    previousRange,
    reportDate: currentRange?.split(' to ').pop() || '',
    recommendedAction: extractBulletValue(recommendedSection, 'Action'),
    recommendedPage: extractBulletValue(recommendedSection, 'Page'),
    recommendedQuery: extractBulletValue(recommendedSection, 'Query/intent'),
    recommendedWhy: extractBulletValue(recommendedSection, 'Why'),
    newPageJustified: extractBulletValue(recommendedSection, 'New page justified'),
    approvalRequired: extractBulletValue(recommendedSection, 'Approval required'),
    observations: extractBullets(observationsSection).slice(0, 8),
    warnings: extractBullets(warningsSection).slice(0, 6),
    opportunitiesPreview: extractTableRows(opportunitiesSection).slice(0, 3),
    publicLinks: extractBullets(publicLinksSection).slice(0, 8),
  };
}

function extractLineValue(report, label) {
  const match = report.match(new RegExp(`^${escapeRegExp(label)}:\\s*(.+)$`, 'm'));
  return match?.[1]?.trim() || '';
}

function extractSection(report, heading) {
  const pattern = new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, 'm');
  const match = report.match(pattern);
  if (!match || match.index === undefined) return '';

  const sectionStart = match.index + match[0].length;
  const nextHeading = report.slice(sectionStart).search(/\n## /);
  const sectionEnd = nextHeading === -1 ? report.length : sectionStart + nextHeading;
  return report.slice(sectionStart, sectionEnd).trim();
}

function extractBulletValue(section, label) {
  const match = section.match(new RegExp(`^- ${escapeRegExp(label)}:\\s*(.+)$`, 'm'));
  return match?.[1]?.trim() || '';
}

function extractBullets(section) {
  return section
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('- '))
    .map(line => line.slice(2).trim());
}

function extractTableRows(section) {
  return section
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('|') && !line.includes('---') && !line.startsWith('| Page |') && !line.startsWith('| Query |'))
    .map(line => line.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()).join(' | '));
}

function buildGithubLinks(commitSha) {
  const repo = process.env.GITHUB_REPOSITORY || 'zachhaggar15-coder/meal';
  const server = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const runId = process.env.GITHUB_RUN_ID || '';
  const branch = process.env.GITHUB_REF_NAME || 'main';

  return {
    report: `${server}/${repo}/blob/${branch}/docs/weekly-analytics-report.md`,
    datedReports: `${server}/${repo}/tree/${branch}/docs/seo-reports`,
    run: runId ? `${server}/${repo}/actions/runs/${runId}` : '',
    commit: commitSha ? `${server}/${repo}/commit/${commitSha}` : '',
  };
}

function readGitSha() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return process.env.GITHUB_SHA || '';
  }
}

function renderTextEmail({ summary, report, links }) {
  return [
    'MealPrep.org.uk weekly analytics report',
    '',
    `Current range: ${summary.currentRange || 'Unknown'}`,
    `Previous range: ${summary.previousRange || 'Unknown'}`,
    '',
    'Recommended action:',
    summary.recommendedAction || 'No recommendation found.',
    summary.recommendedPage ? `Page: ${summary.recommendedPage}` : '',
    summary.recommendedQuery ? `Query/intent: ${summary.recommendedQuery}` : '',
    summary.recommendedWhy ? `Why: ${summary.recommendedWhy}` : '',
    summary.approvalRequired ? `Approval required: ${summary.approvalRequired}` : '',
    '',
    'Observations:',
    ...summary.observations.map(item => `- ${item}`),
    '',
    'Links:',
    `Report: ${links.report}`,
    links.run ? `Workflow run: ${links.run}` : '',
    links.commit ? `Commit: ${links.commit}` : '',
    '',
    'Full report:',
    report,
  ].filter(line => line !== '').join('\n');
}

function renderHtmlEmail({ summary, report, links }) {
  return `
    <div style="margin:0;padding:0;background:#f6f7f5;color:#17130d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(summary.recommendedAction || 'Weekly analytics report ready')}</div>
      <div style="max-width:760px;margin:0 auto;padding:28px 18px;">
        <div style="background:#ffffff;border:1px solid #e6e1d7;border-radius:14px;padding:28px;">
          <p style="margin:0 0 8px;color:#2563eb;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">MealPrep.org.uk</p>
          <h1 style="margin:0 0 18px;font-size:26px;line-height:1.2;color:#17130d;">Weekly analytics report</h1>
          <p style="margin:0 0 14px;color:#4f473c;">${escapeHtml(summary.currentRange || 'Latest reporting period')}</p>
          ${renderSummaryBox(summary)}
          ${renderList('Data observations', summary.observations)}
          ${renderList('Warnings', summary.warnings)}
          ${renderList('Public links written', summary.publicLinks)}
          ${renderList('Top opportunities preview', summary.opportunitiesPreview)}
          <h2 style="font-size:18px;margin:24px 0 10px;">Open the report</h2>
          <p style="line-height:1.6;">
            <a href="${escapeHtml(links.report)}">View latest report</a>
            ${links.run ? ` &middot; <a href="${escapeHtml(links.run)}">Workflow run</a>` : ''}
            ${links.commit ? ` &middot; <a href="${escapeHtml(links.commit)}">Generated commit</a>` : ''}
          </p>
          <details style="margin-top:22px;">
            <summary style="cursor:pointer;font-weight:700;">Full report text</summary>
            <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;background:#f7f5f0;border:1px solid #ebe6dc;border-radius:8px;padding:14px;overflow:auto;">${escapeHtml(report)}</pre>
          </details>
        </div>
        <p style="margin:16px 4px 0;color:#777064;font-size:12px;line-height:1.5;">
          You received this because the MealPrep.org.uk weekly analytics workflow completed successfully.
        </p>
      </div>
    </div>
  `;
}

function renderSummaryBox(summary) {
  return `
    <div style="border:1px solid #e4e0d7;background:#fbfaf7;border-radius:10px;padding:18px;margin:18px 0;">
      <h2 style="font-size:18px;margin:0 0 10px;">Suggested action</h2>
      <p style="margin:0 0 8px;"><strong>${escapeHtml(summary.recommendedAction || 'No recommendation found')}</strong></p>
      ${summary.recommendedPage ? `<p style="margin:0 0 6px;"><strong>Page:</strong> ${escapeHtml(summary.recommendedPage)}</p>` : ''}
      ${summary.recommendedQuery ? `<p style="margin:0 0 6px;"><strong>Query/intent:</strong> ${escapeHtml(summary.recommendedQuery)}</p>` : ''}
      ${summary.recommendedWhy ? `<p style="margin:0 0 6px;"><strong>Why:</strong> ${escapeHtml(summary.recommendedWhy)}</p>` : ''}
      ${summary.approvalRequired ? `<p style="margin:0;"><strong>Approval required:</strong> ${escapeHtml(summary.approvalRequired)}</p>` : ''}
    </div>
  `;
}

function renderList(title, items) {
  if (!items.length) return '';
  return `
    <h2 style="font-size:18px;margin:24px 0 10px;">${escapeHtml(title)}</h2>
    <ul style="padding-left:20px;line-height:1.55;margin-top:0;">
      ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>
  `;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
