/**
 * TikTok API client for Roadman OS.
 *
 * Handles user-level data: video listings, engagement statistics,
 * and follower/profile information.
 *
 * OAuth2 scopes required: user.info.basic, video.list
 *
 * API reference: https://developers.tiktok.com/doc/research-api-get-started
 */

import { buildPerformanceRecord } from '@/lib/integrations/types'
import type { PerformanceRecordInsert } from '@/types/database'

// ==========================================================================
// Constants
// ==========================================================================

const BASE_URL = 'https://open.tiktokapis.com/v2'

// ==========================================================================
// Types — TikTok API response shapes
// ==========================================================================

/** Basic user profile information. */
export type TikTokUserInfo = {
  open_id: string
  union_id?: string
  display_name: string
  avatar_url: string
  avatar_url_100?: string
  bio_description?: string
  profile_deep_link?: string
  is_verified?: boolean
  follower_count?: number
  following_count?: number
  likes_count?: number
  video_count?: number
}

/** A single TikTok video. */
export type TikTokVideo = {
  id: string
  title: string
  video_description?: string
  create_time: number
  cover_image_url?: string
  share_url?: string
  duration: number
  height: number
  width: number
  embed_link?: string
  embed_html?: string
}

/** Engagement statistics for a single video. */
export type TikTokVideoStats = {
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  favourite_count: number
}

/** Paginated list wrapper returned by TikTok. */
export type TikTokPaginatedResponse<T> = {
  data: {
    videos: T[]
    cursor: number
    has_more: boolean
  }
  error: {
    code: string
    message: string
    log_id: string
  }
}

/** Single-item wrapper for user info responses. */
export type TikTokUserInfoResponse = {
  data: {
    user: TikTokUserInfo
  }
  error: {
    code: string
    message: string
    log_id: string
  }
}

/** Video list response including stats. */
export type TikTokVideoListResponse = {
  data: {
    videos: (TikTokVideo & TikTokVideoStats)[]
    cursor: number
    has_more: boolean
  }
  error: {
    code: string
    message: string
    log_id: string
  }
}

// ==========================================================================
// Error handling
// ==========================================================================

export class TikTokApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly logId?: string,
  ) {
    super(message)
    this.name = 'TikTokApiError'
  }
}

// ==========================================================================
// Internal helpers
// ==========================================================================

function authHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }
}

async function tiktokFetch<T>(
  url: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  // TODO: Implement actual TikTok API fetch once credentials are available
  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(accessToken),
      ...(options.headers as Record<string, string> | undefined),
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new TikTokApiError(
      `TikTok API ${response.status}: ${response.statusText}`,
      response.status,
      'http_error',
    )
  }

  const json = (await response.json()) as T & {
    error?: { code: string; message: string; log_id: string }
  }

  if (json.error && json.error.code !== 'ok') {
    throw new TikTokApiError(
      json.error.message,
      response.status,
      json.error.code,
      json.error.log_id,
    )
  }

  return json
}

// ==========================================================================
// Public API functions
// ==========================================================================

/**
 * Get the authenticated user's profile information.
 *
 * @param accessToken - A valid OAuth2 access token
 */
export async function getUserInfo(
  accessToken: string,
): Promise<TikTokUserInfo> {
  // TODO: Wire up to TikTok API v2 once credentials are available
  // Fields: open_id, union_id, display_name, avatar_url, bio_description,
  //         profile_deep_link, is_verified, follower_count, following_count,
  //         likes_count, video_count
  const fields = [
    'open_id',
    'union_id',
    'display_name',
    'avatar_url',
    'bio_description',
    'profile_deep_link',
    'is_verified',
    'follower_count',
    'following_count',
    'likes_count',
    'video_count',
  ].join(',')

  const url = `${BASE_URL}/user/info/?fields=${fields}`

  const response = await tiktokFetch<TikTokUserInfoResponse>(
    url,
    accessToken,
  )

  return response.data.user
}

/**
 * List the authenticated user's videos with engagement statistics.
 *
 * @param accessToken - A valid OAuth2 access token
 * @param cursor      - Pagination cursor (default 0 for first page)
 * @param maxCount    - Number of videos to return (default 20, max 20)
 */
export async function listUserVideos(
  accessToken: string,
  cursor = 0,
  maxCount = 20,
): Promise<TikTokVideoListResponse> {
  // TODO: Wire up to TikTok API v2 once credentials are available
  // POST request with JSON body for cursor-based pagination
  const fields = [
    'id',
    'title',
    'video_description',
    'create_time',
    'cover_image_url',
    'share_url',
    'duration',
    'height',
    'width',
    'view_count',
    'like_count',
    'comment_count',
    'share_count',
  ].join(',')

  const url = `${BASE_URL}/video/list/?fields=${fields}`

  const response = await tiktokFetch<TikTokVideoListResponse>(
    url,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        cursor,
        max_count: Math.min(maxCount, 20),
      }),
    },
  )

  return response
}

/**
 * Get engagement statistics for a specific video.
 *
 * TikTok returns stats inline with the video list endpoint,
 * but this function provides a single-video lookup when needed.
 *
 * @param accessToken - A valid OAuth2 access token
 * @param videoId     - The TikTok video ID
 */
export async function getVideoStats(
  accessToken: string,
  videoId: string,
): Promise<TikTokVideoStats> {
  // TODO: Wire up to TikTok API v2 once credentials are available
  // The video/query endpoint allows fetching stats for specific videos
  const fields = [
    'id',
    'view_count',
    'like_count',
    'comment_count',
    'share_count',
  ].join(',')

  const url = `${BASE_URL}/video/query/?fields=${fields}`

  const response = await tiktokFetch<{
    data: { videos: (TikTokVideo & TikTokVideoStats)[] }
    error: { code: string; message: string; log_id: string }
  }>(url, accessToken, {
    method: 'POST',
    body: JSON.stringify({
      filters: {
        video_ids: [videoId],
      },
    }),
  })

  const video = response.data.videos[0]
  if (!video) {
    throw new TikTokApiError(
      `Video not found: ${videoId}`,
      404,
      'video_not_found',
    )
  }

  return {
    view_count: video.view_count ?? 0,
    like_count: video.like_count ?? 0,
    comment_count: video.comment_count ?? 0,
    share_count: video.share_count ?? 0,
    favourite_count: video.favourite_count ?? 0,
  }
}

// ==========================================================================
// Data mapping — TikTok → performance_records
// ==========================================================================

/**
 * Map a TikTok video with stats to a PerformanceRecordInsert.
 */
export function mapTikTokVideoToPerformance(
  video: TikTokVideo & Partial<TikTokVideoStats>,
  assetId: string | null,
  publicationId: string | null,
  recordedAt: string,
): PerformanceRecordInsert {
  const views = video.view_count ?? 0
  const likes = video.like_count ?? 0
  const comments = video.comment_count ?? 0
  const shares = video.share_count ?? 0
  const saves = video.favourite_count ?? 0

  const totalEngagement = likes + comments + shares + saves
  const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0

  return buildPerformanceRecord('tiktok', {
    asset_id: assetId,
    publication_id: publicationId,
    recorded_at: recordedAt,
    views,
    likes,
    comments,
    shares,
    saves,
    engagement_rate: engagementRate,
    watch_time_seconds: video.duration ?? 0,
    custom_metrics: {
      tiktok_video_id: video.id,
      share_url: video.share_url ?? null,
      duration_seconds: video.duration ?? 0,
    },
  })
}
