const CHUNK_LOAD_ERROR = /(?:loading|fetching|importing).*(?:chunk|dynamically imported module)|failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module/i;
const RETRY_PREFIX = 'mealprep:chunk-reload:';

function errorText(error) {
  return [error?.name, error?.message, error?.cause?.message]
    .filter(Boolean)
    .join(' ');
}

export function isChunkLoadError(error) {
  return CHUNK_LOAD_ERROR.test(errorText(error));
}

export function chunkReloadKey(error, pathname = '') {
  const signature = errorText(error).slice(0, 240);
  return `${RETRY_PREFIX}${pathname}:${signature}`;
}

export function claimChunkReload(error, { pathname = '', storage } = {}) {
  if (!isChunkLoadError(error) || !storage) return false;

  const key = chunkReloadKey(error, pathname);
  try {
    if (storage.getItem(key)) return false;
    storage.setItem(key, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}
