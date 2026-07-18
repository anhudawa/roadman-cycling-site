import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/intelligence/anomalies?status=unacknowledged&limit=20
 * Returns detected anomalies, optionally filtered.
 *
 * PATCH /api/intelligence/anomalies
 * Acknowledge or promote an anomaly to an insight.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status') // 'unacknowledged' or 'all'
  const topicId = url.searchParams.get('topic_id')
  const limit = parseInt(url.searchParams.get('limit') || '20')

  let query = supabase
    .from('anomalies')
    .select(`
      *,
      topics:topic_id (name, slug)
    `)
    .order('detected_on', { ascending: false })
    .limit(limit)

  if (status === 'unacknowledged' || !status) {
    query = query.eq('is_acknowledged', false)
  }
  if (topicId) {
    query = query.eq('topic_id', topicId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ anomalies: data || [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const { id, action } = body as { id: string; action: 'acknowledge' | 'promote' }

  if (!id || !action) {
    return NextResponse.json({ error: 'id and action required' }, { status: 400 })
  }

  if (action === 'acknowledge') {
    const { error } = await supabase
      .from('anomalies')
      .update({ is_acknowledged: true })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  if (action === 'promote') {
    // Fetch the anomaly
    const { data: anomaly, error: fetchError } = await supabase
      .from('anomalies')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !anomaly) {
      return NextResponse.json({ error: 'Anomaly not found' }, { status: 404 })
    }

    // Create an insight from the anomaly
    const { data: insight, error: insertError } = await supabase
      .from('insights')
      .insert({
        type: 'anomaly' as const,
        status: 'candidate' as const,
        statement: `Anomaly detected: ${anomaly.metric} was ${anomaly.direction === 'above' ? 'above' : 'below'} expected (z=${anomaly.z_score.toFixed(1)}) on ${anomaly.detected_on}`,
        topic_id: anomaly.topic_id,
        evidence: {
          anomaly_id: anomaly.id,
          expected: anomaly.expected_value,
          actual: anomaly.actual_value,
          z_score: anomaly.z_score,
          direction: anomaly.direction,
        },
        confidence_score: Math.min(anomaly.z_score * 20, 100),
        confidence: anomaly.z_score > 4 ? 'established' : anomaly.z_score > 3 ? 'probable' : 'emerging',
        valid_from: anomaly.detected_on,
        sponsor_safe: false,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Link the anomaly to the insight
    await supabase
      .from('anomalies')
      .update({
        is_acknowledged: true,
        promoted_insight_id: insight?.id,
      })
      .eq('id', id)

    return NextResponse.json({ ok: true, insight_id: insight?.id })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
