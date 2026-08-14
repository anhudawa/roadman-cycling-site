import { describe, expect, it } from "vitest";
import {
  buildCalibrationReport,
  calculateCalibrationMetric,
  classifyCourseType,
  classifyRiderType,
} from "./calibration";

describe("race predictor calibration", () => {
  it("calculates MAPE, bias, percentiles, and accuracy bands", () => {
    const metric = calculateCalibrationMetric([
      { predictionId: 1, predictedTimeS: 9_000, actualTimeS: 10_000 },
      { predictionId: 2, predictedTimeS: 10_500, actualTimeS: 10_000 },
      { predictionId: 3, predictedTimeS: 10_000, actualTimeS: 10_000 },
      { predictionId: 4, predictedTimeS: 0, actualTimeS: 10_000 },
    ]);

    expect(metric).toEqual({
      count: 3,
      mapePct: 5,
      meanSignedErrorPct: -1.67,
      medianAbsoluteErrorPct: 5,
      p90AbsoluteErrorPct: 10,
      within5Pct: 66.67,
      within10Pct: 100,
    });
  });

  it("classifies course and rider cohorts conservatively", () => {
    expect(classifyCourseType(100_000, 500)).toBe("flat");
    expect(classifyCourseType(100_000, 1_200)).toBe("rolling");
    expect(classifyCourseType(100_000, 2_500)).toBe("mountain");
    expect(classifyCourseType(null, 2_500)).toBe("unknown");

    expect(classifyRiderType(150, 75)).toBe("developing");
    expect(classifyRiderType(225, 75)).toBe("trained");
    expect(classifyRiderType(300, 75)).toBe("competitive");
    expect(classifyRiderType(340, 75)).toBe("high_performance");
  });

  it("breaks error down by course, rider, and event type", () => {
    const report = buildCalibrationReport([
      {
        predictionId: 1,
        predictedTimeS: 10_500,
        actualTimeS: 10_000,
        courseDistanceM: 100_000,
        courseElevationGainM: 500,
        riderFtpW: 225,
        riderMassKg: 75,
        eventType: "sportive",
      },
      {
        predictionId: 2,
        predictedTimeS: 9_000,
        actualTimeS: 10_000,
        courseDistanceM: 100_000,
        courseElevationGainM: 2_500,
        riderFtpW: 300,
        riderMassKg: 75,
        eventType: "gran_fondo",
      },
    ]);

    expect(report.overall.count).toBe(2);
    expect(report.byCourseType.map((row) => row.key)).toEqual([
      "flat",
      "mountain",
    ]);
    expect(report.byRiderType.map((row) => row.key)).toEqual([
      "competitive",
      "trained",
    ]);
    expect(report.byEventType.map((row) => row.key)).toEqual([
      "gran_fondo",
      "sportive",
    ]);
  });
});
