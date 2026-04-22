/**
 * scripts/generate-cluster-articles.ts
 *
 * Generates the 12-article triathlon-cycling cluster that supports the
 * /coaching/triathlon pillar page. Each article is written by Claude Opus
 * 4.7 from a detailed spec (in `scripts/data/triathlon-cluster-articles.ts`)
 * and a system prompt that captures Roadman's voice, pillar taxonomy, and
 * internal link conventions.
 *
 * Output: a full MDX file per article written to `content/blog/<slug>.mdx`
 * with frontmatter matching the existing Roadman blog-post format exactly.
 *
 * Idempotent: skips articles whose MDX file already exists. --force
 * overwrites.
 *
 * CLI:
 *   pnpm run seo:cluster:triathlon                  # all 12 articles
 *   pnpm run seo:cluster:triathlon:dry              # preview without writing
 *   pnpm run seo:cluster:triathlon -- --slug=X      # single article
 *   pnpm run seo:cluster:triathlon -- --limit=3     # first 3 missing
 *   pnpm run seo:cluster:triathlon -- --force       # overwrite existing
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

import Anthropic from "@anthropic-ai/sdk";
import {
  TRIATHLON_CLUSTER_ARTICLES,
  type ClusterArticleSpec,
} from "./data/triathlon-cluster-articles";
import { COACHING_CLUSTER_ARTICLES } from "./data/coaching-cluster-articles";
import { PODCAST_AUTHORITY_ARTICLES } from "./data/podcast-authority-articles";
import { COMPARISON_CLUSTER_ARTICLES } from "./data/comparison-cluster-articles";
import { TRANSCRIPT_BLOG_ARTICLES } from "./data/transcript-blog-articles";
import { BOTTOM_FUNNEL_ARTICLES } from "./data/bottom-funnel-articles";

type ClusterName = "triathlon" | "coaching" | "podcast-authority" | "comparison" | "transcript-blog" | "bottom-funnel";

const CLUSTERS: Record<ClusterName, ClusterArticleSpec[]> = {
  triathlon: TRIATHLON_CLUSTER_ARTICLES,
  coaching: COACHING_CLUSTER_ARTICLES,
  "podcast-authority": PODCAST_AUTHORITY_ARTICLES,
  comparison: COMPARISON_CLUSTER_ARTICLES,
  "transcript-blog": TRANSCRIPT_BLOG_ARTICLES,
  "bottom-funnel": BOTTOM_FUNNEL_ARTICLES,
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const slugFilter = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const clusterArg =
  (args.find((a) => a.startsWith("--cluster="))?.split("=")[1] as
    | ClusterName
    | undefined) ?? "triathlon";
const limit = Number(
  args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0,
);

if (!(clusterArg in CLUSTERS)) {
  console.error(
    `Unknown --cluster=${clusterArg}. Valid: ${Object.keys(CLUSTERS).join(", ")}`,
  );
  process.exit(1);
}

const SELECTED_ARTICLES = CLUSTERS[clusterArg];

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const MODEL = args.includes("--sonnet") ? "claude-sonnet-4-6" : "claude-opus-4-7";
const REQUEST_TIMEOUT_MS = 180_000;
const TODAY = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// System prompt — Roadman voice + site context
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are writing a long-form blog post for Roadman Cycling, a cycling coaching and performance media brand based in Dublin, Ireland.

BRAND CONTEXT
- Founded by Anthony Walsh, host of the Roadman Cycling Podcast (1M+ monthly listeners, 1,300+ guest interviews with World Tour coaches, sports scientists, and pro riders).
- Notable podcast guests you can cite for authority: Prof. Stephen Seiler (polarised training, University of Agder), Dan Lorang (Head of Performance at Red Bull-Bora-Hansgrohe; long-time coach to Jan Frodeno, Anne Haug and Lucy Charles-Barclay — announced April 2026 he leaves the team end of 2026 season; do NOT credit him with Gustav Iden or Kristian Blummenfelt, they are Olav Bu athletes), Joe Friel (author, The Cyclist's Training Bible), Dan Bigham (former UCI Hour Record holder; Head of Engineering at Red Bull-Bora-Hansgrohe since late 2024), Tim Spector (ZOE founder — microbiome and individualised nutrition only; do NOT credit him with 90-120g/hr CHO work, that is Asker Jeukendrup's research), John Wakefield (Red Bull-Bora-Hansgrohe Director of Development), Asker Jeukendrup (carbohydrate oxidation, multiple transportable carbs, gut training).
- Coaching programme is called "Not Done Yet" — $195/month, 1:1 personalised, five pillars (training, nutrition, strength, recovery, accountability).
- Triathlon bike coaching is a specialism: coaching the bike leg with explicit protection of the run.

VOICE
- Direct, plainspoken, high signal-to-noise. Sentences do real work.
- No "unlock", "uncover", "discover", "journey", "game-changing", "elevate", "level up", no hedging "can" and "may" where assertion is possible.
- No direct-to-reader hype ("you'll be amazed", "wait until you see").
- Cite named sources when claims are non-obvious: "Prof. Seiler's research shows…", "Dan Lorang's World Tour athletes…".
- Numbers where possible. Ranges, percentages, time durations. "Most" and "many" are weaker than "80%" or "two out of three".
- British English spellings: "periodised", "optimise", "programme", "specialise", "analyse".
- Paragraphs are short — 2-4 sentences each.
- Use em-dashes sparingly (no more than 4-5 in the whole article). Modern AI output overuses them.

STRUCTURE
- Open with 2-3 paragraph lede that states the problem + the frame. No "In today's fast-paced world" openers. No "Let me start by saying".
- H2 sections only (## in MDX). No H3 or deeper nesting unless the spec explicitly requires it.
- Each H2 body runs 200-400 words.
- Close with a concrete next step, not a summary paragraph.

FRONTMATTER RULES
- YAML frontmatter at the top, between --- markers.
- Use block-scalar (>-) for any string over 80 characters (seoDescription, excerpt, answerCapsule, long FAQ answers).
- keywords: YAML array of 5-8 strings.
- faq: YAML array of {question, answer} objects with 3-5 entries. FAQ answers must be 40-80 words. Questions are real search queries, not fluff.
- answerCapsule: 60-100 words, citation-ready, self-contained. Reads like a Wikipedia lead — factual, specific, no marketing. Lead with the concrete claim.
- publishDate: ISO string.

MDX BODY RULES
- No markdown links in H2 headings.
- Use [anchor](/path) format for every internal link specified in the spec. Internal links must appear naturally — don't just dump them at the end.
- Body length must fall within 80-120% of the spec word target. Count words carefully.
- Do NOT add "TL;DR" or "Summary" sections — the answerCapsule frontmatter already serves that role.
- Do NOT invent statistics, studies, or quotes. If you cite Prof. Seiler or Dan Lorang, the claim must be broadly consistent with what's publicly documented about their work.

OUTPUT FORMAT
Return ONLY the MDX file content. Start with --- and end after the final line of body. No preamble, no explanation, no code-fence markers (no triple backticks). Just the raw MDX.`;

// ---------------------------------------------------------------------------
// User prompt — the article spec
// ---------------------------------------------------------------------------
function buildUserPrompt(spec: ClusterArticleSpec): string {
  const parts: string[] = [];
  parts.push(`SPEC FOR THIS ARTICLE`);
  parts.push("");
  parts.push(`Slug: ${spec.slug}`);
  parts.push(`Title: ${spec.title}`);
  parts.push(`SEO title: ${spec.seoTitle}`);
  parts.push(`SEO description: ${spec.seoDescription}`);
  parts.push(`Excerpt: ${spec.excerpt}`);
  parts.push(`Target keyword: ${spec.targetKeyword}`);
  parts.push(`Supporting keywords: ${spec.supportingKeywords.join(", ")}`);
  parts.push(`Editorial angle: ${spec.angle}`);
  parts.push(`Pillar: ${spec.pillar}`);
  parts.push(`Featured image: ${spec.featuredImage}`);
  parts.push(`Word target: ${spec.wordTarget} words (acceptable range: ${Math.round(spec.wordTarget * 0.8)}–${Math.round(spec.wordTarget * 1.2)})`);
  parts.push(`Publish date: ${TODAY}`);
  parts.push("");
  parts.push(`Required H2 sections (use these as section headings, in this order):`);
  for (const s of spec.requiredSections) {
    parts.push(`  - ${s}`);
  }
  parts.push("");
  parts.push(`Internal links to weave in naturally (not all in the same paragraph — distribute across the article):`);
  for (const link of spec.internalLinks) {
    parts.push(`  - [${link.anchor}](${link.href})`);
  }
  parts.push("");
  parts.push(`FRONTMATTER FIELDS YOU MUST POPULATE`);
  parts.push(`  title, seoTitle, seoDescription, excerpt, pillar (= "${spec.pillar}"), author (= "Anthony Walsh"), publishDate (= "${TODAY}"), featuredImage (= "${spec.featuredImage}"), keywords (5-8 including the target keyword), faq (3-5 Q&A pairs), answerCapsule.`);
  parts.push("");
  parts.push(
    `Write the full MDX file now. Start with --- and end after the final paragraph. No other output.`,
  );
  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

function articleExists(slug: string): boolean {
  return fs.existsSync(path.join(BLOG_DIR, `${slug}.mdx`));
}

function countBodyWords(mdx: string): number {
  // Count words in the body after the closing --- of frontmatter.
  const match = mdx.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  if (!match) return 0;
  const body = match[1];
  // Strip markdown link/image syntax, keep the link text.
  const stripped = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  return stripped.split(/\s+/).filter(Boolean).length;
}

function stripOutputFences(text: string): string {
  // Claude sometimes wraps output in ```mdx ... ``` despite instructions.
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\n/, "").replace(/\n```\s*$/, "");
  }
  return cleaned;
}

async function generateArticle(
  client: Anthropic,
  spec: ClusterArticleSpec,
): Promise<string | null> {
  if (dryRun) {
    console.log(
      `   [DRY RUN] would call ${MODEL} · target ${spec.wordTarget} words`,
    );
    return null;
  }

  // Non-streaming messages.create with an explicit AbortController timeout.
  // SDK 0.82.0 has no built-in request timeout, so without this the call
  // hangs indefinitely when the sandbox proxy or Cloudflare kills the idle
  // connection. 180s is generous — Sonnet finishes in ~30s, Opus in ~90s.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 6000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(spec) }],
      },
      { signal: controller.signal },
    );
  } finally {
    clearTimeout(timer);
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;

  const raw = stripOutputFences(textBlock.text);

  // Must begin with --- (YAML frontmatter opener).
  if (!raw.startsWith("---")) {
    console.warn(`   ⚠️  Output missing frontmatter opener. Preview:\n${raw.slice(0, 300)}`);
    return null;
  }

  const wordCount = countBodyWords(raw);
  const minWords = Math.round(spec.wordTarget * 0.7);
  const maxWords = Math.round(spec.wordTarget * 1.35);
  if (wordCount < minWords || wordCount > maxWords) {
    console.warn(
      `   ⚠️  Word count ${wordCount} outside acceptable range (${minWords}–${maxWords}). Saving anyway under a .draft.mdx suffix.`,
    );
    // Don't throw — let the caller decide whether to accept.
    return `__OUT_OF_RANGE__:${wordCount}\n${raw}`;
  }

  return raw;
}

function writeArticle(spec: ClusterArticleSpec, mdx: string, draft: boolean) {
  const filename = draft
    ? `${spec.slug}.draft.mdx`
    : `${spec.slug}.mdx`;
  const outPath = path.join(BLOG_DIR, filename);
  fs.writeFileSync(outPath, mdx, "utf-8");
}

async function main() {
  console.log(`📝 Generate triathlon cluster articles`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Force: ${force}`);
  if (slugFilter) console.log(`   Slug: ${slugFilter}`);
  if (limit) console.log(`   Limit: ${limit}`);
  console.log("");

  if (!dryRun && !process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not set in .env.local or .env.");
    process.exit(1);
  }

  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }

  const specs = SELECTED_ARTICLES.filter((s) => {
    if (slugFilter && s.slug !== slugFilter) return false;
    if (force) return true;
    return !articleExists(s.slug);
  });

  const toProcess = limit > 0 ? specs.slice(0, limit) : specs;

  console.log(`   Cluster: ${clusterArg}`);
  console.log(`   Total articles in cluster: ${SELECTED_ARTICLES.length}`);
  console.log(`   Needs generation (or --force): ${specs.length}`);
  console.log(`   Will process this run: ${toProcess.length}`);
  console.log("");

  if (toProcess.length === 0) {
    console.log("✓ Nothing to do.");
    return;
  }

  const client = dryRun ? (null as unknown as Anthropic) : new Anthropic();

  let succeeded = 0;
  let drafted = 0;
  let failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const spec = toProcess[i];
    const progress = `[${i + 1}/${toProcess.length}]`;
    console.log(`${progress} ${spec.slug} (target ${spec.wordTarget}w)`);

    try {
      if (!dryRun && i > 0) {
        await new Promise((r) => setTimeout(r, 3000));
      }

      let mdx: string | null = null;
      const MAX_RETRIES = 3;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          mdx = await generateArticle(client, spec);
          break;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          const isRetryable = msg.includes("abort") || msg.includes("timeout") || msg.includes("idle") || msg.includes("529") || msg.includes("overloaded");
          if (isRetryable && attempt < MAX_RETRIES) {
            const wait = attempt * 30;
            console.log(`   ⚠️  Attempt ${attempt} failed (${msg.slice(0, 60)}), retrying in ${wait}s...`);
            await new Promise((r) => setTimeout(r, wait * 1000));
          } else {
            throw err;
          }
        }
      }

      if (!mdx) {
        if (!dryRun) {
          failed++;
          console.log(`   ✗ No usable output returned`);
        }
        continue;
      }

      if (mdx.startsWith("__OUT_OF_RANGE__:")) {
        const [meta, ...rest] = mdx.split("\n");
        const wordCount = meta.split(":")[1];
        writeArticle(spec, rest.join("\n"), true);
        drafted++;
        console.log(`   ⚠️  Saved as .draft.mdx (${wordCount}w, outside range)`);
      } else {
        if (!dryRun) writeArticle(spec, mdx, false);
        succeeded++;
        const words = countBodyWords(mdx);
        console.log(`   ✓ ${words}w written to content/blog/${spec.slug}.mdx`);
      }
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      console.log(`   ✗ ${message}`);
      if (err instanceof Anthropic.RateLimitError) {
        await new Promise((r) => setTimeout(r, 30_000));
      }
    }
  }

  console.log("");
  console.log(`✓ Complete.`);
  console.log(`  Published: ${succeeded}`);
  console.log(`  Drafted (out-of-range):  ${drafted}`);
  console.log(`  Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
