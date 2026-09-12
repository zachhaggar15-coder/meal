// Validation harness: load a book, build it, print the QA report.
import { assemble } from './assemble.mjs';
import { runQa, formatQa } from './qa.mjs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const target = process.argv[2];
const { default: def } = await import(pathToFileURL(path.resolve(target)).href);
let book;
try {
  book = assemble(def);
} catch (e) {
  console.error('BUILD FAILED:', e.message);
  process.exit(1);
}
const report = runQa(book);
console.log(formatQa(report));
process.exit(report.criticalFailures ? 1 : 0);
