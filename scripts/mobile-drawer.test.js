import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sidebar = readFileSync(new URL('../src/components/Sidebar.jsx', import.meta.url), 'utf8');
const sidebarCss = readFileSync(new URL('../src/components/Sidebar.css', import.meta.url), 'utf8');

test('the mobile drawer traps focus and provides keyboard escape', () => {
  assert.match(sidebar, /event\.key === 'Escape'/);
  assert.match(sidebar, /event\.key !== 'Tab'/);
  assert.match(sidebar, /drawer\?\.contains\(document\.activeElement\)/);
  assert.match(sidebar, /closeButtonRef\.current\?\.focus\(\)/);
});

test('the mobile drawer restores focus and isolates the page behind it', () => {
  assert.match(sidebar, /mainContent\?\.setAttribute\('inert', ''\)/);
  assert.match(sidebar, /mainContent\?\.removeAttribute\('inert'\)/);
  assert.match(sidebar, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(sidebar, /document\.body\.style\.overflow = previousBodyOverflow/);
  assert.match(sidebar, /returnFocus\.focus\(\)/);
});

test('the mobile drawer includes search and closes after navigation', () => {
  assert.match(sidebar, /id="sidebar-site-search"/);
  assert.match(sidebar, /className="site-search--sidebar"/);
  assert.match(sidebar, /onNavigate=\{onClose\}/);
  assert.match(sidebarCss, /@media \(max-width: 999px\)/);
  assert.match(sidebarCss, /\.sidebar-search-wrap\s*{\s*display: block;/);
});
