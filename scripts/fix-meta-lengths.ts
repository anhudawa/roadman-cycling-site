/**
 * scripts/fix-meta-lengths.ts
 *
 * Truncates seoTitle to ≤60 chars and seoDescription to ≤155 chars
 * across all blog MDX files. Uses simple heuristic truncation:
 * - Titles: remove "(2026)" suffix, remove "—" clause if still too long
 * - Descriptions: truncate at last sentence boundary under 155 chars
 *
 * CLI:
 *   npx tsx scripts/fix-meta-lengths.ts             # fix all
 *   npx tsx scripts/fix-meta-lengths.ts --dry-run    # preview only
 */

import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const dryRun = process.argv.includes("--dry-run");

const MAX_TITLE = 60;
const MAX_DESC = 155;

function truncateTitle(title: string): string {
  if (title.length <= MAX_TITLE) return title;

  // Remove (2026) suffix
  let t = title.replace(/\s*\(2026\)\s*$/, "");
  if (t.length <= MAX_TITLE) return t;

  // Remove " — Subtitle" clause
  const dashIdx = t.lastIndexOf(" — ");
  if (dashIdx > 20) {
    t = t.slice(0, dashIdx);
    if (t.length <= MAX_TITLE) return t;
  }

  // Remove " | Brand" clause
  const pipeIdx = t.lastIndexOf(" | ");
  if (pipeIdx > 20) {
    t = t.slice(0, pipeIdx);
    if (t.length <= MAX_TITLE) return t;
  }

  // Hard truncate at word boundary
  const truncated = t.slice(0, MAX_TITLE - 1);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 30 ? truncated.slice(0, lastSpace) : truncated;
}

function truncateDescription(desc: string): string {
  if (desc.length <= MAX_DESC) return desc;

  // Try to cut at sentence boundary
  const sentences = desc.match(/[^.!?]+[.!?]+/g) || [desc];
  let result = "";
  for (const s of sentences) {
    if ((result + s).length <= MAX_DESC) {
      result += s;
    } else {
      break;
    }
  }

  if (result.length > 0 && result.length <= MAX_DESC) return result.trim();

  // Hard truncate at word boundary + ellipsis
  const truncated = desc.slice(0, MAX_DESC - 3);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 50 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

let titleFixes = 0;
let descFixes = 0;

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  let content = fs.readFileSync(filePath, "utf-8");
  let changed = false;

  // Fix seoTitle
  const titleMatch = content.match(/^seoTitle:\s*['"]?(.+?)['"]?\s*$/m);
  if (titleMatch && titleMatch[1].length > MAX_TITLE) {
    const original = titleMatch[1];
    const fixed = truncateTitle(original);
    if (fixed !== original) {
      content = content.replace(
        titleMatch[0],
        `seoTitle: '${fixed.replace(/'/g, "''")}'`
      );
      changed = true;
      titleFixes++;
      if (dryRun) {
        console.log(`TITLE ${file}:`);
        console.log(`  ${original.length}→${fixed.length}: ${fixed}`);
      }
    }
  }

  // Fix seoDescription (block scalar format)
  const descBlockMatch = content.match(
    /^seoDescription:\s*>-?\n((?:\s{2}.+\n)+)/m
  );
  if (descBlockMatch) {
    const original = descBlockMatch[1]
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ");

    if (original.length > MAX_DESC) {
      const fixed = truncateDescription(original);
      if (fixed !== original) {
        // Re-wrap at 78 chars per line with 2-space indent
        const lines: string[] = [];
        let line = "";
        for (const word of fixed.split(" ")) {
          if ((line + " " + word).trim().length > 76) {
            lines.push("  " + line.trim());
            line = word;
          } else {
            line = line ? line + " " + word : word;
          }
        }
        if (line) lines.push("  " + line.trim());

        content = content.replace(
          descBlockMatch[0],
          `seoDescription: >-\n${lines.join("\n")}\n`
        );
        changed = true;
        descFixes++;
        if (dryRun) {
          console.log(`DESC ${file}:`);
          console.log(`  ${original.length}→${fixed.length}`);
        }
      }
    }
  }

  // Also check inline seoDescription
  const descInlineMatch = content.match(
    /^seoDescription:\s*['"](.+?)['"]$/m
  );
  if (descInlineMatch && descInlineMatch[1].length > MAX_DESC) {
    const original = descInlineMatch[1];
    const fixed = truncateDescription(original);
    if (fixed !== original) {
      content = content.replace(
        descInlineMatch[0],
        `seoDescription: '${fixed.replace(/'/g, "''")}'`
      );
      changed = true;
      descFixes++;
    }
  }

  if (changed && !dryRun) {
    fs.writeFileSync(filePath, content, "utf-8");
  }
}

console.log(`\nDone.`);
console.log(`  Title fixes: ${titleFixes}`);
console.log(`  Description fixes: ${descFixes}`);
console.log(`  Dry run: ${dryRun}`);
