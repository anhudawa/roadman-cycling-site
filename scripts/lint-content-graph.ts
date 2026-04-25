/**
 * scripts/lint-content-graph.ts
 *
 * Content-graph linter — enforces minimum cross-linking and CTA
 * density across all blog posts. Run as a CI check or pre-push audit.
 *
 * Rules:
 *   - Every blog post must link to ≥1 tool page (/tools/*)
 *   - Every blog post must link to ≥2 other blog posts (/blog/*)
 *   - Every blog post must contain ≥1 commercial CTA path
 *     (/coaching, /apply, /community/not-done-yet, /strength-training,
 *      /assessment, /plateau)
 *
 * CLI: npx tsx scripts/lint-content-graph.ts
 *      npx tsx scripts/lint-content-graph.ts --strict  (exit 1 on any failure)
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

const TOOL_PATTERN = /\/tools\/[a-z-]+/g;
const BLOG_LINK_PATTERN = /\/blog\/[a-z0-9-]+/g;
const CTA_PATHS = [
  "/coaching",
  "/apply",
  "/community/not-done-yet",
  "/strength-training",
  "/assessment",
  "/plateau",
  "/you/",
];
const CTA_PATTERN = new RegExp(
  CTA_PATHS.map((p) => p.replace(/\//g, "\\/")).join("|"),
  "g",
);

interface LintResult {
  file: string;
  toolLinks: number;
  blogLinks: number;
  ctaLinks: number;
  issues: string[];
}

function lintPost(filePath: string): LintResult {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  const fileName = path.basename(filePath, ".mdx");

  const toolMatches = content.match(TOOL_PATTERN) || [];
  const blogMatches = (content.match(BLOG_LINK_PATTERN) || []).filter(
    (link) => !link.includes(fileName),
  );
  const ctaMatches = content.match(CTA_PATTERN) || [];

  const toolLinks = new Set(toolMatches).size;
  const blogLinks = new Set(blogMatches).size;
  const ctaLinks = new Set(ctaMatches).size;

  const issues: string[] = [];
  if (toolLinks < 1) issues.push("Missing tool link (need ≥1 /tools/* link)");
  if (blogLinks < 2)
    issues.push(`Only ${blogLinks} blog cross-links (need ≥2)`);
  if (ctaLinks < 1) issues.push("Missing commercial CTA link");

  return { file: fileName, toolLinks, blogLinks, ctaLinks, issues };
}

const strict = process.argv.includes("--strict");
const files = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith(".mdx"))
  .sort();

const results = files.map((f) => lintPost(path.join(BLOG_DIR, f)));
const failing = results.filter((r) => r.issues.length > 0);
const passing = results.filter((r) => r.issues.length === 0);

console.log(`\n📊 Content-Graph Lint: ${files.length} blog posts\n`);
console.log(`  ✅ Passing: ${passing.length}`);
console.log(`  ❌ Failing: ${failing.length}\n`);

if (failing.length > 0) {
  console.log("--- ISSUES ---\n");
  for (const r of failing) {
    console.log(`  ${r.file}`);
    for (const issue of r.issues) {
      console.log(`    ⚠  ${issue}`);
    }
  }
  console.log("");
}

const avgTools =
  results.reduce((sum, r) => sum + r.toolLinks, 0) / results.length;
const avgBlog =
  results.reduce((sum, r) => sum + r.blogLinks, 0) / results.length;
const avgCta =
  results.reduce((sum, r) => sum + r.ctaLinks, 0) / results.length;

console.log("--- AVERAGES ---\n");
console.log(`  Tool links/post:  ${avgTools.toFixed(1)}`);
console.log(`  Blog links/post:  ${avgBlog.toFixed(1)}`);
console.log(`  CTA links/post:   ${avgCta.toFixed(1)}\n`);

if (strict && failing.length > 0) {
  console.log(
    `❌ ${failing.length} posts fail content-graph lint. Fix before pushing.\n`,
  );
  process.exit(1);
}
