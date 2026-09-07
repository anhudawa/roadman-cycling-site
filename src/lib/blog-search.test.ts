import { describe, expect, it } from "vitest";
import { getAllPosts } from "./blog";
import { getBlogSearchCounts, toBlogSearchItem } from "./blog-search";
import { getBlogArchivePage } from "./seo/blog-archive-pagination";

describe("archive payload boundary", () => {
  it("keeps complete article metadata out of the archive and on-demand search index", () => {
    const posts = getAllPosts();
    const cards = posts.map(toBlogSearchItem);
    expect(cards.map(p => p.slug)).toEqual(posts.map(p => p.slug));
    for (const card of cards) {
      expect(Object.keys(card).sort()).toEqual(["slug", "title", "excerpt", "pillar", "publishDate", "readTime", "featuredImage", "keywords"].sort());
    }
    const counts = getBlogSearchCounts(cards);
    expect(Object.values(counts.pillars).reduce((a,b) => a+b, 0)).toBe(cards.length);
    for (const page of [1, 2]) {
      const payload = JSON.stringify({ archivePosts: getBlogArchivePage(cards, page), counts });
      expect(Buffer.byteLength(payload)).toBeLessThan(100_000);
    }
  });
});
