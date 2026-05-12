/**
 * Fuel Planner — Session Library
 *
 * All 21 session types from the TrainingPeaks plan analysis (May 2026),
 * with fuel categories, durations, intensity factors, and in-ride carb
 * recommendations assigned per Hexis/Impey FFTWR methodology.
 */

import type { SessionTemplate, FuelCategory } from './types';

/* ------------------------------------------------------------------ */
/*  In-ride carb recommendations by fuel category                      */
/* ------------------------------------------------------------------ */

/**
 * In-ride carbohydrate targets (g/hr) by fuel category.
 * Based on current sports science consensus and Hexis prescriptions:
 * - REST/LOW: no in-ride fuelling needed
 * - MODERATE: 40-60g/hr for sessions >90min
 * - HIGH: 60-80g/hr
 * - VERY HIGH: 80-100g/hr (coach-prescribed)
 */
export const IN_RIDE_CARBS_BY_CATEGORY: Record<FuelCategory, number> = {
  REST: 0,
  LOW: 0,
  LOW_MODERATE: 0,
  MODERATE: 50,
  MODERATE_HIGH: 60,
  HIGH: 70,
  VERY_HIGH: 100,
};

/* ------------------------------------------------------------------ */
/*  Session Templates                                                  */
/* ------------------------------------------------------------------ */

export const SESSION_TEMPLATES: SessionTemplate[] = [
  // --- REST ---
  {
    id: 'recovery_day',
    name: 'Recovery Day',
    baseDurationMin: 0,
    typicalIF: 0,
    fuelCategory: 'REST',
    description: 'Rest day — off the bike.',
    suggestedInRideCarbsGPerHr: 0,
  },

  // --- LOW ---
  {
    id: 'z2_endurance_short',
    name: 'Z2 Endurance Ride (≤75min)',
    baseDurationMin: 60,
    typicalIF: 0.64,
    fuelCategory: 'LOW',
    description:
      'Ride at zone 2 heart rate — conversational pace (RPE 4/10). The backbone of aerobic development.',
    suggestedInRideCarbsGPerHr: 0,
  },
  {
    id: 'high_cadence_set',
    name: 'High Cadence Set',
    baseDurationMin: 72,
    typicalIF: 0.56,
    fuelCategory: 'LOW',
    description:
      'Turbo. High cadence set at high Z2/low Z3: progressive cadence ramps (80→110→80 rpm). 2 sets with recovery.',
    suggestedInRideCarbsGPerHr: 0,
  },

  // --- LOW-MODERATE ---
  {
    id: 'mixed_cadence_spin',
    name: 'Mixed Cadence Endurance Spin',
    baseDurationMin: 80,
    typicalIF: 0.61,
    fuelCategory: 'LOW_MODERATE',
    description:
      'Endurance ride with cadence variation: 4×2 min high cadence, 3×20s sprints, 10 min climb effort.',
    suggestedInRideCarbsGPerHr: 0,
  },
  {
    id: 'z2_endurance_long',
    name: 'Z2 Endurance Ride (>75min)',
    baseDurationMin: 90,
    typicalIF: 0.64,
    fuelCategory: 'LOW_MODERATE',
    description:
      'Extended zone 2 ride — conversational pace. Longer duration warrants some in-ride fuelling.',
    suggestedInRideCarbsGPerHr: 0,
  },
  {
    id: 'high_low_cadence_turbo',
    name: 'High/Low Cadence Turbo',
    baseDurationMin: 70,
    typicalIF: 0.68,
    fuelCategory: 'LOW_MODERATE',
    description:
      '6×2 min alternating high/low cadence, 3×20s sprints, 2 min low cadence, 5 min climb effort.',
    suggestedInRideCarbsGPerHr: 0,
  },
  {
    id: 'pre_race_day',
    name: 'Pre Race Day',
    baseDurationMin: 57,
    typicalIF: 0.7,
    fuelCategory: 'LOW_MODERATE',
    description:
      'Short opener: 3×30s all-out, 3×1 min Z5. Sharpens the legs for race day.',
    suggestedInRideCarbsGPerHr: 0,
  },
  {
    id: 'mixed_cadence_turbo',
    name: 'Mixed Cadence Endurance Turbo',
    baseDurationMin: 95,
    typicalIF: 0.62,
    fuelCategory: 'LOW_MODERATE',
    description: 'Z2 base with cadence variation work on the turbo.',
    suggestedInRideCarbsGPerHr: 0,
  },

  // --- MODERATE ---
  {
    id: 'endurance_micro_sprints',
    name: 'Endurance w Micro Sprints',
    baseDurationMin: 180,
    typicalIF: 0.57,
    fuelCategory: 'MODERATE',
    description:
      'Long ride: 2.5 hrs Z2 with 4×6s sprints at 30 min and before cooldown. Fuelling and hydration essential.',
    suggestedInRideCarbsGPerHr: 50,
  },
  {
    id: 'aero_dev_tempo_strength',
    name: 'Aerobic Development — Tempo + Strength',
    baseDurationMin: 135,
    typicalIF: 0.63,
    fuelCategory: 'MODERATE',
    description:
      'Base endurance with 2 short tempo efforts (75-85 rpm) and 2 sets of power starts (flat terrain, high gear, OOS).',
    suggestedInRideCarbsGPerHr: 50,
  },

  // --- MODERATE-HIGH ---
  {
    id: 'aero_threshold_ramps',
    name: 'Aerobic to Threshold Ramps',
    baseDurationMin: 85,
    typicalIF: 0.76,
    fuelCategory: 'MODERATE_HIGH',
    description:
      '3 blocks of ramp-style efforts starting at Z2 and finishing at threshold. Eat and drink appropriately.',
    suggestedInRideCarbsGPerHr: 60,
  },
  {
    id: '4x5_threshold',
    name: '4×5 min Threshold',
    baseDurationMin: 90,
    typicalIF: 0.74,
    fuelCategory: 'MODERATE_HIGH',
    description: 'Threshold intervals: 4×5 min at FTP with recovery.',
    suggestedInRideCarbsGPerHr: 60,
  },
  {
    id: 'race_tuneup',
    name: 'Race Pre-Race Classic Tuneup',
    baseDurationMin: 119,
    typicalIF: 0.82,
    fuelCategory: 'MODERATE_HIGH',
    description:
      'Tuneup to prepare muscles and cardiovascular system for upcoming race. Short, hard intervals.',
    suggestedInRideCarbsGPerHr: 60,
  },
  {
    id: 'taper_reps',
    name: 'Taper Reps at Race Effort',
    baseDurationMin: 76,
    typicalIF: 0.75,
    fuelCategory: 'MODERATE_HIGH',
    description:
      'Activation + race surges + sprint prep. Low volume but high-quality race-specific sharpening.',
    suggestedInRideCarbsGPerHr: 60,
  },

  // --- HIGH ---
  {
    id: '30s_sprints',
    name: '30s Sprints',
    baseDurationMin: 64,
    typicalIF: 1.05,
    fuelCategory: 'HIGH',
    description:
      'Z2 base with Z4 activation, then 5×30s full gas sprints (3 OOS, 2 seated) with 4:30 recovery.',
    suggestedInRideCarbsGPerHr: 70,
  },
  {
    id: '20_30_40_vo2',
    name: '20/30/40 VO2',
    baseDurationMin: 58,
    typicalIF: 0.95,
    fuelCategory: 'HIGH',
    description:
      '2 sets of: (20s on/40s off, 30s on/30s off, 40s on/20s off) ×3. Pretty all-out session.',
    suggestedInRideCarbsGPerHr: 70,
  },
  {
    id: '5x2_vo2',
    name: '5×2 min VO2',
    baseDurationMin: 50,
    typicalIF: 0.74,
    fuelCategory: 'HIGH',
    description:
      'Tough block of efforts. If outdoors, complete on a hill. Get out of the saddle.',
    suggestedInRideCarbsGPerHr: 70,
  },
  {
    id: '4x8_threshold',
    name: '4×8 min Threshold',
    baseDurationMin: 112,
    typicalIF: 0.8,
    fuelCategory: 'HIGH',
    description:
      '4×8 min efforts with 5 min recoveries, +5% each rep (90→95→100→105% FTP). Max fuelling today.',
    suggestedInRideCarbsGPerHr: 70,
  },
  {
    id: '2x15_threshold',
    name: '2×15 min Threshold',
    baseDurationMin: 106,
    typicalIF: 0.76,
    fuelCategory: 'HIGH',
    description:
      'Z4 activation, then 2×15 min at threshold with 5 min recovery between.',
    suggestedInRideCarbsGPerHr: 70,
  },
  {
    id: 'race_start_prep',
    name: 'Race Start Prep',
    baseDurationMin: 95,
    typicalIF: 0.9,
    fuelCategory: 'HIGH',
    description:
      '4×(2 min at 125% FTP, 3 min at 85%) → 25 min at 95% FTP → low cadence finish.',
    suggestedInRideCarbsGPerHr: 70,
  },
  {
    id: 'breakaway_over_unders',
    name: 'Breakaway Over/Unders',
    baseDurationMin: 95,
    typicalIF: 0.87,
    fuelCategory: 'HIGH',
    description:
      '4×(4 min at 105% FTP, 4 min at 90%) → 6×(20s at 150%, 2 min at 75%). Race-specific intensity.',
    suggestedInRideCarbsGPerHr: 70,
  },

  // --- VERY HIGH ---
  {
    id: 'sprint_maintain_sprint',
    name: 'Sprint-Maintain-Sprint 40/20',
    baseDurationMin: 86,
    typicalIF: 0.93,
    fuelCategory: 'VERY_HIGH',
    description:
      'Sprint → 1 min threshold → sprint → 4 min all-out 40/20s. 3 sets. "Eat as many carbs as you possibly can today — 100g/hr."',
    suggestedInRideCarbsGPerHr: 100,
  },
];

/**
 * Look up a session template by ID.
 */
export function getSessionTemplate(
  id: string,
): SessionTemplate | undefined {
  return SESSION_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get all session templates for a given fuel category.
 */
export function getSessionsByCategory(
  category: FuelCategory,
): SessionTemplate[] {
  return SESSION_TEMPLATES.filter((t) => t.fuelCategory === category);
}
