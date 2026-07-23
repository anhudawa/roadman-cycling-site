import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getValidToken } from '@/lib/utils/oauth'
import {
  listUserVideos,
  mapTikTokVideoToPerformance,
  TikTokApiError,
} from '@/lib/integrations/tiktok'
import type { PlatformConnection, PerformanceRecordInsert } from '@/types/database'

// ==========================================================================
// Request validation
// ==========================================================================

const syncBodySchema = z.object({
  connection_id: z.string().uuid('Invalid connection ID'),
  sync_job_id: z.string().uuid('Invalid sync job ID'),
})

// ==========================================================================
// Constants
// ==========================================================================

/** Maximum pages of videos to fetch per sync run (20 videos per page). */
const MAX_PAGES_PER_SYNC = 5

// ==========================================================================
// Helpers
// ==========================================================================

/** Update sync_job status + optional error in Supabase. */
async function updateSyncJob(
  supabase: Awaited<ReturnType<typeof createClient>>,
  syncJobId: string,
  fields: {
    status: string
    records_synced?: number
    error_message?: string | null
    completed_at?: string | null
    started_at?: string | null
    metadata?: Record<string, unknown>
  },
) {
  await supabase
    .from('sync_jobs')
    .update({
      status: fields.status,
      records_synced: fields.records_synced ?? 0,
      error_message: fields.error_message ?? null,
      completed_at: fields.completed_at ?? null,
      started_at: fields.started_at ?? null,
      metadata: fields.metadata ?? {},
    })
    .eq('id', syncJobId)
}

// ==========================================================================
// POST /api/integrations/tiktok
// ==========================================================================

/**
 * Sync TikTok videos and their engagement statistics.
 *
 * POST /api/integrations/tiktok
 * Body: { connection_id: string (uuid), sync_job_id: string (uuid) }
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  let syncJobId: string | undefined

  try {
    // ---- Parse & validate body -------------------------------------------
    const body: unknown = await request.json()
    const parsed = syncBodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid request body' },
        { status: 400 },
      )
    }

    const { connection_id, sync_job_id } = parsed.data
    syncJobId = sync_job_id

    // ---- Load connection -------------------------------------------------
    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', connection_id)
      .single()

    if (connError || !connection) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: 'Connection not found',
      })
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    const conn = connection as unknown as PlatformConnection

    if (!conn.is_active) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: 'Connection is inactive',
      })
      return NextResponse.json({ error: 'Connection is inactive' }, { status: 400 })
    }

    // ---- Get valid access token ------------------------------------------
    const accessToken = await getValidToken(conn, 'tiktok')
    if (!accessToken) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: 'Unable to obtain a valid TikTok access token',
      })
      return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 })
    }

    // ---- Mark sync job as running ----------------------------------------
    await updateSyncJob(supabase, syncJobId, {
      status: 'running',
      started_at: new Date().toISOString(),
    })

    // ---- Fetch videos (paginated) ----------------------------------------
    // TODO: Wire up to live TikTok API once credentials are available
    const allVideos: Array<{
      id: string
      title: string
      video_description?: string
      create_time: number
      cover_image_url?: string
      share_url?: string
      duration: number
      height: number
      width: number
      view_count: number
      like_count: number
      comment_count: number
      share_count: number
      favourite_count?: number
    }> = []

    let cursor = 0
    let hasMore = true

    for (let page = 0; page < MAX_PAGES_PER_SYNC && hasMore; page++) {
      const videosResponse = await listUserVideos(accessToken, cursor, 20)
      const videos = videosResponse.data.videos ?? []

      allVideos.push(...videos)

      cursor = videosResponse.data.cursor
      hasMore = videosResponse.data.has_more
    }

    if (allVideos.length === 0) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'completed',
        records_synced: 0,
        completed_at: new Date().toISOString(),
      })
      await supabase
        .from('platform_connections')
        .update({
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection_id)

      return NextResponse.json({ synced: 0 })
    }

    // ---- Match videos to existing publications ---------------------------
    const videoIds = allVideos.map((v) => v.id)

    const { data: publications } = await supabase
      .from('publications')
      .select('id, asset_id, external_id')
      .in('external_id', videoIds)

    const pubByExternalId = new Map(
      (publications ?? []).map((p) => [p.external_id, p]),
    )

    // ---- Build performance records ---------------------------------------
    const now = new Date().toISOString()
    const records: PerformanceRecordInsert[] = []

    for (const video of allVideos) {
      const pub = pubByExternalId.get(video.id)

      const record = mapTikTokVideoToPerformance(
        video,
        pub?.asset_id ?? null,
        pub?.id ?? null,
        now,
      )

      records.push(record)
    }

    // ---- Insert performance records --------------------------------------
    let recordsSynced = 0

    if (records.length > 0) {
      for (let i = 0; i < records.length; i += 100) {
        const batch = records.slice(i, i + 100)
        const { error: insertError } = await supabase
          .from('performance_records')
          .insert(batch)

        if (!insertError) {
          recordsSynced += batch.length
        }
      }
    }

    // ---- Finalise sync job & connection ----------------------------------
    await updateSyncJob(supabase, syncJobId, {
      status: 'completed',
      records_synced: recordsSynced,
      completed_at: new Date().toISOString(),
      metadata: {
        videos_found: allVideos.length,
        videos_matched: pubByExternalId.size,
      },
    })

    await supabase
      .from('platform_connections')
      .update({
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection_id)

    return NextResponse.json({
      synced: recordsSynced,
      videos_found: allVideos.length,
      videos_matched: pubByExternalId.size,
    })
  } catch (err) {
    // ---- Mark sync failed ------------------------------------------------
    const message =
      err instanceof TikTokApiError
        ? `TikTok API error (${err.code}): ${err.message}`
        : err instanceof Error
          ? err.message
          : 'Unknown error during TikTok sync'

    if (syncJobId) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: message,
        completed_at: new Date().toISOString(),
      }).catch(() => {
        // Best-effort — don't mask the original error
      })
    }

    const statusCode = err instanceof TikTokApiError ? err.status : 500

    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
