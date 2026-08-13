export function extractDomIds(html) {
  return [...String(html || '').matchAll(/(?:^|\s)id=["']([^"']+)["']/gi)]
    .map(match => match[1]);
}
