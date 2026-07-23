/**
 * Podcast RSS import — parses an RSS feed and creates podcast_episode assets.
 * Matches episodes to YouTube videos by episode number when possible.
 */

import { createClient } from '@/lib/supabase/server'
import type { AssetInsert } from '@/types/database'

// ==========================================================================
// Types
// ==========================================================================

export type PodcastEpisode = {
  guid: string
  title: string
  description: string | null
  publishedAt: string
  durationSeconds: number | null
  audioUrl: string | null
  episodeNumber: number | null
}

// ==========================================================================
// RSS parser (stub)
// ==========================================================================

/**
 * Stub: parse a podcast RSS feed URL and return episodes.
 * In production this would fetch the feed XML and parse it with
 * a proper XML parser, extracting <item> elements.
 */
export async function parsePodcastFeed(
  _feedUrl: string,
): Promise<PodcastEpisode[]> {
  // Stub — returns empty array.
  // The real implementation would:
  // 1. Fetch the RSS XML
  // 2. Parse <item> elements
  // 3. Extract title, description, pubDate, enclosure, itunes:duration, itunes:episode
  return []
}

// ==========================================================================
// Import logic
// ==========================================================================

/**
 * Import podcast episodes from an RSS feed into Roadman OS.
 *
 * For each episode:
 * 1. Check for existing asset by `external_id` (guid) — deduplication
 * 2. Create asset with type `podcast_episode`
 * 3. Optionally match to a YouTube video by episode number
 * 4. Track progress via sync_jobs
 */
export async function importPodcastEpisodes(
  feedUrl: string,
  syncJobId: string,
): Promise<{ imported: number; skipped: number; matched: number; errors: string[] }> {
  const supabase = await createClient()
  const episodes = await parsePodcastFeed(feedUrl)

  let imported = 0
  let skipped = 0
  let matched = 0
  const errors: string[] = []

  for (let i = 0; i < episodes.length; i++) {
    const episode = episodes[i]

    try {
      // Update progress
      await supabase
        .from('sync_jobs')
        .update({
          metadata: {
            current: i + 1,
            total: episodes.length,
            currentTitle: episode.title,
          },
        })
        .eq('id', syncJobId)

      // Deduplication by guid
      const { data: existing } = await supabase
        .from('assets')
        .select('id')
        .eq('external_id', episode.guid)
        .single()

      if (existing) {
        skipped++
        continue
      }

      const slug = episode.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 100)

      // Try to match to a YouTube video by episode number
      let parentAssetId: string | null = null
      if (episode.episodeNumber) {
        const { data: ytAsset } = await supabase
          .from('assets')
          .select('id')
          .eq('type', 'youtube_video')
          .ilike('title', `%ep${episode.episodeNumber}%`)
          .limit(1)
          .single()

        if (ytAsset) {
          parentAssetId = (ytAsset as { id: string }).id
          matched++
        }
      }

      const insert: AssetInsert = {
        title: episode.title,
        slug,
        type: 'podcast_episode',
        status: 'published',
        pillar: null,
        description: episode.description,
        body: null,
        campaign_id: null,
        parent_asset_id: parentAssetId,
        creator_id: null,
        assignee_id: null,
        publish_date: episode.publishedAt,
        due_date: null,
        external_id: episode.guid,
        external_url: episode.audioUrl,
        thumbnail_url: null,
        duration_seconds: episode.durationSeconds,
        word_count: null,
        metadata: {
          source: 'podcast_rss_import',
          episode_number: episode.episodeNumber,
          import_job_id: syncJobId,
        },
      }

      const { error: insertError } = await supabase
        .from('assets')
        .insert(insert)

      if (insertError) {
        errors.push(`Failed to import "${episode.title}": ${insertError.message}`)
        continue
      }

      imported++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      errors.push(`Error importing "${episode.title}": ${msg}`)
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
      metadata: { imported, skipped, matched, errors: errors.length },
    })
    .eq('id', syncJobId)

  return { imported, skipped, matched, errors }
}
