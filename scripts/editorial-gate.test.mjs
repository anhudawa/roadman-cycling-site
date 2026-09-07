import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fingerprint, check, sha256, approvalText, EDITOR_ID, REPOSITORY } from './editorial-gate.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'roadman-editorial-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const dir of ['content', 'src', 'public', 'editorial']) mkdirSync(join(root, dir));
  const write = (path, value) => writeFileSync(join(root, path), typeof value === 'string' ? value : JSON.stringify(value));
  write('content/article.mdx', 'Original published article.');
  write('editorial/baseline.json', { contentDigest: fingerprint(root).digest });
  return { root, write };
}
function prepare(f) {
  f.write('content/article.mdx', 'Changed article requiring editorial review.');
  const digest = fingerprint(f.root).digest;
  const detail = 'Concrete review evidence describing what the reader learns.';
  const review = { version: 1, contentDigest: digest, scope: detail,
    sections: [{ location: 'Article: strength session section', readerQuestion: detail, usefulAnswer: detail, evidence: detail, editorialDecision: detail }],
    claimsAndSources: detail, examplesAndReasoning: detail, voiceAndCuts: detail,
    desktopReview: detail, mobileReview: detail, productAndOfferAccuracy: detail };
  const save = () => f.write('editorial/release.json', review);
  save();
  f.write('editorial/approval.json', { commentId: 123, pullRequest: 456 });
  const comment = { user: { id: EDITOR_ID, type: 'User' }, issue_url: `https://api.github.com/repos/${REPOSITORY}/issues/456`, body: approvalText(digest, sha256(JSON.stringify(review))) };
  const fetcher = async () => ({ ok: true, json: async () => comment });
  return { review, save, comment, fetcher };
}
test('unchanged frozen content builds without a network call', async t => {
  const f = fixture(t);
  assert.match(await check(f.root, { fetcher: () => { throw Error('unexpected network'); } }), /not an editorial endorsement/);
});
for (const kind of ['edit', 'addition', 'deletion', 'component', 'asset']) test(`${kind} cannot publish without review`, async t => {
  const f = fixture(t);
  if (kind === 'deletion') rmSync(join(f.root, 'content/article.mdx'));
  else f.write(kind === 'addition' ? 'content/new.mdx' : kind === 'component' ? 'src/Card.tsx' : kind === 'asset' ? 'public/chart.svg' : 'content/article.mdx', 'Changed public content');
  await assert.rejects(check(f.root), /no editorial review/);
});
test('preview is available but explicitly unapproved', async t => {
  const f = fixture(t); f.write('src/page.tsx', 'New page');
  assert.match(await check(f.root, { production: false }), /PREVIEW ONLY/);
  await assert.rejects(check(f.root), /Publication blocked/);
});
test('verified approval binds both content and review evidence', async t => {
  const f = fixture(t), p = prepare(f);
  assert.match(await check(f.root, p), /approval verified/);
  p.review.voiceAndCuts += ' A later change to the review.'; p.save();
  await assert.rejects(check(f.root, p), /different content\/review evidence/);
});
test('edits after approval invalidate the review', async t => {
  const f = fixture(t), p = prepare(f); f.write('content/article.mdx', 'Unreviewed rewrite');
  await assert.rejects(check(f.root, p), /does not match/);
});
test('missing section evidence is rejected', async t => {
  const f = fixture(t), p = prepare(f); p.review.sections[0].usefulAnswer = 'TODO'; p.save();
  await assert.rejects(check(f.root, p), /Missing review evidence/);
});
for (const kind of ['wrong editor', 'bot', 'wrong PR', 'revoked']) test(`${kind} cannot authorize publication`, async t => {
  const f = fixture(t), p = prepare(f);
  if (kind === 'wrong editor') p.comment.user.id = 999;
  if (kind === 'bot') p.comment.user.type = 'Bot';
  if (kind === 'wrong PR') p.comment.issue_url += '9';
  if (kind === 'revoked') p.comment.body = 'REVOKED';
  await assert.rejects(check(f.root, p), /Approval/);
});
test('GitHub unavailable fails closed', async t => {
  const f = fixture(t); prepare(f);
  await assert.rejects(check(f.root, { fetcher: async () => ({ ok: false, status: 403 }) }), /publication blocked/);
  await assert.rejects(check(f.root, { fetcher: async () => { throw Error('network unavailable'); } }), /network unavailable/);
});
test('test-only edits do not require a content approval', async t => {
  const f = fixture(t); f.write('src/page.test.tsx', 'A technical test');
  assert.match(await check(f.root), /Existing content freeze/);
});
test('symlinks cannot hide external build inputs', t => {
  const f = fixture(t); symlinkSync(join(f.root, 'content/article.mdx'), join(f.root, 'src/hidden.ts'));
  assert.throws(() => fingerprint(f.root), /symlink/);
});
