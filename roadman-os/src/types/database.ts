/**
 * Roadman OS — Database type definitions.
 * Mirrors the Postgres schema defined in supabase/migrations/00001_initial_schema.sql.
 * All 16 enum types, all 27 table Row types, plus Insert/Update helpers.
 */

// ==========================================================================
// Enum Types (16)
// ==========================================================================

export type UserRole =
  | 'admin'
  | 'leadership'
  | 'content_manager'
  | 'creator'
  | 'social_publisher'
  | 'coach'
  | 'commercial'

export type AssetType =
  | 'podcast_episode'
  | 'youtube_video'
  | 'blog_post'
  | 'social_post'
  | 'newsletter'
  | 'course_module'
  | 'quote_card'
  | 'infographic'
  | 'reel'
  | 'short'
  | 'clip'
  | 'story'
  | 'carousel'
  | 'thread'
  | 'pdf'
  | 'live_stream'
  | 'webinar'
  | 'other'

export type AssetStatus =
  | 'idea'
  | 'brief_written'
  | 'in_production'
  | 'in_review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'repurposed'
  | 'archived'

export type CampaignType =
  | 'weekly_focus'
  | 'product_launch'
  | 'event_promotion'
  | 'sponsor_campaign'
  | 'seasonal'
  | 'evergreen'
  | 'ad_hoc'

export type CampaignStatus =
  | 'draft'
  | 'planned'
  | 'active'
  | 'completed'
  | 'cancelled'

export type PublicationStatus =
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'removed'

export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'done'
  | 'blocked'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type ContentPillar =
  | 'coaching'
  | 'nutrition'
  | 'strength_and_conditioning'
  | 'recovery'
  | 'le_metier'

export type IdeaStatus =
  | 'captured'
  | 'developing'
  | 'ready'
  | 'used'
  | 'discarded'

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'assigned'
  | 'commented'
  | 'published'
  | 'archived'
  | 'restored'
  | 'file_uploaded'
  | 'file_deleted'
  | 'highlight_added'
  | 'scheduled'
  | 'approved'
  | 'rejected'

export type FileStorageType =
  | 'supabase'
  | 'youtube'
  | 'spotify'
  | 'google_drive'
  | 'dropbox'
  | 'external_url'

export type MetricSource =
  | 'youtube'
  | 'spotify'
  | 'apple_podcasts'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'twitter_x'
  | 'linkedin'
  | 'website'
  | 'beehiiv'
  | 'ga4'
  | 'skool'
  | 'manual'

export type SponsorStatus =
  | 'prospect'
  | 'contacted'
  | 'negotiating'
  | 'active'
  | 'paused'
  | 'completed'
  | 'lost'

export type ProductType =
  | 'community'
  | 'course'
  | 'coaching'
  | 'event'
  | 'merchandise'
  | 'digital_download'
  | 'sponsorship'
  | 'other'

export type TrendConfidence = 'noise' | 'emerging' | 'probable' | 'established'

export type InsightType =
  | 'seasonal_peak'
  | 'timing_recommendation'
  | 'format_effectiveness'
  | 'audience_affinity'
  | 'demand_gap'
  | 'decay_seasonal'
  | 'anomaly'
  | 'manual'

export type InsightStatus =
  | 'candidate'
  | 'validated'
  | 'dismissed'
  | 'archived'
  | 'actioned'

export type CalendarEventType =
  | 'race'
  | 'grand_tour'
  | 'classic'
  | 'sportive_season'
  | 'industry_launch'
  | 'resolution_period'
  | 'holiday'
  | 'weather_phase'
  | 'roadman_event'
  | 'other'

// ==========================================================================
// Row Types (44 tables)
// ==========================================================================

// 1. profiles
export type Profile = {
  id: string
  email: string
  full_name: string
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  last_seen_at: string | null
  notification_preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

// 2. permissions
export type Permission = {
  id: string
  profile_id: string
  resource: string
  can_create: boolean
  can_read: boolean
  can_update: boolean
  can_delete: boolean
  created_at: string
  updated_at: string
}

// 3. topics
export type Topic = {
  id: string
  name: string
  slug: string
  pillar: ContentPillar | null
  description: string | null
  parent_id: string | null
  sort_order: number
  is_trend_tracked: boolean
  centroid_embedding: number[] | null
  commercial_category: string | null
  created_at: string
  updated_at: string
}

// 4. tags
export type Tag = {
  id: string
  name: string
  slug: string
  colour: string | null
  created_at: string
}

// 5. platforms
export type Platform = {
  id: string
  name: string
  slug: string
  icon_url: string | null
  base_url: string | null
  supported_types: AssetType[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// 6. platform_reuse_policies
export type PlatformReusePolicy = {
  id: string
  platform_id: string
  asset_type: AssetType
  min_gap_days: number
  max_reuses: number | null
  require_edit: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// 7. products
export type Product = {
  id: string
  name: string
  slug: string
  type: ProductType
  description: string | null
  price_cents: number | null
  currency: string
  url: string | null
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// 8. sponsors
export type Sponsor = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  website_url: string | null
  contact_name: string | null
  contact_email: string | null
  status: SponsorStatus
  deal_value_cents: number | null
  currency: string
  contract_start: string | null
  contract_end: string | null
  deliverables: Record<string, unknown>[]
  notes: string | null
  created_at: string
  updated_at: string
}

// 9. campaigns
export type Campaign = {
  id: string
  title: string
  slug: string
  type: CampaignType
  status: CampaignStatus
  description: string | null
  goal: string | null
  start_date: string | null
  end_date: string | null
  owner_id: string | null
  sponsor_id: string | null
  product_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// 10. assets
export type Asset = {
  id: string
  title: string
  slug: string
  type: AssetType
  status: AssetStatus
  pillar: ContentPillar | null
  description: string | null
  body: string | null
  campaign_id: string | null
  parent_asset_id: string | null
  creator_id: string | null
  assignee_id: string | null
  publish_date: string | null
  due_date: string | null
  external_id: string | null
  external_url: string | null
  thumbnail_url: string | null
  duration_seconds: number | null
  word_count: number | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// 11. asset_topics (junction)
export type AssetTopic = {
  asset_id: string
  topic_id: string
}

// 12. asset_tags (junction)
export type AssetTag = {
  asset_id: string
  tag_id: string
}

// 13. files
export type File = {
  id: string
  asset_id: string
  uploaded_by: string | null
  storage_type: FileStorageType
  file_name: string
  file_path: string
  mime_type: string | null
  file_size_bytes: number | null
  is_primary: boolean
  metadata: Record<string, unknown>
  created_at: string
}

// 14. transcripts
export type Transcript = {
  id: string
  asset_id: string
  language: string
  full_text: string
  word_count: number | null
  confidence: number | null
  provider: string | null
  segments: Record<string, unknown>[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// 15. transcript_highlights
export type TranscriptHighlight = {
  id: string
  transcript_id: string
  created_by: string | null
  start_ms: number
  end_ms: number
  text: string
  label: string | null
  colour: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// 16. publications
export type Publication = {
  id: string
  asset_id: string
  platform_id: string
  status: PublicationStatus
  scheduled_at: string | null
  published_at: string | null
  external_id: string | null
  external_url: string | null
  platform_metadata: Record<string, unknown>
  error_message: string | null
  created_at: string
  updated_at: string
}

// 17. performance_records
export type PerformanceRecord = {
  id: string
  asset_id: string | null
  publication_id: string | null
  source: MetricSource
  recorded_at: string
  views: number
  impressions: number
  clicks: number
  likes: number
  comments: number
  shares: number
  saves: number
  subscribers_gained: number
  watch_time_seconds: number
  avg_view_duration_seconds: number
  ctr: number
  engagement_rate: number
  reach: number
  revenue_cents: number
  custom_metrics: Record<string, unknown>
  created_at: string
}

// 18. tasks
export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  asset_id: string | null
  campaign_id: string | null
  assignee_id: string | null
  created_by: string | null
  due_date: string | null
  completed_at: string | null
  sort_order: number
  labels: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// 19. content_briefs
export type ContentBrief = {
  id: string
  asset_id: string
  created_by: string | null
  objective: string | null
  target_audience: string | null
  key_messages: string[] | null
  tone: string | null
  references: Record<string, unknown>[]
  seo_keywords: string[] | null
  distribution_plan: Record<string, unknown>
  notes: string | null
  created_at: string
  updated_at: string
}

// 20. ideas
export type Idea = {
  id: string
  title: string
  description: string | null
  status: IdeaStatus
  pillar: ContentPillar | null
  suggested_type: AssetType | null
  source: string | null
  created_by: string | null
  asset_id: string | null
  score: number
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// 21. comments
export type Comment = {
  id: string
  author_id: string
  asset_id: string | null
  task_id: string | null
  idea_id: string | null
  parent_id: string | null
  body: string
  is_resolved: boolean
  created_at: string
  updated_at: string
}

// 22. activity_log
export type ActivityLog = {
  id: string
  actor_id: string | null
  action: ActivityAction
  entity_type: string
  entity_id: string
  changes: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
}

// 23. content_clusters
export type ContentCluster = {
  id: string
  name: string
  slug: string
  description: string | null
  pillar: ContentPillar | null
  hub_asset_id: string | null
  target_query: string | null
  related_queries: string[]
  status: string
  archived_at: string | null
  created_at: string
  updated_at: string
}

// 24. content_cluster_assets (junction)
export type ContentClusterAsset = {
  cluster_id: string
  asset_id: string
  sort_order: number
}

// 25. platform_connections
export type PlatformConnection = {
  id: string
  platform_id: string
  profile_id: string
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  account_id: string | null
  account_name: string | null
  scopes: string[] | null
  is_active: boolean
  last_synced_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// 26. sync_jobs
export type SyncJob = {
  id: string
  connection_id: string | null
  source: MetricSource
  status: string
  started_at: string | null
  completed_at: string | null
  records_synced: number
  error_message: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// 27. content_embeddings
export type ContentEmbedding = {
  id: string
  entity_type: string
  entity_id: string
  chunk_index: number
  chunk_text: string
  embedding: number[] | null
  model: string
  token_count: number | null
  metadata: Record<string, unknown>
  created_at: string
}

// 28. notifications
export type Notification = {
  id: string
  recipient_id: string
  type: string
  title: string
  body: string | null
  entity_type: string | null
  entity_id: string | null
  is_read: boolean
  metadata: Record<string, unknown>
  created_at: string
}

// ==========================================================================
// Intelligence Layer Row Types (17 tables — migration 00004)
// ==========================================================================

// 29. topic_aliases
export type TopicAlias = {
  id: string
  topic_id: string
  alias: string
  source: string
  created_at: string
}

// 30. performance_daily
export type PerformanceDaily = {
  id: string
  publication_id: string
  source: MetricSource
  date: string
  views: number
  impressions: number
  clicks: number
  likes: number
  comments: number
  shares: number
  saves: number
  watch_time_seconds: number
  subscribers_gained: number
  revenue_cents: number
  is_measured: boolean
  custom_metrics: Record<string, unknown>
  created_at: string
}

// 31. audience_demographics
export type AudienceDemographic = {
  id: string
  source: MetricSource
  scope: 'asset' | 'channel'
  asset_id: string | null
  period_start: string
  period_end: string
  age_bracket: string
  gender: string
  country: string | null
  share_pct: number
  absolute_value: number | null
  created_at: string
}

// 32. search_console_daily
export type SearchConsoleDaily = {
  id: string
  date: string
  page_url: string
  query: string
  asset_id: string | null
  topic_id: string | null
  clicks: number
  impressions: number
  position: number | null
  created_at: string
}

// 33. keyword_metrics
export type KeywordMetric = {
  id: string
  keyword: string
  topic_id: string | null
  month: string
  search_volume: number | null
  cpc_cents: number | null
  competition: number | null
  provider: string
  created_at: string
}

// 34. community_snapshots
export type CommunitySnapshot = {
  id: string
  community: 'free' | 'ndy'
  week_start: string
  total_members: number
  new_members: number
  churned_members: number
  active_members: number | null
  posts_count: number
  comments_count: number
  entered_by: string | null
  notes: string | null
  created_at: string
}

// 35. community_posts
export type CommunityPost = {
  id: string
  community: 'free' | 'ndy'
  posted_at: string
  title: string
  author_type: string
  topic_id: string | null
  comments_count: number
  likes_count: number
  created_at: string
}

// 36. revenue_events
export type RevenueEvent = {
  id: string
  occurred_at: string
  product_id: string | null
  amount_cents: number
  currency: string
  event_type: string
  attributed_asset_id: string | null
  attributed_topic_id: string | null
  attribution_method: string | null
  source_detail: Record<string, unknown>
  created_at: string
}

// 37. calendar_events
export type CalendarEvent = {
  id: string
  name: string
  event_type: CalendarEventType
  starts_on: string
  ends_on: string
  recurs_annually: boolean
  related_topic_ids: string[]
  notes: string | null
  created_at: string
}

// 38. topic_daily_metrics
export type TopicDailyMetric = {
  id: string
  topic_id: string
  source: MetricSource | null
  date: string
  live_asset_count: number
  views: number
  engagement: number
  search_clicks: number
  search_impressions: number
  email_opens: number
  email_clicks: number
  community_posts: number
  revenue_cents: number
  relative_interest: number | null
  created_at: string
}

// 39. seasonal_indices
export type SeasonalIndex = {
  id: string
  topic_id: string
  source: MetricSource | null
  metric: string
  iso_week: number
  index_value: number
  per_year_values: Record<string, number>
  years_observed: number
  sample_assets: number
  confidence_score: number
  confidence: TrendConfidence
  computed_at: string
}

// 40. anomalies (at least one of topic_id or asset_id is always set)
export type Anomaly = {
  id: string
  topic_id: string | null
  asset_id: string | null
  source: MetricSource | null
  detected_on: string
  metric: string
  expected_value: number
  actual_value: number
  z_score: number
  direction: 'above' | 'below'
  is_acknowledged: boolean
  promoted_insight_id: string | null  // FK to insights
  created_at: string
}

// 41. forecasts
export type Forecast = {
  id: string
  topic_id: string
  source: MetricSource | null
  metric: string
  target_week: string
  forecast_value: number
  lower_bound: number | null
  upper_bound: number | null
  actual_value: number | null
  abs_pct_error: number | null
  model: string
  computed_at: string
}

// 42. insights
export type Insight = {
  id: string
  type: InsightType
  status: InsightStatus
  statement: string
  topic_id: string | null
  commercial_category: string | null
  evidence: Record<string, unknown>
  confidence_score: number
  confidence: TrendConfidence
  valid_from: string | null
  valid_until: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  actioned_asset_id: string | null
  sponsor_safe: boolean
  created_at: string
  updated_at: string
}

// 43. audience_segments
export type AudienceSegment = {
  id: string
  name: string
  description: string | null
  discovery_method: string
  member_count: number
  topic_affinities: Record<string, number>
  seasonal_profile: Record<string, unknown>
  revenue_rate: number | null
  is_active: boolean
  computed_at: string
  created_at: string
}

// 44. segment_members
export type SegmentMember = {
  segment_id: string
  member_key: string
  member_source: string
  affinity: number
  computed_at: string
}

export type DataQualityStatus = 'pass' | 'warn' | 'fail'

// 45. data_quality_log
export type DataQualityLog = {
  id: string
  check_name: string
  status: DataQualityStatus
  details: Record<string, unknown>
  checked_at: string
}

// ==========================================================================
// Insert Types (auto-generated columns omitted)
// ==========================================================================

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>

export type PermissionInsert = Omit<Permission, 'id' | 'created_at' | 'updated_at'>
export type PermissionUpdate = Partial<Omit<Permission, 'id' | 'created_at'>>

export type TopicInsert = Omit<Topic, 'id' | 'created_at' | 'updated_at'>
export type TopicUpdate = Partial<Omit<Topic, 'id' | 'created_at'>>

export type TagInsert = Omit<Tag, 'id' | 'created_at'>
export type TagUpdate = Partial<Omit<Tag, 'id' | 'created_at'>>

export type PlatformInsert = Omit<Platform, 'id' | 'created_at' | 'updated_at'>
export type PlatformUpdate = Partial<Omit<Platform, 'id' | 'created_at'>>

export type PlatformReusePolicyInsert = Omit<PlatformReusePolicy, 'id' | 'created_at' | 'updated_at'>
export type PlatformReusePolicyUpdate = Partial<Omit<PlatformReusePolicy, 'id' | 'created_at'>>

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type ProductUpdate = Partial<Omit<Product, 'id' | 'created_at'>>

export type SponsorInsert = Omit<Sponsor, 'id' | 'created_at' | 'updated_at'>
export type SponsorUpdate = Partial<Omit<Sponsor, 'id' | 'created_at'>>

export type CampaignInsert = Omit<Campaign, 'id' | 'created_at' | 'updated_at'>
export type CampaignUpdate = Partial<Omit<Campaign, 'id' | 'created_at'>>

export type AssetInsert = Omit<Asset, 'id' | 'created_at' | 'updated_at'>
export type AssetUpdate = Partial<Omit<Asset, 'id' | 'created_at'>>

export type FileInsert = Omit<File, 'id' | 'created_at'>
export type FileUpdate = Partial<Omit<File, 'id' | 'created_at'>>

export type TranscriptInsert = Omit<Transcript, 'id' | 'created_at' | 'updated_at'>
export type TranscriptUpdate = Partial<Omit<Transcript, 'id' | 'created_at'>>

export type TranscriptHighlightInsert = Omit<TranscriptHighlight, 'id' | 'created_at' | 'updated_at'>
export type TranscriptHighlightUpdate = Partial<Omit<TranscriptHighlight, 'id' | 'created_at'>>

export type PublicationInsert = Omit<Publication, 'id' | 'created_at' | 'updated_at'>
export type PublicationUpdate = Partial<Omit<Publication, 'id' | 'created_at'>>

export type PerformanceRecordInsert = Omit<PerformanceRecord, 'id' | 'created_at'>

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>
export type TaskUpdate = Partial<Omit<Task, 'id' | 'created_at'>>

export type ContentBriefInsert = Omit<ContentBrief, 'id' | 'created_at' | 'updated_at'>
export type ContentBriefUpdate = Partial<Omit<ContentBrief, 'id' | 'created_at'>>

export type IdeaInsert = Omit<Idea, 'id' | 'created_at' | 'updated_at'>
export type IdeaUpdate = Partial<Omit<Idea, 'id' | 'created_at'>>

export type CommentInsert = Omit<Comment, 'id' | 'created_at' | 'updated_at'>
export type CommentUpdate = Partial<Omit<Comment, 'id' | 'created_at'>>

export type ActivityLogInsert = Omit<ActivityLog, 'id' | 'created_at'>

export type ContentClusterInsert = Omit<ContentCluster, 'id' | 'created_at' | 'updated_at'>
export type ContentClusterUpdate = Partial<Omit<ContentCluster, 'id' | 'created_at'>>

export type ContentClusterAssetInsert = ContentClusterAsset
export type ContentClusterAssetUpdate = Partial<Pick<ContentClusterAsset, 'sort_order'>>

export type PlatformConnectionInsert = Omit<PlatformConnection, 'id' | 'created_at' | 'updated_at'>
export type PlatformConnectionUpdate = Partial<Omit<PlatformConnection, 'id' | 'created_at'>>

export type SyncJobInsert = Omit<SyncJob, 'id' | 'created_at'>
export type SyncJobUpdate = Partial<Omit<SyncJob, 'id' | 'created_at'>>

export type ContentEmbeddingInsert = Omit<ContentEmbedding, 'id' | 'created_at'>

export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>
export type NotificationUpdate = Partial<Pick<Notification, 'is_read'>>

// Intelligence layer Insert/Update types
export type TopicAliasInsert = Omit<TopicAlias, 'id' | 'created_at'>
export type PerformanceDailyInsert = Omit<PerformanceDaily, 'id' | 'created_at'>
export type AudienceDemographicInsert = Omit<AudienceDemographic, 'id' | 'created_at'>
export type SearchConsoleDailyInsert = Omit<SearchConsoleDaily, 'id' | 'created_at'>
export type KeywordMetricInsert = Omit<KeywordMetric, 'id' | 'created_at'>
export type CommunitySnapshotInsert = Omit<CommunitySnapshot, 'id' | 'created_at'>
export type CommunityPostInsert = Omit<CommunityPost, 'id' | 'created_at'>
export type RevenueEventInsert = Omit<RevenueEvent, 'id' | 'created_at'>
export type CalendarEventInsert = Omit<CalendarEvent, 'id' | 'created_at'>
export type TopicDailyMetricInsert = Omit<TopicDailyMetric, 'id' | 'created_at'>
export type SeasonalIndexInsert = Omit<SeasonalIndex, 'id' | 'computed_at'>
export type AnomalyInsert = Omit<Anomaly, 'id' | 'created_at'>
export type AnomalyUpdate = Partial<Pick<Anomaly, 'is_acknowledged' | 'promoted_insight_id'>>
export type ForecastInsert = Omit<Forecast, 'id' | 'computed_at'>
export type ForecastUpdate = Partial<Pick<Forecast, 'actual_value' | 'abs_pct_error'>>
export type InsightInsert = Omit<Insight, 'id' | 'created_at' | 'updated_at'>
export type InsightUpdate = Partial<Omit<Insight, 'id' | 'created_at'>>
export type AudienceSegmentInsert = Omit<AudienceSegment, 'id' | 'created_at' | 'computed_at'>
export type AudienceSegmentUpdate = Partial<Omit<AudienceSegment, 'id' | 'created_at'>>
export type SegmentMemberInsert = Omit<SegmentMember, 'computed_at'>
export type DataQualityLogInsert = Omit<DataQualityLog, 'id' | 'checked_at'>

// ==========================================================================
// Database type for Supabase client
// ==========================================================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
        Relationships: []
      }
      permissions: {
        Row: Permission
        Insert: PermissionInsert
        Update: PermissionUpdate
        Relationships: []
      }
      topics: {
        Row: Topic
        Insert: TopicInsert
        Update: TopicUpdate
        Relationships: []
      }
      tags: {
        Row: Tag
        Insert: TagInsert
        Update: TagUpdate
        Relationships: []
      }
      platforms: {
        Row: Platform
        Insert: PlatformInsert
        Update: PlatformUpdate
        Relationships: []
      }
      platform_reuse_policies: {
        Row: PlatformReusePolicy
        Insert: PlatformReusePolicyInsert
        Update: PlatformReusePolicyUpdate
        Relationships: []
      }
      products: {
        Row: Product
        Insert: ProductInsert
        Update: ProductUpdate
        Relationships: []
      }
      sponsors: {
        Row: Sponsor
        Insert: SponsorInsert
        Update: SponsorUpdate
        Relationships: []
      }
      campaigns: {
        Row: Campaign
        Insert: CampaignInsert
        Update: CampaignUpdate
        Relationships: []
      }
      assets: {
        Row: Asset
        Insert: AssetInsert
        Update: AssetUpdate
        Relationships: []
      }
      asset_topics: {
        Row: AssetTopic
        Insert: AssetTopic
        Update: never
        Relationships: []
      }
      asset_tags: {
        Row: AssetTag
        Insert: AssetTag
        Update: never
        Relationships: []
      }
      files: {
        Row: File
        Insert: FileInsert
        Update: FileUpdate
        Relationships: []
      }
      transcripts: {
        Row: Transcript
        Insert: TranscriptInsert
        Update: TranscriptUpdate
        Relationships: []
      }
      transcript_highlights: {
        Row: TranscriptHighlight
        Insert: TranscriptHighlightInsert
        Update: TranscriptHighlightUpdate
        Relationships: []
      }
      publications: {
        Row: Publication
        Insert: PublicationInsert
        Update: PublicationUpdate
        Relationships: []
      }
      performance_records: {
        Row: PerformanceRecord
        Insert: PerformanceRecordInsert
        Update: never
        Relationships: []
      }
      tasks: {
        Row: Task
        Insert: TaskInsert
        Update: TaskUpdate
        Relationships: []
      }
      content_briefs: {
        Row: ContentBrief
        Insert: ContentBriefInsert
        Update: ContentBriefUpdate
        Relationships: []
      }
      ideas: {
        Row: Idea
        Insert: IdeaInsert
        Update: IdeaUpdate
        Relationships: []
      }
      comments: {
        Row: Comment
        Insert: CommentInsert
        Update: CommentUpdate
        Relationships: []
      }
      activity_log: {
        Row: ActivityLog
        Insert: ActivityLogInsert
        Update: never
        Relationships: []
      }
      content_clusters: {
        Row: ContentCluster
        Insert: ContentClusterInsert
        Update: ContentClusterUpdate
        Relationships: []
      }
      content_cluster_assets: {
        Row: ContentClusterAsset
        Insert: ContentClusterAssetInsert
        Update: ContentClusterAssetUpdate
        Relationships: []
      }
      platform_connections: {
        Row: PlatformConnection
        Insert: PlatformConnectionInsert
        Update: PlatformConnectionUpdate
        Relationships: []
      }
      sync_jobs: {
        Row: SyncJob
        Insert: SyncJobInsert
        Update: SyncJobUpdate
        Relationships: []
      }
      content_embeddings: {
        Row: ContentEmbedding
        Insert: ContentEmbeddingInsert
        Update: never
        Relationships: []
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
        Relationships: []
      }
      // Intelligence layer tables (migration 00004)
      topic_aliases: {
        Row: TopicAlias
        Insert: TopicAliasInsert
        Update: never
        Relationships: []
      }
      performance_daily: {
        Row: PerformanceDaily
        Insert: PerformanceDailyInsert
        Update: never
        Relationships: []
      }
      audience_demographics: {
        Row: AudienceDemographic
        Insert: AudienceDemographicInsert
        Update: never
        Relationships: []
      }
      search_console_daily: {
        Row: SearchConsoleDaily
        Insert: SearchConsoleDailyInsert
        Update: never
        Relationships: []
      }
      keyword_metrics: {
        Row: KeywordMetric
        Insert: KeywordMetricInsert
        Update: never
        Relationships: []
      }
      community_snapshots: {
        Row: CommunitySnapshot
        Insert: CommunitySnapshotInsert
        Update: never
        Relationships: []
      }
      community_posts: {
        Row: CommunityPost
        Insert: CommunityPostInsert
        Update: never
        Relationships: []
      }
      revenue_events: {
        Row: RevenueEvent
        Insert: RevenueEventInsert
        Update: never
        Relationships: []
      }
      calendar_events: {
        Row: CalendarEvent
        Insert: CalendarEventInsert
        Update: never
        Relationships: []
      }
      topic_daily_metrics: {
        Row: TopicDailyMetric
        Insert: TopicDailyMetricInsert
        Update: never
        Relationships: []
      }
      seasonal_indices: {
        Row: SeasonalIndex
        Insert: SeasonalIndexInsert
        Update: never
        Relationships: []
      }
      anomalies: {
        Row: Anomaly
        Insert: AnomalyInsert
        Update: AnomalyUpdate
        Relationships: []
      }
      forecasts: {
        Row: Forecast
        Insert: ForecastInsert
        Update: ForecastUpdate
        Relationships: []
      }
      insights: {
        Row: Insight
        Insert: InsightInsert
        Update: InsightUpdate
        Relationships: []
      }
      audience_segments: {
        Row: AudienceSegment
        Insert: AudienceSegmentInsert
        Update: AudienceSegmentUpdate
        Relationships: []
      }
      segment_members: {
        Row: SegmentMember
        Insert: SegmentMemberInsert
        Update: never
        Relationships: []
      }
      data_quality_log: {
        Row: DataQualityLog
        Insert: DataQualityLogInsert
        Update: never
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      asset_type: AssetType
      asset_status: AssetStatus
      campaign_type: CampaignType
      campaign_status: CampaignStatus
      publication_status: PublicationStatus
      task_status: TaskStatus
      task_priority: TaskPriority
      content_pillar: ContentPillar
      idea_status: IdeaStatus
      activity_action: ActivityAction
      file_storage_type: FileStorageType
      metric_source: MetricSource
      sponsor_status: SponsorStatus
      product_type: ProductType
      trend_confidence: TrendConfidence
      insight_type: InsightType
      insight_status: InsightStatus
      calendar_event_type: CalendarEventType
    }
  }
}
