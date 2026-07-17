/**
 * LinkedIn API client for Roadman OS.
 *
 * Handles organisation-level data: posts, engagement statistics,
 * follower demographics and page-level analytics.
 *
 * OAuth2 scopes required: r_organization_social, rw_organization_admin
 */

// ==========================================================================
// Constants
// ==========================================================================

const BASE_URL = 'https://api.linkedin.com/v2'
const REST_BASE_URL = 'https://api.linkedin.com/rest'

const DEFAULT_HEADERS = {
  'X-Restli-Protocol-Version': '2.0.0',
  'LinkedIn-Version': '202401',
} as const

// ==========================================================================
// Types — LinkedIn API response shapes
// ==========================================================================

/** A single LinkedIn organisation post (UGC or share). */
export type LinkedInPost = {
  id: string
  author: string
  lifecycleState: string
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility'?: string
  }
  specificContent?: {
    'com.linkedin.ugc.ShareContent'?: {
      shareCommentary?: { text: string }
      shareMediaCategory?: string
      media?: LinkedInMedia[]
    }
  }
  created: { time: number; actor: string }
  lastModified: { time: number; actor: string }
}

export type LinkedInMedia = {
  status: string
  description?: { text: string }
  title?: { text: string }
  media?: string
  originalUrl?: string
  thumbnails?: { url: string }[]
}

/** Paginated list wrapper returned by LinkedIn. */
export type LinkedInPaginatedResponse<T> = {
  elements: T[]
  paging: {
    start: number
    count: number
    total: number
    links: { rel: string; href: string; type: string }[]
  }
}

/** Statistics for a single share/ugcPost. */
export type LinkedInShareStatistic = {
  totalShareStatistics: {
    shareCount: number
    clickCount: number
    engagement: number
    impressionCount: number
    likeCount: number
    commentCount: number
    uniqueImpressionsCount: number
  }
  share?: string
  ugcPost?: string
}

/** Organisation-level share statistics response. */
export type LinkedInShareStatisticsResponse = {
  elements: LinkedInShareStatistic[]
}

/** Follower count breakdown. */
export type LinkedInFollowerStatistics = {
  organicFollowerCount: number
  paidFollowerCount: number
}

/** Top-level follower statistics response. */
export type LinkedInFollowerResponse = {
  elements: {
    followerCounts: LinkedInFollowerStatistics
    followerCountsByAssociationType?: {
      type: string
      followerCounts: LinkedInFollowerStatistics
    }[]
    followerCountsByFunction?: {
      function: string
      followerCounts: LinkedInFollowerStatistics
    }[]
    followerCountsBySeniority?: {
      seniority: string
      followerCounts: LinkedInFollowerStatistics
    }[]
    followerCountsByIndustry?: {
      industry: string
      followerCounts: LinkedInFollowerStatistics
    }[]
    followerCountsByRegion?: {
      region: string
      followerCounts: LinkedInFollowerStatistics
    }[]
    followerCountsByCountry?: {
      country: string
      followerCounts: LinkedInFollowerStatistics
    }[]
    organizationalEntity: string
  }[]
}

/** Organisation page statistics (views, unique visitors). */
export type LinkedInPageStatistic = {
  totalPageStatistics: {
    views: {
      mobileProductsPageViews: { pageViews: number }
      allDesktopPageViews: { pageViews: number }
      allMobilePageViews: { pageViews: number }
      desktopProductsPageViews: { pageViews: number }
      mobileCareersPageViews: { pageViews: number }
      desktopCareersPageViews: { pageViews: number }
      desktopOverviewPageViews: { pageViews: number }
      mobileOverviewPageViews: { pageViews: number }
      mobileJobsPageViews: { pageViews: number }
      desktopJobsPageViews: { pageViews: number }
      mobileLifeAtPageViews: { pageViews: number }
      desktopLifeAtPageViews: { pageViews: number }
    }
    clicks: {
      mobileCustomButtonClickCounts: number
      desktopCustomButtonClickCounts: number
      mobileCareersPageClicks: { careersPageClicks: number }
      desktopCareersPageClicks: { careersPageClicks: number }
    }
  }
  timeRange?: {
    start: number
    end: number
  }
  organization: string
}

export type LinkedInPageStatisticsResponse = {
  elements: LinkedInPageStatistic[]
}

// ==========================================================================
// Error handling
// ==========================================================================

export class LinkedInApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message)
    this.name = 'LinkedInApiError'
  }
}

// ==========================================================================
// Internal helpers
// ==========================================================================

function authHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...DEFAULT_HEADERS,
  }
}

async function linkedInFetch<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new LinkedInApiError(
      `LinkedIn API ${response.status}: ${response.statusText}`,
      response.status,
      body,
    )
  }

  return response.json() as Promise<T>
}

/**
 * Encode a URN for use in query parameters.
 * LinkedIn requires double-encoding of URNs in some endpoints.
 */
function encodeUrn(urn: string): string {
  return encodeURIComponent(urn)
}

// ==========================================================================
// Public API functions
// ==========================================================================

/**
 * List organisation posts (UGC posts / shares).
 *
 * @param accessToken - A valid OAuth2 access token
 * @param orgId       - The numeric LinkedIn organisation ID
 * @param start       - Pagination offset (default 0)
 * @param count       - Number of posts to return (default 20, max 100)
 */
export async function listOrganizationPosts(
  accessToken: string,
  orgId: string,
  start = 0,
  count = 20,
): Promise<LinkedInPaginatedResponse<LinkedInPost>> {
  const orgUrn = `urn:li:organization:${orgId}`
  const params = new URLSearchParams({
    q: 'authors',
    authors: `List(${encodeUrn(orgUrn)})`,
    start: String(start),
    count: String(Math.min(count, 100)),
    sortBy: 'LAST_MODIFIED',
  })

  return linkedInFetch<LinkedInPaginatedResponse<LinkedInPost>>(
    `${BASE_URL}/ugcPosts?${params.toString()}`,
    accessToken,
  )
}

/**
 * Get engagement statistics for a set of posts.
 *
 * @param accessToken - A valid OAuth2 access token
 * @param orgId       - The numeric LinkedIn organisation ID
 * @param shareUrns   - Array of share/ugcPost URNs to get stats for
 */
export async function getPostStatistics(
  accessToken: string,
  orgId: string,
  shareUrns: string[],
): Promise<LinkedInShareStatisticsResponse> {
  const orgUrn = `urn:li:organization:${orgId}`

  // The organizationalEntityShareStatistics endpoint accepts multiple
  // share URNs via the `shares` parameter as a List()
  const encodedShares = shareUrns.map(encodeUrn)
  const sharesList = `List(${encodedShares.join(',')})`

  const params = new URLSearchParams({
    q: 'organizationalEntity',
    organizationalEntity: orgUrn,
    shares: sharesList,
  })

  return linkedInFetch<LinkedInShareStatisticsResponse>(
    `${BASE_URL}/organizationalEntityShareStatistics?${params.toString()}`,
    accessToken,
  )
}

/**
 * Get follower count and demographic breakdowns for an organisation.
 *
 * @param accessToken - A valid OAuth2 access token
 * @param orgId       - The numeric LinkedIn organisation ID
 */
export async function getFollowerData(
  accessToken: string,
  orgId: string,
): Promise<LinkedInFollowerResponse> {
  const orgUrn = `urn:li:organization:${orgId}`

  const params = new URLSearchParams({
    q: 'organizationalEntity',
    organizationalEntity: orgUrn,
  })

  return linkedInFetch<LinkedInFollowerResponse>(
    `${BASE_URL}/organizationalEntityFollowerStatistics?${params.toString()}`,
    accessToken,
  )
}

/**
 * Get organisation page-level statistics (page views, unique visitors).
 *
 * @param accessToken - A valid OAuth2 access token
 * @param orgId       - The numeric LinkedIn organisation ID
 * @param startDate   - ISO 8601 date string (e.g. "2024-01-01")
 * @param endDate     - ISO 8601 date string (e.g. "2024-01-31")
 */
export async function getOrganizationStatistics(
  accessToken: string,
  orgId: string,
  startDate: string,
  endDate: string,
): Promise<LinkedInPageStatisticsResponse> {
  const orgUrn = `urn:li:organization:${orgId}`

  // LinkedIn expects epoch milliseconds for time ranges
  const startMs = new Date(startDate).getTime()
  const endMs = new Date(endDate).getTime()

  const params = new URLSearchParams({
    q: 'organizationalEntity',
    organizationalEntity: orgUrn,
    'timeIntervals.timeGranularityType': 'DAY',
    'timeIntervals.timeRange.start': String(startMs),
    'timeIntervals.timeRange.end': String(endMs),
  })

  return linkedInFetch<LinkedInPageStatisticsResponse>(
    `${BASE_URL}/organizationPageStatistics?${params.toString()}`,
    accessToken,
  )
}
