import { describe, it, expect } from "vitest";
import { __internal } from "./ScheduleCard";

const { nextRunAt, formatCountdown, SLOTS } = __internal;

describe("nextRunAt", () => {
  it("returns a future time strictly after now for every slot", () => {
    const now = new Date("2026-04-16T12:00:00Z");
    for (const slot of SLOTS) {
      const next = nextRunAt(slot, now);
      expect(next.getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it("picks the later of two same-day hours when now is between them", () => {
    // welcomes run at 08:00 and 17:00 UTC
    const welcomes = SLOTS.find((s) => s.job === "welcomes")!;
    const now = new Date("2026-04-16T10:00:00Z");
    const next = nextRunAt(welcomes, now);
    expect(next.toISOString()).toBe("2026-04-16T17:00:00.000Z");
  });

  it("rolls over to next day when all of today's hours have passed", () => {
    const draftPrompt = SLOTS.find((s) => s.job === "draft-prompt")!;
    // 06:00 UTC already happened at this time
    const now = new Date("2026-04-16T10:00:00Z");
    const next = nextRunAt(draftPrompt, now);
    expect(next.toISOString()).toBe("2026-04-17T06:00:00.000Z");
  });

  it("respects weekly day-of-week for the digest", () => {
    // weekly-digest runs Mondays 09:00 UTC (dayOfWeek=1)
    const digest = SLOTS.find((s) => s.job === "weekly-digest")!;
    // Thursday 2026-04-16 — next Monday is 2026-04-20
    const now = new Date("2026-04-16T12:00:00Z");
    const next = nextRunAt(digest, now);
    expect(next.toISOString()).toBe("2026-04-20T09:00:00.000Z");
  });
});

describe("formatCountdown", () => {
  const now = new Date("2026-04-16T12:00:00Z");

  it("formats minutes under an hour", () => {
    expect(formatCountdown(new Date("2026-04-16T12:30:00Z"), now)).toBe("30m");
  });

  it("formats hours and minutes", () => {
    expect(formatCountdown(new Date("2026-04-16T15:45:00Z"), now)).toBe("3h 45m");
  });

  it("formats days for > 24h", () => {
    expect(formatCountdown(new Date("2026-04-18T12:00:00Z"), now)).toBe("2d");
  });

  it("formats days and hours", () => {
    expect(formatCountdown(new Date("2026-04-18T18:00:00Z"), now)).toBe("2d 6h");
  });

  it("returns 'now' when target is past", () => {
    expect(formatCountdown(new Date("2026-04-16T11:00:00Z"), now)).toBe("now");
  });
});
