import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOG_CATEGORIES } from '../src/data/blogCategories.js';
import { blogPostsData } from '../src/data/blogPosts.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(root, 'src', 'data', 'blogSearchIndex.json');
const categoryBySlug = new Map();

for (const [categoryOrder, category] of BLOG_CATEGORIES.entries()) {
  for (const [articleOrder, slug] of category.slugs.entries()) {
    if (categoryBySlug.has(slug)) {
      throw new Error(`Blog category map lists ${slug} more than once.`);
    }
    categoryBySlug.set(slug, { category: category.label, categoryOrder, articleOrder });
  }
}

const uncategorised = Object.keys(blogPostsData).filter(slug => !categoryBySlug.has(slug));
const unknown = [...categoryBySlug.keys()].filter(slug => !blogPostsData[slug]);
if (uncategorised.length || unknown.length) {
  throw new Error([
    uncategorised.length ? `Uncategorised articles: ${uncategorised.join(', ')}` : '',
    unknown.length ? `Unknown category slugs: ${unknown.join(', ')}` : '',
  ].filter(Boolean).join('\n'));
}

const records = Object.entries(blogPostsData)
  .map(([slug, post]) => {
    const position = categoryBySlug.get(slug);
    return {
      slug,
      title: post.h1 || post.title,
      description: post.description || '',
      keywords: [post.title, post.h1].filter(Boolean).join(' '),
      category: position.category,
      imageId: slug,
      published: post.published || '',
      reviewed: post.reviewed || '',
      categoryOrder: position.categoryOrder,
      articleOrder: position.articleOrder,
    };
  })
  .sort((a, b) => a.categoryOrder - b.categoryOrder || a.articleOrder - b.articleOrder)
  .map(({ categoryOrder: _categoryOrder, articleOrder: _articleOrder, ...record }) => record);
const output = `${JSON.stringify(records, null, 2)}\n`;

if (process.argv.includes('--check')) {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
  // Git may check this generated JSON out with CRLF on Windows. Compare the
  // content after normalising line endings so a clean cross-platform checkout
  // does not report a false stale-index failure.
  if (current.replace(/\r\n/g, '\n') !== output) {
    console.error('Blog search index is stale. Run npm run generate:blog-index.');
    process.exit(1);
  }
  console.log(`Blog search index is current for ${records.length} guides.`);
} else {
  fs.writeFileSync(outputPath, output);
  console.log(`Wrote ${records.length} guide records to src/data/blogSearchIndex.json.`);
}
