import fs from "fs";
import path from "path";

// Load env files manually (.env.local takes priority, .env as fallback)
// Note: dotenv's config() is blocked by some sandboxes so we load directly
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

import matter from "gray-matter";
import { type EpisodeInput, type RepurposeResult, type RepurposeState } from "./lib/repurpose/types.js";
import { loadRepurposeState, saveRepurposeState } from "./lib/repurpose/repurpose-state.js";
import { generateBlogPost } from "./lib/repurpose/blog-generator.js";
import { generateSocialPosts } from "./lib/repurpose/social-generator.js";
import { extractQuotes } from "./lib/repurpose/quote-extractor.js";
import { fetchGuestImage } from "./lib/repurpose/guest-image-fetcher.js";
import { renderQuoteCards } from "./lib/repurpose/quote-card-renderer.js";
import { writeRepurposedContent, outputExists, getOutputDir } from "./lib/repurpose/content-writer.js";
import { truncateTranscript } from "./lib/transcript.js";

// ---------------------------------------------------------------------------
// CLI arg parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const episodeFlag = args.find((a) => a.startsWith("--episode="))?.split("=")[1];
const latest = args.includes("--latest");
const auto = args.includes("--auto");
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const skipBlog = args.includes("--skip-blog");
const skipSocial = args.includes("--skip-social");
const skipQuotes = args.includes("--skip-quotes");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoadedEpisode {
  slug: string;
  frontmatter: Record<string, unknown>;
  content: string;
}

// ---------------------------------------------------------------------------
// Helper: loadEpisode
// ---------------------------------------------------------------------------

function loadEpisode(slug: string): LoadedEpisode | null {
  const podcastDir = path.join(process.cwd(), "content/podcast");
  const filePath = path.join(podcastDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Episode file not found: ${filePath}`);
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    return { slug, frontmatter: data as Record<string, unknown>, content };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to load episode "${slug}": ${msg}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper: findLatestEpisode
// ---------------------------------------------------------------------------

function findLatestEpisode(): LoadedEpisode | null {
  const podcastDir = path.join(process.cwd(), "content/podcast");

  if (!fs.existsSync(podcastDir)) {
    console.error("❌ Podcast content directory not found");
    return null;
  }

  const files = fs.readdirSync(podcastDir).filter((f) => f.endsWith(".mdx"));

  let latestWithTranscript: LoadedEpisode | null = null;
  let latestDateTranscript = "";
  let latestAny: LoadedEpisode | null = null;
  let latestDateAny = "";

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(podcastDir, file), "utf-8");
    const { data, content } = matter(raw);

    const publishDate = String(data.publishDate ?? "");
    if (!publishDate) continue;

    const ep: LoadedEpisode = { slug, frontmatter: data as Record<string, unknown>, content };

    if (!latestDateAny || publishDate > latestDateAny) {
      latestDateAny = publishDate;
      latestAny = ep;
    }

    const transcript = String(data.transcript ?? "").trim();
    if (transcript && (!latestDateTranscript || publishDate > latestDateTranscript)) {
      latestDateTranscript = publishDate;
      latestWithTranscript = ep;
    }
  }

  // Prefer episode with transcript; fall back to any (will warn in toEpisodeInput)
  return latestWithTranscript || latestAny;
}

// ---------------------------------------------------------------------------
// Helper: findUnprocessedEpisodes
// ---------------------------------------------------------------------------

function findUnprocessedEpisodes(processedSlugs: string[]): LoadedEpisode[] {
  const podcastDir = path.join(process.cwd(), "content/podcast");

  if (!fs.existsSync(podcastDir)) {
    console.error("❌ Podcast content directory not found");
    return [];
  }

  const files = fs.readdirSync(podcastDir).filter((f) => f.endsWith(".mdx"));

  // Rolling 7-day window
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoffDate = sevenDaysAgo.toISOString().slice(0, 10);

  const unprocessed: LoadedEpisode[] = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");

    // Skip already processed
    if (processedSlugs.includes(slug)) continue;

    const raw = fs.readFileSync(path.join(podcastDir, file), "utf-8");
    const { data, content } = matter(raw);

    // Must have a transcript
    const transcript = String(data.transcript ?? "").trim();
    if (!transcript) continue;

    // Must be within the last 7 days
    const publishDate = String(data.publishDate ?? "");
    if (!publishDate || publishDate < cutoffDate) continue;

    unprocessed.push({ slug, frontmatter: data as Record<string, unknown>, content });
  }

  // Sort by publishDate descending (most recent first)
  unprocessed.sort((a, b) => {
    const dateA = String(a.frontmatter.publishDate ?? "");
    const dateB = String(b.frontmatter.publishDate ?? "");
    return dateB.localeCompare(dateA);
  });

  return unprocessed;
}

// ---------------------------------------------------------------------------
// Helper: toEpisodeInput
// ---------------------------------------------------------------------------

function toEpisodeInput(ep: LoadedEpisode): EpisodeInput | null {
  const { slug, frontmatter } = ep;
  const fm = frontmatter;

  const transcript = String(fm.transcript ?? "").trim();
  if (!transcript) {
    console.log(`   ⚠ No transcript in frontmatter for "${slug}" — skipping`);
    return null;
  }

  return {
    slug,
    title: String(fm.title ?? slug),
    episodeNumber: Number(fm.episodeNumber ?? 0),
    guest: fm.guest ? String(fm.guest) : undefined,
    guestCredential: fm.guestCredential ? String(fm.guestCredential) : undefined,
    description: String(fm.description ?? fm.seoDescription ?? ""),
    publishDate: String(fm.publishDate ?? ""),
    duration: String(fm.duration ?? ""),
    youtubeId: fm.youtubeId ? String(fm.youtubeId) : undefined,
    pillar: String(fm.pillar ?? ""),
    type: String(fm.type ?? ""),
    keywords: Array.isArray(fm.keywords) ? (fm.keywords as string[]) : [],
    seoDescription: String(fm.seoDescription ?? fm.description ?? ""),
    transcript: truncateTranscript(transcript, 15000),
  };
}

// ---------------------------------------------------------------------------
// processEpisode
// ---------------------------------------------------------------------------

async function processEpisode(ep: LoadedEpisode, state: RepurposeState): Promise<boolean> {
  const input = toEpisodeInput(ep);
  if (!input) return false;

  // Skip if already processed (unless --force)
  if (!force && outputExists(input.episodeNumber, input.slug)) {
    console.log(`   ⏭  Output already exists — skipping (use --force to overwrite)`);
    return false;
  }

  // Log episode info
  console.log(`   📄 Title:  ${input.title}`);
  console.log(`   🏷  Pillar: ${input.pillar}`);
  console.log(`   🎙  Type:   ${input.type}`);
  if (input.guest) {
    console.log(`   👤 Guest:  ${input.guest}${input.guestCredential ? ` — ${input.guestCredential}` : ""}`);
  }

  const result: RepurposeResult = {
    blog: null,
    social: null,
    quotes: null,
  };

  // --- Blog ---
  if (!skipBlog) {
    process.stdout.write("   📝 Blog post... ");
    const blog = await generateBlogPost(input);
    if (blog) {
      result.blog = blog;
      console.log(`✓ ${blog.slug}`);
    } else {
      console.log("✗ failed");
    }
  } else {
    console.log("   📝 Blog post... skipped (--skip-blog)");
  }

  // --- Social ---
  if (!skipSocial) {
    process.stdout.write("   📱 Social posts... ");
    const social = await generateSocialPosts(input);
    if (social) {
      result.social = social;
      const tweetCount = social.twitter?.tweets?.length ?? 0;
      console.log(`✓ ${tweetCount} tweets + IG + LinkedIn + FB`);
    } else {
      console.log("✗ failed");
    }
  } else {
    console.log("   📱 Social posts... skipped (--skip-social)");
  }

  // --- Quotes ---
  if (!skipQuotes) {
    process.stdout.write("   💬 Quotes... ");
    const quotes = await extractQuotes(input.transcript, input.title, input.guest);
    console.log(`✓ ${quotes.length} extracted`);

    if (quotes.length > 0) {
      // Render quote cards (skip in dry-run — no image fetch or rendering)
      if (!dryRun) {
        // Guest image
        process.stdout.write("   🖼  Guest image... ");
        const imageBuffer = await fetchGuestImage(input.guest, input.youtubeId);
        if (imageBuffer) {
          console.log("✓");
        } else {
          console.log("⚠ none found — cards will use solid background");
        }

        process.stdout.write("   🎨 Quote cards... ");
        const outputDir = getOutputDir(input.episodeNumber, input.slug);

        // Write guest image to temp file for renderer if we have it
        let guestImagePath: string | undefined;
        if (imageBuffer) {
          guestImagePath = path.join(outputDir, "quotes", "_guest-tmp.jpg");
          const quotesDir = path.join(outputDir, "quotes");
          if (!fs.existsSync(quotesDir)) {
            fs.mkdirSync(quotesDir, { recursive: true });
          }
          fs.writeFileSync(guestImagePath, imageBuffer);
        }

        const cardPaths = await renderQuoteCards(
          quotes,
          input.episodeNumber,
          guestImagePath,
          outputDir
        );

        // Clean up temp image
        if (guestImagePath && fs.existsSync(guestImagePath)) {
          fs.unlinkSync(guestImagePath);
        }

        result.quotes = { extracted: quotes, cardPaths };
        console.log(`✓ ${cardPaths.length} cards rendered`);
      } else {
        console.log("   🎨 Quote cards... skipped (dry-run)");
        result.quotes = { extracted: quotes, cardPaths: [] };
      }
    }
  } else {
    console.log("   💬 Quotes... skipped (--skip-quotes)");
  }

  // --- Write output ---
  const writtenPaths = writeRepurposedContent(
    input.episodeNumber,
    input.slug,
    result,
    dryRun
  );

  if (!dryRun) {
    console.log(`   ✅ Wrote ${writtenPaths.length} files`);
    // Update state
    if (!state.processedEpisodeSlugs.includes(input.slug)) {
      state.processedEpisodeSlugs.unshift(input.slug);
    }
  } else {
    console.log(`   🏷  [dry-run] Would write ${writtenPaths.length} files`);
  }

  return true;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const generators: string[] = [];
  if (!skipBlog) generators.push("blog");
  if (!skipSocial) generators.push("social");
  if (!skipQuotes) generators.push("quotes");

  console.log("🎙  Roadman Podcast Repurpose");
  console.log(`   Mode: ${episodeFlag ? `EPISODE (${episodeFlag})` : latest ? "LATEST" : auto ? "AUTO" : "UNKNOWN"}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Force: ${force}`);
  console.log(`   AI: ${process.env.ANTHROPIC_API_KEY ? "ENABLED" : "DISABLED"}`);
  console.log(`   Generators: ${generators.join(", ") || "none"}`);
  console.log("");

  // Load state
  const state = loadRepurposeState();

  // Resolve episodes to process
  let episodes: LoadedEpisode[] = [];

  if (episodeFlag) {
    const ep = loadEpisode(episodeFlag);
    if (!ep) {
      process.exit(1);
    }
    episodes = [ep];
  } else if (latest) {
    const ep = findLatestEpisode();
    if (!ep) {
      console.error("❌ Could not find any episode with a publishDate");
      process.exit(1);
    }
    console.log(`📋 Latest episode: ${ep.slug}`);
    episodes = [ep];
  } else if (auto) {
    episodes = findUnprocessedEpisodes(state.processedEpisodeSlugs);
    console.log(`📋 Unprocessed episodes (last 7 days): ${episodes.length}`);
    if (episodes.length === 0) {
      console.log("✅ Nothing to process!");
      saveRepurposeState(state);
      return;
    }
  } else {
    console.error("❌ No mode specified. Usage:");
    console.error("   npx tsx scripts/repurpose-episode.ts --episode=<slug>");
    console.error("   npx tsx scripts/repurpose-episode.ts --latest");
    console.error("   npx tsx scripts/repurpose-episode.ts --auto");
    console.error("");
    console.error("   Optional flags: --dry-run  --force  --skip-blog  --skip-social  --skip-quotes");
    process.exit(1);
  }

  // Process loop
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < episodes.length; i++) {
    const ep = episodes[i];
    const progress = `[${i + 1}/${episodes.length}]`;
    console.log(`\n${progress} ${ep.slug}`);

    try {
      const success = await processEpisode(ep, state);
      if (success) {
        processed++;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Error: ${msg}`);
      errors++;
    }
  }

  // Save state
  state.lastRepurposeDate = new Date().toISOString();
  if (!dryRun) {
    saveRepurposeState(state);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 REPURPOSE COMPLETE");
  console.log(`   Processed: ${processed}`);
  console.log(`   Errors:    ${errors}`);
  console.log(`   Total in archive: ${state.processedEpisodeSlugs.length}`);
  if (dryRun) {
    console.log("   [dry-run] State was NOT saved");
  }
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
