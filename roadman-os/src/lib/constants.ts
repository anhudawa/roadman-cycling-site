/**
 * Roadman OS — Shared constants, enum lookups, brand colours, and navigation.
 * All values mirror the Postgres enums in the database migration.
 */

// ---------------------------------------------------------------------------
// Helper type for labelled enum values
// ---------------------------------------------------------------------------
export type EnumOption<T extends string = string> = {
  value: T
  label: string
}

// ---------------------------------------------------------------------------
// Content Pillars
// ---------------------------------------------------------------------------
export const CONTENT_PILLARS: EnumOption[] = [
  { value: 'coaching', label: 'Coaching' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'strength_and_conditioning', label: 'Strength & Conditioning' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'le_metier', label: 'Le Metier' },
] as const

// ---------------------------------------------------------------------------
// Asset Types
// ---------------------------------------------------------------------------
export const ASSET_TYPES: EnumOption[] = [
  { value: 'podcast_episode', label: 'Podcast Episode' },
  { value: 'youtube_video', label: 'YouTube Video' },
  { value: 'blog_post', label: 'Blog Post' },
  { value: 'social_post', label: 'Social Post' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'course_module', label: 'Course Module' },
  { value: 'quote_card', label: 'Quote Card' },
  { value: 'infographic', label: 'Infographic' },
  { value: 'reel', label: 'Reel' },
  { value: 'short', label: 'Short' },
  { value: 'clip', label: 'Clip' },
  { value: 'story', label: 'Story' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'thread', label: 'Thread' },
  { value: 'pdf', label: 'PDF' },
  { value: 'live_stream', label: 'Live Stream' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'other', label: 'Other' },
] as const

// ---------------------------------------------------------------------------
// Asset Statuses
// ---------------------------------------------------------------------------
export const ASSET_STATUSES: EnumOption[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'brief_written', label: 'Brief Written' },
  { value: 'in_production', label: 'In Production' },
  { value: 'in_review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'repurposed', label: 'Repurposed' },
  { value: 'archived', label: 'Archived' },
] as const

// ---------------------------------------------------------------------------
// Campaign Types
// ---------------------------------------------------------------------------
export const CAMPAIGN_TYPES: EnumOption[] = [
  { value: 'weekly_focus', label: 'Weekly Focus' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'event_promotion', label: 'Event Promotion' },
  { value: 'sponsor_campaign', label: 'Sponsor Campaign' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'evergreen', label: 'Evergreen' },
  { value: 'ad_hoc', label: 'Ad Hoc' },
] as const

// ---------------------------------------------------------------------------
// Campaign Statuses
// ---------------------------------------------------------------------------
export const CAMPAIGN_STATUSES: EnumOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

// ---------------------------------------------------------------------------
// Publication Statuses
// ---------------------------------------------------------------------------
export const PUBLICATION_STATUSES: EnumOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'failed', label: 'Failed' },
  { value: 'removed', label: 'Removed' },
] as const

// ---------------------------------------------------------------------------
// Task Statuses
// ---------------------------------------------------------------------------
export const TASK_STATUSES: EnumOption[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
] as const

// ---------------------------------------------------------------------------
// Task Priorities
// ---------------------------------------------------------------------------
export const TASK_PRIORITIES: EnumOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const

// ---------------------------------------------------------------------------
// Idea Statuses
// ---------------------------------------------------------------------------
export const IDEA_STATUSES: EnumOption[] = [
  { value: 'captured', label: 'Captured' },
  { value: 'developing', label: 'Developing' },
  { value: 'ready', label: 'Ready' },
  { value: 'used', label: 'Used' },
  { value: 'discarded', label: 'Discarded' },
] as const

// ---------------------------------------------------------------------------
// User Roles
// ---------------------------------------------------------------------------
export const USER_ROLES: EnumOption[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'content_manager', label: 'Content Manager' },
  { value: 'creator', label: 'Creator' },
  { value: 'social_publisher', label: 'Social Publisher' },
  { value: 'coach', label: 'Coach' },
  { value: 'commercial', label: 'Commercial' },
] as const

// ---------------------------------------------------------------------------
// Activity Actions
// ---------------------------------------------------------------------------
export const ACTIVITY_ACTIONS: EnumOption[] = [
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'status_changed', label: 'Status Changed' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'commented', label: 'Commented' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'restored', label: 'Restored' },
  { value: 'file_uploaded', label: 'File Uploaded' },
  { value: 'file_deleted', label: 'File Deleted' },
  { value: 'highlight_added', label: 'Highlight Added' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const

// ---------------------------------------------------------------------------
// File Storage Types
// ---------------------------------------------------------------------------
export const FILE_STORAGE_TYPES: EnumOption[] = [
  { value: 'supabase', label: 'Supabase' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'google_drive', label: 'Google Drive' },
  { value: 'dropbox', label: 'Dropbox' },
  { value: 'external_url', label: 'External URL' },
] as const

// ---------------------------------------------------------------------------
// Metric Sources
// ---------------------------------------------------------------------------
export const METRIC_SOURCES: EnumOption[] = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'apple_podcasts', label: 'Apple Podcasts' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'twitter_x', label: 'X (Twitter)' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'website', label: 'Website' },
  { value: 'beehiiv', label: 'Beehiiv' },
  { value: 'ga4', label: 'Google Analytics 4' },
  { value: 'skool', label: 'Skool' },
  { value: 'manual', label: 'Manual' },
] as const

// ---------------------------------------------------------------------------
// Sponsor Statuses
// ---------------------------------------------------------------------------
export const SPONSOR_STATUSES: EnumOption[] = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'lost', label: 'Lost' },
] as const

// ---------------------------------------------------------------------------
// Product Types
// ---------------------------------------------------------------------------
export const PRODUCT_TYPES: EnumOption[] = [
  { value: 'community', label: 'Community' },
  { value: 'course', label: 'Course' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'event', label: 'Event' },
  { value: 'merchandise', label: 'Merchandise' },
  { value: 'digital_download', label: 'Digital Download' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'other', label: 'Other' },
] as const

// ---------------------------------------------------------------------------
// Brand Colours
// ---------------------------------------------------------------------------
export const BRAND_COLOURS = {
  charcoal: '#252526',
  deepPurple: '#210140',
  purple: '#4C1273',
  coral: '#F16363',
  offWhite: '#FAFAFA',
  midGrey: '#545559',
} as const

// ---------------------------------------------------------------------------
// Sidebar Navigation
// ---------------------------------------------------------------------------
export type NavItem = {
  label: string
  href: string
  icon: string // lucide-react icon name
  badge?: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Campaigns', href: '/campaigns', icon: 'Megaphone' },
  { label: 'Assets', href: '/assets', icon: 'FileVideo' },
  { label: 'Calendar', href: '/calendar', icon: 'Calendar' },
  { label: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
  { label: 'Ideas', href: '/ideas', icon: 'Lightbulb' },
  { label: 'Transcripts', href: '/transcripts', icon: 'FileText' },
  { label: 'Performance', href: '/performance', icon: 'BarChart3' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const
