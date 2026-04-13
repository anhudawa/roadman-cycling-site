import { type LoadedTranscript, getTranscriptsByPillar, getTranscriptsByKeywords } from "./transcript-loader.js";

/**
 * Extract the most voice-rich passage from a transcript.
 * Avoids intros, sponsor reads, and outros.
 */
function extractVoicePassage(transcript: string, targetWords: number = 250): string {
  const sentences = transcript.split(/(?<=[.!?])\s+/);

  // Skip first ~10% (intros, sponsor reads) and last ~5% (outros)
  const startIdx = Math.floor(sentences.length * 0.1);
  const endIdx = Math.floor(sentences.length * 0.95);
  const body = sentences.slice(startIdx, endIdx);

  // Find a passage that starts with strong voice markers
  const voiceMarkers = [
    "here's the thing",
    "what most people",
    "the mistake",
    "the problem",
    "the reason",
    "what I found",
    "what we know",
    "the science",
    "you need to",
    "you don't",
    "you're not",
    "stop doing",
    "let me",
    "I've seen",
    "I've coached",
  ];

  // Try to find a passage starting with a voice marker
  for (let i = 0; i < body.length; i++) {
    const lower = body[i].toLowerCase();
    if (voiceMarkers.some((m) => lower.includes(m))) {
      const passage = body.slice(i).join(" ");
      const words = passage.split(/\s+/);
      if (words.length >= targetWords) {
        return words.slice(0, targetWords).join(" ");
      }
    }
  }

  // Fallback: take a passage from the middle third
  const midStart = Math.floor(body.length / 3);
  const midPassage = body.slice(midStart).join(" ");
  return midPassage.split(/\s+/).slice(0, targetWords).join(" ");
}

/**
 * Select 2-3 voice example excerpts matching a pillar and optional keywords.
 * Returns diverse excerpts from different episodes.
 */
export function selectVoiceExamples(
  pillar: string,
  keywords: string[] = [],
  count: number = 2,
  wordsPerExcerpt: number = 250
): { slug: string; title: string; excerpt: string }[] {
  // Get candidates — pillar match first, then keyword matches
  let candidates = getTranscriptsByPillar(pillar);

  // If not enough pillar matches, supplement with keyword matches
  if (candidates.length < count && keywords.length > 0) {
    const keywordMatches = getTranscriptsByKeywords(keywords);
    const pillarSlugs = new Set(candidates.map((c) => c.slug));
    const extras = keywordMatches.filter((t) => !pillarSlugs.has(t.slug));
    candidates = [...candidates, ...extras];
  }

  // Sort by transcript length (longer = richer source material)
  candidates.sort((a, b) => b.transcript.length - a.transcript.length);

  // Pick diverse episodes (different titles/topics)
  const selected: LoadedTranscript[] = [];
  const usedSlugs = new Set<string>();

  for (const candidate of candidates) {
    if (selected.length >= count) break;
    if (usedSlugs.has(candidate.slug)) continue;
    usedSlugs.add(candidate.slug);
    selected.push(candidate);
  }

  return selected.map((t) => ({
    slug: t.slug,
    title: t.title,
    excerpt: extractVoicePassage(t.transcript, wordsPerExcerpt),
  }));
}
