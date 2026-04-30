/**
 * scripts/extract-key-takeaways.ts
 *
 * Generates 3-5 plain-English bullet takeaways for each episode using
 * Claude Sonnet 4.6. Takeaways are higher-level than claims — they
 * summarise what a listener should walk away knowing if they read
 * nothing else, written in second person ("you").
 *
 * Distinct from `answerCapsule` (60-100 word TL;DR paragraph for AI
 * citation) and `claims[]` (discrete factual statements with evidence
 * levels). Takeaways are the skim-friendly bullets near the top of
 * the page.
 *
 * Idempotent: skips episodes with existing keyTakeaways. Safe to run
 * without review queue — these are editorial summaries, not claims.
 *
 * SEO-NEW-20.
 *
 * CLI:
 *   tsx scripts/extract-key-takeaways.ts                  # all eligible
 *   tsx scripts/extract-key-takeaways.ts --slug=ep-...    # one
 *   tsx scripts/extract-key-takeaways.ts --limit=20       # first N
 *   tsx scripts/extract-key-takeaways.ts --dry-run        # preview
 *   tsx scripts/extract-key-takeaways.ts --force          # regenerate
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
const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You write 3-5 short bullet takeaways for cycling-podcast episodes.

OUTPUT: a JSON array of strings, no markdown fencing, no preamble.

Style:
- Each bullet is 8-22 words.
- Plain English, second person ("you" not "we").
- Concrete and actionable where possible — what the listener should DO or BELIEVE differently.
- No fluff: skip "great episode", "amazing guest", "must-listen".
- No motivational filler — "unlock your potential" type phrases are banned.
- Skip statements about the episode itself ("this episode covers...", "you'll learn...") — write the takeaway directly.

Tone:
- Direct, warm, peer-to-peer (the brand voice is "the mate who happens to know world-tour coaches").
- Cycling-specific: training, nutrition, racing, recovery, gear, mindset for serious amateurs.
- Avoid jargon overload — but don't dumb down for true beginners; assume the reader knows what FTP and zone 2 are.

Return ONLY a JSON array of strings.`;

function buildPrompt(args: {
  title: string;
  description?: string;
  capsule?: string;
  guest?: string;
  transcript: string;
}): string {
  const parts: string[] = [];
  parts.push(`EPISODE: ${args.title}`);
  if (args.guest && args.guest !== "null") parts.push(`GUEST: ${args.guest}`);
  if (args.capsule) parts.push(`\nCAPSULE TL;DR:\n${args.capsule}`);
  else if (args.description) parts.push(`\nDESCRIPTION:\n${args.description}`);
  // Send up to 4500 words of transcript — enough to surface the
  // throughline without needing the full 6k for claims.
  const words = args.transcript.split(/\s+/);
  const excerpt =
    words.length > 4500 ? words.slice(0, 4500).join(" ") : args.transcript;
  parts.push(`\nTRANSCRIPT:\n${excerpt}\n`);
  parts.push(`Write 3-5 short, direct, second-person takeaways. Return ONLY a JSON array of strings.`);
  return parts.join("\n");
}

interface EpisodeRecord {
  slug: string;
  filePath: string;
  frontmatter: Record<string, unknown>;
  body: string;
  transcript: string;
  title: string;
  description?: string;
  capsule?: string;
  guest?: string;
  hasTakeaways: boolean;
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
      description: typeof data.description === "string" ? data.description : undefined,
      capsule: typeof data.answerCapsule === "string" ? data.answerCapsule : undefined,
      guest: typeof data.guest === "string" ? data.guest : undefined,
      hasTakeaways:
        Array.isArray(data.keyTakeaways) && data.keyTakeaways.length >= 3,
    });
  }
  return records;
}

async function extractTakeaways(
  client: Anthropic,
  ep: EpisodeRecord,
): Promise<string[] | null> {
  const userPrompt = buildPrompt({
    title: ep.title,
    description: ep.description,
    capsule: ep.capsule,
    guest: ep.guest,
    transcript: ep.transcript,
  });

  if (dryRun) {
    console.log(`   [DRY RUN] would call ${MODEL} (${userPrompt.length} chars)`);
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  let response;
  try {
    response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 800,
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

  if (!Array.isArray(raw)) return null;
  const valid = raw
    .filter((s): s is string => typeof s === "string" && s.trim().length > 8)
    .map((s) => s.trim())
    .slice(0, 5);

  if (valid.length < 3) {
    console.warn(`   Warning: only ${valid.length} valid takeaways — skipping`);
    return null;
  }

  return valid;
}

function writeTakeaways(ep: EpisodeRecord, takeaways: string[]) {
  const updated = { ...ep.frontmatter, keyTakeaways: takeaways };
  const output = matter.stringify(ep.body, updated);
  fs.writeFileSync(ep.filePath, output, "utf-8");
}

async function main() {
  console.log(`Extracting key takeaways`);
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
  const eligible = all.filter((ep) => force || !ep.hasTakeaways);
  const toProcess = limit > 0 ? eligible.slice(0, limit) : eligible;

  console.log(`   Episodes with transcripts: ${all.length}`);
  console.log(`   Needs takeaways: ${eligible.length}`);
  console.log(`   Will process: ${toProcess.length}`);
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
    console.log(`${progress} ${ep.slug}`);

    try {
      if (!dryRun && i > 0) {
        await new Promise((r) => setTimeout(r, 1200));
      }

      const takeaways = await extractTakeaways(client, ep);
      if (!takeaways) {
        skipped++;
        continue;
      }

      if (!dryRun) writeTakeaways(ep, takeaways);
      succeeded++;
      for (const t of takeaways) {
        console.log(`   • ${t}`);
      }
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
