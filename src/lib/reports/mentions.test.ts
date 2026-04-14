// src/lib/reports/mentions.test.ts
import { describe, it, expect } from 'vitest';
import { findMentions } from './mentions';

describe('findMentions', () => {
  it('returns empty array for empty transcript', () => {
    expect(findMentions('', ['SRAM'])).toEqual([]);
  });

  it('returns empty array for no aliases', () => {
    expect(findMentions('We love SRAM components.', [])).toEqual([]);
  });

  it('matches a single alias case-insensitively', () => {
    const result = findMentions('I ride sram every day.', ['SRAM']);
    expect(result).toHaveLength(1);
    expect(result[0].alias).toBe('SRAM');
    expect(result[0].charIndex).toBe(7);
  });

  it('respects word boundaries', () => {
    // should NOT match 'sramble' (contains sram as substring)
    const result = findMentions('He srambled the code.', ['SRAM']);
    expect(result).toHaveLength(0);
  });

  it('matches multi-word aliases', () => {
    const result = findMentions('Training Peaks is excellent.', ['Training Peaks']);
    expect(result).toHaveLength(1);
    expect(result[0].alias).toBe('Training Peaks');
  });

  it('matches multiple aliases for the same brand', () => {
    const result = findMentions(
      'We use SRAM groupsets. Shram is reliable.',
      ['SRAM', 'Shram'],
    );
    expect(result).toHaveLength(2);
  });

  it('returns quote with surrounding context (~10-15 words)', () => {
    const transcript =
      'The weather was great. I used SRAM gears on the climb today. It was amazing.';
    const result = findMentions(transcript, ['SRAM']);
    expect(result[0].quote).toContain('SRAM');
    expect(result[0].quote.split(/\s+/).length).toBeLessThanOrEqual(20);
    expect(result[0].quote.split(/\s+/).length).toBeGreaterThanOrEqual(5);
  });

  it('returns mentions in order of appearance', () => {
    const result = findMentions(
      'Bikmo is cheap. Later: Bikmo insurance rocks.',
      ['Bikmo'],
    );
    expect(result).toHaveLength(2);
    expect(result[0].charIndex).toBeLessThan(result[1].charIndex);
  });

  it('timestamp field defaults to 0 (filled by caller)', () => {
    const result = findMentions('SRAM.', ['SRAM']);
    expect(result[0].timestampSeconds).toBe(0);
  });
});
