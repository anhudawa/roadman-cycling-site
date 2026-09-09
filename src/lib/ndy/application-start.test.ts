import { describe, expect, it } from "vitest";
import {
  formatApplicationStart,
  isApplicationStartPreference,
  isIsoCalendarDate,
  isValidApplicationStartDate,
} from "./application-start";

describe("application start preference", () => {
  it("accepts only the three supported choices", () => {
    expect(isApplicationStartPreference("right_now")).toBe(true);
    expect(isApplicationStartPreference("coming_weeks")).toBe(true);
    expect(isApplicationStartPreference("specific_date")).toBe(true);
    expect(isApplicationStartPreference("soon")).toBe(false);
  });

  it("validates real calendar dates that are today or later", () => {
    expect(isValidApplicationStartDate("2026-09-09", "2026-09-09")).toBe(true);
    expect(isValidApplicationStartDate("2026-09-10", "2026-09-09")).toBe(true);
    expect(isValidApplicationStartDate("2026-09-08", "2026-09-09")).toBe(false);
    expect(isIsoCalendarDate("2026-02-30")).toBe(false);
  });

  it("formats the choice for admin and notifications", () => {
    expect(formatApplicationStart("right_now", null)).toBe("Right now");
    expect(formatApplicationStart("coming_weeks", null)).toBe("Coming weeks");
    expect(formatApplicationStart("specific_date", "2026-10-05")).toBe(
      "Specific date — 5 October 2026",
    );
    expect(formatApplicationStart(null, null)).toBe("Not provided");
  });
});
