/**
 * YouTube bulk import — fetches videos from YouTube channels and creates
 * asset records, publications, and file records in Roadman OS.
 *
 * Uses stubbed API calls where the real YouTube Data API would be called.
 * Deduplication is handled via `external_id` (YouTube video ID).
 */

import { createClient } from '@/lib/supabase/server'
import type { AssetInsert, AssetType } from '@/types/database'

// ==========================================================================
// Types
// ==========================================================================

export type YouTubeChannel = {
  slug: string
  name: string
  channelId: string
  defaultAssetType: AssetType
}

export type DateRange = {
  start: string | null // ISO date string
  end: string | null
}

export type YouTubeVideoPreview = {
  videoId: string
  title: string
  publishedAt: string
  views: number
  duration: string
  durationSeconds: number
  thumbnailUrl: string
  selected: boolean
}

export type ImportProgress = {
  current: number
  total: number
  currentTitle: string
  errors: string[]
}

// ==========================================================================
// Channel registry
// ==========================================================================

export const YOUTUBE_CHANNELS: YouTubeChannel[] = [
  {
    slug: 'roadman-podcast',
    name: 'The Roadman Podcast',
    channelId: 'UC_roadman_podcast',
    defaultAssetType: 'youtube_video',
  },
  {
    slug: 'roadman-clips',
    name: 'Roadman Podcast Clips',
    channelId: 'UC_roadman_clips',
    defaultAssetType: 'clip',
  },
]

// ==========================================================================
// Stubbed YouTube API calls
// ==========================================================================

/**
 * Stub: list videos from a YouTube channel within a date range.
 * In production, this would paginate through the YouTube Data API v3
 * `search.list` endpoint with `type=video` and `channelId`.
 */
export async function listChannelVideosForImport(
  _channelSlug: string,
  _dateRange: DateRange,
  _accessToken: string,
): Promise<YouTubeVideoPreview[]> {
  // Stub — returns empty array. The real implementation would call:
  // GET https://www.googleapis.com/youtube/v3/search
  //   ?part=snippet&channelId={id}&type=video&publishedAfter=...&publishedBefore=...
  // Then GET https://www.googleapis.com/youtube/v3/videos
  //   ?part=snippet,contentDetails,statistics&id={ids}
  return []
}

// ==========================================================================
// Import logic
// ==========================================================================

/**
 * Import selected YouTube videos into Roadman OS.
 *
 * For each video:
 * 1. Check for existing asset by `external_id` (deduplication)
 * 2. Create asset record with type `youtube_video` or `clip`
 * 3. Create publication record linking to the YouTube platform
 * 4. Create file record with external URL
 * 5. Update sync_job progress
 *
 * Returns the number of successfully imported videos.
 */
export async function importYouTubeVideos(
  channelSlug: string,
  videos: YouTubeVideoPreview[],
  syncJobId: string,
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const supabase = await createClient()
  const channel = YOUTUBE_CHANNELS.find((c) => c.slug === channelSlug)
  if (!channel) {
    return { imported: 0, skipped: 0, errors: ['Unknown channel slug'] }
  }

  // Find YouTube platform ID
  const { data: platform } = await supabase
    .from('platforms')
    .select('id')
    .eq('slug', 'youtube')
    .single()

  const platformId = (platform as { id: string } | null)?.id ?? null

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i]

    try {
      // Update sync job progress
      await supabase
        .from('sync_jobs')
        .update({
          metadata: {
            current: i + 1,
            total: videos.length,
            currentTitle: video.title,
          },
        })
        .eq('id', syncJobId)

      // Check for existing asset (deduplication by external_id)
      const { data: existing } = await supabase
        .from('assets')
        .select('id')
        .eq('external_id', video.videoId)
        .single()

      if (existing) {
        skipped++
        continue
      }

      // Create asset
      const slug = video.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 100)

      const insert: AssetInsert = {
        title: video.title,
        slug,
        type: channel.defaultAssetType,
        status: 'published',
        pillar: null,
        description: null,
        body: null,
        campaign_id: null,
        parent_asset_id: null,
        creator_id: null,
        assignee_id: null,
        publish_date: video.publishedAt,
        due_date: null,
        external_id: video.videoId,
        external_url: `https://www.youtube.com/watch?v=${video.videoId}`,
        thumbnail_url: video.thumbnailUrl,
        duration_seconds: video.durationSeconds,
        word_count: null,
        metadata: {
          source: 'youtube_import',
          channel_slug: channelSlug,
          import_job_id: syncJobId,
        },
      }

      const { data: newAsset, error: assetError } = await supabase
        .from('assets')
        .insert(insert)
        .select('id')
        .single()

      if (assetError || !newAsset) {
        errors.push(`Failed to create asset for "${video.title}": ${assetError?.message ?? 'Unknown error'}`)
        continue
      }

      const assetId = (newAsset as { id: string }).id

      // Create publication record
      if (platformId) {
        await supabase.from('publications').insert({
          asset_id: assetId,
          platform_id: platformId,
          status: 'published' as const,
          scheduled_at: null,
          published_at: video.publishedAt,
          external_id: video.videoId,
          external_url: `https://www.youtube.com/watch?v=${video.videoId}`,
          platform_metadata: { views: video.views },
          error_message: null,
        })
      }

      // Create file record with external URL
      await supabase.from('files').insert({
        asset_id: assetId,
        uploaded_by: null,
        storage_type: 'youtube' as const,
        file_name: `${video.videoId}.mp4`,
        file_path: `https://www.youtube.com/watch?v=${video.videoId}`,
        mime_type: 'video/mp4',
        file_size_bytes: null,
        is_primary: true,
        metadata: {
          duration: video.duration,
          duration_seconds: video.durationSeconds,
        },
      })

      // Log activity
      await supabase.from('activity_log').insert({
        actor_id: null,
        action: 'created' as const,
        entity_type: 'asset',
        entity_id: assetId,
        changes: {
          source: 'youtube_import',
          channel: channelSlug,
          video_id: video.videoId,
        },
        metadata: {},
      })

      imported++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      errors.push(`Error importing "${video.title}": ${msg}`)
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
      metadata: {
        imported,
        skipped,
        errors: errors.length,
        total: videos.length,
      },
    })
    .eq('id', syncJobId)

  return { imported, skipped, errors }
}
