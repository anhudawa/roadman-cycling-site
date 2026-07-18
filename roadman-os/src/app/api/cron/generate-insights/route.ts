import { NextResponse } from 'next/server'
import { runAllGenerators } from '@/lib/insights/generators'

/**
 * GET /api/cron/generate-insights
 * Vercel Cron trigger for the insight generator framework (T64).
 * Schedule: Mondays 06:00 UTC (after seasonal indices + forecasts recompute)
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const results = await runAllGenerators()

    const totalProduced = results.reduce((s, r) => s + r.candidates_produced, 0)
    const totalInserted = results.reduce((s, r) => s + r.candidates_inserted, 0)
    const hasErrors = results.some((r) => r.errors.length > 0)

    return NextResponse.json({
      ok: !hasErrors,
      total_candidates_produced: totalProduced,
      total_candidates_inserted: totalInserted,
      generators: results,
      ran_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[cron/generate-insights] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
