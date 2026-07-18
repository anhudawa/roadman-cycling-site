/**
 * T67 — format_effectiveness generator.
 *
 * Per topic, compares engagement-per-piece across asset types.
 * Only compares formats with ≥3 pieces each (minimum sample).
 *
 * Produces statements like:
 *   "Video outperforms blog 4:1 for nutrition topics (12 videos avg 8,400
 *    engagement vs 9 posts avg 2,100). Sample: 21 pieces over 18 months."
 */

import { createClient } from '@/lib/supabase/server'
import type { InsightGenerator, CandidateInsight } from './types'
import { confidenceTier } from './types'
import type { AssetType } from '@/types/database'

/** Minimum pieces per format before comparing. */
const MIN_PIECES_PER_FORMAT = 3

/** Minimum ratio to flag as significant. */
const MIN_RATIO = 1.5

/** Human-readable format labels */
const FORMAT_LABELS: Partial<Record<AssetType, string>> = {
  youtube_video: 'video',
  blog_post: 'blog',
  podcast_episode: 'podcast',
  newsletter: 'newsletter',
  reel: 'reel',
  short: 'short',
  carousel: 'carousel',
  social_post: 'social post',
}

export class FormatEffectivenessGenerator implements InsightGenerator {
  name = 'format_effectiveness'
  type = 'format_effectiveness' as const

  async run(): Promise<CandidateInsight[]> {
    const supabase = await createClient()

    // Get all published assets with their topics and types
    // Then join to performance_daily for engagement data
    const { data: assets, error: assetErr } = await supabase
      .from('assets')
      .select(`
        id, type, title, publish_date,
        asset_topics (topic_id)
      `)
      .eq('status', 'published')
      .not('publish_date', 'is', null)

    if (assetErr || !assets || assets.length === 0) return []

    // Get publications and their total performance
    const { data: publications } = await supabase
      .from('publications')
      .select('id, asset_id')

    const pubByAsset = new Map<string, string[]>()
    for (const pub of publications || []) {
      if (!pubByAsset.has(pub.asset_id)) pubByAsset.set(pub.asset_id, [])
      pubByAsset.get(pub.asset_id)!.push(pub.id)
    }

    // Get aggregated performance per publication
    const { data: perfData } = await supabase
      .from('performance_daily')
      .select('publication_id, views, likes, comments, shares, saves')

    // Aggregate performance by publication
    const perfByPub = new Map<string, { views: number; engagement: number }>()
    for (const row of perfData || []) {
      const existing = perfByPub.get(row.publication_id) || { views: 0, engagement: 0 }
      existing.views += Number(row.views)
      existing.engagement += Number(row.likes) + Number(row.comments) + Number(row.shares) + Number(row.saves)
      perfByPub.set(row.publication_id, existing)
    }

    // Build per-topic, per-format aggregates
    type FormatStats = {
      assetType: AssetType
      pieces: number
      totalViews: number
      totalEngagement: number
    }

    const topicFormatStats = new Map<string, Map<AssetType, FormatStats>>()
    const topicNames = new Map<string, string>()

    // Get topic info
    const { data: topics } = await supabase
      .from('topics')
      .select('id, name, commercial_category')
      .eq('is_trend_tracked', true)

    for (const t of topics || []) {
      topicNames.set(t.id, t.name)
    }

    for (const asset of assets) {
      const assetTopics = (asset.asset_topics as unknown as { topic_id: string }[]) || []
      const pubs = pubByAsset.get(asset.id) || []

      let totalViews = 0
      let totalEngagement = 0
      for (const pubId of pubs) {
        const perf = perfByPub.get(pubId)
        if (perf) {
          totalViews += perf.views
          totalEngagement += perf.engagement
        }
      }

      for (const at of assetTopics) {
        if (!topicNames.has(at.topic_id)) continue // skip untracked topics

        if (!topicFormatStats.has(at.topic_id)) {
          topicFormatStats.set(at.topic_id, new Map())
        }
        const formatMap = topicFormatStats.get(at.topic_id)!

        const existing = formatMap.get(asset.type) || {
          assetType: asset.type,
          pieces: 0,
          totalViews: 0,
          totalEngagement: 0,
        }
        existing.pieces += 1
        existing.totalViews += totalViews
        existing.totalEngagement += totalEngagement
        formatMap.set(asset.type, existing)
      }
    }

    // Deduplicate against existing insights
    const { data: existing } = await supabase
      .from('insights')
      .select('topic_id, evidence')
      .eq('type', 'format_effectiveness')
      .in('status', ['candidate', 'validated', 'actioned'])

    const existingKeys = new Set(
      (existing || []).map((e) => {
        const ev = e.evidence as Record<string, unknown>
        return `${e.topic_id}:${ev.best_format}:${ev.compared_format}`
      }),
    )

    const candidates: CandidateInsight[] = []

    for (const [topicId, formatMap] of topicFormatStats) {
      const topicName = topicNames.get(topicId) || 'Unknown'
      const formats = Array.from(formatMap.values())
        .filter((f) => f.pieces >= MIN_PIECES_PER_FORMAT)
        .sort((a, b) => {
          const aAvg = a.totalEngagement / a.pieces
          const bAvg = b.totalEngagement / b.pieces
          return bAvg - aAvg
        })

      if (formats.length < 2) continue

      // Compare best format against each other qualifying format
      const best = formats[0]
      const bestAvgEng = best.totalEngagement / best.pieces
      const bestLabel = FORMAT_LABELS[best.assetType] || best.assetType

      for (let i = 1; i < formats.length; i++) {
        const compared = formats[i]
        const comparedAvgEng = compared.totalEngagement / compared.pieces
        if (comparedAvgEng === 0) continue

        const ratio = bestAvgEng / comparedAvgEng
        if (ratio < MIN_RATIO) continue

        const comparedLabel = FORMAT_LABELS[compared.assetType] || compared.assetType

        // Deduplicate
        const dedupeKey = `${topicId}:${best.assetType}:${compared.assetType}`
        if (existingKeys.has(dedupeKey)) continue

        const totalPieces = best.pieces + compared.pieces

        // Confidence based on sample size and ratio strength
        const sampleScore = Math.min(30, (totalPieces / 20) * 30)
        const ratioScore = Math.min(40, ((ratio - 1) / 3) * 40)
        const diversityScore = Math.min(30, (Math.min(best.pieces, compared.pieces) / 5) * 30)
        const score = Math.min(100, sampleScore + ratioScore + diversityScore)
        const tier = confidenceTier(score)

        // Get topic commercial_category
        const topicInfo = (topics || []).find((t) => t.id === topicId)

        const statement =
          `${bestLabel.charAt(0).toUpperCase() + bestLabel.slice(1)} outperforms ${comparedLabel} ` +
          `${ratio.toFixed(1)}:1 for ${topicName} topics ` +
          `(${best.pieces} ${bestLabel}s avg ${Math.round(bestAvgEng).toLocaleString()} engagement ` +
          `vs ${compared.pieces} ${comparedLabel}s avg ${Math.round(comparedAvgEng).toLocaleString()}). ` +
          `Sample: ${totalPieces} pieces.`

        candidates.push({
          type: 'format_effectiveness',
          statement,
          topic_id: topicId,
          commercial_category: topicInfo?.commercial_category ?? null,
          evidence: {
            best_format: best.assetType,
            best_format_label: bestLabel,
            best_avg_engagement: Math.round(bestAvgEng),
            best_pieces: best.pieces,
            best_total_views: best.totalViews,
            compared_format: compared.assetType,
            compared_format_label: comparedLabel,
            compared_avg_engagement: Math.round(comparedAvgEng),
            compared_pieces: compared.pieces,
            compared_total_views: compared.totalViews,
            ratio: Math.round(ratio * 100) / 100,
            total_sample: totalPieces,
          },
          confidence_score: score,
          confidence: tier,
          valid_from: null, // format effectiveness is evergreen
          valid_until: null,
          sponsor_safe: tier === 'established',
        })
      }
    }

    return candidates
  }
}
