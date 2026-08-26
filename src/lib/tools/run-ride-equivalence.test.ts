import { describe, expect, it } from "vitest";
import {
  convertRunRideEnergyCost,
  CYCLING_ACTIVITIES,
  milesToKilometres,
  RUNNING_ACTIVITIES,
} from "./run-ride-equivalence";

describe("run-ride energy-cost conversion", () => {
  it("matches MET-minutes from a timed run to a ride", () => {
    const result = convertRunRideEnergyCost({
      direction: "run-to-ride",
      inputMode: "time",
      amount: 30,
      distanceUnit: "km",
      sourceActivityId: "run-6",
      targetActivityId: "ride-12",
    });

    expect(result.metMinutes).toBeCloseTo(279, 8);
    expect(result.targetMinutes).toBeCloseTo(34.875, 8);
    expect(result.sourceDistanceMiles).toBeCloseTo(3, 8);
    expect(result.targetDistanceMiles).toBeCloseTo(6.975, 8);
  });

  it("converts a kilometre distance before matching MET-minutes", () => {
    const result = convertRunRideEnergyCost({
      direction: "run-to-ride",
      inputMode: "distance",
      amount: 5,
      distanceUnit: "km",
      sourceActivityId: "run-6",
      targetActivityId: "ride-14",
    });

    expect(result.sourceMinutes).toBeCloseTo(31.06856, 4);
    expect(result.targetMinutes).toBeCloseTo(28.89376, 4);
    expect(milesToKilometres(result.targetDistanceMiles)).toBeCloseTo(
      10.8498,
      3,
    );
  });

  it("works in the ride-to-run direction", () => {
    const result = convertRunRideEnergyCost({
      direction: "ride-to-run",
      inputMode: "time",
      amount: 60,
      distanceUnit: "mile",
      sourceActivityId: "ride-14",
      targetActivityId: "run-6",
    });

    expect(result.metMinutes).toBe(600);
    expect(result.targetMinutes).toBeCloseTo(64.5161, 4);
    expect(result.targetDistanceMiles).toBeCloseTo(6.4516, 4);
  });

  it("publishes only source-coded 2024 Compendium activities", () => {
    for (const activity of [...RUNNING_ACTIVITIES, ...CYCLING_ACTIVITIES]) {
      expect(activity.met).toBeGreaterThan(0);
      expect(activity.speedMph).toBeGreaterThan(0);
      expect(activity.compendiumCode).toMatch(/^\d{5}$/);
    }
  });

  it("rejects invalid inputs and cross-direction preset misuse", () => {
    expect(() =>
      convertRunRideEnergyCost({
        direction: "run-to-ride",
        inputMode: "time",
        amount: 0,
        distanceUnit: "km",
        sourceActivityId: "run-6",
        targetActivityId: "ride-12",
      }),
    ).toThrow("positive finite number");

    expect(() =>
      convertRunRideEnergyCost({
        direction: "run-to-ride",
        inputMode: "time",
        amount: 30,
        distanceUnit: "km",
        sourceActivityId: "ride-12",
        targetActivityId: "run-6",
      }),
    ).toThrow("Unknown run-ride activity");
  });
});
