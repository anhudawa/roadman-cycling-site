/**
 * Roadman OS — Meta Graph API client (Instagram + Facebook).
 * Base URL: https://graph.facebook.com/v19.0
 * OAuth2 scopes: instagram_basic, instagram_manage_insights, pages_read_engagement,
 *                pages_show_list, read_insights
 */

const META_BASE_URL = 'https://graph.facebook.com/v19.0'

// ==========================================================================
// Error types
// ==========================================================================

type MetaGraphErrorDetail = {
  message: string
  type: string
  code: number
  error_subcode?: number
  fbtrace_id?: string
}

export class MetaGraphError extends Error {
  public readonly code: number
  public readonly type: string
  public readonly subcode: number | undefined
  public readonly fbtraceId: string | undefined

  constructor(detail: MetaGraphErrorDetail) {
    super(detail.message)
    this.name = 'MetaGraphError'
    this.code = detail.code
    this.type = detail.type
    this.subcode = detail.error_subcode
    this.fbtraceId = detail.fbtrace_id
  }
}

// ==========================================================================
// Shared response types
// ==========================================================================

type CursorPaging = {
  cursors: {
    before: string
    after: string
  }
  next?: string
  previous?: string
}

type PaginatedResponse<T> = {
  data: T[]
  paging?: CursorPaging
}

type MetaApiResponse<T> = {
  data: T[]
  paging?: CursorPaging
  error?: MetaGraphErrorDetail
}

// ==========================================================================
// Instagram types
// ==========================================================================

export type InstagramMedia = {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  permalink?: string
  thumbnail_url?: string
  timestamp: string
  like_count?: number
  comments_count?: number
}

export type InstagramInsightValue = {
  value: number
}

export type InstagramInsight = {
  name: string
  period: string
  values: InstagramInsightValue[]
  title: string
  description: string
  id: string
}

export type InstagramMediaInsights = {
  reach: number
  impressions: number
  engagement: number
  saves: number
  shares: number
  video_views: number
}

export type InstagramAccountInsightValue = {
  value: number
  end_time: string
}

export type InstagramAccountInsight = {
  name: string
  period: string
  values: InstagramAccountInsightValue[]
  title: string
  description: string
  id: string
}

// ==========================================================================
// Facebook types
// ==========================================================================

export type FacebookPost = {
  id: string
  message?: string
  created_time: string
  permalink_url?: string
  full_picture?: string
  type?: string
  status_type?: string
}

export type FacebookInsightValue = {
  value: number | Record<string, number>
}

export type FacebookPostInsight = {
  name: string
  period: string
  values: FacebookInsightValue[]
  title: string
  description: string
  id: string
}

export type FacebookPostInsights = {
  impressions: number
  clicks: number
  reactions: number
}

export type FacebookPageInsightValue = {
  value: number
  end_time: string
}

export type FacebookPageInsight = {
  name: string
  period: string
  values: FacebookPageInsightValue[]
  title: string
  description: string
  id: string
}

// ==========================================================================
// Account discovery types
// ==========================================================================

export type FacebookPage = {
  id: string
  name: string
  access_token: string
  category?: string
  instagram_business_account?: {
    id: string
  }
}

// ==========================================================================
// Internal fetch helper
// ==========================================================================

async function metaFetch<T>(url: string, accessToken: string): Promise<T> {
  const separator = url.includes('?') ? '&' : '?'
  const fullUrl = `${url}${separator}access_token=${encodeURIComponent(accessToken)}`

  const response = await fetch(fullUrl, {
    headers: { Accept: 'application/json' },
  })

  const body = await response.json() as T & { error?: MetaGraphErrorDetail }

  if (body.error) {
    throw new MetaGraphError(body.error)
  }

  if (!response.ok) {
    throw new MetaGraphError({
      message: `Meta Graph API returned HTTP ${response.status}`,
      type: 'HttpError',
      code: response.status,
    })
  }

  return body
}

// ==========================================================================
// Cursor-based pagination helper
// ==========================================================================

/**
 * Generic cursor-based pagination handler for Meta Graph API.
 * Follows `paging.cursors.after` until no more pages or `maxPages` reached.
 */
export async function handleCursorPagination<T>(
  accessToken: string,
  initialUrl: string,
  maxPages = 5,
): Promise<T[]> {
  const allItems: T[] = []
  let url: string | null = initialUrl
  let page = 0

  while (url !== null && page < maxPages) {
    const currentUrl: string = url
    const response: MetaApiResponse<T> = await metaFetch<MetaApiResponse<T>>(currentUrl, accessToken)

    if (response.data) {
      allItems.push(...response.data)
    }

    // Follow the next cursor if available
    if (response.paging?.cursors?.after && response.paging.next) {
      const nextUrl: string = response.paging.next
      // Strip access_token from next URL — metaFetch adds it
      const parsedUrl = new URL(nextUrl)
      parsedUrl.searchParams.delete('access_token')
      url = parsedUrl.toString()
    } else {
      url = null
    }

    page++
  }

  return allItems
}

// ==========================================================================
// Account discovery
// ==========================================================================

/**
 * Get Facebook pages the user manages (includes Instagram business account IDs).
 */
export async function getUserPages(accessToken: string): Promise<FacebookPage[]> {
  const url = `${META_BASE_URL}/me/accounts?fields=id,name,access_token,category,instagram_business_account`
  return handleCursorPagination<FacebookPage>(accessToken, url)
}

// ==========================================================================
// Instagram functions
// ==========================================================================

/**
 * List media for an Instagram business/creator account with cursor-based pagination.
 */
export async function listInstagramMedia(
  accessToken: string,
  igUserId: string,
  limit = 25,
  after?: string,
): Promise<PaginatedResponse<InstagramMedia>> {
  const params = new URLSearchParams({
    fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count',
    limit: String(limit),
  })

  if (after) {
    params.set('after', after)
  }

  const url = `${META_BASE_URL}/${igUserId}/media?${params.toString()}`
  const response = await metaFetch<MetaApiResponse<InstagramMedia>>(url, accessToken)

  return {
    data: response.data ?? [],
    paging: response.paging,
  }
}

/**
 * Get insights for a specific Instagram media item.
 * Metrics: reach, impressions, engagement, saves, shares, video_views.
 */
export async function getInstagramInsights(
  accessToken: string,
  mediaId: string,
): Promise<InstagramMediaInsights> {
  // Note: video_views is only available for VIDEO type, shares for Reels.
  // The API will return what's applicable and omit unavailable metrics.
  const metrics = 'reach,impressions,engagement,saved,shares,video_views'
  const url = `${META_BASE_URL}/${mediaId}/insights?metric=${metrics}`

  const defaults: InstagramMediaInsights = {
    reach: 0,
    impressions: 0,
    engagement: 0,
    saves: 0,
    shares: 0,
    video_views: 0,
  }

  try {
    const response = await metaFetch<MetaApiResponse<InstagramInsight>>(url, accessToken)

    if (!response.data) return defaults

    for (const insight of response.data) {
      const value = insight.values[0]?.value ?? 0
      switch (insight.name) {
        case 'reach':
          defaults.reach = value
          break
        case 'impressions':
          defaults.impressions = value
          break
        case 'engagement':
          defaults.engagement = value
          break
        case 'saved':
          defaults.saves = value
          break
        case 'shares':
          defaults.shares = value
          break
        case 'video_views':
          defaults.video_views = value
          break
      }
    }

    return defaults
  } catch (err) {
    // Some metrics are unavailable for certain media types (e.g. video_views on images).
    // If the entire call fails, return zeros rather than crashing the sync.
    if (err instanceof MetaGraphError && err.code === 100) {
      return defaults
    }
    throw err
  }
}

/**
 * Get account-level insights for an Instagram business/creator account.
 */
export async function getInstagramAccountInsights(
  accessToken: string,
  igUserId: string,
  period: 'day' | 'week' | 'month',
  since: string,
  until: string,
): Promise<InstagramAccountInsight[]> {
  const metrics = 'impressions,reach,profile_views,follower_count'
  const params = new URLSearchParams({
    metric: metrics,
    period,
    since,
    until,
  })

  const url = `${META_BASE_URL}/${igUserId}/insights?${params.toString()}`
  const response = await metaFetch<MetaApiResponse<InstagramAccountInsight>>(url, accessToken)

  return response.data ?? []
}

// ==========================================================================
// Facebook functions
// ==========================================================================

/**
 * List posts for a Facebook page with cursor-based pagination.
 */
export async function listFacebookPosts(
  accessToken: string,
  pageId: string,
  limit = 25,
  after?: string,
): Promise<PaginatedResponse<FacebookPost>> {
  const params = new URLSearchParams({
    fields: 'id,message,created_time,permalink_url,full_picture,type,status_type',
    limit: String(limit),
  })

  if (after) {
    params.set('after', after)
  }

  const url = `${META_BASE_URL}/${pageId}/posts?${params.toString()}`
  const response = await metaFetch<MetaApiResponse<FacebookPost>>(url, accessToken)

  return {
    data: response.data ?? [],
    paging: response.paging,
  }
}

/**
 * Get insights for a specific Facebook post.
 * Metrics: impressions, post_clicks, post_reactions_by_type_total.
 */
export async function getFacebookInsights(
  accessToken: string,
  postId: string,
): Promise<FacebookPostInsights> {
  const metrics = 'post_impressions,post_clicks,post_reactions_by_type_total'
  const url = `${META_BASE_URL}/${postId}/insights?metric=${metrics}`

  const defaults: FacebookPostInsights = {
    impressions: 0,
    clicks: 0,
    reactions: 0,
  }

  try {
    const response = await metaFetch<MetaApiResponse<FacebookPostInsight>>(url, accessToken)

    if (!response.data) return defaults

    for (const insight of response.data) {
      const rawValue = insight.values[0]?.value
      switch (insight.name) {
        case 'post_impressions':
          defaults.impressions = typeof rawValue === 'number' ? rawValue : 0
          break
        case 'post_clicks':
          defaults.clicks = typeof rawValue === 'number' ? rawValue : 0
          break
        case 'post_reactions_by_type_total': {
          // post_reactions_by_type_total returns { like: N, love: N, ... }
          if (rawValue && typeof rawValue === 'object') {
            const reactionCounts = rawValue as Record<string, number>
            defaults.reactions = Object.values(reactionCounts).reduce(
              (sum, count) => sum + count,
              0,
            )
          }
          break
        }
      }
    }

    return defaults
  } catch (err) {
    if (err instanceof MetaGraphError && err.code === 100) {
      return defaults
    }
    throw err
  }
}

/**
 * Get page-level insights for a Facebook page.
 */
export async function getFacebookPageInsights(
  accessToken: string,
  pageId: string,
  period: 'day' | 'week' | 'month',
  since: string,
  until: string,
): Promise<FacebookPageInsight[]> {
  const metrics = 'page_impressions,page_engaged_users,page_post_engagements,page_fan_adds'
  const params = new URLSearchParams({
    metric: metrics,
    period,
    since,
    until,
  })

  const url = `${META_BASE_URL}/${pageId}/insights?${params.toString()}`
  const response = await metaFetch<MetaApiResponse<FacebookPageInsight>>(url, accessToken)

  return response.data ?? []
}
