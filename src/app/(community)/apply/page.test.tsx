import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StoredSubmission } from "@/lib/diagnostic/store";
import type { Answers, Breakdown } from "@/lib/diagnostic/types";

// We mock the store so the page-under-test never touches the DB.
// The CohortApplicationForm is a client component with state; mock it
// down to a recognisable marker so we can assert on its presence.
const getSubmissionBySlugMock = vi.fn<
  (slug: string) => Promise<StoredSubmission | null>
>();

vi.mock("@/lib/diagnostic/store", () => ({
  getSubmissionBySlug: (slug: string) => getSubmissionBySlugMock(slug),
}));

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

async function renderApplyPage(searchParams: { from?: string }) {
  const mod = await import("./page");
  const ApplyPage = mod.default;
  const element = await ApplyPage({
    searchParams: Promise.resolve(searchParams),
  });
  return renderToStaticMarkup(element);
}

afterEach(() => {
  getSubmissionBySlugMock.mockReset();
});

describe("ApplyPage", () => {
  it("renders the cohort form when no `from` param is given", async () => {
    const html = await renderApplyPage({});
    expect(html).toContain("COHORT_FORM");
    expect(html).not.toContain("BASED ON YOUR DIAGNOSTIC");
    expect(getSubmissionBySlugMock).not.toHaveBeenCalled();
  });

  it("renders the cohort form when `from` matches no submission", async () => {
    getSubmissionBySlugMock.mockResolvedValue(null);
    const html = await renderApplyPage({ from: "unknown123" });
    expect(html).toContain("COHORT_FORM");
    expect(html).not.toContain("BASED ON YOUR DIAGNOSTIC");
    expect(getSubmissionBySlugMock).toHaveBeenCalledWith("unknown123");
  });

  it("renders the personalised block and hides the cohort form when `from` resolves", async () => {
    getSubmissionBySlugMock.mockResolvedValue(
      makeSubmission({ email: "anthony@roadmancycling.com" })
    );
    const html = await renderApplyPage({ from: "abc123xyz0" });
    expect(html).toContain("BASED ON YOUR DIAGNOSTIC");
    expect(html).toContain("Anthony");
    expect(html).not.toContain("COHORT_FORM");
  });

  it("uses the Skool CTA at the bottom of the page when personalised", async () => {
    getSubmissionBySlugMock.mockResolvedValue(makeSubmission());
    const html = await renderApplyPage({ from: "abc123xyz0" });
    expect(html).toContain("https://www.skool.com/roadmancycling/about");
  });

  it("ignores empty `from` and falls back to the cohort form", async () => {
    const html = await renderApplyPage({ from: "" });
    expect(html).toContain("COHORT_FORM");
    expect(getSubmissionBySlugMock).not.toHaveBeenCalled();
  });

  it("falls back to the cohort form when the store throws", async () => {
    getSubmissionBySlugMock.mockRejectedValue(
      new Error("DB connection lost")
    );
    const html = await renderApplyPage({ from: "abc123xyz0" });
    expect(html).toContain("COHORT_FORM");
    expect(html).not.toContain("BASED ON YOUR DIAGNOSTIC");
  });
});
