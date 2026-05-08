#!/usr/bin/env node
// Comprehensive internal-link audit per user spec:
//   - Count outbound internal links (blog, podcast, tools, topics, coaching, community, guests, entity, best, event)
//   - Build inbound link map across blog posts
//   - Identify orphans (zero inbound)
//   - Identify under-linked posts (<3 outbound)
//   - Flag posts missing relatedEpisodes frontmatter
//
// Outputs: scripts/audit-output/link-audit.json + link-audit-summary.txt

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content/blog");
const PODCAST_DIR = path.join(ROOT, "content/podcast");

const blogFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
const podcastFiles = fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"));
const blogSlugs = new Set(blogFiles.map((f) => f.replace(/\.mdx$/, "")));
const podcastSlugs = new Set(podcastFiles.map((f) => f.replace(/\.mdx$/, "")));

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { fmRaw: "", body: text, fm: {} };
  const fmRaw = m[1];
  const fm = {};
  // very loose parse: capture top-level scalars and 'list' keys with leading dashes
  const lines = fmRaw.split("\n");
  let currentList = null;
  for (const line of lines) {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && currentList) {
      fm[currentList].push(listItem[1].trim().replace(/^['"]|['"]$/g, ""));
      continue;
    }
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      const val = kv[2].trim();
      if (val === "" || val === ">-" || val === "|") {
        // could be list or block — peek next line
        currentList = null;
        // try to detect list start
        fm[key] = "";
      } else {
        fm[key] = val.replace(/^['"]|['"]$/g, "");
        currentList = null;
      }
      // detect list keys eagerly
      if (val === "") {
        fm[key] = [];
        currentList = key;
      }
    }
  }
  return { fmRaw, body: text.slice(m[0].length), fm };
}

// More robust extraction of relatedEpisodes from frontmatter
function extractRelatedEpisodes(fmRaw) {
  const m = fmRaw.match(/^relatedEpisodes:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (!m) return [];
  return m[1]
    .split("\n")
    .map((l) => l.match(/^\s+-\s+(.+)$/))
    .filter(Boolean)
    .map((m) => m[1].trim().replace(/^['"]|['"]$/g, ""));
}

function extractField(fmRaw, name) {
  // single-line scalar
  const m = fmRaw.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
  return m ? m[1].trim().replace(/^['"]|['"]$/g, "") : "";
}

const LINK_RE = /\]\((\/[a-zA-Z0-9_\-./#?=&%]+)\)|href=["'](\/[a-zA-Z0-9_\-./#?=&%]+)["']/g;

const INTERNAL_PREFIXES = [
  "/blog/",
  "/podcast/",
  "/tools/",
  "/topics/",
  "/coaching",
  "/community",
  "/guests/",
  "/entity/",
  "/best/",
  "/event/",
  "/methodology",
  "/start-here",
  "/glossary",
  "/results",
  "/case-studies",
  "/predict",
  "/plateau",
  "/find-your-fit",
  "/assessment",
  "/benchmarks",
  "/strength-training",
  "/event-prep",
  "/inner-circle",
  "/training-camps",
  "/apps-vs-coaching",
  "/about",
  "/diagnostic",
  "/research",
];

function isInternal(href) {
  for (const p of INTERNAL_PREFIXES) {
    if (href === p || href.startsWith(p + "/") || href.startsWith(p)) return true;
  }
  return false;
}

const posts = {};

for (const file of blogFiles) {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { fmRaw, body } = parseFrontmatter(raw);

  const relatedEpisodes = extractRelatedEpisodes(fmRaw);
  const pillar = extractField(fmRaw, "pillar");
  const title = extractField(fmRaw, "title");
  const publishDate = extractField(fmRaw, "publishDate");
  const primaryHub = extractField(fmRaw, "primaryHub");

  const outbound = new Set();
  const outboundLinks = [];
  let m;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(body)) !== null) {
    const href = (m[1] || m[2]).split("#")[0];
    if (!isInternal(href)) continue;
    if (href.startsWith("/blog/" + slug)) continue; // self link
    outbound.add(href);
    // capture anchor text for [text](href) form
    const idx = m.index;
    let bracketStart = -1;
    for (let i = idx; i >= Math.max(0, idx - 200); i--) {
      if (body[i] === "[") { bracketStart = i; break; }
      if (body[i] === "]") break;
    }
    const text = bracketStart > -1 ? body.slice(bracketStart + 1, idx) : "";
    outboundLinks.push({ href, text });
  }

  // count related episodes as outbound
  for (const ep of relatedEpisodes) {
    outbound.add(`/podcast/${ep}`);
  }

  posts[slug] = {
    slug,
    title,
    pillar,
    publishDate,
    primaryHub,
    bodyLength: body.length,
    relatedEpisodes,
    hasRelatedEpisodes: relatedEpisodes.length > 0,
    outbound,
    outboundLinks,
    inbound: new Set(),
  };
}

// Build inbound across blog posts only
for (const [slug, data] of Object.entries(posts)) {
  for (const href of data.outbound) {
    if (href.startsWith("/blog/")) {
      const target = href.replace("/blog/", "").replace(/\/$/, "");
      if (posts[target]) posts[target].inbound.add(slug);
    }
  }
}

// Categorize and build report
function categorize(outbound) {
  const stats = { blog: 0, podcast: 0, tools: 0, topics: 0, coaching: 0, community: 0, guests: 0, entity: 0, other: 0 };
  for (const h of outbound) {
    if (h.startsWith("/blog/")) stats.blog++;
    else if (h.startsWith("/podcast/")) stats.podcast++;
    else if (h.startsWith("/tools/")) stats.tools++;
    else if (h.startsWith("/topics/")) stats.topics++;
    else if (h === "/coaching" || h.startsWith("/coaching/")) stats.coaching++;
    else if (h === "/community" || h.startsWith("/community/")) stats.community++;
    else if (h.startsWith("/guests/")) stats.guests++;
    else if (h.startsWith("/entity/")) stats.entity++;
    else stats.other++;
  }
  return stats;
}

const report = [];
for (const [, data] of Object.entries(posts)) {
  report.push({
    slug: data.slug,
    pillar: data.pillar,
    title: data.title,
    publishDate: data.publishDate,
    primaryHub: data.primaryHub,
    bodyLength: data.bodyLength,
    outboundTotal: data.outbound.size,
    inboundTotal: data.inbound.size,
    outboundByType: categorize(data.outbound),
    hasRelatedEpisodes: data.hasRelatedEpisodes,
    relatedEpisodes: data.relatedEpisodes,
    inboundFrom: [...data.inbound].sort(),
    outboundLinks: [...data.outbound].sort(),
  });
}

const orphans = report.filter((r) => r.inboundTotal === 0).sort((a, b) => b.bodyLength - a.bodyLength);
const underLinked = report.filter((r) => r.outboundTotal < 3).sort((a, b) => a.outboundTotal - b.outboundTotal);
const missingRelEp = report.filter((r) => !r.hasRelatedEpisodes);

const outDir = path.join(ROOT, "scripts/audit-output");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, "link-audit.json"), JSON.stringify({ report, orphans, underLinked, missingRelEp }, null, 2));

const lines = [];
lines.push("# Internal Link Audit Summary\n");
lines.push(`Total posts: ${report.length}`);
lines.push(`Posts with relatedEpisodes: ${report.filter(r => r.hasRelatedEpisodes).length}`);
lines.push(`Posts missing relatedEpisodes: ${missingRelEp.length}`);
lines.push(`Orphan posts (zero inbound from other blog posts): ${orphans.length}`);
lines.push(`Under-linked posts (<3 outbound internal links): ${underLinked.length}`);
lines.push("");

const byPillar = {};
for (const r of report) {
  const p = r.pillar || "unknown";
  byPillar[p] = byPillar[p] || { count: 0, orphans: 0, underLinked: 0, missingRelEp: 0 };
  byPillar[p].count++;
  if (r.inboundTotal === 0) byPillar[p].orphans++;
  if (r.outboundTotal < 3) byPillar[p].underLinked++;
  if (!r.hasRelatedEpisodes) byPillar[p].missingRelEp++;
}
lines.push("## Pillar distribution");
for (const [p, s] of Object.entries(byPillar)) {
  lines.push(`  - ${p}: total=${s.count} orphans=${s.orphans} underLinked=${s.underLinked} missingRelEp=${s.missingRelEp}`);
}
lines.push("");

lines.push("## Posts missing relatedEpisodes");
for (const r of missingRelEp) {
  lines.push(`  - ${r.slug} [${r.pillar || "?"}]`);
}
lines.push("");

lines.push("## Orphan posts (zero inbound) — sorted by body length desc");
for (const o of orphans) {
  lines.push(`  - ${o.slug} [${o.pillar || "?"}] outbound=${o.outboundTotal} bodyLen=${o.bodyLength}`);
}
lines.push("");

lines.push("## Under-linked posts (<3 outbound) — sorted by outbound asc");
for (const u of underLinked) {
  lines.push(`  - ${u.slug} [${u.pillar || "?"}] outbound=${u.outboundTotal} inbound=${u.inboundTotal} hasRelEp=${u.hasRelatedEpisodes}`);
}
lines.push("");

fs.writeFileSync(path.join(outDir, "link-audit-summary.txt"), lines.join("\n"));
console.log(lines.join("\n"));
console.log(`\nDetailed JSON: scripts/audit-output/link-audit.json`);
