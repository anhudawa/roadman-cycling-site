import { describe, expect, it } from "vitest";
import { calculateFtpZones } from "./calculators";

describe("calculateFtpZones", () => {
  it("returns the conventional seven ranges with no missing whole watts", () => {
    const zones = calculateFtpZones(250);

    expect(zones.map(({ minWatts, maxWatts }) => [minWatts, maxWatts])).toEqual([
      [0, 137],
      [138, 187],
      [188, 225],
      [226, 262],
      [263, 300],
      [301, 375],
      [376, null],
    ]);
  });

  it.each([50, 137, 250, 333, 600])(
    "keeps adjacent integer ranges continuous for %i W FTP",
    (ftp) => {
      const zones = calculateFtpZones(ftp);

      expect(zones).toHaveLength(7);
      for (let index = 1; index < zones.length; index += 1) {
        expect(zones[index].minWatts).toBe(
          (zones[index - 1].maxWatts as number) + 1,
        );
      }
    },
  );

  it("keeps optional API heart-rate ranges internally continuous", () => {
    const zones = calculateFtpZones(250, 170);

    for (let index = 1; index <= 4; index += 1) {
      expect(zones[index].minBpm).toBe(
        (zones[index - 1].maxBpm as number) + 1,
      );
    }
  });
});
