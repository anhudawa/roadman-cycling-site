#!/usr/bin/env node
/**
 * scripts/audit-internal-link-density.mjs
 *
 * Counts inbound /blog/<slug> body links across content/blog and reports:
 *   - Orphans (0 inbound links from other posts)
 *   - Near-orphans (1 inbound link)
 *   - Strongest hubs (most-linked-to posts)
 *
 * Inbound link = body-text /blog/<target-slug> reference from a different
 * post. Each (referrer → target) pair is counted at most once even if the
 * referrer links to the target multiple times. The RelatedPosts widget at
 * the bottom of every post is rendered server-side from getRelatedPosts()
 * and is NOT counted here — this audit measures editorial link equity
 * (which Google weights higher), not template-driven sidebar links.
 *
 * Use this to spot:
 *   - Pages that need inbound links to start ranking
 *   - Pillar/hub pages that are accumulating link equity correctly
 *   - Topical gaps where similar posts don't reference each other
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "content/blog");

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));

const inbound = new Map();
const pillarOf = new Map();
for (const f of files) {
  const slug = f.replace(/\.mdx$/, "");
  inbound.set(slug, []);
  const { data } = matter(fs.readFileSync(path.join(DIR, f), "utf-8"));
  pillarOf.set(slug, data.pillar);
}

for (const f of files) {
  const referrer = f.replace(/\.mdx$/, "");
  const { content } = matter(fs.readFileSync(path.join(DIR, f), "utf-8"));
  const re = /\/blog\/([a-z0-9-]+)/g;
  const seen = new Set();
  let m;
  while ((m = re.exec(content)) !== null) {
    const target = m[1];
    if (target === referrer || !inbound.has(target) || seen.has(target)) continue;
    seen.add(target);
    inbound.get(target).push(referrer);
  }
}

const stats = [...inbound.entries()].map(([slug, refs]) => ({
  slug,
  count: refs.length,
  pillar: pillarOf.get(slug),
  refs,
}));

const orphans = stats.filter((s) => s.count === 0);
const near = stats.filter((s) => s.count === 1);
const weak = stats.filter((s) => s.count === 2);
const strong = [...stats].sort((a, b) => b.count - a.count).slice(0, 20);

console.log(`Total posts: ${stats.length}`);
console.log(`Orphans (0 inbound):       ${orphans.length}`);
console.log(`Near-orphans (1 inbound):  ${near.length}`);
console.log(`Weak (2 inbound):          ${weak.length}`);
console.log(`Median inbound: ${stats.sort((a, b) => a.count - b.count)[Math.floor(stats.length / 2)].count}`);

console.log("\n=== Orphans by pillar ===");
const byPillar = new Map();
for (const o of orphans) {
  if (!byPillar.has(o.pillar)) byPillar.set(o.pillar, []);
  byPillar.get(o.pillar).push(o.slug);
}
for (const [pillar, slugs] of [...byPillar.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n  [${pillar}] (${slugs.length})`);
  for (const s of slugs) console.log(`    ${s}`);
}

console.log("\n=== Top 20 hubs (most inbound) ===");
for (const s of strong) {
  console.log(`  ${String(s.count).padStart(3)}  [${s.pillar}] ${s.slug}`);
}
