/**
 * Blog sitemap import — fetches a sitemap.xml, discovers blog post URLs,
 * and creates blog_post assets with canonical URLs.
 */

import { createClient } from '@/lib/supabase/server'
import type { AssetInsert } from '@/types/database'

// ==========================================================================
// Types
// ==========================================================================

export type BlogPost = {
  url: string
  title: string
  lastModified: string | null
  slug: string
}

// ==========================================================================
// Sitemap parser (stub)
// ==========================================================================

/**
 * Stub: fetch and parse a sitemap.xml to discover blog post URLs.
 * In production this would:
 * 1. Fetch the sitemap XML
 * 2. Parse <url> elements
 * 3. Filter for blog post URLs (by path prefix, e.g. /blog/)
 * 4. Optionally fetch each page to extract the <title> tag
 */
export async function parseSitemap(
  _sitemapUrl: string,
  _pathPrefix: string,
): Promise<BlogPost[]> {
  // Stub — returns empty array.
  return []
}

// ==========================================================================
// Import logic
// ==========================================================================

/**
 * Import blog posts from a sitemap into Roadman OS.
 *
 * For each post:
 * 1. Check for existing asset by `external_url` (canonical URL) — deduplication
 * 2. Create asset with type `blog_post`
 * 3. Track progress via sync_jobs
 */
export async function importBlogPosts(
  sitemapUrl: string,
  pathPrefix: string,
  syncJobId: string,
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const supabase = await createClient()
  const posts = await parseSitemap(sitemapUrl, pathPrefix)

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]

    try {
      // Update progress
      await supabase
        .from('sync_jobs')
        .update({
          metadata: {
            current: i + 1,
            total: posts.length,
            currentTitle: post.title,
          },
        })
        .eq('id', syncJobId)

      // Deduplication by canonical URL
      const { data: existing } = await supabase
        .from('assets')
        .select('id')
        .eq('external_url', post.url)
        .single()

      if (existing) {
        skipped++
        continue
      }

      const insert: AssetInsert = {
        title: post.title,
        slug: post.slug,
        type: 'blog_post',
        status: 'published',
        pillar: null,
        description: null,
        body: null,
        campaign_id: null,
        parent_asset_id: null,
        creator_id: null,
        assignee_id: null,
        publish_date: post.lastModified,
        due_date: null,
        external_id: null,
        external_url: post.url,
        thumbnail_url: null,
        duration_seconds: null,
        word_count: null,
        metadata: {
          source: 'blog_sitemap_import',
          import_job_id: syncJobId,
        },
      }

      const { error: insertError } = await supabase
        .from('assets')
        .insert(insert)

      if (insertError) {
        errors.push(`Failed to import "${post.title}": ${insertError.message}`)
        continue
      }

      imported++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      errors.push(`Error importing "${post.title}": ${msg}`)
    }
  }

  // Finalise sync job
  await supabase
    .from('sync_jobs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      records_synced: imported,
      error_message: errors.length > 0 ? errors.join('; ') : null,
      metadata: { imported, skipped, errors: errors.length },
    })
    .eq('id', syncJobId)

  return { imported, skipped, errors }
}
