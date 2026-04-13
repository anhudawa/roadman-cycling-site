import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface LoadedTranscript {
  slug: string;
  title: string;
  pillar: string;
  keywords: string[];
  transcript: string;
  episodeNumber?: number;
  guest?: string;
  type?: string;
  duration?: string;
}

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");

let cache: LoadedTranscript[] | null = null;

/**
 * Load all podcast episodes that have transcripts.
 * Results are cached for reuse across multiple calls.
 */
export function loadTranscripts(): LoadedTranscript[] {
  if (cache) return cache;

  const files = fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"));
  const results: LoadedTranscript[] = [];

  for (const file of files) {
    const filePath = path.join(PODCAST_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    if (!data.transcript || typeof data.transcript !== "string" || data.transcript.length < 100) {
      continue;
    }

    results.push({
      slug: file.replace(/\.mdx$/, ""),
      title: data.title || "",
      pillar: data.pillar || "",
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      transcript: data.transcript,
      episodeNumber: data.episodeNumber,
      guest: data.guest,
      type: data.type,
      duration: data.duration,
    });
  }

  cache = results;
  console.log(`📚 Loaded ${results.length} episodes with transcripts`);
  return results;
}

/**
 * Get transcripts filtered by pillar
 */
export function getTranscriptsByPillar(pillar: string): LoadedTranscript[] {
  return loadTranscripts().filter((t) => t.pillar === pillar);
}

/**
 * Get transcripts matching keywords (any match)
 */
export function getTranscriptsByKeywords(keywords: string[]): LoadedTranscript[] {
  const lowerKws = keywords.map((k) => k.toLowerCase());
  return loadTranscripts().filter((t) => {
    const text = `${t.title} ${t.keywords.join(" ")}`.toLowerCase();
    return lowerKws.some((kw) => text.includes(kw));
  });
}

/**
 * Clear the cache (for testing)
 */
export function clearCache(): void {
  cache = null;
}
