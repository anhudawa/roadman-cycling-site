import type { RSSEpisode } from "../types.js";

/**
 * Fetch and parse a podcast RSS feed.
 * Returns episodes sorted by pubDate (most recent first).
 */
export async function fetchRSSFeed(feedUrl: string): Promise<RSSEpisode[]> {
  const response = await fetch(feedUrl);
  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  return parseRSSXml(xml);
}

/**
 * Minimal RSS XML parser — extracts <item> elements without a full XML library.
 * Handles standard podcast RSS feeds (title, guid, pubDate, enclosure, duration).
 */
function parseRSSXml(xml: string): RSSEpisode[] {
  const episodes: RSSEpisode[] = [];

  // Split on <item> tags
  const items = xml.split(/<item[\s>]/i).slice(1);

  for (const item of items) {
    const closing = item.indexOf("</item>");
    const block = closing >= 0 ? item.slice(0, closing) : item;

    const title = extractTag(block, "title");
    const guid = extractTag(block, "guid") || extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");

    // Enclosure URL (audio file)
    const enclosureMatch = block.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    const enclosureUrl = enclosureMatch?.[1] ?? undefined;

    // iTunes duration
    const duration =
      extractTag(block, "itunes:duration") ?? extractTag(block, "duration") ?? undefined;

    if (title && guid) {
      episodes.push({
        title: cleanXmlText(title),
        guid: cleanXmlText(guid),
        pubDate: pubDate ?? "",
        enclosureUrl,
        duration,
      });
    }
  }

  // Sort by pubDate descending
  episodes.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return dateB - dateA;
  });

  return episodes;
}

function extractTag(xml: string, tagName: string): string | null {
  // Handle CDATA
  const cdataPattern = new RegExp(
    `<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tagName}>`,
    "i"
  );
  const cdataMatch = xml.match(cdataPattern);
  if (cdataMatch) return cdataMatch[1].trim();

  // Handle plain text
  const plainPattern = new RegExp(
    `<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`,
    "i"
  );
  const plainMatch = xml.match(plainPattern);
  if (plainMatch) return plainMatch[1].trim();

  return null;
}

function cleanXmlText(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}
