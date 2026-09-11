import { describe, expect, it } from "vitest";
import { buildGoodLegsReferralUrl } from "./app-acquisition";
import { GOOD_LEGS_EDITORIAL_SOURCES, getGoodLegsEditorialSource } from "./good-legs-editorial";
import { getPostBySlug } from "./blog";
import { getEpisodeBySlug } from "./podcast";
import { isLeanRoute } from "@/components/layout/ConversionChrome";

describe("Good Legs editorial acquisition", () => {
  it("preserves the source from every selected, existing article or interview through the external referral", () => {
    for (const [slug, source] of Object.entries(GOOD_LEGS_EDITORIAL_SOURCES)) {
      expect(getPostBySlug(slug) || getEpisodeBySlug(slug), slug).toBeTruthy();
      const section = getPostBySlug(slug) ? "blog" : "podcast";
      expect(isLeanRoute(`/${section}/${slug}`)).toBe(true);
      const referral = new URL(buildGoodLegsReferralUrl(getGoodLegsEditorialSource(slug), "hero"));
      expect(referral.hostname).toBe("getgoodlegs.com");
      expect(referral.searchParams.get("utm_content")).toBe(`roadman-app-waitlist-${source}-hero`);
    }
  });

  it("leaves unrelated content outside this conversion flow", () => {
    expect(getGoodLegsEditorialSource("tour-de-france")).toBeUndefined();
    expect(getGoodLegsEditorialSource("toString")).toBeUndefined();
    expect(isLeanRoute("/app")).toBe(true);
    expect(isLeanRoute("/coaching")).toBe(false);
    expect(isLeanRoute("/blog/an-unrelated-article")).toBe(false);
  });
});
