export type HeartRateZoneMethod = "maxhr" | "lthr";

interface HeartRateZoneDefinition {
  name: string;
  description: string;
  minPercent: number | null;
  maxPercent: number | null;
  color: string;
}

export interface CalculatedHeartRateZone {
  name: string;
  description: string;
  minBpm: number | null;
  maxBpm: number | null;
  color: string;
}

const MAX_HR_ZONES: readonly HeartRateZoneDefinition[] = [
  {
    name: "Zone 1 — Recovery",
    description: "Very easy riding and recovery-day control.",
    minPercent: 50,
    maxPercent: 60,
    color: "#94A3B8",
  },
  {
    name: "Zone 2 — Endurance",
    description: "Easy aerobic riding within this five-zone convention.",
    minPercent: 60,
    maxPercent: 70,
    color: "#3B82F6",
  },
  {
    name: "Zone 3 — Tempo",
    description: "Moderate work; use deliberately within the complete week.",
    minPercent: 70,
    maxPercent: 80,
    color: "#22C55E",
  },
  {
    name: "Zone 4 — Sustained",
    description: "Hard sustained work; not a measured lactate threshold.",
    minPercent: 80,
    maxPercent: 90,
    color: "#EAB308",
  },
  {
    name: "Zone 5 — High intensity",
    description: "High internal load; heart rate can lag short efforts.",
    minPercent: 90,
    maxPercent: 100,
    color: "#EF4444",
  },
];

const LTHR_ZONES: readonly HeartRateZoneDefinition[] = [
  {
    name: "Zone 1 — Recovery",
    description: "Below the first displayed Friel-style boundary.",
    minPercent: null,
    maxPercent: 81,
    color: "#94A3B8",
  },
  {
    name: "Zone 2 — Endurance",
    description: "Easy-to-steady riding within this coaching convention.",
    minPercent: 81,
    maxPercent: 90,
    color: "#3B82F6",
  },
  {
    name: "Zone 3 — Tempo",
    description: "Moderate work below the threshold-HR anchor.",
    minPercent: 90,
    maxPercent: 94,
    color: "#22C55E",
  },
  {
    name: "Zone 4 — Threshold range",
    description: "Sustained work approaching the entered LTHR estimate.",
    minPercent: 94,
    maxPercent: 100,
    color: "#EAB308",
  },
  {
    name: "Zone 5 — Above threshold",
    description: "Above the entered LTHR; duration remains athlete-specific.",
    minPercent: 100,
    maxPercent: null,
    color: "#EF4444",
  },
];

/**
 * Convert one Max-HR or LTHR anchor into gap-free whole-bpm display ranges.
 * The percentages are disclosed coaching conventions, not measured metabolic
 * thresholds. Null bounds deliberately render as open-ended ranges.
 */
export function calculateHeartRateZones(
  anchorBpm: number,
  method: HeartRateZoneMethod,
): CalculatedHeartRateZone[] {
  if (!Number.isFinite(anchorBpm) || anchorBpm <= 0) return [];

  const definitions = method === "maxhr" ? MAX_HR_ZONES : LTHR_ZONES;
  let previousMax: number | null = null;

  return definitions.map((zone, index) => {
    const maxBpm =
      zone.maxPercent === null
        ? null
        : Math.round((zone.maxPercent / 100) * anchorBpm);
    const minBpm =
      index > 0 && previousMax !== null
        ? previousMax + 1
        : zone.minPercent === null
          ? null
          : Math.round((zone.minPercent / 100) * anchorBpm);

    previousMax = maxBpm;
    return { ...zone, minBpm, maxBpm };
  });
}

export function formatHeartRateZoneRange(
  zone: Pick<CalculatedHeartRateZone, "minBpm" | "maxBpm">,
): string {
  if (zone.minBpm === null && zone.maxBpm !== null) return `≤${zone.maxBpm}`;
  if (zone.minBpm !== null && zone.maxBpm === null) return `≥${zone.minBpm}`;
  return `${zone.minBpm}–${zone.maxBpm}`;
}
