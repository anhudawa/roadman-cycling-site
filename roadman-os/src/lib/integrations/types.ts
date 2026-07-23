/**
 * Shared types for all platform integrations.
 * Used across sync services, API routes, cron jobs, and settings UI.
 */

import type { MetricSource, PerformanceRecordInsert } from '@/types/database'

// ==========================================================================
// Platform configuration
// ==========================================================================

export type AuthType = 'oauth' | 'api_key' | 'manual'

export type PlatformConfig = {
  slug: string
  name: string
  source: MetricSource
  authType: AuthType
  description: string
  /** OAuth scopes required (if applicable) */
  scopes?: string[]
  /** Default sync interval in minutes */
  syncIntervalMinutes: number
  /** Extra metadata fields needed for connection (e.g. property_id for GA4) */
  extraFields?: PlatformExtraField[]
}

export type PlatformExtraField = {
  name: string
  label: string
  placeholder: string
  hint: string
}

// ==========================================================================
// Sync types
// ==========================================================================

export type SyncStatus = 'pending' | 'running' | 'completed' | 'failed'

export type SyncResult = {
  success: boolean
  recordsSynced: number
  error?: string
  metadata?: Record<string, unknown>
}

export type SyncJobUpdate = {
  status: SyncStatus
  started_at?: string
  completed_at?: string
  records_synced?: number
  error_message?: string | null
  metadata?: Record<string, unknown>
}

export type SyncContext = {
  connectionId: string
  syncJobId: string
  accessToken: string
  metadata: Record<string, unknown>
}

// ==========================================================================
// Platform API response wrappers
// ==========================================================================

export type ApiResult<T> = {
  ok: true
  data: T
} | {
  ok: false
  message: string
  status: number
  quotaExceeded?: boolean
}

// ==========================================================================
// Performance record builder
// ==========================================================================

/**
 * Build a PerformanceRecordInsert with sensible defaults.
 * Override only the fields you need.
 */
export function buildPerformanceRecord(
  source: MetricSource,
  overrides: Partial<PerformanceRecordInsert> = {},
): PerformanceRecordInsert {
  return {
    asset_id: null,
    publication_id: null,
    source,
    recorded_at: new Date().toISOString(),
    views: 0,
    impressions: 0,
    clicks: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    subscribers_gained: 0,
    watch_time_seconds: 0,
    avg_view_duration_seconds: 0,
    ctr: 0,
    engagement_rate: 0,
    reach: 0,
    revenue_cents: 0,
    custom_metrics: {},
    ...overrides,
  }
}

// ==========================================================================
// Platform registry
// ==========================================================================

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    slug: 'youtube',
    name: 'YouTube',
    source: 'youtube',
    authType: 'oauth',
    description: 'Video analytics, revenue, and subscriber data',
    scopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ],
    syncIntervalMinutes: 360, // 6 hours
  },
  {
    slug: 'youtube-clips',
    name: 'YouTube Clips',
    source: 'youtube',
    authType: 'oauth',
    description: 'Clips channel analytics (second channel)',
    scopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ],
    syncIntervalMinutes: 360,
  },
  {
    slug: 'meta',
    name: 'Meta (Instagram + Facebook)',
    source: 'instagram',
    authType: 'oauth',
    description: 'Post insights, reach, and engagement',
    scopes: [
      'pages_show_list',
      'pages_read_engagement',
      'instagram_basic',
      'instagram_manage_insights',
    ],
    syncIntervalMinutes: 360,
  },
  {
    slug: 'linkedin',
    name: 'LinkedIn',
    source: 'linkedin',
    authType: 'oauth',
    description: 'Org posts, follower stats, and impressions',
    scopes: ['r_organization_social', 'rw_organization_admin'],
    syncIntervalMinutes: 720, // 12 hours
  },
  {
    slug: 'beehiiv',
    name: 'Beehiiv',
    source: 'beehiiv',
    authType: 'api_key',
    description: 'Newsletter metrics, subscribers, and growth',
    syncIntervalMinutes: 720,
    extraFields: [
      {
        name: 'publication_id',
        label: 'Publication ID',
        placeholder: 'pub_xxxxxxxx',
        hint: 'Found in Beehiiv Settings → API',
      },
    ],
  },
  {
    slug: 'ga4',
    name: 'Google Analytics 4',
    source: 'ga4',
    authType: 'api_key',
    description: 'Website traffic, top pages, and engagement',
    syncIntervalMinutes: 360,
    extraFields: [
      {
        name: 'property_id',
        label: 'Property ID',
        placeholder: '123456789',
        hint: 'Found in GA4 Admin → Property Settings',
      },
    ],
  },
  {
    slug: 'ga4-articles',
    name: 'GA4 Article-Level',
    source: 'ga4',
    authType: 'api_key',
    description: 'Per-article page views, time on page, and engagement',
    syncIntervalMinutes: 360,
    extraFields: [
      {
        name: 'property_id',
        label: 'Property ID',
        placeholder: '123456789',
        hint: 'Same property as site-level GA4',
      },
      {
        name: 'article_path_prefix',
        label: 'Article Path Prefix',
        placeholder: '/blog/',
        hint: 'URL prefix that identifies article pages',
      },
    ],
  },
  {
    slug: 'skool',
    name: 'Skool',
    source: 'skool',
    authType: 'manual',
    description: 'Community metrics (manual entry)',
    syncIntervalMinutes: 0, // manual only
  },
  {
    slug: 'tiktok',
    name: 'TikTok',
    source: 'tiktok',
    authType: 'oauth',
    description: 'Video views, engagement, and follower growth',
    scopes: ['user.info.basic', 'video.list'],
    syncIntervalMinutes: 360,
  },
  {
    slug: 'twitter',
    name: 'X / Twitter',
    source: 'twitter_x',
    authType: 'oauth',
    description: 'Tweet impressions, engagement, and follower stats',
    scopes: ['tweet.read', 'users.read'],
    syncIntervalMinutes: 360,
  },
  {
    slug: 'spotify',
    name: 'Spotify for Podcasters',
    source: 'spotify',
    authType: 'oauth',
    description: 'Episode stats, listener demographics, and follower data',
    syncIntervalMinutes: 720,
    extraFields: [
      {
        name: 'rss_feed_url',
        label: 'RSS Feed URL',
        placeholder: 'https://feeds.example.com/podcast',
        hint: 'Your podcast RSS feed URL',
      },
      {
        name: 'show_id',
        label: 'Spotify Show ID',
        placeholder: '4rOoJ6Egrf8K2IrywzwOMk',
        hint: 'Found in Spotify for Podcasters dashboard URL',
      },
    ],
  },
  {
    slug: 'gsc',
    name: 'Google Search Console',
    source: 'website',
    authType: 'oauth',
    description: 'Search queries, click-through rates, and rankings (16-month rolling)',
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    syncIntervalMinutes: 1440, // 24 hours
    extraFields: [
      {
        name: 'site_url',
        label: 'Site URL',
        placeholder: 'https://roadmancycling.com',
        hint: 'Must match the property in Search Console',
      },
    ],
  },
]

/**
 * Look up a platform config by slug.
 */
export function getPlatformConfig(slug: string): PlatformConfig | undefined {
  return PLATFORM_CONFIGS.find((p) => p.slug === slug)
}
