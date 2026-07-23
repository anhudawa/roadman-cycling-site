/**
 * Google Search Console API client.
 *
 * Uses the Search Console API v3 to fetch search analytics data — queries,
 * impressions, clicks, CTR, and average position broken down by page and date.
 *
 * Supports a 16-month rolling window for historical backfill and automatic
 * pagination using rowLimit=25000 with startRow offsets.
 *
 * Auth: OAuth2 access token passed as a Bearer token.
 * The token is stored in the platform_connection's `access_token` field.
 *
 * NOTE: All API functions are currently stubbed with mock data.
 * TODO: Enable when GSC API credentials are configured.
 * TODO: Wire up real OAuth2 flow via /api/auth/gsc when credentials are available.
 * TODO: Implement token refresh using refresh_token when access_token expires.
 */

import type { SearchConsoleDailyInsert } from '@/types/database'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3'

/** Maximum rows the API returns per request */
const ROW_LIMIT = 25_000

/** GSC retains 16 months of rolling data. */
const ROLLING_WINDOW_MONTHS = 16

/** GSC data has a ~3-day reporting lag. */
const GSC_REPORTING_LAG_DAYS = 3

// ---------------------------------------------------------------------------
// GSC Request types
// ---------------------------------------------------------------------------

export type GSCDimension = 'query' | 'page' | 'date' | 'country' | 'device'

export type GSCSearchAnalyticsRequest = {
  startDate: string
  endDate: string
  dimensions?: GSCDimension[]
  rowLimit?: number
  startRow?: number
  dimensionFilterGroups?: GSCDimensionFilterGroup[]
}

export type GSCDimensionFilterGroup = {
  groupType?: 'and'
  filters: GSCDimensionFilter[]
}

export type GSCDimensionFilter = {
  dimension: GSCDimension
  operator:
    | 'equals'
    | 'contains'
    | 'notContains'
    | 'includingRegex'
    | 'excludingRegex'
  expression: string
}

export type GSCSearchAnalyticsOptions = {
  dimensions?: GSCDimension[]
  rowLimit?: number
  startRow?: number
}

// ---------------------------------------------------------------------------
// GSC Response types
// ---------------------------------------------------------------------------

export type GSCSearchAnalyticsRow = {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export type GSCSearchAnalyticsResponse = {
  rows?: GSCSearchAnalyticsRow[]
  responseAggregationType?: string
}

export type GSCSiteEntry = {
  siteUrl: string
  permissionLevel: string
}

export type GSCSitesResponse = {
  siteEntry: GSCSiteEntry[]
}

export type GSCSitemap = {
  path: string
  lastSubmitted: string
  isPending: boolean
  isSitemapsIndex: boolean
  lastDownloaded: string
  warnings: string
  errors: string
}

export type GSCSitemapsResponse = {
  sitemap: GSCSitemap[]
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

/**
 * Thrown when a GSC API call fails with a non-recoverable error.
 * Used in catch blocks with `instanceof GSCApiError`.
 */
export class GSCApiError extends Error {
  public readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'GSCApiError'
    this.status = status
  }
}

// ---------------------------------------------------------------------------
// Result types (mirrors ga4.ts pattern)
// ---------------------------------------------------------------------------

type GSCApiErrorResult = {
  ok: false
  status: number
  message: string
}

type GSCApiSuccess<T> = {
  ok: true
  data: T
}

export type GSCResult<T> = GSCApiSuccess<T> | GSCApiErrorResult

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function gscFetch<T>(
  url: string,
  accessToken: string,
  options: { method?: string; body?: Record<string, unknown> } = {},
): Promise<GSCResult<T>> {
  const { method = 'GET', body } = options

  // TODO: Enable real API calls when OAuth credentials are available.
  // -------------------------------------------------------------------------
  // Uncomment the block below once GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
  // are set and the OAuth flow at /api/auth/gsc is wired up.
  // -------------------------------------------------------------------------
  //
  // const headers: Record<string, string> = {
  //   'Authorization': `Bearer ${accessToken}`,
  //   'Content-Type': 'application/json',
  // }
  //
  // const fetchOptions: RequestInit = { method, headers }
  // if (body) {
  //   fetchOptions.body = JSON.stringify(body)
  // }
  //
  // const response = await fetch(url, fetchOptions)
  //
  // if (!response.ok) {
  //   const text = await response.text()
  //   let message = `GSC API ${response.status}`
  //   try {
  //     const parsed = JSON.parse(text) as {
  //       error?: { message?: string; code?: number }
  //     }
  //     message = parsed.error?.message ?? message
  //   } catch {
  //     // Use the default message
  //   }
  //   return { ok: false, status: response.status, message }
  // }
  //
  // const data = (await response.json()) as T
  // return { ok: true, data }
  // -------------------------------------------------------------------------

  // STUB: Return empty results until API credentials are configured
  console.warn('[gsc] Stub mode — skipping real API call to', url)
  void accessToken
  void method
  void body
  return { ok: true, data: { rows: [] } as unknown as T }
}

// ---------------------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------------------

/**
 * Format a Date as YYYY-MM-DD string.
 */
function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

/**
 * Return start/end dates for a rolling window of `monthsBack` months.
 * Defaults to the full 16-month window.
 *
 * GSC data is available with a ~3-day delay, so endDate is set to 3 days ago.
 */
export function getDateRange(monthsBack: number = ROLLING_WINDOW_MONTHS): {
  startDate: string
  endDate: string
} {
  const end = new Date()
  end.setDate(end.getDate() - GSC_REPORTING_LAG_DAYS)

  const start = new Date(end)
  start.setMonth(start.getMonth() - monthsBack)

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  }
}

/**
 * Return start/end dates for incremental cron syncs (last N days).
 * Accounts for the ~3-day data availability lag.
 */
export function getIncrementalDateRange(daysBack: number = 3): {
  startDate: string
  endDate: string
} {
  const end = new Date()
  end.setDate(end.getDate() - GSC_REPORTING_LAG_DAYS)

  const start = new Date(end)
  start.setDate(start.getDate() - daysBack)

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  }
}

/**
 * Split a date range into monthly chunks for paginated fetching.
 * Each chunk is at most 1 calendar month to avoid API timeouts.
 */
export function splitIntoMonthlyChunks(
  startDate: string,
  endDate: string,
): Array<{ startDate: string; endDate: string }> {
  const chunks: Array<{ startDate: string; endDate: string }> = []

  let current = new Date(startDate)
  const end = new Date(endDate)

  while (current < end) {
    const chunkEnd = new Date(current)
    chunkEnd.setMonth(chunkEnd.getMonth() + 1)
    chunkEnd.setDate(chunkEnd.getDate() - 1) // last day of that month window

    const actualEnd = chunkEnd > end ? end : chunkEnd

    chunks.push({
      startDate: formatDate(current),
      endDate: formatDate(actualEnd),
    })

    // Move to the next chunk start
    current = new Date(actualEnd)
    current.setDate(current.getDate() + 1)
  }

  return chunks
}

// ---------------------------------------------------------------------------
// Fetch search analytics (with automatic pagination)
// ---------------------------------------------------------------------------

/**
 * Fetch search analytics data for a verified site.
 *
 * POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query
 *
 * Automatically paginates using rowLimit=25000 and startRow offset.
 * Returns all rows across all pages.
 *
 * TODO: Enable when GSC API credentials are configured.
 */
export async function fetchSearchAnalytics(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: GSCDimension[] = ['date', 'page', 'query'],
): Promise<GSCResult<GSCSearchAnalyticsResponse>> {
  const encodedSiteUrl = encodeURIComponent(siteUrl)
  const url = `${GSC_API_BASE}/sites/${encodedSiteUrl}/searchAnalytics/query`

  const allRows: GSCSearchAnalyticsRow[] = []
  let startRow = 0
  let hasMore = true

  while (hasMore) {
    const body: Record<string, unknown> = {
      startDate,
      endDate,
      dimensions,
      rowLimit: ROW_LIMIT,
      startRow,
    }

    const result = await gscFetch<GSCSearchAnalyticsResponse>(url, accessToken, {
      method: 'POST',
      body,
    })

    if (!result.ok) {
      return result
    }

    const rows = result.data.rows ?? []
    allRows.push(...rows)

    // If we received fewer rows than the limit, we've exhausted the data
    if (rows.length < ROW_LIMIT) {
      hasMore = false
    } else {
      startRow += ROW_LIMIT
    }
  }

  return {
    ok: true,
    data: {
      rows: allRows,
      responseAggregationType: 'byPage',
    },
  }
}

// ---------------------------------------------------------------------------
// Legacy search analytics (preserved for backwards compatibility)
// ---------------------------------------------------------------------------

/**
 * Fetch search analytics data for a verified site (single-page, non-paginating).
 *
 * @deprecated Use fetchSearchAnalytics instead, which handles pagination.
 *
 * TODO: Enable when GSC API credentials are configured.
 */
export async function searchAnalytics(
  _apiKey: string,
  _siteUrl: string,
  _startDate: string,
  _endDate: string,
  _options?: GSCSearchAnalyticsOptions,
): Promise<GSCResult<GSCSearchAnalyticsResponse>> {
  // TODO: Enable when GSC API credentials are configured
  return { ok: true, data: { rows: [] } }
}

// ---------------------------------------------------------------------------
// List verified sites
// ---------------------------------------------------------------------------

/**
 * List all verified sites for the authenticated user.
 * GET /sites
 *
 * TODO: Enable when GSC API credentials are configured
 */
export async function listSites(
  _apiKey: string,
): Promise<GSCResult<GSCSitesResponse>> {
  // TODO: Enable when GSC API credentials are configured
  //
  // const url = `${GSC_API_BASE}/sites`
  // return gscFetch<GSCSitesResponse>(url, apiKey)

  return { ok: true, data: { siteEntry: [] } }
}

// ---------------------------------------------------------------------------
// Get sitemaps
// ---------------------------------------------------------------------------

/**
 * List sitemaps for a verified site.
 * GET /sites/{siteUrl}/sitemaps
 *
 * TODO: Enable when GSC API credentials are configured
 */
export async function getSitemaps(
  _apiKey: string,
  _siteUrl: string,
): Promise<GSCResult<GSCSitemapsResponse>> {
  // TODO: Enable when GSC API credentials are configured
  //
  // const encodedSiteUrl = encodeURIComponent(siteUrl)
  // const url = `${GSC_API_BASE}/sites/${encodedSiteUrl}/sitemaps`
  // return gscFetch<GSCSitemapsResponse>(url, apiKey)

  return { ok: true, data: { sitemap: [] } }
}

// ---------------------------------------------------------------------------
// Map GSC rows to search_console_daily format
// ---------------------------------------------------------------------------

/**
 * Map raw GSC API rows to SearchConsoleDailyInsert records.
 *
 * Expects dimensions in order: [date, page, query].
 * The siteUrl parameter is reserved for future normalisation of relative paths.
 *
 * asset_id and topic_id are left null — populated later by a matching pass
 * that links page_url to assets via external_url and queries to topics via
 * keyword/alias matching.
 */
export function mapToSearchConsoleDaily(
  rows: GSCSearchAnalyticsRow[],
  _siteUrl: string,
): SearchConsoleDailyInsert[] {
  return rows.map((row) => {
    // Dimension order: date, page, query
    const [date, pageUrl, query] = row.keys

    return {
      date: date ?? '',
      page_url: pageUrl ?? '',
      query: query ?? '',
      asset_id: null, // TODO: Match page_url to asset via external_url lookup
      topic_id: null, // TODO: Match query to topic via keyword/alias matching
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      position: row.position ?? null,
    }
  })
}

// ---------------------------------------------------------------------------
// Query / URL matching helpers
// ---------------------------------------------------------------------------

/**
 * Match a GSC query string against a list of topic aliases.
 * Returns the matched alias or null if no match is found.
 *
 * Matching is case-insensitive and checks whether any alias appears
 * as a substring of the query.
 */
export function matchQueryToTopic(
  query: string,
  aliases: Array<{ alias: string; topic_id: string }>,
): { alias: string; topic_id: string } | null {
  const normalisedQuery = query.toLowerCase().trim()

  for (const entry of aliases) {
    const normalisedAlias = entry.alias.toLowerCase().trim()
    if (normalisedQuery.includes(normalisedAlias)) {
      return entry
    }
  }

  return null
}

/**
 * Extract a slug from a full page URL for asset matching.
 * Strips the base URL and leading/trailing slashes.
 *
 * Example: matchUrlToAsset('https://roadmancycling.com/blog/my-post', 'https://roadmancycling.com')
 * => 'blog/my-post'
 */
export function matchUrlToAsset(pageUrl: string, baseUrl: string): string | null {
  const normalisedPageUrl = pageUrl.toLowerCase().replace(/\/$/, '')
  const normalisedBaseUrl = baseUrl.toLowerCase().replace(/\/$/, '')

  if (!normalisedPageUrl.startsWith(normalisedBaseUrl)) {
    return null
  }

  const slug = normalisedPageUrl
    .slice(normalisedBaseUrl.length)
    .replace(/^\//, '')
    .replace(/\/$/, '')

  return slug || null
}
