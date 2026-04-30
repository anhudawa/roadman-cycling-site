/**
 * scripts/audit-episode-coverage.ts
 *
 * Reads every podcast MDX in `content/podcast/`, scores each on the
 * "full SEO treatment" checklist defined in SEO-NEW-20, and produces
 * two artefacts:
 *
 *   seo-reports/episode-coverage-YYYY-MM-DD.json    — full data
 *   seo-reports/episode-coverage-YYYY-MM-DD.md      — human-readable
 *
 * Plus, once a run completes, it overwrites SEO-PODCAST-DASHBOARD.md
 * at repo root with the latest snapshot — that's the file Anthony
 * checks to know where the pipeline stands.
 *
 * No Claude calls, no DB writes (just reads from episodeDownloadsCache
 * if reachable). Cheap to run repeatedly.
 *
 * CLI:
 *   tsx scripts/audit-episode-coverage.ts                   # default report
 *   tsx scripts/audit-episode-coverage.ts --top=50          # show top N
 *   tsx scripts/audit-episode-coverage.ts --missing=claims  # filter by missing field
 *   tsx scripts/audit-episode-coverage.ts --strict --new-only  # for CI lint
 *   tsx scripts/audit-episode-coverage.ts --no-write        # stdout only
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Local env loader — keeps this script runnable without next.js
// ---------------------------------------------------------------------------
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
  type ScoredEpisode,
  type PriorityContext,
} from "@/lib/podcast/seo-priority";
import { type EpisodeFrontmatter, type EpisodeMeta } from "@/lib/podcast";
import { getEpisodeCta } from "@/lib/podcast/episode-cta";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const top = Number(args.find((a) => a.startsWith("--top="))?.split("=")[1] ?? 50);
const missingFilter = args.find((a) => a.startsWith("--missing="))?.split("=")[1];
const strict = args.includes("--strict");
const newOnly = args.includes("--new-only");
const noWrite = args.includes("--no-write");
const formatArg = args.find((a) => a.startsWith("--format="))?.split("=")[1];

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");
const REPORTS_DIR = path.join(process.cwd(), "seo-reports");
const DASHBOARD_PATH = path.join(process.cwd(), "SEO-PODCAST-DASHBOARD.md");

// ---------------------------------------------------------------------------
// Coverage checklist
// ---------------------------------------------------------------------------
const COVERAGE_FIELDS = [
  "transcript",
  "answerCapsule",
  "keyTakeaways",
  "segmentTitles",
  "chapters",
  "claims",
  "claimsReviewed",
  "citations",
  "citationsReviewed",
  "topicTags",
  "faq",
  "keyQuotes",
  "relatedPosts",
  "guestBio",
] as const;

type CoverageField = (typeof COVERAGE_FIELDS)[number];

interface CoverageRow {
  slug: string;
  title: string;
  publishDate: string;
  guest?: string;
  pillar: string;
  episodeNumber: number;
  has: Record<CoverageField, boolean>;
  missing: CoverageField[];
  coverage: number;
  ctaVariant: string;
}

function checkCoverage(
  fm: EpisodeFrontmatter,
): { has: Record<CoverageField, boolean>; missing: CoverageField[] } {
  const claims = Array.isArray(fm.claims) ? fm.claims : [];
  const citations = Array.isArray(fm.citations) ? fm.citations : [];

  const has: Record<CoverageField, boolean> = {
    transcript: !!(fm.transcript && fm.transcript.length > 200),
    answerCapsule: !!(fm.answerCapsule && fm.answerCapsule.length > 30),
    keyTakeaways: Array.isArray(fm.keyTakeaways) && fm.keyTakeaways.length >= 3,
    segmentTitles:
      Array.isArray(fm.segmentTitles) && fm.segmentTitles.length >= 3,
    chapters: Array.isArray(fm.chapters) && fm.chapters.length >= 3,
    claims: claims.length >= 3,
    claimsReviewed:
      claims.length >= 3 &&
      claims.every((c) => c.reviewed !== false),
    citations: citations.length >= 1,
    citationsReviewed:
      citations.length >= 1 &&
      citations.every((c) => c.reviewed !== false),
    topicTags: Array.isArray(fm.topicTags) && fm.topicTags.length >= 1,
    faq: Array.isArray(fm.faq) && fm.faq.length >= 2,
    keyQuotes: Array.isArray(fm.keyQuotes) && fm.keyQuotes.length >= 2,
    relatedPosts: Array.isArray(fm.relatedPosts) && fm.relatedPosts.length >= 1,
    guestBio: !!(fm.guestBio && fm.guestBio.length > 50),
  };

  const missing = COVERAGE_FIELDS.filter((f) => !has[f]);
  return { has, missing };
}

// ---------------------------------------------------------------------------
// Load episodes
// ---------------------------------------------------------------------------
function loadAllEpisodes(): EpisodeMeta[] {
  const files = fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(PODCAST_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    return { ...(data as EpisodeFrontmatter), slug };
  });
}

// ---------------------------------------------------------------------------
// Optional: pull download counts from Postgres if reachable
// ---------------------------------------------------------------------------
async function loadDownloadsBySlug(): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (!process.env.DATABASE_URL) return map;
  try {
    // Lazy-load drizzle so the script can still run without DB env.
    const { db } = await import("@/lib/db");
    const { episodeDownloadsCache } = await import("@/lib/db/schema");
    const rows = await db
      .select({
        episodeId: episodeDownloadsCache.episodeId,
        downloads: episodeDownloadsCache.downloads,
      })
      .from(episodeDownloadsCache);
    for (const row of rows) {
      if (typeof row.downloads === "number") map.set(row.episodeId, row.downloads);
    }
  } catch (err) {
    console.warn(
      `   Warning: could not load downloads cache (${err instanceof Error ? err.message : err})`,
    );
  }
  return map;
}

// ---------------------------------------------------------------------------
// Report rendering
// ---------------------------------------------------------------------------
function fieldLabel(f: CoverageField): string {
  switch (f) {
    case "claimsReviewed":
      return "claims (reviewed)";
    case "citationsReviewed":
      return "citations (reviewed)";
    default:
      return f;
  }
}

function renderMarkdown(args: {
  rows: CoverageRow[];
  scored: ScoredEpisode[];
  fieldCoverage: Record<CoverageField, number>;
  fullyOptimisedSlugs: Set<string>;
  topN: number;
  generatedAt: string;
}): string {
  const { rows, scored, fieldCoverage, fullyOptimisedSlugs, topN, generatedAt } = args;
  const total = rows.length;

  const lines: string[] = [];
  lines.push(`# Podcast Episode SEO Coverage Audit`);
  lines.push(``);
  lines.push(`Generated: ${generatedAt}`);
  lines.push(`Episodes audited: **${total}**`);
  lines.push(`Fully optimised (all fields present + reviewed): **${fullyOptimisedSlugs.size}** (${pct(fullyOptimisedSlugs.size, total)})`);
  lines.push(``);

  lines.push(`## Coverage by field`);
  lines.push(``);
  lines.push(`| Field | Episodes with field | Coverage |`);
  lines.push(`|---|---:|---:|`);
  for (const f of COVERAGE_FIELDS) {
    const count = fieldCoverage[f];
    lines.push(`| ${fieldLabel(f)} | ${count} | ${pct(count, total)} |`);
  }
  lines.push(``);

  // Top-N prioritised cohort
  const topCohort = scored.slice(0, topN);
  lines.push(`## Top ${topN} priority cohort`);
  lines.push(``);
  lines.push(
    `Ranked by `+
    `[seo-priority.ts](../src/lib/podcast/seo-priority.ts) — guest authority, topic demand, commercial relevance, listener proof, uniqueness penalty.`,
  );
  lines.push(``);
  lines.push(
    `| # | Score | Episode | Guest | Pillar | CTA | Missing |`,
  );
  lines.push(`|---:|---:|---|---|---|---|---|`);
  for (let i = 0; i < topCohort.length; i++) {
    const item = topCohort[i];
    const row = rows.find((r) => r.slug === item.episode.slug);
    const missingShort = row
      ? row.missing.length === 0
        ? "—"
        : row.missing.slice(0, 5).map(fieldLabel).join(", ") +
          (row.missing.length > 5 ? `, +${row.missing.length - 5}` : "")
      : "?";
    lines.push(
      `| ${i + 1} | ${item.score} | [${escapeMd(item.episode.title)}](/podcast/${item.episode.slug}) | ${escapeMd(item.episode.guest ?? "—")} | ${item.episode.pillar} | ${row?.ctaVariant ?? "?"} | ${missingShort} |`,
    );
  }
  lines.push(``);

  // Bottom of the long tail
  lines.push(`## Lowest-scored 20 (deprioritise / skip in Phase 1)`);
  lines.push(``);
  lines.push(`| Score | Episode | Guest | Pillar |`);
  lines.push(`|---:|---|---|---|`);
  for (const item of scored.slice(-20).reverse()) {
    lines.push(
      `| ${item.score} | [${escapeMd(item.episode.title)}](/podcast/${item.episode.slug}) | ${escapeMd(item.episode.guest ?? "—")} | ${item.episode.pillar} |`,
    );
  }
  lines.push(``);

  // Top scoring reasons sample
  lines.push(`## Top-10 score breakdowns`);
  lines.push(``);
  for (const item of scored.slice(0, 10)) {
    lines.push(`### ${item.score} — ${item.episode.title}`);
    lines.push(`- ` + item.breakdown.reasons.join("\n- "));
    lines.push(``);
  }

  return lines.join("\n");
}

function pct(n: number, total: number): string {
  if (total === 0) return "—";
  return `${Math.round((n / total) * 100)}%`;
}

function escapeMd(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function renderDashboard(args: {
  total: number;
  fullyOptimised: number;
  fieldCoverage: Record<CoverageField, number>;
  topCohort: ScoredEpisode[];
  pendingReviewCount: number;
  generatedAt: string;
}): string {
  const { total, fullyOptimised, fieldCoverage, topCohort, pendingReviewCount, generatedAt } = args;
  const lines: string[] = [];
  lines.push(`# Roadman Podcast SEO — Dashboard`);
  lines.push(``);
  lines.push(`> Live snapshot of where SEO-NEW-20 stands. Generated by`);
  lines.push(`> \`tsx scripts/audit-episode-coverage.ts\` — re-run anytime.`);
  lines.push(``);
  lines.push(`Last updated: **${generatedAt}**`);
  lines.push(``);
  lines.push(`## Phase 1 progress`);
  lines.push(``);
  lines.push(`- Episodes in repo: **${total}**`);
  lines.push(`- Fully optimised (all 14 checks pass): **${fullyOptimised}** / ${total}`);
  lines.push(`- Top-50 cohort fully optimised: **${topCohort.slice(0, 50).filter((c) => isFullyOptimised(c.episode.slug)).length}** / 50`);
  lines.push(`- Claims pending editorial review: **${pendingReviewCount}**`);
  lines.push(``);
  lines.push(`## Coverage by field (whole archive)`);
  lines.push(``);
  lines.push(`| Field | Coverage |`);
  lines.push(`|---|---:|`);
  for (const f of COVERAGE_FIELDS) {
    lines.push(`| ${fieldLabel(f)} | ${pct(fieldCoverage[f], total)} |`);
  }
  lines.push(``);
  lines.push(`## Top-10 priority episodes`);
  lines.push(``);
  for (let i = 0; i < Math.min(10, topCohort.length); i++) {
    const c = topCohort[i];
    lines.push(`${i + 1}. **${c.score}** — [${c.episode.title}](/podcast/${c.episode.slug})`);
  }
  lines.push(``);
  lines.push(`## Useful commands`);
  lines.push(``);
  lines.push(`- Re-run audit: \`tsx scripts/audit-episode-coverage.ts\``);
  lines.push(`- Run batch on top 50: \`tsx scripts/seo-batch.ts --limit=50 --dry-run\``);
  lines.push(`- Enrich one new episode: \`pnpm episode:enrich <slug>\``);
  lines.push(`- Clear review queue: \`tsx scripts/review-claims.ts\``);
  lines.push(``);
  lines.push(`See the full audit at \`seo-reports/\`.`);
  return lines.join("\n");
}

function isFullyOptimised(slug: string): boolean {
  return _fullyOptimisedSlugs.has(slug);
}

// Side-channel set populated in main(); avoids threading rows everywhere.
let _fullyOptimisedSlugs: Set<string> = new Set();

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`Podcast episode coverage audit`);
  console.log(`   PODCAST_DIR: ${PODCAST_DIR}`);
  console.log(`   top: ${top}`);
  if (missingFilter) console.log(`   filtering missing: ${missingFilter}`);
  if (strict) console.log(`   strict: enforced (CI lint mode)`);
  if (newOnly) console.log(`   new-only: PRs that touch content/podcast/ only`);
  console.log(``);

  const episodes = loadAllEpisodes();
  console.log(`   Loaded ${episodes.length} episodes`);

  const downloadsBySlug = await loadDownloadsBySlug();
  console.log(`   Downloads cache rows: ${downloadsBySlug.size}`);

  const ctx: PriorityContext = { downloadsBySlug };
  const scored = prioritiseEpisodes(episodes, ctx);

  // Coverage rows
  const rows: CoverageRow[] = episodes.map((ep) => {
    const { has, missing } = checkCoverage(ep);
    const cta = getEpisodeCta(ep);
    const total = COVERAGE_FIELDS.length;
    const present = COVERAGE_FIELDS.filter((f) => has[f]).length;
    return {
      slug: ep.slug,
      title: ep.title,
      publishDate: ep.publishDate,
      guest: ep.guest,
      pillar: ep.pillar,
      episodeNumber: ep.episodeNumber,
      has,
      missing,
      coverage: Math.round((present / total) * 100),
      ctaVariant: cta.variant,
    };
  });

  const fieldCoverage = COVERAGE_FIELDS.reduce(
    (acc, f) => {
      acc[f] = rows.filter((r) => r.has[f]).length;
      return acc;
    },
    {} as Record<CoverageField, number>,
  );

  const fullyOptimisedSlugs = new Set(
    rows.filter((r) => r.missing.length === 0).map((r) => r.slug),
  );
  _fullyOptimisedSlugs = fullyOptimisedSlugs;

  // Pending review queue: count of items flagged reviewed:false across episodes
  let pendingReviewCount = 0;
  for (const ep of episodes) {
    if (Array.isArray(ep.claims)) {
      pendingReviewCount += ep.claims.filter((c) => c.reviewed === false).length;
    }
    if (Array.isArray(ep.citations)) {
      pendingReviewCount += ep.citations.filter((c) => c.reviewed === false).length;
    }
  }

  // Console report
  console.log(``);
  console.log(`   Coverage by field:`);
  for (const f of COVERAGE_FIELDS) {
    console.log(`     ${fieldLabel(f).padEnd(24)} ${fieldCoverage[f].toString().padStart(4)} / ${episodes.length}  (${pct(fieldCoverage[f], episodes.length)})`);
  }
  console.log(``);
  console.log(`   Fully optimised: ${fullyOptimisedSlugs.size} / ${episodes.length}`);
  console.log(`   Pending review: ${pendingReviewCount} unreviewed claims/citations`);
  console.log(``);
  console.log(`   Top ${Math.min(top, 15)} priority episodes:`);
  for (let i = 0; i < Math.min(top, 15); i++) {
    const item = scored[i];
    const row = rows.find((r) => r.slug === item.episode.slug);
    const missingShort = row && row.missing.length > 0
      ? `missing: ${row.missing.slice(0, 4).map(fieldLabel).join(", ")}`
      : "fully optimised";
    console.log(`     ${(i + 1).toString().padStart(3)}. [${item.score.toString().padStart(3)}] ${item.episode.slug}`);
    console.log(`          ${missingShort}`);
  }

  if (missingFilter) {
    const filtered = rows.filter((r) =>
      r.missing.some((m) => m === missingFilter || m.startsWith(missingFilter)),
    );
    console.log(``);
    console.log(`   Episodes missing "${missingFilter}": ${filtered.length}`);
    for (const r of filtered.slice(0, 30)) {
      console.log(`     - ${r.slug}`);
    }
    if (filtered.length > 30) console.log(`     ... and ${filtered.length - 30} more`);
  }

  if (noWrite) {
    console.log(``);
    console.log(`   --no-write specified: skipping report files.`);
    return;
  }

  // Write report files
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const dateStamp = new Date().toISOString().slice(0, 10);
  const generatedAt = new Date().toISOString();

  if (formatArg !== "md") {
    const jsonPath = path.join(REPORTS_DIR, `episode-coverage-${dateStamp}.json`);
    fs.writeFileSync(
      jsonPath,
      JSON.stringify(
        {
          generatedAt,
          total: episodes.length,
          fullyOptimised: fullyOptimisedSlugs.size,
          pendingReviewCount,
          fieldCoverage,
          rows,
          scored: scored.map((s) => ({
            slug: s.episode.slug,
            title: s.episode.title,
            score: s.score,
            breakdown: s.breakdown,
          })),
        },
        null,
        2,
      ),
    );
    console.log(`   Wrote ${jsonPath}`);
  }

  if (formatArg !== "json") {
    const md = renderMarkdown({
      rows,
      scored,
      fieldCoverage,
      fullyOptimisedSlugs,
      topN: top,
      generatedAt,
    });
    const mdPath = path.join(REPORTS_DIR, `episode-coverage-${dateStamp}.md`);
    fs.writeFileSync(mdPath, md);
    console.log(`   Wrote ${mdPath}`);
  }

  // Always overwrite the dashboard
  const dashboard = renderDashboard({
    total: episodes.length,
    fullyOptimised: fullyOptimisedSlugs.size,
    fieldCoverage,
    topCohort: scored,
    pendingReviewCount,
    generatedAt,
  });
  fs.writeFileSync(DASHBOARD_PATH, dashboard);
  console.log(`   Wrote ${DASHBOARD_PATH}`);

  // Strict mode: exit non-zero if any episode is missing core fields
  if (strict) {
    const target = newOnly ? rows.slice(0, 5) : rows; // CI: only check newest if --new-only
    const failures = target.filter((r) => r.missing.length > 0);
    if (failures.length > 0) {
      console.error(``);
      console.error(`   STRICT MODE: ${failures.length} episodes are missing fields.`);
      for (const f of failures.slice(0, 10)) {
        console.error(`     ${f.slug}: ${f.missing.map(fieldLabel).join(", ")}`);
      }
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
