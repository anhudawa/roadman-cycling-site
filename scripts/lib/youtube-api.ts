import { execSync } from "child_process";

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  duration: number; // seconds
  tags: string[];
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
}

interface YtDlpFlatItem {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  url: string;
}

interface YtDlpFullItem {
  id: string;
  title: string;
  description: string;
  upload_date: string; // YYYYMMDD
  duration: number;
  tags: string[];
  thumbnail: string;
  view_count: number;
  like_count: number;
}

/**
 * Get all video IDs from a YouTube channel using yt-dlp --flat-playlist
 * This is fast and doesn't need an API key.
 */
export function getAllVideoIds(channelHandle: string): string[] {
  console.log(`   Fetching video list from @${channelHandle}...`);

  const output = execSync(
    `python3 -m yt_dlp --flat-playlist --dump-json "https://www.youtube.com/@${channelHandle}/videos" 2>/dev/null`,
    { maxBuffer: 50 * 1024 * 1024, encoding: "utf-8" }
  );

  const lines = output.trim().split("\n").filter(Boolean);
  const ids: string[] = [];

  for (const line of lines) {
    try {
      const item = JSON.parse(line) as YtDlpFlatItem;
      if (item.id) {
        ids.push(item.id);
      }
    } catch {
      // Skip malformed lines
    }
  }

  return ids;
}

/**
 * Get full metadata for a single video using yt-dlp.
 * Returns null if the video can't be fetched.
 */
export function getVideoDetails(videoId: string): YouTubeVideo | null {
  try {
    const output = execSync(
      `python3 -m yt_dlp --dump-json --skip-download "https://www.youtube.com/watch?v=${videoId}" 2>/dev/null`,
      { maxBuffer: 10 * 1024 * 1024, encoding: "utf-8", timeout: 30000 }
    );

    const data = JSON.parse(output) as YtDlpFullItem;

    // Convert upload_date (YYYYMMDD) to ISO date
    const dateStr = data.upload_date;
    const isoDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;

    return {
      videoId: data.id,
      title: data.title || "",
      description: data.description || "",
      publishedAt: isoDate,
      duration: data.duration || 0,
      tags: data.tags || [],
      thumbnailUrl: data.thumbnail || `https://i.ytimg.com/vi/${data.id}/maxresdefault.jpg`,
      viewCount: data.view_count || 0,
      likeCount: data.like_count || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Get full metadata for multiple videos in batch.
 * Fetches one at a time with a small delay to be polite.
 */
export async function getVideoDetailsBatch(
  videoIds: string[],
  onProgress?: (current: number, total: number) => void
): Promise<YouTubeVideo[]> {
  const videos: YouTubeVideo[] = [];

  for (let i = 0; i < videoIds.length; i++) {
    const video = getVideoDetails(videoIds[i]);
    if (video) {
      videos.push(video);
    }

    if (onProgress) {
      onProgress(i + 1, videoIds.length);
    }

    // Small delay between requests
    if (i < videoIds.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return videos;
}
