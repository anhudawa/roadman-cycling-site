import { describe, expect, it } from "vitest";
import {
  buildMarketingPerformance,
  type MarketingApplication,
  type MarketingSpendRecord,
} from "./marketing-attribution";
import { classifyMarketingAttribution } from "@/lib/marketing/attribution";

describe("marketing attribution", () => {
  it("keeps Google as first touch and Meta as last touch", () => {
    const attribution = {
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "search",
      gclid: "google-click",
      capturedAt: "2026-07-01T10:00:00.000Z",
      lastUtmSource: "facebook",
      lastUtmMedium: "paid_social",
      lastUtmCampaign: "retargeting",
      lastFbclid: "meta-click",
      lastCapturedAt: "2026-07-02T10:00:00.000Z",
    };

    expect(classifyMarketingAttribution(attribution, "first")).toBe(
      "google_ads",
    );
    expect(classifyMarketingAttribution(attribution, "last")).toBe("meta_ads");
  });

  it("uses historical flat attribution as the last-touch fallback", () => {
    expect(
      classifyMarketingAttribution(
        {
          utmSource: "podcast",
          utmCampaign: "roadman_show",
        },
        "last",
      ),
    ).toBe("podcast");
  });

  it("calculates application CPA, signed-up client cost and the best paid channel", () => {
    const applications: MarketingApplication[] = [
      {
        status: "accepted",
        attribution: {
          utmSource: "google",
          utmMedium: "cpc",
          utmCampaign: "search",
          gclid: "g-1",
        },
      },
      {
        status: "rejected",
        attribution: {
          utmSource: "google",
          utmMedium: "cpc",
          utmCampaign: "search",
          gclid: "g-2",
        },
      },
      {
        status: "signed_up",
        attribution: {
          utmSource: "facebook",
          utmMedium: "paid_social",
          utmCampaign: "retargeting",
          fbclid: "f-1",
        },
      },
      { status: "contacted", attribution: null },
    ];
    const spend: MarketingSpendRecord[] = [
      {
        channel: "google_ads",
        campaign: "search",
        amountCents: 10_000,
        currency: "EUR",
      },
      {
        channel: "meta_ads",
        campaign: "retargeting",
        amountCents: 4_000,
        currency: "EUR",
      },
    ];

    const result = buildMarketingPerformance(applications, spend, "last");
    const google = result.channels.find(
      (row) => row.channel === "google_ads",
    );
    const meta = result.channels.find((row) => row.channel === "meta_ads");

    expect(result.totalApplications).toBe(4);
    expect(result.signedUpApplications).toBe(1);
    expect(result.trackedShare).toBe(0.75);
    expect(google).toMatchObject({
      applications: 2,
      signedUp: 0,
      spendCents: 10_000,
      costPerApplicationCents: 5_000,
      costPerSignedUpCents: null,
    });
    expect(meta).toMatchObject({
      applications: 1,
      signedUp: 1,
      spendCents: 4_000,
      costPerApplicationCents: 4_000,
      costPerSignedUpCents: 4_000,
    });
    expect(result.bestPaidChannel?.channel).toBe("meta_ads");
  });

  it("does not invent cost metrics when spend has not been recorded", () => {
    const result = buildMarketingPerformance(
      [
        {
          status: "signed_up",
          attribution: { utmSource: "podcast" },
        },
      ],
      [],
      "last",
    );

    expect(result.channels[0]).toMatchObject({
      channel: "podcast",
      spendCents: 0,
      costPerApplicationCents: null,
      costPerSignedUpCents: null,
    });
    expect(result.bestPaidChannel).toBeNull();
  });
});
