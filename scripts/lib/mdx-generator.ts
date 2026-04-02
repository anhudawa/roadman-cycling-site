import matter from "gray-matter";
import fs from "fs";
import path from "path";
import { type YouTubeVideo } from "./youtube-api.js";
import {
  isoDurationToReadable,
  generateSlug,
  extractKeywords,
  formatDate,
  truncate,
} from "./utils.js";
import {
  extractGuest,
  classifyPillar,
  classifyType,
} from "./classifier.js";

const CONTENT_DIR = path.join(process.cwd(), "content/podcast");

interface GenerateOptions {
  video: YouTubeVideo;
  episodeNumber: number;
  aiContent?: {
    intro: string;
    keyTakeaways: string[];
    quotes: string[];
  } | null;
}

/**
 * Generate an MDX file for a podcast episode
 */
export function generateMdx(options: GenerateOptions): {
  slug: string;
  filePath: string;
  content: string;
} {
  const { video, episodeNumber, aiContent } = options;

  const guest = extractGuest(video.title, video.description);
  const pillar = classifyPillar(video.title, video.description, video.tags);
  const type = classifyType(video.title, video.description);
  const keywords = extractKeywords(video.title, video.tags, guest);
  const slug = generateSlug(episodeNumber, video.title);

  // Clean title — remove episode number prefix if present
  const cleanTitle = video.title
    .replace(/^(?:EP?|Episode|#)\s*\d+\s*[:\-–—|]\s*/i, "")
    .trim();

  // Build frontmatter
  const frontmatter: Record<string, unknown> = {
    title: cleanTitle,
    episodeNumber,
    ...(guest && { guest }),
    description: truncate(video.description.split("\n")[0], 300),
    publishDate: formatDate(video.publishedAt),
    duration: isoDurationToReadable(video.duration),
    youtubeId: video.videoId,
    pillar,
    type,
    keywords,
    seoDescription: truncate(
      video.description.split("\n")[0] || cleanTitle,
      155
    ),
  };

  // Build body
  let body: string;

  if (aiContent) {
    // AI-enriched content
    const takeaways = aiContent.keyTakeaways
      .map((t) => `- ${t}`)
      .join("\n");
    const quotes = aiContent.quotes
      .map((q) => `> "${q}"`)
      .join("\n\n");

    body = `${aiContent.intro}

## Key Takeaways

${takeaways}

## Expert Quotes

${quotes}
`;
  } else {
    // Metadata-only fallback — use YouTube description
    const descLines = video.description.split("\n").filter((l) => l.trim());
    const descBody = descLines.slice(0, 5).join("\n\n");

    body = `${descBody || cleanTitle}

<!-- transcript-unavailable: AI enrichment pending -->
`;
  }

  // Combine with gray-matter
  const content = matter.stringify(body, frontmatter);

  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);

  return { slug, filePath, content };
}

/**
 * Write an MDX file atomically (write to .tmp then rename)
 */
export function writeMdxFile(filePath: string, content: string): void {
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tmpPath = filePath + ".tmp";
  fs.writeFileSync(tmpPath, content, "utf-8");
  fs.renameSync(tmpPath, filePath);
}

/**
 * Check if a video ID already has an MDX file
 */
export function videoAlreadyExists(videoId: string): boolean {
  if (!fs.existsSync(CONTENT_DIR)) return false;

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    if (data.youtubeId === videoId) {
      return true;
    }
  }

  return false;
}
