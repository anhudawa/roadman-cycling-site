/**
 * Transcript processing utilities for podcast episodes.
 *
 * Roadman podcast transcripts arrive as a single unbroken block of lower-case
 * speech-to-text (no punctuation-aware paragraphs, no speaker tags, no
 * timestamps). These utilities turn that blob into semantic, indexable
 * content:
 *
 *   1. `segmentTranscript` $€” splits the full transcript into 4-10 topic-sized
 *      segments with stable slug ids + a human-readable heading derived from
 *      the segment's first sentence. Each segment becomes an H3-anchored
 *      section on the episode page, which massively expands the site's
 *      indexable long-tail surface area (310 episodes Ã— ~8 segments = ~2,400
 *      new #anchor landing targets).
 *
 *   2. `normaliseTranscriptText` $€” light cleanup so segments read as prose
 *      rather than a lowercase wall: capitalises the first letter of each
 *      segment and collapses excess whitespace. Does NOT attempt full
 *      speaker/punctuation reconstruction $€” that would require an LLM pass
 *      and we do not have one at build time.
 */

export interface TranscriptSegment {
  /** Stable slug id used as the h3 anchor (e.g. `#segment-3`). */
  id: string;
  /** 1-based segment index. */
  index: number;
  /** Human-readable heading derived from the segment's opening sentence. */
  title: string;
  /** The segment body text $€” always pre-normalised. */
  text: string;
  /** Approximate word count $€” useful for Speakable/Clip schema hints. */
  wordCount: number;
}

interface SegmentOptions {
  /** Target words per segment. Default 900 $€” balanced between segment-level rankability and per-episode anchor density. */
  targetWords?: number;
  /** Maximum segments per transcript regardless of length. Default 10. */
  maxSegments?: number;
  /** Minimum segments per transcript (pads with smaller chunks if needed). Default 3. */
  minSegments?: number;
  /** Max characters for the generated segment title. Default 70. */
  titleMaxChars?: number;
  /**
   * Optional title override for each segment, 1:1 aligned with the order of
   * segments this function emits. Typically populated by the offline
   * `scripts/generate-segment-titles.ts` pipeline which calls Claude to
   * produce human-readable chapter titles. If provided but the length does
   * not match the number of produced segments, the override is silently
   * ignored and the heuristic title is used instead $€” keeps segmentation
   * stable if chunking changes after titles were generated.
   */
  titles?: string[];
}

/**
 * Split a transcript into topic-sized segments aligned to sentence boundaries.
 * Returns between `minSegments` and `maxSegments` entries.
 */
export function segmentTranscript(
  transcript: string,
  opts: SegmentOptions = {},
): TranscriptSegment[] {
  const {
    targetWords = 900,
    maxSegments = 10,
    minSegments = 3,
    titleMaxChars = 70,
    titles,
  } = opts;

  const clean = transcript.trim();
  if (!clean) return [];

  const totalWords = countWords(clean);

  // Very short transcripts: return as a single segment.
  if (totalWords < targetWords * 1.5) {
    const body = normaliseTranscriptText(clean);
    const overrideTitle = titles && titles.length === 1 ? titles[0] : undefined;
    return [
      {
        id: "segment-1",
        index: 1,
        title: overrideTitle ?? generateSegmentTitle(body, titleMaxChars),
        text: body,
        wordCount: countWords(body),
      },
    ];
  }

  // Compute how many segments we actually want so they're evenly-sized.
  // targetWords is a floor, not a strict ceiling.
  const idealSegments = Math.ceil(totalWords / targetWords);
  const segmentCount = Math.min(
    maxSegments,
    Math.max(minSegments, idealSegments),
  );
  const wordsPerSegment = Math.ceil(totalWords / segmentCount);

  // Split by sentence so segments don't cut mid-thought. Fallback to
  // word-splitting if the transcript has no sentence punctuation at all.
  const sentences = splitIntoSentences(clean);

  const segments: TranscriptSegment[] = [];
  let currentSentences: string[] = [];
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const sentenceWords = countWords(sentence);
    currentSentences.push(sentence);
    currentWordCount += sentenceWords;

    // Flush the segment once it's at/over its target share $€” unless we've
    // already emitted the requested number of segments, in which case
    // accumulate everything remaining into the final segment.
    if (
      currentWordCount >= wordsPerSegment &&
      segments.length < segmentCount - 1
    ) {
      const body = normaliseTranscriptText(currentSentences.join(" "));
      segments.push({
        id: `segment-${segments.length + 1}`,
        index: segments.length + 1,
        title: generateSegmentTitle(body, titleMaxChars),
        text: body,
        wordCount: countWords(body),
      });
      currentSentences = [];
      currentWordCount = 0;
    }
  }

  // Final segment (anything left over).
  if (currentSentences.length > 0) {
    const body = normaliseTranscriptText(currentSentences.join(" "));
    segments.push({
      id: `segment-${segments.length + 1}`,
      index: segments.length + 1,
      title: generateSegmentTitle(body, titleMaxChars),
      text: body,
      wordCount: countWords(body),
    });
  }

  // Apply title overrides only if the provided array length matches the
  // segments we actually produced $€” otherwise the mapping is ambiguous and
  // we fall back to the heuristic titles above.
  if (titles && titles.length === segments.length) {
    return segments.map((segment, i) => ({
      ...segment,
      title: titles[i].trim() || segment.title,
    }));
  }

  return segments;
}

// Speech-to-text opener words that make auto-generated titles look terrible.
// Stripped from the start of a candidate title until a substantive word begins.
const FILLER_OPENERS = new Set([
  "uh", "um", "er", "ah", "oh", "yeah", "yep", "mhm", "mm",
  "so", "well", "and", "but", "or", "also",
  "like", "okay", "ok", "right",
  "you", "know", // matches "you know"
  "i", "mean", // matches "i mean"
  "the", "a", "an", "that", "this", "it", "its",
]);

/**
 * Derive a short heading from a segment's opening words. Used for the
 * segment's `<h3>` text and the jump-to-anchor link label.
 *
 * Transcripts come from raw Whisper speech-to-text, so the literal first
 * sentence is often a filler-word fragment ("uh you just finished$€¦",
 * "so um that's the$€¦"). We strip those fillers and, if the remaining
 * opener is still trivially short, concatenate the next sentence.
 */
export function generateSegmentTitle(
  text: string,
  maxChars = 70,
): string {
  const clean = text.trim();
  if (!clean) return "Transcript";

  // Pull the first 2$€“3 sentences as title candidates. Join short fragments
  // together so "Welcome back." doesn't become a title on its own.
  const sentences = clean
    .split(/(?<=[.!?])\s+/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  let candidate = "";
  for (const sentence of sentences) {
    candidate = candidate
      ? `${candidate} ${sentence}`.trim()
      : sentence;
    if (countMeaningfulWords(candidate) >= 5) break;
  }

  // Strip leading fillers word-by-word.
  const stripped = stripLeadingFillers(candidate);
  const source = stripped || candidate; // fall back if the entire candidate was filler
  const trimmed = source.trim().replace(/[.!?,;:]+$/, "");

  if (!trimmed) return "Transcript";

  // Capitalise first letter.
  const titleCased = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

  if (titleCased.length <= maxChars) return titleCased;

  // Truncate at the nearest word boundary before maxChars.
  const cutoff = titleCased.slice(0, maxChars);
  const lastSpace = cutoff.lastIndexOf(" ");
  const safeCut = lastSpace > maxChars * 0.6 ? cutoff.slice(0, lastSpace) : cutoff;
  return safeCut.trim() + "$€¦";
}

function stripLeadingFillers(text: string): string {
  const words = text.split(/\s+/);
  let i = 0;
  while (i < words.length) {
    const word = words[i].toLowerCase().replace(/[^a-z']/g, "");
    if (!FILLER_OPENERS.has(word)) break;
    i++;
  }
  return words.slice(i).join(" ");
}

function countMeaningfulWords(text: string): number {
  return text
    .split(/\s+/)
    .filter((w) => {
      const clean = w.toLowerCase().replace(/[^a-z']/g, "");
      return clean.length > 0 && !FILLER_OPENERS.has(clean);
    }).length;
}

/**
 * Light-touch transcript cleanup: capitalise the first letter so segment
 * openings don't read like fragments, and normalise whitespace. Strips
 * `>>` speaker-change markers that some Whisper variants emit.
 *
 * Intentionally conservative $€” we do NOT attempt speaker detection or
 * punctuation reconstruction, which would need an LLM and would risk
 * introducing errors into authoritative guest quotes.
 */
export function normaliseTranscriptText(text: string): string {
  const stripped = text.replace(/>>+/g, "").replace(/\s+/g, " ").trim();
  if (!stripped) return "";
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function splitIntoSentences(text: string): string[] {
  // Split on sentence punctuation followed by whitespace. Keep the punctuation
  // on the preceding sentence. If the transcript has NO punctuation at all
  // (raw Whisper output), fall back to splitting on long whitespace runs.
  const punctSplit = text
    .split(/(?<=[.!?])\s+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  if (punctSplit.length > 1) return punctSplit;

  // Pathological case: no sentence punctuation $€” chunk by every ~25 words
  // so segmentTranscript still has something to work with.
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  const chunkSize = 25;
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}
