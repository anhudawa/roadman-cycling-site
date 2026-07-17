import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { getValidToken } from '@/lib/utils/oauth'
import {
  listOrganizationPosts,
  getPostStatistics,
  LinkedInApiError,
} from '@/lib/integrations/linkedin'
import type {
  PlatformConnection,
  PerformanceRecordInsert,
} from '@/types/database'

// ==========================================================================
// Request / internal types
// ==========================================================================

type SyncRequestBody = {
  connection_id: string
  sync_job_id: string
}

type ConnectionWithPlatform = PlatformConnection & {
  platforms: { slug: string } | null
}


// ==========================================================================
// Constants
// ==========================================================================

/** Maximum posts to fetch per sync run. */
const MAX_POSTS_PER_SYNC = 100

/** LinkedIn API allows batching stats for up to ~20 URNs at a time. */
const STATS_BATCH_SIZE = 20

// ==========================================================================
// POST handler
// ==========================================================================

/**
 * Sync LinkedIn organisation posts and their engagement statistics.
 *
 * POST /api/sync/linkedin
 * Body: { connection_id: string, sync_job_id: string }
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  // ---- Auth -----------------------------------------------------------
  let profile
  try {
    profile = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // ---- Parse body -----------------------------------------------------
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

  // ---- Mark sync job as running ---------------------------------------
  await supabase
    .from('sync_jobs')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', sync_job_id)

  try {
    // ---- Load connection + platform slug ------------------------------
    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('*, platforms(slug)')
      .eq('id', connection_id)
      .single<ConnectionWithPlatform>()

    if (connError || !connection) {
      throw new Error(`Connection not found: ${connection_id}`)
    }

    const platformSlug = connection.platforms?.slug
    if (platformSlug !== 'linkedin') {
      throw new Error(`Expected linkedin connection, got: ${platformSlug}`)
    }

    // ---- Get valid access token ---------------------------------------
    const accessToken = await getValidToken(connection, platformSlug)
    if (!accessToken) {
      throw new Error('Unable to obtain a valid LinkedIn access token')
    }

    // ---- Resolve organisation ID --------------------------------------
    const orgId = connection.account_id
    if (!orgId) {
      throw new Error('No account_id (organisation ID) on this connection')
    }

    // ---- Fetch posts --------------------------------------------------
    const postsResponse = await listOrganizationPosts(
      accessToken,
      orgId,
      0,
      MAX_POSTS_PER_SYNC,
    )

    const posts = postsResponse.elements
    if (posts.length === 0) {
      await markSyncComplete(supabase, sync_job_id, 0)
      return NextResponse.json({ synced: 0 })
    }

    // ---- Collect URNs -------------------------------------------------
    const shareUrns = posts.map((post) => post.id)

    // ---- Fetch statistics in batches ----------------------------------
    const allStats = new Map<
      string,
      {
        impressionCount: number
        uniqueImpressionsCount: number
        clickCount: number
        likeCount: number
        commentCount: number
        shareCount: number
        engagement: number
      }
    >()

    for (let i = 0; i < shareUrns.length; i += STATS_BATCH_SIZE) {
      const batch = shareUrns.slice(i, i + STATS_BATCH_SIZE)
      const statsResponse = await getPostStatistics(accessToken, orgId, batch)

      for (const stat of statsResponse.elements) {
        const urn = stat.ugcPost ?? stat.share ?? ''
        allStats.set(urn, stat.totalShareStatistics)
      }
    }

    // ---- Find matching publications -----------------------------------
    // Look up publications by external_id so we can link performance_records
    const { data: publications } = await supabase
      .from('publications')
      .select('id, asset_id, external_id')
      .in('external_id', shareUrns)

    const pubByExternalId = new Map(
      (publications ?? []).map((p) => [p.external_id, p]),
    )

    // ---- Build performance records ------------------------------------
    const now = new Date().toISOString()
    const records: PerformanceRecordInsert[] = []

    for (const post of posts) {
      const stats = allStats.get(post.id)
      const pub = pubByExternalId.get(post.id)

      const record: PerformanceRecordInsert = {
        asset_id: pub?.asset_id ?? null,
        publication_id: pub?.id ?? null,
        source: 'linkedin',
        recorded_at: now,
        views: 0,
        impressions: stats?.impressionCount ?? 0,
        clicks: stats?.clickCount ?? 0,
        likes: stats?.likeCount ?? 0,
        comments: stats?.commentCount ?? 0,
        shares: stats?.shareCount ?? 0,
        saves: 0,
        subscribers_gained: 0,
        watch_time_seconds: 0,
        avg_view_duration_seconds: 0,
        ctr: stats && stats.impressionCount > 0
          ? stats.clickCount / stats.impressionCount
          : 0,
        engagement_rate: stats?.engagement ?? 0,
        reach: stats?.uniqueImpressionsCount ?? 0,
        revenue_cents: 0,
        custom_metrics: {
          linkedin_urn: post.id,
          organic_impressions: stats?.impressionCount ?? 0,
        },
      }

      records.push(record)
    }

    // ---- Upsert performance records -----------------------------------
    const { error: insertError } = await supabase
      .from('performance_records')
      .insert(records)

    if (insertError) {
      throw new Error(`Failed to insert performance records: ${insertError.message}`)
    }

    // ---- Update connection last_synced_at -----------------------------
    await supabase
      .from('platform_connections')
      .update({ last_synced_at: now, updated_at: now })
      .eq('id', connection_id)

    // ---- Mark sync complete -------------------------------------------
    await markSyncComplete(supabase, sync_job_id, records.length)

    // ---- Log activity -------------------------------------------------
    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'sync_job',
      entity_id: sync_job_id,
      changes: {
        status: 'completed',
        records_synced: records.length,
        source: 'linkedin',
      },
    })

    return NextResponse.json({ synced: records.length })
  } catch (error) {
    // ---- Mark sync failed ---------------------------------------------
    const message =
      error instanceof LinkedInApiError
        ? `LinkedIn API error ${error.status}: ${error.message}`
        : error instanceof Error
          ? error.message
          : 'Unknown error during LinkedIn sync'

    await supabase
      .from('sync_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: message,
      })
      .eq('id', sync_job_id)

    const statusCode = error instanceof LinkedInApiError ? error.status : 500

    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

// ==========================================================================
// Helpers
// ==========================================================================

async function markSyncComplete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  syncJobId: string,
  recordsSynced: number,
) {
  await supabase
    .from('sync_jobs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      records_synced: recordsSynced,
    })
    .eq('id', syncJobId)
}
