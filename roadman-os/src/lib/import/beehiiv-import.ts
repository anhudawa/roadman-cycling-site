/**
 * Beehiiv newsletter import — uses the Beehiiv API to discover
 * published posts and create newsletter assets.
 */

import { createClient } from '@/lib/supabase/server'
import type { AssetInsert } from '@/types/database'

// ==========================================================================
// Types
// ==========================================================================

export type BeehiivNewsletterPost = {
  id: string
  title: string
  subtitle: string | null
  slug: string
  webUrl: string | null
  thumbnailUrl: string | null
  publishDate: string | null
  contentTags: string[]
  authors: string[]
}

// ==========================================================================
// Beehiiv API client (stub)
// ==========================================================================

/**
 * Stub: list published posts from Beehiiv.
 * In production this would call:
 * GET https://api.beehiiv.com/v2/publications/{publicationId}/posts?status=confirmed
 * with pagination support.
 */
export async function listBeehiivPosts(
  _apiKey: string,
  _publicationId: string,
): Promise<BeehiivNewsletterPost[]> {
  // Stub — returns empty array.
  return []
}

// ==========================================================================
// Import logic
// ==========================================================================

/**
 * Import newsletter posts from Beehiiv into Roadman OS.
 *
 * For each post:
 * 1. Check for existing asset by `external_id` (Beehiiv post ID) — deduplication
 * 2. Create asset with type `newsletter`
 * 3. Track progress via sync_jobs
 */
export async function importBeehiivPosts(
  apiKey: string,
  publicationId: string,
  syncJobId: string,
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const supabase = await createClient()
  const posts = await listBeehiivPosts(apiKey, publicationId)

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

      // Deduplication by Beehiiv post ID
      const { data: existing } = await supabase
        .from('assets')
        .select('id')
        .eq('external_id', post.id)
        .single()

      if (existing) {
        skipped++
        continue
      }

      const slug = (post.slug || post.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 100)

      const insert: AssetInsert = {
        title: post.title,
        slug,
        type: 'newsletter',
        status: 'published',
        pillar: null,
        description: post.subtitle,
        body: null,
        campaign_id: null,
        parent_asset_id: null,
        creator_id: null,
        assignee_id: null,
        publish_date: post.publishDate,
        due_date: null,
        external_id: post.id,
        external_url: post.webUrl,
        thumbnail_url: post.thumbnailUrl,
        duration_seconds: null,
        word_count: null,
        metadata: {
          source: 'beehiiv_import',
          content_tags: post.contentTags,
          authors: post.authors,
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
