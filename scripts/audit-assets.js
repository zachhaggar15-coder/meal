#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  SITE_ORIGIN,
  distRoot,
} from './lib/crawlDist.js';
import { writeAuditJson } from './lib/auditOutput.js';

if (!fs.existsSync(distRoot)) {
  console.error('Asset audit requires dist/. Run npm run build first.');
  process.exit(1);
}

const files = findFiles(distRoot).filter(file => !isSsrFile(file));
const references = [];

for (const file of files) {
  const extension = path.extname(file).toLowerCase();
  if (!['.html', '.css', '.json', '.webmanifest'].includes(extension)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const source = path.relative(distRoot, file).split(path.sep).join('/');

  if (extension === '.html') {
    for (const match of content.matchAll(/\b(?:src|href|poster|content)=["']([^"']+)["']/gi)) {
      addReference(references, source, match[1]);
    }
    for (const match of content.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
      for (const candidate of match[1].split(',')) {
        addReference(references, source, candidate.trim().split(/\s+/)[0]);
      }
    }
  }

  for (const match of content.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    addReference(references, source, match[1]);
  }

  if (['.json', '.webmanifest'].includes(extension)) {
    for (const match of content.matchAll(/["'](?:src|url)["']\s*:\s*["']([^"']+)["']/gi)) {
      addReference(references, source, match[1]);
    }
  }
}

const checked = references.map(reference => {
  const resolved = resolveReference(reference.source, reference.value);
  return {
    ...reference,
    resolved,
    exists: resolved ? fs.existsSync(path.join(distRoot, resolved)) : true,
  };
});
const broken = checked.filter(item => item.invalid || (item.resolved && !item.exists));
const assetFiles = files
  .filter(file => isAssetFile(file))
  .map(file => ({
    file: path.relative(distRoot, file).split(path.sep).join('/'),
    bytes: fs.statSync(file).size,
  }))
  .sort((left, right) => right.bytes - left.bytes);

const report = {
  generatedAt: new Date().toISOString(),
  coverage: {
    sourceFilesChecked: files.length,
    localAssetReferences: checked.filter(item => item.resolved).length,
    distinctLocalAssets: new Set(checked.map(item => item.resolved).filter(Boolean)).size,
    emittedAssetFiles: assetFiles.length,
    exhaustive: true,
  },
  thresholds: {
    brokenLocalAssetReferences: 0,
  },
  broken,
  largestAssets: assetFiles.slice(0, 50),
};
const reportPath = writeAuditJson('broken-assets.json', report);

if (broken.length) {
  console.error(`Asset audit failed: ${broken.length} broken local reference(s).`);
  broken.slice(0, 50).forEach(item => console.error(`- ${item.source}: ${item.value} -> ${item.resolved}`));
  process.exit(1);
}

console.log(
  `Asset audit passed: ${report.coverage.localAssetReferences} local references across ` +
  `${report.coverage.sourceFilesChecked} emitted files; report: ${reportPath}`,
);

function addReference(output, source, rawValue) {
  const value = decode(String(rawValue || '').trim());
  if (!value || value.startsWith('#') || /^(?:data|blob|mailto|tel|javascript):/i.test(value)) return;
  let url;
  try {
    url = new URL(value, `${SITE_ORIGIN}/${source}`);
  } catch {
    output.push({ source, value, invalid: true });
    return;
  }
  if (url.origin !== SITE_ORIGIN) return;
  if (!hasAssetExtension(url.pathname)) return;
  output.push({ source, value });
}

function resolveReference(source, value) {
  try {
    const basePath = source.endsWith('.html')
      ? source.replace(/[^/]+$/, '')
      : path.posix.dirname(source);
    const baseUrl = `${SITE_ORIGIN}/${basePath ? `${basePath.replace(/\/$/, '')}/` : ''}`;
    const url = new URL(value, baseUrl);
    return decodeURIComponent(url.pathname).replace(/^\/+/, '');
  } catch {
    return '';
  }
}

function hasAssetExtension(value) {
  return /\.(?:avif|css|gif|ico|jpe?g|js|json|png|svg|webmanifest|webp|woff2?|xml)$/i.test(value);
}

function isAssetFile(file) {
  return hasAssetExtension(file) && !file.endsWith('.html') && !file.endsWith('.xml');
}

function isSsrFile(file) {
  return path.relative(distRoot, file).split(path.sep)[0] === 'ssr';
}

function findFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findFiles(fullPath);
    return entry.isFile() ? [fullPath] : [];
  });
}

function decode(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");
}
