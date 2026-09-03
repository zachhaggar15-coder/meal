#!/usr/bin/env node
//
// One command that runs the full gate and reports the real result.
//
// Three ways this has actually gone wrong before, all of which this wrapper
// removes rather than documents:
//
//   1. `npm run check | tail` reports tail's exit code, not npm's. A run that
//      failed on a dependency advisory was reported as passing. Piping is the
//      natural thing to do because the log is enormous, so the fix is to write
//      the log to a file and print the tail separately, never in a pipeline.
//   2. dist/ keeps growing after the build because OneDrive is still syncing,
//      so any assertion on page counts taken immediately is wrong. This waits
//      for the count to stop moving before reporting it.
//   3. `vite preview` serves the SPA shell for prerendered routes and produces
//      React #418/#422 that are artefacts of the preview server, not the app.
//      Nothing here judges hydration, and the summary says so.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { waitForDistToSettle } from './lib/distSettle.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logPath = path.join(root, 'verify.log');

function run(command, args) {
  return new Promise(resolve => {
    const out = fs.createWriteStream(logPath);
    const child = spawn(command, args, { cwd: root, shell: process.platform === 'win32' });
    child.stdout.pipe(out);
    child.stderr.pipe(out);
    child.stdout.on('data', chunk => process.stdout.write(chunk));
    child.stderr.on('data', chunk => process.stderr.write(chunk));
    child.on('close', code => resolve(code ?? 1));
  });
}

const started = Date.now();
const code = await run('npm', ['run', 'check']);
const minutes = ((Date.now() - started) / 60000).toFixed(1);

let settled = null;
const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) {
  try {
    settled = await waitForDistToSettle(dist, { log: message => console.log(`  ${message}`) });
  } catch (error) {
    console.error(`  ${error.message}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`  npm run check exit code: ${code}`);
console.log(`  duration: ${minutes} minutes`);
if (settled !== null) console.log(`  dist HTML files (settled): ${settled}`);
console.log(`  full log: ${logPath}`);
console.log('  note: hydration is not judged here - vite preview fakes #418/#422');
console.log('='.repeat(60));

process.exit(code);
