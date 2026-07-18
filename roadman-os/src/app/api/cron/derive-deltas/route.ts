import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/cron/derive-deltas
 * Vercel Cron trigger for the pg_cron derive_performance_daily() function.
 * Fallback for environments without pg_cron — calls the SQL function directly.
 * Schedule: 04:00 UTC daily
 */
export async function GET(request: Request) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('derive_performance_daily', {
    p_lookback_days: 3,
  })

  if (error) {
    console.error('[cron/derive-deltas] Error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    result: data,
    ran_at: new Date().toISOString(),
  })
}
