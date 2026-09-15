// Pinterest-facing copy and links for an eligible page.
//
// Every string here is derived from what the page already says about itself.
// Nothing invents a claim: if a benefit is not in the page's own metadata, it
// does not appear on the Pin.

import { SITE_URL } from '../constants/site.js';
import {
  PINTEREST_IMAGE_PATH,
  PIN_IMAGE_HEIGHT,
  PIN_IMAGE_WIDTH,
  PINTEREST_UTM,
} from './config.js';

const TITLE_MAX = 64;
// Pinterest truncates descriptions around 500 characters. Leaving headroom
// keeps the last sentence intact rather than cut mid-word.
const DESCRIPTION_MAX = 460;

const BRAND_TAIL = /\s*[|–—-]\s*MealPrep\.org\.uk\s*$/i;

function collapse(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function truncateAtWord(value, max) {
  if (value.length <= max) return value;
  const clipped = value.slice(0, max - 1);
  const lastSpace = clipped.lastIndexOf(' ');
  const cut = lastSpace > max * 0.6 ? clipped.slice(0, lastSpace) : clipped;
  return `${cut.replace(/[\s,;:.!?&|–—-]+$/, '')}…`;
}

/**
 * Pin title: the page's own heading, without the brand tail Pinterest already
 * shows next to the Pin, and short enough not to be cut off in a grid.
 */
export function pinTitle(entry) {
  const base = collapse(entry.title || entry.metaTitle).replace(BRAND_TAIL, '');
  return truncateAtWord(base, TITLE_MAX);
}

/**
 * Pin description: what the reader gets, in the page's own words, followed by
 * the concrete facts that make it different from the next Pin.
 */
export function pinDescription(entry) {
  // The meta description is the page's own one-sentence pitch, written to be
  // read out of context. That is exactly what a Pin needs, and it is already
  // reviewed by the site's metadata audit - so it leads, and the page's longer
  // intro is only a fallback.
  const lead = sentenceCase(collapse(entry.description) || collapse(entry.proposition));
  const facts = [];
  const seen = lead.toLowerCase();

  if (entry.calorieTarget && !seen.includes(String(entry.calorieTarget))) {
    facts.push(`${entry.calorieTarget.toLocaleString('en-GB')} kcal a day`);
  }
  for (const benefit of entry.benefits || []) {
    const clean = collapse(benefit);
    // A bare store name repeats the title and adds nothing.
    if (!clean || clean === entry.supermarketLabel) continue;
    if (seen.includes(clean.toLowerCase())) continue;
    if (facts.some(fact => fact.toLowerCase() === clean.toLowerCase())) continue;
    facts.push(clean);
  }

  const body = [lead, ...facts.slice(0, 2).map(sentenceCase)].filter(Boolean).join(' ');
  return truncateAtWord(collapse(`${body} Free on MealPrep.org.uk.`), DESCRIPTION_MAX);
}

// Ends a fragment with a full stop so the description reads as sentences
// rather than as a run-on of stat labels.
function sentenceCase(value) {
  const text = collapse(value);
  if (!text) return '';
  return /[.!?\u2026]$/.test(text) ? text : `${text}.`;
}

/**
 * Campaign name. One per board, so GA4 splits Pinterest traffic by the board
 * that produced it with no further configuration.
 */
export function pinCampaign(entry) {
  return entry.board?.key || 'unassigned';
}

/**
 * The Pin's destination.
 *
 * The canonical URL with Pinterest UTMs appended. Any query the page already
 * carries is preserved and the UTM keys overwrite same-named ones, so a stray
 * utm_source in source data cannot produce two competing attributions. The
 * page's own canonical tag keeps pointing at the clean URL - SEO.jsx strips
 * the query when it builds `rel=canonical` - so this cannot create duplicate
 * content.
 */
export function pinDestinationUrl(entry, { origin = SITE_URL } = {}) {
  const url = new URL(entry.path, origin);
  url.searchParams.set('utm_source', PINTEREST_UTM.source);
  url.searchParams.set('utm_medium', PINTEREST_UTM.medium);
  url.searchParams.set('utm_campaign', pinCampaign(entry));
  return url.toString();
}

/**
 * The clean, canonical URL for the same page. Used as the RSS GUID so a Pin's
 * identity never changes when the UTM convention does.
 */
export function pinCanonicalUrl(entry, { origin = SITE_URL } = {}) {
  return new URL(entry.path, origin).toString();
}

/**
 * Stable filename for the page's Pinterest creative. Derived from the entry id
 * so the URL survives re-ranking, re-scoring and board changes.
 */
export function pinImageFilename(entry) {
  return `${entry.id.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}.png`;
}

export function pinImageUrl(entry, { origin = SITE_URL } = {}) {
  return `${origin}${PINTEREST_IMAGE_PATH}/${pinImageFilename(entry)}`;
}

/**
 * Everything one feed item needs, in one object, so the RSS writer and any
 * later Pinterest API adapter consume exactly the same record.
 */
export function buildPinRecord(entry, options = {}) {
  return {
    id: entry.id,
    guid: pinCanonicalUrl(entry, options),
    title: pinTitle(entry),
    description: pinDescription(entry),
    link: pinDestinationUrl(entry, options),
    canonical: pinCanonicalUrl(entry, options),
    campaign: pinCampaign(entry),
    board: entry.board?.board || null,
    boardKey: entry.board?.key || null,
    image: {
      url: pinImageUrl(entry, options),
      width: PIN_IMAGE_WIDTH,
      height: PIN_IMAGE_HEIGHT,
      type: 'image/png',
    },
    published: entry.published || '',
    modified: entry.modified || '',
    score: entry.score,
    kind: entry.kind,
  };
}
