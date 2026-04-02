import "dotenv/config";
import {
  getAllVideoIds,
  getVideoDetails,
  type YouTubeVideo,
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
const limit = parseInt(
  args.find((a) => a.startsWith("--limit="))?.split("=")[1] || "0"
);

const CHANNEL_HANDLE =
  process.env.YOUTUBE_CHANNEL_HANDLE || "theroadmanpodcast";

async function main() {
  console.log("🎙  Roadman YouTube Sync (yt-dlp)");
  console.log(`   Channel: @${CHANNEL_HANDLE}`);
  console.log(`   Mode: ${fullSync ? "FULL" : "INCREMENTAL"}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Metadata only: ${metadataOnly}`);
  console.log(
    `   AI: ${process.env.ANTHROPIC_API_KEY ? "ENABLED (Haiku)" : "DISABLED"}`
  );
  if (limit) console.log(`   Limit: ${limit} videos`);
  console.log("");

  const state = loadState();

  // Step 1: Get all video IDs from channel
  let videoIds: string[];
  if (singleVideo) {
    videoIds = [singleVideo];
    console.log(`🎬 Single video mode: ${singleVideo}`);
  } else {
    console.log("📋 Fetching video list from YouTube...");
    videoIds = getAllVideoIds(CHANNEL_HANDLE);
    console.log(`   Found ${videoIds.length} videos on channel`);
  }

  // Step 2: Filter to unprocessed videos
  const newVideoIds = videoIds.filter((id) => {
    if (!fullSync && state.processedVideoIds.includes(id)) return false;
    if (state.skippedVideoIds.includes(id)) return false;
    if (videoAlreadyExists(id)) return false;
    return true;
  });

  console.log(`🆕 New videos to process: ${newVideoIds.length}`);

  if (newVideoIds.length === 0) {
    console.log("✅ Nothing to sync!");
    saveState(state);
    return;
  }

  // Apply limit if set
  const toProcess = limit ? newVideoIds.slice(0, limit) : newVideoIds;
  if (limit && newVideoIds.length > limit) {
    console.log(`   Processing first ${limit} of ${newVideoIds.length}`);
  }

  // Step 3: Fetch full details and process each video
  let created = 0;
  let errors = 0;
  let filtered = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const videoId = toProcess[i];
    const progress = `[${i + 1}/${toProcess.length}]`;

    // Get full metadata
    process.stdout.write(`\n${progress} Fetching ${videoId}... `);
    const video = getVideoDetails(videoId);

    if (!video) {
      console.log("❌ Could not fetch metadata");
      errors++;
      continue;
    }

    // Filter check
    const { passed } = filterVideos([video]);
    if (passed.length === 0) {
      console.log(`⏭ Filtered: ${video.title.slice(0, 50)}...`);
      state.skippedVideoIds.push(videoId);
      filtered++;
      continue;
    }

    console.log(`\n   📺 ${video.title.slice(0, 65)}`);

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

    try {
      // Fetch transcript (unless metadata-only)
      let aiContent = null;
      if (!metadataOnly) {
        process.stdout.write("   📝 Transcript... ");
        const transcript = await fetchTranscript(video.videoId);

        if (transcript) {
          const wordCount = transcript.split(/\s+/).length;
          console.log(`✓ ${wordCount} words`);

          // AI extraction
          if (process.env.ANTHROPIC_API_KEY) {
            process.stdout.write("   🤖 AI extraction... ");
            const truncated = truncateTranscript(transcript);
            aiContent = await extractFromTranscript(
              truncated,
              video.title,
              undefined
            );
            if (aiContent) {
              console.log(
                `✓ ${aiContent.keyTakeaways.length} takeaways, ${aiContent.quotes.length} quotes`
              );
            } else {
              console.log("⚠ Failed");
            }
            await aiDelay();
          }
        } else {
          console.log("⚠ None available");
        }

        // Small delay between videos
        await new Promise((r) => setTimeout(r, 300));
      }

      // Generate MDX
      const { slug, filePath, content } = generateMdx({
        video,
        episodeNumber,
        aiContent,
      });

      if (dryRun) {
        console.log(`   🏷  Would write: ${slug}.mdx`);
      } else {
        writeMdxFile(filePath, content);
        console.log(`   ✅ ${slug}.mdx`);
      }

      state.processedVideoIds.unshift(video.videoId);
      created++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Error: ${msg}`);
      errors++;
    }
  }

  // Save state
  state.lastSyncDate = new Date().toISOString();
  if (!dryRun) {
    saveState(state);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 SYNC COMPLETE");
  console.log(`   Created: ${created}`);
  console.log(`   Filtered: ${filtered}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total in archive: ${state.processedVideoIds.length}`);
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
