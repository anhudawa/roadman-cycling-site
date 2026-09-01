import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ROADMAN_APP_TESTING_STANDARD } from "@/data/app-testing-standard";

vi.mock("@/components/layout", () => ({
  Header: () => <header>HEADER</header>,
  Footer: () => <footer>FOOTER</footer>,
  Section: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
  Container: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/seo/EvidenceBlock", () => ({
  EvidenceBlock: ({
    reviewedSources,
  }: {
    reviewedSources: ReadonlyArray<{ name: string; href: string }>;
  }) => (
    <aside>
      {reviewedSources.map((source) => (
        <a key={source.href} href={source.href}>
          {source.name}
        </a>
      ))}
    </aside>
  ),
}));

describe("Roadman app public testing standard", () => {
  it("renders a staged claim ladder with explicit prelaunch limits", async () => {
    const mod = await import("./page");
    const html = renderToStaticMarkup(<mod.default />);

    expect(mod.metadata.alternates).toMatchObject({
      canonical: ROADMAN_APP_TESTING_STANDARD.canonicalUrl,
    });
    expect(html).toContain('"@type":"TechArticle"');
    expect(html).toContain(ROADMAN_APP_TESTING_STANDARD.version.toUpperCase());
    expect(html).toContain("FIVE PHASES. NO SKIPPED STEPS");
    expect(html).toContain("Prelaunch: no product-effectiveness claim");
    expect(html).toContain(
      "Usability, adherence and performance are separate results",
    );
    expect(html).toContain("raw counts and denominators");
    expect(html).toContain("An uncontrolled association was caused by the app");
    expect(html).not.toMatch(/clinically proven/i);
    expect(html).not.toMatch(/prevents injuries/i);
    expect(html).not.toMatch(/pocket coach/i);
  });

  it("publishes complete measures, reporting commitments and discovery links", () => {
    expect(ROADMAN_APP_TESTING_STANDARD.phases).toHaveLength(5);
    expect(ROADMAN_APP_TESTING_STANDARD.measures.length).toBeGreaterThanOrEqual(
      7,
    );
    expect(ROADMAN_APP_TESTING_STANDARD.reportingCommitments).toHaveLength(6);
    expect(ROADMAN_APP_TESTING_STANDARD.sources).toHaveLength(6);

    const files = [
      "src/app/(marketing)/app/page.tsx",
      "src/app/(marketing)/app/methodology/page.tsx",
      "src/app/sitemap.ts",
      "src/app/llms.txt/route.ts",
      "src/app/llms-full.txt/route.ts",
      "src/app/feeds/app-product.json/route.ts",
      "src/lib/mcp/services/app-product.ts",
    ];
    for (const file of files) {
      expect(
        readFileSync(resolve(process.cwd(), file), "utf8"),
        file,
      ).toContain("testing");
    }
  });
});
