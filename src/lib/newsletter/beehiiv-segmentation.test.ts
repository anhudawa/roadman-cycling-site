import { describe, expect, it } from "vitest";
import {
  APP_WAITLIST_TAG,
  buildNewsletterBeehiivSegmentation,
} from "./beehiiv-segmentation";

describe("Beehiiv newsletter segmentation", () => {
  it.each([
    "roadman-app-waitlist-hero",
    "roadman-app-waitlist-bottom",
  ])("puts %s into one app waiting list", (source) => {
    const result = buildNewsletterBeehiivSegmentation({ source });

    expect(result.tags).toEqual(["saturday-spin", APP_WAITLIST_TAG]);
    expect(result.campaign).toBe(APP_WAITLIST_TAG);
  });

  it("keeps ordinary newsletter captures out of the app waiting list", () => {
    const result = buildNewsletterBeehiivSegmentation({ source: "footer" });

    expect(result.tags).toEqual(["saturday-spin", "footer"]);
    expect(result.campaign).toBe("saturday-spin");
  });

  it("preserves asset tags and campaigns without duplicates", () => {
    const result = buildNewsletterBeehiivSegmentation({
      source: "masters-report-hero",
      assetTags: ["masters-report", "masters-report-hero"],
      assetCampaign: "masters-report",
    });

    expect(result.tags).toEqual([
      "saturday-spin",
      "masters-report",
      "masters-report-hero",
    ]);
    expect(result.campaign).toBe("masters-report");
  });
});
