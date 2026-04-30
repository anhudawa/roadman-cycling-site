/**
 * scripts/extract-citations.ts
 *
 * Extracts resources referenced in podcast episodes — papers, books,
 * tools, other episodes, websites — using Claude Opus 4.7. Output is
 * appended to MDX frontmatter as `citations[]` with `reviewed: false`,
 * gated behind the editorial review queue.
 *
 * SEO-NEW-20.
 *
 * CLI:
 *   tsx scripts/extract-citations.ts                    # all eligible episodes
 *   tsx scripts/extract-citations.ts --slug=ep-...      # single episode
 *   tsx scripts/extract-citations.ts --limit=10         # first N
 *   tsx scripts/extract-citations.ts --dry-run          # preview only
 *   tsx scripts/extract-citations.ts --force            # regenerate
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

type CitationType = "paper" | "book" | "article" | "tool" | "episode" | "website";

interface ExtractedCitation {
  title: string;
  type: CitationType;
  url?: string;
  author?: string;
  reviewed: false;
}

const VALID_TYPES: ReadonlySet<string> = new Set([
  "paper",
  "book",
  "article",
  "tool",
  "episode",
  "website",
]);

const SYSTEM_PROMPT = `You extract concrete resources referenced in cycling-podcast transcripts.

OUTPUT: a JSON array of citation objects, no markdown fencing, no preamble.

Each object:
{
  "title": "Title of the resource as named in the conversation",
  "type": "paper" | "book" | "article" | "tool" | "episode" | "website",
  "url": "Optional canonical URL if you know it confidently",
  "author": "Optional author / creator if named"
}

Type definitions:
- "paper"    — a peer-reviewed study or formal research paper, with author / journal cited.
- "book"     — a published book.
- "article"  — magazine / newspaper / blog article.
- "tool"     — software, app, training platform, calculator.
- "episode"  — another podcast episode (Roadman or otherwise).
- "website"  — a website or domain referenced (without it being a specific article).

Rules:
- Extract 0 to 8 citations. If nothing concrete is named, return [].
- Do NOT invent URLs. Only include url if you are confident it is correct (e.g. PubMed for a clearly-named paper, the official tool homepage, the wikipedia page for a book). When unsure, omit url.
- Do NOT include vague mentions ("a study showed", "I read somewhere") — only resources named clearly enough that a reader could look them up.
- Do NOT include the host's own podcast generically ("the Roadman podcast"); only specific episodes if a title is given.
- Skip generic gear / bike brands unless the discussion is specifically about a product to evaluate.

Return ONLY a JSON array (possibly empty).`;

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

  const words = args.transcript.split(/\s+/);
  const excerpt =
    words.length > 6000 ? words.slice(0, 6000).join(" ") : args.transcript;
  parts.push(`\nTRANSCRIPT:\n${excerpt}\n`);
  parts.push(
    `Extract concrete resources mentioned in the conversation. Return ONLY a JSON array, possibly empty.`,
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
  existingCitations?: Array<{ title: string; type: CitationType; reviewed?: boolean }>;
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
      existingCitations: Array.isArray(data.citations)
        ? (data.citations as ExtractedCitation[])
        : undefined,
    });
  }
  return records;
}

async function extractCitations(
  client: Anthropic,
  ep: EpisodeRecord,
): Promise<ExtractedCitation[] | null> {
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
        max_tokens: 1500,
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

  const valid: ExtractedCitation[] = [];
  for (const item of raw) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as { title?: unknown }).title !== "string" ||
      typeof (item as { type?: unknown }).type !== "string"
    )
      continue;
    const title = (item as { title: string }).title.trim();
    const type = (item as { type: string }).type.toLowerCase();
    if (title.length < 3 || title.length > 200) continue;
    if (!VALID_TYPES.has(type)) continue;

    const urlRaw = (item as { url?: unknown }).url;
    const url =
      typeof urlRaw === "string" && /^https?:\/\//i.test(urlRaw.trim())
        ? urlRaw.trim()
        : undefined;
    const authorRaw = (item as { author?: unknown }).author;
    const author =
      typeof authorRaw === "string" && authorRaw.trim().length > 0
        ? authorRaw.trim()
        : undefined;

    valid.push({
      title,
      type: type as CitationType,
      ...(url ? { url } : {}),
      ...(author ? { author } : {}),
      reviewed: false,
    });
  }

  return valid.slice(0, 8);
}

function writeCitations(ep: EpisodeRecord, citations: ExtractedCitation[]) {
  const updated = { ...ep.frontmatter, citations };
  const output = matter.stringify(ep.body, updated);
  fs.writeFileSync(ep.filePath, output, "utf-8");
}

function shouldProcess(ep: EpisodeRecord): boolean {
  if (force) return true;
  const existing = ep.existingCitations ?? [];
  const reviewed = existing.filter((c) => c.reviewed !== false);
  return reviewed.length === 0;
}

async function main() {
  console.log(`Extracting citations`);
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
  let empty = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const ep = toProcess[i];
    const progress = `[${i + 1}/${toProcess.length}]`;
    console.log(`${progress} ${ep.slug}`);

    try {
      if (!dryRun && i > 0) {
        await new Promise((r) => setTimeout(r, 1500));
      }

      const citations = await extractCitations(client, ep);
      if (!citations) {
        console.log(`   Skipped (invalid response)`);
        continue;
      }
      if (citations.length === 0) {
        empty++;
        console.log(`   No concrete citations found`);
        if (!dryRun) writeCitations(ep, citations); // empty array is still a write so we don't re-process
        continue;
      }

      if (!dryRun) writeCitations(ep, citations);
      succeeded++;
      for (const c of citations.slice(0, 3)) {
        console.log(`   [${c.type}] ${c.title}${c.author ? ` — ${c.author}` : ""}`);
      }
      if (citations.length > 3) console.log(`   … +${citations.length - 3} more`);
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
  console.log(`  Empty (no citations): ${empty}`);
  console.log(`  Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
