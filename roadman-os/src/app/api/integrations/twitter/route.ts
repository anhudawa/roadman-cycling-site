import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { getValidToken } from '@/lib/utils/oauth'
import {
  getUserTweets,
  mapTweetToPerformanceRecord,
  TwitterApiError,
} from '@/lib/integrations/twitter'
import type {
  PlatformConnection,
  PerformanceRecordInsert,
} from '@/types/database'

// ==========================================================================
// Request validation
// ==========================================================================

const syncBodySchema = z.object({
  connection_id: z.string().uuid(),
  sync_job_id: z.string().uuid(),
})

// ==========================================================================
// Types
// ==========================================================================

type ConnectionWithPlatform = PlatformConnection & {
  platforms: { slug: string } | null
}

// ==========================================================================
// Constants
// ==========================================================================

/** Maximum tweets to fetch per sync run. */
const MAX_TWEETS_PER_SYNC = 100

// ==========================================================================
// POST handler
// ==========================================================================

/**
 * Sync X / Twitter tweets and their engagement metrics.
 *
 * POST /api/integrations/twitter
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

  // ---- Parse & validate body ------------------------------------------
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = syncBodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid request body' },
      { status: 400 },
    )
  }

  const { connection_id, sync_job_id } = parsed.data

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
    if (platformSlug !== 'twitter') {
      throw new Error(`Expected twitter connection, got: ${platformSlug}`)
    }

    // ---- Get valid access token ---------------------------------------
    const accessToken = await getValidToken(connection, platformSlug)
    if (!accessToken) {
      throw new Error('Unable to obtain a valid X / Twitter access token')
    }

    // ---- Resolve user ID ----------------------------------------------
    const userId = connection.account_id
    if (!userId) {
      throw new Error('No account_id (user ID) on this connection')
    }

    // ---- Fetch tweets -------------------------------------------------
    // TODO: Paginate through multiple pages if needed
    const tweetsResponse = await getUserTweets(
      accessToken,
      userId,
      MAX_TWEETS_PER_SYNC,
    )

    const tweets = tweetsResponse.data
    if (tweets.length === 0) {
      await markSyncComplete(supabase, sync_job_id, 0)
      return NextResponse.json({ synced: 0 })
    }

    // ---- Find matching publications -----------------------------------
    const tweetIds = tweets.map((t) => t.id)

    const { data: publications } = await supabase
      .from('publications')
      .select('id, asset_id, external_id')
      .in('external_id', tweetIds)

    const pubByExternalId = new Map(
      (publications ?? []).map((p) => [p.external_id, p]),
    )

    // ---- Build performance records ------------------------------------
    const now = new Date().toISOString()
    const records: PerformanceRecordInsert[] = []

    for (const tweet of tweets) {
      const pub = pubByExternalId.get(tweet.id)

      records.push(
        mapTweetToPerformanceRecord(
          tweet,
          pub?.asset_id ?? null,
          pub?.id ?? null,
          now,
        ),
      )
    }

    // ---- Insert performance records -----------------------------------
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
        source: 'twitter_x',
      },
    })

    return NextResponse.json({ synced: records.length })
  } catch (error) {
    // ---- Mark sync failed ---------------------------------------------
    const message =
      error instanceof TwitterApiError
        ? `Twitter API error ${error.status}: ${error.message}`
        : error instanceof Error
          ? error.message
          : 'Unknown error during X / Twitter sync'

    await supabase
      .from('sync_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: message,
      })
      .eq('id', sync_job_id)

    const statusCode = error instanceof TwitterApiError ? error.status : 500

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
