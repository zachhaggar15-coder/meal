import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogPostsData } from '../src/data/blogPosts.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(root, 'src', 'data', 'blogSearchIndex.json');
const records = Object.entries(blogPostsData)
  .map(([slug, post]) => ({
    slug,
    title: post.h1 || post.title,
    description: post.description || '',
    keywords: [post.title, post.h1].filter(Boolean).join(' '),
  }))
  .sort((a, b) => a.slug.localeCompare(b.slug));
const output = `${JSON.stringify(records, null, 2)}\n`;

if (process.argv.includes('--check')) {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
  if (current !== output) {
    console.error('Blog search index is stale. Run npm run generate:blog-index.');
    process.exit(1);
  }
  console.log(`Blog search index is current for ${records.length} guides.`);
} else {
  fs.writeFileSync(outputPath, output);
  console.log(`Wrote ${records.length} guide records to src/data/blogSearchIndex.json.`);
}
