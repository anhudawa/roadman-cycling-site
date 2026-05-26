#!/usr/bin/env tsx
// ---------------------------------------------------------------------------
// Roadman Cycling — Structured claim/quote/tag extraction CLI
//
// Processes podcast episode transcripts (content/podcast/*.mdx) and extracts
// claims, verbatim quotes, and canonical-mapped topic tags. Dry-run writes
// reviewable JSON; a live run inserts into the claims / quotes / topic_tags
// tables. The LLM is accessed through the provider-agnostic LLMClient, so
// `--mock` runs the whole pipeline offline (no API key, no network).
//
// Usage:
//   tsx src/extract.ts --dry-run --mock                 # offline, all episodes
//   tsx src/extract.ts --dry-run --episode=<slug>       # one episode -> JSON
//   tsx src/extract.ts --dry-run --limit=20             # first 20 (Claude)
//   tsx src/extract.ts --episode=<slug>                 # live: extract + DB insert
//
// Flags:
//   --dry-run            write JSON only, never touch the DB (recommended first)
//   --mock               use the offline mock LLM (implies offline; great for tests)
//   --episode=<slug>     process a single episode
//   --limit=<n>          cap how many episodes to process
//   --min-words=<n>      skip transcripts shorter than n words (default 50)
//   --model=<id>         override the Claude model id
//   --out=<dir>          JSON output dir (default agents/.../output/extractions)
// ---------------------------------------------------------------------------

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { loadEnv } from "./config.js";
import { createLLMClient, type LLMRequest } from "./lib/llm.js";
import {
  extractFromEpisode,
  type EpisodeExtraction,
  type ExtractionInput,
} from "./steps/extract-claims.js";

// --- CLI parsing -------------------------------------------------------------

const args = process.argv.slice(2);
const has = (name: string) => args.includes(`--${name}`);
const val = (name: string) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");

const dryRun = has("dry-run");
const mock = has("mock");
const episodeArg = val("episode");
const limit = val("limit") ? Number(val("limit")) : undefined;
const minWords = val("min-words") ? Number(val("min-words")) : 50;
const modelOverride = val("model");

// --- Repo paths --------------------------------------------------------------

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (
      fs.existsSync(path.join(dir, "package.json")) &&
      fs.existsSync(path.join(dir, "content/podcast"))
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return path.resolve(process.cwd());
}

const repoRoot = findRepoRoot();
loadEnv(repoRoot);

const PODCAST_DIR = path.join(repoRoot, "content/podcast");
const TRANSCRIPTS_DIR = path.join(PODCAST_DIR, "transcripts");
const PROMPTS_DIR = path.join(repoRoot, "agents/transcript-indexer/prompts");
const OUT_DIR =
  val("out") ??
  path.join(repoRoot, "agents/transcript-indexer/output/extractions");

// --- Episode loading ---------------------------------------------------------

function readTranscript(slug: string, frontmatterTranscript?: unknown): string | null {
  if (typeof frontmatterTranscript === "string" && frontmatterTranscript.trim().length > 50) {
    return frontmatterTranscript;
  }
  const txt = path.join(TRANSCRIPTS_DIR, `${slug}.txt`);
  if (fs.existsSync(txt)) {
    const text = fs.readFileSync(txt, "utf-8").trim();
    if (text.length > 50) return text;
  }
  return null;
}

function loadEpisode(slug: string): ExtractionInput | null {
  const file = path.join(PODCAST_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data } = matter(fs.readFileSync(file, "utf-8"));
  const transcript = readTranscript(slug, data.transcript);
  if (!transcript) return null;
  return {
    slug,
    title: String(data.title ?? slug),
    guest: data.guest ? String(data.guest) : null,
    publishDate: data.publishDate ? String(data.publishDate) : undefined,
    pillar: data.pillar ? String(data.pillar) : undefined,
    transcript,
  };
}

function listEpisodeSlugs(): string[] {
  return fs
    .readdirSync(PODCAST_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
    .sort();
}

// --- Mock LLM (offline) ------------------------------------------------------

function extractSection(user: string, heading: string): string {
  const idx = user.indexOf(heading);
  if (idx === -1) return "";
  return user.slice(idx + heading.length).trim();
}

/**
 * Deterministic stand-in for the model: derives plausible claims/quotes/tags
 * straight from the transcript so a dry-run exercises parsing, validation,
 * canonical mapping, word counts, and JSON output with zero network.
 */
function mockHandler(req: LLMRequest): string {
  const transcript = extractSection(req.user, "## Transcript\n");
  const guestMatch = req.user.match(/^Guest:\s*(.+)$/m);
  const guest =
    guestMatch && !guestMatch[1].startsWith("(") ? guestMatch[1].trim() : "Anthony Walsh";

  const sentences = transcript
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40);

  const claims = sentences.slice(0, 5).map((s) => ({
    claim: s.length > 220 ? s.slice(0, 217) + "…" : s,
    confidence: 0.6,
    evidence: "expert",
    claimType: "recommendation",
    speaker: guest,
    supportingQuote: s.slice(0, 160),
    topicTags: [] as string[],
  }));

  const quotes = sentences
    .filter((s) => {
      const w = s.split(/\s+/).length;
      return w >= 20 && w <= 120;
    })
    .slice(0, 3)
    .map((s) => ({
      quote: s,
      speaker: guest,
      speakerCredential: null,
      context: "Drawn from the episode discussion.",
      topicTags: [] as string[],
    }));

  return JSON.stringify({
    claims,
    quotes,
    topicTags: [
      { tag: guest, kind: "entity", relevance: 0.9 },
      { tag: "Zone 2 endurance training", kind: "topic", relevance: 0.5 },
    ],
  });
}

// --- Output ------------------------------------------------------------------

function writeJson(ex: EpisodeExtraction): string {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, `${ex.slug}.json`);
  fs.writeFileSync(out, JSON.stringify(ex, null, 2));
  return out;
}

async function insertExtraction(ex: EpisodeExtraction): Promise<void> {
  // Lazy import so dry-run / mock never load the DB layer or require env.
  const { db } = await import("@/lib/db");
  const schema = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  // Idempotent: clear prior rows for this episode, then insert fresh.
  await db.delete(schema.claims).where(eq(schema.claims.episodeSlug, ex.slug));
  await db.delete(schema.quotes).where(eq(schema.quotes.episodeSlug, ex.slug));
  await db.delete(schema.topicTags).where(eq(schema.topicTags.episodeSlug, ex.slug));

  if (ex.claims.length > 0) {
    await db.insert(schema.claims).values(
      ex.claims.map((c) => ({
        episodeSlug: ex.slug,
        claim: c.claim,
        confidence: c.confidence,
        evidence: c.evidence,
        claimType: c.claimType,
        speaker: c.speaker,
        speakerEntitySlug: c.speakerEntitySlug,
        supportingQuote: c.supportingQuote,
        timestamp: c.timestamp,
        topicTags: c.topicTags,
        reviewed: false,
        model: ex.model,
      }))
    );
  }
  if (ex.quotes.length > 0) {
    await db.insert(schema.quotes).values(
      ex.quotes.map((q) => ({
        episodeSlug: ex.slug,
        quote: q.quote,
        speaker: q.speaker,
        speakerCredential: q.speakerCredential,
        speakerEntitySlug: q.speakerEntitySlug,
        wordCount: q.wordCount,
        context: q.context,
        timestamp: q.timestamp,
        topicTags: q.topicTags,
        reviewed: false,
        model: ex.model,
      }))
    );
  }
  if (ex.topicTags.length > 0) {
    await db.insert(schema.topicTags).values(
      ex.topicTags.map((t) => ({
        episodeSlug: ex.slug,
        tag: t.tag,
        slug: t.slug,
        kind: t.kind,
        entitySlug: t.entitySlug,
        relevance: t.relevance,
        reviewed: false,
        model: ex.model,
      }))
    );
  }
}

// --- Main --------------------------------------------------------------------

async function main() {
  console.log("=== Roadman Cycling — Claim Extraction ===");
  console.log(
    `Mode: ${dryRun ? "dry-run (JSON only)" : "live (DB insert)"} | LLM: ${
      mock ? "mock (offline)" : modelOverride ?? "claude (default)"
    }`
  );
  console.log(`Repo root: ${repoRoot}`);

  if (!dryRun && mock) {
    console.error(
      "Refusing to insert mock extractions into the DB. Use --dry-run with --mock."
    );
    process.exit(1);
  }

  const llm = createLLMClient({ mock, mockHandler, model: modelOverride });

  const slugs = episodeArg ? [episodeArg] : listEpisodeSlugs();
  const selected = limit ? slugs.slice(0, limit) : slugs;
  console.log(`Episodes to consider: ${selected.length}`);
  console.log("");

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  let totalClaims = 0;
  let totalQuotes = 0;
  let totalTags = 0;
  let totalCost = 0;

  for (const slug of selected) {
    const episode = loadEpisode(slug);
    if (!episode) {
      skipped++;
      continue;
    }
    const words = episode.transcript.split(/\s+/).length;
    if (words < minWords) {
      console.log(`  skip ${slug}: transcript too short (${words} words)`);
      skipped++;
      continue;
    }

    try {
      const ex = await extractFromEpisode(episode, llm, { promptsDir: PROMPTS_DIR });
      const entityTags = ex.topicTags.filter((t) => t.kind === "entity").length;

      if (dryRun) {
        const out = writeJson(ex);
        console.log(
          `  ✓ ${slug}: ${ex.claims.length} claims, ${ex.quotes.length} quotes, ${ex.topicTags.length} tags (${entityTags} entities) → ${path.relative(repoRoot, out)}`
        );
      } else {
        writeJson(ex);
        await insertExtraction(ex);
        console.log(
          `  ✓ ${slug}: inserted ${ex.claims.length} claims, ${ex.quotes.length} quotes, ${ex.topicTags.length} tags`
        );
      }

      processed++;
      totalClaims += ex.claims.length;
      totalQuotes += ex.quotes.length;
      totalTags += ex.topicTags.length;
      totalCost += ex.usage.costUsd;
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${slug}: ${msg}`);
    }
  }

  console.log("");
  console.log("=== Summary ===");
  console.log(`Processed: ${processed} | Skipped: ${skipped} | Failed: ${failed}`);
  console.log(`Claims: ${totalClaims} | Quotes: ${totalQuotes} | Tags: ${totalTags}`);
  if (!mock) console.log(`Estimated LLM cost: $${totalCost.toFixed(4)}`);
  if (dryRun) console.log(`JSON written to: ${path.relative(repoRoot, OUT_DIR)}/`);
}

main().catch((err) => {
  console.error("Extraction failed:", err);
  process.exit(1);
});
