import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateMetadata } from "@/app/(content)/blog/page";
import { BlogPagination } from "@/components/features/blog/BlogPagination";
import {
  BLOG_POSTS_PER_PAGE,
  getBlogArchiveHref,
  getBlogArchivePage,
  getBlogArchivePageCount,
} from "./blog-archive-pagination";

describe("crawlable blog archive", () => {
  it("partitions the complete corpus without gaps or overlap", () => {
    const posts = Array.from({ length: 123 }, (_, index) => `post-${index}`);
    const pages = Array.from(
      { length: getBlogArchivePageCount(posts.length) },
      (_, index) => getBlogArchivePage(posts, index + 1),
    );

    expect(BLOG_POSTS_PER_PAGE).toBe(50);
    expect(pages.map((page) => page.length)).toEqual([50, 50, 23]);
    expect(pages.flat()).toEqual(posts);
    expect(new Set(pages.flat()).size).toBe(posts.length);
  });

  it("uses self-canonical URLs for each archive page", async () => {
    const first = await generateMetadata({ searchParams: Promise.resolve({}) });
    const second = await generateMetadata({
      searchParams: Promise.resolve({ page: "2" }),
    });

    expect(getBlogArchiveHref(1)).toBe("/blog");
    expect(getBlogArchiveHref(2)).toBe("/blog?page=2");
    expect(first.alternates?.canonical).toBe("https://roadmancycling.com/blog");
    expect(second.alternates?.canonical).toBe(
      "https://roadmancycling.com/blog?page=2",
    );
    expect(String(second.title)).toContain("Page 2");
  });

  it("renders ordinary previous, next and numbered archive links", () => {
    const html = renderToStaticMarkup(
      createElement(BlogPagination, { currentPage: 2, totalPages: 21 }),
    );

    expect(html).toContain('href="/blog"');
    expect(html).toContain('href="/blog?page=3"');
    expect(html).toContain('href="/blog?page=21"');
    expect(html).toContain('rel="prev"');
    expect(html).toContain('rel="next"');
    expect(html).toContain('aria-current="page"');
  });

  it("keeps pagination server-rendered and removes redirected body links", () => {
    const pageSource = readFileSync(
      resolve(process.cwd(), "src/app/(content)/blog/page.tsx"),
      "utf8",
    );
    const searchSource = readFileSync(
      resolve(process.cwd(), "src/components/features/blog/BlogSearch.tsx"),
      "utf8",
    );
    const content = [
      "cycling-commuting-as-training-guide.mdx",
      "cycling-with-chronic-conditions-guide.mdx",
    ]
      .map((file) =>
        readFileSync(resolve(process.cwd(), `content/blog/${file}`), "utf8"),
      )
      .join("\n");

    expect(pageSource).toContain("getBlogArchivePage(posts, page)");
    expect(searchSource).toContain("<BlogPagination");
    expect(searchSource).toContain("const visible = isBrowsingAll");
    expect(content).not.toContain(
      "/blog/cycling-carbs-per-hour-fuel-like-a-pro",
    );
    expect(content).toContain("/blog/carbohydrate-per-hour-cyclists");
  });
});
