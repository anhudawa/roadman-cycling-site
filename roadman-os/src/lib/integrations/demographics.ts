/**
 * Demographics aggregation service.
 *
 * Pulls demographic data from multiple platform APIs (YouTube, Meta, GA4)
 * and writes to `audience_demographics`. All actual API calls are stubbed
 * with TODO markers — the shapes are correct and ready for implementation.
 */

import type {
  MetricSource,
  AudienceDemographic,
  AudienceDemographicInsert,
} from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DemographicRow = {
  source: MetricSource
  scope: 'asset' | 'channel'
  asset_id: string | null
  period_start: string
  period_end: string
  age_bracket: string // '18-24','25-34','35-44','45-54','55-64','65+','unknown'
  gender: string // 'male','female','unknown'
  country: string | null
  share_pct: number
  absolute_value: number | null
}

type DemographicResult =
  | { ok: true; data: DemographicRow[] }
  | { ok: false; message: string; status?: number }

interface AggregatedDemographicProfile {
  by_age: { age_bracket: string; share_pct: number; absolute_value: number }[]
  by_gender: { gender: string; share_pct: number; absolute_value: number }[]
  by_country: { country: string; share_pct: number; absolute_value: number }[]
}

// ---------------------------------------------------------------------------
// YouTube Demographics
// ---------------------------------------------------------------------------

/**
 * Fetch audience demographics from the YouTube Analytics API.
 *
 * Uses the `reports` endpoint with `ageGroup,gender` and `country` dimensions.
 * Requires scope: `https://www.googleapis.com/auth/yt-analytics.readonly`
 *
 * @param accessToken  Valid OAuth2 access token
 * @param channelId    The YouTube channel ID
 * @param videoIds     Optional array of video IDs to scope to specific assets
 */
export async function fetchYouTubeDemographics(
  _accessToken: string,
  _channelId: string,
  _videoIds?: string[],
): Promise<DemographicResult> {
  // TODO: Implement actual YouTube Analytics API call
  // GET https://youtubeanalytics.googleapis.com/v2/reports
  //   ?ids=channel==CHANNEL_ID
  //   &dimensions=ageGroup,gender
  //   &metrics=viewerPercentage
  //   &startDate=...&endDate=...
  //   &filters=video==VIDEO_ID (if videoIds provided)
  //
  // Then a second call with dimensions=country for geo breakdown.
  //
  // Map the response rows into DemographicRow[].

  return { ok: true, data: [] as DemographicRow[] }
}

// ---------------------------------------------------------------------------
// Meta (Facebook/Instagram) Demographics
// ---------------------------------------------------------------------------

/**
 * Fetch audience demographics from the Meta Graph API.
 *
 * Uses the Page Insights endpoint with `page_fans_gender_age` and
 * `page_fans_country` metrics.
 *
 * @param accessToken  Valid Meta access token with `pages_read_engagement` permission
 * @param pageId       The Facebook Page ID
 */
export async function fetchMetaDemographics(
  _accessToken: string,
  _pageId: string,
): Promise<DemographicResult> {
  // TODO: Implement actual Meta Graph API call
  // GET https://graph.facebook.com/v19.0/{pageId}/insights
  //   ?metric=page_fans_gender_age,page_fans_country
  //   &period=lifetime
  //   &access_token=...
  //
  // Parse the nested JSON response into DemographicRow[].
  // Meta returns age-gender combos like "M.25-34" — split on '.'

  return { ok: true, data: [] as DemographicRow[] }
}

// ---------------------------------------------------------------------------
// GA4 Demographics
// ---------------------------------------------------------------------------

/**
 * Fetch audience demographics from GA4 Data API.
 *
 * Uses `runReport` with `userAgeBracket`, `userGender`, and `country`
 * dimensions.
 *
 * @param apiKey       GA4 API key or service account credentials
 * @param propertyId   The GA4 property ID (e.g. "properties/123456")
 */
export async function fetchGA4Demographics(
  _apiKey: string,
  _propertyId: string,
): Promise<DemographicResult> {
  // TODO: Implement actual GA4 Data API call
  // POST https://analyticsdata.googleapis.com/v1beta/{propertyId}:runReport
  // Body: {
  //   dimensions: [{ name: 'userAgeBracket' }, { name: 'userGender' }],
  //   metrics: [{ name: 'activeUsers' }],
  //   dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
  // }
  //
  // Then a second call with dimensions: [{ name: 'country' }]
  //
  // Map GA4 age brackets (e.g. '25-34') and genders to DemographicRow[].

  return { ok: true, data: [] as DemographicRow[] }
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/**
 * Aggregate demographics for all assets linked to a topic.
 *
 * Reads `audience_demographics` rows for assets associated with the given
 * topic (via `asset_topics` junction), then produces a weighted aggregate
 * profile. Weights are based on `absolute_value` — larger audiences
 * contribute more to the overall profile.
 *
 * @param supabase  Server Supabase client
 * @param topicId   The topic ID to aggregate for
 */
export async function aggregateDemographicsByTopic(
  supabase: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  topicId: string,
): Promise<AggregatedDemographicProfile> {
  // 1. Get all asset IDs linked to this topic
  const { data: assetLinks } = await supabase
    .from('asset_topics')
    .select('asset_id')
    .eq('topic_id', topicId)

  const assetIds: string[] = (assetLinks ?? []).map(
    (link: { asset_id: string }) => link.asset_id,
  )

  if (assetIds.length === 0) {
    return { by_age: [], by_gender: [], by_country: [] }
  }

  // 2. Fetch demographics for those assets (plus channel-level rows)
  const { data: rows } = await supabase
    .from('audience_demographics')
    .select('*')
    .or(`asset_id.in.(${assetIds.join(',')}),scope.eq.channel`)

  const demographics: AudienceDemographic[] = rows ?? []

  if (demographics.length === 0) {
    return { by_age: [], by_gender: [], by_country: [] }
  }

  // 3. Aggregate by age bracket (weighted by absolute_value)
  const ageMap = new Map<string, { total: number; weight: number }>()
  const genderMap = new Map<string, { total: number; weight: number }>()
  const countryMap = new Map<string, { total: number; weight: number }>()

  for (const row of demographics) {
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

  // 4. Normalise into percentage shares
  const by_age = Array.from(ageMap.entries())
    .map(([age_bracket, { total, weight }]) => ({
      age_bracket,
      share_pct: weight > 0 ? total / weight : 0,
      absolute_value: Math.round(weight),
    }))
    .sort((a, b) => b.share_pct - a.share_pct)

  const by_gender = Array.from(genderMap.entries())
    .map(([gender, { total, weight }]) => ({
      gender,
      share_pct: weight > 0 ? total / weight : 0,
      absolute_value: Math.round(weight),
    }))
    .sort((a, b) => b.share_pct - a.share_pct)

  const by_country = Array.from(countryMap.entries())
    .map(([country, { total, weight }]) => ({
      country,
      share_pct: weight > 0 ? total / weight : 0,
      absolute_value: Math.round(weight),
    }))
    .sort((a, b) => b.share_pct - a.share_pct)

  return { by_age, by_gender, by_country }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert DemographicRow[] to AudienceDemographicInsert[] for upsert.
 */
export function toInsertRows(rows: DemographicRow[]): AudienceDemographicInsert[] {
  return rows.map((r) => ({
    source: r.source,
    scope: r.scope,
    asset_id: r.asset_id,
    period_start: r.period_start,
    period_end: r.period_end,
    age_bracket: r.age_bracket,
    gender: r.gender,
    country: r.country,
    share_pct: r.share_pct,
    absolute_value: r.absolute_value,
  }))
}
