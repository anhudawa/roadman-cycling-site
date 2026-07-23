import { NextResponse } from 'next/server'
import { getDecayingContent } from '@/lib/queries/decay'

/**
 * GET /api/reports/decay
 * Returns decaying content data as JSON.
 */
export async function GET() {
  const assets = await getDecayingContent()

  return NextResponse.json({ assets })
}
