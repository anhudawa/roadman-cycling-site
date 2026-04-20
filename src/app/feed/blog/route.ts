import { getAllPosts } from "@/lib/blog";

const SITE_URL = "https://roadmancycling.com";
const FEED_TITLE = "Roadman Cycling Blog";
const FEED_DESCRIPTION =
  "Evidence-based cycling training, nutrition, strength, and recovery guides from the team behind the Roadman Cycling Podcast. Written by Anthony Walsh.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getAllPosts();

  const items = posts.slice(0, 50).map((post) => {
    const url = `${SITE_URL}/blog/${post.slug}`;
    const pubDate = new Date(post.publishDate).toUTCString();
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.seoDescription)}</description>
      <author>anthony@roadmancycling.com (Anthony Walsh)</author>
      <category>${escapeXml(post.pillar)}</category>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed/blog" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/images/logo-white.png</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${SITE_URL}/blog</link>
    </image>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
