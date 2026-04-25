#!/usr/bin/env tsx
// ---------------------------------------------------------------------------
// Roadman Cycling $€” Podcast Transcript Indexer Agent
//
// Modes:
//   watch     $€” poll RSS, process new episodes (default)
//   backfill  $€” process back catalogue in batches
//
// Flags:
//   --dry-run           $€” process one episode, output diff to stdout, no git
//   --episode=<slug>    $€” process a specific episode by slug
//   --from=<n> --to=<n> $€” backfill range (episode numbers)
//   --mode=watch|backfill
// ---------------------------------------------------------------------------

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { loadEnv, paths, MAX_REGENERATION_ATTEMPTS, BACKFILL_RATE_LIMIT_MS, BACKFILL_BATCH_SIZE } from "./config.js";
import { AgentLogger } from "./lib/logger.js";
import { fetchRSSFeed } from "./lib/rss.js";
import { getTranscript } from "./lib/whisper.js";
import { extractMetadata } from "./steps/step1-metadata.js";
import { assignCluster } from "./steps/step2-cluster.js";
import { generateContent } from "./steps/step3-generate.js";
import { generateSocialContent } from "./steps/step3b-social.js";
import { generateBlogContent } from "./steps/step3c-blog.js";
import { checkVoiceFidelity } from "./steps/step4-voice-check.js";
import { injectReciprocalLinks } from "./steps/step5-links.js";
import { publishToAdminDashboard, publishBatchToAdminDashboard } from "./steps/step6-publish.js";
import type {
  EpisodeInput,
  PipelineResult,
  GeneratedContent,
  SocialContent,
  BlogContent,
  EpisodeIndex,
} from "./types.js";

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const flagValue = (name: string) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];

const dryRun = flag("dry-run");
const mode = (flagValue("mode") as "watch" | "backfill") ?? "watch";
const episodeSlugArg = flagValue("episode");
const backfillFrom = Number(flagValue("from") ?? 0);
const backfillTo = Number(flagValue("to") ?? 0);

// ---------------------------------------------------------------------------
// Resolve repo root (works from repo root or agent dir)
// ---------------------------------------------------------------------------

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, "package.json")) && fs.existsSync(path.join(dir, "content/podcast"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  // Fallback: assume we're somewhere inside the repo
  return path.resolve(process.cwd());
}

const repoRoot = findRepoRoot();
loadEnv(repoRoot);

const p = paths(repoRoot);
const logger = new AgentLogger(p.logsDir);

// ---------------------------------------------------------------------------
// Episode loading
// ---------------------------------------------------------------------------

function loadEpisodeFromMDX(slug: string): EpisodeInput | null {
  const filePath = path.join(p.podcastDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);

  if (!data.transcript || String(data.transcript).trim().length < 50) {
    console.warn(`  Skipping ${slug}: no transcript`);
    return null;
  }

  return {
    slug,
    title: String(data.title ?? ""),
    episodeNumber: Number(data.episodeNumber ?? 0),
    publishDate: String(data.publishDate ?? ""),
    youtubeId: String(data.youtubeId ?? ""),
    transcript: String(data.transcript),
    duration: data.duration ? String(data.duration) : undefined,
    pillar: data.pillar ? String(data.pillar) : undefined,
    type: data.type ? String(data.type) : undefined,
  };
}

function listAllEpisodes(): string[] {
  return fs
    .readdirSync(p.podcastDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

// ---------------------------------------------------------------------------
// MDX content assembly
// ---------------------------------------------------------------------------

/** Truncate at a word boundary, never mid-word. */
function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
}

function assembleMDX(
  episode: EpisodeInput,
  content: GeneratedContent,
  metadata: ReturnType<typeof extractMetadata> extends Promise<infer T> ? T : never,
  cluster: ReturnType<typeof assignCluster> extends Promise<infer T> ? T : never,
  voiceScore: number
): string {
  const frontmatter: Record<string, unknown> = {
    title: content.seo_title || episode.title,
    episodeNumber: episode.episodeNumber,
    description: truncateAtWord(content.lede, 300),
    publishDate: episode.publishDate,
    duration: episode.duration,
    youtubeId: episode.youtubeId,
    pillar: cluster.primary_cluster,
    type: metadata.episode_type,
    keywords: metadata.topics,
    seoDescription: content.meta_description,
    seoTitle: content.seo_title,
    primaryCluster: cluster.primary_cluster,
    secondaryCluster: cluster.secondary_clusters,
    primaryPersona: cluster.primary_persona,
    guestName: metadata.guest_name,
    guestCredentials: metadata.guest_credentials,
    sacredCowScore: voiceScore,
    autoIndexed: true,
    autoIndexedAt: new Date().toISOString(),
    transcript: episode.transcript,
  };

  // Build MDX body $€” strip any tags the model might have included in the citation block
  const citationText = content.ai_citation_block
    .replace(/<\/?AICitationBlock>/g, "")
    .trim();

  const body = `
${content.lede}

## Key Takeaways

${content.key_takeaways}

<AICitationBlock>
${citationText}
</AICitationBlock>

## You Might Also Like

${content.internal_links_prose}
`.trim();

  return matter.stringify(body, frontmatter);
}

// ---------------------------------------------------------------------------
// Meta sidecar
// ---------------------------------------------------------------------------

function writeMetaSidecar(
  slug: string,
  metadata: Awaited<ReturnType<typeof extractMetadata>>,
  cluster: Awaited<ReturnType<typeof assignCluster>>,
  voiceScore: number,
  dryRun: boolean
) {
  const sidecar = {
    slug,
    ...metadata,
    ...cluster,
    sacred_cow_score: voiceScore,
    indexed_at: new Date().toISOString(),
  };

  if (dryRun) {
    console.log(`\n--- META SIDECAR: ${slug}.json ---`);
    console.log(JSON.stringify(sidecar, null, 2));
    return sidecar;
  }

  fs.mkdirSync(p.metaDir, { recursive: true });
  fs.writeFileSync(
    path.join(p.metaDir, `${slug}.json`),
    JSON.stringify(sidecar, null, 2)
  );
  return sidecar;
}

// ---------------------------------------------------------------------------
// Pipeline: process one episode through all 6 steps
// ---------------------------------------------------------------------------

async function processEpisode(episode: EpisodeInput): Promise<PipelineResult> {
  const startTime = Date.now();
  console.log(`\nProcessing: ${episode.title} (${episode.slug})`);

  // Step 1: Metadata extraction
  console.log("  Step 1: Extracting metadata (Haiku)...");
  const metadata = await extractMetadata(episode, p.promptsDir, logger);
  console.log(`    Guest: ${metadata.guest_name ?? "Solo"}, Claims: ${metadata.key_claims.length}, Experts: ${metadata.named_experts.length}`);

  // Step 2: Topic cluster assignment
  console.log("  Step 2: Assigning cluster (Haiku)...");
  const cluster = await assignCluster(
    episode,
    metadata,
    p.topicClusters,
    p.personaKeywords,
    p.promptsDir,
    logger
  );
  console.log(`    Cluster: ${cluster.primary_cluster}, Persona: ${cluster.primary_persona}`);

  // Step 3 + 4: Generate content, then voice check, with regeneration loop
  let content: GeneratedContent | null = null;
  let voiceCheck = null;
  let regenerationAttempts = 0;
  let regenerationNotes: string | undefined;

  for (let attempt = 0; attempt <= MAX_REGENERATION_ATTEMPTS; attempt++) {
    // Step 3: Generate page content
    console.log(`  Step 3: Generating page content (Sonnet)${attempt > 0 ? ` [regen ${attempt}]` : ""}...`);
    content = await generateContent(
      episode,
      metadata,
      cluster,
      p.podcastDir,
      p.metaDir,
      p.promptsDir,
      logger,
      regenerationNotes
    );

    // Step 4: Voice fidelity check
    console.log("  Step 4: Voice fidelity check (Opus)...");
    voiceCheck = await checkVoiceFidelity(
      episode,
      metadata,
      content,
      p.promptsDir,
      logger,
      attempt
    );

    console.log(`    Sacred Cow score: ${voiceCheck.sacred_cow_score}/7, Red flags: ${voiceCheck.voice_red_flag_count}, Pass: ${voiceCheck.overall_pass}`);

    if (voiceCheck.overall_pass) {
      break;
    }

    regenerationAttempts = attempt + 1;
    if (attempt < MAX_REGENERATION_ATTEMPTS) {
      console.log(`    FAILED $€” regenerating with notes: ${voiceCheck.regeneration_notes.slice(0, 100)}...`);
      regenerationNotes = voiceCheck.failure_reasons.join("\n") + "\n" + voiceCheck.regeneration_notes;
    } else {
      console.log(`    FAILED after ${MAX_REGENERATION_ATTEMPTS} attempts $€” will open PR with needs-human-rewrite label`);
    }
  }

  // Step 3b: Generate social content (FB, LinkedIn, X thread)
  console.log("  Step 3b: Generating social content (Sonnet)...");
  let socialContent: SocialContent | null = null;
  try {
    socialContent = await generateSocialContent(episode, metadata, cluster, p.promptsDir, logger);
    console.log(`    Facebook: ${socialContent.facebook.angle}`);
    console.log(`    LinkedIn: ${socialContent.linkedin.post.slice(0, 60)}...`);
    console.log(`    Twitter: ${socialContent.twitter.tweets.length} tweets`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`    Social generation failed: ${msg}`);
  }

  // Step 3c: Generate blog post (Sonnet)
  console.log("  Step 3c: Generating blog post (Sonnet)...");
  let blogContent: BlogContent | null = null;
  try {
    blogContent = await generateBlogContent(episode, metadata, cluster, p.podcastDir, p.metaDir, p.promptsDir, logger);
    console.log(`    Blog: "${blogContent.title}" (${blogContent.body.split(/\s+/).length} words)`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`    Blog generation failed: ${msg}`);
  }

  // Assemble MDX
  const mdxContent = assembleMDX(episode, content!, metadata, cluster, voiceCheck!.sacred_cow_score);

  if (dryRun) {
    // Write full MDX to a temp file so it can be reviewed
    const dryRunPath = path.join(repoRoot, `tmp/dry-run-${episode.slug}.mdx`);
    fs.mkdirSync(path.dirname(dryRunPath), { recursive: true });
    fs.writeFileSync(dryRunPath, mdxContent);
    console.log(`\n--- GENERATED MDX written to: ${dryRunPath} ---`);

    // Print just the body (after the frontmatter closing ---)
    const parts = mdxContent.split("---");
    if (parts.length >= 3) {
      const body = parts.slice(2).join("---").trim();
      console.log("\n--- BODY CONTENT ---");
      console.log(body);
      console.log("--- END BODY ---");
    }
  } else {
    fs.writeFileSync(path.join(p.podcastDir, `${episode.slug}.mdx`), mdxContent);
  }

  // Write transcript file
  if (!dryRun) {
    fs.mkdirSync(p.transcriptsDir, { recursive: true });
    fs.writeFileSync(
      path.join(p.transcriptsDir, `${episode.slug}.txt`),
      episode.transcript
    );
  }

  // Write meta sidecar
  const sidecar = writeMetaSidecar(episode.slug, metadata, cluster, voiceCheck!.sacred_cow_score, dryRun);

  // Step 5: Internal link injection
  console.log("  Step 5: Injecting reciprocal links...");
  const reciprocalEdits = injectReciprocalLinks(
    episode.slug,
    episode.title,
    content!.internal_link_slugs,
    p.podcastDir,
    dryRun
  );
  console.log(`    ${reciprocalEdits.length} reciprocal links injected`);

  const usage = logger.collectUsage(episode.slug, startTime);

  return {
    slug: episode.slug,
    episodeNumber: episode.episodeNumber,
    title: episode.title,
    metadata,
    cluster,
    content: content!,
    socialContent,
    blogContent,
    voiceCheck: voiceCheck!,
    regenerationAttempts,
    mdxContent,
    metaSidecar: sidecar,
    reciprocalEdits,
    usage,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Roadman Cycling $€” Transcript Indexer Agent ===");
  console.log(`Mode: ${mode} | Dry run: ${dryRun} | Run ID: ${logger.id}`);
  console.log(`Repo root: ${repoRoot}`);
  console.log("");

  // --episode flag: process a single specific episode
  if (episodeSlugArg) {
    const episode = loadEpisodeFromMDX(episodeSlugArg);
    if (!episode) {
      console.error(`Episode not found or missing transcript: ${episodeSlugArg}`);
      process.exit(1);
    }

    const result = await processEpisode(episode);

    console.log("\n  Step 6: Publishing to admin dashboard...");
    const episodeDbId = await publishToAdminDashboard(result, repoRoot, dryRun);
    console.log(`  DB episode ID: ${episodeDbId ?? "dry-run"}`);

    console.log("\nDone.");
    return;
  }

  // Backfill mode
  if (mode === "backfill") {
    console.log(`Backfill range: ${backfillFrom} to ${backfillTo}`);
    const allSlugs = listAllEpisodes();

    // Load all episodes with their episode numbers
    const episodes: EpisodeInput[] = [];
    for (const slug of allSlugs) {
      const ep = loadEpisodeFromMDX(slug);
      if (!ep) continue;
      if (backfillFrom && ep.episodeNumber < backfillFrom) continue;
      if (backfillTo && ep.episodeNumber > backfillTo) continue;
      episodes.push(ep);
    }

    // Sort by episode number
    episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
    console.log(`Found ${episodes.length} episodes to process`);

    const batchResults: PipelineResult[] = [];
    let processedThisHour = 0;

    for (const episode of episodes) {
      // Rate limiting: 20 per hour
      if (!dryRun && processedThisHour >= 20) {
        console.log("\nRate limit reached (20/hour). Waiting...");
        await new Promise((r) => setTimeout(r, BACKFILL_RATE_LIMIT_MS));
        processedThisHour = 0;
      }

      const result = await processEpisode(episode);
      batchResults.push(result);
      processedThisHour++;

      // Publish batch every BACKFILL_BATCH_SIZE episodes
      if (!dryRun && batchResults.length >= BACKFILL_BATCH_SIZE) {
        console.log(`\n  Step 6: Publishing batch (${batchResults.length} episodes) to admin dashboard...`);
        const ids = await publishBatchToAdminDashboard(batchResults, repoRoot, dryRun);
        console.log(`  Published ${ids.length} episodes to DB`);
        batchResults.length = 0;
      }

      // In dry-run mode, only process one episode
      if (dryRun) {
        await publishToAdminDashboard(result, repoRoot, true);
        break;
      }

      // Rate limit delay between episodes
      if (!dryRun) {
        await new Promise((r) => setTimeout(r, BACKFILL_RATE_LIMIT_MS));
      }
    }

    // Final batch
    if (!dryRun && batchResults.length > 0) {
      console.log(`\n  Step 6: Publishing final batch (${batchResults.length} episodes)...`);
      const ids = await publishBatchToAdminDashboard(batchResults, repoRoot, dryRun);
      console.log(`  Published ${ids.length} episodes to DB`);
    }

    console.log("\nBackfill complete.");
    return;
  }

  // Watch mode $€” poll RSS for new episodes, or fall back to unprocessed local files
  if (mode === "watch") {
    const rssUrl = process.env.PODCAST_RSS;

    // Load or create episode index
    let episodeIndex: EpisodeIndex = { processedEpisodes: {}, lastPollAt: "" };
    if (fs.existsSync(p.episodeIndex)) {
      episodeIndex = JSON.parse(fs.readFileSync(p.episodeIndex, "utf-8"));
    }

    // If RSS URL is set, poll for new episodes
    if (rssUrl) {
      console.log(`Polling RSS feed: ${rssUrl}`);
      try {
        const feed = await fetchRSSFeed(rssUrl);
        console.log(`RSS: ${feed.length} episodes in feed`);

        // Find episodes not yet processed
        const newFromFeed = feed.filter((ep) => !episodeIndex.processedEpisodes[ep.guid]);
        console.log(`New episodes from RSS: ${newFromFeed.length}`);

        if (newFromFeed.length === 0) {
          console.log("No new episodes from RSS.");
        }

        // Process new episodes (most recent first).
        // Cap at 2 per run to avoid blasting through the entire backlog.
        const WATCH_BATCH_LIMIT = 2;
        const toProcess = dryRun
          ? newFromFeed.slice(0, 1)
          : newFromFeed.slice(0, WATCH_BATCH_LIMIT);
        if (newFromFeed.length > toProcess.length) {
          console.log(
            `Capping this run at ${toProcess.length} episodes (${newFromFeed.length - toProcess.length} remaining will be picked up next run).`
          );
        }

        for (const rssEp of toProcess) {
          // Check if we already have this episode locally (by title match)
          const allSlugs = listAllEpisodes();
          let localSlug: string | null = null;
          for (const slug of allSlugs) {
            const ep = loadEpisodeFromMDX(slug);
            if (ep && ep.title.toLowerCase() === rssEp.title.toLowerCase()) {
              localSlug = slug;
              break;
            }
          }

          let episode: EpisodeInput | null = null;

          if (localSlug) {
            episode = loadEpisodeFromMDX(localSlug);
          } else {
            // New episode not in local files $€” try to get transcript
            console.log(`  New episode from RSS: ${rssEp.title}`);
            const transcript = await getTranscript("", rssEp.enclosureUrl);
            if (!transcript) {
              console.log(`  Could not get transcript for ${rssEp.title} $€” skipping`);
              continue;
            }
            // Create a slug from the title
            const slug = "ep-new-" + rssEp.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 60);
            episode = {
              slug,
              title: rssEp.title,
              episodeNumber: 0, // will be assigned
              publishDate: rssEp.pubDate ? new Date(rssEp.pubDate).toISOString().split("T")[0] : "",
              youtubeId: "",
              transcript,
              duration: rssEp.duration,
            };
          }

          if (!episode) continue;

          const result = await processEpisode(episode);

          console.log("\n  Step 6: Publishing to admin dashboard...");
          const episodeDbId = await publishToAdminDashboard(result, repoRoot, dryRun);
          console.log(`  DB episode ID: ${episodeDbId ?? "dry-run"}`);

          if (!dryRun) {
            episodeIndex.processedEpisodes[rssEp.guid] = {
              processedAt: new Date().toISOString(),
            };
          }
        }

        episodeIndex.lastPollAt = new Date().toISOString();
        if (!dryRun) {
          fs.writeFileSync(p.episodeIndex, JSON.stringify(episodeIndex, null, 2));
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`RSS polling failed: ${msg}`);
        console.log("Falling back to local unprocessed episodes...");
      }
    }

    // Fallback / additional: process local episodes without meta sidecars
    const allSlugs = listAllEpisodes();
    const unprocessed: string[] = [];
    for (const slug of allSlugs) {
      const metaPath = path.join(p.metaDir, `${slug}.json`);
      if (!fs.existsSync(metaPath)) {
        unprocessed.push(slug);
      }
    }

    // Sort by most recent first (rough sort by filename)
    unprocessed.sort().reverse();

    if (unprocessed.length > 0) {
      console.log(`\n${unprocessed.length} local episodes without meta sidecars`);
      const toProcess = dryRun ? [unprocessed[0]] : unprocessed;

      for (const slug of toProcess) {
        const episode = loadEpisodeFromMDX(slug);
        if (!episode) continue;

        const result = await processEpisode(episode);

        console.log("\n  Step 6: Publishing to admin dashboard...");
        const episodeDbId = await publishToAdminDashboard(result, repoRoot, dryRun);
        console.log(`  DB episode ID: ${episodeDbId ?? "dry-run"}`);

      }
    } else if (!rssUrl) {
      console.log("No PODCAST_RSS set and no unprocessed local episodes.");
    }

    console.log("\nWatch mode complete.");
    return;
  }
}

main().catch((err) => {
  console.error("Agent failed:", err);
  process.exit(1);
});
