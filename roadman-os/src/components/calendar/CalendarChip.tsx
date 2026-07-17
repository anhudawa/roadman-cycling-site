'use client'

import { cn } from '@/lib/utils/cn'
import type { Publication, Asset, Platform, PublicationStatus } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PublicationWithDetails = Publication & {
  asset: Pick<Asset, 'id' | 'title' | 'type' | 'status'> | null
  platform: Pick<Platform, 'id' | 'name' | 'slug'> | null
}

// ---------------------------------------------------------------------------
// Platform colour mapping
// ---------------------------------------------------------------------------

const PLATFORM_COLOURS: Record<string, string> = {
  'youtube-main': '#FF0000',
  'youtube-clips': '#FF0000',
  'instagram': '#E4405F',
  'facebook': '#1877F2',
  'tiktok': '#000000',
  'twitter-x': '#1DA1F2',
  'linkedin': '#0A66C2',
  'beehiiv-newsletter': '#FF6719',
  'skool-community': '#2563EB',
  'website-blog': '#252526',
}

const DEFAULT_PLATFORM_COLOUR = '#545559'

function getPlatformColour(slug: string | undefined): string {
  if (!slug) return DEFAULT_PLATFORM_COLOUR
  return PLATFORM_COLOURS[slug] ?? DEFAULT_PLATFORM_COLOUR
}

// ---------------------------------------------------------------------------
// Status dot colours
// ---------------------------------------------------------------------------

const STATUS_DOT_COLOURS: Record<PublicationStatus, string> = {
  published: '#10B981',   // green
  scheduled: '#3B82F6',   // blue
  draft: '#6B7280',       // grey
  failed: '#EF4444',      // red
  removed: '#6B7280',     // grey
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + '…'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface CalendarChipProps {
  publication: PublicationWithDetails
  onClick?: (publication: PublicationWithDetails) => void
}

export function CalendarChip({ publication, onClick }: CalendarChipProps) {
  const platformSlug = publication.platform?.slug
  const platformColour = getPlatformColour(platformSlug)
  const statusColour = STATUS_DOT_COLOURS[publication.status] ?? '#6B7280'
  const assetTitle = publication.asset?.title ?? 'Untitled'
  const time = formatTime(publication.scheduled_at ?? publication.published_at)

  return (
    <button
      type="button"
      onClick={() => onClick?.(publication)}
      className={cn(
        'group flex items-center gap-1.5 w-full rounded-md px-2 py-1 text-left',
        'transition-all hover:brightness-110 hover:scale-[1.02]',
        'cursor-pointer border border-transparent hover:border-white/10',
      )}
      style={{
        backgroundColor: `${platformColour}20`,
      }}
      title={`${assetTitle} — ${publication.platform?.name ?? 'Unknown platform'}`}
    >
      {/* Platform colour dot */}
      <span
        className="shrink-0 h-2 w-2 rounded-full"
        style={{ backgroundColor: platformColour }}
      />

      {/* Title and time */}
      <span className="flex-1 min-w-0 flex items-center gap-1">
        <span className="truncate text-xs font-body text-off-white/90">
          {truncate(assetTitle, 24)}
        </span>
        {time && (
          <span className="shrink-0 text-[10px] text-mid-grey font-body">
            {time}
          </span>
        )}
      </span>

      {/* Status indicator dot */}
      <span
        className="shrink-0 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: statusColour }}
        title={publication.status}
      />
    </button>
  )
}
