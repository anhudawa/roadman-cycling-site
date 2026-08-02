import { describe, expect, it } from "vitest";
import { GOOGLE_CONSENT_MODE_BOOTSTRAP } from "./GoogleConsentMode";

describe("Google Consent Mode v2 bootstrap", () => {
  it("defaults all four Google consent signals to denied before config", () => {
    const defaultIndex = GOOGLE_CONSENT_MODE_BOOTSTRAP.indexOf(
      "window.gtag('consent', 'default'",
    );
    const configIndex = GOOGLE_CONSENT_MODE_BOOTSTRAP.indexOf(
      "window.gtag('config'",
    );

    expect(defaultIndex).toBeGreaterThan(-1);
    expect(configIndex).toBeGreaterThan(defaultIndex);
    expect(GOOGLE_CONSENT_MODE_BOOTSTRAP).toContain("ad_storage: 'denied'");
    expect(GOOGLE_CONSENT_MODE_BOOTSTRAP).toContain(
      "analytics_storage: 'denied'",
    );
    expect(GOOGLE_CONSENT_MODE_BOOTSTRAP).toContain("ad_user_data: 'denied'");
    expect(GOOGLE_CONSENT_MODE_BOOTSTRAP).toContain(
      "ad_personalization: 'denied'",
    );
  });
});
