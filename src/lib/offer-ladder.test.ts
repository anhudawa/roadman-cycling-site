import { describe, expect, it } from "vitest";
import { OFFER_TIERS, SURFACE_CTAS } from "./offer-ladder";

describe("Roadman offer ladder", () => {
  it("routes the core Not Done Yet offer into its dedicated application", () => {
    expect(OFFER_TIERS.notDoneYet.cta).toMatchObject({
      label: "Start the 2-minute application",
      href: "/apply",
    });
    expect(OFFER_TIERS.notDoneYet.route).toBe("/community/not-done-yet");
    expect(OFFER_TIERS.notDoneYet.pricing).toMatchObject({
      display: "$195/month",
      monthlyUsd: 195,
      trial: "7-day free trial",
    });
    expect(OFFER_TIERS.notDoneYet.description).not.toContain("1:1");
  });

  it("keeps premium 1:1 coaching in the Inner Circle funnel", () => {
    expect(OFFER_TIERS.oneToOne.route).toBe("/inner-circle");
    expect(OFFER_TIERS.oneToOne.cta.href).toBe("/inner-circle/apply");
    expect(OFFER_TIERS.oneToOne.pricing).toMatchObject({
      display: "$525/month",
      monthlyUsd: 525,
    });
  });

  it("uses the corrected products for commercial and premium surfaces", () => {
    expect(SURFACE_CTAS.commercial.primary.href).toBe("/apply");
    expect(SURFACE_CTAS.premium.primary.href).toBe("/inner-circle/apply");
    expect(SURFACE_CTAS.premium.secondary?.href).toBe("/apply");
  });
});
