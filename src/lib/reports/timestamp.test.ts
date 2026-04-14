// src/lib/reports/timestamp.test.ts
import { describe, it, expect } from 'vitest';
import { approximateTimestamp, parseDurationString } from './timestamp';

describe('approximateTimestamp', () => {
  it('returns 0 at char 0', () => {
    expect(approximateTimestamp(0, 1000, 3600)).toBe(0);
  });

  it('returns duration at the last char', () => {
    expect(approximateTimestamp(1000, 1000, 3600)).toBe(3600);
  });

  it('linearly interpolates', () => {
    expect(approximateTimestamp(500, 1000, 3600)).toBe(1800);
  });

  it('returns 0 when transcript length is zero', () => {
    expect(approximateTimestamp(0, 0, 3600)).toBe(0);
  });

  it('returns 0 when duration is zero', () => {
    expect(approximateTimestamp(500, 1000, 0)).toBe(0);
  });

  it('floors to nearest integer second', () => {
    expect(approximateTimestamp(333, 1000, 100)).toBe(33);
  });
});

describe('parseDurationString', () => {
  it('parses HH:MM:SS', () => {
    expect(parseDurationString('01:02:03')).toBe(3723);
  });

  it('parses MM:SS', () => {
    expect(parseDurationString('05:30')).toBe(330);
  });

  it('parses raw seconds number string', () => {
    expect(parseDurationString('450')).toBe(450);
  });

  it('returns 0 for invalid input', () => {
    expect(parseDurationString('')).toBe(0);
    expect(parseDurationString('abc')).toBe(0);
  });
});
