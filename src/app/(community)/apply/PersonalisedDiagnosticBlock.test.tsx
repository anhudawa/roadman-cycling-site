import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PersonalisedDiagnosticBlock } from "./PersonalisedDiagnosticBlock";
import type { StoredSubmission } from "@/lib/diagnostic/store";
import type { Answers, Breakdown } from "@/lib/diagnostic/types";

const BASE_ANSWERS: Answers = {
  age: "35-44",
  hoursPerWeek: "5-8",
  ftp: 250,
  goal: "Sub-10hr Etape du Tour",
  Q1: 2,
  Q2: 1,
  Q3: 0,
  Q4: 2,
  Q5: 1,
  Q6: 1,
  Q7: 2,
  Q8: 1,
  Q9: 0,
  Q10: 1,
  Q11: 2,
  Q12: 1,
  Q13: "Feeling stuck.",
};

const BASE_BREAKDOWN: Breakdown = {
  headline: "You're under-recovered.",
  diagnosis: "You're under-recovered.",
  whyThisIsHappening: "Too much intensity, not enough sleep.",
  whatItsCosting: "Stalled FTP, flat legs.",
  fix: [],
  whyAlone: "Hard to self-diagnose recovery on the inside.",
  nextMove: "Protect sleep.",
  secondaryNote: null,
};

function makeSubmission(
  overrides: Partial<StoredSubmission> = {}
): StoredSubmission {
  return {
    id: 1,
    slug: "abc123xyz0",
    email: "tom@example.com",
    primaryProfile: "underRecovered",
    secondaryProfile: null,
    severeMultiSystem: false,
    closeToBreakthrough: false,
    breakdown: BASE_BREAKDOWN,
    generationSource: "llm",
    createdAt: new Date("2026-05-01"),
    answers: BASE_ANSWERS,
    retakeNumber: 1,
    ...overrides,
  };
}

describe("PersonalisedDiagnosticBlock", () => {
  it("renders the 'based on your diagnostic' headline", () => {
    const html = renderToStaticMarkup(
      <PersonalisedDiagnosticBlock submission={makeSubmission()} />
    );
    expect(html.toLowerCase()).toContain(
      "based on your diagnostic"
    );
  });

  it("greets the rider by first name derived from their email", () => {
    const html = renderToStaticMarkup(
      <PersonalisedDiagnosticBlock
        submission={makeSubmission({ email: "anthony@roadmancycling.com" })}
      />
    );
    expect(html).toContain("Anthony");
  });

  it("shows the profile label from labelFor()", () => {
    const html = renderToStaticMarkup(
      <PersonalisedDiagnosticBlock
        submission={makeSubmission({ primaryProfile: "underRecovered" })}
      />
    );
    expect(html).toContain("Under-recovered");
  });

  it("shows the close-to-breakthrough label when that flag is set", () => {
    const html = renderToStaticMarkup(
      <PersonalisedDiagnosticBlock
        submission={makeSubmission({
          primaryProfile: "polarisation",
          closeToBreakthrough: true,
        })}
      />
    );
    expect(html).toContain("Closer to breakthrough");
  });

  it("renders the goal tile when answers.goal is present", () => {
    const html = renderToStaticMarkup(
      <PersonalisedDiagnosticBlock submission={makeSubmission()} />
    );
    expect(html).toContain("Sub-10hr Etape du Tour");
  });

  it("omits the goal tile when answers.goal is null", () => {
    const html = renderToStaticMarkup(
      <PersonalisedDiagnosticBlock
        submission={makeSubmission({
          answers: { ...BASE_ANSWERS, goal: null },
        })}
      />
    );
    expect(html).not.toMatch(/your goal/i);
  });

  it("omits the goal tile when answers.goal is an empty string", () => {
    const html = renderToStaticMarkup(
      <PersonalisedDiagnosticBlock
        submission={makeSubmission({
          answers: { ...BASE_ANSWERS, goal: "   " },
        })}
      />
    );
    expect(html).not.toMatch(/your goal/i);
  });

  it("shows the training-hours bracket", () => {
    const html = renderToStaticMarkup(
      <PersonalisedDiagnosticBlock
        submission={makeSubmission({
          answers: { ...BASE_ANSWERS, hoursPerWeek: "9-12" },
        })}
      />
    );
    expect(html).toContain("9-12");
  });

  it("links the primary CTA to the canonical Skool community URL", () => {
    const html = renderToStaticMarkup(
      <PersonalisedDiagnosticBlock submission={makeSubmission()} />
    );
    expect(html).toContain("https://www.skool.com/roadmancycling");
    // Must be the canonical community URL, never the /about variant.
    expect(html).not.toContain("skool.com/roadmancycling/about");
  });

  it("appends utm_source=diagnostic, utm_medium=apply, and utm_campaign=<profile>", () => {
    const html = renderToStaticMarkup(
      <PersonalisedDiagnosticBlock
        submission={makeSubmission({ primaryProfile: "fuelingDeficit" })}
      />
    );
    expect(html).toContain("utm_source=diagnostic");
    expect(html).toContain("utm_medium=apply");
    expect(html).toContain("utm_campaign=fuelingDeficit");
  });

  it("includes the free-trial price/cadence trust line", () => {
    const html = renderToStaticMarkup(
      <PersonalisedDiagnosticBlock submission={makeSubmission()} />
    );
    expect(html).toContain("$195");
    expect(html.toLowerCase()).toContain("7-day free trial");
  });

  it("does not leak the rider's email into the visible UI", () => {
    const html = renderToStaticMarkup(
      <PersonalisedDiagnosticBlock
        submission={makeSubmission({ email: "tom@example.com" })}
      />
    );
    expect(html).not.toContain("tom@example.com");
  });
});
