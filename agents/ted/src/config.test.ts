import { describe, it, expect } from "vitest";
import { pillarForDate, dublinWeekday, dublinISODate, PILLAR_LABELS, PILLARS } from "./config";

describe("pillarForDate", () => {
  it("maps Sunday to 'sunday'", () => {
    // 2026-04-19 is a Sunday (used here in Dublin time; noon UTC reads as noon Dublin depending on DST)
    const d = new Date("2026-04-19T12:00:00Z");
    expect(pillarForDate(d)).toBe("sunday");
  });

  it("maps Monday to 'monday'", () => {
    const d = new Date("2026-04-20T12:00:00Z");
    expect(pillarForDate(d)).toBe("monday");
  });

  it("maps Friday to 'friday'", () => {
    const d = new Date("2026-04-24T12:00:00Z");
    expect(pillarForDate(d)).toBe("friday");
  });

  it("covers all 7 weekdays over a full week", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(`2026-04-${20 + i}T12:00:00Z`);
      seen.add(pillarForDate(d));
    }
    expect(seen.size).toBe(7);
    for (const p of PILLARS) {
      expect(seen.has(p)).toBe(true);
    }
  });
});

describe("dublinWeekday", () => {
  it("returns 1 for Monday", () => {
    expect(dublinWeekday(new Date("2026-04-20T12:00:00Z"))).toBe(1);
  });

  it("returns 0 for Sunday", () => {
    expect(dublinWeekday(new Date("2026-04-19T12:00:00Z"))).toBe(0);
  });
});

describe("dublinISODate", () => {
  it("formats YYYY-MM-DD for a known date", () => {
    // 13:00 UTC in April is 14:00 Dublin (IST), so same calendar date
    expect(dublinISODate(new Date("2026-04-20T13:00:00Z"))).toBe("2026-04-20");
  });

  it("wraps correctly across midnight UTC", () => {
    // 01:00 UTC April 20 is 02:00 Dublin (IST) $€” still April 20
    expect(dublinISODate(new Date("2026-04-20T01:00:00Z"))).toBe("2026-04-20");
    // 23:30 UTC April 19 is 00:30 Dublin April 20 during IST
    expect(dublinISODate(new Date("2026-04-19T23:30:00Z"))).toBe("2026-04-20");
  });
});

describe("PILLAR_LABELS", () => {
  it("has a label for every pillar", () => {
    for (const p of PILLARS) {
      expect(PILLAR_LABELS[p]).toBeTruthy();
    }
  });
});
