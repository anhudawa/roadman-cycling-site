/**
 * scripts/extract-key-quotes.ts
 *
 * Extracts 2-3 notable verbatim quotes from each podcast episode transcript
 * using Claude Sonnet 4.6. Writes `keyQuotes` back into the episode MDX
 * frontmatter for rendering as styled blockquotes with schema.org Quotation
 * markup.
 *
 * Quote selection criteria:
 *   - Verbatim from the transcript, not paraphrased
 *   - 1-3 sentences, quotable in isolation
 *   - Attributed to a specific named speaker
 *   - Prefers quotes with data, research findings, or actionable advice
 *   - Skips generic motivational statements
 *
 * Idempotent: skips episodes with existing `keyQuotes`. Use --force to
 * regenerate.
 *
 * CLI:
 *   npx tsx scripts/extract-key-quotes.ts                # all episodes
 *   npx tsx scripts/extract-key-quotes.ts --dry-run      # preview
 *   npx tsx scripts/extract-key-quotes.ts --slug=X       # single episode
 *   npx tsx scripts/extract-key-quotes.ts --limit=30     # first N eligible
 *   npx tsx scripts/extract-key-quotes.ts --force        # regenerate
 *
 * Requires ANTHROPIC_API_KEY in .env.local or .env.
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Env loader (same pattern as scripts/generate-cluster-articles.ts)
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
import Anthropic from "@anthropic-ai/sdk";

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
const MODEL = "claude-sonnet-4-6";

// ---------------------------------------------------------------------------
// Claude prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You extract notable verbatim quotes from podcast transcripts.

RULES:
- Extract exactly 2-3 quotes from the transcript.
- Each quote MUST be verbatim text from the transcript — do not paraphrase or clean up grammar.
- Each quote should be 1-3 sentences (roughly 15-60 words).
- Each quote must be attributed to a specific named speaker (not "the host" or "the guest").
- Prefer quotes that contain:
  - Specific numbers, data points, or research findings
  - Actionable advice or training recommendations
  - Surprising or counterintuitive insights
  - Expert authority (credentials-based statements)
- Skip generic motivational statements, pleasantries, or filler.
- Minor speech disfluencies (um, uh, you know) may be removed for readability, but the substance must remain verbatim.

OUTPUT FORMAT:
Return a JSON array (no markdown fencing, no preamble, no explanation). Each element:
{
  "text": "The verbatim quote text",
  "speaker": "Full Name of Speaker",
  "credential": "Their role or credential (optional, omit if unknown)"
}

Return ONLY the JSON array. Nothing else.`;

function buildUserPrompt(
  title: string,
  guest: string | undefined,
  guestCredential: string | undefined,
  guestName: string | undefined,
  guestCredentials: string | undefined,
  transcript: string,
): string {
  const parts: string[] = [];
  parts.push(`EPISODE TITLE: ${title}`);

  // Use the most reliable guest name/credential available
  const resolvedGuest = guestName || guest;
  const resolvedCredential = guestCredentials || guestCredential;
  if (resolvedGuest && resolvedGuest !== "null") {
    parts.push(
      `GUEST: ${resolvedGuest}${resolvedCredential && resolvedCredential !== "null" ? ` (${resolvedCredential})` : ""}`,
    );
  }
  parts.push(`HOST: Anthony Walsh (Roadman Cycling podcast host)`);

  // Send up to ~4000 words of the transcript to capture a good range of
  // quotable material without blowing the context budget.
  const words = transcript.split(/\s+/);
  const excerpt =
    words.length > 4000 ? words.slice(0, 4000).join(" ") : transcript;
  parts.push(`\nTRANSCRIPT:\n${excerpt}\n`);
  parts.push(
    `Extract 2-3 notable verbatim quotes from this transcript. Return ONLY a JSON array.`,
  );
  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface KeyQuote {
  text: string;
  speaker: string;
  credential?: string;
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
  guestName?: string;
  guestCredentials?: string;
  existingQuotes?: KeyQuote[];
  hasNamedGuest: boolean;
}

// ---------------------------------------------------------------------------
// Load episodes
// ---------------------------------------------------------------------------
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

    const guestName =
      typeof data.guestName === "string" && data.guestName !== "null"
        ? data.guestName
        : undefined;
    const guestCredentials =
      typeof data.guestCredentials === "string" &&
      data.guestCredentials !== "null"
        ? data.guestCredentials
        : undefined;
    const guest =
      typeof data.guest === "string" ? data.guest : undefined;
    const guestCredential =
      typeof data.guestCredential === "string"
        ? data.guestCredential
        : undefined;

    // Determine if there's a real named guest (not "Rider Support", not episode title)
    const resolvedGuest = guestName || guest;
    const hasNamedGuest = !!(
      resolvedGuest &&
      resolvedGuest !== "null" &&
      resolvedGuest !== "Rider Support" &&
      !resolvedGuest.includes("Vlog") &&
      resolvedGuest.split(" ").length >= 2 &&
      resolvedGuest.length < 60
    );

    const existingQuotes = Array.isArray(data.keyQuotes)
      ? (data.keyQuotes as KeyQuote[])
      : undefined;

    records.push({
      slug,
      filePath,
      frontmatter: data,
      body: content,
      transcript,
      title: String(data.title ?? slug),
      guest,
      guestCredential,
      guestName,
      guestCredentials,
      existingQuotes,
      hasNamedGuest,
    });
  }

  return records;
}

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------
async function extractQuotes(
  client: Anthropic,
  episode: EpisodeRecord,
): Promise<KeyQuote[] | null> {
  const userPrompt = buildUserPrompt(
    episode.title,
    episode.guest,
    episode.guestCredential,
    episode.guestName,
    episode.guestCredentials,
    episode.transcript,
  );

  if (dryRun) {
    console.log(
      `   [DRY RUN] would call ${MODEL} (${userPrompt.length} chars)`,
    );
    return null;
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;

  let jsonText = textBlock.text.trim();
  // Strip any markdown code fencing
  jsonText = jsonText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "");

  let quotes: KeyQuote[];
  try {
    quotes = JSON.parse(jsonText);
  } catch {
    console.warn(`   Warning: Failed to parse JSON response`);
    return null;
  }

  if (!Array.isArray(quotes) || quotes.length === 0) {
    console.warn(`   Warning: Response was not a non-empty array`);
    return null;
  }

  // Validate each quote
  const valid = quotes.filter(
    (q) =>
      typeof q.text === "string" &&
      q.text.length > 10 &&
      typeof q.speaker === "string" &&
      q.speaker.length > 1,
  );

  if (valid.length === 0) {
    console.warn(`   Warning: No valid quotes after filtering`);
    return null;
  }

  // Normalize: remove credential if empty string
  return valid.slice(0, 3).map((q) => ({
    text: q.text.trim(),
    speaker: q.speaker.trim(),
    ...(q.credential && q.credential.trim()
      ? { credential: q.credential.trim() }
      : {}),
  }));
}

// ---------------------------------------------------------------------------
// Write back
// ---------------------------------------------------------------------------
function writeKeyQuotes(episode: EpisodeRecord, quotes: KeyQuote[]) {
  const updatedFrontmatter = {
    ...episode.frontmatter,
    keyQuotes: quotes,
  };
  const output = matter.stringify(episode.body, updatedFrontmatter);
  fs.writeFileSync(episode.filePath, output, "utf-8");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`Extracting key quotes from podcast transcripts`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Force: ${force}`);
  if (slugFilter) console.log(`   Slug: ${slugFilter}`);
  if (limit) console.log(`   Limit: ${limit}`);
  console.log("");

  if (!dryRun && !process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set in .env.local or .env.");
    process.exit(1);
  }

  const allEpisodes = loadEpisodes();

  // Prioritise episodes with named expert guests
  const withGuests = allEpisodes.filter((ep) => ep.hasNamedGuest);
  const withoutGuests = allEpisodes.filter((ep) => !ep.hasNamedGuest);
  const prioritised = [...withGuests, ...withoutGuests];

  const eligible = prioritised.filter(
    (ep) => force || !ep.existingQuotes,
  );
  const toProcess = limit > 0 ? eligible.slice(0, limit) : eligible;

  console.log(`   Episodes with transcripts: ${allEpisodes.length}`);
  console.log(`   With named guests: ${withGuests.length}`);
  console.log(`   Needs quotes (or --force): ${eligible.length}`);
  console.log(`   Will process this run: ${toProcess.length}`);
  console.log("");

  if (toProcess.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  const client = dryRun ? (null as unknown as Anthropic) : new Anthropic();

  let succeeded = 0;
  let failed = 0;
  let skippedInvalid = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const ep = toProcess[i];
    const progress = `[${i + 1}/${toProcess.length}]`;
    const guestLabel = ep.guestName || ep.guest || "no guest";
    console.log(`${progress} ${ep.slug} (${guestLabel})`);

    try {
      // Rate-limit delay between API calls
      if (!dryRun && i > 0) {
        await new Promise((r) => setTimeout(r, 1200));
      }

      const quotes = await extractQuotes(client, ep);
      if (!quotes) {
        if (!dryRun) {
          skippedInvalid++;
          console.log(`   Skipped (invalid response)`);
        }
        continue;
      }

      if (!dryRun) writeKeyQuotes(ep, quotes);
      succeeded++;
      for (const q of quotes) {
        console.log(
          `   "${q.text.slice(0, 70)}${q.text.length > 70 ? "..." : ""}" -- ${q.speaker}`,
        );
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

  console.log("");
  console.log(`Complete.`);
  console.log(`  Succeeded: ${succeeded}`);
  console.log(`  Invalid-skipped: ${skippedInvalid}`);
  console.log(`  Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
