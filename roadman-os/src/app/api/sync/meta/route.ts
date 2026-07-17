import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidToken } from '@/lib/utils/oauth'
import { getConnection } from '@/lib/queries/integrations'
import {
  getUserPages,
  listInstagramMedia,
  getInstagramInsights,
  listFacebookPosts,
  getFacebookInsights,
  MetaGraphError,
} from '@/lib/integrations/meta'
import type {
  PlatformConnection,
  PerformanceRecordInsert,
  MetricSource,
} from '@/types/database'

// ==========================================================================
// Request body type
// ==========================================================================

type SyncRequestBody = {
  connection_id: string
  sync_job_id: string
}

// ==========================================================================
// Helpers
// ==========================================================================

function buildPerformanceRecord(
  source: MetricSource,
  externalId: string,
  metrics: {
    views?: number
    impressions?: number
    clicks?: number
    likes?: number
    comments?: number
    shares?: number
    saves?: number
    reach?: number
    engagement_rate?: number
  },
): PerformanceRecordInsert {
  return {
    asset_id: null,
    publication_id: null,
    source,
    recorded_at: new Date().toISOString(),
    views: metrics.views ?? 0,
    impressions: metrics.impressions ?? 0,
    clicks: metrics.clicks ?? 0,
    likes: metrics.likes ?? 0,
    comments: metrics.comments ?? 0,
    shares: metrics.shares ?? 0,
    saves: metrics.saves ?? 0,
    subscribers_gained: 0,
    watch_time_seconds: 0,
    avg_view_duration_seconds: 0,
    ctr: 0,
    engagement_rate: metrics.engagement_rate ?? 0,
    reach: metrics.reach ?? 0,
    revenue_cents: 0,
    custom_metrics: { external_id: externalId },
  }
}

async function matchPublicationByExternalId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  externalId: string,
): Promise<{ asset_id: string | null; publication_id: string | null }> {
  const { data: publication } = await supabase
    .from('publications')
    .select('id, asset_id')
    .eq('external_id', externalId)
    .single()

  if (publication) {
    return {
      asset_id: publication.asset_id,
      publication_id: publication.id,
    }
  }

  return { asset_id: null, publication_id: null }
}

// ==========================================================================
// POST /api/sync/meta
// ==========================================================================

export async function POST(request: Request) {
  const supabase = await createClient()

  let body: SyncRequestBody
  try {
    body = (await request.json()) as SyncRequestBody
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const { connection_id, sync_job_id } = body

  if (!connection_id || !sync_job_id) {
    return NextResponse.json(
      { error: 'Missing connection_id or sync_job_id' },
      { status: 400 },
    )
  }

  // Mark sync job as running
  await supabase
    .from('sync_jobs')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', sync_job_id)

  try {
    // Get the connection
    const connection = await getConnection(connection_id)
    if (!connection) {
      throw new Error('Connection not found')
    }

    if (!connection.is_active) {
      throw new Error('Connection is not active')
    }

    // Get a valid access token (refreshes if needed)
    const accessToken = await getValidToken(
      connection as PlatformConnection,
      'meta',
    )
    if (!accessToken) {
      throw new Error('Unable to obtain valid access token')
    }

    let totalRecords = 0

    // -----------------------------------------------------------------------
    // 1. Discover Facebook pages and Instagram accounts
    // -----------------------------------------------------------------------
    const pages = await getUserPages(accessToken)

    for (const page of pages) {
      const pageToken = page.access_token

      // -------------------------------------------------------------------
      // 2. Sync Instagram media if the page has an IG business account
      // -------------------------------------------------------------------
      if (page.instagram_business_account?.id) {
        const igUserId = page.instagram_business_account.id

        // Fetch recent media (first page only for sync)
        const igMedia = await listInstagramMedia(pageToken, igUserId, 50)

        for (const media of igMedia.data) {
          try {
            const insights = await getInstagramInsights(pageToken, media.id)

            const record = buildPerformanceRecord('instagram', media.id, {
              impressions: insights.impressions,
              likes: media.like_count ?? 0,
              comments: media.comments_count ?? 0,
              saves: insights.saves,
              shares: insights.shares,
              reach: insights.reach,
              views: insights.video_views,
              engagement_rate:
                insights.reach > 0
                  ? (insights.engagement / insights.reach) * 100
                  : 0,
            })

            // Try to match to an existing publication
            const match = await matchPublicationByExternalId(supabase, media.id)
            record.asset_id = match.asset_id
            record.publication_id = match.publication_id

            await supabase.from('performance_records').insert(record)
            totalRecords++
          } catch (err) {
            // Log but continue syncing other media
            console.error(
              `[meta-sync] Failed to get insights for IG media ${media.id}:`,
              err instanceof Error ? err.message : err,
            )
          }
        }
      }

      // -------------------------------------------------------------------
      // 3. Sync Facebook page posts
      // -------------------------------------------------------------------
      const fbPosts = await listFacebookPosts(pageToken, page.id, 50)

      for (const post of fbPosts.data) {
        try {
          const insights = await getFacebookInsights(pageToken, post.id)

          const record = buildPerformanceRecord('facebook', post.id, {
            impressions: insights.impressions,
            clicks: insights.clicks,
            likes: insights.reactions,
            reach: 0,
          })

          // Try to match to an existing publication
          const match = await matchPublicationByExternalId(supabase, post.id)
          record.asset_id = match.asset_id
          record.publication_id = match.publication_id

          await supabase.from('performance_records').insert(record)
          totalRecords++
        } catch (err) {
          console.error(
            `[meta-sync] Failed to get insights for FB post ${post.id}:`,
            err instanceof Error ? err.message : err,
          )
        }
      }
    }

    // -----------------------------------------------------------------------
    // 4. Update sync job as completed
    // -----------------------------------------------------------------------
    await supabase
      .from('sync_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        records_synced: totalRecords,
      })
      .eq('id', sync_job_id)

    // Update last_synced_at on the connection
    await supabase
      .from('platform_connections')
      .update({
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection_id)

    return NextResponse.json({
      success: true,
      records_synced: totalRecords,
    })
  } catch (err) {
    const errorMessage =
      err instanceof MetaGraphError
        ? `Meta API error (${err.code}): ${err.message}`
        : err instanceof Error
          ? err.message
          : 'Unknown sync error'

    console.error(`[meta-sync] Sync failed for connection ${connection_id}:`, errorMessage)

    // Mark sync job as failed
    await supabase
      .from('sync_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq('id', sync_job_id)

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    )
  }
}
