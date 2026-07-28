import { afterEach, describe, expect, it, vi } from "vitest";
import { trackAnalyticsEvent } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function stubBrowser(consent: { analytics: boolean; marketing: boolean } | null) {
  const localStorage = {
    getItem: vi.fn(() => (consent ? JSON.stringify(consent) : null)),
  };
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", localStorage);
  const fetch = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

describe("trackAnalyticsEvent", () => {
  it("does not send or create analytics traffic without consent", () => {
    const fetch = stubBrowser(null);

    trackAnalyticsEvent({ type: "pageview", page: "/" });

    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends after explicit analytics consent", () => {
    const fetch = stubBrowser({ analytics: true, marketing: false });

    trackAnalyticsEvent({
      type: "cta_click",
      page: "/",
      meta: { track_id: "home_hero_apply" },
    });

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith(
      "/api/events",
      expect.objectContaining({
        method: "POST",
        keepalive: true,
      }),
    );
  });
});
