// PR 18 opens with harness fixes, because adding gates to a harness that
// reports the wrong answer just makes more flaky gates. Each test here pins one
// of the three hazards that have actually caused a wrong conclusion.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { countHtmlFiles, waitForDistToSettle } from './lib/distSettle.js';

const root = path.resolve(import.meta.dirname, '..');
const verifySource = fs.readFileSync(path.join(root, 'scripts/verify.js'), 'utf8');

test('counts HTML files recursively, the way a prerendered dist is shaped', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dist-'));
  fs.writeFileSync(path.join(dir, 'index.html'), '');
  fs.mkdirSync(path.join(dir, 'plans', 'aldi'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'plans', 'aldi', 'index.html'), '');
  fs.writeFileSync(path.join(dir, 'plans', 'notes.txt'), '');
  assert.equal(countHtmlFiles(dir), 2);
});

test('waits for the count to stop moving before reporting it', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dist-'));
  fs.writeFileSync(path.join(dir, 'a.html'), '');

  // Simulate OneDrive still writing after the build returned.
  setTimeout(() => fs.writeFileSync(path.join(dir, 'b.html'), ''), 120);

  const settled = await waitForDistToSettle(dir, { intervalMs: 40, stableReads: 3, timeoutMs: 8000 });
  assert.equal(settled, 2, 'must report the count after writing stopped, not the first read');
});

test('a directory that never stops growing fails rather than reporting a number', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dist-'));
  let n = 0;
  const timer = setInterval(() => { fs.writeFileSync(path.join(dir, `f${n++}.html`), ''); }, 20);
  await assert.rejects(
    () => waitForDistToSettle(dir, { intervalMs: 30, stableReads: 3, timeoutMs: 600 }),
    /never settled/,
  );
  clearInterval(timer);
});

test('the wrapper never puts npm run check in a pipeline', () => {
  // `npm run check | tail` reports tail's exit code. The log is written to a
  // file and echoed separately so the real code survives. Comments are stripped
  // first, because the header of verify.js quotes the hazard it prevents.
  const code = verifySource.replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(code, /run check\s*\|/);
  assert.match(verifySource, /exit code: \$\{code\}/);
  assert.match(verifySource, /process\.exit\(code\)/);
});

test('the wrapper states that it does not judge hydration', () => {
  assert.match(verifySource, /vite preview fakes/);
});
