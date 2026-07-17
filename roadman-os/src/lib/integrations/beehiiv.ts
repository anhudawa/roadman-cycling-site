/**
 * Beehiiv API client.
 *
 * API-key authentication (NOT OAuth).
 * All requests use `Authorization: Bearer {apiKey}`.
 * Beehiiv API v2: https://developers.beehiiv.com/docs/v2
 */

const BASE_URL = 'https://api.beehiiv.com/v2'

// ─── Types ───────────────────────────────────────────────────────────────────

export type BeehiivWebUrl = {
  url: string
}

export type BeehiivPost = {
  id: string
  title: string
  subtitle: string | null
  slug: string
  status: 'draft' | 'confirmed' | 'archived'
  audience: 'free' | 'premium' | 'both'
  publish_date: number | null
  displayed_date: number | null
  created: number
  split_tested: boolean
  subject_line: string | null
  preview_text: string | null
  thumbnail_url: string | null
  web_url: string | null
  content_tags: string[]
  authors: string[]
  stats: BeehiivPostStats | null
}

export type BeehiivPostStats = {
  recipients: number
  opens: number
  unique_opens: number
  open_rate: number
  clicks: number
  unique_clicks: number
  click_rate: number
  unsubscribes: number
}

export type BeehiivPublication = {
  id: string
  name: string
  description: string | null
  url: string | null
  created: number
  stats: BeehiivPublicationStats | null
}

export type BeehiivPublicationStats = {
  total_subscribers: number
  active_subscribers: number
  average_open_rate: number
  average_click_rate: number
}

export type BeehiivSegment = {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  created: number
  last_calculated: number | null
  subscriber_count: number
}

export type BeehiivAutomation = {
  id: string
  name: string
  status: 'active' | 'inactive' | 'draft'
  created: number
  updated: number
  trigger_type: string | null
  stats: BeehiivAutomationStats | null
}

export type BeehiivAutomationStats = {
  total_enrolled: number
  active_subscribers: number
  completed: number
}

export type BeehiivPaginatedResponse<T> = {
  data: T[]
  total_results: number
  page: number
  limit: number
  total_pages: number
}

export type BeehiivSingleResponse<T> = {
  data: T
}

// ─── Error handling ──────────────────────────────────────────────────────────

export class BeehiivApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody: string,
  ) {
    super(message)
    this.name = 'BeehiivApiError'
  }
}

async function beehiivFetch<T>(
  apiKey: string,
  path: string,
  params?: Record<string, string | number>,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new BeehiivApiError(
      `Beehiiv API error ${response.status}: ${response.statusText}`,
      response.status,
      body,
    )
  }

  return response.json() as Promise<T>
}

// ─── API functions ───────────────────────────────────────────────────────────

/**
 * List posts for a publication with page-based pagination.
 */
export async function listPosts(
  apiKey: string,
  publicationId: string,
  page = 1,
  limit = 10,
): Promise<BeehiivPaginatedResponse<BeehiivPost>> {
  return beehiivFetch<BeehiivPaginatedResponse<BeehiivPost>>(
    apiKey,
    `/publications/${publicationId}/posts`,
    { page, limit, expand: 'stats' },
  )
}

/**
 * Get a single post with its stats.
 */
export async function getPostStats(
  apiKey: string,
  publicationId: string,
  postId: string,
): Promise<BeehiivPost> {
  const result = await beehiivFetch<BeehiivSingleResponse<BeehiivPost>>(
    apiKey,
    `/publications/${publicationId}/posts/${postId}`,
    { expand: 'stats' },
  )
  return result.data
}

/**
 * Get publication details including subscriber stats.
 */
export async function getPublicationStats(
  apiKey: string,
  publicationId: string,
): Promise<BeehiivPublication> {
  const result = await beehiivFetch<BeehiivSingleResponse<BeehiivPublication>>(
    apiKey,
    `/publications/${publicationId}`,
  )
  return result.data
}

/**
 * List segments for a publication.
 */
export async function getSegments(
  apiKey: string,
  publicationId: string,
): Promise<BeehiivPaginatedResponse<BeehiivSegment>> {
  return beehiivFetch<BeehiivPaginatedResponse<BeehiivSegment>>(
    apiKey,
    `/publications/${publicationId}/segments`,
  )
}

/**
 * List automations for a publication.
 */
export async function getAutomations(
  apiKey: string,
  publicationId: string,
): Promise<BeehiivPaginatedResponse<BeehiivAutomation>> {
  return beehiivFetch<BeehiivPaginatedResponse<BeehiivAutomation>>(
    apiKey,
    `/publications/${publicationId}/automations`,
  )
}
