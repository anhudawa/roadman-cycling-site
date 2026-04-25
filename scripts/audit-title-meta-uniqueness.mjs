#!/usr/bin/env node
/**
 * scripts/audit-title-meta-uniqueness.mjs
 *
 * Walk content/blog and content/topics frontmatter and report:
 *   - Duplicate seoTitle values
 *   - Duplicate seoDescription values
 *   - Posts where seoDescription is missing or shorter than 70 chars
 *     (Google typically truncates around 155-160; under 70 leaves
 *     SERP real estate on the table)
 *   - Posts where seoTitle is missing or longer than 60 chars
 *     (Google truncates around 60)
 *
 * Output is human-readable, sorted by most-impactful-first.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
// Topic pages generate metadata server-side from src/lib/topics.ts (see
// src/app/(content)/topics/[slug]/page.tsx $†’ generateMetadata) $€” their MDX
// files intentionally carry no frontmatter, so scanning them would only
// produce false positives.
const SCAN = ["content/blog"];

const titles = new Map(); // seoTitle $†’ [files]
const descs = new Map(); // seoDescription $†’ [files]
const issues = []; // { file, kind, detail }

function trim(s) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

for (const dir of SCAN) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) continue;
  for (const name of fs.readdirSync(full)) {
    if (!name.endsWith(".mdx")) continue;
    const file = path.join(dir, name);
    const raw = fs.readFileSync(path.join(ROOT, file), "utf-8");
    const { data } = matter(raw);
    const seoTitle = trim(data.seoTitle ?? data.title);
    const seoDesc = trim(data.seoDescription);

    if (seoTitle) {
      if (!titles.has(seoTitle)) titles.set(seoTitle, []);
      titles.get(seoTitle).push(file);
    } else {
      issues.push({ file, kind: "missing-title" });
    }

    if (!seoDesc) {
      issues.push({ file, kind: "missing-desc" });
    } else {
      if (!descs.has(seoDesc)) descs.set(seoDesc, []);
      descs.get(seoDesc).push(file);
      if (seoDesc.length < 70) {
        issues.push({ file, kind: "short-desc", detail: `${seoDesc.length} chars` });
      }
      if (seoDesc.length > 165) {
        issues.push({ file, kind: "long-desc", detail: `${seoDesc.length} chars` });
      }
    }

    if (seoTitle && seoTitle.length > 65) {
      issues.push({ file, kind: "long-title", detail: `${seoTitle.length} chars` });
    }
  }
}

const dupTitles = [...titles.entries()].filter(([, v]) => v.length > 1);
const dupDescs = [...descs.entries()].filter(([, v]) => v.length > 1);

console.log("=== Duplicate seoTitle ===");
if (dupTitles.length === 0) console.log("(none)");
for (const [title, files] of dupTitles.sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n  "${title}"`);
  files.forEach((f) => console.log(`    ${f}`));
}

console.log("\n=== Duplicate seoDescription ===");
if (dupDescs.length === 0) console.log("(none)");
for (const [desc, files] of dupDescs.sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n  "${desc.slice(0, 90)}$€¦"`);
  files.forEach((f) => console.log(`    ${f}`));
}

console.log("\n=== Other issues ===");
const grouped = new Map();
for (const i of issues) {
  if (!grouped.has(i.kind)) grouped.set(i.kind, []);
  grouped.get(i.kind).push(i);
}
for (const [kind, list] of grouped) {
  console.log(`\n  [${kind}] (${list.length})`);
  list.slice(0, 30).forEach((i) => {
    console.log(`    ${i.file}${i.detail ? ` $€” ${i.detail}` : ""}`);
  });
  if (list.length > 30) console.log(`    $€¦ and ${list.length - 30} more`);
}

console.log(`\nSummary: ${dupTitles.length} duplicate titles, ${dupDescs.length} duplicate descriptions, ${issues.length} other issues.`);
