import fs from "fs";
import path from "path";
import { createPool } from "@vercel/postgres";
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

  // Quote card PNGs are already written by the renderer $€” just track paths
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

/**
 * Write repurposed content to the Postgres database.
 * Upserts the episode record and inserts content rows.
 * On re-run (--force), deletes existing content rows then re-inserts.
 * Errors are logged but do not crash the pipeline.
 */
export async function writeToDatabase(
  episodeSlug: string,
  episodeTitle: string,
  episodeNumber: number,
  pillar: string,
  result: RepurposeResult
): Promise<void> {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.warn("   $š  POSTGRES_URL not set $€” skipping database write");
    return;
  }

  const pool = createPool({ connectionString });

  try {
    // Upsert episode row
    const episodeResult = await pool.query(
      `INSERT INTO repurposed_episodes
         (episode_slug, episode_title, episode_number, pillar, status, generated_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW(), NOW())
       ON CONFLICT (episode_slug) DO UPDATE SET
         episode_title  = EXCLUDED.episode_title,
         episode_number = EXCLUDED.episode_number,
         pillar         = EXCLUDED.pillar,
         generated_at   = NOW(),
         updated_at     = NOW()
       RETURNING id`,
      [episodeSlug, episodeTitle, episodeNumber, pillar]
    );

    const episodeId: number = episodeResult.rows[0].id;

    // Delete existing content rows (handles --force re-runs)
    await pool.query(
      `DELETE FROM repurposed_content WHERE episode_id = $1`,
      [episodeId]
    );

    // Collect content rows to insert
    const rows: Array<{ contentType: string; content: string }> = [];

    if (result.blog) {
      rows.push({ contentType: "blog", content: result.blog.mdxContent });
    }

    if (result.social) {
      rows.push({ contentType: "twitter", content: JSON.stringify(result.social.twitter) });
      rows.push({ contentType: "instagram", content: JSON.stringify(result.social.instagram) });
      rows.push({ contentType: "linkedin", content: JSON.stringify(result.social.linkedin) });
      rows.push({ contentType: "facebook", content: JSON.stringify(result.social.facebook) });
    }

    if (result.quotes) {
      for (const quote of result.quotes.extracted) {
        rows.push({ contentType: "quote-card", content: JSON.stringify(quote) });
      }
    }

    // Insert each content row
    for (const { contentType, content } of rows) {
      await pool.query(
        `INSERT INTO repurposed_content
           (episode_id, content_type, content, status, version, created_at, updated_at)
         VALUES ($1, $2, $3, 'pending', 1, NOW(), NOW())`,
        [episodeId, contentType, content]
      );
    }

    console.log(`   ðŸ’¾ DB: wrote ${rows.length} content rows for episode ${episodeId}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`   $š  DB write failed (non-fatal): ${msg}`);
  } finally {
    await pool.end();
  }
}
