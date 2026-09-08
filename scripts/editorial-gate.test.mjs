import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fingerprint, check, sha256, controlDigest, CONTROL_FILES, REQUIRED_CHECKS } from './editorial-gate.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'roadman-editorial-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const dir of ['content', 'src', 'public', 'editorial', 'scripts', '.github/workflows', 'docs']) mkdirSync(join(root, dir), { recursive: true });
  for (const path of CONTROL_FILES) writeFileSync(join(root, path), 'Fixture control');
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
  const qa = {version: 1, reviewer: 'Codex', decision: 'publish', reviewedAt: '2026-09-08T10:00:00Z', contentDigest: digest, reviewHash: sha256(JSON.stringify(review)), controlsHash: controlDigest(f.root), blockers: [], checks: Object.fromEntries(REQUIRED_CHECKS.map(name => [name, {status: 'pass', evidence: detail, ...(['desktop', 'mobile'].includes(name) ? {pages: [{url: 'https://preview.example.com/page', width: name === 'mobile' ? 390 : 1280, height: 844, observations: detail}]} : {})}]))};
  const saveQA = () => f.write('editorial/qa.json', qa);
  saveQA();
  return { review, save, qa, saveQA };

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
test('agent QA binds content, review and controls', async t => {
  const f = fixture(t), p = prepare(f);
  assert.match(await check(f.root), /Final agent QA verified/);
  p.review.voiceAndCuts += ' A later change to review evidence.'; p.save();
  await assert.rejects(check(f.root), /QA is stale/);
});
test('changed controls invalidate QA', async t => {
  const f = fixture(t); prepare(f); f.write('package.json', 'Changed build wiring');
  await assert.rejects(check(f.root), /QA is stale/);
});
test('Vercel config formatting does not invalidate QA', async t => {
  const f = fixture(t);
  const config = { buildCommand: 'npm run build', crons: [{ path: '/api/cron/example', schedule: '0 8 * * *' }] };
  f.write('vercel.json', JSON.stringify(config, null, 2));
  prepare(f);
  f.write('vercel.json', `${JSON.stringify(config)}\n`);
  assert.match(await check(f.root), /Final agent QA verified/);
});
test('edits after QA invalidate the review', async t => {
  const f = fixture(t); prepare(f); f.write('content/article.mdx', 'Unreviewed rewrite');
  await assert.rejects(check(f.root), /does not match/);
});
test('missing section evidence is rejected', async t => {
  const f = fixture(t), p = prepare(f); p.review.sections[0].usefulAnswer = 'TODO'; p.save();
  await assert.rejects(check(f.root), /Missing review evidence/);
});
for (const name of REQUIRED_CHECKS) for (const status of ['pending', 'fail', 'skipped', undefined]) test(`${name} ${status} blocks production`, async t => {
  const f = fixture(t), p = prepare(f); p.qa.checks[name].status = status; p.saveQA();
  await assert.rejects(check(f.root), /incomplete or failed/);
});
for (const kind of ['missing record', 'blocker', 'false completion', 'wrong reviewer', 'wrong decision', 'missing page', 'fake mobile viewport', 'missing desktop viewport', 'incomplete review']) test(`${kind} blocks publication`, async t => {
  const f = fixture(t), p = prepare(f);
  if (kind === 'missing record') { rmSync(join(f.root, 'editorial/qa.json')); await assert.rejects(check(f.root), /missing/); return; }
  if (kind === 'blocker') p.qa.blockers.push('Unresolved broken CTA');
  if (kind === 'false completion') p.qa.checks.mobile.evidence = 'Mobile review not yet complete because browser unavailable.';
  if (kind === 'wrong reviewer') p.qa.reviewer = 'Anthony';
  if (kind === 'wrong decision') p.qa.decision = 'preview';
  if (kind === 'missing page') p.qa.checks.mobile.pages = [];
  if (kind === 'fake mobile viewport') p.qa.checks.mobile.pages[0].width = 1280;
  if (kind === 'missing desktop viewport') delete p.qa.checks.desktop.pages[0].height;
  if (kind === 'incomplete review') {p.review.mobileReview = 'Mobile review pending; source inspection only performed.'; p.save(); p.qa.reviewHash = sha256(JSON.stringify(p.review));}
  p.saveQA(); await assert.rejects(check(f.root));
});
test('preview remains available while QA is incomplete', async t => {
  const f = fixture(t); prepare(f); rmSync(join(f.root, 'editorial/qa.json'));
  assert.match(await check(f.root, { production: false }), /PREVIEW ONLY/);
  await assert.rejects(check(f.root), /missing/);
});
test('test-only edits do not require a content approval', async t => {
  const f = fixture(t); f.write('src/page.test.tsx', 'A technical test');
  assert.match(await check(f.root), /Existing content freeze/);
});
test('symlinks cannot hide external build inputs', t => {
  const f = fixture(t); symlinkSync(join(f.root, 'content/article.mdx'), join(f.root, 'src/hidden.ts'));
  assert.throws(() => fingerprint(f.root), /symlink/);
});
