import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPOSITORY = 'anhudawa/roadman-cycling-site';
export const EDITOR_ID = 209098968;
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

export function approvalText(digest, reviewHash) {
  return `APPROVE ROADMAN EDITORIAL ${digest} ${reviewHash}`;
}

export function validateApproval(comment, expected, pullRequest) {
  if (comment.user?.id !== EDITOR_ID || comment.user?.type !== 'User') throw new Error('Approval is not from the designated Roadman editor.');
  if (comment.issue_url !== `https://api.github.com/repos/${REPOSITORY}/issues/${pullRequest}`) throw new Error('Approval belongs to a different review.');
  if (comment.body?.trim() !== expected) throw new Error('Approval is missing, revoked, or for different content/review evidence.');
}

export async function check(root, { production = true, fetcher = fetch } = {}) {
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
  const expected = approvalText(current.digest, sha256(reviewBytes));
  if (!production) return `PREVIEW ONLY. Required editor comment after reviewing the rendered pages:\n${expected}`;
  const approval = JSON.parse(readFileSync(resolve(root, 'editorial/approval.json'), 'utf8'));
  if (!Number.isSafeInteger(approval.commentId) || approval.commentId <= 0 || !Number.isSafeInteger(approval.pullRequest) || approval.pullRequest <= 0) throw new Error('A real GitHub editorial approval is required.');
  const response = await fetcher(`https://api.github.com/repos/${REPOSITORY}/issues/comments/${approval.commentId}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Roadman-editorial-gate' },
    signal: AbortSignal.timeout(15000),
    redirect: 'error',
  });
  if (!response.ok) throw new Error(`Could not verify editorial approval (GitHub ${response.status}); publication blocked.`);
  validateApproval(await response.json(), expected, approval.pullRequest);
  return `Editorial approval verified for ${current.digest}.`;
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
