import { describe, it, expect } from "vitest";
import { getCohortState } from "./cohort";

/**
 * The cohort state machine is a single source of truth with high
 * blast radius — a regression here would silently break the banner,
 * the /apply form copy, and the Beehiiv tagging. Lock it down.
 *
 * These tests pin behaviour against a fixed `now` rather than the
 * actual clock so CI stays deterministic regardless of when the
 * cohort deadline is set.
 */
describe("getCohortState", () => {
  // These deadlines live in src/lib/cohort.ts — keep in sync if the
  // file changes. COHORT_2_CLOSE = 2026-04-17T23:00:00Z.

  it("returns 'open' phase well before Cohort 2 close", () => {
    const state = getCohortState(new Date("2026-04-10T12:00:00Z"));
    expect(state.phase).toBe("open");
    expect(state.currentCohort).toBe(2);
    expect(state.targetCohort).toBe(2);
    expect(state.submissionTag).toBe("cohort-2-applicant");
    expect(state.banner.eyebrow).toBe("COHORT 2 IS OPEN");
    expect(state.banner.cta).toBe("APPLY");
  });

  it("flips to 'closing-today' within the final hour", () => {
    const state = getCohortState(new Date("2026-04-17T22:30:00Z"));
    expect(state.phase).toBe("closing-today");
    expect(state.currentCohort).toBe(2);
    expect(state.banner.eyebrow).toBe("FINAL HOURS");
    // Still accepting apps — same tag
    expect(state.submissionTag).toBe("cohort-2-applicant");
  });

  it("auto-flips to 'waitlist' at the close time", () => {
    const state = getCohortState(new Date("2026-04-17T23:00:01Z"));
    expect(state.phase).toBe("waitlist");
    expect(state.currentCohort).toBe(3);
    expect(state.targetCohort).toBe(3);
    expect(state.submissionTag).toBe("cohort-3-waitlist");
    expect(state.banner.eyebrow).toBe("COHORT 3 OPENS SOON");
    expect(state.banner.cta).toBe("JOIN WAITLIST");
  });

  it("stays in 'waitlist' indefinitely after Cohort 2 close", () => {
    const state = getCohortState(new Date("2026-06-15T10:00:00Z"));
    expect(state.phase).toBe("waitlist");
    expect(state.submissionTag).toBe("cohort-3-waitlist");
  });

  it("provides next-cohort dates in waitlist phase", () => {
    const state = getCohortState(new Date("2026-05-01T10:00:00Z"));
    expect(state.phase).toBe("waitlist");
    expect(state.nextOpens).toBeInstanceOf(Date);
    expect(state.nextStarts).toBeInstanceOf(Date);
  });

  it("form copy adapts per phase", () => {
    const open = getCohortState(new Date("2026-04-10T12:00:00Z"));
    expect(open.form.buttonText).toBe("APPLY FOR YOUR SPOT");
    expect(open.form.submittedHeadline).toBe("APPLICATION RECEIVED");

    const waitlist = getCohortState(new Date("2026-04-18T10:00:00Z"));
    expect(waitlist.form.buttonText).toBe("JOIN THE WAITLIST");
    expect(waitlist.form.submittedHeadline).toBe("YOU'RE ON THE LIST");
  });
});
