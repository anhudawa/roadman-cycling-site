import fs from "fs";
import path from "path";
import { createPool } from "@vercel/postgres";
import type { PipelineResult } from "../types.js";

/**
 * Publish an indexed episode to the admin dashboard DB.
 * Replaces the old git PR approach $— content goes straight into the
 * repurposed_episodes / repurposed_content tables where the existing
 * admin UI picks it up for review, chat, and approval.
 */
export async function publishToAdminDashboard(
  result: PipelineResult,
  repoRoot: string,
  dryRun: boolean
): Promise<number | null> {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.warn("  POSTGRES_URL not set $— skipping database write");
    return null;
  }

  if (dryRun) {
    console.log("\n  [dry-run] Would write to admin dashboard DB:");
    console.log(`    Episode: ${result.title} (#${result.episodeNumber})`);
    console.log(`    Cluster: ${result.cluster.primary_cluster}`);
    const pieces = ["episode-page", "episode-meta", "episode-citation"];
    if (result.blogContent) pieces.push("blog");
    if (result.socialContent) pieces.push("facebook", "linkedin", "twitter");
    console.log(`    Content pieces: ${pieces.join(", ")}`);
    console.log(`    Sacred Cow score: ${result.voiceCheck.sacred_cow_score}/7`);
    return null;
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
      [result.slug, result.title, result.episodeNumber, result.cluster.primary_cluster]
    );

    const episodeId: number = episodeResult.rows[0].id;

    // Delete existing content rows for this episode (handles re-runs)
    await pool.query(
      `DELETE FROM repurposed_content WHERE episode_id = $1`,
      [episodeId]
    );

    // Build content rows
    const rows: Array<{ contentType: string; content: string }> = [];

    // Episode page $— the lede + key takeaways (main voice content for review)
    rows.push({
      contentType: "episode-page",
      content: `${result.content.lede}\n\n## Key Takeaways\n\n${result.content.key_takeaways}`,
    });

    // Episode meta $— SEO title + description
    rows.push({
      contentType: "episode-meta",
      content: JSON.stringify({
        seoTitle: result.content.seo_title,
        metaDescription: result.content.meta_description,
      }),
    });

    // Episode citation $— AI citation block
    rows.push({
      contentType: "episode-citation",
      content: result.content.ai_citation_block,
    });

    // Blog post
    if (result.blogContent) {
      rows.push({
        contentType: "blog",
        content: JSON.stringify({
          title: result.blogContent.title,
          seoTitle: result.blogContent.seoTitle,
          seoDescription: result.blogContent.seoDescription,
          excerpt: result.blogContent.excerpt,
          body: result.blogContent.body,
          keywords: result.blogContent.keywords,
          relatedEpisodeSlugs: result.blogContent.relatedEpisodeSlugs,
          sourceEpisodeSlug: result.slug,
        }),
      });
    }

    // Social content $— FB, LinkedIn, Twitter/X
    if (result.socialContent) {
      rows.push({
        contentType: "facebook",
        content: JSON.stringify({
          post: result.socialContent.facebook.post,
          angle: result.socialContent.facebook.angle,
        }),
      });

      rows.push({
        contentType: "linkedin",
        content: JSON.stringify({
          post: result.socialContent.linkedin.post,
        }),
      });

      rows.push({
        contentType: "twitter",
        content: JSON.stringify({
          tweets: result.socialContent.twitter.tweets,
        }),
      });
    }

    // Insert content rows
    for (const { contentType, content } of rows) {
      await pool.query(
        `INSERT INTO repurposed_content
           (episode_id, content_type, content, status, version, created_at, updated_at)
         VALUES ($1, $2, $3, 'pending', 1, NOW(), NOW())`,
        [episodeId, contentType, content]
      );
    }

    console.log(`  DB: wrote ${rows.length} content rows for episode ${episodeId}`);
    return episodeId;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`  DB write failed: ${msg}`);
    return null;
  } finally {
    await pool.end();
  }
}

/**
 * Publish a batch of episodes (backfill mode).
 */
export async function publishBatchToAdminDashboard(
  results: PipelineResult[],
  repoRoot: string,
  dryRun: boolean
): Promise<number[]> {
  const ids: number[] = [];
  for (const result of results) {
    const id = await publishToAdminDashboard(result, repoRoot, dryRun);
    if (id) ids.push(id);
  }
  return ids;
}
