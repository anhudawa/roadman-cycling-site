import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("cycling strength programme commercial owner", () => {
  const owner = read("src/app/(marketing)/strength-training/page.tsx");
  const redirects = read("next.config.ts");
  const courseLayout = read("src/app/(content)/sc/layout.tsx");

  it("keeps one indexable commercial owner and retires the /sc duplicate", () => {
    expect(redirects).toContain('source: "/sc"');
    expect(redirects).toContain('destination: "/strength-training"');
    expect(redirects).toContain("permanent: true");
    expect(courseLayout).toContain("index: false");
    expect(courseLayout).toContain("follow: true");
  });

  it("matches the working product price and checkout path", () => {
    expect(owner).toContain("const PRODUCT_PRICE = 65");
    expect(owner).toContain("<CheckoutButton>Get the plan</CheckoutButton>");
    expect(owner).toContain('absolute: "Cycling Strength Training Plan: 12-Week S&C Programme"');
    expect(owner).toContain("one-time payment with lifetime access");
    expect(owner).not.toContain("$95");
  });

  it("uses the reviewed cyclist evidence without guaranteeing results", () => {
    for (const marker of [
      "17 controlled",
      "262 riders",
      "1–3",
      "5–25",
      "certainty was low",
      "PMID 40632222",
      "PMID 35728627",
      "PMID 23256921",
    ]) {
      expect(owner).toContain(marker);
    }

    for (const unsafeClaim of [
      "8–15% power increase",
      "17% longer time to exhaustion",
      "pain-free on the bike",
      "injury stopped before it starts",
      "guaranteed watt",
      "without adding bulk",
      "the single most effective intervention",
    ]) {
      expect(owner).not.toContain(unsafeClaim);
    }
  });

  it("separates the fixed course, app and coaching jobs", () => {
    expect(owner).toContain('href="/app?source=strength-plan"');
    expect(owner).toContain('href: "/coaching"');
    expect(owner).toContain("THE UPCOMING APP IS A DIFFERENT PRODUCT");
    expect(owner).toContain("Its final name, date and");
    expect(owner).toContain("price are not announced");
    expect(owner).toContain('data-track="strength_plan_app_early_access"');
  });

  it("publishes product, webpage, breadcrumb and FAQ structured data", () => {
    expect(owner).toContain('"@type": "Product"');
    expect(owner).toContain('"@type": "WebPage"');
    expect(owner).toContain('"@type": "BreadcrumbList"');
    expect(owner).toContain("<FAQSchema");
    expect(owner).toContain('dateModified: "2026-09-01"');
  });

  it("records a fixed Search Console baseline and AI benchmark owner", () => {
    const baseline = read(
      "docs/seo/gsc-cycling-strength-programme-owner-2026-09-01.md",
    );
    const benchmark = JSON.parse(
      read("scripts/ai-benchmark-prompts.json"),
    ) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };

    expect(baseline).toContain("2,080 web impressions");
    expect(baseline).toContain("1,220 web impressions");
    expect(baseline).toContain("83");
    expect(benchmark.metadata.prompt_count).toBe(381);
    expect(benchmark.prompts.find((prompt) => prompt.id === 381)).toMatchObject({
      target_page: "/strength-training",
    });
  });
});
