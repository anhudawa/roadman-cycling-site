import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  listPosts,
  getPostStats,
  getPublicationStats,
  BeehiivApiError,
} from '@/lib/integrations/beehiiv'
import type { PerformanceRecordInsert, PlatformConnection } from '@/types/database'

type SyncRequestBody = {
  connection_id: string
  sync_job_id: string
}

/**
 * POST /api/sync/beehiiv
 *
 * Sync newsletter performance data from Beehiiv.
 * Called by triggerSync() in integrations actions (fire-and-forget).
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  let body: SyncRequestBody
  try {
    body = (await request.json()) as SyncRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { connection_id, sync_job_id } = body

  if (!connection_id || !sync_job_id) {
    return NextResponse.json(
      { error: 'connection_id and sync_job_id are required' },
      { status: 400 },
    )
  }

  // Mark job as running
  await supabase
    .from('sync_jobs')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', sync_job_id)

  try {
    // ── 1. Load connection ──────────────────────────────────────────────────
    const { data: connectionRow, error: connError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', connection_id)
      .single()

    if (connError || !connectionRow) {
      throw new Error('Connection not found')
    }

    const connection = connectionRow as unknown as PlatformConnection

    if (!connection.is_active) {
      throw new Error('Connection is not active')
    }

    const apiKey = connection.access_token
    if (!apiKey) {
      throw new Error('No API key stored for this connection')
    }

    const metadata = connection.metadata as Record<string, unknown>
    const publicationId = metadata?.publication_id as string | undefined
    if (!publicationId) {
      throw new Error('No publication_id in connection metadata')
    }

    let recordsSynced = 0

    // ── 2. List recent posts ────────────────────────────────────────────────
    const postsResponse = await listPosts(apiKey, publicationId, 1, 50)
    const posts = postsResponse.data

    // ── 3. Get stats for each post and upsert performance records ───────────
    for (const post of posts) {
      // Get detailed stats if not already expanded
      const postWithStats = post.stats
        ? post
        : await getPostStats(apiKey, publicationId, post.id)

      const stats = postWithStats.stats
      if (!stats) continue

      // Find matching asset by external_id
      const { data: asset } = await supabase
        .from('assets')
        .select('id')
        .eq('external_id', post.id)
        .single()

      const recordedAt = post.publish_date
        ? new Date(post.publish_date * 1000).toISOString()
        : new Date().toISOString()

      const performanceRecord: PerformanceRecordInsert = {
        asset_id: asset?.id ?? null,
        publication_id: null,
        source: 'beehiiv',
        recorded_at: recordedAt,
        views: stats.unique_opens,
        impressions: stats.recipients,
        clicks: stats.unique_clicks,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        subscribers_gained: 0,
        watch_time_seconds: 0,
        avg_view_duration_seconds: 0,
        ctr: stats.open_rate,
        engagement_rate: stats.click_rate,
        reach: stats.recipients,
        revenue_cents: 0,
        custom_metrics: {
          beehiiv_post_id: post.id,
          post_title: post.title,
          open_rate: stats.open_rate,
          click_rate: stats.click_rate,
          unsubscribes: stats.unsubscribes,
          total_opens: stats.opens,
          total_clicks: stats.clicks,
        },
      }

      // Upsert: use beehiiv_post_id + source to avoid duplicates
      // Delete any existing record for the same post, then insert fresh
      await supabase
        .from('performance_records')
        .delete()
        .eq('source', 'beehiiv')
        .filter('custom_metrics->>beehiiv_post_id', 'eq', post.id)

      const { error: insertError } = await supabase
        .from('performance_records')
        .insert(performanceRecord)

      if (!insertError) {
        recordsSynced++
      }
    }

    // ── 4. Get publication-level stats ──────────────────────────────────────
    const pubStats = await getPublicationStats(apiKey, publicationId)

    if (pubStats.stats) {
      const pubRecord: PerformanceRecordInsert = {
        asset_id: null,
        publication_id: null,
        source: 'beehiiv',
        recorded_at: new Date().toISOString(),
        views: 0,
        impressions: 0,
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
        reach: 0,
        revenue_cents: 0,
        custom_metrics: {
          record_type: 'publication_stats',
          publication_id: publicationId,
          publication_name: pubStats.name,
          total_subscribers: pubStats.stats.total_subscribers,
          active_subscribers: pubStats.stats.active_subscribers,
          average_open_rate: pubStats.stats.average_open_rate,
          average_click_rate: pubStats.stats.average_click_rate,
        },
      }

      // Remove stale publication-level snapshot, then insert fresh
      await supabase
        .from('performance_records')
        .delete()
        .eq('source', 'beehiiv')
        .filter('custom_metrics->>record_type', 'eq', 'publication_stats')
        .filter('custom_metrics->>publication_id', 'eq', publicationId)

      await supabase.from('performance_records').insert(pubRecord)
      recordsSynced++
    }

    // ── 5. Update sync job — success ────────────────────────────────────────
    await supabase
      .from('sync_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        records_synced: recordsSynced,
      })
      .eq('id', sync_job_id)

    // ── 6. Update connection last_synced_at ─────────────────────────────────
    await supabase
      .from('platform_connections')
      .update({
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection_id)

    return NextResponse.json({
      success: true,
      records_synced: recordsSynced,
      posts_processed: posts.length,
    })
  } catch (err) {
    const message =
      err instanceof BeehiivApiError
        ? `Beehiiv API ${err.status}: ${err.message}`
        : err instanceof Error
          ? err.message
          : 'Unknown sync error'

    // Mark job as failed
    await supabase
      .from('sync_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: message,
      })
      .eq('id', sync_job_id)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
