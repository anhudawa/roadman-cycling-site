// src/lib/reports/downloads.test.ts
import { describe, it, expect } from 'vitest';
import { deterministicDownloadNumber } from './downloads';

describe('deterministicDownloadNumber', () => {
  it('returns the same number for the same id', () => {
    expect(deterministicDownloadNumber('ep-147')).toBe(
      deterministicDownloadNumber('ep-147'),
    );
  });

  it('returns a value within [70000, 150000]', () => {
    for (const id of ['a', 'ep-1', 'ep-200', 'some-long-slug-here', 'x']) {
      const n = deterministicDownloadNumber(id);
      expect(n).toBeGreaterThanOrEqual(70000);
      expect(n).toBeLessThanOrEqual(150000);
    }
  });

  it('produces different numbers for different ids (most of the time)', () => {
    const sample = new Set(
      Array.from({ length: 20 }, (_, i) => deterministicDownloadNumber(`ep-${i}`)),
    );
    // Expect at least 18 distinct values out of 20
    expect(sample.size).toBeGreaterThanOrEqual(18);
  });
});
