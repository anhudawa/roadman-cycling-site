import { google, type youtube_v3 } from "googleapis";

const youtube = google.youtube("v3");

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  duration: string; // ISO 8601 e.g. "PT1H12M34S"
  tags: string[];
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
}

export async function getChannelUploadPlaylistId(
  apiKey: string,
  channelHandle: string
): Promise<string> {
  // Try handle-based lookup first
  const res = await youtube.channels.list({
    key: apiKey,
    forHandle: channelHandle,
    part: ["contentDetails"],
  });

  const channel = res.data.items?.[0];
  if (!channel?.contentDetails?.relatedPlaylists?.uploads) {
    throw new Error(
      `Could not find uploads playlist for channel handle: ${channelHandle}`
    );
  }

  return channel.contentDetails.relatedPlaylists.uploads;
}

export async function getAllVideoIds(
  apiKey: string,
  playlistId: string,
  stopAtVideoId?: string
): Promise<string[]> {
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  while (true) {
    const res = await youtube.playlistItems.list({
      key: apiKey,
      playlistId,
      part: ["contentDetails"],
      maxResults: 50,
      pageToken,
    });

    const items = res.data.items || [];
    let shouldStop = false;

    for (const item of items) {
      const videoId = item.contentDetails?.videoId;
      if (!videoId) continue;

      if (stopAtVideoId && videoId === stopAtVideoId) {
        shouldStop = true;
        break;
      }

      videoIds.push(videoId);
    }

    if (shouldStop) break;

    pageToken = res.data.nextPageToken || undefined;
    if (!pageToken) break;
  }

  return videoIds;
}

export async function getVideoDetails(
  apiKey: string,
  videoIds: string[]
): Promise<YouTubeVideo[]> {
  const videos: YouTubeVideo[] = [];

  // Process in batches of 50
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);

    const res = await youtube.videos.list({
      key: apiKey,
      id: batch,
      part: ["snippet", "contentDetails", "statistics"],
    });

    for (const item of res.data.items || []) {
      if (!item.id || !item.snippet || !item.contentDetails) continue;

      videos.push({
        videoId: item.id,
        title: item.snippet.title || "",
        description: item.snippet.description || "",
        publishedAt: item.snippet.publishedAt || "",
        duration: item.contentDetails.duration || "PT0S",
        tags: item.snippet.tags || [],
        thumbnailUrl:
          item.snippet.thumbnails?.maxres?.url ||
          item.snippet.thumbnails?.high?.url ||
          item.snippet.thumbnails?.default?.url ||
          "",
        viewCount: parseInt(item.statistics?.viewCount || "0"),
        likeCount: parseInt(item.statistics?.likeCount || "0"),
      });
    }
  }

  return videos;
}
