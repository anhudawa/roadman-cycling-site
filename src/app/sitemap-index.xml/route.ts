const BASE_URL = "https://roadmancycling.com";
const SITEMAP_IDS = [0, 1, 2, 3, 4, 5] as const;

export async function GET() {
  const now = new Date().toISOString();
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    SITEMAP_IDS.map(
      (id) =>
        `  <sitemap>\n    <loc>${BASE_URL}/sitemap/${id}.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>\n`,
    ).join("") +
    `</sitemapindex>\n`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
