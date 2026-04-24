import { db } from "@/lib/db";
import { mcpCommunityStats } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export interface CommunityStats {
  podcast_downloads_total: number;
  youtube_subscribers_main: number;
  youtube_subscribers_clips: number;
  free_community_members: number;
  paid_community_members: number;
  featured_transformations: {
    member_name: string;
    headline_result: string;
    duration: string;
  }[];
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const rows = await db
    .select()
    .from(mcpCommunityStats)
    .orderBy(desc(mcpCommunityStats.updatedAt))
    .limit(1);

  if (rows.length === 0) {
    return {
      podcast_downloads_total: 0,
      youtube_subscribers_main: 0,
      youtube_subscribers_clips: 0,
      free_community_members: 0,
      paid_community_members: 0,
      featured_transformations: [],
    };
  }

  const row = rows[0];
  return {
    podcast_downloads_total: row.podcastDownloadsTotal,
    youtube_subscribers_main: row.youtubeSubscribersMain,
    youtube_subscribers_clips: row.youtubeSubscribersClips,
    free_community_members: row.freeCommunityMembers,
    paid_community_members: row.paidCommunityMembers,
    featured_transformations:
      (row.featuredTransformations as CommunityStats["featured_transformations"]) ??
      [],
  };
}
