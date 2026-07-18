/**
 * T66 — timing_recommendation generator.
 *
 * Works backwards from seasonal demand peaks to recommend when to publish.
 * Logic: peak_week − format_lead_time − SEO_ramp = publish_by_week.
 *
 * Lead times:
 *   blog: 6 weeks (SEO indexing + ranking ramp)
 *   video: 2 weeks (production + initial algorithm push)
 *   newsletter: 1 week (write + schedule)
 *   podcast: 3 weeks (record + edit + publish + indexing)
 *
 * Only generates for peaks arriving in the next 16 weeks.
 */

import { createClient } from '@/lib/supabase/server'
import type { InsightGenerator, CandidateInsight } from './types'
import { confidenceTier, isoWeek, weekToMonth } from './types'

const FORMAT_LEAD_TIMES: Record<string, { weeks: number; label: string }> = {
  blog: { weeks: 6, label: 'blog post' },
  video: { weeks: 2, label: 'video' },
  newsletter: { weeks: 1, label: 'newsletter' },
  podcast: { weeks: 3, label: 'podcast episode' },
}

const LOOKAHEAD_WEEKS = 16

export class TimingRecommendationGenerator implements InsightGenerator {
  name = 'timing_recommendation'
  type = 'timing_recommendation' as const

  async run(): Promise<CandidateInsight[]> {
    const supabase = await createClient()
    const now = new Date()
    const currentWeek = isoWeek(now)

    // Find upcoming peaks in the next LOOKAHEAD_WEEKS
    const targetWeeks = Array.from({ length: LOOKAHEAD_WEEKS }, (_, i) =>
      ((currentWeek + i) % 52) + 1,
    )

    const { data: peaks, error } = await supabase
      .from('seasonal_indices')
      .select(`
        topic_id, iso_week, index_value, metric,
        confidence_score, confidence, years_observed,
        topics:topic_id (name, commercial_category)
      `)
      .gte('index_value', 1.5)
      .in('confidence', ['probable', 'established'])
      .is('source', null)
      .eq('metric', 'views') // primary metric for timing
      .in('iso_week', targetWeeks)
      .order('index_value', { ascending: false })

    if (error || !peaks || peaks.length === 0) return []

    // Deduplicate against existing timing_recommendation insights
    const { data: existing } = await supabase
      .from('insights')
      .select('topic_id, evidence')
      .eq('type', 'timing_recommendation')
      .in('status', ['candidate', 'validated', 'actioned'])

    const existingKeys = new Set(
      (existing || []).map((e) => {
        const ev = e.evidence as Record<string, unknown>
        return `${e.topic_id}:${ev.peak_week}:${ev.format}`
      }),
    )

    // Group peaks by topic, take the strongest single peak per topic
    const topicBestPeak = new Map<string, (typeof peaks)[0]>()
    for (const peak of peaks) {
      const existing = topicBestPeak.get(peak.topic_id)
      if (!existing || peak.index_value > existing.index_value) {
        topicBestPeak.set(peak.topic_id, peak)
      }
    }

    const candidates: CandidateInsight[] = []

    for (const [topicId, peak] of topicBestPeak) {
      const topic = peak.topics as unknown as { name: string; commercial_category: string | null } | null
      if (!topic) continue

      const weeksUntilPeak = ((peak.iso_week - currentWeek + 52) % 52) || 52

      // Generate a recommendation per format
      for (const [format, config] of Object.entries(FORMAT_LEAD_TIMES)) {
        const publishByWeek = ((peak.iso_week - config.weeks + 52) % 52) || 52
        const weeksUntilPublish = ((publishByWeek - currentWeek + 52) % 52) || 52

        // Only recommend if the publish window is in the future (or within this week)
        if (weeksUntilPublish > LOOKAHEAD_WEEKS) continue

        // Deduplicate
        const dedupeKey = `${topicId}:${peak.iso_week}:${format}`
        if (existingKeys.has(dedupeKey)) continue

        const publishMonth = weekToMonth(publishByWeek)
        const peakMonth = weekToMonth(peak.iso_week)
        const tier = confidenceTier(peak.confidence_score)

        const statement =
          `Publish ${topic.name} ${config.label} by week ${publishByWeek} (${publishMonth}) ` +
          `to capture the ${peakMonth} demand peak (${peak.index_value.toFixed(1)}× average). ` +
          `${config.weeks}-week lead time for ${format} SEO/algorithm ramp. ` +
          `${weeksUntilPublish} week${weeksUntilPublish > 1 ? 's' : ''} until publish window.`

        candidates.push({
          type: 'timing_recommendation',
          statement,
          topic_id: topicId,
          commercial_category: topic.commercial_category,
          evidence: {
            format,
            lead_time_weeks: config.weeks,
            peak_week: peak.iso_week,
            peak_index: Math.round(peak.index_value * 100) / 100,
            publish_by_week: publishByWeek,
            weeks_until_publish: weeksUntilPublish,
            weeks_until_peak: weeksUntilPeak,
            years_observed: peak.years_observed,
          },
          confidence_score: peak.confidence_score,
          confidence: tier,
          valid_from: new Date().toISOString().split('T')[0],
          valid_until: weekToDate(now.getFullYear(), publishByWeek + 2),
          sponsor_safe: false, // timing recs are internal planning tools
        })
      }
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
