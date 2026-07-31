import { afterEach, describe, expect, it, vi } from "vitest";
import {
  captureApplicationAttribution,
  readApplicationAttribution,
  restoreAttributionToApplicationUrl,
} from "./application-attribution";

function createSessionStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  };
}

function stubLocation(
  href: string,
  sessionStorage: ReturnType<typeof createSessionStorage>,
) {
  const parsed = new URL(href);
  const location = {
    href,
    origin: parsed.origin,
    pathname: parsed.pathname,
    search: parsed.search,
  };
  const replaceState = vi.fn(
    (_state: unknown, _title: string, nextUrl: URL) => {
      location.href = nextUrl.toString();
      location.pathname = nextUrl.pathname;
      location.search = nextUrl.search;
    },
  );
  vi.stubGlobal("window", {
    location,
    history: { state: null, replaceState },
    sessionStorage,
  });
  vi.stubGlobal("sessionStorage", sessionStorage);
  return { location, replaceState };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("application attribution", () => {
  it("captures bounded first-touch campaign and click identifiers", () => {
    const sessionStorage = createSessionStorage();
    stubLocation(
      "https://roadmancycling.com/?utm_source=google&utm_medium=cpc&utm_campaign=summer&gclid=click-1&gbraid=braid-1&wbraid=braid-2",
      sessionStorage,
    );
    vi.stubGlobal("document", {
      referrer: "https://www.google.com/search?q=private-query",
    });

    expect(captureApplicationAttribution()).toMatchObject({
      landingPath: "/",
      referrer: "https://www.google.com/search",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "summer",
      gclid: "click-1",
      gbraid: "braid-1",
      wbraid: "braid-2",
      lastLandingPath: "/",
      lastUtmSource: "google",
      lastUtmCampaign: "summer",
      lastGclid: "click-1",
    });
  });

  it("preserves the original touch across later navigation", () => {
    const sessionStorage = createSessionStorage();
    const { location } = stubLocation(
      "https://roadmancycling.com/?utm_source=podcast",
      sessionStorage,
    );
    vi.stubGlobal("document", { referrer: "" });

    captureApplicationAttribution();
    location.href =
      "https://roadmancycling.com/apply?utm_source=retargeting";
    location.search = "?utm_source=retargeting";

    expect(readApplicationAttribution()).toMatchObject({
      landingPath: "/",
      utmSource: "podcast",
      lastLandingPath: "/",
      lastUtmSource: "podcast",
    });
  });

  it("keeps first touch while replacing last touch with a later campaign", () => {
    const sessionStorage = createSessionStorage();
    const { location } = stubLocation(
      "https://roadmancycling.com/?utm_source=google&utm_medium=cpc&utm_campaign=search&gclid=click-1",
      sessionStorage,
    );
    vi.stubGlobal("document", { referrer: "" });
    captureApplicationAttribution();

    location.href =
      "https://roadmancycling.com/coaching?utm_source=facebook&utm_medium=paid_social&utm_campaign=retargeting&fbclid=meta-1";
    location.pathname = "/coaching";
    location.search =
      "?utm_source=facebook&utm_medium=paid_social&utm_campaign=retargeting&fbclid=meta-1";

    expect(captureApplicationAttribution()).toMatchObject({
      utmSource: "google",
      utmCampaign: "search",
      gclid: "click-1",
      lastLandingPath: "/coaching",
      lastUtmSource: "facebook",
      lastUtmMedium: "paid_social",
      lastUtmCampaign: "retargeting",
      lastFbclid: "meta-1",
    });
    expect(readApplicationAttribution()).not.toHaveProperty("lastGclid");
  });

  it("restores last-touch click IDs onto /apply before tags load", () => {
    const sessionStorage = createSessionStorage();
    const { location, replaceState } = stubLocation(
      "https://roadmancycling.com/?utm_source=google&gclid=click-1",
      sessionStorage,
    );
    vi.stubGlobal("document", { referrer: "" });
    captureApplicationAttribution();

    location.href =
      "https://roadmancycling.com/coaching?utm_source=facebook&utm_medium=paid_social&fbclid=meta-1";
    location.pathname = "/coaching";
    location.search =
      "?utm_source=facebook&utm_medium=paid_social&fbclid=meta-1";
    captureApplicationAttribution();

    location.href = "https://roadmancycling.com/apply";
    location.pathname = "/apply";
    location.search = "";

    expect(restoreAttributionToApplicationUrl()).toBe(true);
    expect(replaceState).toHaveBeenCalledOnce();
    expect(location.search).toContain("utm_source=facebook");
    expect(location.search).toContain("fbclid=meta-1");
    expect(location.search).not.toContain("gclid=click-1");
  });
});
