import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { bulkEmbedAll } from '@/lib/embeddings/bulk-embed'

/**
 * POST /api/embeddings/bulk
 * Admin-only: triggers bulk embedding of all content without embeddings.
 */
export async function POST() {
  try {
    const profile = await requireAuth()

    if (profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 },
      )
    }

    const result = await bulkEmbedAll()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, progress: result.progress },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      syncJobId: result.syncJobId,
      progress: result.progress,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
