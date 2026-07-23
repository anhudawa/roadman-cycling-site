/**
 * Sync job queries — used by the Sync Status Dashboard and related components.
 */

import { createClient } from '@/lib/supabase/server'
import type { SyncJob, MetricSource } from '@/types/database'

// ==========================================================================
// Types
// ==========================================================================

export type SyncJobFilters = {
  source?: MetricSource
  status?: string
  connectionId?: string
  limit?: number
  offset?: number
}

export type PlatformSyncSummary = {
  source: MetricSource
  platformName: string
  connectionId: string | null
  isActive: boolean
  lastSyncedAt: string | null
  lastSyncStatus: string | null
  lastRecordsSynced: number
  lastError: string | null
  totalJobsLast7Days: number
  totalRecordsLast7Days: number
  failedJobsLast7Days: number
}

// ==========================================================================
// Queries
// ==========================================================================

/**
 * Fetch sync jobs with optional filters.
 */
export async function getSyncJobs(
  filters: SyncJobFilters = {},
): Promise<SyncJob[]> {
  const supabase = await createClient()

  let query = supabase
    .from('sync_jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.source) {
    query = query.eq('source', filters.source)
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.connectionId) {
    query = query.eq('connection_id', filters.connectionId)
  }

  query = query.limit(filters.limit ?? 50)

  if (filters.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit ?? 50) - 1,
    )
  }

  const { data, error } = await query

  if (error || !data) return []
  return data as unknown as SyncJob[]
}

/**
 * Fetch the most recent sync job for each platform source.
 */
export async function getLatestSyncPerPlatform(): Promise<
  Record<string, SyncJob>
> {
  const supabase = await createClient()

  // Fetch the most recent sync job per source
  const { data, error } = await supabase
    .from('sync_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error || !data) return {}

  const jobs = data as unknown as SyncJob[]
  const latest: Record<string, SyncJob> = {}

  for (const job of jobs) {
    if (!latest[job.source]) {
      latest[job.source] = job
    }
  }

  return latest
}

/**
 * Fetch a single sync job by ID.
 */
export async function getSyncJob(id: string): Promise<SyncJob | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sync_jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as unknown as SyncJob
}

/**
 * Get a summary of sync activity per platform for the dashboard.
 *
 * Combines platform_connections data with recent sync_jobs to provide
 * a comprehensive overview per platform.
 */
export async function getPlatformSyncSummaries(): Promise<
  PlatformSyncSummary[]
> {
  const supabase = await createClient()

  // Fetch all active connections with their platform info
  const { data: connections } = await supabase
    .from('platform_connections')
    .select('id, platform_id, is_active, last_synced_at, metadata, platforms!inner(slug, name)')
    .order('created_at', { ascending: false })

  if (!connections) return []

  // Fetch recent sync jobs (last 7 days)
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString()

  const { data: recentJobs } = await supabase
    .from('sync_jobs')
    .select('*')
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })

  const jobs = (recentJobs as unknown as SyncJob[]) ?? []

  // Build summaries
  const summaries: PlatformSyncSummary[] = []

  for (const conn of connections) {
    const c = conn as unknown as {
      id: string
      platform_id: string
      is_active: boolean
      last_synced_at: string | null
      metadata: Record<string, unknown>
      platforms: { slug: string; name: string }
    }

    // Source mapping — find the MetricSource for this platform
    const sourceMap: Record<string, MetricSource> = {
      youtube: 'youtube',
      'youtube-clips': 'youtube',
      meta: 'instagram',
      linkedin: 'linkedin',
      spotify: 'spotify',
      beehiiv: 'beehiiv',
      ga4: 'ga4',
      'ga4-articles': 'ga4',
      skool: 'skool',
      tiktok: 'tiktok',
      twitter: 'twitter_x',
      gsc: 'website',
    }

    const source = sourceMap[c.platforms.slug] ?? 'manual'

    // Filter jobs for this connection
    const connectionJobs = jobs.filter((j) => j.connection_id === c.id)
    const latestJob = connectionJobs[0] ?? null

    summaries.push({
      source,
      platformName: c.platforms.name,
      connectionId: c.id,
      isActive: c.is_active,
      lastSyncedAt: c.last_synced_at,
      lastSyncStatus: latestJob?.status ?? null,
      lastRecordsSynced: latestJob?.records_synced ?? 0,
      lastError: latestJob?.error_message ?? null,
      totalJobsLast7Days: connectionJobs.length,
      totalRecordsLast7Days: connectionJobs.reduce(
        (sum, j) => sum + j.records_synced,
        0,
      ),
      failedJobsLast7Days: connectionJobs.filter(
        (j) => j.status === 'failed',
      ).length,
    })
  }

  return summaries
}
