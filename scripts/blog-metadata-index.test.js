import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { BLOG_CATEGORIES } from '../src/data/blogCategories.js';
import { blogPostsData } from '../src/data/blogPosts.js';

const index = JSON.parse(fs.readFileSync('src/data/blogSearchIndex.json', 'utf8'));

test('the lightweight blog index covers every article exactly once', () => {
  const indexedSlugs = index.map(post => post.slug);
  assert.equal(new Set(indexedSlugs).size, indexedSlugs.length, 'duplicate blog metadata slugs');
  assert.deepEqual(
    indexedSlugs.toSorted(),
    Object.keys(blogPostsData).toSorted(),
    'the blog metadata index must match the full article corpus',
  );
});

test('every blog listing record carries category, image and date metadata', () => {
  const categorySlugs = BLOG_CATEGORIES.flatMap(category => category.slugs);
  assert.deepEqual(categorySlugs, index.map(post => post.slug), 'generated order must stay editorial');

  for (const post of index) {
    const source = blogPostsData[post.slug];
    assert.ok(post.category, `${post.slug} has no category`);
    assert.equal(post.imageId, post.slug, `${post.slug} has no stable image identifier`);
    assert.equal(post.title, source.h1 || source.title);
    assert.equal(post.description, source.description || '');
    assert.equal(post.published, source.published || '');
    assert.equal(post.reviewed, source.reviewed || '');
  }
});

test('the blog listing does not import full article bodies', () => {
  const source = fs.readFileSync('src/pages/Blog.jsx', 'utf8');
  assert.match(source, /blogSearchIndex\.json/);
  assert.doesNotMatch(source, /from ['"]\.\.\/data\/blogPosts\.js['"]/);
  assert.doesNotMatch(source, /blogPostsData/);
});
