/**
 * scripts/generate-episode-faqs.ts
 *
 * Generates 3-5 FAQ pairs for each podcast episode and writes them into
 * the MDX frontmatter. Uses Claude Sonnet for cost-effective batch
 * generation. Skips episodes that already have `faq:` in frontmatter.
 *
 * CLI:
 *   npx tsx scripts/generate-episode-faqs.ts                  # all episodes
 *   npx tsx scripts/generate-episode-faqs.ts --dry-run        # preview only
 *   npx tsx scripts/generate-episode-faqs.ts --limit=20       # first 20 missing
 *   npx tsx scripts/generate-episode-faqs.ts --slug=ep-2066-how-to-cycle-fast-with-a-low-heart-rate
 *
 * Requires ANTHROPIC_API_KEY in .env.local or .env.
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Load env (same pattern as generate-cluster-articles.ts)
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

// Worktrees may not have their own .env.local — walk up the directory
// tree to find the main repo root that contains .env.local.
let parentDir = path.resolve(process.cwd(), "..");
for (let i = 0; i < 5; i++) {
  if (parentDir === path.dirname(parentDir)) break; // reached filesystem root
  loadEnvFile(path.join(parentDir, ".env.local"));
  loadEnvFile(path.join(parentDir, ".env"));
  parentDir = path.resolve(parentDir, "..");
}

import Anthropic from "@anthropic-ai/sdk";
import matter from "gray-matter";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const slugFilter = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const limit = Number(
  args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0,
);

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");
const MODEL = "claude-sonnet-4-6";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface EpisodeInfo {
  slug: string;
  filePath: string;
  title: string;
  description: string;
  keywords: string[];
  answerCapsule?: string;
  guest?: string;
  guestCredential?: string;
  seoDescription?: string;
  rawContent: string;
}

function getEpisodesToProcess(): EpisodeInfo[] {
  const files = fs
    .readdirSync(PODCAST_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .sort();

  const episodes: EpisodeInfo[] = [];

  for (const filename of files) {
    const slug = filename.replace(/\.mdx$/, "");

    if (slugFilter && slug !== slugFilter) continue;

    const filePath = path.join(PODCAST_DIR, filename);
    const rawContent = fs.readFileSync(filePath, "utf-8");

    // Skip if faq: already exists in frontmatter (raw string check to
    // avoid gray-matter accidentally reading an faq key from content)
    const frontmatterMatch = rawContent.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) continue;
    if (/^faq:/m.test(frontmatterMatch[1])) {
      continue;
    }

    // Parse frontmatter with gray-matter for reliable YAML handling
    const { data } = matter(rawContent);

    episodes.push({
      slug,
      filePath,
      title: data.title ?? slug,
      description: data.description ?? "",
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      answerCapsule: data.answerCapsule ?? undefined,
      guest: data.guest ?? undefined,
      guestCredential: data.guestCredential ?? undefined,
      seoDescription: data.seoDescription ?? undefined,
      rawContent,
    });
  }

  return limit > 0 ? episodes.slice(0, limit) : episodes;
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

function buildPrompt(ep: EpisodeInfo): string {
  const parts: string[] = [];

  parts.push(`Generate 3-5 FAQ pairs for this podcast episode. Each FAQ must be a real question someone would type into Google about this topic.`);
  parts.push("");
  parts.push(`EPISODE DETAILS:`);
  parts.push(`Title: ${ep.title}`);
  if (ep.guest) parts.push(`Guest: ${ep.guest}${ep.guestCredential ? ` — ${ep.guestCredential}` : ""}`);
  parts.push(`Description: ${ep.description || ep.seoDescription || "(none)"}`);
  parts.push(`Keywords: ${ep.keywords.join(", ") || "(none)"}`);
  if (ep.answerCapsule) parts.push(`Answer capsule (TL;DR): ${ep.answerCapsule}`);
  if (ep.seoDescription && ep.seoDescription !== ep.answerCapsule) {
    parts.push(`SEO description: ${ep.seoDescription}`);
  }

  parts.push("");
  parts.push(`RULES:`);
  parts.push(`- 3-5 FAQ pairs. Prefer 4.`);
  parts.push(`- Questions: natural Google search queries. Specific to the episode topic.`);
  parts.push(`- Answers: 2-4 sentences. Direct, specific, no hedging. State facts and recommendations confidently.`);
  parts.push(`- British English: programme, periodised, optimise, specialise, analyse, favourite, colour, centre.`);
  parts.push(`- Reference the guest by name when the episode features one.`);
  parts.push(`- No "unlock", "discover", "journey", "game-changing", "elevate", "level up".`);
  parts.push(`- No em-dashes.`);
  parts.push("");
  parts.push(`OUTPUT FORMAT — return ONLY valid YAML (no code fences, no explanation). Example:`);
  parts.push(`- question: What is Zone 2 training?`);
  parts.push(`  answer: >-`);
  parts.push(`    Zone 2 training is riding at 55-75% of FTP. It builds mitochondrial`);
  parts.push(`    density and expands the aerobic base without accumulating excessive`);
  parts.push(`    fatigue.`);
  parts.push(`- question: How long should a Zone 2 ride be?`);
  parts.push(`  answer: >-`);
  parts.push(`    Ideally 2-4 hours for maximum adaptation. Even 60-minute sessions`);
  parts.push(`    provide benefit, but rides over 90 minutes produce disproportionately`);
  parts.push(`    larger gains.`);

  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Parse the YAML response
// ---------------------------------------------------------------------------

interface FaqPair {
  question: string;
  answer: string;
}

function parseFaqYaml(raw: string): FaqPair[] {
  // Clean up any code fences
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\n/, "").replace(/\n```\s*$/, "");
  }

  const faqs: FaqPair[] = [];

  // Split into entries by "- question:"
  const entries = cleaned.split(/^- question:\s*/m).filter(Boolean);

  for (const entry of entries) {
    const lines = entry.split("\n");
    const question = lines[0].trim();

    // Find the answer
    const answerLineIdx = lines.findIndex((l) =>
      /^\s*answer:\s*>-?\s*$/.test(l) || /^\s*answer:\s*.+/.test(l),
    );

    if (answerLineIdx === -1 || !question) continue;

    const answerLine = lines[answerLineIdx];
    const inlineAnswerMatch = answerLine.match(/^\s*answer:\s*['"]?(.*?)['"]?\s*$/);

    let answer: string;
    if (inlineAnswerMatch && inlineAnswerMatch[1] && !/^>-?\s*$/.test(inlineAnswerMatch[1])) {
      // Inline answer
      answer = inlineAnswerMatch[1];
    } else {
      // Block scalar — collect indented lines after the answer: >- line
      const answerParts: string[] = [];
      for (let i = answerLineIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        if (/^\s{2,}/.test(line) || (line.trim() && !line.startsWith("- question"))) {
          answerParts.push(line.trim());
        } else {
          break;
        }
      }
      answer = answerParts.join(" ");
    }

    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}

// ---------------------------------------------------------------------------
// Write FAQ into the frontmatter of the MDX file
// ---------------------------------------------------------------------------

function writeFaqToFile(ep: EpisodeInfo, faqs: FaqPair[]): void {
  // Build the YAML block for FAQ
  const faqLines: string[] = ["faq:"];
  for (const faq of faqs) {
    faqLines.push(`  - question: ${yamlString(faq.question)}`);
    // Always use block scalar for answers (they tend to be long)
    const wrappedAnswer = wordWrap(faq.answer, 72);
    faqLines.push(`    answer: >-`);
    for (const line of wrappedAnswer) {
      faqLines.push(`      ${line}`);
    }
  }
  const faqBlock = faqLines.join("\n");

  // Insert before the closing ---
  const content = ep.rawContent;
  const closingIdx = content.indexOf("\n---", 4); // skip the opening ---
  if (closingIdx === -1) {
    console.error(`   Could not find closing --- in ${ep.slug}`);
    return;
  }

  const newContent =
    content.slice(0, closingIdx) + "\n" + faqBlock + content.slice(closingIdx);

  fs.writeFileSync(ep.filePath, newContent, "utf-8");
}

function yamlString(s: string): string {
  // If the string contains colons, quotes, or special chars, wrap in quotes
  if (/[:#{}[\],&*?|>!'"%@`]/.test(s) || s.includes(": ")) {
    // Use single quotes, escaping internal single quotes by doubling them
    return `'${s.replace(/'/g, "''")}'`;
  }
  return s;
}

function wordWrap(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine && currentLine.length + 1 + word.length > maxLen) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const episodes = getEpisodesToProcess();

  console.log(`\n📋 Found ${episodes.length} episode(s) to process`);
  if (dryRun) console.log("   (dry run — no files will be written)\n");
  else console.log("");

  if (episodes.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  const client = new Anthropic();

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < episodes.length; i++) {
    const ep = episodes[i];
    const progress = `[${i + 1}/${episodes.length}]`;

    console.log(`${progress} ${ep.slug}`);

    if (dryRun) {
      console.log(`   [DRY RUN] title: ${ep.title}`);
      console.log(`   [DRY RUN] answerCapsule: ${ep.answerCapsule?.slice(0, 80) ?? "(none)"}...`);
      console.log(`   [DRY RUN] keywords: ${ep.keywords.join(", ") || "(none)"}`);
      console.log("");
      successCount++;
      continue;
    }

    try {
      const prompt = buildPrompt(ep);

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        console.error(`   No text block in response. Skipping.`);
        errorCount++;
        continue;
      }

      const faqs = parseFaqYaml(textBlock.text);

      if (faqs.length < 2) {
        console.error(
          `   Only parsed ${faqs.length} FAQ(s) — expected 3-5. Raw response:\n${textBlock.text.slice(0, 400)}`,
        );
        errorCount++;
        continue;
      }

      writeFaqToFile(ep, faqs);

      console.log(`   ✅ Wrote ${faqs.length} FAQs`);
      for (const faq of faqs) {
        console.log(`      Q: ${faq.question.slice(0, 70)}...`);
      }
      console.log("");

      successCount++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ Error: ${message}`);
      errorCount++;

      // Rate-limit backoff on 429
      if (message.includes("429") || message.includes("rate")) {
        console.log("   Waiting 30s for rate limit...");
        await new Promise((r) => setTimeout(r, 30_000));
      }
    }
  }

  console.log(`\n✅ Done: ${successCount} succeeded, ${errorCount} failed\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
