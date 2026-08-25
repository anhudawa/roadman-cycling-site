import { getVideoEpisodes, durationToSeconds, getWatchUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/seo/video-watch";

function escapeXml(value: string): string {
  return value.replace(
    /[<>&'"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

export async function GET() {
  const entries = getVideoEpisodes()
    .map((episode) => {
      const duration = durationToSeconds(episode.duration);
      const lastModified = episode.updatedDate ?? episode.publishDate;

      return [
        "  <url>",
        `    <loc>${escapeXml(getWatchUrl(episode.slug))}</loc>`,
        `    <lastmod>${escapeXml(lastModified)}</lastmod>`,
        "    <video:video>",
        `      <video:thumbnail_loc>${escapeXml(getYouTubeThumbnailUrl(episode.youtubeId))}</video:thumbnail_loc>`,
        `      <video:title>${escapeXml(episode.title)}</video:title>`,
        `      <video:description>${escapeXml(episode.seoDescription)}</video:description>`,
        `      <video:player_loc>${escapeXml(getYouTubeEmbedUrl(episode.youtubeId))}</video:player_loc>`,
        ...(duration ? [`      <video:duration>${duration}</video:duration>`] : []),
        `      <video:publication_date>${escapeXml(episode.publishDate)}</video:publication_date>`,
        "    </video:video>",
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
    entries,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
