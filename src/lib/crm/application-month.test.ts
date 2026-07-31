import { describe, expect, it } from "vitest";
import {
  formatApplicationMonth,
  isApplicationMonth,
} from "./application-month";

describe("application month", () => {
  it("accepts valid year-month values", () => {
    expect(isApplicationMonth("2026-07")).toBe(true);
    expect(isApplicationMonth("2026-7")).toBe(false);
    expect(isApplicationMonth("2026-13")).toBe(false);
  });

  it("formats month labels for the admin filter", () => {
    expect(formatApplicationMonth("2026-07")).toBe("July 2026");
  });
});
