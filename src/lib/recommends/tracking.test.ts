import { describe, expect, it } from "vitest";
import {
  affiliateDevice,
  attachAffiliateClickId,
  hasAnalyticsConsent,
  isAffiliateBot,
  isSafeAffiliateDestination,
  readRequestCookie,
} from "./tracking";

describe("affiliate tracking safety", () => {
  it("rejects non-web redirect protocols", () => {
    expect(isSafeAffiliateDestination("javascript:alert(1)")).toBe(false);
    expect(isSafeAffiliateDestination("file:///tmp/x")).toBe(false);
    expect(isSafeAffiliateDestination("https://retailer.example/product")).toBe(true);
  });

  it("classifies preview traffic as bots", () => {
    expect(isAffiliateBot("Slackbot-LinkExpanding 1.0")).toBe(true);
    expect(isAffiliateBot("Mozilla/5.0 (Macintosh; Intel Mac OS X)")).toBe(false);
  });

  it("classifies common device classes", () => {
    expect(affiliateDevice("Mozilla/5.0 (iPhone; CPU iPhone OS) Mobile")).toBe("mobile");
    expect(affiliateDevice("Mozilla/5.0 (iPad; CPU OS)")).toBe("tablet");
    expect(affiliateDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X)")).toBe("desktop");
  });

  it("adds a supported Impact sub ID without changing other programmes", () => {
    const impact = new URL(
      attachAffiliateClickId(
        "https://maap.sjv.io/Ag027D?subId1=roadman-recommends",
        "click-123",
      ),
    );
    expect(impact.searchParams.get("subId1")).toBe("roadman-recommends");
    expect(impact.searchParams.get("subId3")).toBe("click-123");
    expect(
      attachAffiliateClickId(
        "https://www.gj4bt5vt.com/8LJN3/2CTPL/?creative_id=1",
        "click-123",
      ),
    ).not.toContain("click-123");
  });

  it("uses the existing consent cookie before assigning a session", () => {
    const request = new Request("https://roadmancycling.com/recommends", {
      headers: {
        cookie:
          "roadman_consent=essential%2Banalytics; roadman_recommends_session=session-1",
      },
    });
    expect(hasAnalyticsConsent(request)).toBe(true);
    expect(readRequestCookie(request, "roadman_recommends_session")).toBe(
      "session-1",
    );
    expect(
      hasAnalyticsConsent(
        new Request("https://roadmancycling.com/recommends", {
          headers: { cookie: "roadman_consent=essential" },
        }),
      ),
    ).toBe(false);
  });
});
