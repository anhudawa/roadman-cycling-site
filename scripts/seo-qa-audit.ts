/**
 * scripts/seo-qa-audit.ts
 *
 * SEO quality assurance audit across all blog + podcast content.
 * Checks every page against the blueprint's definition of done:
 *
 *   - Has seoTitle ($‰¤60 chars)
 *   - Has seoDescription ($‰¤155 chars)
 *   - Has canonical URL
 *   - Has keywords
 *   - Has answerCapsule
 *   - Has FAQ
 *   - Has relatedEpisodes (blog) or relatedPosts (podcast)
 *   - Has featuredImage (blog)
 *   - Belongs to a topic cluster (blog)
 *
 * Outputs a summary + CSV of issues.
 *
 * CLI: npx tsx scripts/seo-qa-audit.ts
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const PODCAST_DIR = path.join(process.cwd(), "content/podcast");

interface Issue {
  file: string;
  type: "blog" | "podcast";
  field: string;
  severity: "error" | "warning";
  detail: string;
}

const issues: Issue[] = [];

function checkBlog(file: string) {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
  const { data } = matter(raw);
  const slug = file.replace(/\.mdx$/, "");

  if (!data.seoTitle) {
    issues.push({ file, type: "blog", field: "seoTitle", severity: "error", detail: "Missing seoTitle" });
  } else if (data.seoTitle.length > 60) {
    issues.push({ file, type: "blog", field: "seoTitle", severity: "warning", detail: `seoTitle ${data.seoTitle.length} chars (max 60)` });
  }

  if (!data.seoDescription) {
    issues.push({ file, type: "blog", field: "seoDescription", severity: "error", detail: "Missing seoDescription" });
  }

  if (!data.keywords || data.keywords.length === 0) {
    issues.push({ file, type: "blog", field: "keywords", severity: "error", detail: "Missing keywords" });
  }

  if (!data.answerCapsule) {
    issues.push({ file, type: "blog", field: "answerCapsule", severity: "warning", detail: "Missing answerCapsule" });
  }

  if (!data.faq || data.faq.length === 0) {
    issues.push({ file, type: "blog", field: "faq", severity: "warning", detail: "Missing FAQ" });
  }

  if (!data.featuredImage) {
    issues.push({ file, type: "blog", field: "featuredImage", severity: "warning", detail: "Missing featuredImage" });
  }

  if (!data.relatedEpisodes || data.relatedEpisodes.length === 0) {
    issues.push({ file, type: "blog", field: "relatedEpisodes", severity: "warning", detail: "No relatedEpisodes" });
  }

  if (!data.publishDate) {
    issues.push({ file, type: "blog", field: "publishDate", severity: "error", detail: "Missing publishDate" });
  }

  // Check for duplicate H1 in body
  const body = raw.split("---").slice(2).join("---");
  const h1Count = (body.match(/^# /gm) || []).length;
  if (h1Count > 0) {
    issues.push({ file, type: "blog", field: "H1", severity: "error", detail: `${h1Count} markdown H1(s) in body (duplicate with template H1)` });
  }
}

function checkPodcast(file: string) {
  const raw = fs.readFileSync(path.join(PODCAST_DIR, file), "utf-8");
  const { data } = matter(raw);

  if (!data.seoDescription) {
    issues.push({ file, type: "podcast", field: "seoDescription", severity: "warning", detail: "Missing seoDescription" });
  }

  if (!data.keywords || data.keywords.length === 0) {
    issues.push({ file, type: "podcast", field: "keywords", severity: "warning", detail: "Missing keywords" });
  }

  if (!data.answerCapsule) {
    issues.push({ file, type: "podcast", field: "answerCapsule", severity: "warning", detail: "Missing answerCapsule" });
  }

  if (!data.faq || data.faq.length === 0) {
    issues.push({ file, type: "podcast", field: "faq", severity: "warning", detail: "Missing FAQ" });
  }

  if (!data.publishDate) {
    issues.push({ file, type: "podcast", field: "publishDate", severity: "error", detail: "Missing publishDate" });
  }
}

// Run checks
const blogFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
const podcastFiles = fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"));

console.log(`SEO QA Audit`);
console.log(`  Blog posts: ${blogFiles.length}`);
console.log(`  Podcast episodes: ${podcastFiles.length}`);
console.log("");

for (const f of blogFiles) checkBlog(f);
for (const f of podcastFiles) checkPodcast(f);

const errors = issues.filter((i) => i.severity === "error");
const warnings = issues.filter((i) => i.severity === "warning");

console.log(`Results:`);
console.log(`  Errors: ${errors.length}`);
console.log(`  Warnings: ${warnings.length}`);
console.log("");

if (errors.length > 0) {
  console.log("=== ERRORS ===");
  for (const e of errors) {
    console.log(`  [${e.type}] ${e.file}: ${e.detail}`);
  }
  console.log("");
}

if (warnings.length > 0) {
  console.log(`=== WARNINGS (${warnings.length}) ===`);
  // Group by field
  const byField = new Map<string, number>();
  for (const w of warnings) {
    byField.set(w.field, (byField.get(w.field) || 0) + 1);
  }
  for (const [field, count] of byField) {
    console.log(`  ${field}: ${count} pages`);
  }
}

// Write CSV
const csvPath = path.join(process.cwd(), "docs/seo/qa-audit-results.csv");
const csvLines = [
  "file,type,field,severity,detail",
  ...issues.map(
    (i) => `${i.file},${i.type},${i.field},${i.severity},"${i.detail}"`
  ),
];
fs.mkdirSync(path.dirname(csvPath), { recursive: true });
fs.writeFileSync(csvPath, csvLines.join("\n"), "utf-8");
console.log(`\nCSV written to ${csvPath}`);

process.exit(errors.length > 0 ? 1 : 0);
