import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const auditArtifactsDir = path.join(root, 'audit-artifacts');

export function writeAuditJson(filename, data) {
  fs.mkdirSync(auditArtifactsDir, { recursive: true });
  const outputPath = path.join(auditArtifactsDir, filename);
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
  return outputPath;
}
