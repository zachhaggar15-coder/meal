// Content provenance dates.
//
// Three different things used to be collapsed into one "Last materially
// reviewed" line: when a page was published, when its content last changed, and
// when a person last checked the guidance in it. Where none existed, a single
// hardcoded date was substituted. That produced a freshness signal the site
// could not support.
//
// These helpers keep the three separate and return null rather than inventing a
// value, so a page shows only the dates that are genuinely true for it.

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Formats a stored date for display. Accepts the two formats used in the
 * content data — ISO `2026-07-11` and already-readable `11 July 2026` — and
 * returns null for anything missing or unparseable, so callers can omit the
 * line entirely instead of rendering a placeholder.
 */
export function formatContentDate(value) {
  const text = String(value || '').trim();
  if (!text) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (iso) {
    const [, year, month, day] = iso;
    const monthName = MONTHS[Number(month) - 1];
    if (!monthName) return null;
    return `${Number(day)} ${monthName} ${year}`;
  }

  // Already human-readable ("11 July 2026") — pass through unchanged.
  if (/^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(text)) return text;

  return null;
}

/** Returns an ISO date string for structured data, or null if not derivable. */
export function toIsoDate(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const readable = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(text);
  if (readable) {
    const [, day, monthName, year] = readable;
    const monthIndex = MONTHS.findIndex(
      month => month.toLowerCase() === monthName.toLowerCase(),
    );
    if (monthIndex < 0) return null;
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(Number(day)).padStart(2, '0')}`;
  }
  return null;
}

/**
 * Builds the props TrustBox and bylines need from a content record, dropping
 * anything the record does not actually carry.
 */
export function contentProvenance(record = {}) {
  return {
    published: formatContentDate(record.published),
    updated: formatContentDate(record.modified),
    reviewed: formatContentDate(record.reviewed),
  };
}

/**
 * Only emits schema.org date properties that are backed by real data. Omitting
 * `dateModified` is valid; inventing one is a claim the site cannot support.
 */
export function schemaDates(record = {}) {
  const datePublished = toIsoDate(record.published);
  const dateModified = toIsoDate(record.modified);
  return {
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}
