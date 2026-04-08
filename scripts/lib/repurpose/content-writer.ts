import fs from "fs";
import path from "path";
import { type RepurposeResult } from "./types.js";

const REPURPOSED_DIR = path.join(process.cwd(), "content/repurposed");

/**
 * Write a file atomically: write to .tmp then rename.
 */
function writeFileAtomic(filePath: string, content: string | Buffer): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tmpPath = filePath + ".tmp";
  if (typeof content === "string") {
    fs.writeFileSync(tmpPath, content, "utf-8");
  } else {
    fs.writeFileSync(tmpPath, content);
  }
  fs.renameSync(tmpPath, filePath);
}

/**
 * Return the output directory path for a repurposed episode.
 * Strips any leading `ep-{N}-` prefix from slug to avoid duplication.
 */
export function getOutputDir(episodeNumber: number, slug: string): string {
  // Strip ep-{N}- prefix from slug if present to avoid duplication
  const cleanedSlug = slug.replace(new RegExp(`^ep-${episodeNumber}-`, "i"), "");
  return path.join(REPURPOSED_DIR, `ep-${episodeNumber}-${cleanedSlug}`);
}

/**
 * Check whether the output directory for an episode already exists.
 */
export function outputExists(episodeNumber: number, slug: string): boolean {
  return fs.existsSync(getOutputDir(episodeNumber, slug));
}

/**
 * Write all repurposed content files for an episode.
 *
 * @returns Array of file paths that were written (or would be written in dry-run).
 */
export function writeRepurposedContent(
  episodeNumber: number,
  slug: string,
  result: RepurposeResult,
  dryRun = false
): string[] {
  const outputDir = getOutputDir(episodeNumber, slug);
  const writtenPaths: string[] = [];

  // Collect blog file path
  if (result.blog) {
    const blogPath = path.join(outputDir, "blog-post.mdx");
    writtenPaths.push(blogPath);

    if (!dryRun) {
      writeFileAtomic(blogPath, result.blog.mdxContent);
    } else {
      console.log(`[dry-run] Would write: ${blogPath}`);
    }
  }

  // Collect social JSON file paths
  if (result.social) {
    const socialFiles: Array<{ name: string; data: unknown }> = [
      { name: "twitter-thread.json", data: result.social.twitter },
      { name: "instagram.json", data: result.social.instagram },
      { name: "linkedin.json", data: result.social.linkedin },
      { name: "facebook.json", data: result.social.facebook },
    ];

    for (const { name, data } of socialFiles) {
      const filePath = path.join(outputDir, name);
      writtenPaths.push(filePath);

      if (!dryRun) {
        writeFileAtomic(filePath, JSON.stringify(data, null, 2));
      } else {
        console.log(`[dry-run] Would write: ${filePath}`);
      }
    }
  }

  // Quote card PNGs are already written by the renderer — just track paths
  if (result.quotes) {
    for (const cardPaths of result.quotes.cardPaths) {
      writtenPaths.push(cardPaths.squarePath);
      writtenPaths.push(cardPaths.landscapePath);

      if (dryRun) {
        console.log(`[dry-run] Would track (already written): ${cardPaths.squarePath}`);
        console.log(`[dry-run] Would track (already written): ${cardPaths.landscapePath}`);
      }
    }
  }

  if (dryRun) {
    console.log(`[dry-run] Output dir would be: ${outputDir}`);
    console.log(`[dry-run] Total files: ${writtenPaths.length}`);
  }

  return writtenPaths;
}
