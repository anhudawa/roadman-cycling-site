import fs from "fs";
import path from "path";

// Load env
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

import matter from "gray-matter";
import { loadTranscripts, type LoadedTranscript } from "./lib/seo/transcript-loader.js";
import { selectVoiceExamples } from "./lib/seo/voice-selector.js";
import { aiCall, printCostSummary } from "./lib/seo/ai-client.js";
import { writeDraft, ensureDraftDirs, readManifest, saveManifest, upsertManifestEntry, isProcessed } from "./lib/seo/draft-manager.js";

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const rankOnly = args.includes("--rank-only");
const episodeFilter = args.find((a) => a.startsWith("--episode="))?.split("=")[1];
const limitFlag = args.find((a) => a.startsWith("--limit="))?.split("=")[1];
const limit = limitFlag ? parseInt(limitFlag, 10) : 50;
const force = args.includes("--force");

// ---------------------------------------------------------------------------
// High-value keywords from SEO audit
// ---------------------------------------------------------------------------
const HIGH_VALUE_KEYWORDS = [
  "ftp", "threshold", "zone 2", "training plan", "weight loss", "nutrition",
  "recovery", "strength", "cadence", "power", "vo2max", "periodisation",
  "base training", "polarised", "sweet spot", "interval", "knee pain",
  "bike fit", "group ride", "etiquette", "gravel", "tyre pressure",
  "hydration", "energy gels", "fuelling", "race day", "body composition",
  "tapering", "indoor training", "comeback", "overtraining", "sleep",
  "stretching", "triathlon", "mountain bike", "mtb",
];

// ---------------------------------------------------------------------------
// Scoring & ranking
// ---------------------------------------------------------------------------
interface ScoredEpisode extends LoadedTranscript {
  score: number;
}

function scoreEpisode(ep: LoadedTranscript): number {
  let score = 0;

  // Keyword density in title
  const titleLower = ep.title.toLowerCase();
  for (const kw of HIGH_VALUE_KEYWORDS) {
    if (titleLower.includes(kw)) score += 5;
  }

  // Keyword density in keywords array
  const kwsLower = ep.keywords.map((k) => k.toLowerCase()).join(" ");
  for (const kw of HIGH_VALUE_KEYWORDS) {
    if (kwsLower.includes(kw)) score += 2;
  }

  // Episode type weight
  const typeWeights: Record<string, number> = {
    interview: 8,
    solo: 5,
    "sarah-anthony": 3,
    panel: 2,
  };
  score += typeWeights[ep.type || ""] || 1;

  // Transcript length bonus (longer = richer)
  score += Math.min(ep.transcript.length / 5000, 10);

  // Slight recency bias
  if (ep.episodeNumber && ep.episodeNumber > 2000) score += 3;

  return score;
}

function rankEpisodes(episodes: LoadedTranscript[]): ScoredEpisode[] {
  return episodes
    .map((ep) => ({ ...ep, score: scoreEpisode(ep) }))
    .sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------
// Load existing blog post titles to avoid duplication
// ---------------------------------------------------------------------------
function loadExistingTitles(): string[] {
  const blogDir = path.join(process.cwd(), "content/blog");
  if (!fs.existsSync(blogDir)) return [];

  return fs.readdirSync(blogDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(blogDir, f), "utf-8");
      const { data } = matter(raw);
      return data.title || f;
    });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("üìù Podcast Companion Article Generator");
  console.log(`   Mode: ${dryRun ? "DRY RUN" : rankOnly ? "RANK ONLY" : "LIVE"}`);
  if (episodeFilter) console.log(`   Filtering: episode=${episodeFilter}`);
  console.log(`   Limit: ${limit}`);
  console.log();

  ensureDraftDirs();
  const manifest = readManifest("companion");

  // Load and rank episodes
  const allEpisodes = loadTranscripts();
  let ranked = rankEpisodes(allEpisodes);

  if (episodeFilter) {
    ranked = ranked.filter((ep) => ep.slug === episodeFilter);
  }

  // Skip already processed unless --force
  if (!force) {
    ranked = ranked.filter((ep) => !isProcessed(manifest, ep.slug));
  }

  // Apply limit
  ranked = ranked.slice(0, limit);

  console.log(`üèÜ Top ${ranked.length} episodes selected:\n`);
  for (let i = 0; i < Math.min(ranked.length, 20); i++) {
    const ep = ranked[i];
    console.log(`  ${i + 1}. [${ep.score.toFixed(1)}] ${ep.title} (${ep.type || "unknown"})`);
  }
  if (ranked.length > 20) {
    console.log(`  ... and ${ranked.length - 20} more`);
  }
  console.log();

  if (rankOnly) {
    console.log("Rank-only mode $Äî stopping here.");
    return;
  }

  const existingTitles = loadExistingTitles();
  let processed = 0;

  for (const ep of ranked) {
    console.log(`\n[${processed + 1}/${ranked.length}] ${ep.title}`);

    // Get voice examples from different episodes (same pillar)
    const voiceExamples = selectVoiceExamples(ep.pillar, ep.keywords, 2, 200);
    // Exclude the current episode from voice examples
    const filteredVoice = voiceExamples.filter((v) => v.slug !== ep.slug);
    const voiceContext = filteredVoice
      .map((v, i) => `--- Voice example ${i + 1} (from "${v.title}") ---\n${v.excerpt}`)
      .join("\n\n");

    // Truncate transcript to ~8000 words to fit context
    const transcriptWords = ep.transcript.split(/\s+/);
    const truncatedTranscript = transcriptWords.slice(0, 8000).join(" ");

    const existingArticleList = existingTitles.slice(0, 30).map((t) => `- ${t}`).join("\n");

    const system = `You are Anthony Walsh, host of the Roadman Cycling Podcast. You're writing a comprehensive blog article based on one of your podcast episodes. Write in your natural voice: direct, second-person, evidence-based, conversational. Reference the podcast conversation naturally. If there was a guest, attribute their insights. Be specific $Äî use numbers, protocols, and actionable advice.`;

    const prompt = `Here are examples of your voice from other episodes:

${voiceContext}

---

Write a companion blog article for this podcast episode:

Title: ${ep.title}
${ep.guest ? `Guest: ${ep.guest}` : "Type: Solo/co-hosted episode"}
Pillar: ${ep.pillar}
Keywords: ${ep.keywords.join(", ")}

Full transcript:
${truncatedTranscript}

---

Existing articles on the site (suggest 3-5 as internal links where relevant):
${existingArticleList}

Write the article following this structure:

1. Start with a direct answer paragraph (100 words) $Äî answer the core question/topic of this episode
2. "Key Takeaways" section $Äî 5-8 bullet points, 20-40 words each
3. 2-3 deep-dive sections (300-500 words each) $Äî the main insights from the episode. Use descriptive ## headers that target search queries.
4. "What This Means for Your Training" section (200-300 words) $Äî practical application
5. FAQ section $Äî 3-5 questions with 50-100 word answers

Target 1500-2500 words total. Write in markdown. Do NOT include a title H1.

At the very end, on a new line, output the following metadata in this exact JSON format (no code block, just raw JSON):
{"suggestedTitle":"...","seoTitle":"...","seoDescription":"...","excerpt":"...","suggestedKeywords":["..."],"internalLinks":["article-slug-1","article-slug-2"]}

The suggestedTitle should be rewritten for search intent (not the podcast episode title).
The seoTitle must be $â§60 characters.
The seoDescription must be 150-160 characters.`;

    try {
      const result = await aiCall({
        system,
        prompt,
        model: "sonnet",
        maxTokens: 4096,
        dryRun,
      });

      if (!dryRun) {
        // Parse out the metadata JSON from the end
        let articleBody = result.text;
        let metadata: Record<string, unknown> = {};

        const jsonMatch = result.text.match(/\{[^{}]*"suggestedTitle"[^{}]*\}/s);
        if (jsonMatch) {
          try {
            metadata = JSON.parse(jsonMatch[0]);
            articleBody = result.text.slice(0, jsonMatch.index).trim();
          } catch {
            console.log("  $ö† Could not parse metadata JSON, using defaults");
          }
        }

        const wordCount = articleBody.split(/\s+/).length;

        const frontmatter = {
          title: (metadata.suggestedTitle as string) || ep.title,
          seoTitle: (metadata.seoTitle as string) || "",
          seoDescription: (metadata.seoDescription as string) || "",
          excerpt: (metadata.excerpt as string) || "",
          pillar: ep.pillar,
          author: "Anthony Walsh",
          publishDate: new Date().toISOString().split("T")[0],
          keywords: (metadata.suggestedKeywords as string[]) || ep.keywords,
          relatedEpisodes: [ep.slug],
          sourceEpisode: ep.slug,
          status: "draft",
          generatedAt: new Date().toISOString(),
          wordCount,
        };

        const mdxContent = matter.stringify(articleBody, frontmatter);
        const filename = `companion-${ep.slug}.mdx`;
        writeDraft("companion", filename, mdxContent, false);
        console.log(`  $úÖ Generated (${wordCount} words)`);

        upsertManifestEntry(manifest, ep.slug);
      }

      processed++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`  $ùå Failed: ${msg}`);
    }
  }

  saveManifest("companion", manifest, dryRun);

  console.log(`\n$úÖ Done: ${processed} companion articles generated`);
  printCostSummary();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
