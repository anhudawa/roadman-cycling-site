/**
 * Sync engine — dispatches sync operations to platform-specific handlers.
 *
 * Used by both the daily and weekly cron jobs, as well as manual sync triggers.
 * Each platform sync is isolated — one failure does not block others.
 */

import { createClient } from '@/lib/supabase/server'
import type { PlatformConnection, MetricSource } from '@/types/database'

/** Platform slug → MetricSource mapping. */
const PLATFORM_SOURCE_MAP: Record<string, MetricSource> = {
  youtube: 'youtube',
  'youtube-clips': 'youtube',
  meta: 'instagram',
  instagram: 'instagram',
  facebook: 'facebook',
  linkedin: 'linkedin',
  spotify: 'spotify',
  beehiiv: 'beehiiv',
  ga4: 'ga4',
  'ga4-articles': 'ga4',
  skool: 'skool',
  twitter: 'twitter_x',
  tiktok: 'manual',
}

// ==========================================================================
// Types
// ==========================================================================

export type SyncType = 'daily' | 'weekly' | 'manual'

export type PlatformSyncResult = {
  connectionId: string
  platformSlug: string
  success: boolean
  recordsSynced: number
  error?: string
  syncJobId: string
}

export type SyncRunResult = {
  syncType: SyncType
  totalConnections: number
  successful: number
  failed: number
  results: PlatformSyncResult[]
}

// ==========================================================================
// Platform sync routes
// ==========================================================================

/**
 * Map of platform slugs to their sync API route paths.
 * Each route expects a POST with { connection_id, sync_job_id }.
 */
const SYNC_ROUTES: Record<string, string> = {
  youtube: '/api/sync/youtube',
  'youtube-clips': '/api/sync/youtube',
  meta: '/api/sync/meta',
  linkedin: '/api/sync/linkedin',
  spotify: '/api/sync/spotify',
  beehiiv: '/api/sync/beehiiv',
  ga4: '/api/sync/ga4',
  'ga4-articles': '/api/sync/ga4',
}

// ==========================================================================
// Single platform sync
// ==========================================================================

/**
 * Run a sync for a single platform connection.
 *
 * 1. Creates a sync_job record
 * 2. Dispatches to the platform-specific sync route
 * 3. Returns the result (the sync route manages job status updates)
 */
export async function runPlatformSync(
  connectionId: string,
  syncType: SyncType,
): Promise<PlatformSyncResult> {
  const supabase = await createClient()

  // Load the connection
  const { data: connection, error: connError } = await supabase
    .from('platform_connections')
    .select('*, platforms!inner(slug, name)')
    .eq('id', connectionId)
    .single()

  if (connError || !connection) {
    return {
      connectionId,
      platformSlug: 'unknown',
      success: false,
      recordsSynced: 0,
      error: 'Connection not found',
      syncJobId: '',
    }
  }

  const conn = connection as unknown as PlatformConnection & {
    platforms: { slug: string; name: string }
  }
  const platformSlug = conn.platforms.slug

  // Resolve MetricSource from platform slug
  const source: MetricSource = PLATFORM_SOURCE_MAP[platformSlug] ?? 'manual'

  // Create a sync job
  const { data: syncJob, error: jobError } = await supabase
    .from('sync_jobs')
    .insert({
      connection_id: connectionId,
      source,
      status: 'pending',
      started_at: null,
      completed_at: null,
      records_synced: 0,
      error_message: null,
      metadata: {
        sync_type: syncType,
        platform_slug: platformSlug,
      },
    })
    .select('id')
    .single()

  if (jobError || !syncJob) {
    return {
      connectionId,
      platformSlug,
      success: false,
      recordsSynced: 0,
      error: 'Failed to create sync job',
      syncJobId: '',
    }
  }

  const syncJobId = (syncJob as { id: string }).id

  // Find the sync route
  const syncRoute = SYNC_ROUTES[platformSlug]
  if (!syncRoute) {
    // No sync route for this platform (e.g. skool is manual-only)
    await supabase
      .from('sync_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        metadata: { sync_type: syncType, skipped: true, reason: 'no_sync_route' },
      })
      .eq('id', syncJobId)

    return {
      connectionId,
      platformSlug,
      success: true,
      recordsSynced: 0,
      syncJobId,
    }
  }

  // Dispatch to the platform sync route
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ?? (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000')

    const res = await fetch(`${baseUrl}${syncRoute}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connection_id: connectionId,
        sync_job_id: syncJobId,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Unknown error' }))
      return {
        connectionId,
        platformSlug,
        success: false,
        recordsSynced: 0,
        error: (body as Record<string, unknown>).error as string ?? `HTTP ${res.status}`,
        syncJobId,
      }
    }

    const body = await res.json() as Record<string, unknown>
    return {
      connectionId,
      platformSlug,
      success: true,
      recordsSynced: (body.synced as number) ?? 0,
      syncJobId,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync dispatch failed'

    // Mark job as failed
    await supabase
      .from('sync_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: message,
      })
      .eq('id', syncJobId)

    return {
      connectionId,
      platformSlug,
      success: false,
      recordsSynced: 0,
      error: message,
      syncJobId,
    }
  }
}

// ==========================================================================
// All-platform sync
// ==========================================================================

/**
 * Run syncs for all active platform connections.
 *
 * Per-platform error isolation — one failure does not block others.
 * Creates a parent sync_job to track the overall run.
 */
export async function runAllSyncs(
  syncType: SyncType,
): Promise<SyncRunResult> {
  const supabase = await createClient()

  // Fetch all active connections
  const { data: connections, error } = await supabase
    .from('platform_connections')
    .select('id')
    .eq('is_active', true)

  if (error || !connections) {
    return {
      syncType,
      totalConnections: 0,
      successful: 0,
      failed: 0,
      results: [],
    }
  }

  const activeConnections = connections as unknown as { id: string }[]
  const results: PlatformSyncResult[] = []

  // Run syncs sequentially to avoid overwhelming rate limits
  for (const conn of activeConnections) {
    const result = await runPlatformSync(conn.id, syncType)
    results.push(result)
  }

  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  return {
    syncType,
    totalConnections: activeConnections.length,
    successful,
    failed,
    results,
  }
}
