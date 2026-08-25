import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { GET as getFullLlms } from "@/app/llms-full.txt/route";
import { GET as getShortLlms } from "@/app/llms.txt/route";
import { OFFER_TIERS } from "@/lib/offer-ladder";

const COACHING_TRUST_SURFACES = [
  "scripts/seed-mcp-products.ts",
  "src/app/(content)/topics/[slug]/page.tsx",
  "src/app/(marketing)/author/anthony-walsh/page.tsx",
  "src/app/(marketing)/coaching/[location]/page.tsx",
  "src/app/(marketing)/coaching/page.tsx",
  "src/app/(marketing)/coaching/triathletes/page.tsx",
  "src/app/(marketing)/entity/not-done-yet/page.tsx",
  "src/app/(marketing)/find-your-fit/page.tsx",
  "src/app/(marketing)/find-your-fit/_components/FitFinder.tsx",
  "src/app/(marketing)/proof/page.tsx",
  "src/app/llms-full.txt/route.ts",
  "src/app/llms.txt/route.ts",
  "src/components/segments/SegmentPage.tsx",
  "src/lib/brand-facts.ts",
  "src/lib/mcp/resources.ts",
  "src/lib/mcp/server.ts",
  "src/lib/mcp/services/products.ts",
  "src/lib/mcp/services/qualification.ts",
] as const;

const CORRECTED_ARTICLE_PATHS = [
  "content/blog/70-3-bike-training-plan-12-weeks.mdx",
  "content/blog/aero-position-training-for-triathletes.mdx",
  "content/blog/alex-larson-body-composition-cyclists.mdx",
  "content/blog/best-cycling-coach-guide.mdx",
  "content/blog/best-cycling-coach-ireland.mdx",
  "content/blog/best-cycling-coach-masters-riders.mdx",
  "content/blog/best-cycling-coach-uk.mdx",
  "content/blog/best-cycling-coach-usa.mdx",
  "content/blog/best-roadman-episodes-masters.mdx",
  "content/blog/best-roadman-episodes-time-crunched.mdx",
  "content/blog/biggest-training-mistakes-from-coaches.mdx",
  "content/blog/cycling-after-40-recovery-report-2026.mdx",
  "content/blog/cycling-coaching-free-trial.mdx",
  "content/blog/cycling-coaching-results-before-and-after.mdx",
  "content/blog/cycling-coaching-testimonials.mdx",
  "content/blog/cycling-training-plan-masters-over-40.mdx",
  "content/blog/cycling-vo2max-intervals.mdx",
  "content/blog/how-much-does-online-cycling-coach-cost-2026.mdx",
  "content/blog/masters-cycling-training-report-2026.mdx",
  "content/blog/menopause-cycling-performance.mdx",
  "content/blog/not-done-yet-coaching-review.mdx",
  "content/blog/trainerroad-vs-online-cycling-coach.mdx",
  "content/blog/what-25-top-coaches-agree-on-about-ftp.mdx",
  "content/blog/what-experts-say-about-strength-training-cyclists.mdx",
  "content/blog/what-experts-say-about-zone-2-training.mdx",
  "content/blog/what-pros-say-about-amateur-training.mdx",
  "content/blog/what-stephen-seiler-says-about-polarised-training.mdx",
] as const;

const INACCURATE_NOT_DONE_YET_CLAIMS = [
  "premium online 1:1 coaching",
  "1:1 plans across 5 pillars",
  "1:1 personalised plans across",
  "1:1 personalised online coaching across five pillars",
  "1:1 personalised coaching across training",
  "1:1 personalised coaching across five pillars",
  "weekly 1:1 coaching",
  "1:1 bike-leg coaching",
  "not done yet is a 1:1",
  "not done yet is 1:1",
  "not done yet includes 1:1",
  "it costs $195 a month, it's 1:1",
  "the programme is called not done yet, it is 1:1",
  "at $195/month — 1:1",
  "not done yet coaching community at $195/month — 1:1",
  "not done yet coaching community at $195/month. one-to-one",
  "with 1:1 coaching rather than generic",
  "it is 1:1 across five pillars",
  "1:1 personalised programming, the structure",
  "the coaching is 1:1",
  "not done yet — premium (1:1 coaching)",
] as const;

describe("coaching offer trust", () => {
  it("keeps the two paid coaching tiers distinct", () => {
    expect(OFFER_TIERS.notDoneYet).toMatchObject({
      productKind: "coaching",
      pricing: { monthlyUsd: 195 },
    });
    expect(OFFER_TIERS.notDoneYet.description).toContain(
      "weekly live group coaching",
    );
    expect(OFFER_TIERS.notDoneYet.description).not.toContain("1:1");

    expect(OFFER_TIERS.oneToOne).toMatchObject({
      productKind: "1:1 coaching",
      route: "/inner-circle",
      pricing: { monthlyUsd: 525 },
    });
  });

  it("removes the old $195-as-1:1 claim from human and schema surfaces", () => {
    const combined = COACHING_TRUST_SURFACES.map((path) =>
      readFileSync(resolve(process.cwd(), path), "utf8"),
    ).join("\n");

    for (const claim of INACCURATE_NOT_DONE_YET_CLAIMS) {
      expect(combined.toLowerCase()).not.toContain(claim.toLowerCase());
    }

    expect(combined).toContain("OFFER_TIERS.notDoneYet.description");
    expect(combined).not.toContain("oneOnOne");
    expect(combined).not.toContain("Not Done Yet coaching tiers");
  });

  it("corrects and freshness-stamps the indexed articles that carried the old claim", () => {
    const articles = CORRECTED_ARTICLE_PATHS.map((path) => ({
      path,
      source: readFileSync(resolve(process.cwd(), path), "utf8"),
    }));
    const combined = articles.map(({ source }) => source).join("\n");

    for (const { path, source } of articles) {
      expect(source, path).toContain("updatedDate: '2026-08-25'");
    }

    for (const claim of INACCURATE_NOT_DONE_YET_CLAIMS) {
      expect(combined.toLowerCase()).not.toContain(claim.toLowerCase());
    }

    expect(combined).toContain("Not Done Yet group coaching");
    expect(combined).toContain("Roadman Inner Circle");
    expect(combined).toContain("$525/month");
  });

  it("teaches AI crawlers which programme is group coaching and which is 1:1", async () => {
    const shortText = await (await getShortLlms()).text();
    const fullText = await (await getFullLlms()).text();

    for (const text of [shortText, fullText]) {
      expect(text).toContain("Not Done Yet");
      expect(text).toContain("weekly live group coaching");
      expect(text).toContain("$195/month");
      expect(text).toContain("Roadman Inner Circle");
      expect(text.toLowerCase()).toContain("1:1 coaching");
      expect(text).toContain("$525/month");

      for (const claim of INACCURATE_NOT_DONE_YET_CLAIMS) {
        expect(text.toLowerCase()).not.toContain(claim.toLowerCase());
      }
    }
  });
});
