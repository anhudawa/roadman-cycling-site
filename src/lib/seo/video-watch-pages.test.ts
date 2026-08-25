import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { GET as getVideoSitemap } from "@/app/video-sitemap.xml/route";
import { GET as getSitemapIndex } from "@/app/sitemap-index.xml/route";
import { getAllEpisodes } from "@/lib/podcast";
import {
  durationToIso,
  durationToSeconds,
  getVideoEpisodes,
} from "./video-watch";

describe("video watch pages", () => {
  it("keeps video primary and links the companion knowledge page", () => {
    const watchPage = readFileSync(
      resolve(process.cwd(), "src/app/(content)/watch/[slug]/page.tsx"),
      "utf8",
    );
    const podcastPage = readFileSync(
      resolve(process.cwd(), "src/app/(content)/podcast/[slug]/page.tsx"),
      "utf8",
    );
    const sitemap = readFileSync(
      resolve(process.cwd(), "src/app/sitemap.ts"),
      "utf8",
    );

    expect(watchPage).toContain("export const dynamicParams = false;");
    expect(watchPage).toContain('"@type": "VideoObject"');
    expect(watchPage).toContain("alternates: { canonical: watchUrl }");
    expect(watchPage).toContain("src={embedUrl}");
    expect(watchPage).not.toContain('loading="lazy"');
    expect(watchPage).toContain('href={`/podcast/${slug}`}');
    expect(podcastPage).toContain('href={`/watch/${episode.slug}`}');
    expect(sitemap).toContain("url: `${BASE_URL}/watch/${ep.slug}`");
  });

  it("builds one finite watch route for every YouTube episode", () => {
    const expected = getAllEpisodes().filter((episode) => episode.youtubeId);
    const videos = getVideoEpisodes();

    expect(videos).toHaveLength(expected.length);
    expect(videos.length).toBeGreaterThan(300);
    expect(videos.every((episode) => episode.youtubeId.length > 0)).toBe(true);
  });

  it("normalises episode durations for schema and video sitemaps", () => {
    expect(durationToIso("45:09")).toBe("PT45M9S");
    expect(durationToSeconds("45:09")).toBe(2709);
    expect(durationToIso("1:05:09")).toBe("PT1H5M9S");
    expect(durationToSeconds("1:05:09")).toBe(3909);
    expect(durationToIso("unknown")).toBeNull();
    expect(durationToSeconds("unknown")).toBeNull();
  });

  it("emits every required video sitemap field for every watch page", async () => {
    const videos = getVideoEpisodes();
    const response = await getVideoSitemap();
    const xml = await response.text();

    expect(response.headers.get("content-type")).toContain("application/xml");
    expect(xml).toContain(
      'xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"',
    );
    expect(xml.match(/<video:video>/g)).toHaveLength(videos.length);
    expect(xml.match(/<video:thumbnail_loc>/g)).toHaveLength(videos.length);
    expect(xml.match(/<video:title>/g)).toHaveLength(videos.length);
    expect(xml.match(/<video:description>/g)).toHaveLength(videos.length);
    expect(xml.match(/<video:player_loc>/g)).toHaveLength(videos.length);
    expect(xml.match(/<loc>https:\/\/roadmancycling.com\/watch\//g)).toHaveLength(
      videos.length,
    );
  });

  it("lists the video sitemap in the canonical sitemap index", async () => {
    const response = await getSitemapIndex();
    const xml = await response.text();

    expect(xml).toContain(
      "<loc>https://roadmancycling.com/video-sitemap.xml</loc>",
    );
  });
});
