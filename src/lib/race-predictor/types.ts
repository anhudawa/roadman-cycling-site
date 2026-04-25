// Shared types for the race predictor.
// All math modules import from here; nothing else lives in this file.

/** A single GPS track point parsed from GPX. */
export interface TrackPoint {
  lat: number;
  lon: number;
  elevation: number;
  time?: Date;
}

export type SurfaceType =
  | 'tarmac_smooth'
  | 'tarmac_mixed'
  | 'tarmac_rough'
  | 'chip_seal'
  | 'gravel_smooth'
  | 'gravel_rough'
  | 'cobbles';

/** A derived course segment between two track points. */
export interface Segment {
  index: number;
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  startElevation: number;
  endElevation: number;
  /** Horizontal distance, m. */
  distance: number;
  /** Gradient in radians, positive = uphill. */
  gradient: number;
  /** Bearing in radians, 0 = north, π/2 = east. */
  heading: number;
  surface?: SurfaceType;
}

export type ClimbCategory = 'cat4' | 'cat3' | 'cat2' | 'cat1' | 'hc';

export interface Climb {
  startSegmentIndex: number;
  endSegmentIndex: number;
  startDistance: number;
  endDistance: number;
  length: number;
  averageGradient: number;
  elevationGain: number;
  category: ClimbCategory;
}

export interface Course {
  name?: string;
  segments: Segment[];
  totalDistance: number;
  totalElevationGain: number;
  totalElevationLoss: number;
  climbs: Climb[];
}

/** Environmental conditions for a course. */
export interface Environment {
  /** °C */
  airTemperature: number;
  /** 0-1 */
  relativeHumidity: number;
  /** Pa, sea-level reference (default 101325). */
  airPressure: number;
  /** m/s */
  windSpeed: number;
  /** Radians, meteorological — 0 = wind FROM north (blowing south). */
  windDirection: number;
}

/** Computed air state for a single segment. */
export interface SegmentAirState {
  airDensity: number;
  /** m/s, positive = headwind. */
  headwindComponent: number;
  /** m/s, positive = wind from rider's right. */
  crosswindComponent: number;
  /** Yaw angle (radians) given a rider speed. */
  yawAngleAt: (riderSpeed: number) => number;
}

/** Six-anchor power-duration profile. */
export interface PowerProfile {
  /** Best 5-second power, W. */
  p5s: number;
  /** Best 1-minute power, W. */
  p1min: number;
  /** Best 5-minute power, W. */
  p5min: number;
  /** Best 20-minute power, W. */
  p20min: number;
  /** Best 60-minute power (CP proxy), W. */
  p60min: number;
  /** Durability decay factor k. P_sustainable(t) = CP·(1 − k·ln(t/3600)) for t > 3600s.
   *  Typical: 0.05 trained, 0.03 ultra-endurance, 0.08 threshold-only. */
  durabilityFactor: number;
}

/** Fitted critical-power model. */
export interface CPModel {
  /** Critical power, W. */
  cp: number;
  /** Anaerobic capacity, J. */
  wPrime: number;
}

export type RidingPosition =
  | 'tt_bars'
  | 'aero_drops'
  | 'aero_hoods'
  | 'endurance_hoods'
  | 'standard_hoods'
  | 'climbing';

export interface RiderProfile {
  bodyMass: number;
  bikeMass: number;
  position: RidingPosition;
  /** m². */
  cda: number;
  crr: number;
  /** 0-1, default 0.97. */
  drivetrainEfficiency: number;
  powerProfile: PowerProfile;
}

export interface SegmentResult {
  segmentIndex: number;
  /** m/s. */
  startSpeed: number;
  endSpeed: number;
  averageSpeed: number;
  /** s. */
  duration: number;
  /** W. */
  riderPower: number;
  airDensity: number;
  /** m/s. */
  headwind: number;
  /** Radians. */
  yawAngle: number;
}

export interface CourseResult {
  segmentResults: SegmentResult[];
  /** s. */
  totalTime: number;
  /** m. */
  totalDistance: number;
  /** m/s. */
  averageSpeed: number;
  /** W. */
  averagePower: number;
  /** W. */
  normalizedPower: number;
  variabilityIndex: number;
}

/** Power target per segment; length must match segments.length. */
export type PacingPlan = number[];

export interface WPrimeBalanceTrace {
  /** s from start. */
  time: number;
  /** J remaining. */
  wPrimeBalance: number;
}

export interface ScenarioDelta {
  name: string;
  riderPatch?: Partial<RiderProfile>;
  environmentPatch?: Partial<Environment>;
  pacingPatch?: { multiplier: number };
}

export interface ScenarioResult {
  name: string;
  /** s, negative = faster. */
  totalTimeDelta: number;
  /** m/s. */
  averageSpeedDelta: number;
  /** Per-segment time delta in s. */
  segmentTimeDeltas: number[];
}

/** Single sample from a ride file (used by CdA estimator). */
export interface RidePoint {
  /** s from start. */
  time: number;
  lat?: number;
  lon?: number;
  elevation?: number;
  /** W. */
  power: number;
  /** m/s. */
  speed: number;
  cadence?: number;
  heartRate?: number;
}
