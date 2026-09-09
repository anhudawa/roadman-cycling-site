import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ApplicationNextSteps } from "./ApplicationNextSteps";
import {
  APPLICATION_DECISION_HAPTIC_PATTERN,
  APPLICATION_REVIEW_HAPTIC_MS,
  APPLICATION_REVIEW_STEPS,
  APPLICATION_REVIEW_STEP_MS,
  triggerApplicationHaptic,
} from "./application-review";

vi.stubGlobal("React", React);

describe("ApplicationNextSteps", () => {
  it("starts with the staged application review instead of revealing the decision", () => {
    const html = renderToStaticMarkup(<ApplicationNextSteps />);

    expect(html).toContain("Application review");
    expect(html).toContain("Processing your application");
    expect(html).toContain("This should only take a few seconds.");
    expect(html).not.toContain("CONGRATULATIONS");
  });

  it("defines the complete review sequence and a deliberate total delay", () => {
    expect(APPLICATION_REVIEW_STEPS).toEqual([
      "Processing your application",
      "Assessing your suitability for the programme",
      "Checking available places",
      "Reviewing your start date",
    ]);
    expect(APPLICATION_REVIEW_STEPS.length * APPLICATION_REVIEW_STEP_MS).toBe(8_000);
  });

  it("uses subtle supported haptics for review stages and the decision", () => {
    const vibrate = vi.fn(() => true);
    vi.stubGlobal("window", {
      matchMedia: () => ({ matches: true }),
      navigator: { vibrate },
    });

    expect(triggerApplicationHaptic(APPLICATION_REVIEW_HAPTIC_MS)).toBe(true);
    expect(triggerApplicationHaptic(APPLICATION_DECISION_HAPTIC_PATTERN)).toBe(true);
    expect(vibrate).toHaveBeenNthCalledWith(1, 12);
    expect(vibrate).toHaveBeenNthCalledWith(2, [24, 48, 36]);
  });
});
