/**
 * T64 — demand_gap generator.
 *
 * Identifies topics where:
 *   - GSC impressions are high or rising
 *   - No dedicated content asset exists (or existing content ranks poorly)
 *   - A seasonal demand window is approaching
 *
 * Produces statements like:
 *   "Search demand for 'winter turbo training plan' is rising (index 2.8 in Nov);
 *    no dedicated asset exists. Window opens week 40."
 */

import { createClient } from '@/lib/supabase/server'
import type { InsightGenerator, CandidateInsight } from './types'
import { confidenceTier, isoWeek, weekToMonth } from './types'

/** Minimum GSC impressions/week to be worth flagging. */
const MIN_WEEKLY_IMPRESSIONS = 50

/** Weeks ahead to look for upcoming demand windows. */
const LOOKAHEAD_WEEKS = 12

export class DemandGapGenerator implements InsightGenerator {
  name = 'demand_gap'
  type = 'demand_gap' as const

  async run(): Promise<CandidateInsight[]> {
    const supabase = await createClient()
    const now = new Date()
    const currentWeek = isoWeek(now)

    // Find topics with strong upcoming seasonal peaks in search_impressions
    const targetWeeks = Array.from({ length: LOOKAHEAD_WEEKS }, (_, i) =>
      ((currentWeek + i) % 52) + 1,
    )

    const { data: upcomingPeaks, error: peakErr } = await supabase
      .from('seasonal_indices')
      .select(`
        topic_id, iso_week, index_value, confidence_score, confidence,
        topics:topic_id (name, commercial_category, is_trend_tracked)
      `)
      .eq('metric', 'search_impressions')
      .is('source', null)
      .gte('index_value', 1.5)
      .in('confidence', ['emerging', 'probable', 'established'])
      .in('iso_week', targetWeeks)

    if (peakErr || !upcomingPeaks || upcomingPeaks.length === 0) return []

    // Get recent GSC data: topics with impressions but low clicks or poor position
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
      .toISOString()
      .split('T')[0]

    const { data: gscData } = await supabase
      .from('search_console_daily')
      .select('topic_id, impressions, clicks, position')
      .gte('date', thirtyDaysAgo)
      .not('topic_id', 'is', null)

    // Aggregate GSC by topic
    const gscByTopic = new Map<
      string,
      { impressions: number; clicks: number; avgPosition: number; count: number }
    >()
    for (const row of gscData || []) {
      if (!row.topic_id) continue
      const existing = gscByTopic.get(row.topic_id) || {
        impressions: 0,
        clicks: 0,
        avgPosition: 0,
        count: 0,
      }
      existing.impressions += row.impressions
      existing.clicks += row.clicks
      existing.avgPosition += row.position || 0
      existing.count += 1
      gscByTopic.set(row.topic_id, existing)
    }

    // Get asset counts per topic to identify content gaps
    const { data: assetCounts } = await supabase
      .from('asset_topics')
      .select('topic_id')

    const assetsByTopic = new Map<string, number>()
    for (const at of assetCounts || []) {
      assetsByTopic.set(at.topic_id, (assetsByTopic.get(at.topic_id) || 0) + 1)
    }

    // Deduplicate against existing demand_gap insights
    const { data: existing } = await supabase
      .from('insights')
      .select('topic_id, evidence')
      .eq('type', 'demand_gap')
      .in('status', ['candidate', 'validated', 'actioned'])

    const existingTopicWeeks = new Set(
      (existing || []).map((e) => {
        const ev = e.evidence as Record<string, unknown>
        return `${e.topic_id}:${ev.peak_week}`
      }),
    )

    // Group upcoming peaks by topic, take the strongest
    const topicPeaks = new Map<
      string,
      (typeof upcomingPeaks)[0]
    >()
    for (const peak of upcomingPeaks) {
      const existing = topicPeaks.get(peak.topic_id)
      if (!existing || peak.index_value > existing.index_value) {
        topicPeaks.set(peak.topic_id, peak)
      }
    }

    const candidates: CandidateInsight[] = []

    for (const [topicId, peak] of topicPeaks) {
      const topic = peak.topics as unknown as {
        name: string
        commercial_category: string | null
        is_trend_tracked: boolean
      } | null
      if (!topic || !topic.is_trend_tracked) continue

      // Check for content gap
      const assetCount = assetsByTopic.get(topicId) || 0
      const gsc = gscByTopic.get(topicId)

      // Gap criteria: few assets OR high impressions with poor ranking
      const isContentGap = assetCount < 2
      const isPoorRanking =
        gsc && gsc.count > 0 && gsc.avgPosition / gsc.count > 20
      const hasHighDemand =
        gsc && gsc.impressions >= MIN_WEEKLY_IMPRESSIONS

      if (!isContentGap && !isPoorRanking && !hasHighDemand) continue

      // Skip if demand is negligible
      if (!gsc && !isContentGap) continue

      // Deduplicate
      const dedupeKey = `${topicId}:${peak.iso_week}`
      if (existingTopicWeeks.has(dedupeKey)) continue

      const monthLabel = weekToMonth(peak.iso_week)
      const weeksUntilPeak = ((peak.iso_week - currentWeek + 52) % 52) || 52
      const avgPos = gsc && gsc.count > 0 ? Math.round(gsc.avgPosition / gsc.count) : null

      let statement: string
      if (isContentGap) {
        statement =
          `Search demand for ${topic.name} peaks at ${peak.index_value.toFixed(1)}× in ${monthLabel} (week ${peak.iso_week}); ` +
          `no dedicated asset exists (${assetCount} piece${assetCount === 1 ? '' : 's'}). ` +
          `Window opens in ${weeksUntilPeak} week${weeksUntilPeak > 1 ? 's' : ''}.`
      } else {
        statement =
          `${topic.name} demand rising to ${peak.index_value.toFixed(1)}× in ${monthLabel} (week ${peak.iso_week}); ` +
          `current ranking: position ${avgPos ?? '—'} with ${gsc ? gsc.impressions.toLocaleString() : '—'} monthly impressions. ` +
          `Window opens in ${weeksUntilPeak} week${weeksUntilPeak > 1 ? 's' : ''}.`
      }

      const tier = confidenceTier(peak.confidence_score)

      candidates.push({
        type: 'demand_gap',
        statement,
        topic_id: topicId,
        commercial_category: topic.commercial_category,
        evidence: {
          peak_week: peak.iso_week,
          peak_index: Math.round(peak.index_value * 100) / 100,
          weeks_until_peak: weeksUntilPeak,
          asset_count: assetCount,
          is_content_gap: isContentGap,
          gsc_impressions_30d: gsc?.impressions ?? 0,
          gsc_clicks_30d: gsc?.clicks ?? 0,
          avg_position: avgPos,
          source: 'search_console',
        },
        confidence_score: peak.confidence_score,
        confidence: tier,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: weekToDate(now.getFullYear(), peak.iso_week + 2),
        sponsor_safe: false, // demand gaps are internal action items
      })
    }

    return candidates
  }
}

function weekToDate(year: number, week: number): string {
  const w = Math.max(1, Math.min(52, week))
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const date = new Date(jan4.getTime() + ((w - 1) * 7 + 1 - dayOfWeek) * 86400000)
  return date.toISOString().split('T')[0]
}
