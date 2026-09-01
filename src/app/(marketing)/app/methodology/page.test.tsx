import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ROADMAN_APP_DECISION_POLICY } from "@/data/app-methodology";

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
    reviewedSources: Array<{ name: string; href: string }>;
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

describe("Roadman app public decision methodology", () => {
  it("renders the versioned decision contract and its claim boundaries", async () => {
    const mod = await import("./page");
    const html = renderToStaticMarkup(<mod.default />);

    expect(mod.metadata.alternates).toMatchObject({
      canonical: ROADMAN_APP_DECISION_POLICY.canonicalUrl,
    });
    expect(html).toContain('"@type":"TechArticle"');
    expect(html).toContain(ROADMAN_APP_DECISION_POLICY.version.toUpperCase());
    expect(html).toContain("FOUR STAGES. ONE VISIBLE REASON");
    expect(html).toContain("WHAT THE SYSTEM IS NOT ALLOWED TO DO");
    expect(html).toContain("RESEARCH INFORMS THE RULES");
    expect(html).toContain("cannot raise the planned training ceiling");
    expect(html).toContain("overtraining syndrome, illness or injury");
    expect(html).not.toMatch(/validated readiness algorithm/i);
    expect(html).not.toMatch(/pocket coach/i);
  });

  it("uses source-backed shared policy facts and is discoverable", () => {
    expect(ROADMAN_APP_DECISION_POLICY.stages).toHaveLength(4);
    expect(ROADMAN_APP_DECISION_POLICY.invariantRules.length).toBeGreaterThanOrEqual(6);
    expect(ROADMAN_APP_DECISION_POLICY.inputBoundaries).toHaveLength(5);
    expect(ROADMAN_APP_DECISION_POLICY.sources).toHaveLength(6);
    expect(
      ROADMAN_APP_DECISION_POLICY.sources.every((source) =>
        source.href.startsWith("https://pubmed.ncbi.nlm.nih.gov/"),
      ),
    ).toBe(true);

    const files = [
      "src/app/(marketing)/app/page.tsx",
      "src/app/sitemap.ts",
      "src/app/llms.txt/route.ts",
      "src/app/llms-full.txt/route.ts",
      "src/app/feeds/app-product.json/route.ts",
      "src/lib/mcp/services/app-product.ts",
    ];
    for (const file of files) {
      expect(readFileSync(resolve(process.cwd(), file), "utf8"), file).toContain(
        "methodology",
      );
    }
  });
});
