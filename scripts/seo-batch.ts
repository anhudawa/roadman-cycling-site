/**
 * scripts/seo-batch.ts
 *
 * Master orchestrator for SEO-NEW-20. Runs the full enrichment pipeline
 * across the top-N prioritised episodes. Spawns the existing enricher
 * scripts as child processes one slug at a time, in dependency order.
 *
 * Pipeline (per episode, in order):
 *   1. answerCapsule   →  scripts/generate-episode-capsules.ts
 *   2. keyTakeaways    →  scripts/extract-key-takeaways.ts
 *   3. segmentTitles   →  scripts/generate-segment-titles.ts
 *   4. claims          →  scripts/extract-claims.ts          (reviewed:false → queue)
 *   5. citations       →  scripts/extract-citations.ts        (reviewed:false → queue)
 *   6. topicTags       →  scripts/tag-episode-topics.ts
 *   7. faq             →  scripts/generate-episode-faqs.ts
 *   8. keyQuotes       →  scripts/extract-key-quotes.ts
 *   9. relatedPosts    →  scripts/populate-episode-related-posts.ts
 *  10. relatedEpisodes →  scripts/populate-related-episodes.ts (run once after the batch)
 *
 * Each child script is idempotent and skips episodes that already have
 * the field, so re-running the batch is cheap and progressive.
 *
 * Chapters are NOT auto-extracted — they require real timestamps from
 * the YouTube/Spotify recording. They remain hand-authored.
 *
 * SEO-NEW-20.
 *
 * CLI:
 *   tsx scripts/seo-batch.ts                          # top-50 default
 *   tsx scripts/seo-batch.ts --limit=10 --dry-run     # preview top 10
 *   tsx scripts/seo-batch.ts --from-rank=1 --to-rank=50
 *   tsx scripts/seo-batch.ts --skip=claims,citations  # cheap pass only
 *   tsx scripts/seo-batch.ts --slug=ep-2148-...       # one episode end-to-end
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

import matter from "gray-matter";
import {
  prioritiseEpisodes,
  type PriorityContext,
} from "@/lib/podcast/seo-priority";
import { type EpisodeFrontmatter, type EpisodeMeta } from "@/lib/podcast";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limit = Number(
  args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 50,
);
const fromRank = Number(
  args.find((a) => a.startsWith("--from-rank="))?.split("=")[1] ?? 1,
);
const toRank = Number(
  args.find((a) => a.startsWith("--to-rank="))?.split("=")[1] ?? 0,
);
const skipList = (
  args.find((a) => a.startsWith("--skip="))?.split("=")[1] ?? ""
)
  .split(",")
  .filter(Boolean);
const slugOverride = args.find((a) => a.startsWith("--slug="))?.split("=")[1];

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");
const REPORTS_DIR = path.join(process.cwd(), "seo-reports");

type Step = {
  field: keyof EpisodeFrontmatter | "claimsReviewed" | "citationsReviewed";
  label: string;
  script: string;
  costsApi: boolean;
};

const STEPS: Step[] = [
  {
    field: "answerCapsule",
    label: "answerCapsule",
    script: "scripts/generate-episode-capsules.ts",
    costsApi: true,
  },
  {
    field: "keyTakeaways",
    label: "keyTakeaways",
    script: "scripts/extract-key-takeaways.ts",
    costsApi: true,
  },
  {
    field: "segmentTitles",
    label: "segmentTitles",
    script: "scripts/generate-segment-titles.ts",
    costsApi: true,
  },
  {
    field: "claims",
    label: "claims (reviewed:false → queue)",
    script: "scripts/extract-claims.ts",
    costsApi: true,
  },
  {
    field: "citations",
    label: "citations (reviewed:false → queue)",
    script: "scripts/extract-citations.ts",
    costsApi: true,
  },
  {
    field: "topicTags",
    label: "topicTags",
    script: "scripts/tag-episode-topics.ts",
    costsApi: false,
  },
  {
    field: "faq",
    label: "faq",
    script: "scripts/generate-episode-faqs.ts",
    costsApi: true,
  },
  {
    field: "keyQuotes",
    label: "keyQuotes",
    script: "scripts/extract-key-quotes.ts",
    costsApi: true,
  },
  {
    field: "relatedPosts",
    label: "relatedPosts",
    script: "scripts/populate-episode-related-posts.ts",
    costsApi: false,
  },
];

function loadEpisodes(): EpisodeMeta[] {
  const files = fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(PODCAST_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    return { ...(data as EpisodeFrontmatter), slug };
  });
}

function readFrontmatter(slug: string): EpisodeFrontmatter | null {
  const filePath = path.join(PODCAST_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  return data as EpisodeFrontmatter;
}

function fieldPresent(fm: EpisodeFrontmatter, step: Step): boolean {
  switch (step.field) {
    case "answerCapsule":
      return !!(fm.answerCapsule && fm.answerCapsule.length > 30);
    case "keyTakeaways":
      return Array.isArray(fm.keyTakeaways) && fm.keyTakeaways.length >= 3;
    case "segmentTitles":
      return Array.isArray(fm.segmentTitles) && fm.segmentTitles.length >= 3;
    case "claims":
      return Array.isArray(fm.claims) && fm.claims.length >= 3;
    case "citations":
      return Array.isArray(fm.citations) && fm.citations.length >= 1;
    case "topicTags":
      return Array.isArray(fm.topicTags) && fm.topicTags.length >= 1;
    case "faq":
      return Array.isArray(fm.faq) && fm.faq.length >= 2;
    case "keyQuotes":
      return Array.isArray(fm.keyQuotes) && fm.keyQuotes.length >= 2;
    case "relatedPosts":
      return Array.isArray(fm.relatedPosts) && fm.relatedPosts.length >= 1;
    default:
      return false;
  }
}

function runStep(step: Step, slug: string): { ok: boolean; durationMs: number } {
  const start = Date.now();
  const cmd = "npx";
  const cmdArgs = ["tsx", step.script, `--slug=${slug}`];
  if (dryRun) cmdArgs.push("--dry-run");
  console.log(`     → ${cmd} ${cmdArgs.join(" ")}`);
  const result = spawnSync(cmd, cmdArgs, {
    stdio: ["ignore", "inherit", "inherit"],
    env: process.env,
  });
  const durationMs = Date.now() - start;
  return { ok: result.status === 0, durationMs };
}

interface RunReport {
  slug: string;
  rank: number;
  score: number;
  ranBefore: string[]; // fields already present before run
  ranSteps: Array<{ label: string; status: "skipped-present" | "ran-ok" | "ran-failed" | "skipped-cli"; durationMs: number }>;
  finalCoverage: string[];
}

async function main() {
  console.log(`SEO batch orchestrator`);
  console.log(`   limit: ${limit}`);
  console.log(`   from-rank: ${fromRank}`);
  if (toRank) console.log(`   to-rank: ${toRank}`);
  if (skipList.length) console.log(`   skip: ${skipList.join(", ")}`);
  if (slugOverride) console.log(`   slug override: ${slugOverride}`);
  console.log(`   dry-run: ${dryRun}`);
  console.log(``);

  const episodes = loadEpisodes();
  console.log(`   Loaded ${episodes.length} episodes`);

  let queue: Array<{ rank: number; score: number; slug: string }> = [];

  if (slugOverride) {
    const idx = episodes.findIndex((e) => e.slug === slugOverride);
    if (idx === -1) {
      console.error(`Slug not found: ${slugOverride}`);
      process.exit(1);
    }
    queue = [{ rank: 1, score: 0, slug: slugOverride }];
  } else {
    const ctx: PriorityContext = {};
    const scored = prioritiseEpisodes(episodes, ctx);
    const start = Math.max(0, fromRank - 1);
    const end = toRank > 0 ? toRank : start + limit;
    queue = scored.slice(start, end).map((s, i) => ({
      rank: start + i + 1,
      score: s.score,
      slug: s.episode.slug,
    }));
  }

  console.log(`   Queue size: ${queue.length}`);
  console.log(``);

  const reports: RunReport[] = [];
  let stepRuns = 0;
  let stepFailures = 0;

  for (let i = 0; i < queue.length; i++) {
    const { rank, score, slug } = queue[i];
    console.log(`[${i + 1}/${queue.length}] rank ${rank} (score ${score})  ${slug}`);

    const before = readFrontmatter(slug);
    if (!before) {
      console.log(`   Frontmatter missing — skipping`);
      continue;
    }

    const ranBefore = STEPS.filter((s) => fieldPresent(before, s)).map((s) => s.label);
    const ranSteps: RunReport["ranSteps"] = [];

    for (const step of STEPS) {
      const fmCurrent = readFrontmatter(slug);
      if (!fmCurrent) {
        ranSteps.push({ label: step.label, status: "skipped-cli", durationMs: 0 });
        continue;
      }
      if (skipList.includes(step.field as string)) {
        ranSteps.push({ label: step.label, status: "skipped-cli", durationMs: 0 });
        console.log(`   skip: ${step.label} (CLI --skip)`);
        continue;
      }
      if (fieldPresent(fmCurrent, step)) {
        ranSteps.push({ label: step.label, status: "skipped-present", durationMs: 0 });
        console.log(`   present: ${step.label}`);
        continue;
      }
      console.log(`   running: ${step.label}`);
      const { ok, durationMs } = runStep(step, slug);
      stepRuns++;
      ranSteps.push({
        label: step.label,
        status: ok ? "ran-ok" : "ran-failed",
        durationMs,
      });
      if (!ok) {
        stepFailures++;
        console.log(`   FAILED: ${step.label} (${durationMs}ms)`);
      } else {
        console.log(`   done:  ${step.label} (${durationMs}ms)`);
      }
    }

    const after = readFrontmatter(slug);
    const finalCoverage = after
      ? STEPS.filter((s) => fieldPresent(after, s)).map((s) => s.label)
      : [];
    reports.push({ slug, rank, score, ranBefore, ranSteps, finalCoverage });
  }

  // Run cross-cutting populator once, after all per-episode work, since
  // it scores every episode against every other episode.
  if (!skipList.includes("relatedEpisodes") && !slugOverride && !dryRun) {
    console.log(``);
    console.log(`Running cross-cutting: scripts/populate-related-episodes.ts`);
    spawnSync("npx", ["tsx", "scripts/populate-related-episodes.ts"], {
      stdio: ["ignore", "inherit", "inherit"],
      env: process.env,
    });
  }

  // Write batch report
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16);
  const reportPath = path.join(REPORTS_DIR, `seo-batch-${stamp}.md`);
  const md = renderBatchReport({ reports, stepRuns, stepFailures, dryRun });
  fs.writeFileSync(reportPath, md);

  console.log(``);
  console.log(`Batch complete.`);
  console.log(`  Episodes processed: ${reports.length}`);
  console.log(`  Step runs:          ${stepRuns}`);
  console.log(`  Step failures:      ${stepFailures}`);
  console.log(`  Report:             ${reportPath}`);
  console.log(``);
  if (!dryRun) {
    console.log(`Next: tsx scripts/review-claims.ts to clear the editorial queue,`);
    console.log(`      then tsx scripts/audit-episode-coverage.ts to refresh the dashboard.`);
  }
}

function renderBatchReport(args: {
  reports: RunReport[];
  stepRuns: number;
  stepFailures: number;
  dryRun: boolean;
}): string {
  const { reports, stepRuns, stepFailures, dryRun } = args;
  const lines: string[] = [];
  lines.push(`# SEO Batch Run`);
  lines.push(``);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Mode: ${dryRun ? "**dry-run**" : "live"}`);
  lines.push(`Episodes processed: ${reports.length}`);
  lines.push(`Step runs: ${stepRuns} (failures: ${stepFailures})`);
  lines.push(``);
  lines.push(`## Per-episode summary`);
  lines.push(``);
  lines.push(`| Rank | Score | Episode | Ran | Failed |`);
  lines.push(`|---:|---:|---|---|---|`);
  for (const r of reports) {
    const ran = r.ranSteps.filter((s) => s.status === "ran-ok").map((s) => s.label).join("; ") || "—";
    const failed = r.ranSteps.filter((s) => s.status === "ran-failed").map((s) => s.label).join("; ") || "—";
    lines.push(`| ${r.rank} | ${r.score} | ${r.slug} | ${ran} | ${failed} |`);
  }
  lines.push(``);
  return lines.join("\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
