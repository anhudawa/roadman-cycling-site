import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ApplicationNextSteps } from "./ApplicationNextSteps";
import { APPLICATION_REVIEW_STEPS, APPLICATION_REVIEW_STEP_MS } from "./application-review";

vi.stubGlobal("React", React);

describe("ApplicationNextSteps", () => {
  it("starts with the staged application review instead of revealing the decision", () => {
    const html = renderToStaticMarkup(<ApplicationNextSteps />);

    expect(html).toContain("Application review");
    expect(html).toContain("Processing your application");
    expect(html).toContain("This should only take a few seconds.");
    expect(html).not.toContain("CONGRATULATIONS");
  });

  it("defines the complete review sequence and a short total delay", () => {
    expect(APPLICATION_REVIEW_STEPS).toEqual([
      "Processing your application",
      "Assessing your suitability for the programme",
      "Checking available places",
      "Reviewing your start date",
    ]);
    expect(APPLICATION_REVIEW_STEPS.length * APPLICATION_REVIEW_STEP_MS).toBe(3_200);
  });
});
