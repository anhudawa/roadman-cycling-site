/**
 * scripts/generate-segment-titles.ts
 *
 * Offline pipeline that generates human-readable chapter titles for each
 * transcript segment on every podcast episode. The heuristic titles shipped
 * in `src/lib/transcript.ts` are good enough as navigation but they read
 * like raw speech-to-text ("Welcome back. Today I have a chance…"). This
 * script replaces them with Claude-written titles that sound like real
 * podcast chapter headings ("Dan Lorang on the bike-first off-season",
 * "How Seiler measures Zone 2 compliance").
 *
 * Why this matters for SEO:
 *   - 310 episodes × up to 10 segments = ~1,500 indexable #segment anchors.
 *   - Each anchor's `<h3>` text is what Google uses as the anchor-link title
 *     in sitelinks + key-moments, and what AI crawlers cite when quoting
 *     an episode. Heuristic titles work but leave significant CTR + citation
 *     quality on the table.
 *
 * Idempotent: skips episodes where `segmentTitles` is already present and
 * matches the current segment count. Use --force to regenerate.
 *
 * CLI:
 *   pnpm run titles:generate                 # all episodes, real API calls
 *   pnpm run titles:generate --dry-run       # preview without writing
 *   pnpm run titles:generate --slug=<slug>   # single episode
 *   pnpm run titles:generate --limit=10      # first 10 missing episodes
 *   pnpm run titles:generate --force         # regenerate even if present
 *
 * Requires ANTHROPIC_API_KEY in .env.local or .env.
 */

import fs from "fs";
import path from "path";

// Inline env loader (same pattern as other scripts in this repo)
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
import Anthropic from "@anthropic-ai/sdk";
import { segmentTranscript } from "../src/lib/transcript";

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const slugFilter = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const limit = Number(
  args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0,
);

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");
const MODEL = "claude-opus-4-7";

// ---------------------------------------------------------------------------
// Claude prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You write short, natural-reading chapter titles for podcast transcript segments.

RULES:
- Each title is 3-8 words.
- Titles read like real podcast chapter headings, not sentences extracted from a transcript. No trailing ellipses, no filler words ("uh", "so", "but"), no fragments.
- Each title is distinct from the others in the same episode — if two segments cover the same topic, differentiate them (e.g. by angle, method, or speaker).
- Capture the segment's most specific substantive topic. Prefer concrete phrasing ("Seiler's 80/20 field test") over abstract ("training intensity discussion").
- Never invent content not present in the segment. If a segment is small talk or an intro, say so ("Welcome and intro", "Guest catch-up").

OUTPUT:
Return exactly one JSON array of strings — one title per segment, in order. No prose, no explanation, no markdown code fences. Just the JSON array.`;

function buildUserPrompt(
  episodeTitle: string,
  guest: string | undefined,
  guestCredential: string | undefined,
  segments: { index: number; text: string }[],
): string {
  const parts: string[] = [];
  parts.push(`EPISODE: ${episodeTitle}`);
  if (guest) {
    parts.push(
      `GUEST: ${guest}${guestCredential ? ` (${guestCredential})` : ""}`,
    );
  }
  parts.push(
    `\nHere are ${segments.length} transcript segments in order. Generate a chapter title for each.\n`,
  );
  for (const seg of segments) {
    // Keep segment body bounded — 400 words is enough to identify the topic
    // while keeping per-call token cost predictable.
    const words = seg.text.split(/\s+/).slice(0, 400).join(" ");
    parts.push(`\n--- SEGMENT ${seg.index} ---\n${words}\n`);
  }
  parts.push(
    `\nReturn a JSON array of exactly ${segments.length} title strings.`,
  );
  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

interface EpisodeRecord {
  slug: string;
  filePath: string;
  frontmatter: Record<string, unknown>;
  body: string;
  transcript: string;
  title: string;
  guest?: string;
  guestCredential?: string;
  existingTitles?: string[];
}

function loadEpisodes(): EpisodeRecord[] {
  const files = fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"));
  const records: EpisodeRecord[] = [];

  for (const filename of files) {
    const slug = filename.replace(/\.mdx$/, "");
    if (slugFilter && slug !== slugFilter) continue;

    const filePath = path.join(PODCAST_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const transcript =
      typeof data.transcript === "string" ? data.transcript : "";

    if (!transcript.trim()) continue;

    records.push({
      slug,
      filePath,
      frontmatter: data,
      body: content,
      transcript,
      title: String(data.title ?? slug),
      guest: typeof data.guest === "string" ? data.guest : undefined,
      guestCredential:
        typeof data.guestCredential === "string"
          ? data.guestCredential
          : undefined,
      existingTitles: Array.isArray(data.segmentTitles)
        ? (data.segmentTitles as string[])
        : undefined,
    });
  }

  return records;
}

function parseTitleArray(raw: string, expected: number): string[] | null {
  // Opus's output_config.format should guarantee a JSON array, but we defend
  // against stray prose wrappers just in case.
  const trimmed = raw.trim();
  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket === -1 || lastBracket === -1) return null;
  const jsonSlice = trimmed.slice(firstBracket, lastBracket + 1);

  try {
    const parsed = JSON.parse(jsonSlice);
    if (!Array.isArray(parsed)) return null;
    if (parsed.length !== expected) return null;
    const strings = parsed.map((t) =>
      typeof t === "string" ? t.trim() : String(t).trim(),
    );
    if (strings.some((s) => !s)) return null;
    return strings;
  } catch {
    return null;
  }
}

async function generateTitlesForEpisode(
  client: Anthropic,
  episode: EpisodeRecord,
): Promise<string[] | null> {
  const segments = segmentTranscript(episode.transcript);
  if (segments.length === 0) return null;

  const userPrompt = buildUserPrompt(
    episode.title,
    episode.guest,
    episode.guestCredential,
    segments.map((s) => ({ index: s.index, text: s.text })),
  );

  if (dryRun) {
    console.log(
      `   [DRY RUN] would call ${MODEL} for ${segments.length} segments (${userPrompt.length} chars)`,
    );
    return null;
  }

  // The installed @anthropic-ai/sdk pin is 0.82.0, which predates the
  // typed `output_config.format` / `thinking.adaptive` fields. The prompt
  // already requires a bare JSON array and we parse defensively with
  // `parseTitleArray`, so the simpler API shape is safe here. If the SDK
  // is upgraded later, add `output_config: {format: {...}}` + adaptive
  // thinking for extra guardrails.
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  // Extract text — structured outputs still lands in a text content block
  // for the Messages API (parsing into a typed field is a separate .parse()
  // helper we don't need here).
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;

  const titles = parseTitleArray(textBlock.text, segments.length);
  if (!titles) {
    console.warn(
      `   ⚠️  Could not parse ${segments.length}-item title array from response. Raw:\n${textBlock.text.slice(0, 400)}`,
    );
    return null;
  }
  return titles;
}

function writeSegmentTitles(episode: EpisodeRecord, titles: string[]) {
  const updatedFrontmatter = {
    ...episode.frontmatter,
    segmentTitles: titles,
  };
  const output = matter.stringify(episode.body, updatedFrontmatter);
  fs.writeFileSync(episode.filePath, output, "utf-8");
}

async function main() {
  console.log(`🎙️  Generate segment titles`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Force: ${force}`);
  if (slugFilter) console.log(`   Slug: ${slugFilter}`);
  if (limit) console.log(`   Limit: ${limit}`);
  console.log("");

  if (!dryRun && !process.env.ANTHROPIC_API_KEY) {
    console.error(
      "❌ ANTHROPIC_API_KEY not set in .env.local or .env — required for real runs.",
    );
    process.exit(1);
  }

  const allEpisodes = loadEpisodes();
  const eligible = allEpisodes.filter((ep) => {
    if (force) return true;
    if (!ep.existingTitles) return true;
    // Skip if we already have titles that match current segment count. If
    // chunking changes upstream, this guard forces a regen.
    const currentSegments = segmentTranscript(ep.transcript).length;
    return ep.existingTitles.length !== currentSegments;
  });

  const toProcess = limit > 0 ? eligible.slice(0, limit) : eligible;

  console.log(
    `   Episodes with transcripts: ${allEpisodes.length}`,
  );
  console.log(
    `   Needs titles (or --force): ${eligible.length}`,
  );
  console.log(`   Will process this run: ${toProcess.length}`);
  console.log("");

  if (toProcess.length === 0) {
    console.log("✓ Nothing to do.");
    return;
  }

  const client = dryRun ? (null as unknown as Anthropic) : new Anthropic();

  let succeeded = 0;
  let failed = 0;
  let skippedInvalid = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const ep = toProcess[i];
    const progress = `[${i + 1}/${toProcess.length}]`;
    console.log(`${progress} ${ep.slug}`);

    try {
      // Light rate limit — Opus 4.7 default is 50 RPM; 1 call/sec keeps us
      // comfortably under even with adaptive thinking overhead.
      if (!dryRun && i > 0) {
        await new Promise((r) => setTimeout(r, 1200));
      }

      const titles = await generateTitlesForEpisode(client, ep);
      if (!titles) {
        if (dryRun) {
          // Dry run produces no titles — skip silently
        } else {
          skippedInvalid++;
          console.log(`   ⚠️  Skipped (no titles returned)`);
        }
        continue;
      }

      if (!dryRun) {
        writeSegmentTitles(ep, titles);
      }
      succeeded++;
      console.log(
        `   ✓ ${titles.length} titles · sample: "${titles[0]}" / "${titles[Math.min(titles.length - 1, 1)]}"`,
      );
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      console.log(`   ✗ ${message}`);
      if (err instanceof Anthropic.RateLimitError) {
        // Back off extra hard on 429
        await new Promise((r) => setTimeout(r, 30_000));
      }
    }
  }

  console.log("");
  console.log(`✓ Complete.`);
  console.log(`  Succeeded: ${succeeded}`);
  console.log(`  Parse-skipped: ${skippedInvalid}`);
  console.log(`  Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
