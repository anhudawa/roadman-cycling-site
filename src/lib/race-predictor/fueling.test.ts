import { describe, it, expect } from 'vitest';
import { planFuelling, type FuellingInput } from './fueling';

// A solid 1-hour threshold-ish effort: NP just below FTP, temperate weather.
const ONE_HOUR_THRESHOLD: FuellingInput = {
  durationS: 3600,
  normalizedPowerW: 225, // IF 0.90
  ftpW: 250,
  bodyMassKg: 70,
  airTemperatureC: 20,
};

describe('planFuelling — carbohydrate model', () => {
  it('a ~1 h tempo/threshold effort lands near the 60 g/h anchor', () => {
    const plan = planFuelling(ONE_HOUR_THRESHOLD);
    // IF 0.90 at 1 h sits right on the documented single-transportable target.
    expect(plan.carbsPerHourG).toBeGreaterThanOrEqual(55);
    expect(plan.carbsPerHourG).toBeLessThanOrEqual(65);
  });

  it('a 6 h hard effort pushes toward the 90+ g/h ceiling', () => {
    const plan = planFuelling({
      ...ONE_HOUR_THRESHOLD,
      durationS: 6 * 3600,
      normalizedPowerW: 212.5, // IF 0.85, sustained
    });
    expect(plan.carbsPerHourG).toBeGreaterThanOrEqual(90);
    expect(plan.carbsPerHourG).toBeLessThanOrEqual(120);
  });

  it('never exceeds the 120 g/h physiological ceiling, even maxed out', () => {
    const plan = planFuelling({
      ...ONE_HOUR_THRESHOLD,
      durationS: 12 * 3600,
      normalizedPowerW: 300, // IF 1.2, absurd but clamps cleanly
    });
    expect(plan.carbsPerHourG).toBeLessThanOrEqual(120);
  });

  it('short, easy spins stay low (top-up, not force-feed)', () => {
    const plan = planFuelling({
      ...ONE_HOUR_THRESHOLD,
      durationS: 1800, // 30 min
      normalizedPowerW: 150, // IF 0.60, easy
    });
    expect(plan.carbsPerHourG).toBeLessThanOrEqual(45);
    expect(plan.carbsPerHourG).toBeGreaterThanOrEqual(30);
  });

  it('a long EASY ride needs less per hour than a long HARD ride', () => {
    const base = { ...ONE_HOUR_THRESHOLD, durationS: 6 * 3600, ftpW: 250 };
    const easy = planFuelling({ ...base, normalizedPowerW: 150 }); // IF 0.60
    const hard = planFuelling({ ...base, normalizedPowerW: 237.5 }); // IF 0.95
    expect(hard.carbsPerHourG).toBeGreaterThan(easy.carbsPerHourG);
  });

  it('a SHORT hard ride needs less per hour than a LONG hard ride', () => {
    const short = planFuelling({ ...ONE_HOUR_THRESHOLD, normalizedPowerW: 237.5 });
    const long = planFuelling({
      ...ONE_HOUR_THRESHOLD,
      durationS: 6 * 3600,
      normalizedPowerW: 237.5,
    });
    expect(long.carbsPerHourG).toBeGreaterThan(short.carbsPerHourG);
  });
});

describe('planFuelling — fluid & temperature', () => {
  it('uses the ~500 ml/h baseline at the temperate reference', () => {
    const plan = planFuelling(ONE_HOUR_THRESHOLD); // 20 °C
    expect(plan.fluidPerHourMl).toBe(500);
  });

  it('hot weather (35 °C) yields materially more fluid than cool (10 °C)', () => {
    const cool = planFuelling({ ...ONE_HOUR_THRESHOLD, airTemperatureC: 10 });
    const hot = planFuelling({ ...ONE_HOUR_THRESHOLD, airTemperatureC: 35 });
    expect(hot.fluidPerHourMl).toBeGreaterThan(cool.fluidPerHourMl);
    // 35 °C is +15 over reference → +300 ml → 800; 10 °C is −10 → 300, floored to 350.
    expect(hot.fluidPerHourMl).toBe(800);
    expect(cool.fluidPerHourMl).toBe(350);
    expect(hot.fluidPerHourMl - cool.fluidPerHourMl).toBeGreaterThanOrEqual(300);
  });

  it('never recommends more fluid than the gut can take (1000 ml/h cap)', () => {
    const plan = planFuelling({ ...ONE_HOUR_THRESHOLD, airTemperatureC: 50 });
    expect(plan.fluidPerHourMl).toBeLessThanOrEqual(1000);
  });

  it('cold days still hold the 350 ml/h floor', () => {
    const plan = planFuelling({ ...ONE_HOUR_THRESHOLD, airTemperatureC: -5 });
    expect(plan.fluidPerHourMl).toBe(350);
  });
});

describe('planFuelling — sodium', () => {
  it('sodium per hour follows the fluid rate and concentration band', () => {
    // 20 °C → 500 ml/h × 400 mg/L = 200 mg/h.
    const plan = planFuelling(ONE_HOUR_THRESHOLD);
    expect(plan.sodiumPerHourMg).toBe(200);
  });

  it('hot day means saltier, heavier sweat → more sodium per hour', () => {
    const cool = planFuelling({ ...ONE_HOUR_THRESHOLD, airTemperatureC: 10 });
    const hot = planFuelling({ ...ONE_HOUR_THRESHOLD, airTemperatureC: 35 });
    // 35 °C → 800 ml/h × 800 mg/L = 640 mg/h.
    expect(hot.sodiumPerHourMg).toBe(640);
    expect(hot.sodiumPerHourMg).toBeGreaterThan(cool.sodiumPerHourMg);
  });
});

describe('planFuelling — totals integrate the per-hour plan', () => {
  it('totals equal per-hour rate integrated over duration', () => {
    const plan = planFuelling({ ...ONE_HOUR_THRESHOLD, durationS: 3 * 3600 });
    expect(plan.totalCarbsG).toBe(plan.carbsPerHourG * 3);
    expect(plan.totalFluidMl).toBe(plan.fluidPerHourMl * 3);
    expect(plan.totalSodiumMg).toBe(plan.sodiumPerHourMg * 3);
  });

  it('per-hour entries sum (within rounding) to the totals', () => {
    const plan = planFuelling({ ...ONE_HOUR_THRESHOLD, durationS: 3.5 * 3600 });
    const carbSum = plan.perHour.reduce((s, h) => s + h.carbsG, 0);
    const fluidSum = plan.perHour.reduce((s, h) => s + h.fluidMl, 0);
    expect(Math.abs(carbSum - plan.totalCarbsG)).toBeLessThanOrEqual(1);
    expect(Math.abs(fluidSum - plan.totalFluidMl)).toBeLessThanOrEqual(1);
  });

  it('the final partial hour is pro-rated, not a full hour', () => {
    const plan = planFuelling({ ...ONE_HOUR_THRESHOLD, durationS: 1.5 * 3600 });
    expect(plan.perHour).toHaveLength(2);
    expect(plan.perHour[0].fluidMl).toBe(500);
    expect(plan.perHour[1].fluidMl).toBe(250); // half of the rate
  });

  it('one entry per started hour', () => {
    const plan = planFuelling({ ...ONE_HOUR_THRESHOLD, durationS: 2 * 3600 });
    expect(plan.perHour).toHaveLength(2);
    expect(plan.perHour.map((h) => h.hour)).toEqual([1, 2]);
  });
});

describe('planFuelling — caffeine note', () => {
  it('flags caffeine for long efforts, scaled to body mass (3–6 mg/kg)', () => {
    const plan = planFuelling({ ...ONE_HOUR_THRESHOLD, durationS: 2 * 3600 });
    expect(plan.caffeineNote).toBeDefined();
    // 70 kg → 210–420 mg.
    expect(plan.caffeineNote).toContain('210');
    expect(plan.caffeineNote).toContain('420');
  });

  it('omits the caffeine note for short, easy efforts', () => {
    const plan = planFuelling({
      ...ONE_HOUR_THRESHOLD,
      durationS: 2400, // 40 min
      normalizedPowerW: 150, // IF 0.60
    });
    expect(plan.caffeineNote).toBeUndefined();
  });
});

describe('planFuelling — summary', () => {
  it('mentions the per-hour carb, fluid and sodium numbers', () => {
    const plan = planFuelling(ONE_HOUR_THRESHOLD);
    expect(plan.summary).toContain(String(plan.carbsPerHourG));
    expect(plan.summary).toContain(String(plan.fluidPerHourMl));
    expect(plan.summary).toContain(String(plan.sodiumPerHourMg));
  });

  it('warns about gut training when the carb target is high', () => {
    const plan = planFuelling({
      ...ONE_HOUR_THRESHOLD,
      durationS: 6 * 3600,
      normalizedPowerW: 237.5,
    });
    expect(plan.summary.toLowerCase()).toContain('gut');
  });
});

describe('planFuelling — degenerate inputs', () => {
  it('zero duration yields a safe empty plan, no NaN or negatives', () => {
    const plan = planFuelling({ ...ONE_HOUR_THRESHOLD, durationS: 0 });
    expect(plan.totalCarbsG).toBe(0);
    expect(plan.totalFluidMl).toBe(0);
    expect(plan.totalSodiumMg).toBe(0);
    expect(plan.perHour).toEqual([]);
    expect(plan.summary.length).toBeGreaterThan(0);
  });

  it('negative duration is treated as no effort', () => {
    const plan = planFuelling({ ...ONE_HOUR_THRESHOLD, durationS: -3600 });
    expect(plan.totalCarbsG).toBe(0);
    expect(plan.perHour).toEqual([]);
  });

  it('missing/zero FTP does not blow up the carb math', () => {
    const plan = planFuelling({ ...ONE_HOUR_THRESHOLD, ftpW: 0 });
    expect(Number.isFinite(plan.carbsPerHourG)).toBe(true);
    expect(plan.carbsPerHourG).toBeGreaterThanOrEqual(30);
    expect(plan.carbsPerHourG).toBeLessThanOrEqual(120);
  });

  it('non-finite inputs degrade gracefully (no NaN anywhere)', () => {
    const plan = planFuelling({
      durationS: Number.NaN,
      normalizedPowerW: Number.NaN,
      ftpW: Number.NaN,
      bodyMassKg: Number.NaN,
      airTemperatureC: Number.NaN,
    });
    for (const v of [
      plan.carbsPerHourG,
      plan.totalCarbsG,
      plan.fluidPerHourMl,
      plan.totalFluidMl,
      plan.sodiumPerHourMg,
      plan.totalSodiumMg,
    ]) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it('all outputs stay within sane physiological bounds for a normal effort', () => {
    const plan = planFuelling(ONE_HOUR_THRESHOLD);
    expect(plan.carbsPerHourG).toBeGreaterThanOrEqual(30);
    expect(plan.carbsPerHourG).toBeLessThanOrEqual(120);
    expect(plan.fluidPerHourMl).toBeGreaterThanOrEqual(350);
    expect(plan.fluidPerHourMl).toBeLessThanOrEqual(1000);
    expect(plan.sodiumPerHourMg).toBeGreaterThanOrEqual(0);
    expect(plan.sodiumPerHourMg).toBeLessThanOrEqual(800);
  });
});
