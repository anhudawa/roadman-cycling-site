import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import {
  getSearchOwnerFallbackForTopicHub,
  GSC_MEASURED_SEARCH_OWNERS,
  resolveSearchOwner,
  SEARCH_OWNER_BY_ID,
} from "./search-ownership";
import { buildSearchOwnerTrustProperties } from "./search-owner-schema";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("strength and conditioning canonical search owner", () => {
  it("assigns the educational lane without stealing app-product intent", () => {
    const owner = SEARCH_OWNER_BY_ID.get("cycling-strength-training");
    const appOwner = SEARCH_OWNER_BY_ID.get("cycling-strength-recovery-app");

    expect(owner).toMatchObject({
      path: "/blog/cycling-strength-training-guide",
      primaryQuery: "strength training for cyclists",
      primaryHubSlugs: ["cycling-strength-conditioning"],
    });
    expect(owner?.matchPhrases).toContain(
      "strength and conditioning for cyclists",
    );
    expect(resolveSearchOwner(["cycling strength and conditioning"])?.id).toBe(
      "cycling-strength-training",
    );
    expect(resolveSearchOwner(["strength training app for cyclists"])?.id).toBe(
      "cycling-strength-recovery-app",
    );
    expect(
      appOwner?.supportingDestinations.some(
        (destination) =>
          destination.path === "/blog/cycling-strength-training-guide",
      ),
    ).toBe(false);
  });

  it("connects research and narrow supporting jobs to one owner", () => {
    const owner = SEARCH_OWNER_BY_ID.get("cycling-strength-training")!;
    const paths = owner.supportingDestinations.map(
      (destination) => destination.path,
    );

    expect(paths).toEqual([
      "/topics/cycling-strength-conditioning",
      "/blog/cycling-strength-training-12-week-beginner-plan",
      "/blog/cycling-gym-exercises-best",
      "/blog/strength-training-cyclists-over-50",
      "/blog/strength-training-cyclists-minimum-effective-dose",
      "/blog/cycling-weight-training-in-season-guide",
      "/sc/exercises",
    ]);
    expect(
      getSearchOwnerFallbackForTopicHub("cycling-strength-conditioning"),
    ).toBe("cycling-strength-training");
    expect(
      buildSearchOwnerTrustProperties("cycling-strength-training").relatedLink,
    ).toHaveLength(7);
  });

  it("keeps the fresh owner copy and attributed app bridge unchanged", () => {
    const source = read("content/blog/cycling-strength-training-guide.mdx");
    const article = matter(source);

    expect(article.data.updatedDate).toBe("2026-08-26");
    expect(article.data.lastReviewed).toBe("2026-08-26");
    expect(article.data.seoTitle).toBe(
      "Strength Training for Cyclists: Evidence & Plan (2026)",
    );
    expect(source).toContain("/app?source=strength-guide");

    const template = read("src/app/(content)/blog/[slug]/page.tsx");
    expect(template).toContain("directSearchOwner");
    expect(template).toContain("buildSearchOwnerTrustProperties(");
    expect(template).toContain("getSearchOwnerWebPageId(directSearchOwner)");
  });

  it("preserves the original five-owner measurement cohort", () => {
    expect(GSC_MEASURED_SEARCH_OWNERS).toHaveLength(5);
    expect(
      GSC_MEASURED_SEARCH_OWNERS.some(
        (owner) => owner.id === "cycling-strength-training",
      ),
    ).toBe(false);
  });

  it("freezes the zero-click S&C slice and redirect split", () => {
    const baseline = JSON.parse(
      read("docs/seo/data/gsc-strength-conditioning-head-lane-2026-08-29.json"),
    );
    const sevenDay = baseline.windows.find(
      (window: { period: { days: number } }) => window.period.days === 7,
    );
    const twentyEightDay = baseline.windows.find(
      (window: { period: { days: number } }) => window.period.days === 28,
    );

    expect(sevenDay.aggregate).toMatchObject({
      clicks: 0,
      impressions: 17,
      averagePosition: 8.2,
    });
    expect(twentyEightDay.aggregate).toMatchObject({
      clicks: 0,
      impressions: 91,
      averagePosition: 7.6,
    });
    expect(twentyEightDay.pageRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "/blog/cycling-strength-training-guide",
          impressions: 78,
        }),
        expect.objectContaining({
          path: "/blog/strength-training-cyclists-complete-guide",
          impressions: 44,
          status: "permanent-redirect",
        }),
      ]),
    );
  });
});
