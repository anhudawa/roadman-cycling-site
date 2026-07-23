import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { findDuplicates } from '@/lib/intelligence/duplicate-detection'

/**
 * GET /api/intelligence/duplicates?threshold=0.92
 * Returns duplicate pairs with similarity above the threshold.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const url = new URL(request.url)
    const threshold = parseFloat(url.searchParams.get('threshold') || '0.92')

    const pairs = await findDuplicates(threshold)

    return NextResponse.json({ pairs })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
