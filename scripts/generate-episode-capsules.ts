/**
 * scripts/generate-episode-capsules.ts
 *
 * Generates citation-ready answer capsules (60$€“100 word TL;DRs) for every
 * podcast episode with a transcript. Writes `answerCapsule` back to the
 * episode MDX frontmatter.
 *
 * Why this matters for AEO (answer-engine optimisation):
 *   - Episode pages currently show `seoDescription` (155 chars, keyword-
 *     dense, SERP-optimised) as the .answer-capsule block. That's fine
 *     for Google snippets but terrible for AI-citation quality $€” it reads
 *     like ad copy, not a self-contained factual summary.
 *   - A curated 60$€“100 word capsule written from the full transcript is
 *     what ChatGPT/Perplexity/Claude will actually quote when the
 *     episode is used as a source. Higher chance of surfacing Roadman
 *     as an authoritative citation.
 *
 * Idempotent: skips episodes with an existing `answerCapsule`. --force
 * regenerates.
 *
 * CLI:
 *   pnpm run seo:capsules:episodes               # all episodes
 *   pnpm run seo:capsules:episodes:dry           # preview
 *   pnpm run seo:capsules:episodes -- --slug=X   # single episode
 *   pnpm run seo:capsules:episodes -- --limit=N  # first N missing
 *   pnpm run seo:capsules:episodes -- --force    # regenerate even if set
 *
 * Requires ANTHROPIC_API_KEY in .env.local or .env.
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

const SYSTEM_PROMPT = `You write citation-ready TL;DR capsules for podcast episodes.

CONTEXT:
These capsules are rendered at the top of the episode page and read by AI
assistants (ChatGPT, Perplexity, Claude) when citing the episode as a
source. They are distinct from SEO meta descriptions $€” this is a factual,
self-contained summary that holds up when quoted on its own.

RULES:
- 60$€“100 words. Two to three short sentences.
- Authoritative and specific. Lead with the concrete thesis or finding.
- Name the guest (if one) in the first sentence with their credential.
- Include one actionable takeaway or surprising insight, not generic fluff.
- No clickbait hooks ("you won't believe"), no marketing verbs ("discover", "uncover"), no direct address to the reader ("you'll learn").
- Plain prose. No bullet points, no markdown, no emoji.

OUTPUT:
Return ONLY the capsule text. No preamble, no heading, no quotes around
it, no trailing attribution. Just the summary paragraph.`;

function buildUserPrompt(
  title: string,
  guest: string | undefined,
  guestCredential: string | undefined,
  pillar: string,
  seoDescription: string,
  transcriptExcerpt: string,
): string {
  const parts: string[] = [];
  parts.push(`EPISODE TITLE: ${title}`);
  if (guest) {
    parts.push(
      `GUEST: ${guest}${guestCredential ? ` (${guestCredential})` : ""}`,
    );
  }
  parts.push(`PILLAR: ${pillar}`);
  parts.push(`EXISTING SEO DESCRIPTION (for context, do not paraphrase): ${seoDescription}`);
  parts.push(
    `\nTRANSCRIPT EXCERPT (first ~1500 words):\n${transcriptExcerpt}\n`,
  );
  parts.push(
    `Write the 60$€“100 word citation-ready TL;DR for this episode, following all rules in the system prompt.`,
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
  pillar: string;
  seoDescription: string;
  guest?: string;
  guestCredential?: string;
  existingCapsule?: string;
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
      pillar: String(data.pillar ?? "coaching"),
      seoDescription: String(data.seoDescription ?? data.description ?? ""),
      guest: typeof data.guest === "string" ? data.guest : undefined,
      guestCredential:
        typeof data.guestCredential === "string"
          ? data.guestCredential
          : undefined,
      existingCapsule:
        typeof data.answerCapsule === "string"
          ? data.answerCapsule
          : undefined,
    });
  }

  return records;
}

async function generateCapsuleForEpisode(
  client: Anthropic,
  episode: EpisodeRecord,
): Promise<string | null> {
  // First ~1500 words of the transcript is typically plenty to capture
  // the thesis $€” avoids blowing the per-call token budget when transcripts
  // reach 10K+ words.
  const transcriptExcerpt = episode.transcript.split(/\s+/).slice(0, 1500).join(" ");

  const userPrompt = buildUserPrompt(
    episode.title,
    episode.guest,
    episode.guestCredential,
    episode.pillar,
    episode.seoDescription,
    transcriptExcerpt,
  );

  if (dryRun) {
    console.log(`   [DRY RUN] would call ${MODEL} (${userPrompt.length} chars)`);
    return null;
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;

  // Clean up $€” strip any surrounding quotes or markdown the model might have added
  let capsule = textBlock.text.trim();
  capsule = capsule.replace(/^[""]|[""]$/g, "");
  capsule = capsule.replace(/^["']|["']$/g, "");
  capsule = capsule.replace(/^[*_]+|[*_]+$/g, "");

  // Sanity-check word count. Outside 40$€“140 words = suspicious, skip.
  const wordCount = capsule.split(/\s+/).length;
  if (wordCount < 40 || wordCount > 140) {
    console.warn(
      `   $š ï¸  Capsule length out of range (${wordCount} words). Skipping.`,
    );
    return null;
  }

  return capsule;
}

function writeAnswerCapsule(episode: EpisodeRecord, capsule: string) {
  const updatedFrontmatter = {
    ...episode.frontmatter,
    answerCapsule: capsule,
  };
  const output = matter.stringify(episode.body, updatedFrontmatter);
  fs.writeFileSync(episode.filePath, output, "utf-8");
}

async function main() {
  console.log(`ðŸ’$ Generate episode answer capsules`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Force: ${force}`);
  if (slugFilter) console.log(`   Slug: ${slugFilter}`);
  if (limit) console.log(`   Limit: ${limit}`);
  console.log("");

  if (!dryRun && !process.env.ANTHROPIC_API_KEY) {
    console.error("$Œ ANTHROPIC_API_KEY not set in .env.local or .env.");
    process.exit(1);
  }

  const allEpisodes = loadEpisodes();
  const eligible = allEpisodes.filter(
    (ep) => force || !ep.existingCapsule,
  );
  const toProcess = limit > 0 ? eligible.slice(0, limit) : eligible;

  console.log(`   Episodes with transcripts: ${allEpisodes.length}`);
  console.log(`   Needs capsule (or --force): ${eligible.length}`);
  console.log(`   Will process this run: ${toProcess.length}`);
  console.log("");

  if (toProcess.length === 0) {
    console.log("$œ“ Nothing to do.");
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
      if (!dryRun && i > 0) {
        await new Promise((r) => setTimeout(r, 1200));
      }

      const capsule = await generateCapsuleForEpisode(client, ep);
      if (!capsule) {
        if (!dryRun) {
          skippedInvalid++;
          console.log(`   $š ï¸  Skipped (invalid capsule)`);
        }
        continue;
      }

      if (!dryRun) writeAnswerCapsule(ep, capsule);
      succeeded++;
      console.log(`   $œ“ ${capsule.split(/\s+/).length} words: "${capsule.slice(0, 80)}${capsule.length > 80 ? "$€¦" : ""}"`);
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      console.log(`   $œ— ${message}`);
      if (err instanceof Anthropic.RateLimitError) {
        await new Promise((r) => setTimeout(r, 30_000));
      }
    }
  }

  console.log("");
  console.log(`$œ“ Complete.`);
  console.log(`  Succeeded: ${succeeded}`);
  console.log(`  Length-skipped: ${skippedInvalid}`);
  console.log(`  Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
