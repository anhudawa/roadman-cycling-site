import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { getValidToken } from '@/lib/utils/oauth'
import {
  parseRSSFeed,
  getEpisodeStats,
  getPodcastStats,
  slugify,
} from '@/lib/integrations/spotify'
import type {
  PlatformConnection,
  AssetInsert,
  PerformanceRecordInsert,
  Asset,
} from '@/types/database'
import type { RSSEpisode, SpotifyEpisodeStats } from '@/lib/integrations/spotify'

/**
 * POST /api/sync/spotify
 *
 * Sync podcast episodes from an RSS feed and optionally enrich with
 * Spotify for Podcasters analytics.
 *
 * Body: { connection_id: string; sync_job_id: string }
 */
export async function POST(request: Request) {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // ---- Parse request body ----
    const body: unknown = await request.json()
    const { connection_id, sync_job_id } = validateRequestBody(body)

    // ---- Load connection ----
    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', connection_id)
      .single()

    if (connError || !connection) {
      return NextResponse.json(
        { error: 'Platform connection not found' },
        { status: 404 },
      )
    }

    const conn = connection as PlatformConnection

    // ---- Update sync job to running ----
    await supabase
      .from('sync_jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .eq('id', sync_job_id)

    // ---- Get RSS feed URL from connection metadata ----
    const feedUrl = getFeedUrl(conn)
    if (!feedUrl) {
      await failSyncJob(supabase, sync_job_id, 'No RSS feed URL configured in connection metadata')
      return NextResponse.json(
        { error: 'No RSS feed URL configured in connection metadata' },
        { status: 400 },
      )
    }

    // ---- Parse RSS feed ----
    let feedResult: Awaited<ReturnType<typeof parseRSSFeed>>
    try {
      feedResult = await parseRSSFeed(feedUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'RSS feed parsing failed'
      await failSyncJob(supabase, sync_job_id, message)
      return NextResponse.json({ error: message }, { status: 502 })
    }

    // ---- Get existing assets for this connection to detect new episodes ----
    const { data: existingAssets } = await supabase
      .from('assets')
      .select('id, external_id')
      .eq('type', 'podcast_episode')

    const existingGuids = new Set(
      (existingAssets ?? []).map((a: Pick<Asset, 'id' | 'external_id'>) => a.external_id),
    )

    const existingAssetsByGuid = new Map(
      (existingAssets ?? []).map((a: Pick<Asset, 'id' | 'external_id'>) => [a.external_id, a.id]),
    )

    // ---- Create assets for new episodes ----
    const newEpisodes = feedResult.episodes.filter(
      (ep) => !existingGuids.has(ep.guid),
    )

    const createdAssetIds: string[] = []

    for (const episode of newEpisodes) {
      const assetInsert: AssetInsert = buildAssetInsert(episode, profile.id)

      const { data: newAsset, error: assetError } = await supabase
        .from('assets')
        .insert(assetInsert)
        .select('id')
        .single()

      if (assetError || !newAsset) {
        console.error(`Failed to create asset for episode "${episode.title}":`, assetError)
        continue
      }

      createdAssetIds.push(newAsset.id)
      existingAssetsByGuid.set(episode.guid, newAsset.id)

      await logActivity(supabase, {
        actor_id: profile.id,
        action: 'created',
        entity_type: 'asset',
        entity_id: newAsset.id,
        changes: { source: 'spotify_sync', episode_title: episode.title },
      })
    }

    // ---- Fetch Spotify stats if API token available ----
    let recordsSynced = createdAssetIds.length
    const accessToken = await getValidToken(conn, 'spotify')
    const showId = getShowId(conn)

    if (accessToken && showId) {
      // Fetch podcast-level stats for custom_metrics
      const podcastStats = await getPodcastStats(accessToken, showId)

      // Fetch episode-level stats and create performance records
      for (const episode of feedResult.episodes) {
        const assetId = existingAssetsByGuid.get(episode.guid)
        if (!assetId) continue

        const spotifyEpisodeId = extractSpotifyEpisodeId(episode)
        if (!spotifyEpisodeId) continue

        const episodeStats = await getEpisodeStats(accessToken, showId, spotifyEpisodeId)
        if (!episodeStats) continue

        const performanceRecord = buildPerformanceRecord(
          assetId,
          episodeStats,
          podcastStats,
        )

        const { error: perfError } = await supabase
          .from('performance_records')
          .insert(performanceRecord)

        if (perfError) {
          console.error(
            `Failed to insert performance record for episode "${episode.title}":`,
            perfError,
          )
          continue
        }

        recordsSynced++
      }
    }

    // ---- Update connection last_synced_at ----
    await supabase
      .from('platform_connections')
      .update({
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection_id)

    // ---- Complete sync job ----
    await supabase
      .from('sync_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        records_synced: recordsSynced,
      })
      .eq('id', sync_job_id)

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'sync_job',
      entity_id: sync_job_id,
      changes: {
        status: 'completed',
        new_episodes: createdAssetIds.length,
        total_synced: recordsSynced,
      },
    })

    return NextResponse.json({
      success: true,
      newEpisodes: createdAssetIds.length,
      totalEpisodes: feedResult.episodes.length,
      recordsSynced,
      podcastTitle: feedResult.podcastTitle,
    })
  } catch (error) {
    console.error('Spotify sync error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'

    // If it's an auth error, return 401
    if (message === 'Authentication required') {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ==========================================================================
// Helpers
// ==========================================================================

/**
 * Validate and extract required fields from the request body.
 */
function validateRequestBody(body: unknown): {
  connection_id: string
  sync_job_id: string
} {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('connection_id' in body) ||
    !('sync_job_id' in body)
  ) {
    throw new Error('Missing required fields: connection_id, sync_job_id')
  }

  const { connection_id, sync_job_id } = body as Record<string, unknown>

  if (typeof connection_id !== 'string' || typeof sync_job_id !== 'string') {
    throw new Error('connection_id and sync_job_id must be strings')
  }

  return { connection_id, sync_job_id }
}

/**
 * Extract the RSS feed URL from connection metadata.
 */
function getFeedUrl(connection: PlatformConnection): string | null {
  const metadata = connection.metadata
  if (typeof metadata === 'object' && metadata !== null && 'rss_feed_url' in metadata) {
    const url = (metadata as Record<string, unknown>).rss_feed_url
    return typeof url === 'string' ? url : null
  }
  return null
}

/**
 * Extract the Spotify show ID from connection metadata.
 */
function getShowId(connection: PlatformConnection): string | null {
  const metadata = connection.metadata
  if (typeof metadata === 'object' && metadata !== null && 'show_id' in metadata) {
    const id = (metadata as Record<string, unknown>).show_id
    return typeof id === 'string' ? id : null
  }
  return null
}

/**
 * Try to extract a Spotify episode ID from an RSS episode.
 * Spotify episode URLs typically contain the episode ID.
 */
function extractSpotifyEpisodeId(episode: RSSEpisode): string | null {
  // Check guid for Spotify URL pattern
  const spotifyPattern = /spotify\.com\/episode\/([a-zA-Z0-9]+)/
  const guidMatch = spotifyPattern.exec(episode.guid)
  if (guidMatch) return guidMatch[1]

  // Check enclosure URL
  if (episode.enclosureUrl) {
    const enclosureMatch = spotifyPattern.exec(episode.enclosureUrl)
    if (enclosureMatch) return enclosureMatch[1]
  }

  return null
}

/**
 * Build an AssetInsert from an RSS episode.
 */
function buildAssetInsert(episode: RSSEpisode, creatorId: string): AssetInsert {
  return {
    title: episode.title,
    slug: slugify(episode.title),
    type: 'podcast_episode',
    status: 'published',
    pillar: null,
    description: episode.description || null,
    body: null,
    campaign_id: null,
    parent_asset_id: null,
    creator_id: creatorId,
    assignee_id: null,
    publish_date: episode.publishDate,
    due_date: null,
    external_id: episode.guid,
    external_url: episode.enclosureUrl,
    thumbnail_url: null,
    duration_seconds: episode.duration,
    word_count: null,
    metadata: {
      source: 'spotify_sync',
      enclosure_type: episode.enclosureType,
    },
  }
}

/**
 * Build a PerformanceRecordInsert from Spotify episode stats.
 */
function buildPerformanceRecord(
  assetId: string,
  stats: SpotifyEpisodeStats,
  podcastStats: Awaited<ReturnType<typeof getPodcastStats>>,
): PerformanceRecordInsert {
  return {
    asset_id: assetId,
    publication_id: null,
    source: 'spotify',
    recorded_at: new Date().toISOString(),
    views: stats.plays,
    impressions: stats.starts,
    clicks: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    subscribers_gained: 0,
    watch_time_seconds: 0,
    avg_view_duration_seconds: 0,
    ctr: 0,
    engagement_rate: 0,
    reach: stats.listeners,
    revenue_cents: 0,
    custom_metrics: {
      streams: stats.streams,
      starts: stats.starts,
      ...(podcastStats
        ? {
            podcast_followers: podcastStats.followers,
            podcast_total_plays: podcastStats.totalPlays,
            avg_consumption_percent: podcastStats.avgConsumptionPercent,
          }
        : {}),
    },
  }
}

/**
 * Mark a sync job as failed with an error message.
 */
async function failSyncJob(
  supabase: Awaited<ReturnType<typeof createClient>>,
  syncJobId: string,
  errorMessage: string,
): Promise<void> {
  await supabase
    .from('sync_jobs')
    .update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_message: errorMessage,
    })
    .eq('id', syncJobId)
}
