// Pinterest creatives: 1000x1500 (2:3) vertical images, drawn as SVG and
// rasterised to PNG at build time by scripts/generate-pinterest-assets.js.
//
// This extends the approach already used in src/data/visualAssets.js - hand
// written SVG with a small set of themes - rather than introducing a design
// tool or a runtime image service. There are three templates, not three
// hundred designs: which one a page gets is decided by the page's own data.

import { PIN_IMAGE_HEIGHT, PIN_IMAGE_WIDTH } from './config.js';

const W = PIN_IMAGE_WIDTH;
const H = PIN_IMAGE_HEIGHT;

// Pinterest crops a little off the top and bottom in some surfaces, so nothing
// that has to be read sits inside these margins.
const SAFE_TOP = 70;
const SAFE_BOTTOM = 70;
const GUTTER = 80;
const CONTENT_WIDTH = W - GUTTER * 2;

// The site palette: the header green from index.html's theme-color, the deep
// green and cream already used by the card visuals, and a warm accent that
// clears 4.5:1 against both greens.
const PALETTE = Object.freeze({
  deep: '#123f33',
  brand: '#2f855a',
  paper: '#f8f3ea',
  ink: '#1c2b25',
  muted: '#55655c',
  accent: '#f2b544',
  rule: '#d8c8ae',
  onDeep: '#ffffff',
});

export const TEMPLATES = Object.freeze(['supermarket', 'target', 'guide']);

/**
 * Which template a page gets. Deterministic and derived from the page's own
 * metadata, so the same page always produces the same creative.
 */
export function templateFor(entry) {
  if (entry.supermarketLabel) return 'supermarket';
  if (entry.calorieTarget) return 'target';
  return 'guide';
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// DM Sans advance widths average close to these fractions of the font size.
// Good enough to wrap reliably without embedding a metrics table.
const AVERAGE_ADVANCE = { 400: 0.52, 700: 0.55 };

function wrapToWidth(value, { fontSize, weight = 700, maxWidth = CONTENT_WIDTH, maxLines = 3 }) {
  const perChar = fontSize * (AVERAGE_ADVANCE[weight] || 0.55);
  const maxChars = Math.max(8, Math.floor(maxWidth / perChar));
  const words = String(value || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S+$/, '')}…`;
  return kept;
}

function text(content, { x, y, size, weight = 400, fill = PALETTE.ink, spacing = 0, anchor = 'start' }) {
  const letterSpacing = spacing ? ` letter-spacing="${spacing}"` : '';
  const textAnchor = anchor === 'start' ? '' : ` text-anchor="${anchor}"`;
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="DM Sans" font-size="${size}" font-weight="${weight}"${letterSpacing}${textAnchor}>${escapeXml(content)}</text>`;
}

function textBlock(lines, { x, y, size, lineHeight, weight = 700, fill = PALETTE.ink }) {
  return lines
    .map((line, index) => text(line, { x, y: y + index * lineHeight, size, weight, fill }))
    .join('');
}

// A bullet is a short accent rule plus one line. Three at most: a Pin with a
// paragraph on it is unreadable on a phone and reads as spam.
const BULLET_GAP = 104;

function bulletList(items, { x, y, gap = BULLET_GAP, fill = PALETTE.ink, ruleFill = PALETTE.accent }) {
  return items
    .slice(0, 3)
    .map((item, index) => {
      const lineY = y + index * gap;
      const [line] = wrapToWidth(item, { fontSize: 40, weight: 400, maxWidth: CONTENT_WIDTH - 60, maxLines: 1 });
      return [
        `<rect x="${x}" y="${lineY - 26}" width="34" height="6" rx="3" fill="${ruleFill}"/>`,
        text(line, { x: x + 56, y: lineY, size: 40, weight: 400, fill }),
      ].join('');
    })
    .join('');
}

// Bullets are anchored to the bottom of the content area rather than hung off
// the headline. Hanging them left a third of the canvas empty on short titles.
function bulletStartY(count, bottomBaseline) {
  return bottomBaseline - Math.max(0, count - 1) * BULLET_GAP;
}

function wordmark({ fill = PALETTE.ink, ruleFill = PALETTE.rule }) {
  const baseline = H - SAFE_BOTTOM - 26;
  return [
    `<rect x="${GUTTER}" y="${baseline - 78}" width="${CONTENT_WIDTH}" height="3" fill="${ruleFill}"/>`,
    text('MealPrep.org.uk', { x: GUTTER, y: baseline, size: 44, weight: 700, fill }),
    text('Free UK meal plans', { x: W - GUTTER, y: baseline, size: 30, weight: 400, fill, anchor: 'end' }),
  ].join('');
}

/**
 * Copy for a creative, assembled from the page's own metadata.
 *
 * `eyebrow` names the proposition, `headline` is the page's heading and the
 * bullets are facts the page itself states. Nothing here is written for the
 * Pin - if a page has no benefit to show, the creative shows fewer bullets
 * rather than a manufactured one.
 */
export function creativeCopy(entry, { calorieIsHero = false } = {}) {
  const eyebrow = entry.supermarketLabel
    ? `${entry.supermarketLabel} meal plans`.toUpperCase()
    : String(entry.kicker || 'UK meal prep').toUpperCase();

  const facts = [];
  // When the template already prints the calorie figure at 210px, repeating it
  // as a bullet - and repeating any stat label that contains it - says the same
  // number three times.
  if (entry.calorieTarget && !calorieIsHero) {
    facts.push(`${entry.calorieTarget.toLocaleString('en-GB')} kcal a day`);
  }

  for (const benefit of entry.benefits || []) {
    const clean = String(benefit || '').replace(/\s+/g, ' ').trim();
    if (!clean || clean === entry.supermarketLabel) continue;
    if (calorieIsHero && entry.calorieTarget && clean.includes(String(entry.calorieTarget))) continue;
    if (facts.some(fact => fact.toLowerCase() === clean.toLowerCase())) continue;
    facts.push(clean);
  }

  if (facts.length < 3) {
    const freshness = reviewMonth(entry.modified || entry.published);
    if (freshness) facts.push(`Updated ${freshness}`);
  }
  if (facts.length < 3 && entry.kind === 'guide') facts.push('Free UK guide');
  if (!facts.length) facts.push('Free UK meal plans');

  return {
    eyebrow,
    headline: String(entry.title || '').replace(/\s*[|\u2013\u2014-]\s*MealPrep\.org\.uk\s*$/i, ''),
    facts: facts.slice(0, 3),
  };
}

// "Updated June 2026", from the page's own published/modified date. Returns ''
// when the page carries no date rather than inventing one.
function reviewMonth(value) {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function supermarketTemplate(entry) {
  const { eyebrow, headline, facts } = creativeCopy(entry);
  const bandHeight = 760;
  const lines = wrapToWidth(headline, { fontSize: 78, weight: 700, maxLines: 3 });
  // Optically centred between the eyebrow and the foot of the band, so a
  // one-line title does not float and a three-line one does not crowd.
  const headlineY = Math.round((SAFE_TOP + 240 + bandHeight - 90) / 2) - ((lines.length - 1) * 88) / 2;
  const firstBulletY = bulletStartY(facts.length, H - 300);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<rect width="${W}" height="${H}" fill="${PALETTE.paper}"/>
<rect width="${W}" height="${bandHeight}" fill="${PALETTE.deep}"/>
<rect x="${GUTTER}" y="${SAFE_TOP + 60}" width="96" height="8" rx="4" fill="${PALETTE.accent}"/>
${text(eyebrow, { x: GUTTER, y: SAFE_TOP + 140, size: 34, weight: 700, fill: PALETTE.accent, spacing: 4 })}
${textBlock(lines, { x: GUTTER, y: headlineY, size: 78, lineHeight: 88, weight: 700, fill: PALETTE.onDeep })}
<rect x="${GUTTER}" y="${firstBulletY - 120}" width="140" height="6" rx="3" fill="${PALETTE.brand}"/>
${bulletList(facts, { x: GUTTER, y: firstBulletY })}
${wordmark({})}
</svg>`;
}

function targetTemplate(entry) {
  const { eyebrow, headline, facts } = creativeCopy(entry, { calorieIsHero: true });
  const figure = entry.calorieTarget
    ? entry.calorieTarget.toLocaleString('en-GB')
    : '7';
  const figureLabel = entry.calorieTarget ? 'kcal a day' : 'day plan';
  const lines = wrapToWidth(headline, { fontSize: 66, weight: 700, maxLines: 3 });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<rect width="${W}" height="${H}" fill="${PALETTE.deep}"/>
<rect x="${GUTTER}" y="${SAFE_TOP + 40}" width="96" height="8" rx="4" fill="${PALETTE.accent}"/>
${text(eyebrow, { x: GUTTER, y: SAFE_TOP + 120, size: 34, weight: 700, fill: PALETTE.accent, spacing: 4 })}
${text(figure, { x: GUTTER, y: 520, size: 210, weight: 700, fill: PALETTE.onDeep })}
${text(figureLabel, { x: GUTTER, y: 596, size: 42, weight: 400, fill: PALETTE.accent })}
<rect x="${GUTTER}" y="666" width="${CONTENT_WIDTH}" height="3" fill="rgba(255,255,255,0.28)"/>
${textBlock(lines, { x: GUTTER, y: 772, size: 66, lineHeight: 80, weight: 700, fill: PALETTE.onDeep })}
${bulletList(facts, { x: GUTTER, y: bulletStartY(facts.length, H - 300), fill: PALETTE.paper })}
${wordmark({ fill: PALETTE.onDeep, ruleFill: 'rgba(255,255,255,0.3)' })}
</svg>`;
}

function guideTemplate(entry) {
  const { eyebrow, headline, facts } = creativeCopy(entry);
  const lines = wrapToWidth(headline, { fontSize: 76, weight: 700, maxLines: 4 });
  const firstBulletY = bulletStartY(facts.length, H - 340);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<rect width="${W}" height="${H}" fill="${PALETTE.paper}"/>
<rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${PALETTE.rule}" stroke-width="4"/>
<rect x="${GUTTER}" y="${SAFE_TOP + 60}" width="96" height="8" rx="4" fill="${PALETTE.brand}"/>
${text(eyebrow, { x: GUTTER, y: SAFE_TOP + 142, size: 32, weight: 700, fill: PALETTE.brand, spacing: 4 })}
${textBlock(lines, { x: GUTTER, y: 450, size: 76, lineHeight: 92, weight: 700, fill: PALETTE.ink })}
<rect x="${GUTTER}" y="${firstBulletY - 120}" width="140" height="6" rx="3" fill="${PALETTE.accent}"/>
${bulletList(facts, { x: GUTTER, y: firstBulletY, fill: PALETTE.muted })}
<rect y="${H - 200}" width="${W}" height="200" fill="${PALETTE.deep}"/>
${text('MealPrep.org.uk', { x: GUTTER, y: H - 96, size: 46, weight: 700, fill: PALETTE.onDeep })}
${text('Free UK meal plans', { x: W - GUTTER, y: H - 96, size: 30, weight: 400, fill: PALETTE.accent, anchor: 'end' })}
</svg>`;
}

const RENDERERS = { supermarket: supermarketTemplate, target: targetTemplate, guide: guideTemplate };

export function buildPinSvg(entry) {
  const template = templateFor(entry);
  return { template, svg: RENDERERS[template](entry) };
}
