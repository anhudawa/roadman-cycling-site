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
});
