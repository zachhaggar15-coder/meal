// Source integrity: no stray ASCII control characters in code or data.
//
// This exists because of a specific, dangerous failure. Writing a regex
// containing `\b` through a Python heredoc emitted a literal 0x08 backspace
// byte into scripts/lib/numericPromises.js. The regex then required an actual
// backspace character in the text, so it matched nothing — and the audit built
// on it reported the whole site clean.
//
// That is the worst kind of bug: a safety check that silently stops checking.
// Editors and the Read tool render 0x08 invisibly, so the file looked correct
// on inspection. Only a raw byte dump revealed it.
//
// Tab, newline and carriage return are legitimate. Everything else in the
// C0 range is not.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ALLOWED = new Set([0x09, 0x0a, 0x0d]); // tab, LF, CR
const SCANNED_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.json', '.css', '.md', '.html', '.txt', '.yml', '.yaml']);
const SKIP_DIRECTORIES = new Set(['node_modules', 'dist', '.git', '.vercel', 'audit-artifacts', '.claude']);

function collectFiles(directory, found = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (SKIP_DIRECTORIES.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(full, found);
    else if (SCANNED_EXTENSIONS.has(path.extname(entry.name))) found.push(full);
  }
  return found;
}

/**
 * Returns every disallowed control byte in a buffer, with the line and column
 * a person can actually navigate to.
 */
export function findControlCharacters(buffer) {
  const offenders = [];
  let line = 1;
  let column = 1;
  for (let index = 0; index < buffer.length; index += 1) {
    const byte = buffer[index];
    if (byte === 0x0a) { line += 1; column = 1; continue; }
    if (byte < 0x20 && !ALLOWED.has(byte)) {
      offenders.push({
        byte: `0x${byte.toString(16).padStart(2, '0')}`,
        offset: index,
        line,
        column,
      });
    }
    column += 1;
  }
  return offenders;
}

test('no source or data file contains a stray ASCII control character', () => {
  const files = collectFiles(root);
  assert.ok(files.length > 200, `expected a substantial corpus, scanned ${files.length}`);

  const offenders = [];
  for (const file of files) {
    const found = findControlCharacters(fs.readFileSync(file));
    for (const item of found.slice(0, 3)) {
      offenders.push(`${path.relative(root, file)}:${item.line}:${item.column} contains ${item.byte} (offset ${item.offset})`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'Stray control characters found. These are usually a shell/Python heredoc '
    + 'turning an escape such as \\b into a literal byte, which silently breaks '
    + 'regexes and string comparisons while looking correct in an editor.',
  );
});

// ── Controls for the detector itself ────────────────────────────────────────
// A checker that cannot fail is worth nothing, so prove it reacts.

test('the control-character detector finds a backspace byte when one exists', () => {
  // The exact historical defect: `\b` written through a heredoc.
  const corrupted = Buffer.from('const pattern = /\x08(?:all|each)\x08 under/i;\n', 'binary');
  const found = findControlCharacters(corrupted);
  assert.equal(found.length, 2, 'should find both injected backspaces');
  assert.equal(found[0].byte, '0x08');
  assert.equal(found[0].line, 1);
});

test('the detector accepts tabs, newlines and carriage returns', () => {
  const legitimate = Buffer.from('function a() {\n\tconst x = 1;\r\n\treturn x;\n}\n', 'utf8');
  assert.deepEqual(findControlCharacters(legitimate), []);
});

test('the detector reports the line of a control character on a later line', () => {
  const buffer = Buffer.from('line one\nline two\nbad \x0b here\n', 'binary');
  const found = findControlCharacters(buffer);
  assert.equal(found.length, 1);
  assert.equal(found[0].byte, '0x0b');
  assert.equal(found[0].line, 3, 'line number should point at the offending line');
});

test('the detector covers the whole disallowed C0 range', () => {
  for (const byte of [0x00, 0x01, 0x07, 0x08, 0x0b, 0x0c, 0x0e, 0x1b, 0x1f]) {
    const found = findControlCharacters(Buffer.from([0x61, byte, 0x62]));
    assert.equal(found.length, 1, `0x${byte.toString(16)} should be reported`);
  }
  for (const byte of [0x09, 0x0a, 0x0d, 0x20, 0x41]) {
    const found = findControlCharacters(Buffer.from([0x61, byte, 0x62]));
    assert.equal(found.length, 0, `0x${byte.toString(16)} should be allowed`);
  }
});
