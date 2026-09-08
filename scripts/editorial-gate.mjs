import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOTS = ['content', 'src', 'public'];
export const sha256 = value => createHash('sha256').update(value).digest('hex');

// Read the build inputs themselves. No git history, deployment secret, or mutable
// "last successful build" is needed. New files and deletions change the digest.
export function fingerprint(root) {
  const files = [];
  function walk(dir) {
    for (const entry of readdirSync(resolve(root, dir), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isSymbolicLink()) throw new Error(`Unreviewable symlink: ${path}`);
      if (entry.isDirectory()) { walk(path); continue; }
      if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(path)) continue;
      files.push([path, sha256(readFileSync(resolve(root, path)))]);
    }
  }
  for (const dir of ROOTS) walk(dir);
  files.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  return { digest: sha256(JSON.stringify(files)), count: files.length };
}

function substantive(value, label) {
  if (typeof value !== 'string' || value.trim().length < 20 || /\b(TODO|TBD|lorem ipsum|fill this in)\b/i.test(value)) {
    throw new Error(`Missing review evidence: ${label}`);
  }
}

export function validateReview(review, digest) {
  if (review.version !== 1 || review.contentDigest !== digest) throw new Error('Review does not match the current content. Prepare a new review.');
  substantive(review.scope, 'scope');
  if (!Array.isArray(review.sections) || !review.sections.length) throw new Error('Review each changed section.');
  for (const section of review.sections) {
    for (const key of ['location', 'readerQuestion', 'usefulAnswer', 'evidence', 'editorialDecision']) substantive(section[key], key);
  }
  for (const key of ['claimsAndSources', 'examplesAndReasoning', 'voiceAndCuts', 'desktopReview', 'mobileReview', 'productAndOfferAccuracy']) substantive(review[key], key);
  // This validates a review record, not the quality or truth of its prose.
}

export const REQUIRED_CHECKS = ['claims', 'editorial', 'offers', 'desktop', 'mobile', 'interactions', 'seo', 'technical'];
export const CONTROL_FILES = ['scripts/editorial-gate.mjs', 'scripts/editorial-gate.test.mjs', '.github/workflows/editorial-gate.yml', 'package.json', 'vercel.json', 'next.config.ts', 'AGENTS.md', 'docs/editorial-publishing-standard.md'];
export function controlDigest(root) {
  return sha256(JSON.stringify(CONTROL_FILES.map(path => [path, sha256(readFileSync(resolve(root, path)))])));
}
export function validateQA(qa, digest, reviewHash, controlsHash) {
  if (qa.version !== 1 || qa.reviewer !== 'Codex' || qa.decision !== 'publish') throw new Error('Final agent QA sign-off is required.');
  if (qa.contentDigest !== digest || qa.reviewHash !== reviewHash || qa.controlsHash !== controlsHash) throw new Error('QA is stale: content, review or publication controls changed.');
  if (!Number.isFinite(Date.parse(qa.reviewedAt))) throw new Error('QA needs a real review date.');
  if (!Array.isArray(qa.blockers) || qa.blockers.length) throw new Error('Unresolved release blockers.');
  for (const name of REQUIRED_CHECKS) {
    const result = qa.checks?.[name];
    if (result?.status !== 'pass') throw new Error(`QA check incomplete or failed: ${name}`);
    substantive(result.evidence, `${name} evidence`);
    if (/\b(pending|not yet complete|not completed|not performed|not tested|not reviewed|not verified|unverified|blocked|TODO|TBD)\b/i.test(result.evidence)) throw new Error(`Incomplete QA evidence: ${name}`);
    if (['desktop', 'mobile'].includes(name)) {
      if (!Array.isArray(result.pages) || !result.pages.length) throw new Error(`Missing rendered pages: ${name}`);
      for (const page of result.pages) {
        if (typeof page.url !== 'string' || !/^https?:\/\//.test(page.url)) throw new Error(`Missing rendered URL: ${name}`);
        if (!Number.isInteger(page.width) || !Number.isInteger(page.height) || page.height < 200 || (name === 'mobile' ? page.width < 320 || page.width > 480 : page.width < 1000)) throw new Error(`Invalid actual viewport: ${name}`);
        substantive(page.observations, `${name} page observations`);
      }
    }
  }
}

export async function check(root, { production = true } = {}) {
  const current = fingerprint(root);
  const baseline = JSON.parse(readFileSync(resolve(root, 'editorial/baseline.json'), 'utf8'));
  if (current.digest === baseline.contentDigest) return `Existing content freeze: ${current.count} files. This is not an editorial endorsement of the archive.`;
  const reviewPath = resolve(root, 'editorial/release.json');
  if (!existsSync(reviewPath)) {
    if (!production) return `PREVIEW ONLY: editorial review and approval required for ${current.digest}`;
    throw new Error(`Publication blocked: changed content has no editorial review. Digest: ${current.digest}`);
  }
  const reviewBytes = readFileSync(reviewPath, 'utf8');
  const review = JSON.parse(reviewBytes);
  validateReview(review, current.digest);
  if (!production) return `PREVIEW ONLY: final agent QA required for ${current.digest}`;
  for (const key of ['desktopReview', 'mobileReview']) {
    if (/\b(pending|not yet complete|not completed|not performed|not tested|not reviewed)\b/i.test(review[key])) throw new Error(`Incomplete rendered review: ${key}`);
  }
  const qaPath = resolve(root, 'editorial/qa.json');
  if (!existsSync(qaPath)) throw new Error('Publication blocked: final agent QA record is missing.');
  validateQA(JSON.parse(readFileSync(qaPath, 'utf8')), current.digest, sha256(reviewBytes), controlDigest(root));
  return `Final agent QA verified for ${current.digest}.`;

}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = process.cwd();
    if (process.argv.includes('--fingerprint')) console.log(JSON.stringify(fingerprint(root), null, 2));
    else console.log(await check(root, { production: process.env.VERCEL_ENV !== 'preview' }));
  } catch (error) {
    console.error(`EDITORIAL GATE: ${error.message}`);
    process.exitCode = 1;
  }
}
