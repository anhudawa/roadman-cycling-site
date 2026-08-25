import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("GSC indexing hygiene", () => {
  it("turns retired guest slugs into real route-level 404 responses", () => {
    const guestPage = source("src/app/(content)/guests/[slug]/page.tsx");

    expect(guestPage).toContain("export const dynamicParams = false;");
    expect(guestPage).toContain("if (!guest) notFound();");
    expect(guestPage).not.toContain('return { title: "Guest Not Found" }');
  });

  it("keeps the transactional Method checkout out of organic search", () => {
    const checkoutPage = source(
      "src/app/(method)/method/checkout/page.tsx",
    );

    expect(checkoutPage).toContain(
      "robots: { index: false, follow: true }",
    );
  });

  it("marks generated social images and machine feeds as non-indexable", () => {
    const nextConfig = source("next.config.ts");

    expect(nextConfig).toContain(
      'source: "/:path*/opengraph-image:hash(.*)"',
    );
    expect(nextConfig).toContain('source: "/feeds/:path*"');
    expect(nextConfig.match(/value: "noindex, nofollow"/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps structured images crawlable without emitting unhashed metadata URLs", () => {
    const robots = source("src/app/robots.ts");
    const blogPage = source("src/app/(content)/blog/[slug]/page.tsx");
    const structuredImagePages = [
      "src/app/(marketing)/training-plans/page.tsx",
      "src/app/(marketing)/event-prep/page.tsx",
      "src/app/(marketing)/apps-vs-coaching/page.tsx",
      "src/app/(marketing)/masters/page.tsx",
    ].map(source);

    expect(robots).toContain('"/api/og/blog-hero"');
    expect(blogPage).toContain(
      '`${SITE_ORIGIN}/api/og/blog-hero?slug=${encodeURIComponent(slug)}`',
    );
    expect(blogPage).not.toContain(
      '`${SITE_ORIGIN}/blog/${slug}/opengraph-image`',
    );

    for (const page of structuredImagePages) {
      expect(page).toContain("/api/og/blog-hero?title=");
      expect(page).not.toContain("/opengraph-image`");
      expect(page).not.toContain('/opengraph-image"');
    }
  });
});
