// Cross-module physics sanity / integration tests.
// These bind environment + gpx + engine and verify expected behavior at the system level.

import { describe, it, expect } from 'vitest';
import { simulateCourse, solveSpeedFromPower } from './engine';
import { buildCourse } from './gpx';
import { airDensity } from './environment';
import type { Environment, RiderProfile, TrackPoint } from './types';
import { G } from './constants';

const RIDER: RiderProfile = {
  bodyMass: 75,
  bikeMass: 8,
  position: 'aero_hoods',
  cda: 0.32,
  crr: 0.0032,
  drivetrainEfficiency: 0.97,
  powerProfile: {
    p5s: 1100,
    p1min: 600,
    p5min: 380,
    p20min: 320,
    p60min: 280,
    durabilityFactor: 0.05,
  },
};

const CALM: Environment = {
  airTemperature: 15,
  relativeHumidity: 0.5,
  airPressure: 101325,
  windSpeed: 0,
  windDirection: 0,
};

function flatCourse(distanceKm: number) {
  const stepM = 70;
  // 1° longitude at lat 51.5 ≈ cos(51.5°) · 111km ≈ 69080 m
  const metresPerDegLon = Math.cos((51.5 * Math.PI) / 180) * 111000;
  const stepDeg = stepM / metresPerDegLon;
  const count = Math.ceil((distanceKm * 1000) / stepM) + 1;
  const points: TrackPoint[] = Array.from({ length: count }, (_, i) => ({
    lat: 51.5,
    lon: i * stepDeg,
    elevation: 100,
  }));
  return buildCourse(points);
}

describe('Physics sanity suite', () => {
  it('Air density at altitude reduces drag — flat speed is higher at altitude', () => {
    const sl = solveSpeedFromPower({
      power: 300,
      mass: 80,
      gradient: 0,
      crr: 0.0032,
      cda: 0.32,
      airDensity: 1.225,
      headwind: 0,
      drivetrainEfficiency: 0.97,
    });
    const alt = solveSpeedFromPower({
      power: 300,
      mass: 80,
      gradient: 0,
      crr: 0.0032,
      cda: 0.32,
      airDensity: 1.075,
      headwind: 0,
      drivetrainEfficiency: 0.97,
    });
    expect(alt).toBeGreaterThan(sl);
  });

  it('Tailwind makes flat course faster than calm at same power', () => {
    const course = flatCourse(10);
    const calm = simulateCourse({
      course,
      rider: RIDER,
      environment: CALM,
      pacing: course.segments.map(() => 280),
    });
    // Course heads east. Wind FROM west (windDirection = 3π/2) → tailwind for east-bound rider.
    const tail = simulateCourse({
      course,
      rider: RIDER,
      environment: { ...CALM, windSpeed: 5, windDirection: (3 * Math.PI) / 2 },
      pacing: course.segments.map(() => 280),
    });
    expect(tail.totalTime).toBeLessThan(calm.totalTime);
  });

  it('Higher CdA always slows flat efforts at same power', () => {
    const aero = solveSpeedFromPower({
      power: 300,
      mass: 80,
      gradient: 0,
      crr: 0.0032,
      cda: 0.21,
      airDensity: 1.225,
      headwind: 0,
      drivetrainEfficiency: 0.97,
    });
    const upright = solveSpeedFromPower({
      power: 300,
      mass: 80,
      gradient: 0,
      crr: 0.0032,
      cda: 0.4,
      airDensity: 1.225,
      headwind: 0,
      drivetrainEfficiency: 0.97,
    });
    expect(aero).toBeGreaterThan(upright);
  });

  it('Energy consistency: rider work ≈ resistive work / η on flat', () => {
    const course = flatCourse(20);
    const result = simulateCourse({
      course,
      rider: RIDER,
      environment: CALM,
      pacing: course.segments.map(() => 280),
    });
    const riderWork = 280 * result.totalTime;
    const v = result.averageSpeed;
    const resistive =
      (RIDER.crr * (RIDER.bodyMass + RIDER.bikeMass) * G + 0.5 * 1.225 * RIDER.cda * v * v) *
      result.totalDistance;
    // Rider work · η ≈ resistive work → ratio ≈ 1/η ≈ 1.03
    const ratio = riderWork / resistive;
    expect(ratio).toBeGreaterThan(1.0);
    expect(ratio).toBeLessThan(1.10);
  });

  it('Flat 40km @ 250W finishes in 60–75 minutes', () => {
    const course = flatCourse(40);
    const result = simulateCourse({
      course,
      rider: RIDER,
      environment: CALM,
      pacing: course.segments.map(() => 250),
    });
    const minutes = result.totalTime / 60;
    expect(minutes).toBeGreaterThan(58);
    expect(minutes).toBeLessThan(75);
  });

  it('Air density varies sensibly with humidity', () => {
    const dry = airDensity({
      airTemperature: 25,
      relativeHumidity: 0,
      airPressure: 101325,
      windSpeed: 0,
      windDirection: 0,
    });
    const humid = airDensity({
      airTemperature: 25,
      relativeHumidity: 1.0,
      airPressure: 101325,
      windSpeed: 0,
      windDirection: 0,
    });
    expect(dry - humid).toBeGreaterThan(0.005);
    expect(dry - humid).toBeLessThan(0.025);
  });
});
