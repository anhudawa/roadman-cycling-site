import {
  getChildSitemapUrl,
  SITEMAP_IDS,
  VIDEO_SITEMAP_URL,
} from "@/lib/seo/sitemaps";

export async function GET() {
  const sitemapUrls = [
    ...SITEMAP_IDS.map((id) => getChildSitemapUrl(id)),
    VIDEO_SITEMAP_URL,
  ];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapUrls.map(
      (url) =>
        `  <sitemap>\n    <loc>${url}</loc>\n  </sitemap>\n`,
    ).join("") +
    `</sitemapindex>\n`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
