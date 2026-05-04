/**
 * Can Sagnari — static room layout.
 *
 * The bedrooms on the main floor of the 1749 farmhouse plus a 6-bed annex
 * and one sofa bed for overflow. Rooms 1 and 2 are reserved for the team
 * (Anthony + Sarah, and Matthew) and never get auto-assigned.
 *
 * Each bed is a discrete, lockable slot — the auto-assigner places
 * bookings into beds, not rooms.
 */

export type BedType = "single" | "double" | "queen" | "sofa";

export interface BedConfig {
  /** Stable key like "B5-S1". Used as the assignment row's bed_key. */
  key: string;
  /** Human label for the admin view, e.g. "Single 1". */
  label: string;
  type: BedType;
  /** A "double" or "queen" can comfortably hold 2 people; a "single" 1. */
  sleeps: 1 | 2;
}

export interface RoomConfig {
  key: string;
  label: string;
  /** Shown on the admin card under the label, e.g. "Suite, top floor". */
  blurb: string;
  beds: BedConfig[];
  /**
   * Reserved for the team — the auto-assigner skips these. They still
   * appear in the admin view so the layout is visually correct.
   */
  reservedFor?: string;
  /**
   * Higher = filled later. The "preferred" rule is "fill rooms with most
   * beds first, then doubles/queens for pairs". We compute that as
   * (-bedCount, capacityOrder).
   */
  capacityOrder: number;
  building: "main" | "annex" | "overflow";
}

export const ROOMS: RoomConfig[] = [
  // ─── MAIN HOUSE ───────────────────────────────────────────────────────────
  {
    key: "B1",
    label: "Bedroom 1",
    blurb: "Anthony & Sarah — team",
    reservedFor: "Anthony & Sarah",
    building: "main",
    capacityOrder: 0,
    beds: [
      { key: "B1-D1", label: "Double", type: "double", sleeps: 2 },
      { key: "B1-S1", label: "Single", type: "single", sleeps: 1 },
    ],
  },
  {
    key: "B2",
    label: "Bedroom 2",
    blurb: "Matthew — team",
    reservedFor: "Matthew",
    building: "main",
    capacityOrder: 0,
    beds: [{ key: "B2-Q1", label: "Queen", type: "queen", sleeps: 2 }],
  },
  {
    key: "B5",
    label: "Bedroom 5",
    blurb: "Three singles — sleeps 3",
    building: "main",
    capacityOrder: 1,
    beds: [
      { key: "B5-S1", label: "Single 1", type: "single", sleeps: 1 },
      { key: "B5-S2", label: "Single 2", type: "single", sleeps: 1 },
      { key: "B5-S3", label: "Single 3", type: "single", sleeps: 1 },
    ],
  },
  {
    key: "B8",
    label: "Bedroom 8",
    blurb: "Suite — double + 2 singles, sleeps 4",
    building: "main",
    capacityOrder: 2,
    beds: [
      { key: "B8-D1", label: "Double", type: "double", sleeps: 2 },
      { key: "B8-S1", label: "Single 1", type: "single", sleeps: 1 },
      { key: "B8-S2", label: "Single 2", type: "single", sleeps: 1 },
    ],
  },
  {
    key: "B6",
    label: "Bedroom 6",
    blurb: "Loft — queen + double, sleeps 4",
    building: "main",
    capacityOrder: 3,
    beds: [
      { key: "B6-Q1", label: "Queen", type: "queen", sleeps: 2 },
      { key: "B6-D1", label: "Double", type: "double", sleeps: 2 },
    ],
  },
  {
    key: "B3",
    label: "Bedroom 3",
    blurb: "Two singles — sleeps 2",
    building: "main",
    capacityOrder: 4,
    beds: [
      { key: "B3-S1", label: "Single 1", type: "single", sleeps: 1 },
      { key: "B3-S2", label: "Single 2", type: "single", sleeps: 1 },
    ],
  },
  {
    key: "B4",
    label: "Bedroom 4",
    blurb: "Double — sleeps 2",
    building: "main",
    capacityOrder: 5,
    beds: [{ key: "B4-D1", label: "Double", type: "double", sleeps: 2 }],
  },
  {
    key: "B7",
    label: "Bedroom 7",
    blurb: "Double — sleeps 2",
    building: "main",
    capacityOrder: 6,
    beds: [{ key: "B7-D1", label: "Double", type: "double", sleeps: 2 }],
  },

  // ─── ANNEX ────────────────────────────────────────────────────────────────
  {
    key: "AN1",
    label: "Annex Room 1",
    blurb: "Twin — sleeps 2",
    building: "annex",
    capacityOrder: 7,
    beds: [
      { key: "AN1-S1", label: "Single 1", type: "single", sleeps: 1 },
      { key: "AN1-S2", label: "Single 2", type: "single", sleeps: 1 },
    ],
  },
  {
    key: "AN2",
    label: "Annex Room 2",
    blurb: "Twin — sleeps 2",
    building: "annex",
    capacityOrder: 8,
    beds: [
      { key: "AN2-S1", label: "Single 1", type: "single", sleeps: 1 },
      { key: "AN2-S2", label: "Single 2", type: "single", sleeps: 1 },
    ],
  },
  {
    key: "AN3",
    label: "Annex Room 3",
    blurb: "Twin — sleeps 2",
    building: "annex",
    capacityOrder: 9,
    beds: [
      { key: "AN3-S1", label: "Single 1", type: "single", sleeps: 1 },
      { key: "AN3-S2", label: "Single 2", type: "single", sleeps: 1 },
    ],
  },

  // ─── OVERFLOW ─────────────────────────────────────────────────────────────
  {
    key: "OV1",
    label: "Living room sofa bed",
    blurb: "Overflow — only used when everything else is full",
    building: "overflow",
    capacityOrder: 99,
    beds: [{ key: "OV1-SB1", label: "Sofa bed", type: "sofa", sleeps: 1 }],
  },
];

export const ROOMS_BY_KEY: Map<string, RoomConfig> = new Map(
  ROOMS.map((r) => [r.key, r]),
);

/**
 * Bookable beds = total sleep capacity excluding reserved rooms. This is
 * the headline number on the admin dashboard.
 */
export const TOTAL_BOOKABLE_BEDS = ROOMS.filter((r) => !r.reservedFor)
  .flatMap((r) => r.beds)
  .reduce((acc, bed) => acc + bed.sleeps, 0);

export function findRoomForBed(bedKey: string): RoomConfig | null {
  for (const room of ROOMS) {
    if (room.beds.some((b) => b.key === bedKey)) return room;
  }
  return null;
}
