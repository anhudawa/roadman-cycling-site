/**
 * Maps YouTube Analytics API responses to PerformanceRecordInsert rows.
 *
 * Field mapping:
 *   views                       → views
 *   estimatedMinutesWatched * 60 → watch_time_seconds
 *   cardClickRate               → ctr (already a decimal 0-1)
 *   estimatedRevenue * 100      → revenue_cents
 *   subscribersGained           → subscribers_gained (via custom_metrics)
 *   likes                       → likes
 *   comments                    → comments
 *   shares                      → shares
 *   impressions                 → impressions
 *   impressionClickThroughRate  → engagement_rate (best available proxy)
 *   averageViewDuration         → avg_view_duration_seconds
 */

import type { PerformanceRecordInsert } from '@/types/database'
import type { YouTubeAnalyticsRow } from '@/lib/integrations/youtube'

/**
 * Convert a single YouTube Analytics row into a PerformanceRecordInsert.
 *
 * @param analytics - Parsed analytics row from `parseAnalyticsRows()`
 * @param assetId - Roadman OS asset UUID the video is linked to
 * @param publicationId - Optional publication UUID (if the video has one)
 * @param recordedAt - ISO date string for when this snapshot was taken
 */
export function mapYouTubeAnalyticsToPerformance(
  analytics: YouTubeAnalyticsRow,
  assetId: string,
  publicationId: string | null,
  recordedAt?: string,
): PerformanceRecordInsert {
  return {
    asset_id: assetId,
    publication_id: publicationId,
    source: 'youtube' as const,
    recorded_at: recordedAt ?? new Date().toISOString(),
    views: analytics.views ?? 0,
    impressions: analytics.impressions ?? 0,
    clicks: 0, // YouTube does not expose a direct "clicks" metric
    likes: analytics.likes ?? 0,
    comments: analytics.comments ?? 0,
    shares: analytics.shares ?? 0,
    saves: 0, // Not available in YouTube Analytics
    subscribers_gained: analytics.subscribersGained ?? 0,
    watch_time_seconds: Math.round((analytics.estimatedMinutesWatched ?? 0) * 60),
    avg_view_duration_seconds: analytics.averageViewDuration ?? 0,
    ctr: analytics.cardClickRate ?? 0,
    engagement_rate: analytics.impressionClickThroughRate ?? 0,
    reach: analytics.impressions ?? 0, // Impressions as reach proxy
    revenue_cents: Math.round((analytics.estimatedRevenue ?? 0) * 100),
    custom_metrics: {
      subscribers_gained: analytics.subscribersGained ?? 0,
      subscribers_lost: analytics.subscribersLost ?? 0,
      net_subscribers: (analytics.subscribersGained ?? 0) - (analytics.subscribersLost ?? 0),
      estimated_minutes_watched: analytics.estimatedMinutesWatched ?? 0,
      impression_click_through_rate: analytics.impressionClickThroughRate ?? 0,
      card_click_rate: analytics.cardClickRate ?? 0,
    },
  }
}

/**
 * Build a default (zero-valued) PerformanceRecordInsert for videos where
 * the Analytics API returned no data (e.g. brand-new videos).
 */
export function emptyPerformanceRecord(
  assetId: string,
  publicationId: string | null,
  recordedAt?: string,
): PerformanceRecordInsert {
  return {
    asset_id: assetId,
    publication_id: publicationId,
    source: 'youtube' as const,
    recorded_at: recordedAt ?? new Date().toISOString(),
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
  }
}
