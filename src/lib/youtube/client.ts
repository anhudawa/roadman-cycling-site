const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE || "theroadmanpodcast";

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
}

/**
 * Resolve a channel handle to a channel ID via the YouTube Data API.
 */
async function getChannelId(): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${CHANNEL_HANDLE}&key=${API_KEY}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error(`YouTube channels API: ${res.status}`);
  const data = await res.json();
  const id = data.items?.[0]?.id;
  if (!id) throw new Error(`No channel found for handle: ${CHANNEL_HANDLE}`);
  return id;
}

/**
 * Fetch recent videos from the channel. Returns up to `maxResults` videos
 * (max 50 per page, paginated up to the limit).
 */
export async function getChannelVideos(maxResults = 100): Promise<YouTubeVideo[]> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY not configured");

  const channelId = await getChannelId();
  const videos: YouTubeVideo[] = [];
  let pageToken: string | undefined;

  while (videos.length < maxResults) {
    const perPage = Math.min(50, maxResults - videos.length);
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("channelId", channelId);
    url.searchParams.set("type", "video");
    url.searchParams.set("order", "date");
    url.searchParams.set("maxResults", String(perPage));
    url.searchParams.set("key", API_KEY);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`YouTube search API: ${res.status}`);
    const data = await res.json();

    for (const item of data.items ?? []) {
      videos.push({
        id: item.id.videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        thumbnail:
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          "",
      });
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  return videos;
}
