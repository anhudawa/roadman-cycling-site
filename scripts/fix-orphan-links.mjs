#!/usr/bin/env node
/**
 * scripts/fix-orphan-links.mjs
 *
 * Fixes orphan blog posts (0 inbound internal links) by injecting
 * contextual "Related reading" links at the end of topically related posts.
 *
 * Strategy:
 *   1. Identify all orphan posts (0 inbound internal links from other blog posts)
 *   2. For each orphan, find 2-3 related posts by pillar + keyword overlap
 *   3. Append a contextual "**Related reading:**" line at the end of the
 *      related post's body, linking to the orphan
 *
 * This is additive-only — it never removes existing content.
 * Idempotent: skips injection if the orphan slug is already linked from that post.
 *
 * CLI:
 *   node scripts/fix-orphan-links.mjs          # live run
 *   node scripts/fix-orphan-links.mjs --dry     # preview only
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content/blog");
const DRY_RUN = process.argv.includes("--dry") || process.argv.includes("--dry-run");

// ─── Load all posts ──────────────────────────────────────────────────
function loadPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith(".mdx") && !f.endsWith(".draft.mdx"));
  return files.map(filename => {
    const slug = filename.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
    const { data, content } = matter(raw);
    return {
      slug,
      filename,
      title: String(data.title ?? slug),
      pillar: String(data.pillar ?? ""),
      keywords: Array.isArray(data.keywords) ? data.keywords.map(k => String(k).toLowerCase()) : [],
      primaryHub: String(data.primaryHub ?? ""),
      body: content,
      raw,
    };
  });
}

// ─── Build inbound link map ──────────────────────────────────────────
function buildInboundMap(posts) {
  const inbound = {};
  for (const p of posts) inbound[p.slug] = new Set();

  const LINK_RE = /\]\((\/blog\/([a-zA-Z0-9_-]+))\)/g;
  for (const source of posts) {
    let m;
    LINK_RE.lastIndex = 0;
    while ((m = LINK_RE.exec(source.body)) !== null) {
      const targetSlug = m[2];
      if (targetSlug !== source.slug && inbound[targetSlug]) {
        inbound[targetSlug].add(source.slug);
      }
    }
  }
  return inbound;
}

// ─── Score topical similarity between two posts ──────────────────────
function similarityScore(a, b) {
  let score = 0;
  // Same pillar
  if (a.pillar && a.pillar === b.pillar) score += 3;
  // Same primaryHub
  if (a.primaryHub && a.primaryHub === b.primaryHub) score += 5;
  // Keyword overlap
  const aKw = new Set(a.keywords);
  for (const kw of b.keywords) {
    if (aKw.has(kw)) score += 2;
  }
  // Title word overlap (excluding stop words)
  const STOP = new Set(["the", "a", "an", "and", "or", "for", "of", "to", "in", "on", "is", "it", "as", "at", "by", "you", "your", "its", "my", "how", "why", "what", "when", "that", "this", "with"]);
  const aWords = new Set(a.title.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP.has(w)));
  const bWords = b.title.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP.has(w));
  for (const w of bWords) {
    if (aWords.has(w)) score += 1;
  }
  // Slug substring overlap
  const aParts = new Set(a.slug.split("-").filter(p => p.length > 3));
  const bParts = b.slug.split("-").filter(p => p.length > 3);
  for (const p of bParts) {
    if (aParts.has(p)) score += 1;
  }
  return score;
}

// ─── Find the best place to inject a link ────────────────────────────
// Returns the line index after the last paragraph before the frontmatter end marker.
// We append a "Related reading" block at the very end of the MDX body.
function injectRelatedLink(raw, orphanSlug, orphanTitle) {
  // Split frontmatter from body
  const fmEnd = raw.indexOf("---", raw.indexOf("---") + 3);
  if (fmEnd === -1) return null;

  const frontmatter = raw.slice(0, fmEnd + 3);
  const body = raw.slice(fmEnd + 3);

  // Check if link already exists
  if (body.includes(`/blog/${orphanSlug}`)) return null;

  // Append a related reading block
  const linkLine = `\n\n**Related reading:** [${orphanTitle}](/blog/${orphanSlug})\n`;
  return frontmatter + body.trimEnd() + linkLine;
}

// ─── Main ────────────────────────────────────────────────────────────
function main() {
  const posts = loadPosts();
  const postsBySlug = {};
  for (const p of posts) postsBySlug[p.slug] = p;

  const inbound = buildInboundMap(posts);

  // Find orphans
  const orphans = posts.filter(p => inbound[p.slug].size === 0);
  // Non-orphans with decent body length (good link hosts)
  const nonOrphans = posts.filter(p => inbound[p.slug].size > 0 && p.body.length > 3000);

  console.log(`Total posts: ${posts.length}`);
  console.log(`Orphan posts: ${orphans.length}`);
  console.log(`Candidate link hosts: ${nonOrphans.length}`);
  console.log(`Dry run: ${DRY_RUN}\n`);

  let totalLinksAdded = 0;
  const changes = []; // { hostSlug, orphanSlug }

  for (const orphan of orphans) {
    // Score all non-orphan posts by similarity
    const scored = nonOrphans
      .map(host => ({ host, score: similarityScore(orphan, host) }))
      .filter(s => s.score >= 3) // minimum relevance
      .sort((a, b) => b.score - a.score)
      .slice(0, 2); // link from top 2 hosts

    if (scored.length === 0) {
      // Fallback: same pillar, pick the two longest posts
      const samePillar = nonOrphans
        .filter(h => h.pillar === orphan.pillar)
        .sort((a, b) => b.body.length - a.body.length)
        .slice(0, 2);
      scored.push(...samePillar.map(h => ({ host: h, score: 1 })));
    }

    for (const { host, score } of scored) {
      const hostPath = path.join(BLOG_DIR, host.filename);
      const raw = fs.readFileSync(hostPath, "utf8");

      // Check if already linked
      if (raw.includes(`/blog/${orphan.slug}`)) continue;

      const updated = injectRelatedLink(raw, orphan.slug, orphan.title);
      if (!updated) continue;

      if (!DRY_RUN) {
        fs.writeFileSync(hostPath, updated);
      }

      changes.push({ hostSlug: host.slug, orphanSlug: orphan.slug, score });
      totalLinksAdded++;
      console.log(`  ${host.slug} → ${orphan.slug} (score: ${score})`);
    }
  }

  console.log(`\nTotal links added: ${totalLinksAdded}`);
  console.log(`Orphans now receiving links: ${new Set(changes.map(c => c.orphanSlug)).size}`);

  if (DRY_RUN) {
    console.log("\n[DRY RUN] No files were modified.");
  }
}

main();
