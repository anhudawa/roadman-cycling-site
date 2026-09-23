import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ApplicationNextSteps } from "./ApplicationNextSteps";
import { NDY_APPLICATION_OFFER } from "@/lib/ndy/application-offer";
import {
  APPLICATION_DECISION_HAPTIC_PATTERN,
  readApplicationDecision,
  triggerApplicationHaptic,
} from "./application-review";

vi.stubGlobal("React", React);

describe("ApplicationNextSteps", () => {
  it("renders no decision and no way to pay before the server has answered", () => {
    const html = renderToStaticMarkup(<ApplicationNextSteps />);

    expect(html).toContain("Application review");
    expect(html).toContain("Checking your application");
    expect(html).not.toContain("CONGRATULATIONS");
    expect(html).not.toContain("Application approved");
    expect(html).not.toContain(NDY_APPLICATION_OFFER.checkoutUrl);
    expect(html).not.toContain("skool.com");
  });

  it("has no client-side timer that could reveal a decision on its own", () => {
    const source = ApplicationNextSteps.toString();
    expect(source).not.toContain("setTimeout");
    expect(source).not.toContain("setInterval");
  });

  it("treats anything but an explicit approval as not approved", () => {
    expect(readApplicationDecision("approved")).toBe("approved");
    expect(readApplicationDecision("invalid")).toBe("invalid");
    expect(readApplicationDecision("pending")).toBe("pending");
    // Unrecognised payloads must never open the offer.
    for (const value of [undefined, null, "", "APPROVED", "ok", true, 1, {}, ["approved"]]) {
      expect(readApplicationDecision(value)).toBe("pending");
    }
  });

  it("uses a subtle supported haptic for the decision", () => {
    const vibrate = vi.fn(() => true);
    vi.stubGlobal("window", { matchMedia: () => ({ matches: true }), navigator: { vibrate } });

    expect(triggerApplicationHaptic(APPLICATION_DECISION_HAPTIC_PATTERN)).toBe(true);
    expect(vibrate).toHaveBeenCalledWith([24, 48, 36]);
  });
});
