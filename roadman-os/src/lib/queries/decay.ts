import { createClient } from '@/lib/supabase/server'
import type { Asset, PerformanceRecord } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DecayingAsset = {
  asset_id: string
  asset_title: string
  asset_type: string
  publish_date: string | null
  currentViews: number
  previousViews: number
  decayPercentage: number
  severity: 'critical' | 'warning' | 'mild'
  suggestedActions: string[]
  isDismissed: boolean
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Detect content decay by comparing the latest period's metrics with the
 * previous period for published assets.
 * threshold: minimum percentage drop to flag (default 50)
 * periodDays: length of each comparison period (default 30)
 */
export async function getDecayingContent(
  threshold = 50,
  periodDays = 30,
): Promise<DecayingAsset[]> {
  const supabase = await createClient()
  const now = new Date()

  const currentEnd = now.toISOString().split('T')[0]
  const currentStart = new Date(now.getTime() - periodDays * 86400000).toISOString().split('T')[0]
  const previousEnd = currentStart
  const previousStart = new Date(new Date(currentStart).getTime() - periodDays * 86400000).toISOString().split('T')[0]

  // Get published assets
  const { data: assets } = await supabase
    .from('assets')
    .select('id, title, type, publish_date, status')
    .eq('status', 'published')
    .not('publish_date', 'is', null)
    .order('publish_date', { ascending: false })

  const assetList = (assets ?? []) as Asset[]
  if (assetList.length === 0) return []

  const assetIds = assetList.map((a) => a.id)

  // Get current period records
  const { data: currentRecords } = await supabase
    .from('performance_records')
    .select('asset_id, views')
    .in('asset_id', assetIds)
    .gte('recorded_at', currentStart)
    .lte('recorded_at', currentEnd)

  // Get previous period records
  const { data: previousRecords } = await supabase
    .from('performance_records')
    .select('asset_id, views')
    .in('asset_id', assetIds)
    .gte('recorded_at', previousStart)
    .lte('recorded_at', previousEnd)

  // Aggregate by asset
  const currentByAsset = new Map<string, number>()
  for (const r of (currentRecords ?? []) as PerformanceRecord[]) {
    if (!r.asset_id) continue
    currentByAsset.set(r.asset_id, (currentByAsset.get(r.asset_id) ?? 0) + (r.views ?? 0))
  }

  const previousByAsset = new Map<string, number>()
  for (const r of (previousRecords ?? []) as PerformanceRecord[]) {
    if (!r.asset_id) continue
    previousByAsset.set(r.asset_id, (previousByAsset.get(r.asset_id) ?? 0) + (r.views ?? 0))
  }

  const decaying: DecayingAsset[] = []

  for (const asset of assetList) {
    const currentViews = currentByAsset.get(asset.id) ?? 0
    const previousViews = previousByAsset.get(asset.id) ?? 0

    // Only flag if there were previous views to compare against
    if (previousViews === 0) continue

    const decayPercentage = ((previousViews - currentViews) / previousViews) * 100

    if (decayPercentage >= threshold) {
      const severity = decayPercentage >= 80 ? 'critical' : decayPercentage >= 60 ? 'warning' : 'mild'
      const suggestedActions = getSuggestedActions(asset.type, decayPercentage, asset.publish_date)

      decaying.push({
        asset_id: asset.id,
        asset_title: asset.title,
        asset_type: asset.type,
        publish_date: asset.publish_date,
        currentViews,
        previousViews,
        decayPercentage: Math.round(decayPercentage),
        severity,
        suggestedActions,
        isDismissed: false,
      })
    }
  }

  // Sort by severity (critical first) then by decay percentage
  return decaying.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, mild: 2 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return b.decayPercentage - a.decayPercentage
  })
}

/**
 * Suggest actions based on content type, decay severity, and age.
 */
function getSuggestedActions(
  assetType: string,
  decayPercentage: number,
  publishDate: string | null,
): string[] {
  const actions: string[] = []
  const now = new Date()
  const ageMonths = publishDate
    ? (now.getTime() - new Date(publishDate).getTime()) / (30 * 86400000)
    : 0

  // Universal suggestions
  if (decayPercentage >= 80) {
    actions.push('Review whether this content is still relevant')
  }

  // Type-specific suggestions
  switch (assetType) {
    case 'blog_post':
      actions.push('Update with fresh information and republish')
      if (ageMonths > 6) actions.push('Add new internal links from recent content')
      actions.push('Optimise meta title and description for current search intent')
      break
    case 'youtube_video':
      actions.push('Update thumbnail and title for improved CTR')
      actions.push('Create a follow-up video linking back to this one')
      if (ageMonths > 3) actions.push('Add end screens pointing to newer content')
      break
    case 'podcast_episode':
      actions.push('Create clips or quote cards from the best moments')
      actions.push('Reshare on social with a new angle')
      break
    case 'newsletter':
      actions.push('Repurpose the best sections as standalone blog posts')
      break
    default:
      actions.push('Repurpose into a different format for fresh reach')
      actions.push('Reshare on social media with updated copy')
      break
  }

  if (ageMonths > 12) {
    actions.push('Consider archiving if no longer aligned with current strategy')
  }

  return actions
}
