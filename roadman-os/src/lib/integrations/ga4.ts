/**
 * Google Analytics 4 Data API client.
 *
 * Uses the GA4 Data API v1beta to fetch page-level analytics, traffic sources,
 * device breakdowns, and engagement metrics.
 *
 * Auth: service account API key passed as a Bearer token.
 * The key is stored in the platform_connection's `access_token` field.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GA4_API_BASE = 'https://analyticsdata.googleapis.com/v1beta'

// ---------------------------------------------------------------------------
// GA4 Request types
// ---------------------------------------------------------------------------

export type GA4DateRange = {
  startDate: string
  endDate: string
}

export type GA4Dimension = {
  name: string
}

export type GA4Metric = {
  name: string
}

export type GA4OrderBy = {
  metric?: { metricName: string }
  dimension?: { dimensionName: string }
  desc: boolean
}

export type GA4ReportRequest = {
  dateRanges: GA4DateRange[]
  dimensions?: GA4Dimension[]
  metrics: GA4Metric[]
  orderBys?: GA4OrderBy[]
  limit?: number
  offset?: number
}

// ---------------------------------------------------------------------------
// GA4 Response types
// ---------------------------------------------------------------------------

export type GA4DimensionValue = {
  value: string
}

export type GA4MetricValue = {
  value: string
}

export type GA4Row = {
  dimensionValues?: GA4DimensionValue[]
  metricValues?: GA4MetricValue[]
}

export type GA4MetricHeader = {
  name: string
  type: string
}

export type GA4DimensionHeader = {
  name: string
}

export type GA4ReportResponse = {
  dimensionHeaders?: GA4DimensionHeader[]
  metricHeaders?: GA4MetricHeader[]
  rows?: GA4Row[]
  rowCount?: number
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Parsed row type — keyed by metric/dimension name for easy access
// ---------------------------------------------------------------------------

export type GA4ParsedRow = {
  dimensions: Record<string, string>
  metrics: Record<string, number>
}

// ---------------------------------------------------------------------------
// Result types (mirrors youtube.ts pattern)
// ---------------------------------------------------------------------------

export type GA4ApiError = {
  ok: false
  status: number
  message: string
}

type GA4ApiSuccess<T> = {
  ok: true
  data: T
}

export type GA4Result<T> = GA4ApiSuccess<T> | GA4ApiError

// ---------------------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------------------

/**
 * Format start/end dates into a GA4 DateRange object.
 * Dates should be in YYYY-MM-DD format.
 */
export function buildDateRange(startDate: string, endDate: string): GA4DateRange {
  return { startDate, endDate }
}

/**
 * Return a default date range going back `daysBack` days from today.
 * Defaults to 30 days.
 */
export function getDefaultDateRange(daysBack = 30): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - daysBack)

  const format = (d: Date): string => d.toISOString().split('T')[0]

  return {
    startDate: format(start),
    endDate: format(end),
  }
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function ga4Fetch<T>(
  url: string,
  apiKey: string,
  body: Record<string, unknown>,
): Promise<GA4Result<T>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    let message = `GA4 API ${response.status}`
    try {
      const parsed = JSON.parse(text) as {
        error?: { message?: string; status?: string }
      }
      message = parsed.error?.message ?? message
    } catch {
      // Use the default message
    }
    return { ok: false, status: response.status, message }
  }

  const data = (await response.json()) as T
  return { ok: true, data }
}

// ---------------------------------------------------------------------------
// Generic report runner
// ---------------------------------------------------------------------------

/**
 * Run an arbitrary GA4 report.
 * POST /properties/{propertyId}:runReport
 */
export async function runReport(
  apiKey: string,
  propertyId: string,
  options: GA4ReportRequest,
): Promise<GA4Result<GA4ReportResponse>> {
  const url = `${GA4_API_BASE}/properties/${propertyId}:runReport`

  const body: Record<string, unknown> = {
    dateRanges: options.dateRanges,
    metrics: options.metrics,
  }

  if (options.dimensions) body.dimensions = options.dimensions
  if (options.orderBys) body.orderBys = options.orderBys
  if (options.limit !== undefined) body.limit = options.limit
  if (options.offset !== undefined) body.offset = options.offset

  return ga4Fetch<GA4ReportResponse>(url, apiKey, body)
}

// ---------------------------------------------------------------------------
// Page views by page path
// ---------------------------------------------------------------------------

/**
 * Get page views broken down by page path.
 */
export async function getPageViews(
  apiKey: string,
  propertyId: string,
  startDate: string,
  endDate: string,
): Promise<GA4Result<GA4ReportResponse>> {
  return runReport(apiKey, propertyId, {
    dateRanges: [buildDateRange(startDate, endDate)],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
  })
}

// ---------------------------------------------------------------------------
// Traffic sources
// ---------------------------------------------------------------------------

/**
 * Get sessions broken down by source/medium.
 */
export async function getTrafficSources(
  apiKey: string,
  propertyId: string,
  startDate: string,
  endDate: string,
): Promise<GA4Result<GA4ReportResponse>> {
  return runReport(apiKey, propertyId, {
    dateRanges: [buildDateRange(startDate, endDate)],
    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionMedium' },
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  })
}

// ---------------------------------------------------------------------------
// Top pages by views
// ---------------------------------------------------------------------------

/**
 * Get top pages ordered by page views.
 */
export async function getTopPages(
  apiKey: string,
  propertyId: string,
  startDate: string,
  endDate: string,
  limit = 25,
): Promise<GA4Result<GA4ReportResponse>> {
  return runReport(apiKey, propertyId, {
    dateRanges: [buildDateRange(startDate, endDate)],
    dimensions: [
      { name: 'pagePath' },
      { name: 'pageTitle' },
    ],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'totalUsers' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit,
  })
}

// ---------------------------------------------------------------------------
// Device breakdown
// ---------------------------------------------------------------------------

/**
 * Get sessions broken down by device category (desktop, mobile, tablet).
 */
export async function getDeviceBreakdown(
  apiKey: string,
  propertyId: string,
  startDate: string,
  endDate: string,
): Promise<GA4Result<GA4ReportResponse>> {
  return runReport(apiKey, propertyId, {
    dateRanges: [buildDateRange(startDate, endDate)],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  })
}

// ---------------------------------------------------------------------------
// Engagement metrics (site-wide, no dimensions)
// ---------------------------------------------------------------------------

/**
 * Get site-wide engagement metrics: engagement rate, avg session duration,
 * bounce rate.
 */
export async function getEngagementMetrics(
  apiKey: string,
  propertyId: string,
  startDate: string,
  endDate: string,
): Promise<GA4Result<GA4ReportResponse>> {
  return runReport(apiKey, propertyId, {
    dateRanges: [buildDateRange(startDate, endDate)],
    metrics: [
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'screenPageViews' },
      { name: 'engagedSessions' },
    ],
  })
}

// ---------------------------------------------------------------------------
// Row parsing helpers
// ---------------------------------------------------------------------------

/**
 * Parse a GA4 report response into an array of keyed objects.
 * Converts dimensionValues/metricValues arrays into named key-value maps.
 */
export function parseReportRows(response: GA4ReportResponse): GA4ParsedRow[] {
  if (!response.rows) return []

  const dimHeaders = (response.dimensionHeaders ?? []).map((h) => h.name)
  const metHeaders = (response.metricHeaders ?? []).map((h) => h.name)

  return response.rows.map((row) => {
    const dimensions: Record<string, string> = {}
    const metrics: Record<string, number> = {}

    if (row.dimensionValues) {
      row.dimensionValues.forEach((dv, i) => {
        dimensions[dimHeaders[i]] = dv.value
      })
    }

    if (row.metricValues) {
      row.metricValues.forEach((mv, i) => {
        metrics[metHeaders[i]] = parseFloat(mv.value) || 0
      })
    }

    return { dimensions, metrics }
  })
}

/**
 * Extract a single metric value from a dimensionless (aggregated) report.
 * Useful for getEngagementMetrics responses.
 */
export function extractAggregateMetrics(
  response: GA4ReportResponse,
): Record<string, number> {
  const rows = parseReportRows(response)
  if (rows.length === 0) return {}
  return rows[0].metrics
}
