import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildGoogleAdsConversionRows,
  googleAdsConversionsToCsv,
  type GoogleAdsApplicationRecord,
} from "./google-ads-offline-conversions";

const GOOGLE_ATTRIBUTION = {
  lastCapturedAt: "2026-07-31T12:00:00.000Z",
  lastUtmSource: "google",
  lastUtmMedium: "cpc",
  lastUtmCampaign: "coaching_search_ie_uk_us",
  lastGclid: "google-click-1",
};

function application(
  overrides: Partial<GoogleAdsApplicationRecord> = {},
): GoogleAdsApplicationRecord {
  return {
    id: 42,
    email: "Rider@Example.com ",
    attribution: GOOGLE_ATTRIBUTION,
    status: "awaiting_response",
    signedUpAt: null,
    createdAt: new Date("2026-07-31T12:34:56.789Z"),
    ...overrides,
  };
}

describe("Google Ads offline coaching conversions", () => {
  it("creates an application conversion only for the exact Google campaign", () => {
    const rows = buildGoogleAdsConversionRows([application()]);

    expect(rows).toEqual([
      expect.objectContaining({
        googleClickId: "google-click-1",
        conversionName: "NDY Application",
        conversionTime: "2026-07-31 12:34:56+00:00",
        orderId: "ndy-application-42",
      }),
    ]);
  });

  it("adds a signed-up conversion only while the Google application is Signed Up", () => {
    const signedUpAt = new Date("2026-08-02T09:15:00.000Z");
    const [applicationRow, signedUpRow] = buildGoogleAdsConversionRows([
      application({ status: "signed_up", signedUpAt }),
    ]);

    expect(applicationRow.conversionName).toBe("NDY Application");
    expect(signedUpRow).toMatchObject({
      conversionName: "NDY Signed Up",
      conversionTime: "2026-08-02 09:15:00+00:00",
      orderId: "ndy-signed-up-42",
    });

    expect(
      buildGoogleAdsConversionRows([
        application({ status: "contacted_twice", signedUpAt }),
      ]),
    ).toHaveLength(1);
  });

  it("can send a recent signup without replaying an expired application", () => {
    const rows = buildGoogleAdsConversionRows(
      [
        application({
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          status: "signed_up",
          signedUpAt: new Date("2026-08-02T10:00:00.000Z"),
        }),
      ],
      { since: new Date("2026-05-01T00:00:00.000Z") },
    );

    expect(rows.map((row) => row.conversionName)).toEqual(["NDY Signed Up"]);
  });

  it("never credits Meta, another campaign, or Google-first Meta-last cards", () => {
    const meta = {
      lastCapturedAt: "2026-08-01T12:00:00.000Z",
      lastUtmSource: "facebook",
      lastUtmMedium: "paid_social",
      lastUtmCampaign: "meta_coaching",
      lastFbclid: "meta-click-1",
    };
    const anotherGoogleCampaign = {
      ...GOOGLE_ATTRIBUTION,
      lastUtmCampaign: "another_campaign",
    };
    const googleFirstMetaLast = {
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "coaching_search_ie_uk_us",
      gclid: "first-google-click",
      ...meta,
    };

    const rows = buildGoogleAdsConversionRows([
      application({ id: 1, attribution: meta, status: "signed_up" }),
      application({ id: 2, attribution: anotherGoogleCampaign }),
      application({ id: 3, attribution: googleFirstMetaLast }),
      application({ id: 4, attribution: null, status: "signed_up" }),
    ]);

    expect(rows).toEqual([]);
  });

  it("supports GBRAID and hashes email only with granted ad-user-data consent", () => {
    const consented = application({
      attribution: {
        ...GOOGLE_ATTRIBUTION,
        lastGclid: "",
        lastGbraid: "ios-click-1",
        adUserDataConsent: "granted",
        adPersonalizationConsent: "denied",
      },
    });
    const unconsented = application({ id: 43 });
    const [consentedRow, unconsentedRow] = buildGoogleAdsConversionRows([
      consented,
      unconsented,
    ]);

    expect(consentedRow).toMatchObject({
      googleClickId: "",
      gbraid: "ios-click-1",
      email: createHash("sha256").update("rider@example.com").digest("hex"),
      adUserData: "Granted",
      adPersonalization: "Denied",
    });
    expect(unconsentedRow.email).toBe("");
    expect(unconsentedRow.adUserData).toBe("");
  });

  it("renders a stable Data Manager CSV with escaped fields", () => {
    const csv = googleAdsConversionsToCsv([
      {
        googleClickId: "click,with-comma",
        gbraid: "",
        wbraid: "",
        conversionName: "NDY Application",
        conversionTime: "2026-07-31 12:34:56+00:00",
        email: "hash",
        orderId: "ndy-application-42",
        adUserData: "Granted",
        adPersonalization: "Granted",
      },
    ]);

    expect(csv.split("\n")[0]).toBe(
      "Google Click ID,GBRAID,WBRAID,Conversion Name,Conversion Time,Email,Order ID,Ad User Data,Ad Personalization",
    );
    expect(csv).toContain('"click,with-comma"');
  });
});
