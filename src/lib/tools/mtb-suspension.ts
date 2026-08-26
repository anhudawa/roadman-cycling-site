export const FOX_38_2026_SOURCE =
  "https://tech.ridefox.com/bike/owners-manuals/3103/fork--2026-38mm";
export const FOX_FLOAT_2026_SOURCE =
  "https://tech.ridefox.com/bike/owners-manuals/3098/sagsetup";
export const FOX_FLOAT_X2_2026_SOURCE =
  "https://tech.ridefox.com/bike/owners-manuals/3023/shock--2026-float-x2";
export const FOX_MANUALS_SOURCE =
  "https://tech.ridefox.com/bike/owners-manuals";
export const ROCKSHOX_TRAILHEAD_SOURCE =
  "https://trailhead.rockshox.com/";
export const ROCKSHOX_SUSPENSION_SOURCE =
  "https://docs.sram.com/en-US/publications/5ODr3E6BhL1uWDnWhq4ATB/UM%20-%20Suspension";

export type ForkProfileId =
  | "fox-38-float-2026"
  | "fox-38-float-ebike-2026"
  | "fox-38-rhythm-2026"
  | "fox-38-rhythm-ebike-2026"
  | "fox-other"
  | "rockshox"
  | "other";

export type RearProfileId =
  | "fox-float-x-sl-evol-2026"
  | "fox-float-sl-nonevol-2026"
  | "fox-float-x2-2026"
  | "rockshox-air"
  | "other-air"
  | "coil";

export interface SuspensionProfileOption<T extends string> {
  id: T;
  label: string;
  sourceLabel: string;
  sourceUrl?: string;
  note: string;
  travelRangeMm?: {
    min: number;
    max: number;
  };
}

export const FORK_PROFILES: SuspensionProfileOption<ForkProfileId>[] = [
  {
    id: "fox-38-float-2026",
    label: "FOX 38 FLOAT (2026)",
    sourceLabel: "FOX 2026 38 mm owner’s manual",
    sourceUrl: FOX_38_2026_SOURCE,
    note: "Uses the published 2026 FLOAT starting-pressure chart. Confirm the model year before using the number.",
    travelRangeMm: { min: 130, max: 180 },
  },
  {
    id: "fox-38-float-ebike-2026",
    label: "FOX 38 FLOAT E-Bike+ (2026)",
    sourceLabel: "FOX 2026 38 mm owner’s manual",
    sourceUrl: FOX_38_2026_SOURCE,
    note: "Uses the separate published E-Bike+ chart; it is not interchangeable with standard FLOAT.",
    travelRangeMm: { min: 130, max: 180 },
  },
  {
    id: "fox-38-rhythm-2026",
    label: "FOX 38 Rhythm (2026)",
    sourceLabel: "FOX 2026 38 mm owner’s manual",
    sourceUrl: FOX_38_2026_SOURCE,
    note: "Uses the published 2026 Rhythm starting-pressure chart. Maximum pressure differs from FLOAT.",
    travelRangeMm: { min: 130, max: 180 },
  },
  {
    id: "fox-38-rhythm-ebike-2026",
    label: "FOX 38 Rhythm E-Optimized (2026)",
    sourceLabel: "FOX 2026 38 mm owner’s manual",
    sourceUrl: FOX_38_2026_SOURCE,
    note: "Uses the published E-Optimized Rhythm chart for this model year only.",
    travelRangeMm: { min: 130, max: 180 },
  },
  {
    id: "fox-other",
    label: "Another FOX fork or model year",
    sourceLabel: "FOX owner’s manuals",
    sourceUrl: FOX_MANUALS_SOURCE,
    note: "FOX charts change by chassis, air spring and model year. Roadman will calculate sag, but the exact manual must supply PSI.",
  },
  {
    id: "rockshox",
    label: "RockShox air fork",
    sourceLabel: "RockShox Trailhead",
    sourceUrl: ROCKSHOX_TRAILHEAD_SOURCE,
    note: "RockShox directs riders to the fork decal or Trailhead for product-specific starting pressure and rebound.",
  },
  {
    id: "other",
    label: "Another brand or I’m not sure",
    sourceLabel: "Your fork manufacturer’s manual",
    note: "Identify the exact fork, generation and travel before adding pressure. Roadman will calculate the sag measurement only.",
  },
];

export const REAR_PROFILES: SuspensionProfileOption<RearProfileId>[] = [
  {
    id: "fox-float-x-sl-evol-2026",
    label: "FOX FLOAT X / FLOAT SL EVOL (2026)",
    sourceLabel: "FOX 2026 FLOAT X / FLOAT SL manual",
    sourceUrl: FOX_FLOAT_2026_SOURCE,
    note: "FOX says to begin at body weight in pounds, equalise the chambers and then adjust to 25–30% sag. Frame guidance still takes priority.",
  },
  {
    id: "fox-float-sl-nonevol-2026",
    label: "FOX FLOAT SL non-EVOL (2026)",
    sourceLabel: "FOX 2026 FLOAT X / FLOAT SL manual",
    sourceUrl: FOX_FLOAT_2026_SOURCE,
    note: "Uses the same body-weight starting method, with the lower 300 PSI maximum stated for non-EVOL FLOAT SL.",
  },
  {
    id: "fox-float-x2-2026",
    label: "FOX FLOAT X2 (2026)",
    sourceLabel: "FOX 2026 FLOAT X2 manual",
    sourceUrl: FOX_FLOAT_X2_2026_SOURCE,
    note: "FOX says to begin at body weight in pounds, equalise every 50 PSI and tune to approximately 30% sag.",
  },
  {
    id: "rockshox-air",
    label: "RockShox air shock",
    sourceLabel: "RockShox Trailhead",
    sourceUrl: ROCKSHOX_TRAILHEAD_SOURCE,
    note: "Rear-shock pressure is bike- and product-specific. Use Trailhead plus the bicycle manufacturer’s setup guide, then measure sag.",
  },
  {
    id: "other-air",
    label: "Another air shock or model year",
    sourceLabel: "Your bicycle and shock manufacturer’s manuals",
    note: "The same shock can need a different pressure on different frames. Roadman does not infer PSI without bike-specific guidance.",
  },
  {
    id: "coil",
    label: "Coil shock",
    sourceLabel: "Your bicycle and shock manufacturer’s spring calculator",
    note: "Coil spring rate depends on frame motion ratio, shock stroke, travel, weight distribution and permitted preload—not rider weight alone.",
  },
];

type Fox38ProfileId = Extract<
  ForkProfileId,
  | "fox-38-float-2026"
  | "fox-38-float-ebike-2026"
  | "fox-38-rhythm-2026"
  | "fox-38-rhythm-ebike-2026"
>;

interface Fox38PressureBand {
  minLb: number;
  maxLb: number;
  psi: Record<Fox38ProfileId, number>;
}

const FOX_38_PRESSURE_BANDS: Fox38PressureBand[] = [
  { minLb: 120, maxLb: 130, psi: { "fox-38-float-2026": 72, "fox-38-float-ebike-2026": 81, "fox-38-rhythm-2026": 59, "fox-38-rhythm-ebike-2026": 54 } },
  { minLb: 130, maxLb: 140, psi: { "fox-38-float-2026": 76, "fox-38-float-ebike-2026": 85, "fox-38-rhythm-2026": 63, "fox-38-rhythm-ebike-2026": 58 } },
  { minLb: 140, maxLb: 150, psi: { "fox-38-float-2026": 80, "fox-38-float-ebike-2026": 89, "fox-38-rhythm-2026": 67, "fox-38-rhythm-ebike-2026": 62 } },
  { minLb: 150, maxLb: 160, psi: { "fox-38-float-2026": 84, "fox-38-float-ebike-2026": 93, "fox-38-rhythm-2026": 72, "fox-38-rhythm-ebike-2026": 67 } },
  { minLb: 160, maxLb: 170, psi: { "fox-38-float-2026": 89, "fox-38-float-ebike-2026": 98, "fox-38-rhythm-2026": 76, "fox-38-rhythm-ebike-2026": 71 } },
  { minLb: 170, maxLb: 180, psi: { "fox-38-float-2026": 93, "fox-38-float-ebike-2026": 102, "fox-38-rhythm-2026": 80, "fox-38-rhythm-ebike-2026": 75 } },
  { minLb: 180, maxLb: 190, psi: { "fox-38-float-2026": 97, "fox-38-float-ebike-2026": 106, "fox-38-rhythm-2026": 84, "fox-38-rhythm-ebike-2026": 79 } },
  { minLb: 190, maxLb: 200, psi: { "fox-38-float-2026": 102, "fox-38-float-ebike-2026": 111, "fox-38-rhythm-2026": 88, "fox-38-rhythm-ebike-2026": 83 } },
  { minLb: 200, maxLb: 210, psi: { "fox-38-float-2026": 106, "fox-38-float-ebike-2026": 115, "fox-38-rhythm-2026": 92, "fox-38-rhythm-ebike-2026": 87 } },
  { minLb: 210, maxLb: 220, psi: { "fox-38-float-2026": 110, "fox-38-float-ebike-2026": 119, "fox-38-rhythm-2026": 97, "fox-38-rhythm-ebike-2026": 92 } },
  { minLb: 220, maxLb: 230, psi: { "fox-38-float-2026": 114, "fox-38-float-ebike-2026": 123, "fox-38-rhythm-2026": 101, "fox-38-rhythm-ebike-2026": 96 } },
  { minLb: 230, maxLb: 240, psi: { "fox-38-float-2026": 119, "fox-38-float-ebike-2026": 128, "fox-38-rhythm-2026": 105, "fox-38-rhythm-ebike-2026": 100 } },
  { minLb: 240, maxLb: 250, psi: { "fox-38-float-2026": 123, "fox-38-float-ebike-2026": 132, "fox-38-rhythm-2026": 109, "fox-38-rhythm-ebike-2026": 104 } },
];

const FOX_38_MAX_PSI: Record<Fox38ProfileId, number> = {
  "fox-38-float-2026": 140,
  "fox-38-float-ebike-2026": 140,
  "fox-38-rhythm-2026": 120,
  "fox-38-rhythm-ebike-2026": 120,
};

export type PressureStatus =
  | "official-chart"
  | "official-starting-method"
  | "lookup-required"
  | "outside-chart"
  | "over-maximum"
  | "coil";

export interface ComponentSetupResult {
  label: string;
  startingPsi: number | null;
  pressureStatus: PressureStatus;
  pressureExplanation: string;
  sagPercent: number;
  sagMm: number;
  sourceLabel: string;
  sourceUrl?: string;
  maximumPsi?: number;
  sourceBand?: string;
}

export interface SuspensionSetupInput {
  bodyWeightKg: number;
  kitWeightKg: number;
  forkProfileId: ForkProfileId;
  forkTravelMm: number;
  forkSagPercent: number;
  rearProfileId: RearProfileId;
  rearStrokeMm: number;
  rearSagPercent: number;
}

export interface SuspensionSetupResult {
  bodyWeightKg: number;
  ridingWeightKg: number;
  bodyWeightLb: number;
  ridingWeightLb: number;
  fork: ComponentSetupResult;
  rear: ComponentSetupResult;
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function findProfile<T extends string>(
  profiles: SuspensionProfileOption<T>[],
  id: T,
): SuspensionProfileOption<T> {
  const profile = profiles.find((candidate) => candidate.id === id);
  if (!profile) throw new Error(`Unknown suspension profile: ${id}`);
  return profile;
}

function isFox38Profile(id: ForkProfileId): id is Fox38ProfileId {
  return id.startsWith("fox-38-");
}

function calculateForkResult(
  profileId: ForkProfileId,
  ridingWeightKg: number,
  ridingWeightLb: number,
  travelMm: number,
  sagPercent: number,
): ComponentSetupResult {
  const profile = findProfile(FORK_PROFILES, profileId);
  const base: Omit<ComponentSetupResult, "startingPsi" | "pressureStatus" | "pressureExplanation"> = {
    label: profile.label,
    sagPercent,
    sagMm: roundOne(travelMm * sagPercent / 100),
    sourceLabel: profile.sourceLabel,
    sourceUrl: profile.sourceUrl,
  };

  if (!isFox38Profile(profileId)) {
    return {
      ...base,
      startingPsi: null,
      pressureStatus: "lookup-required",
      pressureExplanation: profile.note,
    };
  }

  let band = FOX_38_PRESSURE_BANDS.find((candidate, index) => {
    const isLast = index === FOX_38_PRESSURE_BANDS.length - 1;
    return ridingWeightLb >= candidate.minLb &&
      (ridingWeightLb < candidate.maxLb || (isLast && ridingWeightLb <= candidate.maxLb));
  });

  // FOX publishes the same first row as 120–130 lb and 54–59 kg. Because
  // 54 kg converts to 119.05 lb, honour the documented metric edge without
  // interpolating or extending the table below 54 kg.
  if (!band && ridingWeightKg >= 54 && ridingWeightLb < 120) {
    band = FOX_38_PRESSURE_BANDS[0];
  }

  if (!band) {
    return {
      ...base,
      startingPsi: null,
      pressureStatus: "outside-chart",
      pressureExplanation:
        "The published 2026 FOX 38 table covers 120–250 lb (54–113 kg). Roadman does not extrapolate beyond it; use FOX support for an approved starting point.",
      maximumPsi: FOX_38_MAX_PSI[profileId],
    };
  }

  return {
    ...base,
    startingPsi: band.psi[profileId],
    pressureStatus: "official-chart",
    pressureExplanation:
      "Published FOX chart value for the matching dressed-rider weight band. Do not modify it automatically for riding style or volume spacers; measure sag next.",
    maximumPsi: FOX_38_MAX_PSI[profileId],
    sourceBand: `${band.minLb}–${band.maxLb} lb`,
  };
}

function calculateRearResult(
  profileId: RearProfileId,
  bodyWeightLb: number,
  strokeMm: number,
  sagPercent: number,
): ComponentSetupResult {
  const profile = findProfile(REAR_PROFILES, profileId);
  const base: Omit<ComponentSetupResult, "startingPsi" | "pressureStatus" | "pressureExplanation"> = {
    label: profile.label,
    sagPercent,
    sagMm: roundOne(strokeMm * sagPercent / 100),
    sourceLabel: profile.sourceLabel,
    sourceUrl: profile.sourceUrl,
  };

  if (profileId === "coil") {
    return {
      ...base,
      startingPsi: null,
      pressureStatus: "coil",
      pressureExplanation: profile.note,
    };
  }

  const maximumPsi = profileId === "fox-float-sl-nonevol-2026"
    ? 300
    : profileId.startsWith("fox-")
      ? 350
      : undefined;

  if (!maximumPsi) {
    return {
      ...base,
      startingPsi: null,
      pressureStatus: "lookup-required",
      pressureExplanation: profile.note,
    };
  }

  const startingPsi = Math.round(bodyWeightLb);
  if (startingPsi > maximumPsi) {
    return {
      ...base,
      startingPsi: null,
      pressureStatus: "over-maximum",
      pressureExplanation:
        `The FOX body-weight starting method would exceed this shock’s stated ${maximumPsi} PSI maximum. Do not cap or use that estimate—consult the bicycle and shock manufacturers.`,
      maximumPsi,
    };
  }

  return {
    ...base,
    startingPsi,
    pressureStatus: "official-starting-method",
    pressureExplanation:
      `${profile.note} The displayed PSI is only the first inflation point; the measured sag value is the setup target.`,
    maximumPsi,
  };
}

export function calculateSuspensionSetup(
  input: SuspensionSetupInput,
): SuspensionSetupResult {
  const ridingWeightKg = input.bodyWeightKg + input.kitWeightKg;
  const bodyWeightLb = input.bodyWeightKg * 2.2046226218;
  const ridingWeightLb = ridingWeightKg * 2.2046226218;

  return {
    bodyWeightKg: roundOne(input.bodyWeightKg),
    ridingWeightKg: roundOne(ridingWeightKg),
    bodyWeightLb: roundOne(bodyWeightLb),
    ridingWeightLb: roundOne(ridingWeightLb),
    fork: calculateForkResult(
      input.forkProfileId,
      ridingWeightKg,
      ridingWeightLb,
      input.forkTravelMm,
      input.forkSagPercent,
    ),
    rear: calculateRearResult(
      input.rearProfileId,
      bodyWeightLb,
      input.rearStrokeMm,
      input.rearSagPercent,
    ),
  };
}
