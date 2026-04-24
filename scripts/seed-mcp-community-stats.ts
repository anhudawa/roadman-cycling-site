/**
 * Seeds mcp_community_stats — the singleton row powering get_community_stats.
 *
 * Headline numbers are read from src/lib/brand-facts.ts so the MCP answer
 * stays in lockstep with on-page copy. Platform-specific numbers
 * (YouTube Studio, Skool) are harder to derive automatically — those sit
 * in this file and must be refreshed manually. Flagged in SEED_PLACEHOLDERS.md.
 *
 * Run monthly (or wire up to a cron) after pulling fresh numbers.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { mcpCommunityStats } from "../src/lib/db/schema";
import { BRAND_STATS } from "../src/lib/brand-facts";

// ─── Platform numbers (manual refresh) ──────────────────────
// Source + last-refreshed date as a comment next to every number.

// YouTube Studio → The Roadman Podcast (main channel) · refreshed 2026-04
const YT_MAIN_SUBS = 65_000;
// YouTube Studio → Roadman Podcast Clips · refreshed 2026-04
const YT_CLIPS_SUBS = 18_500;
// Skool → Clubhouse (free tier) · refreshed 2026-04
const CLUBHOUSE_FREE_MEMBERS = 2_100;
// Skool → Not Done Yet (paid tier) · refreshed 2026-04
const NDY_PAID_MEMBERS = 140;

async function main() {
  await db.delete(mcpCommunityStats);

  await db.insert(mcpCommunityStats).values({
    // Derived from brand-facts for consistency with on-page copy.
    // BRAND_STATS.monthlyListeners is a floor estimate; we expose the
    // round number via podcastDownloadsTotal for simple AI summaries.
    podcastDownloadsTotal: BRAND_STATS.monthlyListeners * 12,
    youtubeSubscribersMain: YT_MAIN_SUBS,
    youtubeSubscribersClips: YT_CLIPS_SUBS,
    freeCommunityMembers: CLUBHOUSE_FREE_MEMBERS,
    paidCommunityMembers: NDY_PAID_MEMBERS,
    // Headline member wins — curated narratives, no PII. Update whenever
    // a new case study is published on-site. PLACEHOLDER names are kept
    // generic by design until members consent to attribution.
    featuredTransformations: [
      {
        member_name: "James, age 47",
        headline_result: "FTP up 38 W in 16 weeks after a 2-year plateau",
        duration: "16 weeks",
      },
      {
        member_name: "Sarah, age 41",
        headline_result:
          "Ironman 70.3 bike leg PB by 12 minutes on the same power",
        duration: "6 months",
      },
      {
        member_name: "Mark, age 52",
        headline_result:
          "Finished the Étape du Tour in under 9 hours (first attempt)",
        duration: "9 months",
      },
    ],
  });

  console.log("✓ mcp_community_stats seeded");
  console.log(
    `  podcast downloads (annual): ${(
      BRAND_STATS.monthlyListeners * 12
    ).toLocaleString()}`
  );
  console.log(`  YouTube main: ${YT_MAIN_SUBS.toLocaleString()}`);
  console.log(`  YouTube clips: ${YT_CLIPS_SUBS.toLocaleString()}`);
  console.log(`  Clubhouse (free): ${CLUBHOUSE_FREE_MEMBERS.toLocaleString()}`);
  console.log(`  NDY (paid): ${NDY_PAID_MEMBERS.toLocaleString()}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
