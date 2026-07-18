import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/cron/aggregate-topics
 * Vercel Cron trigger for aggregate_topic_daily_metrics().
 * Schedule: 04:30 UTC daily
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('aggregate_topic_daily_metrics', {
    p_lookback_days: 3,
  })

  if (error) {
    console.error('[cron/aggregate-topics] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    result: data,
    ran_at: new Date().toISOString(),
  })
}
