export const BROWSE_PAGE_SIZE = 24;

export function buildBrowsePagePath(page) {
  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
  return pageNumber === 1 ? '/browse' : `/browse/page/${pageNumber}`;
}

export function buildBrowsePageRoutes(totalItems) {
  const pageCount = Math.max(1, Math.ceil(Number(totalItems || 0) / BROWSE_PAGE_SIZE));
  return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => (
    buildBrowsePagePath(index + 2)
  ));
}
