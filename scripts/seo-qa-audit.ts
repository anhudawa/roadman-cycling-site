/**
 * Search-quality guard for editorial content.
 *
 * Hard failures are limited to fields that can break indexing, rendering or
 * trust. Optional enrichment is reported as a warning. Google does not use
 * the keywords meta tag for ranking, so a missing `keywords` array is not a
 * quality failure.
 *
 * Usage:
 *   tsx scripts/seo-qa-audit.ts
 *   tsx scripts/seo-qa-audit.ts --changed-only --base=origin/main
 *   tsx scripts/seo-qa-audit.ts --no-write
 */

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import matter from "gray-matter";

type ContentType = "blog" | "podcast";
type Severity = "error" | "warning";

interface Issue {
  file: string;
  type: ContentType;
  field: string;
  severity: Severity;
  detail: string;
}

const args = process.argv.slice(2);
const changedOnly = args.includes("--changed-only");
const noWrite = args.includes("--no-write");
const base = args.find((arg) => arg.startsWith("--base="))?.slice(7) ?? "origin/main";
const root = process.cwd();
const contentRoots: Record<ContentType, string> = {
  blog: path.join(root, "content/blog"),
  podcast: path.join(root, "content/podcast"),
};

function allContentFiles(): string[] {
  return (Object.entries(contentRoots) as Array<[ContentType, string]>).flatMap(
    ([type, dir]) =>
      fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
        .map((entry) => `content/${type}/${entry.name}`),
  );
}

function changedContentFiles(): string[] {
  try {
    const output = execFileSync(
      "git",
      ["diff", "--name-only", "--diff-filter=ACMR", `${base}...HEAD`],
      { cwd: root, encoding: "utf8" },
    );
    return output
      .split("\n")
      .filter((file) => /^content\/(blog|podcast)\/[^/]+\.mdx$/.test(file));
  } catch {
    console.warn(`Could not diff against ${base}; auditing the full corpus.`);
    return allContentFiles();
  }
}

function validDate(value: unknown): boolean {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function push(
  issues: Issue[],
  file: string,
  type: ContentType,
  field: string,
  severity: Severity,
  detail: string,
) {
  issues.push({ file, type, field, severity, detail });
}

function auditFile(relativeFile: string, issues: Issue[]) {
  const type: ContentType = relativeFile.startsWith("content/blog/")
    ? "blog"
    : "podcast";
  const raw = fs.readFileSync(path.join(root, relativeFile), "utf8");
  const { data, content } = matter(raw);

  for (const field of ["title", "seoDescription", "publishDate"] as const) {
    if (!data[field] || String(data[field]).trim().length === 0) {
      push(issues, relativeFile, type, field, "error", `Missing ${field}`);
    }
  }
  if (data.publishDate && !validDate(data.publishDate)) {
    push(issues, relativeFile, type, "publishDate", "error", "Invalid publishDate");
  }
  if (data.updatedDate && !validDate(data.updatedDate)) {
    push(issues, relativeFile, type, "updatedDate", "error", "Invalid updatedDate");
  }
  if (data.seoTitle && String(data.seoTitle).length > 65) {
    push(
      issues,
      relativeFile,
      type,
      "seoTitle",
      "warning",
      `seoTitle is ${String(data.seoTitle).length} characters`,
    );
  }
  if (data.seoDescription && String(data.seoDescription).length > 170) {
    push(
      issues,
      relativeFile,
      type,
      "seoDescription",
      "warning",
      `seoDescription is ${String(data.seoDescription).length} characters`,
    );
  }
  const h1Count = (content.match(/^# /gm) ?? []).length;
  if (h1Count > 0) {
    push(
      issues,
      relativeFile,
      type,
      "H1",
      "warning",
      `${h1Count} Markdown H1(s) duplicate the template H1`,
    );
  }

  if (type === "blog") {
    for (const field of ["pillar", "author", "excerpt"] as const) {
      if (!data[field]) push(issues, relativeFile, type, field, "error", `Missing ${field}`);
    }
    for (const field of ["answerCapsule", "featuredImage", "relatedEpisodes"] as const) {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        push(issues, relativeFile, type, field, "warning", `Missing ${field}`);
      }
    }
  } else {
    for (const field of ["duration", "pillar", "type"] as const) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        push(issues, relativeFile, type, field, "error", `Missing ${field}`);
      }
    }
    if (data.episodeNumber === undefined || data.episodeNumber === null) {
      push(
        issues,
        relativeFile,
        type,
        "episodeNumber",
        "warning",
        "Missing legacy catalogue episode number",
      );
    }
    for (const field of ["answerCapsule", "topicTags", "keyTakeaways"] as const) {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        push(issues, relativeFile, type, field, "warning", `Missing ${field}`);
      }
    }
  }
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

const files = changedOnly ? changedContentFiles() : allContentFiles();
const issues: Issue[] = [];
for (const file of files) auditFile(file, issues);

const errors = issues.filter((issue) => issue.severity === "error");
const warnings = issues.filter((issue) => issue.severity === "warning");
const warningsByField = Object.entries(
  warnings.reduce<Record<string, number>>((counts, warning) => {
    counts[warning.field] = (counts[warning.field] ?? 0) + 1;
    return counts;
  }, {}),
).sort((a, b) => b[1] - a[1]);

console.log("Search Quality QA");
console.log(`  Scope: ${changedOnly ? `changed content vs ${base}` : "full corpus"}`);
console.log(`  Files audited: ${files.length}`);
console.log(`  Errors: ${errors.length}`);
console.log(`  Enrichment warnings: ${warnings.length}`);
for (const [field, count] of warningsByField) console.log(`    ${field}: ${count}`);
for (const error of errors) console.error(`  ERROR ${error.file}: ${error.detail}`);

if (!noWrite) {
  const reportDir = path.join(root, "seo-reports");
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportDir, "content-quality.csv"),
    [
      "file,type,field,severity,detail",
      ...issues.map((issue) =>
        [issue.file, issue.type, issue.field, issue.severity, issue.detail]
          .map(csvCell)
          .join(","),
      ),
    ].join("\n"),
  );
  fs.writeFileSync(
    path.join(reportDir, "content-quality.json"),
    JSON.stringify({ scope: changedOnly ? "changed" : "all", files: files.length, errors, warnings }, null, 2),
  );
}

process.exitCode = errors.length > 0 ? 1 : 0;
