import { YoutubeTranscript } from "youtube-transcript";

/**
 * Fetch and clean a YouTube video transcript
 */
export async function fetchTranscript(
  videoId: string
): Promise<string | null> {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);

    if (!segments || segments.length === 0) {
      return null;
    }

    // Join all segments
    let text = segments.map((s) => s.text).join(" ");

    // Clean up auto-caption artifacts
    text = text
      .replace(/\[Music\]/gi, "")
      .replace(/\[Applause\]/gi, "")
      .replace(/\[Laughter\]/gi, "")
      .replace(/\[inaudible\]/gi, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();

    return text;
  } catch (error) {
    // Transcript not available for this video
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("disabled") || msg.includes("not available")) {
      return null;
    }
    console.warn(`  ⚠ Transcript fetch failed for ${videoId}: ${msg}`);
    return null;
  }
}

/**
 * Truncate transcript for AI processing (keep first ~8000 words)
 */
export function truncateTranscript(
  transcript: string,
  maxWords: number = 8000
): string {
  const words = transcript.split(/\s+/);
  if (words.length <= maxWords) return transcript;
  return words.slice(0, maxWords).join(" ") + "...";
}
