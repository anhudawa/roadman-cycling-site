#!/usr/bin/env node
// Emit a slug -> {title, pillar, tags, keywords} index for all blog posts.
// Used to build natural blog-to-blog cross-link suggestions.

import fs from "node:fs";
import path from "node:path";

const BLOG_DIR = path.resolve(process.cwd(), "content/blog");

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return "";
  return m[1];
}

function extractList(fm, name) {
  const re = new RegExp(`^${name}:\\s*\\n((?:\\s{2,}-\\s*[^\\n]+\\n?)+)`, "m");
  const m = fm.match(re);
  if (!m) return [];
  return [...m[1].matchAll(/\s{2,}-\s*['"]?([^'"\n]+?)['"]?\s*$/gm)].map(
    (x) => x[1].trim()
  );
}

function extractScalar(fm, name) {
  const m = fm.match(new RegExp(`^${name}:\\s*['"]?([^'"\\n]+?)['"]?\\s*$`, "m"));
  return m ? m[1].trim() : "";
}

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx")).sort();

const index = {};
for (const file of files) {
  const slug = file.replace(/\.mdx$/, "");
  const text = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
  const fm = parseFrontmatter(text);
  index[slug] = {
    title: extractScalar(fm, "title"),
    pillar: extractScalar(fm, "pillar"),
    tags: extractList(fm, "tags"),
    keywords: extractList(fm, "keywords"),
  };
}

const action = process.argv[2] || "all";
if (action === "all") {
  console.log(JSON.stringify(index, null, 2));
} else if (action === "by-pillar") {
  const grouped = {};
  for (const [slug, info] of Object.entries(index)) {
    const p = info.pillar || "unknown";
    grouped[p] = grouped[p] || [];
    grouped[p].push({ slug, title: info.title, tags: info.tags });
  }
  console.log(JSON.stringify(grouped, null, 2));
} else if (action === "compact") {
  // slug -> short string for quick LLM consumption
  const out = {};
  for (const [slug, info] of Object.entries(index)) {
    out[slug] = `${info.pillar} | ${info.title} | tags: ${info.tags.join(", ")}`;
  }
  console.log(JSON.stringify(out, null, 2));
}
