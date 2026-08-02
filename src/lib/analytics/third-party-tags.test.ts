import { describe, expect, it } from "vitest";
import { getGoogleConsentUpdate } from "./third-party-tags";

describe("Google Consent Mode v2 updates", () => {
  it("maps analytics and marketing choices to all four consent signals", () => {
    expect(
      getGoogleConsentUpdate({ analytics: true, marketing: false }),
    ).toEqual({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    expect(
      getGoogleConsentUpdate({ analytics: false, marketing: true }),
    ).toEqual({
      analytics_storage: "denied",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  });
});
