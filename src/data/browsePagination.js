export const BROWSE_PAGE_SIZE = 24;

export function buildBrowsePagePath(page) {
  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
  return pageNumber === 1 ? '/browse' : `/browse/page/${pageNumber}`;
}

/**
 * The page numbers to show around the current one.
 *
 * With 1,059 plans at 24 a page there are 45 pages, and listing every number
 * put 44 links in the footer of all 45 pages — roughly two thousand internal
 * links that say nothing about where they lead, and on a phone a block of
 * targets too small and too close together to hit reliably.
 *
 * This keeps the ends (so the last page stays one tap away), a window around
 * the current page, and marks the omitted stretches with a gap.
 *
 * @param {number} current the page being viewed
 * @param {number} total how many pages exist
 * @param {number} [radius] how many neighbours to keep either side
 * @returns {Array<number|'gap'>} numbers to render, 'gap' where pages are elided
 */
export function buildBrowsePageWindow(current, total, radius = 1) {
  const pageCount = Math.max(1, Number(total) || 1);
  const page = Math.min(Math.max(1, Number(current) || 1), pageCount);

  const keep = new Set([1, pageCount]);
  for (let offset = -radius; offset <= radius; offset += 1) {
    const candidate = page + offset;
    if (candidate >= 1 && candidate <= pageCount) keep.add(candidate);
  }

  // Never render a gap that hides a single page — show the page instead.
  const sorted = [...keep].sort((a, b) => a - b);
  const window = [];
  let previous = 0;
  for (const pageNumber of sorted) {
    if (previous && pageNumber - previous === 2) window.push(previous + 1);
    else if (previous && pageNumber - previous > 2) window.push('gap');
    window.push(pageNumber);
    previous = pageNumber;
  }
  return window;
}

export function buildBrowsePageRoutes(totalItems) {
  const pageCount = Math.max(1, Math.ceil(Number(totalItems || 0) / BROWSE_PAGE_SIZE));
  return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => (
    buildBrowsePagePath(index + 2)
  ));
}
