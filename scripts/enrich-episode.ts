/**
 * scripts/enrich-episode.ts
 *
 * Single-episode enrichment pipeline. Used in the publish flow for new
 * episodes:
 *
 *   1. Author drafts MDX in content/podcast/ep-NNN-...mdx
 *   2. Run `pnpm episode:enrich ep-NNN-...` (this script)
 *   3. Once Claude calls land, the editor runs `tsx scripts/review-claims.ts`
 *      to clear claims/citations into the published set.
 *   4. Merge / deploy.
 *
 * Same dependency order as scripts/seo-batch.ts but for one slug. Idempotent.
 *
 * SEO-NEW-20.
 *
 * CLI:
 *   tsx scripts/enrich-episode.ts <slug>
 *   tsx scripts/enrich-episode.ts <slug> --dry-run
 *   tsx scripts/enrich-episode.ts <slug> --skip=claims,citations
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const skipList = (args.find((a) => a.startsWith("--skip="))?.split("=")[1] ?? "")
  .split(",")
  .filter(Boolean);
const slug = args.find((a) => !a.startsWith("--"));

if (!slug) {
  console.error(`Usage: tsx scripts/enrich-episode.ts <slug> [--dry-run] [--skip=...]`);
  process.exit(1);
}

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");
const filePath = path.join(PODCAST_DIR, `${slug}.mdx`);
if (!fs.existsSync(filePath)) {
  console.error(`Episode MDX not found: ${filePath}`);
  process.exit(1);
}

interface Step {
  field: string;
  label: string;
  script: string;
}

const STEPS: Step[] = [
  { field: "answerCapsule", label: "answerCapsule", script: "scripts/generate-episode-capsules.ts" },
  { field: "keyTakeaways", label: "keyTakeaways", script: "scripts/extract-key-takeaways.ts" },
  { field: "segmentTitles", label: "segmentTitles", script: "scripts/generate-segment-titles.ts" },
  { field: "claims", label: "claims (review queue)", script: "scripts/extract-claims.ts" },
  { field: "citations", label: "citations (review queue)", script: "scripts/extract-citations.ts" },
  { field: "topicTags", label: "topicTags", script: "scripts/tag-episode-topics.ts" },
  { field: "faq", label: "faq", script: "scripts/generate-episode-faqs.ts" },
  { field: "keyQuotes", label: "keyQuotes", script: "scripts/extract-key-quotes.ts" },
  { field: "relatedPosts", label: "relatedPosts", script: "scripts/populate-episode-related-posts.ts" },
];

console.log(`Enriching episode: ${slug}`);
console.log(`   dry-run: ${dryRun}`);
if (skipList.length) console.log(`   skip: ${skipList.join(", ")}`);
console.log(``);

let succeeded = 0;
let failed = 0;
let skipped = 0;

for (const step of STEPS) {
  if (skipList.includes(step.field)) {
    console.log(`skip: ${step.label}`);
    skipped++;
    continue;
  }
  const cmdArgs = ["tsx", step.script, `--slug=${slug}`];
  if (dryRun) cmdArgs.push("--dry-run");
  console.log(`run:  ${step.label}`);
  const start = Date.now();
  const result = spawnSync("npx", cmdArgs, {
    stdio: ["ignore", "inherit", "inherit"],
    env: process.env,
  });
  const ms = Date.now() - start;
  if (result.status === 0) {
    console.log(`done: ${step.label} (${ms}ms)`);
    succeeded++;
  } else {
    console.log(`FAIL: ${step.label} (${ms}ms)`);
    failed++;
  }
  console.log(``);
}

console.log(`---`);
console.log(`Episode enrichment complete: ${slug}`);
console.log(`  Succeeded: ${succeeded}`);
console.log(`  Failed:    ${failed}`);
console.log(`  Skipped:   ${skipped}`);
console.log(``);
if (!dryRun) {
  console.log(`Next: tsx scripts/review-claims.ts --slug=${slug}`);
  console.log(`      to approve auto-extracted claims/citations into the published set.`);
}
