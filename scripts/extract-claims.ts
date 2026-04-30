/**
 * scripts/extract-claims.ts
 *
 * Extracts 5–10 discrete factual claims per podcast episode using
 * Claude Opus 4.7. Each claim is tagged with an evidence level —
 * `study | expert | practice | anecdote | opinion` — per the
 * definitions in `src/lib/podcast.ts`. Output is appended to MDX
 * frontmatter as `claims[]` with `reviewed: false` set on every new
 * claim, so the page renderer hides them until a human approves
 * via `scripts/review-claims.ts`.
 *
 * Idempotent. By default skips episodes that already have at least 3
 * reviewed claims. `--force` regenerates regardless.
 *
 * SEO-NEW-20 — see docs/superpowers/specs/2026-04-30-seo-new-20-podcast-seo-at-scale-design.md
 *
 * CLI:
 *   tsx scripts/extract-claims.ts                    # all eligible episodes
 *   tsx scripts/extract-claims.ts --slug=ep-2148-... # single episode
 *   tsx scripts/extract-claims.ts --limit=10         # first N
 *   tsx scripts/extract-claims.ts --dry-run          # preview, no writes
 *   tsx scripts/extract-claims.ts --force            # regenerate even when present
 *
 * Requires ANTHROPIC_API_KEY.
 */

import fs from "fs";
import path from "path";

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

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const slugFilter = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const limit = Number(
  args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0,
);

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");
const MODEL = "claude-opus-4-7";

type Evidence = "study" | "expert" | "practice" | "anecdote" | "opinion";

interface ExtractedClaim {
  claim: string;
  evidence: Evidence;
  source?: string;
  reviewed: false;
}

const SYSTEM_PROMPT = `You extract discrete factual claims from cycling-podcast transcripts and grade each by evidence level.

OUTPUT: a JSON array of claim objects, no markdown fencing, no preamble.

Each object:
{
  "claim": "A single factual statement, 12-40 words, in the third person.",
  "evidence": "study" | "expert" | "practice" | "anecdote" | "opinion",
  "source": "Optional citation if the speaker named one (paper, study, expert, year)."
}

Evidence definitions — be strict, do NOT inflate:
- "study"     — a peer-reviewed paper, formal trial, or well-known body of research is explicitly referenced. If the speaker says "research shows" without naming the work, it is NOT study, it is "expert".
- "expert"    — stated by a named expert with relevant credentials (sport scientist, World Tour coach, team doctor) about their domain.
- "practice"  — observed pattern from coaching, racing, or team practice ("what we see across riders we coach").
- "anecdote"  — single rider or single race example.
- "opinion"   — host or guest perspective without further support.

Selection rules:
- Extract 5 to 10 claims, no more.
- Each claim must be a discrete fact, not a paragraph or general topic.
- Skip generic motivation ("you can do it"), pleasantries, and meta-commentary.
- Strip filler — "I think", "you know" — but never invent content.
- One claim per line in the array. Do not concatenate ideas with "and".
- If the transcript mostly riffs on identity / motivation with little factual content, return fewer claims (3 minimum) rather than padding.

Return ONLY the JSON array.`;

function buildPrompt(args: {
  title: string;
  guest?: string;
  guestCredential?: string;
  transcript: string;
}): string {
  const parts: string[] = [];
  parts.push(`EPISODE: ${args.title}`);
  if (args.guest && args.guest !== "null") {
    parts.push(
      `GUEST: ${args.guest}${args.guestCredential && args.guestCredential !== "null" ? ` (${args.guestCredential})` : ""}`,
    );
  }
  parts.push(`HOST: Anthony Walsh (Roadman Cycling)`);

  // Send up to ~6000 words — enough to reach claims late in the conversation
  // without blowing context budget for Opus.
  const words = args.transcript.split(/\s+/);
  const excerpt =
    words.length > 6000 ? words.slice(0, 6000).join(" ") : args.transcript;
  parts.push(`\nTRANSCRIPT:\n${excerpt}\n`);
  parts.push(
    `Extract 5-10 discrete factual claims with evidence levels. Return ONLY a JSON array.`,
  );
  return parts.join("\n");
}

interface EpisodeRecord {
  slug: string;
  filePath: string;
  frontmatter: Record<string, unknown>;
  body: string;
  transcript: string;
  title: string;
  guest?: string;
  guestCredential?: string;
  existingClaims?: Array<{ claim: string; evidence: Evidence; source?: string; reviewed?: boolean }>;
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
    const transcript = typeof data.transcript === "string" ? data.transcript : "";
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
        typeof data.guestCredential === "string" ? data.guestCredential : undefined,
      existingClaims: Array.isArray(data.claims)
        ? (data.claims as ExtractedClaim[])
        : undefined,
    });
  }
  return records;
}

const VALID_EVIDENCE: ReadonlySet<string> = new Set([
  "study",
  "expert",
  "practice",
  "anecdote",
  "opinion",
]);

async function extractClaims(
  client: Anthropic,
  ep: EpisodeRecord,
): Promise<ExtractedClaim[] | null> {
  const userPrompt = buildPrompt({
    title: ep.title,
    guest: ep.guest,
    guestCredential: ep.guestCredential,
    transcript: ep.transcript,
  });

  if (dryRun) {
    console.log(`   [DRY RUN] would call ${MODEL} (${userPrompt.length} chars)`);
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);
  let response;
  try {
    response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 2500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      },
      { signal: controller.signal },
    );
  } finally {
    clearTimeout(timer);
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;

  let jsonText = textBlock.text.trim();
  jsonText = jsonText
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/, "");

  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    console.warn(`   Warning: failed to parse JSON response`);
    return null;
  }

  if (!Array.isArray(raw)) {
    console.warn(`   Warning: response was not an array`);
    return null;
  }

  const valid: ExtractedClaim[] = [];
  for (const item of raw) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as { claim?: unknown }).claim !== "string" ||
      typeof (item as { evidence?: unknown }).evidence !== "string"
    )
      continue;
    const claim = (item as { claim: string }).claim.trim();
    const evidence = (item as { evidence: string }).evidence.toLowerCase();
    if (claim.length < 10 || claim.length > 400) continue;
    if (!VALID_EVIDENCE.has(evidence)) continue;
    const source =
      typeof (item as { source?: unknown }).source === "string"
        ? ((item as { source: string }).source.trim() || undefined)
        : undefined;
    valid.push({
      claim,
      evidence: evidence as Evidence,
      ...(source ? { source } : {}),
      reviewed: false,
    });
  }

  if (valid.length < 3) {
    console.warn(`   Warning: ${valid.length} valid claims after filtering — skipping`);
    return null;
  }

  return valid.slice(0, 10);
}

function writeClaims(ep: EpisodeRecord, claims: ExtractedClaim[]) {
  const updated = { ...ep.frontmatter, claims };
  const output = matter.stringify(ep.body, updated);
  fs.writeFileSync(ep.filePath, output, "utf-8");
}

function shouldProcess(ep: EpisodeRecord): boolean {
  if (force) return true;
  const existing = ep.existingClaims ?? [];
  // Already has 3+ reviewed claims → skip. Has only unreviewed claims
  // (queue still pending) or very few claims → re-run.
  const reviewed = existing.filter((c) => c.reviewed !== false);
  return reviewed.length < 3;
}

async function main() {
  console.log(`Extracting claims with evidence levels`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Force: ${force}`);
  if (slugFilter) console.log(`   Slug: ${slugFilter}`);
  if (limit) console.log(`   Limit: ${limit}`);
  console.log(``);

  if (!dryRun && !process.env.ANTHROPIC_API_KEY) {
    console.error(`ANTHROPIC_API_KEY not set in .env.local or .env.`);
    process.exit(1);
  }

  const all = loadEpisodes();
  const eligible = all.filter(shouldProcess);
  const toProcess = limit > 0 ? eligible.slice(0, limit) : eligible;

  console.log(`   Episodes with transcripts: ${all.length}`);
  console.log(`   Needs extraction: ${eligible.length}`);
  console.log(`   Will process this run: ${toProcess.length}`);
  console.log(``);

  if (toProcess.length === 0) {
    console.log(`Nothing to do.`);
    return;
  }

  const client = dryRun ? (null as unknown as Anthropic) : new Anthropic();

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const ep = toProcess[i];
    const progress = `[${i + 1}/${toProcess.length}]`;
    console.log(`${progress} ${ep.slug} (${ep.guest ?? "no guest"})`);

    try {
      if (!dryRun && i > 0) {
        await new Promise((r) => setTimeout(r, 1500));
      }

      const claims = await extractClaims(client, ep);
      if (!claims) {
        if (!dryRun) skipped++;
        console.log(`   Skipped (invalid response)`);
        continue;
      }

      if (!dryRun) writeClaims(ep, claims);
      succeeded++;
      for (const c of claims.slice(0, 3)) {
        console.log(`   [${c.evidence}] ${c.claim.slice(0, 100)}${c.claim.length > 100 ? "..." : ""}`);
      }
      if (claims.length > 3) console.log(`   … +${claims.length - 3} more`);
      console.log(`   reviewed:false on all ${claims.length} — clear the queue with tsx scripts/review-claims.ts`);
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      console.log(`   Error: ${message}`);
      if (err instanceof Anthropic.RateLimitError) {
        console.log(`   Rate limited, waiting 30s...`);
        await new Promise((r) => setTimeout(r, 30_000));
      }
    }
  }

  console.log(``);
  console.log(`Complete.`);
  console.log(`  Succeeded: ${succeeded}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
