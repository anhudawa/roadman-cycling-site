import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { identifyGaps } from '@/lib/intelligence/gap-detection'

/**
 * GET /api/intelligence/gaps
 * Returns gap analysis: pillar coverage, topic coverage, format diversity, recommendations.
 */
export async function GET() {
  try {
    await requireAuth()
    const analysis = await identifyGaps()
    return NextResponse.json(analysis)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
