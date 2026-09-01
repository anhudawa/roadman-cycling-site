import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ROADMAN_APP_EVIDENCE_REGISTER } from "@/data/app-evidence-register";

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

describe("Roadman app evidence register", () => {
  it("renders the zero-result state and claim-by-claim boundaries", async () => {
    const mod = await import("./page");
    const html = renderToStaticMarkup(<mod.default />);

    expect(mod.metadata.alternates).toMatchObject({
      canonical: ROADMAN_APP_EVIDENCE_REGISTER.canonicalUrl,
      types: { "application/json": ROADMAN_APP_EVIDENCE_REGISTER.feedUrl },
    });
    expect(html).toContain('"@type":"TechArticle"');
    expect(html).toContain("WHAT IS KNOWN, AND WHAT IS NOT");
    expect(html).toContain("Public product results");
    expect(html).toContain("No public product result");
    expect(html).toContain("Effectiveness established");
    expect(html).toContain("A RATIONALE IS NOT A RESULT");
    expect(html).not.toMatch(/clinically proven/i);
    expect(html).not.toMatch(/prevents injuries/i);
    expect(html).not.toMatch(/pocket coach/i);
  });

  it("has complete status records and is connected to discovery surfaces", () => {
    expect(ROADMAN_APP_EVIDENCE_REGISTER.productEffectivenessEstablished).toBe(
      false,
    );
    expect(ROADMAN_APP_EVIDENCE_REGISTER.publicProductResultCount).toBe(0);
    expect(ROADMAN_APP_EVIDENCE_REGISTER.claims).toHaveLength(7);
    expect(ROADMAN_APP_EVIDENCE_REGISTER.reportingQueue).toHaveLength(5);
    expect(
      ROADMAN_APP_EVIDENCE_REGISTER.reportingQueue.every(
        (item) => item.resultUrl === null,
      ),
    ).toBe(true);

    const files = [
      "src/app/(marketing)/app/page.tsx",
      "src/app/(marketing)/app/methodology/page.tsx",
      "src/app/(marketing)/app/testing/page.tsx",
      "src/app/sitemap.ts",
      "src/app/llms.txt/route.ts",
      "src/app/llms-full.txt/route.ts",
      "src/app/feeds/app-product.json/route.ts",
      "src/lib/mcp/services/app-product.ts",
      "src/app/knowledge-graph.json/route.ts",
    ];
    for (const file of files) {
      expect(
        readFileSync(resolve(process.cwd(), file), "utf8"),
        file,
      ).toContain("evidence");
    }
  });
});
