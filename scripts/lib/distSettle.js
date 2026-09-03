import fs from 'node:fs';
import path from 'node:path';

// This repository lives inside a OneDrive folder. After a build, OneDrive keeps
// writing into dist/ for a while, so a file count taken immediately after
// `vite build` is lower than the real one and climbs for minutes. Anything that
// asserts on how many pages were emitted has to wait for that to stop, or it
// fails on a build that is actually fine.
export function countHtmlFiles(dir) {
  let total = 0;
  const walk = current => {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) total += 1;
    }
  };
  walk(dir);
  return total;
}

/**
 * Poll until the HTML file count stops changing.
 *
 * Returns the settled count, or throws if it never stops moving - which is
 * itself worth failing on, because it means something is still writing.
 */
export async function waitForDistToSettle(dir, {
  intervalMs = 2000,
  stableReads = 3,
  timeoutMs = 120000,
  log = () => {},
} = {}) {
  const startedAt = Date.now();
  let previous = -1;
  let stable = 0;

  for (;;) {
    const count = countHtmlFiles(dir);
    if (count === previous && count > 0) {
      stable += 1;
      if (stable >= stableReads) {
        log(`dist settled at ${count} HTML files`);
        return count;
      }
    } else {
      if (previous !== -1 && count !== previous) {
        log(`dist still moving: ${previous} -> ${count}`);
      }
      stable = 0;
      previous = count;
    }

    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(
        `dist/ HTML count never settled within ${Math.round(timeoutMs / 1000)}s `
        + `(last read ${count}). Something is still writing to the directory.`,
      );
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
}
