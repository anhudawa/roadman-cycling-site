/**
 * Sync orchestrator — common logic shared by all platform sync services.
 *
 * Handles rate limiting, retry with exponential backoff, progress tracking,
 * sync job lifecycle (start → progress → complete/fail), and batch inserts.
 */

import { createClient } from '@/lib/supabase/server'
import type { PerformanceRecordInsert, MetricSource } from '@/types/database'
import type { SyncJobUpdate, SyncResult } from './types'

// ==========================================================================
// Rate limiter
// ==========================================================================

type RateLimitConfig = {
  /** Maximum requests allowed in the window */
  maxRequests: number
  /** Window duration in milliseconds */
  windowMs: number
}

type RateLimiterState = {
  timestamps: number[]
}

const rateLimiters = new Map<string, RateLimiterState>()

const PLATFORM_RATE_LIMITS: Record<string, RateLimitConfig> = {
  youtube: { maxRequests: 50, windowMs: 60_000 },
  meta: { maxRequests: 200, windowMs: 60_000 },
  linkedin: { maxRequests: 100, windowMs: 60_000 },
  beehiiv: { maxRequests: 30, windowMs: 60_000 },
  ga4: { maxRequests: 50, windowMs: 60_000 },
  tiktok: { maxRequests: 100, windowMs: 60_000 },
  twitter: { maxRequests: 300, windowMs: 900_000 }, // 15-min window
  spotify: { maxRequests: 50, windowMs: 30_000 },
  gsc: { maxRequests: 50, windowMs: 60_000 },
}

/**
 * Check if a request can proceed under rate limits.
 * Returns the number of milliseconds to wait, or 0 if clear.
 */
export function checkRateLimit(platform: string): number {
  const config = PLATFORM_RATE_LIMITS[platform]
  if (!config) return 0

  const now = Date.now()
  const state = rateLimiters.get(platform) ?? { timestamps: [] }

  // Prune timestamps outside the window
  state.timestamps = state.timestamps.filter(
    (ts) => now - ts < config.windowMs,
  )

  if (state.timestamps.length >= config.maxRequests) {
    const oldestInWindow = state.timestamps[0]
    const waitMs = config.windowMs - (now - oldestInWindow) + 100
    return waitMs
  }

  state.timestamps.push(now)
  rateLimiters.set(platform, state)
  return 0
}

/**
 * Wait for rate limit clearance, then record the request.
 */
export async function waitForRateLimit(platform: string): Promise<void> {
  const waitMs = checkRateLimit(platform)
  if (waitMs > 0) {
    await sleep(waitMs)
    // Re-check after waiting
    const secondWait = checkRateLimit(platform)
    if (secondWait > 0) {
      await sleep(secondWait)
    }
  }
}

// ==========================================================================
// Retry with exponential backoff
// ==========================================================================

export type RetryConfig = {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
}

const DEFAULT_RETRY: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30_000,
}

/**
 * Execute an async function with exponential backoff retry.
 * Retries on any error except 4xx client errors (except 429).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs } = {
    ...DEFAULT_RETRY,
    ...config,
  }

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      // Don't retry client errors (except 429 Too Many Requests)
      if (isClientError(lastError) && !isRateLimitError(lastError)) {
        throw lastError
      }

      if (attempt < maxRetries) {
        const delay = Math.min(
          baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
          maxDelayMs,
        )
        await sleep(delay)
      }
    }
  }

  throw lastError ?? new Error('Retry exhausted')
}

function isClientError(err: Error): boolean {
  const msg = err.message.toLowerCase()
  return /\b(400|401|403|404|405|409|422)\b/.test(msg)
}

function isRateLimitError(err: Error): boolean {
  const msg = err.message.toLowerCase()
  return msg.includes('429') || msg.includes('rate limit') || msg.includes('quota')
}

// ==========================================================================
// Sync job lifecycle
// ==========================================================================

/**
 * Update a sync job row in Supabase.
 */
export async function updateSyncJob(
  syncJobId: string,
  fields: SyncJobUpdate,
): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('sync_jobs')
    .update({
      status: fields.status,
      started_at: fields.started_at,
      completed_at: fields.completed_at,
      records_synced: fields.records_synced ?? 0,
      error_message: fields.error_message ?? null,
      metadata: fields.metadata ?? {},
    })
    .eq('id', syncJobId)
}

/**
 * Mark a sync job as running.
 */
export async function startSyncJob(syncJobId: string): Promise<void> {
  await updateSyncJob(syncJobId, {
    status: 'running',
    started_at: new Date().toISOString(),
  })
}

/**
 * Mark a sync job as completed.
 */
export async function completeSyncJob(
  syncJobId: string,
  recordsSynced: number,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await updateSyncJob(syncJobId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    records_synced: recordsSynced,
    metadata,
  })
}

/**
 * Mark a sync job as failed.
 */
export async function failSyncJob(
  syncJobId: string,
  errorMessage: string,
): Promise<void> {
  await updateSyncJob(syncJobId, {
    status: 'failed',
    completed_at: new Date().toISOString(),
    error_message: errorMessage,
  })
}

/**
 * Update connection.last_synced_at after a successful sync.
 */
export async function updateConnectionLastSynced(
  connectionId: string,
): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('platform_connections')
    .update({
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
}

// ==========================================================================
// Batch insert helpers
// ==========================================================================

const BATCH_SIZE = 100

/**
 * Insert performance records in batches of 100.
 * Returns the total number of successfully inserted records.
 */
export async function batchInsertPerformanceRecords(
  records: PerformanceRecordInsert[],
): Promise<number> {
  if (records.length === 0) return 0

  const supabase = await createClient()
  let inserted = 0

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('performance_records')
      .insert(batch)

    if (!error) {
      inserted += batch.length
    } else {
      console.error(
        `[sync-orchestrator] Batch insert failed at offset ${i}:`,
        error.message,
      )
    }
  }

  return inserted
}

/**
 * Delete existing performance records for a source before re-inserting.
 * Used for full-refresh syncs.
 */
export async function deleteExistingRecords(
  source: MetricSource,
  filterKey: string,
  filterValue: string,
): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('performance_records')
    .delete()
    .eq('source', source)
    .filter(`custom_metrics->>${filterKey}`, 'eq', filterValue)
}

// ==========================================================================
// Cron auth helper
// ==========================================================================

/**
 * Validate the CRON_SECRET from an incoming request.
 * Returns true if authorised, false otherwise.
 */
export function validateCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

// ==========================================================================
// Full sync orchestration
// ==========================================================================

/**
 * Run a full sync for a platform, handling the complete lifecycle:
 * 1. Start sync job
 * 2. Execute the sync function
 * 3. Insert records
 * 4. Complete/fail the sync job
 * 5. Update connection timestamp
 */
export async function orchestrateSync(
  connectionId: string,
  syncJobId: string,
  syncFn: () => Promise<PerformanceRecordInsert[]>,
): Promise<SyncResult> {
  try {
    await startSyncJob(syncJobId)

    const records = await syncFn()
    const inserted = await batchInsertPerformanceRecords(records)

    await completeSyncJob(syncJobId, inserted)
    await updateConnectionLastSynced(connectionId)

    return { success: true, recordsSynced: inserted }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown sync error'
    await failSyncJob(syncJobId, message)
    return { success: false, recordsSynced: 0, error: message }
  }
}

// ==========================================================================
// Utilities
// ==========================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
