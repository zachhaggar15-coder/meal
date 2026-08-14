// A small, permanent record of which commit was deployed when, so QA
// history can be read against "was this fix actually live yet" rather than
// just "when did the fix land in the repo". Deliberately separate from
// docs/semantic-qa/history.json (which is the weekly-sample run log) and
// findings-ledger.json (which is per-finding QA state) — this is neither,
// it's a deploy timeline. Same committed-JSON pattern as the rest of the
// QA tooling in this repo.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');

export const QA_DEPLOYMENT_LOG_PATH = path.join(rootDir, 'docs', 'semantic-qa', 'deployment-log.json');

export function readDeploymentLog(filePath = QA_DEPLOYMENT_LOG_PATH) {
  if (!fs.existsSync(filePath)) return { version: 1, deployments: [] };
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return { version: 1, deployments: Array.isArray(parsed.deployments) ? parsed.deployments : [] };
  } catch {
    return { version: 1, deployments: [] };
  }
}

export function writeDeploymentLog(log, filePath = QA_DEPLOYMENT_LOG_PATH) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(log, null, 2)}\n`, 'utf8');
}

export function recordDeployment(log, { commit, deployedAt = new Date(), summary = '', gate = '' }) {
  if (!commit) throw new Error('recordDeployment requires a commit hash.');
  const entry = {
    commit,
    deployedAt: new Date(deployedAt).toISOString(),
    summary,
    gate,
  };
  return { ...log, deployments: [...(log.deployments || []), entry] };
}
