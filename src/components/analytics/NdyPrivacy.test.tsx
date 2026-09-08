import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ pathname: "/apply/next" }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/lib/analytics/consent-client", () => ({ readClientConsent: () => ({ analytics: true, marketing: true }), hasMarketingConsent: () => true }));
import { GoogleConsentMode } from "./GoogleConsentMode";
import { ConsentRuntimeLoader } from "./ConsentRuntimeLoader";

describe("personal application link privacy", () => {
  it("does not load Google or optional analytics runtimes on the bearer-link page even with consent", () => {
    state.pathname = "/apply/next";
    expect(renderToStaticMarkup(<GoogleConsentMode />)).toBe("");
    expect(renderToStaticMarkup(<ConsentRuntimeLoader />)).toBe("");
  });
  it("retains the consent bootstrap on ordinary application pages", () => {
    state.pathname = "/apply";
    expect(renderToStaticMarkup(<GoogleConsentMode />)).toContain("roadman-google-consent-default");
  });
});
