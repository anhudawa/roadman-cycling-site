import "dotenv/config";
import {
  getChannelUploadPlaylistId,
  getAllVideoIds,
  getVideoDetails,
} from "./lib/youtube-api.js";
import { filterVideos } from "./lib/filters.js";
import { extractEpisodeNumber } from "./lib/classifier.js";
import { fetchTranscript, truncateTranscript } from "./lib/transcript.js";
import { extractFromTranscript, aiDelay } from "./lib/ai-extractor.js";
import {
  generateMdx,
  writeMdxFile,
  videoAlreadyExists,
} from "./lib/mdx-generator.js";
import { loadState, saveState } from "./lib/sync-state.js";

// Parse CLI args
const args = process.argv.slice(2);
const fullSync = args.includes("--full");
const dryRun = args.includes("--dry-run");
const metadataOnly = args.includes("--metadata-only");
const singleVideo = args.find((a) => a.startsWith("--video="))?.split("=")[1];

// Validate env
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_HANDLE =
  process.env.YOUTUBE_CHANNEL_HANDLE || "theroadmanpodcast";

if (!YOUTUBE_API_KEY) {
  console.error("❌ YOUTUBE_API_KEY is required. Set it in .env");
  process.exit(1);
}

async function main() {
  console.log("🎙  Roadman YouTube Sync");
  console.log(`   Mode: ${fullSync ? "FULL" : "INCREMENTAL"}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Metadata only: ${metadataOnly}`);
  console.log(`   AI: ${process.env.ANTHROPIC_API_KEY ? "ENABLED" : "DISABLED"}`);
  console.log("");

  const state = loadState();

  // Step 1: Resolve channel
  let uploadsPlaylistId = state.uploadsPlaylistId;
  if (!uploadsPlaylistId) {
    console.log(`📡 Resolving channel: @${CHANNEL_HANDLE}...`);
    uploadsPlaylistId = await getChannelUploadPlaylistId(
      YOUTUBE_API_KEY,
      CHANNEL_HANDLE
    );
    state.uploadsPlaylistId = uploadsPlaylistId;
    console.log(`   Uploads playlist: ${uploadsPlaylistId}`);
  }

  // Step 2: Get video IDs
  let videoIds: string[];
  if (singleVideo) {
    videoIds = [singleVideo];
    console.log(`🎬 Single video mode: ${singleVideo}`);
  } else {
    console.log("📋 Fetching video list...");
    const stopAt = fullSync ? undefined : state.processedVideoIds[0];
    videoIds = await getAllVideoIds(YOUTUBE_API_KEY, uploadsPlaylistId, stopAt);
    console.log(`   Found ${videoIds.length} videos`);
  }

  // Step 3: Get video details
  console.log("📊 Fetching video details...");
  const videos = await getVideoDetails(YOUTUBE_API_KEY, videoIds);
  console.log(`   Got details for ${videos.length} videos`);

  // Step 4: Filter
  const { passed, filtered } = filterVideos(videos);
  console.log(
    `🔍 Filtered: ${passed.length} episodes, ${filtered.length} skipped`
  );
  for (const f of filtered.slice(0, 5)) {
    console.log(`   ⏭  ${f.video.title.slice(0, 50)}... (${f.reason})`);
  }
  if (filtered.length > 5) {
    console.log(`   ... and ${filtered.length - 5} more`);
  }

  // Step 5: Deduplicate
  const newVideos = passed.filter((v) => {
    if (state.processedVideoIds.includes(v.videoId)) return false;
    if (state.skippedVideoIds.includes(v.videoId)) return false;
    if (videoAlreadyExists(v.videoId)) return false;
    return true;
  });

  console.log(`\n🆕 New episodes to process: ${newVideos.length}`);

  if (newVideos.length === 0) {
    console.log("✅ Nothing to sync!");
    saveState(state);
    return;
  }

  // Step 6: Sort by publish date (oldest first for consistent numbering)
  newVideos.sort(
    (a, b) =>
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );

  // Step 7: Process each video
  let created = 0;
  let errors = 0;

  for (let i = 0; i < newVideos.length; i++) {
    const video = newVideos[i];
    const progress = `[${i + 1}/${newVideos.length}]`;

    // Determine episode number
    let episodeNumber = extractEpisodeNumber(video.title);
    if (!episodeNumber) {
      state.episodeNumberCounter++;
      episodeNumber = state.episodeNumberCounter;
    } else {
      state.episodeNumberCounter = Math.max(
        state.episodeNumberCounter,
        episodeNumber
      );
    }

    console.log(
      `\n${progress} EP ${episodeNumber}: ${video.title.slice(0, 60)}...`
    );

    try {
      // Fetch transcript (unless metadata-only)
      let aiContent = null;
      if (!metadataOnly) {
        console.log("  📝 Fetching transcript...");
        const transcript = await fetchTranscript(video.videoId);

        if (transcript) {
          console.log(
            `  ✓ Transcript: ${transcript.split(/\s+/).length} words`
          );

          // AI extraction
          if (process.env.ANTHROPIC_API_KEY) {
            console.log("  🤖 Extracting quotes & key points...");
            const truncated = truncateTranscript(transcript);
            aiContent = await extractFromTranscript(
              truncated,
              video.title,
              undefined // guest extracted later in MDX gen
            );
            if (aiContent) {
              console.log(
                `  ✓ AI: ${aiContent.keyTakeaways.length} takeaways, ${aiContent.quotes.length} quotes`
              );
            }
            await aiDelay();
          }
        } else {
          console.log("  ⚠ No transcript available");
        }

        // Small delay between transcript fetches
        await new Promise((r) => setTimeout(r, 300));
      }

      // Generate MDX
      const { slug, filePath, content } = generateMdx({
        video,
        episodeNumber,
        aiContent,
      });

      if (dryRun) {
        console.log(`  🏷  Would write: ${slug}.mdx`);
      } else {
        writeMdxFile(filePath, content);
        console.log(`  ✅ Written: ${slug}.mdx`);
      }

      state.processedVideoIds.unshift(video.videoId);
      created++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Error: ${msg}`);
      errors++;
    }
  }

  // Step 8: Save state
  state.lastSyncDate = new Date().toISOString();
  if (!dryRun) {
    saveState(state);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 SYNC COMPLETE");
  console.log(`   Created: ${created}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Filtered: ${filtered.length}`);
  console.log(`   Total in archive: ${state.processedVideoIds.length}`);
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
