import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const CAMP_SUPPORT_SLUGS = [
  "best-cycling-holidays-europe-2026",
  "cycling-training-camp-nutrition-guide",
  "cycling-training-camp-preparation-guide",
  "cycling-training-camps-what-to-expect-guide",
  "mallorca-cycling-training-camp-guide",
] as const;

describe("training-camp authority cluster enrichment", () => {
  it.each(CAMP_SUPPORT_SLUGS)(
    "keeps %s current, visual, and connected to podcast evidence",
    (slug) => {
      const file = resolve(process.cwd(), `content/blog/${slug}.mdx`);
      const { data } = matter(readFileSync(file, "utf8"));

      expect(new Date(data.updatedDate).toISOString().slice(0, 10)).toBe(
        "2026-08-25",
      );
      expect(data.featuredImage).toMatch(/^\/images\//);
      expect(
        existsSync(resolve(process.cwd(), `public${data.featuredImage}`)),
      ).toBe(true);
      expect(data.relatedEpisodes).toHaveLength(3);

      for (const episode of data.relatedEpisodes as string[]) {
        expect(
          existsSync(resolve(process.cwd(), `content/podcast/${episode}.mdx`)),
        ).toBe(true);
      }
    },
  );
});
