import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { format, isPast, parseISO } from 'date-fns'
import {
  Pencil,
  ChevronRight,
  Calendar,
  User,
  UserCheck,
  Clock,
  ExternalLink,
  Megaphone,
} from 'lucide-react'
import { getCurrentProfile } from '@/lib/utils/auth'
import {
  getAsset,
  getAssetTopicsWithNames,
  getAssetTagsWithNames,
  getDerivativeTree,
  getSourceChain,
  getAssetPublications,
  getAssetActivity,
  getAssetComments,
} from '@/lib/queries/assets'
import { getFilesByAsset } from '@/lib/queries/files'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  getStatusBadgeVariant,
  getTypeBadgeVariant,
  getPillarBadgeVariant,
} from '@/lib/utils/badge-variants'
import { ASSET_TYPES, ASSET_STATUSES, CONTENT_PILLARS } from '@/lib/constants'
import { AssetDetailTabs } from '@/components/assets/AssetDetailTabs'
import { ArchiveAssetButton } from '@/components/assets/ArchiveAssetButton'
import type { Asset, AssetType, AssetStatus, ContentPillar } from '@/types/database'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: { id: string } }) {
  const asset = await getAsset(params.id) as { title: string } | null
  return {
    title: asset ? `${asset.title} — Roadman OS` : 'Asset — Roadman OS',
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTypeLabel(type: string): string {
  return ASSET_TYPES.find((t) => t.value === type)?.label ?? type
}

function getStatusLabel(status: string): string {
  return ASSET_STATUSES.find((s) => s.value === status)?.label ?? status
}

function getPillarLabel(pillar: string): string {
  return CONTENT_PILLARS.find((p) => p.value === pillar)?.label ?? pillar
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`
  }
  return `${mins}m ${secs}s`
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface AssetDetailPageProps {
  params: { id: string }
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  // Fetch all data in parallel
  const [
    assetData,
    topicsWithNames,
    tagsWithNames,
    files,
    derivativeChildren,
    sourceChain,
    publications,
    activity,
    comments,
  ] = await Promise.all([
    getAsset(params.id),
    getAssetTopicsWithNames(params.id),
    getAssetTagsWithNames(params.id),
    getFilesByAsset(params.id),
    getDerivativeTree(params.id),
    getSourceChain(params.id),
    getAssetPublications(params.id),
    getAssetActivity(params.id),
    getAssetComments(params.id),
  ])

  if (!assetData) notFound()

  // Type-cast the enriched asset data
  const asset = assetData as Asset & {
    campaign?: { id: string; title: string } | null
    creator?: { id: string; display_name: string | null; full_name: string; avatar_url: string | null } | null
    assignee?: { id: string; display_name: string | null; full_name: string; avatar_url: string | null } | null
  }

  const metadata = (asset.metadata ?? {}) as Record<string, unknown>

  // Determine the root asset for the derivative tree
  const rootAsset = sourceChain.length > 0
    ? {
        id: sourceChain[0].id,
        title: sourceChain[0].title,
        type: sourceChain[0].type,
        status: sourceChain[0].status,
      }
    : {
        id: asset.id,
        title: asset.title,
        type: asset.type,
        status: asset.status,
      }

  // Due date formatting
  const dueDateOverdue = asset.due_date && isPast(parseISO(asset.due_date)) && asset.status !== 'published' && asset.status !== 'archived'

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-mid-grey mb-4">
        <Link href="/assets" className="hover:text-off-white transition-colours">
          Assets
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-off-white truncate max-w-[300px]">
          {asset.title}
        </span>
      </nav>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl uppercase text-off-white mb-3">
            {asset.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getTypeBadgeVariant(asset.type)} size="md">
              {getTypeLabel(asset.type)}
            </Badge>
            <Badge variant={getStatusBadgeVariant(asset.status)} size="md">
              {getStatusLabel(asset.status)}
            </Badge>
            {asset.pillar && (
              <Badge variant={getPillarBadgeVariant(asset.pillar)} size="md">
                {getPillarLabel(asset.pillar)}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/assets/${asset.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              icon={<Pencil className="w-4 h-4" />}
            >
              Edit
            </Button>
          </Link>
          <ArchiveAssetButton assetId={asset.id} />
        </div>
      </div>

      {/* Main content: two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left column — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {asset.description && (
            <div>
              <h2 className="text-sm font-medium text-mid-grey uppercase tracking-wider mb-2">
                Description
              </h2>
              <p className="text-sm text-off-white/80 leading-relaxed">
                {asset.description}
              </p>
            </div>
          )}

          {/* Body */}
          {asset.body && (
            <div>
              <h2 className="text-sm font-medium text-mid-grey uppercase tracking-wider mb-2">
                Body
              </h2>
              <div className="max-h-96 overflow-y-auto bg-charcoal border border-mid-grey/20 rounded-lg p-4">
                <div className="text-sm text-off-white/80 leading-relaxed whitespace-pre-wrap">
                  {asset.body}
                </div>
              </div>
            </div>
          )}

          {/* Type-specific metadata */}
          <TypeMetadata type={asset.type} metadata={metadata} />
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-5">
          <div className="bg-charcoal border border-mid-grey/20 rounded-lg p-5 space-y-4">
            {/* Campaign */}
            {asset.campaign && (
              <SidebarItem
                icon={<Megaphone className="w-4 h-4" />}
                label="Campaign"
              >
                <Link
                  href={`/campaigns/${asset.campaign.id}`}
                  className="text-sm text-coral hover:text-coral/80 transition-colours"
                >
                  {asset.campaign.title}
                </Link>
              </SidebarItem>
            )}

            {/* Assigned to */}
            {asset.assignee && (
              <SidebarItem
                icon={<UserCheck className="w-4 h-4" />}
                label="Assigned to"
              >
                <span className="text-sm text-off-white">
                  {asset.assignee.display_name || asset.assignee.full_name}
                </span>
              </SidebarItem>
            )}

            {/* Creator */}
            {asset.creator && (
              <SidebarItem
                icon={<User className="w-4 h-4" />}
                label="Creator"
              >
                <span className="text-sm text-off-white">
                  {asset.creator.display_name || asset.creator.full_name}
                </span>
              </SidebarItem>
            )}

            {/* Due date */}
            {asset.due_date && (
              <SidebarItem
                icon={<Calendar className="w-4 h-4" />}
                label="Due date"
              >
                <span
                  className={
                    dueDateOverdue ? 'text-sm text-red-400 font-medium' : 'text-sm text-off-white'
                  }
                >
                  {format(parseISO(asset.due_date), 'd MMM yyyy')}
                  {dueDateOverdue && ' (overdue)'}
                </span>
              </SidebarItem>
            )}

            {/* Created / Updated */}
            <SidebarItem
              icon={<Clock className="w-4 h-4" />}
              label="Created"
            >
              <span className="text-sm text-off-white">
                {format(parseISO(asset.created_at), 'd MMM yyyy')}
              </span>
            </SidebarItem>

            <SidebarItem
              icon={<Clock className="w-4 h-4" />}
              label="Updated"
            >
              <span className="text-sm text-off-white">
                {format(parseISO(asset.updated_at), 'd MMM yyyy')}
              </span>
            </SidebarItem>
          </div>

          {/* Topics */}
          {topicsWithNames.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-mid-grey uppercase tracking-wider mb-2">
                Topics
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {topicsWithNames.map((at) => (
                  <Badge
                    key={at.topic_id}
                    variant={at.topic?.pillar ? getPillarBadgeVariant(at.topic.pillar as ContentPillar) : 'purple'}
                    size="sm"
                  >
                    {at.topic?.name ?? at.topic_id}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tagsWithNames.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-mid-grey uppercase tracking-wider mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {tagsWithNames.map((at) => (
                  <Badge key={at.tag_id} variant="default" size="sm">
                    {at.tag?.colour && (
                      <span
                        className="w-2 h-2 rounded-full mr-1 inline-block"
                        style={{ backgroundColor: at.tag.colour }}
                      />
                    )}
                    {at.tag?.name ?? at.tag_id}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabbed sections */}
      <AssetDetailTabs
        assetId={asset.id}
        files={files}
        derivativeChildren={derivativeChildren}
        sourceChain={sourceChain}
        rootAsset={rootAsset}
        publications={publications}
        activity={activity}
        comments={comments}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar item sub-component
// ---------------------------------------------------------------------------

function SidebarItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-mid-grey mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-mid-grey mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Type-specific metadata sub-component
// ---------------------------------------------------------------------------

function TypeMetadata({
  type,
  metadata,
}: {
  type: AssetType
  metadata: Record<string, unknown>
}) {
  const hasAny = Object.values(metadata).some((v) => v !== null && v !== undefined && v !== '')
  if (!hasAny) return null

  if (type === 'podcast_episode') {
    return (
      <div>
        <h2 className="text-sm font-medium text-mid-grey uppercase tracking-wider mb-3">
          Podcast Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(metadata.season_number != null || metadata.episode_number != null) ? (
            <MetadataField
              label="Episode"
              value={`S${String(metadata.season_number ?? '?')}E${String(metadata.episode_number ?? '?')}`}
            />
          ) : null}
          {metadata.duration_seconds != null ? (
            <MetadataField
              label="Duration"
              value={formatDuration(metadata.duration_seconds as number)}
            />
          ) : null}
          {metadata.guest_name != null ? (
            <MetadataField
              label="Guest"
              value={`${String(metadata.guest_name)}${metadata.guest_credential ? ` — ${String(metadata.guest_credential)}` : ''}`}
            />
          ) : null}
          {metadata.recording_date != null ? (
            <MetadataField
              label="Recording date"
              value={format(parseISO(metadata.recording_date as string), 'd MMM yyyy')}
            />
          ) : null}
          {metadata.youtube_id != null ? (
            <MetadataField label="YouTube ID" value={String(metadata.youtube_id)} />
          ) : null}
          {metadata.spotify_url != null ? (
            <MetadataField label="Spotify">
              <a
                href={metadata.spotify_url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-coral hover:text-coral/80 inline-flex items-center gap-1 transition-colours"
              >
                Open on Spotify
                <ExternalLink className="w-3 h-3" />
              </a>
            </MetadataField>
          ) : null}
        </div>
      </div>
    )
  }

  if (type === 'blog_post') {
    return (
      <div>
        <h2 className="text-sm font-medium text-mid-grey uppercase tracking-wider mb-3">
          SEO & Blog Details
        </h2>
        <div className="space-y-3">
          {metadata.seo_title != null ? (
            <MetadataField label="SEO title" value={String(metadata.seo_title)} />
          ) : null}
          {metadata.seo_description != null ? (
            <MetadataField
              label="SEO description"
              value={String(metadata.seo_description)}
            />
          ) : null}
          {metadata.keywords != null ? (
            <MetadataField
              label="Keywords"
              value={
                Array.isArray(metadata.keywords)
                  ? (metadata.keywords as string[]).join(', ')
                  : String(metadata.keywords)
              }
            />
          ) : null}
          {metadata.answer_capsule != null ? (
            <MetadataField
              label="Answer capsule"
              value={String(metadata.answer_capsule)}
            />
          ) : null}
          {metadata.canonical_url != null ? (
            <MetadataField label="Canonical URL">
              <a
                href={String(metadata.canonical_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-coral hover:text-coral/80 inline-flex items-center gap-1 transition-colours"
              >
                {String(metadata.canonical_url)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </MetadataField>
          ) : null}
        </div>
      </div>
    )
  }

  // Generic fallback: show any metadata keys that have values
  const entries = Object.entries(metadata).filter(
    ([, v]) => v !== null && v !== undefined && v !== '',
  )
  if (entries.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-medium text-mid-grey uppercase tracking-wider mb-3">
        Metadata
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entries.map(([key, value]) => (
          <MetadataField
            key={key}
            label={key.replace(/_/g, ' ')}
            value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Metadata field sub-component
// ---------------------------------------------------------------------------

function MetadataField({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children?: React.ReactNode
}) {
  return (
    <div>
      <p className="text-xs text-mid-grey capitalize mb-0.5">{label}</p>
      {children ?? <p className="text-sm text-off-white">{value}</p>}
    </div>
  )
}
