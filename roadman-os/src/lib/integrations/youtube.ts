/**
 * YouTube Data API v3 + YouTube Analytics API client.
 *
 * Handles channel listing, video details, analytics, and revenue data.
 * All functions accept an OAuth2 access token and return typed results.
 *
 * Rate-limit awareness: YouTube Data API v3 has a 10,000-unit daily quota.
 * Each function documents its quota cost in the JSDoc. Use `quotaTracker`
 * to monitor cumulative spend within a sync run.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DATA_API_BASE = 'https://www.googleapis.com/youtube/v3'
const ANALYTICS_API_BASE = 'https://youtubeanalytics.googleapis.com/v2'

export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
] as const

// ---------------------------------------------------------------------------
// Quota tracker
// ---------------------------------------------------------------------------

export type QuotaTracker = {
  used: number
  limit: number
  remaining: number
}

let _quotaUsed = 0

/** Reset the per-run quota counter. Call at the start of each sync job. */
export function resetQuotaTracker(): void {
  _quotaUsed = 0
}

/** Record quota units consumed and return current state. */
export function recordQuota(units: number): QuotaTracker {
  _quotaUsed += units
  return {
    used: _quotaUsed,
    limit: 10_000,
    remaining: Math.max(0, 10_000 - _quotaUsed),
  }
}

/** Return current quota state without consuming units. */
export function getQuotaState(): QuotaTracker {
  return {
    used: _quotaUsed,
    limit: 10_000,
    remaining: Math.max(0, 10_000 - _quotaUsed),
  }
}

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type YouTubeApiError = {
  ok: false
  status: number
  message: string
  quotaExceeded: boolean
}

type ApiSuccess<T> = {
  ok: true
  data: T
}

export type YouTubeResult<T> = ApiSuccess<T> | YouTubeApiError

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function ytFetch<T>(
  url: string,
  accessToken: string,
  quotaCost: number,
): Promise<YouTubeResult<T>> {
  const quota = getQuotaState()
  if (quota.remaining < quotaCost) {
    return {
      ok: false,
      status: 429,
      message: `Quota limit would be exceeded (need ${quotaCost}, have ${quota.remaining})`,
      quotaExceeded: true,
    }
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  recordQuota(quotaCost)

  if (!response.ok) {
    const body = await response.text()
    let message = `YouTube API ${response.status}`
    try {
      const parsed = JSON.parse(body) as {
        error?: { message?: string; errors?: Array<{ reason?: string }> }
      }
      message = parsed.error?.message ?? message
      const quotaExceeded =
        response.status === 403 &&
        (parsed.error?.errors ?? []).some(
          (e) => e.reason === 'quotaExceeded' || e.reason === 'dailyLimitExceeded',
        )
      return { ok: false, status: response.status, message, quotaExceeded }
    } catch {
      return { ok: false, status: response.status, message, quotaExceeded: false }
    }
  }

  const data = (await response.json()) as T
  return { ok: true, data }
}

// ---------------------------------------------------------------------------
// Data API v3 response types
// ---------------------------------------------------------------------------

export type YouTubeThumbnail = {
  url: string
  width: number
  height: number
}

export type YouTubeVideoSnippet = {
  publishedAt: string
  channelId: string
  title: string
  description: string
  thumbnails: Record<string, YouTubeThumbnail>
  channelTitle: string
  tags?: string[]
  categoryId: string
  liveBroadcastContent: string
}

export type YouTubeVideoStatistics = {
  viewCount: string
  likeCount: string
  dislikeCount?: string
  favoriteCount: string
  commentCount: string
}

export type YouTubeVideoContentDetails = {
  duration: string
  dimension: string
  definition: string
  caption: string
  licensedContent: boolean
}

export type YouTubeVideoResource = {
  kind: string
  etag: string
  id: string | { kind: string; videoId: string }
  snippet: YouTubeVideoSnippet
  statistics?: YouTubeVideoStatistics
  contentDetails?: YouTubeVideoContentDetails
}

export type YouTubeListResponse<T> = {
  kind: string
  etag: string
  nextPageToken?: string
  prevPageToken?: string
  pageInfo: { totalResults: number; resultsPerPage: number }
  items: T[]
}

export type YouTubeChannelStatistics = {
  viewCount: string
  subscriberCount: string
  hiddenSubscriberCount: boolean
  videoCount: string
}

export type YouTubeChannelSnippet = {
  title: string
  description: string
  customUrl: string
  publishedAt: string
  thumbnails: Record<string, YouTubeThumbnail>
  country?: string
}

export type YouTubeChannelResource = {
  kind: string
  etag: string
  id: string
  snippet: YouTubeChannelSnippet
  statistics: YouTubeChannelStatistics
}

// ---------------------------------------------------------------------------
// Analytics API response types
// ---------------------------------------------------------------------------

export type YouTubeAnalyticsResponse = {
  kind: string
  columnHeaders: Array<{
    name: string
    columnType: string
    dataType: string
  }>
  rows: Array<Array<string | number>>
}

export type YouTubeAnalyticsRow = {
  video?: string
  views: number
  estimatedMinutesWatched: number
  averageViewDuration: number
  likes: number
  comments: number
  shares: number
  subscribersGained: number
  subscribersLost: number
  impressions: number
  impressionClickThroughRate: number
  cardClickRate: number
  estimatedRevenue: number
}

// ---------------------------------------------------------------------------
// Data API v3 — Channel Videos
// ---------------------------------------------------------------------------

/**
 * List videos uploaded to a channel (ordered by date, newest first).
 * Quota cost: 100 units (search.list).
 */
export async function listChannelVideos(
  accessToken: string,
  channelId: string,
  pageToken?: string,
): Promise<YouTubeResult<YouTubeListResponse<YouTubeVideoResource>>> {
  const params = new URLSearchParams({
    part: 'snippet',
    channelId,
    order: 'date',
    maxResults: '50',
    type: 'video',
  })
  if (pageToken) params.set('pageToken', pageToken)

  return ytFetch<YouTubeListResponse<YouTubeVideoResource>>(
    `${DATA_API_BASE}/search?${params.toString()}`,
    accessToken,
    100,
  )
}

// ---------------------------------------------------------------------------
// Data API v3 — Video Details
// ---------------------------------------------------------------------------

/**
 * Get detailed information for up to 50 videos at a time.
 * Quota cost: 1 unit per call (videos.list).
 */
export async function getVideoDetails(
  accessToken: string,
  videoIds: string[],
): Promise<YouTubeResult<YouTubeListResponse<YouTubeVideoResource>>> {
  if (videoIds.length === 0) {
    return { ok: true, data: { kind: '', etag: '', pageInfo: { totalResults: 0, resultsPerPage: 0 }, items: [] } }
  }

  // YouTube allows max 50 IDs per request
  const ids = videoIds.slice(0, 50).join(',')

  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    id: ids,
  })

  return ytFetch<YouTubeListResponse<YouTubeVideoResource>>(
    `${DATA_API_BASE}/videos?${params.toString()}`,
    accessToken,
    1,
  )
}

// ---------------------------------------------------------------------------
// Data API v3 — Channel Statistics
// ---------------------------------------------------------------------------

/**
 * Get high-level channel statistics (subscriber count, view count, etc.).
 * Quota cost: 1 unit (channels.list).
 */
export async function getChannelStats(
  accessToken: string,
  channelId: string,
): Promise<YouTubeResult<YouTubeListResponse<YouTubeChannelResource>>> {
  const params = new URLSearchParams({
    part: 'snippet,statistics',
    id: channelId,
  })

  return ytFetch<YouTubeListResponse<YouTubeChannelResource>>(
    `${DATA_API_BASE}/channels?${params.toString()}`,
    accessToken,
    1,
  )
}

// ---------------------------------------------------------------------------
// YouTube Analytics API — Per-Video Analytics
// ---------------------------------------------------------------------------

/**
 * Get analytics for a specific video over a date range.
 * Quota cost: 1 unit (reports.query).
 */
export async function getVideoAnalytics(
  accessToken: string,
  channelId: string,
  videoId: string,
  startDate: string,
  endDate: string,
): Promise<YouTubeResult<YouTubeAnalyticsResponse>> {
  const params = new URLSearchParams({
    ids: `channel==${channelId}`,
    startDate,
    endDate,
    metrics: [
      'views',
      'estimatedMinutesWatched',
      'averageViewDuration',
      'likes',
      'comments',
      'shares',
      'subscribersGained',
      'subscribersLost',
      'impressions',
      'impressionClickThroughRate',
      'cardClickRate',
      'estimatedRevenue',
    ].join(','),
    filters: `video==${videoId}`,
    dimensions: 'video',
  })

  return ytFetch<YouTubeAnalyticsResponse>(
    `${ANALYTICS_API_BASE}/reports?${params.toString()}`,
    accessToken,
    1,
  )
}

// ---------------------------------------------------------------------------
// YouTube Analytics API — Revenue Data
// ---------------------------------------------------------------------------

/**
 * Get revenue data for the entire channel over a date range.
 * Quota cost: 1 unit (reports.query).
 */
export async function getRevenueData(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string,
): Promise<YouTubeResult<YouTubeAnalyticsResponse>> {
  const params = new URLSearchParams({
    ids: `channel==${channelId}`,
    startDate,
    endDate,
    metrics: [
      'estimatedRevenue',
      'estimatedAdRevenue',
      'estimatedRedPartnerRevenue',
      'grossRevenue',
    ].join(','),
    dimensions: 'day',
    sort: 'day',
  })

  return ytFetch<YouTubeAnalyticsResponse>(
    `${ANALYTICS_API_BASE}/reports?${params.toString()}`,
    accessToken,
    1,
  )
}

// ---------------------------------------------------------------------------
// YouTube Analytics API — Channel-Level Analytics
// ---------------------------------------------------------------------------

/**
 * Get aggregated analytics for the entire channel over a date range.
 * Quota cost: 1 unit (reports.query).
 */
export async function getChannelAnalytics(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string,
): Promise<YouTubeResult<YouTubeAnalyticsResponse>> {
  const params = new URLSearchParams({
    ids: `channel==${channelId}`,
    startDate,
    endDate,
    metrics: [
      'views',
      'estimatedMinutesWatched',
      'averageViewDuration',
      'likes',
      'comments',
      'shares',
      'subscribersGained',
      'subscribersLost',
      'impressions',
      'impressionClickThroughRate',
      'estimatedRevenue',
    ].join(','),
  })

  return ytFetch<YouTubeAnalyticsResponse>(
    `${ANALYTICS_API_BASE}/reports?${params.toString()}`,
    accessToken,
    1,
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse an Analytics API response into typed row objects.
 * The Analytics API returns `columnHeaders` + `rows` (parallel arrays);
 * this zips them into keyed objects for easier downstream mapping.
 */
export function parseAnalyticsRows(
  response: YouTubeAnalyticsResponse,
): YouTubeAnalyticsRow[] {
  const headers = response.columnHeaders.map((h) => h.name)
  return (response.rows ?? []).map((row) => {
    const obj: Record<string, string | number> = {}
    headers.forEach((header, i) => {
      obj[header] = row[i]
    })
    return obj as unknown as YouTubeAnalyticsRow
  })
}

/**
 * Extract the video ID string from a search result item.
 * Search results use `{ kind, videoId }` while videos.list uses a plain string.
 */
export function extractVideoId(item: YouTubeVideoResource): string {
  if (typeof item.id === 'string') return item.id
  return item.id.videoId
}
