// src/lib/reports/mentions.ts
import type { Mention } from './types';

const QUOTE_WORDS_BEFORE = 7;
const QUOTE_WORDS_AFTER = 7;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractQuote(transcript: string, charIndex: number, aliasLength: number): string {
  // take QUOTE_WORDS_BEFORE words before and QUOTE_WORDS_AFTER words after
  const before = transcript.slice(0, charIndex).split(/\s+/).slice(-QUOTE_WORDS_BEFORE).join(' ');
  const matchedSlice = transcript.slice(charIndex, charIndex + aliasLength);
  const after = transcript
    .slice(charIndex + aliasLength)
    .split(/\s+/)
    .slice(0, QUOTE_WORDS_AFTER + 1)
    .join(' ')
    .trim();
  return `${before} ${matchedSlice}${after ? ' ' + after : ''}`.trim();
}

export function findMentions(transcript: string, aliases: string[]): Mention[] {
  if (!transcript || aliases.length === 0) return [];

  const results: Mention[] = [];

  for (const alias of aliases) {
    if (!alias.trim()) continue;
    const pattern = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'gi');
    for (const match of transcript.matchAll(pattern)) {
      const charIndex = match.index ?? 0;
      results.push({
        alias,
        charIndex,
        quote: extractQuote(transcript, charIndex, alias.length),
        timestampSeconds: 0, // filled in by caller using approximateTimestamp
      });
    }
  }

  return results.sort((a, b) => a.charIndex - b.charIndex);
}
