import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  classifyExternalResponse,
  collectExternalLinks,
  isStrictSource,
} from './lib/externalLinks.js';

test('only authoritative and first-party vendor sources are strict', () => {
  assert.equal(isStrictSource('www.nhs.uk'), true);
  assert.equal(isStrictSource('www.gov.uk'), true);
  assert.equal(isStrictSource('ahrefs.com'), true);
  assert.equal(isStrictSource('groceries.example-retailer.test'), false);
});

test('confirmed removals are distinct from bot blocking and server uncertainty', () => {
  assert.equal(classifyExternalResponse(200), 'healthy');
  assert.equal(classifyExternalResponse(308), 'healthy');
  assert.equal(classifyExternalResponse(403), 'blocked');
  assert.equal(classifyExternalResponse(429), 'blocked');
  assert.equal(classifyExternalResponse(404), 'dead');
  assert.equal(classifyExternalResponse(410), 'dead');
  assert.equal(classifyExternalResponse(503), 'unknown');
});

test('the collector deduplicates links, records pages and leaves Amazon to its own audit', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'external-links-'));
  fs.mkdirSync(path.join(root, 'guide'));
  fs.writeFileSync(path.join(root, 'index.html'), '<a href="https://www.nhs.uk/live-well/">NHS</a><a href="https://amzn.to/example">Amazon</a>');
  fs.writeFileSync(path.join(root, 'guide', 'index.html'), '<a href="https://www.nhs.uk/live-well/#top">NHS again</a>');

  const links = collectExternalLinks(root);
  assert.equal(links.length, 1);
  assert.equal(links[0].url, 'https://www.nhs.uk/live-well/');
  assert.deepEqual(links[0].pages, ['/', '/guide']);
});
