import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aggregateDemographicsByTopic } from '@/lib/integrations/demographics'
import type { AudienceDemographic, MetricSource } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AggregatedBucket {
  label: string
  share_pct: number
  absolute_value: number
}

interface DemographicsPayload {
  demographics: AudienceDemographic[]
  aggregated: {
    by_age: AggregatedBucket[]
    by_gender: AggregatedBucket[]
    by_country: AggregatedBucket[]
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Aggregate raw demographic rows into by_age / by_gender / by_country buckets. */
function aggregateRows(rows: AudienceDemographic[]): DemographicsPayload['aggregated'] {
  const ageMap = new Map<string, { total: number; weight: number }>()
  const genderMap = new Map<string, { total: number; weight: number }>()
  const countryMap = new Map<string, { total: number; weight: number }>()

  for (const row of rows) {
    const weight = row.absolute_value ?? 1

    // Age
    const ageEntry = ageMap.get(row.age_bracket) ?? { total: 0, weight: 0 }
    ageEntry.total += row.share_pct * weight
    ageEntry.weight += weight
    ageMap.set(row.age_bracket, ageEntry)

    // Gender
    const genderEntry = genderMap.get(row.gender) ?? { total: 0, weight: 0 }
    genderEntry.total += row.share_pct * weight
    genderEntry.weight += weight
    genderMap.set(row.gender, genderEntry)

    // Country
    if (row.country) {
      const countryEntry = countryMap.get(row.country) ?? { total: 0, weight: 0 }
      countryEntry.total += row.share_pct * weight
      countryEntry.weight += weight
      countryMap.set(row.country, countryEntry)
    }
  }

  const toBuckets = (map: Map<string, { total: number; weight: number }>) =>
    Array.from(map.entries())
      .map(([label, { total, weight }]) => ({
        label,
        share_pct: weight > 0 ? Math.round((total / weight) * 100) / 100 : 0,
        absolute_value: Math.round(weight),
      }))
      .sort((a, b) => b.share_pct - a.share_pct)

  return {
    by_age: toBuckets(ageMap),
    by_gender: toBuckets(genderMap),
    by_country: toBuckets(countryMap),
  }
}

// ---------------------------------------------------------------------------
// GET /api/intelligence/demographics
// ---------------------------------------------------------------------------

/**
 * Demographics API endpoint.
 *
 * Query params:
 *   - topic_id  (optional) — aggregate demographics for assets linked to this topic
 *   - source    (optional) — filter by MetricSource (youtube, meta, ga4, etc.)
 *   - scope     (optional) — filter by 'asset' | 'channel'
 *
 * If topic_id is provided: uses aggregateDemographicsByTopic for a weighted profile.
 * Otherwise: returns channel-level demographics across all sources.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const topicId = url.searchParams.get('topic_id')
  const source = url.searchParams.get('source') as MetricSource | null
  const scope = url.searchParams.get('scope') as 'asset' | 'channel' | null

  // -------------------------------------------------------------------------
  // Topic-scoped aggregation
  // -------------------------------------------------------------------------
  if (topicId) {
    const aggregated = await aggregateDemographicsByTopic(supabase, topicId)

    // Also fetch the raw rows for the topic's assets
    const { data: assetLinks } = await supabase
      .from('asset_topics')
      .select('asset_id')
      .eq('topic_id', topicId)

    const assetIds: string[] = (assetLinks ?? []).map(
      (link: { asset_id: string }) => link.asset_id,
    )

    let rawQuery = supabase
      .from('audience_demographics')
      .select('*')
      .order('period_end', { ascending: false })

    if (assetIds.length > 0) {
      rawQuery = rawQuery.or(
        `asset_id.in.(${assetIds.join(',')}),scope.eq.channel`,
      )
    } else {
      rawQuery = rawQuery.eq('scope', 'channel')
    }

    if (source) {
      rawQuery = rawQuery.eq('source', source)
    }

    const { data: rawRows, error } = await rawQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Remap the aggregated shape to match the expected response format
    const payload: DemographicsPayload = {
      demographics: (rawRows as AudienceDemographic[]) ?? [],
      aggregated: {
        by_age: aggregated.by_age.map((a) => ({
          label: a.age_bracket,
          share_pct: a.share_pct,
          absolute_value: a.absolute_value,
        })),
        by_gender: aggregated.by_gender.map((g) => ({
          label: g.gender,
          share_pct: g.share_pct,
          absolute_value: g.absolute_value,
        })),
        by_country: aggregated.by_country.map((c) => ({
          label: c.country,
          share_pct: c.share_pct,
          absolute_value: c.absolute_value,
        })),
      },
    }

    return NextResponse.json(payload)
  }

  // -------------------------------------------------------------------------
  // Channel-level demographics (no topic filter)
  // -------------------------------------------------------------------------
  let query = supabase
    .from('audience_demographics')
    .select('*')
    .order('period_end', { ascending: false })

  if (source) {
    query = query.eq('source', source)
  }

  if (scope) {
    query = query.eq('scope', scope)
  } else {
    // Default to channel-level when no topic or scope is specified
    query = query.eq('scope', 'channel')
  }

  const { data: rows, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const demographics = (rows as AudienceDemographic[]) ?? []
  const aggregated = aggregateRows(demographics)

  const payload: DemographicsPayload = {
    demographics,
    aggregated,
  }

  return NextResponse.json(payload)
}
