// PR 12 was reduced to instrumentation only. The desktop navigation redesign it
// originally proposed was rejected: at roughly 41 clicks/day there is no
// statistical power for a navigation A/B, so the redesign was a hunch. This
// ships the measurement and nothing else, so the question can be answered with
// data later.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const navbar = fs.readFileSync(path.join(root, 'src/components/Navbar.jsx'), 'utf8');
const sidebar = fs.readFileSync(path.join(root, 'src/components/Sidebar.jsx'), 'utf8');
const tracking = fs.readFileSync(path.join(root, 'src/components/ClickTracking.jsx'), 'utf8');

test('both navigation surfaces emit the same event under different locations', () => {
  assert.match(navbar, /data-event="nav_link_clicked"/);
  assert.match(sidebar, /data-event="nav_link_clicked"/);
  assert.match(navbar, /data-cta-location="top_nav"/);
  assert.match(sidebar, /data-cta-location="sidebar"/);
});

test('each navigation link reports where it was going', () => {
  assert.match(navbar, /data-target-route=\{tab\.to\}/);
  assert.match(sidebar, /data-target-route=\{item\.to\}/);
});

test('the existing click tracker already forwards these fields, so nothing new is needed', () => {
  assert.match(tracking, /cta_location: target\.dataset\.ctaLocation/);
  assert.match(tracking, /target_route: target\.dataset\.targetRoute/);
  assert.match(tracking, /'a\[href\], \[data-event\]'/);
});
