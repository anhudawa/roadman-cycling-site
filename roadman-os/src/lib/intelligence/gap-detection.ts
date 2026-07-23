import { createClient } from '@/lib/supabase/server'
import type { Topic, ContentPillar, AssetType } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PillarCoverage = {
  pillar: ContentPillar
  label: string
  count: number
  percentage: number
  isUnderRepresented: boolean
}

export type TopicCoverage = {
  topicId: string
  topicName: string
  pillar: ContentPillar | null
  assetCount: number
  formats: AssetType[]
  isFlagged: boolean
  flagReason: string | null
}

export type FormatDiversity = {
  pillar: ContentPillar
  label: string
  formats: { type: AssetType; count: number }[]
  missingFormats: AssetType[]
  diversityScore: number // 0-1
}

export type GapRecommendation = {
  type: 'pillar_imbalance' | 'topic_underserved' | 'format_gap' | 'single_format'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  pillar?: ContentPillar
  topicId?: string
  topicName?: string
}

export type GapAnalysis = {
  pillarCoverage: PillarCoverage[]
  topicCoverage: TopicCoverage[]
  formatDiversity: FormatDiversity[]
  recommendations: GapRecommendation[]
  totalAssets: number
  analysedAt: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PILLAR_LABELS: Record<ContentPillar, string> = {
  coaching: 'Coaching',
  nutrition: 'Nutrition',
  strength_and_conditioning: 'Strength & Conditioning',
  recovery: 'Recovery',
  le_metier: 'Le Metier',
}

const ALL_PILLARS: ContentPillar[] = [
  'coaching',
  'nutrition',
  'strength_and_conditioning',
  'recovery',
  'le_metier',
]

const CORE_FORMATS: AssetType[] = [
  'podcast_episode',
  'youtube_video',
  'blog_post',
  'social_post',
  'newsletter',
]

const IMBALANCE_THRESHOLD = 0.10 // < 10% is underrepresented
const MIN_ASSETS_PER_TOPIC = 3

// ---------------------------------------------------------------------------
// Pillar coverage analysis
// ---------------------------------------------------------------------------

export async function analysePillarCoverage(): Promise<PillarCoverage[]> {
  const supabase = await createClient()

  const { data: assets } = await supabase
    .from('assets')
    .select('pillar')
    .neq('status', 'archived')

  const allAssets = (assets ?? []) as { pillar: ContentPillar | null }[]
  const total = allAssets.length || 1

  const counts = new Map<ContentPillar, number>()
  for (const p of ALL_PILLARS) {
    counts.set(p, 0)
  }

  for (const a of allAssets) {
    if (a.pillar && counts.has(a.pillar)) {
      counts.set(a.pillar, (counts.get(a.pillar) ?? 0) + 1)
    }
  }

  return ALL_PILLARS.map((pillar) => {
    const count = counts.get(pillar) ?? 0
    const percentage = count / total

    return {
      pillar,
      label: PILLAR_LABELS[pillar],
      count,
      percentage,
      isUnderRepresented: percentage < IMBALANCE_THRESHOLD,
    }
  })
}

// ---------------------------------------------------------------------------
// Topic coverage analysis
// ---------------------------------------------------------------------------

export async function analyseTopicCoverage(): Promise<TopicCoverage[]> {
  const supabase = await createClient()

  // Fetch all topics
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name, pillar')
    .order('pillar')
    .order('sort_order')

  if (!topics || topics.length === 0) return []

  // Fetch asset-topic junction data
  const { data: assetTopics } = await supabase
    .from('asset_topics')
    .select('asset_id, topic_id')

  // Fetch asset types for format counting
  const { data: assets } = await supabase
    .from('assets')
    .select('id, type')
    .neq('status', 'archived')

  const assetTypeMap = new Map<string, AssetType>()
  for (const a of (assets ?? []) as { id: string; type: AssetType }[]) {
    assetTypeMap.set(a.id, a.type)
  }

  // Count per topic
  const topicAssets = new Map<string, Set<string>>()
  const topicFormats = new Map<string, Set<AssetType>>()

  for (const at of (assetTopics ?? []) as { asset_id: string; topic_id: string }[]) {
    if (!topicAssets.has(at.topic_id)) {
      topicAssets.set(at.topic_id, new Set())
      topicFormats.set(at.topic_id, new Set())
    }
    topicAssets.get(at.topic_id)!.add(at.asset_id)

    const type = assetTypeMap.get(at.asset_id)
    if (type) {
      topicFormats.get(at.topic_id)!.add(type)
    }
  }

  return (topics as Topic[]).map((topic) => {
    const assetIds = topicAssets.get(topic.id)
    const formats = topicFormats.get(topic.id)
    const assetCount = assetIds?.size ?? 0
    const formatList = formats ? Array.from(formats) : []
    const isSingleFormat = assetCount > 0 && formatList.length === 1

    let isFlagged = false
    let flagReason: string | null = null

    if (assetCount < MIN_ASSETS_PER_TOPIC) {
      isFlagged = true
      flagReason = `Only ${assetCount} asset${assetCount !== 1 ? 's' : ''} — below minimum of ${MIN_ASSETS_PER_TOPIC}`
    } else if (isSingleFormat) {
      isFlagged = true
      flagReason = `All ${assetCount} assets use the same format (${formatList[0].replace(/_/g, ' ')})`
    }

    return {
      topicId: topic.id,
      topicName: topic.name,
      pillar: topic.pillar,
      assetCount,
      formats: formatList,
      isFlagged,
      flagReason,
    }
  })
}

// ---------------------------------------------------------------------------
// Format diversity per pillar
// ---------------------------------------------------------------------------

export async function analyseFormatDiversity(
  targetPillar?: ContentPillar,
): Promise<FormatDiversity[]> {
  const supabase = await createClient()

  let query = supabase
    .from('assets')
    .select('type, pillar')
    .neq('status', 'archived')

  if (targetPillar) {
    query = query.eq('pillar', targetPillar)
  }

  const { data: assets } = await query

  const pillarFormats = new Map<ContentPillar, Map<AssetType, number>>()

  for (const a of (assets ?? []) as { type: AssetType; pillar: ContentPillar | null }[]) {
    if (!a.pillar) continue

    if (!pillarFormats.has(a.pillar)) {
      pillarFormats.set(a.pillar, new Map())
    }

    const formatMap = pillarFormats.get(a.pillar)!
    formatMap.set(a.type, (formatMap.get(a.type) ?? 0) + 1)
  }

  const pillarsToAnalyse = targetPillar ? [targetPillar] : ALL_PILLARS

  return pillarsToAnalyse.map((pillar) => {
    const formatMap = pillarFormats.get(pillar) ?? new Map()
    const formats = Array.from(formatMap.entries()).map(([type, count]) => ({
      type,
      count,
    }))

    const presentFormats = new Set(formatMap.keys())
    const missingFormats = CORE_FORMATS.filter((f) => !presentFormats.has(f))

    const diversityScore =
      CORE_FORMATS.length > 0
        ? (CORE_FORMATS.length - missingFormats.length) / CORE_FORMATS.length
        : 0

    return {
      pillar,
      label: PILLAR_LABELS[pillar],
      formats,
      missingFormats,
      diversityScore,
    }
  })
}

// ---------------------------------------------------------------------------
// Identify all gaps — combines analyses into recommendations
// ---------------------------------------------------------------------------

export async function identifyGaps(): Promise<GapAnalysis> {
  const [pillarCoverage, topicCoverage, formatDiversity] = await Promise.all([
    analysePillarCoverage(),
    analyseTopicCoverage(),
    analyseFormatDiversity(),
  ])

  const recommendations: GapRecommendation[] = []

  // Pillar imbalances
  for (const p of pillarCoverage) {
    if (p.isUnderRepresented) {
      recommendations.push({
        type: 'pillar_imbalance',
        severity: p.percentage < 0.05 ? 'high' : 'medium',
        title: `${p.label} is underrepresented`,
        description: `${p.label} accounts for only ${(p.percentage * 100).toFixed(1)}% of content (${p.count} assets). Consider creating more ${p.label.toLowerCase()} content to balance your pillar coverage.`,
        pillar: p.pillar,
      })
    }
  }

  // Topics with too few assets
  for (const t of topicCoverage) {
    if (t.assetCount < MIN_ASSETS_PER_TOPIC) {
      recommendations.push({
        type: 'topic_underserved',
        severity: t.assetCount === 0 ? 'high' : 'medium',
        title: `${t.topicName} needs more content`,
        description: t.flagReason ?? `Only ${t.assetCount} assets for topic "${t.topicName}".`,
        topicId: t.topicId,
        topicName: t.topicName,
        pillar: t.pillar ?? undefined,
      })
    } else if (t.isFlagged && t.formats.length === 1) {
      recommendations.push({
        type: 'single_format',
        severity: 'low',
        title: `${t.topicName} uses only one format`,
        description: t.flagReason ?? `All assets for "${t.topicName}" use the same format.`,
        topicId: t.topicId,
        topicName: t.topicName,
        pillar: t.pillar ?? undefined,
      })
    }
  }

  // Format gaps per pillar
  for (const fd of formatDiversity) {
    if (fd.missingFormats.length > 0) {
      recommendations.push({
        type: 'format_gap',
        severity: fd.missingFormats.length >= 3 ? 'high' : 'low',
        title: `${fd.label} is missing key formats`,
        description: `${fd.label} is missing: ${fd.missingFormats.map((f) => f.replace(/_/g, ' ')).join(', ')}. Diversifying formats improves reach and engagement.`,
        pillar: fd.pillar,
      })
    }
  }

  // Sort recommendations by severity
  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  recommendations.sort(
    (a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3),
  )

  const totalAssets = pillarCoverage.reduce((sum, p) => sum + p.count, 0)

  return {
    pillarCoverage,
    topicCoverage,
    formatDiversity,
    recommendations,
    totalAssets,
    analysedAt: new Date().toISOString(),
  }
}
