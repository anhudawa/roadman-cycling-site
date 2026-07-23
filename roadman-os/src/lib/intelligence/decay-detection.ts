import { createClient } from '@/lib/supabase/server'
import type { PerformanceRecord, Asset } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DecayResult = {
  assetId: string
  assetTitle: string
  assetType: string
  publishDate: string | null
  latestViews: number
  previousViews: number
  decayPercent: number
  suggestedActions: string[]
}

// ---------------------------------------------------------------------------
// Core decay detection
// ---------------------------------------------------------------------------

/**
 * Detect content decay by comparing latest period metrics against the
 * previous period of the same length.
 *
 * @param threshold - minimum percentage drop to flag (0-100, default 50)
 * @param periodDays - length of each comparison period in days (default 30)
 * @returns array of decaying assets sorted by severity
 */
export async function detectDecay(
  threshold = 50,
  periodDays = 30,
): Promise<DecayResult[]> {
  const supabase = await createClient()
  const now = new Date()

  const latestEnd = now.toISOString().split('T')[0]
  const latestStart = new Date(now.getTime() - periodDays * 86400000).toISOString().split('T')[0]
  const previousEnd = latestStart
  const previousStart = new Date(new Date(latestStart).getTime() - periodDays * 86400000).toISOString().split('T')[0]

  // Fetch published assets
  const { data: assets } = await supabase
    .from('assets')
    .select('id, title, type, publish_date')
    .eq('status', 'published')
    .not('publish_date', 'is', null)

  const assetList = (assets ?? []) as Asset[]
  if (assetList.length === 0) return []

  const assetIds = assetList.map((a) => a.id)

  // Fetch both periods in parallel
  const [latestRes, previousRes] = await Promise.all([
    supabase
      .from('performance_records')
      .select('asset_id, views')
      .in('asset_id', assetIds)
      .gte('recorded_at', latestStart)
      .lte('recorded_at', latestEnd),
    supabase
      .from('performance_records')
      .select('asset_id, views')
      .in('asset_id', assetIds)
      .gte('recorded_at', previousStart)
      .lte('recorded_at', previousEnd),
  ])

  // Aggregate by asset
  const latestByAsset = aggregateViews((latestRes.data ?? []) as PerformanceRecord[])
  const previousByAsset = aggregateViews((previousRes.data ?? []) as PerformanceRecord[])

  const results: DecayResult[] = []

  for (const asset of assetList) {
    const latestViews = latestByAsset.get(asset.id) ?? 0
    const previousViews = previousByAsset.get(asset.id) ?? 0

    if (previousViews === 0) continue

    const decayPercent = ((previousViews - latestViews) / previousViews) * 100

    if (decayPercent >= threshold) {
      results.push({
        assetId: asset.id,
        assetTitle: asset.title,
        assetType: asset.type,
        publishDate: asset.publish_date,
        latestViews,
        previousViews,
        decayPercent: Math.round(decayPercent * 10) / 10,
        suggestedActions: generateSuggestions(asset.type, decayPercent, asset.publish_date),
      })
    }
  }

  return results.sort((a, b) => b.decayPercent - a.decayPercent)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function aggregateViews(records: PerformanceRecord[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const r of records) {
    if (!r.asset_id) continue
    map.set(r.asset_id, (map.get(r.asset_id) ?? 0) + (r.views ?? 0))
  }
  return map
}

function generateSuggestions(
  assetType: string,
  decayPercent: number,
  publishDate: string | null,
): string[] {
  const suggestions: string[] = []
  const ageMonths = publishDate
    ? (Date.now() - new Date(publishDate).getTime()) / (30 * 86400000)
    : 0

  if (decayPercent >= 80) {
    suggestions.push('Urgently review — content may be outdated or superseded')
  }

  switch (assetType) {
    case 'blog_post':
      suggestions.push('Refresh with updated data and republish')
      if (ageMonths > 6) suggestions.push('Audit and update internal links')
      break
    case 'youtube_video':
      suggestions.push('Test a new thumbnail for improved click-through')
      suggestions.push('Create a sequel or follow-up video')
      break
    case 'podcast_episode':
      suggestions.push('Pull standout clips and reshare on social')
      suggestions.push('Reference this episode in a newer recording')
      break
    case 'newsletter':
      suggestions.push('Repurpose highlights into a standalone article')
      break
    default:
      suggestions.push('Consider repurposing into a different format')
      suggestions.push('Reshare on social with a fresh angle')
      break
  }

  if (ageMonths > 12 && decayPercent >= 70) {
    suggestions.push('Evaluate whether to archive or merge into a newer piece')
  }

  return suggestions
}
