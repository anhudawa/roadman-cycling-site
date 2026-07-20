import { describe, it, expect } from "vitest";
import { parseTpDate, parseTrainingPeaksCsv } from "./trainingpeaks";
import { mergeActivities } from "./merge";
import type { Activity } from "./types";

const HEADER =
  "Title,WorkoutType,WorkoutDay,DistanceInMeters,TimeTotalInHours,PowerAverage,NormalizedPower,HeartRateAverage,ElevationGainInMeters,TSS,IF";

describe("parseTpDate", () => {
  it("parses ISO dates", () => {
    expect(parseTpDate("2026-07-12")).toBe("2026-07-12");
  });

  it("parses US-style slash dates", () => {
    expect(parseTpDate("7/12/2026")).toBe("2026-07-12");
  });

  it("swaps day-first dates when the first number can't be a month", () => {
    expect(parseTpDate("28/06/2026")).toBe("2026-06-28");
  });

  it("returns null for garbage", () => {
    expect(parseTpDate("yesterday")).toBeNull();
  });
});

describe("parseTrainingPeaksCsv", () => {
  it("imports completed bike workouts and skips runs and planned sessions", () => {
    const csv = [
      HEADER,
      '"2x20 Sweet Spot",Bike,2026-07-14,42000,1.5,198,212,151,320,88,0.8',
      '"Easy run",Run,2026-07-15,8000,0.75,,,148,40,35,0.65',
      '"Planned threshold",Bike,2026-07-16,,,,,,,,',
      '"Sunday endurance",Bike,2026-07-19,98000,3.6,172,181,139,1240,180,0.68',
    ].join("\n");

    const result = parseTrainingPeaksCsv(csv);
    expect(result.activities).toHaveLength(2);
    expect(result.skipped).toBe(2);

    const first = result.activities[0];
    expect(first.date).toBe("2026-07-14");
    expect(first.name).toBe("2x20 Sweet Spot");
    expect(first.durationSec).toBe(5400);
    expect(first.distanceKm).toBeCloseTo(42, 1);
    expect(first.avgPower).toBe(198);
    expect(first.normalizedPower).toBe(212);
    expect(first.avgHr).toBe(151);
    expect(first.source).toBe("trainingpeaks");
  });

  it("tolerates alternate column names", () => {
    const csv = [
      "Name,Sport,Date,TotalTimeInHours,AveragePower",
      "Morning ride,Bike,2026-07-10,2.0,180",
    ].join("\n");
    const result = parseTrainingPeaksCsv(csv);
    // "Sport"/"Date" headers are aliases the parser accepts.
    expect(result.activities).toHaveLength(1);
    expect(result.activities[0].durationSec).toBe(7200);
    expect(result.activities[0].avgPower).toBe(180);
  });

  it("rejects files that are not a TrainingPeaks export", () => {
    const result = parseTrainingPeaksCsv("a,b\n1,2");
    expect(result.activities).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("mergeActivities", () => {
  const stravaRide: Activity = {
    id: "strava-1",
    date: "2026-07-14",
    name: "Lunch ride",
    durationSec: 5430,
    avgHr: 150,
    source: "strava",
  };
  const tpRide: Activity = {
    id: "tp-2026-07-14-1",
    date: "2026-07-14",
    name: "2x20 Sweet Spot",
    durationSec: 5400,
    avgPower: 198,
    normalizedPower: 212,
    source: "trainingpeaks",
  };

  it("keeps the richer record when the same ride comes from both platforms", () => {
    const { merged, duplicates } = mergeActivities([stravaRide], [tpRide]);
    expect(merged).toHaveLength(1);
    expect(duplicates).toBe(1);
    expect(merged[0].id).toBe("tp-2026-07-14-1");
  });

  it("keeps distinct rides on the same day", () => {
    const evening: Activity = { ...tpRide, id: "tp-x", durationSec: 9000 };
    const { merged, duplicates } = mergeActivities([stravaRide], [evening]);
    expect(merged).toHaveLength(2);
    expect(duplicates).toBe(0);
  });

  it("sorts the merged list by date", () => {
    const earlier: Activity = { ...stravaRide, id: "s2", date: "2026-07-01" };
    const { merged } = mergeActivities([stravaRide], [earlier]);
    expect(merged[0].date).toBe("2026-07-01");
  });
});
