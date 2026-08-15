#!/usr/bin/env node
// Guards the one date the plan pages present as a fact: LIBRARY_VALIDATED_ON.
//
// Plan pages state "Plan data last validated <date>" and emit it as
// schema.org dateModified. That is only honest while it matches the last
// recorded release-gate deployment, so this check fails the build if the
// constant drifts from docs/semantic-qa/deployment-log.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const logPath = path.join(root, 'docs/semantic-qa/deployment-log.json');
const log = JSON.parse(fs.readFileSync(logPath, 'utf8'));
const deployments = Array.isArray(log.deployments) ? log.deployments : [];

if (!deployments.length) {
  console.error('check-validation-date: deployment log has no entries.');
  process.exit(1);
}

const expected = String(deployments[deployments.length - 1].deployedAt || '').slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(expected)) {
  console.error(`check-validation-date: last deployment has no usable date (${expected}).`);
  process.exit(1);
}

const constantsSource = fs.readFileSync(path.join(root, 'src/constants/site.js'), 'utf8');
const match = /LIBRARY_VALIDATED_ON\s*=\s*'(\d{4}-\d{2}-\d{2})'/.exec(constantsSource);

if (!match) {
  console.error('check-validation-date: LIBRARY_VALIDATED_ON not found in src/constants/site.js.');
  process.exit(1);
}

if (match[1] !== expected) {
  console.error(
    `check-validation-date: LIBRARY_VALIDATED_ON is ${match[1]} but the last recorded ` +
    `release-gate deployment was ${expected}. Plan pages would show a validation date ` +
    'the deployment log does not support. Update the constant when recording a deployment.',
  );
  process.exit(1);
}

console.log(`Validation date check passed: LIBRARY_VALIDATED_ON = ${expected}.`);
