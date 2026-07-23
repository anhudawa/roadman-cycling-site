import { NextResponse } from 'next/server'
import { z } from 'zod'
import { runPlatformSync, runAllSyncs } from '@/lib/sync/sync-engine'

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const manualSyncSchema = z.object({
  /** If provided, sync only this connection. Otherwise sync all. */
  connectionId: z.string().uuid().optional(),
})

// ---------------------------------------------------------------------------
// POST /api/sync/manual
// ---------------------------------------------------------------------------

/**
 * Manually trigger a sync for one or all platform connections.
 *
 * Body:
 *   { connectionId?: string }
 *
 * If connectionId is provided, syncs that single connection.
 * If omitted, syncs all active connections.
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const parsed = manualSyncSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid request body' },
        { status: 400 },
      )
    }

    const { connectionId } = parsed.data

    if (connectionId) {
      // Sync a single connection
      const result = await runPlatformSync(connectionId, 'manual')

      return NextResponse.json({
        success: result.success,
        platformSlug: result.platformSlug,
        recordsSynced: result.recordsSynced,
        syncJobId: result.syncJobId,
        error: result.error,
      })
    }

    // Sync all active connections
    const result = await runAllSyncs('manual')

    return NextResponse.json({
      success: result.failed === 0,
      totalConnections: result.totalConnections,
      successful: result.successful,
      failed: result.failed,
      totalRecordsSynced: result.results.reduce(
        (sum, r) => sum + r.recordsSynced,
        0,
      ),
      results: result.results.map((r) => ({
        connectionId: r.connectionId,
        platformSlug: r.platformSlug,
        success: r.success,
        recordsSynced: r.recordsSynced,
        error: r.error,
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Manual sync failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
