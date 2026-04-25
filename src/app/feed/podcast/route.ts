import { getAllEpisodes } from "@/lib/podcast";

const SITE_URL = "https://roadmancycling.com";
const PODCAST_TITLE = "The Roadman Cycling Podcast";
const PODCAST_AUTHOR = "Anthony Walsh";
const PODCAST_DESCRIPTION =
  "The podcast trusted by 1 million monthly listeners. Expert cycling coaching, training insights, nutrition advice, and interviews with world-class coaches, scientists, and pro riders. Cycling is hard $— we make it less hard.";
const PODCAST_IMAGE = `${SITE_URL}/og-image.jpg`;
const PODCAST_LANGUAGE = "en";
const PODCAST_EMAIL = "podcast@roadmancycling.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRfc822Date(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toUTCString();
}

/**
 * Convert a duration string like "1:23:45" or "45:51" to seconds.
 */
function durationToSeconds(duration: string): number {
  const parts = duration.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/**
 * Convert a duration string like "1:23:45" or "45:51" to iTunes duration format (HH:MM:SS).
 */
function formatItunesDuration(duration: string): string {
  const totalSeconds = durationToSeconds(duration);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

export async function GET() {
  const episodes = getAllEpisodes();

  const itemsXml = episodes
    .map((ep) => {
      const episodeUrl = `${SITE_URL}/podcast/${ep.slug}`;
      const title = escapeXml(ep.title);
      const description = escapeXml(ep.seoDescription || ep.description);
      const pubDate = formatRfc822Date(ep.publishDate);
      const itunesDuration = formatItunesDuration(ep.duration);

      // Use YouTube video URL as the enclosure fallback since episodes are YouTube-based
      const youtubeUrl = ep.youtubeId
        ? `https://www.youtube.com/watch?v=${ep.youtubeId}`
        : episodeUrl;
      const thumbnailUrl = ep.youtubeId
        ? `https://img.youtube.com/vi/${ep.youtubeId}/maxresdefault.jpg`
        : PODCAST_IMAGE;

      const guestTag = ep.guest
        ? `\n        <itunes:author>${escapeXml(ep.guest === "Roadman Podcast" ? PODCAST_AUTHOR : ep.guest)}</itunes:author>`
        : `\n        <itunes:author>${escapeXml(PODCAST_AUTHOR)}</itunes:author>`;

      return `    <item>
      <title>${title}</title>
      <description>${description}</description>
      <link>${episodeUrl}</link>
      <guid isPermaLink="true">${episodeUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${escapeXml(youtubeUrl)}" type="video/mp4" length="0" />
      <itunes:episode>${ep.episodeNumber}</itunes:episode>
      <itunes:duration>${itunesDuration}</itunes:duration>
      <itunes:summary>${description}</itunes:summary>
      <itunes:image href="${escapeXml(thumbnailUrl)}" />${guestTag}
      <itunes:explicit>false</itunes:explicit>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(PODCAST_TITLE)}</title>
    <link>${SITE_URL}/podcast</link>
    <description>${escapeXml(PODCAST_DESCRIPTION)}</description>
    <language>${PODCAST_LANGUAGE}</language>
    <copyright>&#xA9; ${new Date().getFullYear()} Roadman Cycling. All rights reserved.</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed/podcast" rel="self" type="application/rss+xml" />
    <image>
      <url>${PODCAST_IMAGE}</url>
      <title>${escapeXml(PODCAST_TITLE)}</title>
      <link>${SITE_URL}/podcast</link>
    </image>
    <itunes:author>${escapeXml(PODCAST_AUTHOR)}</itunes:author>
    <itunes:summary>${escapeXml(PODCAST_DESCRIPTION)}</itunes:summary>
    <itunes:owner>
      <itunes:name>${escapeXml(PODCAST_AUTHOR)}</itunes:name>
      <itunes:email>${PODCAST_EMAIL}</itunes:email>
    </itunes:owner>
    <itunes:image href="${PODCAST_IMAGE}" />
    <itunes:category text="Sports" />
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
