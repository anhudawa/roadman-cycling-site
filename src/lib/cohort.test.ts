import { describe, it, expect } from "vitest";
import { getCohortState } from "./cohort";

/**
 * The cohort state is the single source of truth for NDY application
 * copy — banner, /apply form, and Beehiiv tagging. Lock the surface
 * area down so a regression here can't silently swap user-facing
 * strings back to cohort-numbered or waitlist phrasing.
 */
describe("getCohortState", () => {
  it("returns the unified application state regardless of date", () => {
    const a = getCohortState(new Date("2026-01-01T00:00:00Z"));
    const b = getCohortState(new Date("2027-06-15T10:00:00Z"));
    expect(a.phase).toBe("open");
    expect(b.phase).toBe("open");
    expect(a.submissionTag).toBe("ndy-applicant");
    expect(b.submissionTag).toBe("ndy-applicant");
  });

  it("uses cohort-number-free banner copy", () => {
    const { banner } = getCohortState();
    expect(banner.eyebrow).toBe("NOT DONE YET COACHING");
    expect(banner.cta).toBe("START APPLICATION");
    expect(banner.ctaHref).toBe("/apply");
    expect(banner.eyebrow).not.toMatch(/cohort/i);
    expect(banner.detail).not.toMatch(/cohort|waitlist|coming soon|early access/i);
    expect(banner.detail).toContain("$195 USD/month");
    expect(banner.detail).toContain("first 7 days free");
  });

  it("uses cohort-number-free form copy", () => {
    const { form } = getCohortState();
    expect(form.kicker).toBe("START YOUR APPLICATION");
    expect(form.buttonText).toBe("SEND MY APPLICATION");
    expect(form.submittedHeadline).toBe("APPLICATION RECEIVED");
    expect(form.submittedBody).toContain("within 48 hours");
    expect(form.submittedBody).not.toContain("within 24 hours");
    expect(form.subheading).not.toMatch(/cohort|waitlist|coming soon|early access/i);
    expect(form.submittedBody).not.toMatch(/cohort|waitlist|coming soon|early access/i);
  });
});
