import { describe, it, expect } from 'vitest';
import {
  airDensity,
  saturationVaporPressure,
  pressureAtAltitude,
  resolveWind,
  segmentAirState,
} from './environment';

describe('saturationVaporPressure (Tetens)', () => {
  it('matches expected value at 20°C (~2.34 kPa)', () => {
    const e_s = saturationVaporPressure(20);
    expect(e_s).toBeGreaterThan(2300);
    expect(e_s).toBeLessThan(2400);
  });

  it('matches expected value at 0°C (~0.611 kPa)', () => {
    const e_s = saturationVaporPressure(0);
    expect(e_s).toBeGreaterThan(600);
    expect(e_s).toBeLessThan(625);
  });

  it('rises monotonically with temperature', () => {
    expect(saturationVaporPressure(30)).toBeGreaterThan(saturationVaporPressure(20));
    expect(saturationVaporPressure(20)).toBeGreaterThan(saturationVaporPressure(10));
  });
});

describe('airDensity', () => {
  it('returns ~1.225 kg/m³ at sea-level standard atmosphere (15°C, dry, 101325 Pa)', () => {
    const rho = airDensity({
      airTemperature: 15,
      relativeHumidity: 0,
      airPressure: 101325,
      windSpeed: 0,
      windDirection: 0,
    });
    expect(rho).toBeCloseTo(1.225, 2);
  });

  it('drops with humidity (humid air is less dense than dry)', () => {
    const dry = airDensity({
      airTemperature: 25,
      relativeHumidity: 0,
      airPressure: 101325,
      windSpeed: 0,
      windDirection: 0,
    });
    const humid = airDensity({
      airTemperature: 25,
      relativeHumidity: 0.9,
      airPressure: 101325,
      windSpeed: 0,
      windDirection: 0,
    });
    expect(humid).toBeLessThan(dry);
  });

  it('drops with temperature (warm air is less dense)', () => {
    const cold = airDensity({
      airTemperature: 0,
      relativeHumidity: 0,
      airPressure: 101325,
      windSpeed: 0,
      windDirection: 0,
    });
    const warm = airDensity({
      airTemperature: 35,
      relativeHumidity: 0,
      airPressure: 101325,
      windSpeed: 0,
      windDirection: 0,
    });
    expect(warm).toBeLessThan(cold);
  });
});

describe('pressureAtAltitude (barometric formula)', () => {
  it('returns ~89876 Pa at 1000m (≈ -11.3% from sea level)', () => {
    const p = pressureAtAltitude(1000, 15);
    expect(p / 101325).toBeGreaterThan(0.875);
    expect(p / 101325).toBeLessThan(0.895);
  });

  it('air density at 1000m drops ~10–13% from sea level', () => {
    const p1000 = pressureAtAltitude(1000, 15);
    const rhoSea = airDensity({
      airTemperature: 15,
      relativeHumidity: 0,
      airPressure: 101325,
      windSpeed: 0,
      windDirection: 0,
    });
    const rho1000 = airDensity({
      airTemperature: 15 - 6.5,
      relativeHumidity: 0,
      airPressure: p1000,
      windSpeed: 0,
      windDirection: 0,
    });
    const drop = (rhoSea - rho1000) / rhoSea;
    expect(drop).toBeGreaterThan(0.09);
    expect(drop).toBeLessThan(0.13);
  });
});

describe('resolveWind', () => {
  it('headwind only when blowing directly at rider', () => {
    const { headwind, crosswind } = resolveWind({
      windSpeed: 10,
      windDirection: 0,
      roadHeading: 0,
    });
    expect(headwind).toBeCloseTo(10, 5);
    expect(crosswind).toBeCloseTo(0, 5);
  });

  it('tailwind is negative headwind', () => {
    const { headwind } = resolveWind({
      windSpeed: 10,
      windDirection: Math.PI,
      roadHeading: 0,
    });
    expect(headwind).toBeCloseTo(-10, 5);
  });

  it('pure crosswind from the right', () => {
    const { headwind, crosswind } = resolveWind({
      windSpeed: 10,
      windDirection: Math.PI / 2,
      roadHeading: 0,
    });
    expect(headwind).toBeCloseTo(0, 5);
    expect(crosswind).toBeCloseTo(10, 5);
  });

  it('45° quartering wind splits ~7/7', () => {
    const { headwind, crosswind } = resolveWind({
      windSpeed: 10,
      windDirection: Math.PI / 4,
      roadHeading: 0,
    });
    expect(headwind).toBeCloseTo(10 * Math.cos(Math.PI / 4), 4);
    expect(crosswind).toBeCloseTo(10 * Math.sin(Math.PI / 4), 4);
  });
});

describe('segmentAirState', () => {
  it('zero crosswind → zero yaw at any speed', () => {
    const state = segmentAirState(
      {
        airTemperature: 15,
        relativeHumidity: 0,
        airPressure: 101325,
        windSpeed: 5,
        windDirection: 0,
      },
      { roadHeading: 0, altitude: 0 },
    );
    expect(state.yawAngleAt(10)).toBeCloseTo(0, 5);
  });

  it('crosswind produces positive yaw, decreasing with rider speed', () => {
    const state = segmentAirState(
      {
        airTemperature: 15,
        relativeHumidity: 0,
        airPressure: 101325,
        windSpeed: 5,
        windDirection: Math.PI / 2,
      },
      { roadHeading: 0, altitude: 0 },
    );
    const yawSlow = state.yawAngleAt(5);
    const yawFast = state.yawAngleAt(15);
    expect(yawSlow).toBeGreaterThan(0);
    expect(yawFast).toBeGreaterThan(0);
    expect(yawFast).toBeLessThan(yawSlow);
  });

  it('altitude > 0 reduces air density', () => {
    const sea = segmentAirState(
      {
        airTemperature: 15,
        relativeHumidity: 0.5,
        airPressure: 101325,
        windSpeed: 0,
        windDirection: 0,
      },
      { roadHeading: 0, altitude: 0 },
    );
    const high = segmentAirState(
      {
        airTemperature: 15,
        relativeHumidity: 0.5,
        airPressure: 101325,
        windSpeed: 0,
        windDirection: 0,
      },
      { roadHeading: 0, altitude: 1500 },
    );
    expect(high.airDensity).toBeLessThan(sea.airDensity);
  });
});
