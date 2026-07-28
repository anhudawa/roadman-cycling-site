import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { StoredSubmission } from "@/lib/diagnostic/store";
import type { Answers, Breakdown } from "@/lib/diagnostic/types";

// The CohortApplicationForm is a client component with state; mock it
// down to a recognisable marker so we can assert on its presence.
vi.mock("./CohortApplicationForm", () => ({
  CohortApplicationForm: () => (
    <div data-testid="cohort-form-marker">COHORT_FORM</div>
  ),
}));

// Header/Footer pull in client components (SearchTrigger, etc.) that
// call useRouter / usePathname under the hood. In server-only vitest
// runs there's no app-router context, so we stub the navigation hooks.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    prefetch: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
  }),
  usePathname: () => "/apply",
  useSearchParams: () => new URLSearchParams(),
  redirect: () => {
    throw new Error("redirect not expected in tests");
  },
  notFound: () => {
    throw new Error("notFound not expected in tests");
  },
}));

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
  whyThisIsHappening: "Too much intensity.",
  whatItsCosting: "Stalled FTP.",
  fix: [],
  whyAlone: "Hard to self-diagnose.",
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

async function renderApplyPage() {
  const mod = await import("./page");
  const ApplyPage = mod.default;
  const element = ApplyPage();
  return renderToStaticMarkup(element);
}

async function renderApplyView(submission: StoredSubmission | null) {
  const mod = await import("./page");
  return renderToStaticMarkup(
    <mod.ApplyPageView submission={submission} />,
  );
}

describe("ApplyPage", () => {
  it("renders the cohort form on the public application route", async () => {
    const html = await renderApplyPage();
    expect(html).toContain("COHORT_FORM");
    expect(html).not.toContain("BASED ON YOUR DIAGNOSTIC");
  });

  it("puts the cold application before secondary proof and removes fake scarcity", async () => {
    const html = await renderApplyPage();
    expect(html.indexOf("COHORT_FORM")).toBeGreaterThan(-1);
    expect(html.indexOf("COHORT_FORM")).toBeLessThan(
      html.indexOf("MEASURED MEMBER OUTCOMES"),
    );
    expect(html).not.toMatch(/30 (places|spots)/i);
    expect(html).toContain("REVIEWED PERSONALLY");
    expect(html).toContain("within 48 hours");
  });

  it("keeps delivery, hours and commercial terms consistent", async () => {
    const html = await renderApplyPage();
    expect(html).toContain(
      "A personalised TrainingPeaks plan, reviewed every week.",
    );
    expect(html).toContain("Weekly live group coaching with Anthony");
    expect(html).toContain("6–12 hours");
    expect(html).toContain("$195");
    expect(html).toContain("First 7 days free");
    expect(html).toContain("cancel anytime");
  });

  it("uses the focused coaching footer on the cold application path", async () => {
    const html = await renderApplyPage();
    expect(html).toContain("STOP PLATEAUING.");
    expect(html).not.toContain("THE SATURDAY SPIN NEWSLETTER");
  });

  it("renders the personalised block and hides the cohort form for a resolved submission", async () => {
    const html = await renderApplyView(
      makeSubmission({ email: "anthony@roadmancycling.com" }),
    );
    expect(html).toContain("BASED ON YOUR DIAGNOSTIC");
    expect(html).toContain("Anthony");
    expect(html).not.toContain("COHORT_FORM");
  });

  it("uses the Skool CTA at the bottom of the page when personalised", async () => {
    const html = await renderApplyView(makeSubmission());
    expect(html).toContain("https://www.skool.com/roadmancycling");
    expect(html).not.toContain("skool.com/roadmancycling/about");
  });
});
