import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../src/lib/db";
import { mcpCommunityStats } from "../src/lib/db/schema";

async function main() {
  await db.delete(mcpCommunityStats);
  await db.insert(mcpCommunityStats).values({
    podcastDownloadsTotal: 100_000_000, // PLACEHOLDER — update from Buzzsprout/Spotify
    youtubeSubscribersMain: 61_773,     // PLACEHOLDER — from YouTube Studio March 2026
    youtubeSubscribersClips: 13_238,    // PLACEHOLDER — from YouTube Studio March 2026
    freeCommunityMembers: 1_852,        // PLACEHOLDER — from Skool Clubhouse March 2026
    paidCommunityMembers: 113,          // PLACEHOLDER — from Skool NDY March 2026
    featuredTransformations: [
      {
        member_name: "PLACEHOLDER_1",
        headline_result: "Cat 3 to Cat 1 in 18 months",
        duration: "18 months",
      },
      {
        member_name: "PLACEHOLDER_2",
        headline_result: "Body fat from 20% to 7%",
        duration: "12 months",
      },
      {
        member_name: "PLACEHOLDER_3",
        headline_result: "Women's National Series podium",
        duration: "24 months",
      },
    ],
  });
  console.log("✓ mcp_community_stats seeded");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
