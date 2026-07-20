import { describe, it, expect } from "vitest";
import { parseCsv, parseStravaActivitiesCsv, parseStravaDate } from "./strava";

const HEADER =
  '"Activity ID","Activity Date","Activity Name","Activity Type","Elapsed Time","Distance","Moving Time","Average Heart Rate","Average Watts","Weighted Average Power","Elevation Gain"';

describe("parseCsv", () => {
  it("handles quoted fields with embedded commas and quotes", () => {
    const rows = parseCsv('"a,b","she said ""hi""",c\n1,2,3');
    expect(rows[0]).toEqual(['a,b', 'she said "hi"', "c"]);
    expect(rows[1]).toEqual(["1", "2", "3"]);
  });
});

describe("parseStravaDate", () => {
  it("parses the Strava export format", () => {
    expect(parseStravaDate("Jul 20, 2026, 6:12:34 AM")).toBe("2026-07-20");
  });

  it("passes ISO dates through", () => {
    expect(parseStravaDate("2026-07-20T06:12:34Z")).toBe("2026-07-20");
  });

  it("returns null for garbage", () => {
    expect(parseStravaDate("not a date")).toBeNull();
  });
});

describe("parseStravaActivitiesCsv", () => {
  it("imports rides and skips runs", () => {
    const csv = [
      HEADER,
      '"111","Jul 12, 2026, 8:01:00 AM","Sunday club run, the long one","Ride","14400","98.5","13800","141","198","212","1240"',
      '"112","Jul 13, 2026, 7:00:00 AM","Easy run","Run","3600","10.1","3500","150","","",""',
      '"113","Jul 14, 2026, 6:30:00 PM","Turbo intervals","Virtual Ride","4200","30.2","4100","155","230","245","10"',
    ].join("\n");

    const result = parseStravaActivitiesCsv(csv);
    expect(result.activities).toHaveLength(2);
    expect(result.skipped).toBe(1);

    const first = result.activities[0];
    expect(first.date).toBe("2026-07-12");
    expect(first.name).toBe("Sunday club run, the long one");
    expect(first.durationSec).toBe(13800);
    expect(first.distanceKm).toBeCloseTo(98.5, 1);
    expect(first.avgPower).toBe(198);
    expect(first.normalizedPower).toBe(212);
    expect(first.avgHr).toBe(141);
  });

  it("converts metre distances to kilometres", () => {
    const csv = [
      HEADER,
      '"115","Jul 12, 2026, 8:01:00 AM","Big ride","Ride","14400","98500","13800","141","198","212","1240"',
    ].join("\n");
    const result = parseStravaActivitiesCsv(csv);
    expect(result.activities[0].distanceKm).toBeCloseTo(98.5, 1);
  });

  it("drops rides shorter than ten minutes", () => {
    const csv = [
      HEADER,
      '"116","Jul 12, 2026, 8:01:00 AM","Test spin","Ride","300","2.0","280","","","",""',
    ].join("\n");
    const result = parseStravaActivitiesCsv(csv);
    expect(result.activities).toHaveLength(0);
    expect(result.skipped).toBe(1);
  });

  it("rejects files that are not a Strava export", () => {
    const result = parseStravaActivitiesCsv("name,watts\nride,200");
    expect(result.activities).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
