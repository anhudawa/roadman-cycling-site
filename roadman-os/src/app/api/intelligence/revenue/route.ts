import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/intelligence/revenue?year=2026&month=...&from=...&to=...&topic_id=...&attribution_method=...
 * Revenue Attribution — returns revenue breakdown by topic, month, attribution method,
 * NDY join curve, and cohort view. UTM-attributed and inferred are never blended.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const year = url.searchParams.get('year')
  const month = url.searchParams.get('month')
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const topicId = url.searchParams.get('topic_id')
  const attributionMethod = url.searchParams.get('attribution_method')

  // Determine date range
  let startDate: string
  let endDate: string

  if (from && to) {
    startDate = from
    endDate = to
  } else if (year) {
    const y = parseInt(year, 10)
    if (month) {
      const m = parseInt(month, 10)
      startDate = `${y}-${String(m).padStart(2, '0')}-01`
      const lastDay = new Date(y, m, 0).getDate()
      endDate = `${y}-${String(m).padStart(2, '0')}-${lastDay}`
    } else {
      startDate = `${y}-01-01`
      endDate = `${y}-12-31`
    }
  } else {
    // Default: current year
    const now = new Date()
    startDate = `${now.getFullYear()}-01-01`
    endDate = `${now.getFullYear()}-12-31`
  }

  // Fetch revenue events within the date range
  let eventsQuery = supabase
    .from('revenue_events')
    .select('*')
    .gte('occurred_at', startDate)
    .lte('occurred_at', endDate + 'T23:59:59')
    .order('occurred_at', { ascending: true })

  if (topicId) {
    eventsQuery = eventsQuery.eq('attributed_topic_id', topicId)
  }
  if (attributionMethod) {
    eventsQuery = eventsQuery.eq('attribution_method', attributionMethod)
  }

  const { data: events, error: eventsError } = await eventsQuery
  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 })
  }

  const allEvents = events || []

  // Fetch topics for name lookups
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name, slug, commercial_category')

  const topicMap = new Map((topics || []).map((t) => [t.id, t]))

  // Fetch products for type lookups
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, type, price_cents')

  const productMap = new Map((products || []).map((p) => [p.id, p]))

  // Fetch assets for the NDY content overlay
  const { data: assets } = await supabase
    .from('assets')
    .select('id, title, slug, type, publish_date')
    .gte('publish_date', startDate)
    .lte('publish_date', endDate)
    .order('publish_date', { ascending: true })

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------

  const totalRevenueCents = allEvents.reduce((sum, e) => {
    const amt = e.event_type === 'churn' ? -Math.abs(e.amount_cents) : e.amount_cents
    return sum + amt
  }, 0)

  const byEventType: Record<string, { count: number; revenue_cents: number }> = {}
  const byAttrMethod: Record<string, { count: number; revenue_cents: number }> = {}

  for (const e of allEvents) {
    const amt = e.event_type === 'churn' ? -Math.abs(e.amount_cents) : e.amount_cents
    const et = e.event_type
    if (!byEventType[et]) byEventType[et] = { count: 0, revenue_cents: 0 }
    byEventType[et].count += 1
    byEventType[et].revenue_cents += amt

    const am = e.attribution_method || 'unset'
    if (!byAttrMethod[am]) byAttrMethod[am] = { count: 0, revenue_cents: 0 }
    byAttrMethod[am].count += 1
    byAttrMethod[am].revenue_cents += amt
  }

  const summary = {
    total_revenue_cents: totalRevenueCents,
    event_count: allEvents.length,
    by_event_type: byEventType,
    by_attribution_method: byAttrMethod,
  }

  // ---------------------------------------------------------------------------
  // By Topic
  // ---------------------------------------------------------------------------

  const topicAgg: Record<string, {
    topic_id: string
    topic_name: string
    revenue_cents: number
    count: number
    by_attribution_method: Record<string, { revenue_cents: number; count: number }>
  }> = {}

  for (const e of allEvents) {
    const tid = e.attributed_topic_id || 'unattributed'
    const amt = e.event_type === 'churn' ? -Math.abs(e.amount_cents) : e.amount_cents

    if (!topicAgg[tid]) {
      const topic = topicMap.get(tid)
      topicAgg[tid] = {
        topic_id: tid,
        topic_name: topic?.name || 'Unattributed',
        revenue_cents: 0,
        count: 0,
        by_attribution_method: {},
      }
    }

    topicAgg[tid].revenue_cents += amt
    topicAgg[tid].count += 1

    const am = e.attribution_method || 'unset'
    if (!topicAgg[tid].by_attribution_method[am]) {
      topicAgg[tid].by_attribution_method[am] = { revenue_cents: 0, count: 0 }
    }
    topicAgg[tid].by_attribution_method[am].revenue_cents += amt
    topicAgg[tid].by_attribution_method[am].count += 1
  }

  const byTopic = Object.values(topicAgg).sort((a, b) => b.revenue_cents - a.revenue_cents)

  // ---------------------------------------------------------------------------
  // By Month
  // ---------------------------------------------------------------------------

  const monthAgg: Record<string, {
    month: string
    revenue_cents: number
    count: number
    by_event_type: Record<string, number>
  }> = {}

  for (const e of allEvents) {
    const m = e.occurred_at.slice(0, 7) // YYYY-MM
    const amt = e.event_type === 'churn' ? -Math.abs(e.amount_cents) : e.amount_cents

    if (!monthAgg[m]) {
      monthAgg[m] = { month: m, revenue_cents: 0, count: 0, by_event_type: {} }
    }

    monthAgg[m].revenue_cents += amt
    monthAgg[m].count += 1
    monthAgg[m].by_event_type[e.event_type] = (monthAgg[m].by_event_type[e.event_type] || 0) + amt
  }

  const byMonth = Object.values(monthAgg).sort((a, b) => a.month.localeCompare(b.month))

  // ---------------------------------------------------------------------------
  // By Attribution (honesty labels)
  // ---------------------------------------------------------------------------

  const absTotal = allEvents.reduce((s, e) => s + Math.abs(e.amount_cents), 0) || 1

  const byAttribution = Object.entries(byAttrMethod).map(([method, data]) => ({
    attribution_method: method,
    revenue_cents: data.revenue_cents,
    count: data.count,
    percentage: Math.round((Math.abs(data.revenue_cents) / absTotal) * 10000) / 100,
    is_direct: method === 'utm',
  })).sort((a, b) => b.revenue_cents - a.revenue_cents)

  // ---------------------------------------------------------------------------
  // NDY Join Curve
  // ---------------------------------------------------------------------------

  // Filter for community join events
  const ndyJoinEvents = allEvents.filter((e) => {
    if (e.event_type !== 'join') return false
    const product = e.product_id ? productMap.get(e.product_id) : null
    return product?.type === 'community'
  })

  // Group by ISO week
  function getISOWeekKey(dateStr: string): string {
    const d = new Date(dateStr)
    const jan1 = new Date(d.getFullYear(), 0, 1)
    const dayOfYear = Math.floor((d.getTime() - jan1.getTime()) / 86400000) + 1
    const weekNum = Math.ceil(dayOfYear / 7)
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
  }

  function getWeekStartEnd(weekKey: string): { start: string; end: string } {
    const [yearStr, wStr] = weekKey.split('-W')
    const yr = parseInt(yearStr, 10)
    const wk = parseInt(wStr, 10)
    const jan1 = new Date(yr, 0, 1)
    const dayOffset = (wk - 1) * 7
    const start = new Date(jan1.getTime() + dayOffset * 86400000)
    const end = new Date(start.getTime() + 6 * 86400000)
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    }
  }

  const weeklyJoins: Record<string, { week: string; join_count: number; content_published: { id: string; title: string; type: string }[] }> = {}

  for (const e of ndyJoinEvents) {
    const wk = getISOWeekKey(e.occurred_at)
    if (!weeklyJoins[wk]) {
      weeklyJoins[wk] = { week: wk, join_count: 0, content_published: [] }
    }
    weeklyJoins[wk].join_count += 1
  }

  // Overlay content published that week
  for (const asset of assets || []) {
    if (!asset.publish_date) continue
    const wk = getISOWeekKey(asset.publish_date)
    if (!weeklyJoins[wk]) {
      weeklyJoins[wk] = { week: wk, join_count: 0, content_published: [] }
    }
    weeklyJoins[wk].content_published.push({
      id: asset.id,
      title: asset.title,
      type: asset.type,
    })
  }

  const ndyJoinCurve = Object.values(weeklyJoins).sort((a, b) => a.week.localeCompare(b.week))

  // ---------------------------------------------------------------------------
  // Cohort View
  // ---------------------------------------------------------------------------

  // Group events by the month of first event per unique source (product_id + event_type)
  const sourceFirstMonth: Record<string, string> = {}
  const sortedEvents = [...allEvents].sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))

  for (const e of sortedEvents) {
    const sourceKey = `${e.product_id || 'none'}_${e.event_type}`
    if (!sourceFirstMonth[sourceKey]) {
      sourceFirstMonth[sourceKey] = e.occurred_at.slice(0, 7)
    }
  }

  // Build cohort: for each first-month, track revenue in subsequent months
  const cohortData: Record<string, Record<string, { revenue_cents: number; count: number }>> = {}

  for (const e of allEvents) {
    const sourceKey = `${e.product_id || 'none'}_${e.event_type}`
    const cohortMonth = sourceFirstMonth[sourceKey]
    const eventMonth = e.occurred_at.slice(0, 7)
    const amt = e.event_type === 'churn' ? -Math.abs(e.amount_cents) : e.amount_cents

    if (!cohortMonth) continue
    if (!cohortData[cohortMonth]) cohortData[cohortMonth] = {}
    if (!cohortData[cohortMonth][eventMonth]) {
      cohortData[cohortMonth][eventMonth] = { revenue_cents: 0, count: 0 }
    }
    cohortData[cohortMonth][eventMonth].revenue_cents += amt
    cohortData[cohortMonth][eventMonth].count += 1
  }

  // Get all months for columns
  const allMonths = [...new Set(allEvents.map((e) => e.occurred_at.slice(0, 7)))].sort()

  const cohortView = {
    cohort_months: Object.keys(cohortData).sort(),
    all_months: allMonths,
    data: cohortData,
  }

  // ---------------------------------------------------------------------------
  // Response
  // ---------------------------------------------------------------------------

  return NextResponse.json({
    summary,
    by_topic: byTopic,
    by_month: byMonth,
    by_attribution: byAttribution,
    ndy_join_curve: ndyJoinCurve,
    cohort_view: cohortView,
    period: { start: startDate, end: endDate },
  })
}
