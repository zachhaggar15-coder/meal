import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const blogSource = fs.readFileSync(path.join(root, 'src/pages/Blog.jsx'), 'utf8');
const index = JSON.parse(fs.readFileSync(path.join(root, 'src/data/blogSearchIndex.json'), 'utf8'));

// The acceptance criterion for this page is reachability, not height. /blog was
// not failing because it was long - 5,249 impressions for 3 clicks at position
// 33 is a relevance problem - so a pixel count would have measured the wrong
// thing.
test('every article is reachable in two interactions: open its category, click the card', () => {
  const categories = new Set(index.map(post => post.category));
  assert.ok(categories.size > 1, 'articles must be grouped, or there is nothing to open');
  for (const post of index) {
    assert.ok(post.category, `${post.slug} has no category, so it would be unreachable`);
  }
  assert.match(blogSource, /<details/, 'categories must be disclosure sections');
  assert.match(blogSource, /open=\{categoryIndex === 0\}/, 'the first category stays open so the page still shows guides on arrival');
});

test('collapsing a category must not remove its links from the served HTML', () => {
  // <details> keeps its children in the DOM when closed, which is the whole
  // reason it was chosen over conditional rendering: the page already earns
  // impressions and cannot afford to hide 153 internal links from a crawler.
  assert.doesNotMatch(
    blogSource,
    /\{\s*isOpen\s*&&|\{\s*open\s*&&|useState\([^)]*\)[\s\S]{0,200}?&&\s*<div className="blog-card-grid"/,
    'links must never be conditionally rendered out of the markup',
  );
  assert.match(blogSource, /BLOG_CATEGORY_GROUPS\.map/);
  assert.match(blogSource, /category\.posts\.map/);
});

test('the listing renders one link per indexed article and no duplicates', () => {
  const slugs = index.map(post => post.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slugs would render duplicate links');
  assert.ok(slugs.length >= 150, `expected the full corpus, got ${slugs.length}`);
  assert.match(blogSource, /to=\{`\/blog\/\$\{post\.slug\}`\}/);
});

test('each category states how many guides it holds, so a closed row still informs', () => {
  assert.match(blogSource, /category\.posts\.length/);
});
