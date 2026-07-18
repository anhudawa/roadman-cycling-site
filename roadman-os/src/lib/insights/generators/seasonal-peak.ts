/**
 * T64 — seasonal_peak generator.
 *
 * Scans seasonal_indices for topics with strong peaks (index_value ≥ 1.5)
 * and generates statements like:
 *   "Creatine content earns 3.2× its annual-average engagement in weeks 1–4 (January).
 *    Established: 4 years, peak repeated every year."
 *
 * Only generates for topics where confidence is at least "emerging".
 * Deduplicates against existing non-dismissed insights.
 */

import { createClient } from '@/lib/supabase/server'
import type { InsightGenerator, CandidateInsight } from './types'
import { confidenceTier, weekToMonth } from './types'

/** Minimum seasonal index to be considered a "peak". */
const PEAK_THRESHOLD = 1.5

/** How many consecutive weeks can form a single peak window. */
const MAX_PEAK_WINDOW = 8

export class SeasonalPeakGenerator implements InsightGenerator {
  name = 'seasonal_peak'
  type = 'seasonal_peak' as const

  async run(): Promise<CandidateInsight[]> {
    const supabase = await createClient()

    // Fetch all seasonal indices above threshold with topic info
    const { data: indices, error } = await supabase
      .from('seasonal_indices')
      .select(`
        topic_id, source, metric, iso_week, index_value,
        per_year_values, years_observed, sample_assets,
        confidence_score, confidence,
        topics:topic_id (name, commercial_category)
      `)
      .gte('index_value', PEAK_THRESHOLD)
      .in('confidence', ['emerging', 'probable', 'established'])
      .is('source', null) // all-platform rollup
      .order('topic_id')
      .order('metric')
      .order('iso_week')

    if (error || !indices || indices.length === 0) return []

    // Fetch existing non-dismissed seasonal_peak insights to deduplicate
    const { data: existing } = await supabase
      .from('insights')
      .select('topic_id, evidence')
      .eq('type', 'seasonal_peak')
      .in('status', ['candidate', 'validated', 'actioned'])

    const existingKeys = new Set(
      (existing || []).map((e) => {
        const ev = e.evidence as Record<string, unknown>
        return `${e.topic_id}:${ev.metric}:${ev.peak_start_week}-${ev.peak_end_week}`
      }),
    )

    // Group indices by topic_id × metric to find contiguous peak windows
    const grouped = new Map<string, typeof indices>()
    for (const idx of indices) {
      const key = `${idx.topic_id}:${idx.metric}`
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(idx)
    }

    const candidates: CandidateInsight[] = []

    for (const [_key, weeks] of grouped) {
      // Sort by iso_week
      weeks.sort((a, b) => a.iso_week - b.iso_week)

      // Find contiguous windows (allowing 1-week gaps for smoothing)
      const windows: (typeof weeks)[] = []
      let currentWindow: typeof weeks = [weeks[0]]

      for (let i = 1; i < weeks.length; i++) {
        if (weeks[i].iso_week - weeks[i - 1].iso_week <= 2) {
          currentWindow.push(weeks[i])
        } else {
          windows.push(currentWindow)
          currentWindow = [weeks[i]]
        }
      }
      windows.push(currentWindow)

      for (const window of windows) {
        if (window.length === 0) continue
        // Cap window size
        const trimmed = window.slice(0, MAX_PEAK_WINDOW)

        const peakIdx = trimmed.reduce((best, w) =>
          w.index_value > best.index_value ? w : best,
        )

        const topic = peakIdx.topics as unknown as { name: string; commercial_category: string | null } | null
        if (!topic) continue

        const startWeek = trimmed[0].iso_week
        const endWeek = trimmed[trimmed.length - 1].iso_week
        const avgIndex = trimmed.reduce((s, w) => s + w.index_value, 0) / trimmed.length
        const maxConfidence = Math.max(...trimmed.map((w) => w.confidence_score))
        const maxYears = Math.max(...trimmed.map((w) => w.years_observed))

        // Deduplicate
        const dedupeKey = `${peakIdx.topic_id}:${peakIdx.metric}:${startWeek}-${endWeek}`
        if (existingKeys.has(dedupeKey)) continue

        // Build per-year evidence
        const perYearBreakdown: Record<string, number> = {}
        for (const w of trimmed) {
          const pyv = w.per_year_values as Record<string, number>
          for (const [year, val] of Object.entries(pyv)) {
            perYearBreakdown[year] = (perYearBreakdown[year] || 0) + val
          }
        }
        // Average per year across the window
        const yearsInData = Object.keys(perYearBreakdown)
        for (const y of yearsInData) {
          perYearBreakdown[y] = Math.round((perYearBreakdown[y] / trimmed.length) * 100) / 100
        }

        const tier = confidenceTier(maxConfidence)
        const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1)
        const monthLabel = weekToMonth(Math.round((startWeek + endWeek) / 2))
        const metricLabel = peakIdx.metric.replace(/_/g, ' ')

        const statement =
          `${topic.name} content earns ${avgIndex.toFixed(1)}× its annual-average ${metricLabel} ` +
          `in weeks ${startWeek}–${endWeek} (${monthLabel}). ` +
          `${tierLabel}: ${maxYears} year${maxYears > 1 ? 's' : ''} of data` +
          (maxYears > 1 ? ', peak repeated each year.' : '.')

        // Valid window: from 2 weeks before peak start to 2 weeks after peak end
        const now = new Date()
        const year = now.getFullYear()
        const validFrom = weekToDate(year, startWeek - 2)
        const validUntil = weekToDate(year, endWeek + 2)

        candidates.push({
          type: 'seasonal_peak',
          statement,
          topic_id: peakIdx.topic_id,
          commercial_category: topic.commercial_category,
          evidence: {
            metric: peakIdx.metric,
            peak_start_week: startWeek,
            peak_end_week: endWeek,
            avg_index: Math.round(avgIndex * 100) / 100,
            peak_index: Math.round(peakIdx.index_value * 100) / 100,
            years_observed: maxYears,
            sample_assets: Math.max(...trimmed.map((w) => w.sample_assets)),
            per_year_breakdown: perYearBreakdown,
            source: 'all_platforms',
          },
          confidence_score: maxConfidence,
          confidence: tier,
          valid_from: validFrom,
          valid_until: validUntil,
          sponsor_safe: tier === 'established',
        })
      }
    }

    return candidates
  }
}

/** Approximate date for a given ISO year + week. */
function weekToDate(year: number, week: number): string {
  // Clamp week to 1–52
  const w = Math.max(1, Math.min(52, week))
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const date = new Date(jan4.getTime() + ((w - 1) * 7 + 1 - dayOfWeek) * 86400000)
  return date.toISOString().split('T')[0]
}
