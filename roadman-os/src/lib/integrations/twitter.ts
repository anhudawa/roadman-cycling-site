/**
 * X / Twitter API v2 client for Roadman OS.
 *
 * Handles user-level data: tweets, engagement metrics,
 * and follower statistics.
 *
 * OAuth2 scopes required: tweet.read, users.read
 *
 * NOTE: API credentials are NOT yet available.
 * All fetch calls are stubbed with TODO comments.
 */

import { buildPerformanceRecord } from './types'
import type { PerformanceRecordInsert } from '@/types/database'

// ==========================================================================
// Constants
// ==========================================================================

const BASE_URL = 'https://api.twitter.com/2'

// ==========================================================================
// Types — Twitter API v2 response shapes
// ==========================================================================

/** Public metrics attached to a single tweet. */
export type TweetPublicMetrics = {
  retweet_count: number
  reply_count: number
  like_count: number
  quote_count: number
  bookmark_count: number
  impression_count: number
}

/** Non-public (organic) metrics — requires elevated access. */
export type TweetNonPublicMetrics = {
  impression_count: number
  url_link_clicks: number
  user_profile_clicks: number
}

/** Combined metrics object for a tweet. */
export type TweetMetrics = {
  public: TweetPublicMetrics
  nonPublic?: TweetNonPublicMetrics
}

/** A single tweet from the Twitter API v2. */
export type Tweet = {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics: TweetPublicMetrics
  non_public_metrics?: TweetNonPublicMetrics
  edit_history_tweet_ids?: string[]
}

/** Public metrics for a Twitter user. */
export type TwitterUserPublicMetrics = {
  followers_count: number
  following_count: number
  tweet_count: number
  listed_count: number
}

/** A Twitter user profile from the API v2. */
export type TwitterUser = {
  id: string
  name: string
  username: string
  description: string
  profile_image_url?: string
  public_metrics: TwitterUserPublicMetrics
  created_at: string
  verified: boolean
}

/** Paginated response wrapper from Twitter API v2. */
export type TwitterPaginatedResponse<T> = {
  data: T[]
  meta: {
    result_count: number
    next_token?: string
    previous_token?: string
    newest_id?: string
    oldest_id?: string
  }
}

/** Single-item response wrapper from Twitter API v2. */
export type TwitterSingleResponse<T> = {
  data: T
}

/** Follower list response (paginated). */
export type TwitterFollowersResponse = {
  data: TwitterUser[]
  meta: {
    result_count: number
    next_token?: string
  }
}

// ==========================================================================
// Error handling
// ==========================================================================

export class TwitterApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message)
    this.name = 'TwitterApiError'
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

async function twitterFetch<T>(url: string, accessToken: string): Promise<T> {
  // TODO: Uncomment when Twitter API credentials are available
  // const response = await fetch(url, {
  //   method: 'GET',
  //   headers: authHeaders(accessToken),
  // })
  //
  // if (!response.ok) {
  //   const body = await response.text()
  //   throw new TwitterApiError(
  //     `Twitter API ${response.status}: ${response.statusText}`,
  //     response.status,
  //     body,
  //   )
  // }
  //
  // return response.json() as Promise<T>

  // Stub: throw until real credentials are configured
  void authHeaders(accessToken)
  void url
  throw new TwitterApiError(
    'Twitter API credentials not configured — see TODO in twitter.ts',
    501,
    null,
  )
}

// ==========================================================================
// Public API functions
// ==========================================================================

/**
 * Fetch recent tweets for an authenticated user.
 *
 * @param accessToken - A valid OAuth2 access token
 * @param userId      - The Twitter user ID
 * @param maxResults  - Number of tweets to return (default 20, max 100)
 * @param paginationToken - Token for paginating through results
 */
export async function getUserTweets(
  accessToken: string,
  userId: string,
  maxResults = 20,
  paginationToken?: string,
): Promise<TwitterPaginatedResponse<Tweet>> {
  const params = new URLSearchParams({
    'tweet.fields': 'created_at,public_metrics,non_public_metrics,edit_history_tweet_ids',
    max_results: String(Math.min(maxResults, 100)),
  })

  if (paginationToken) {
    params.set('pagination_token', paginationToken)
  }

  // TODO: Make real API call when credentials are available
  // return twitterFetch<TwitterPaginatedResponse<Tweet>>(
  //   `${BASE_URL}/users/${userId}/tweets?${params.toString()}`,
  //   accessToken,
  // )

  return twitterFetch<TwitterPaginatedResponse<Tweet>>(
    `${BASE_URL}/users/${userId}/tweets?${params.toString()}`,
    accessToken,
  )
}

/**
 * Get metrics for a specific tweet by ID.
 *
 * @param accessToken - A valid OAuth2 access token
 * @param tweetId     - The tweet ID
 */
export async function getTweetMetrics(
  accessToken: string,
  tweetId: string,
): Promise<TwitterSingleResponse<Tweet>> {
  const params = new URLSearchParams({
    'tweet.fields': 'created_at,public_metrics,non_public_metrics',
  })

  // TODO: Make real API call when credentials are available
  // return twitterFetch<TwitterSingleResponse<Tweet>>(
  //   `${BASE_URL}/tweets/${tweetId}?${params.toString()}`,
  //   accessToken,
  // )

  return twitterFetch<TwitterSingleResponse<Tweet>>(
    `${BASE_URL}/tweets/${tweetId}?${params.toString()}`,
    accessToken,
  )
}

/**
 * Get the follower list for a user (paginated).
 *
 * @param accessToken     - A valid OAuth2 access token
 * @param userId          - The Twitter user ID
 * @param maxResults      - Number of followers to return (default 100, max 1000)
 * @param paginationToken - Token for paginating through results
 */
export async function getUserFollowers(
  accessToken: string,
  userId: string,
  maxResults = 100,
  paginationToken?: string,
): Promise<TwitterFollowersResponse> {
  const params = new URLSearchParams({
    'user.fields': 'created_at,description,public_metrics,profile_image_url,verified',
    max_results: String(Math.min(maxResults, 1000)),
  })

  if (paginationToken) {
    params.set('pagination_token', paginationToken)
  }

  // TODO: Make real API call when credentials are available
  // return twitterFetch<TwitterFollowersResponse>(
  //   `${BASE_URL}/users/${userId}/followers?${params.toString()}`,
  //   accessToken,
  // )

  return twitterFetch<TwitterFollowersResponse>(
    `${BASE_URL}/users/${userId}/followers?${params.toString()}`,
    accessToken,
  )
}

/**
 * Get the authenticated user's profile with public metrics.
 *
 * @param accessToken - A valid OAuth2 access token
 */
export async function getAuthenticatedUser(
  accessToken: string,
): Promise<TwitterSingleResponse<TwitterUser>> {
  const params = new URLSearchParams({
    'user.fields': 'created_at,description,public_metrics,profile_image_url,verified',
  })

  // TODO: Make real API call when credentials are available
  return twitterFetch<TwitterSingleResponse<TwitterUser>>(
    `${BASE_URL}/users/me?${params.toString()}`,
    accessToken,
  )
}

// ==========================================================================
// Performance record mapping
// ==========================================================================

/**
 * Map a Twitter tweet to a Roadman OS performance_record.
 *
 * @param tweet       - The tweet data from the API
 * @param assetId     - Optional linked asset ID
 * @param pubId       - Optional linked publication ID
 * @param recordedAt  - ISO timestamp for the record
 */
export function mapTweetToPerformanceRecord(
  tweet: Tweet,
  assetId: string | null,
  pubId: string | null,
  recordedAt: string,
): PerformanceRecordInsert {
  const pm = tweet.public_metrics
  const totalEngagement = pm.like_count + pm.retweet_count + pm.reply_count + pm.quote_count
  const engagementRate = pm.impression_count > 0
    ? totalEngagement / pm.impression_count
    : 0

  return buildPerformanceRecord('twitter_x', {
    asset_id: assetId,
    publication_id: pubId,
    recorded_at: recordedAt,
    views: 0,
    impressions: pm.impression_count,
    clicks: tweet.non_public_metrics?.url_link_clicks ?? 0,
    likes: pm.like_count,
    comments: pm.reply_count,
    shares: pm.retweet_count + pm.quote_count,
    saves: pm.bookmark_count,
    engagement_rate: engagementRate,
    reach: pm.impression_count,
    custom_metrics: {
      tweet_id: tweet.id,
      retweet_count: pm.retweet_count,
      quote_count: pm.quote_count,
      bookmark_count: pm.bookmark_count,
      user_profile_clicks: tweet.non_public_metrics?.user_profile_clicks ?? 0,
    },
  })
}

/**
 * Build an empty performance record for a tweet with no metrics.
 */
export function emptyTweetPerformanceRecord(
  assetId: string | null,
  pubId: string | null,
  recordedAt: string,
): PerformanceRecordInsert {
  return buildPerformanceRecord('twitter_x', {
    asset_id: assetId,
    publication_id: pubId,
    recorded_at: recordedAt,
  })
}
