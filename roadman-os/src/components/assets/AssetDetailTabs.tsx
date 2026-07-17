'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import {
  FolderOpen,
  GitBranch,
  Globe,
  MessageSquare,
  Activity,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { FileList } from '@/components/files/FileList'
import { FileUploader } from '@/components/files/FileUploader'
import { ExternalFileForm } from '@/components/files/ExternalFileForm'
import { DerivativeTree } from '@/components/assets/DerivativeTree'
import { AssetComments } from '@/components/assets/AssetComments'
import { AssetActivity } from '@/components/assets/AssetActivity'
import { getStatusBadgeVariant } from '@/lib/utils/badge-variants'
import { PUBLICATION_STATUSES } from '@/lib/constants'
import type { Asset, File, Publication, ActivityLog, Comment, PublicationStatus } from '@/types/database'
import type { DerivativeNode } from '@/lib/queries/assets'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActivityEntry = ActivityLog & {
  actor?: { id: string; display_name: string | null; full_name: string; avatar_url: string | null }
}

type CommentEntry = Comment & {
  author?: { id: string; display_name: string | null; full_name: string; avatar_url: string | null }
}

type PublicationEntry = Publication & {
  platform?: { id: string; name: string; slug: string }
}

interface AssetDetailTabsProps {
  assetId: string
  files: File[]
  derivativeChildren: DerivativeNode[]
  sourceChain: Asset[]
  rootAsset: { id: string; title: string; type: string; status: string }
  publications: PublicationEntry[]
  activity: ActivityEntry[]
  comments: CommentEntry[]
}

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

type TabKey = 'files' | 'derivatives' | 'publications' | 'comments' | 'activity'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'files', label: 'Files', icon: FolderOpen },
  { key: 'derivatives', label: 'Derivatives', icon: GitBranch },
  { key: 'publications', label: 'Publications', icon: Globe },
  { key: 'comments', label: 'Comments', icon: MessageSquare },
  { key: 'activity', label: 'Activity', icon: Activity },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPublicationStatusLabel(status: string): string {
  return PUBLICATION_STATUSES.find((s) => s.value === status)?.label ?? status
}

function getPublicationStatusVariant(status: PublicationStatus): 'grey' | 'blue' | 'green' | 'red' | 'default' {
  const map: Record<PublicationStatus, 'grey' | 'blue' | 'green' | 'red'> = {
    draft: 'grey',
    scheduled: 'blue',
    published: 'green',
    failed: 'red',
    removed: 'grey',
  }
  return map[status] || 'grey'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AssetDetailTabs({
  assetId,
  files,
  derivativeChildren,
  sourceChain,
  rootAsset,
  publications,
  activity,
  comments,
}: AssetDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('files')
  const [uploaderOpen, setUploaderOpen] = useState(false)
  const [externalFormOpen, setExternalFormOpen] = useState(false)

  const handleFileMutate = useCallback(() => {
    // Revalidation is handled server-side by the actions
    // A full page refresh picks up the new data
    window.location.reload()
  }, [])

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-mid-grey/20 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          let count: number | undefined

          if (tab.key === 'files') count = files.length
          if (tab.key === 'derivatives') count = derivativeChildren.length
          if (tab.key === 'publications') count = publications.length
          if (tab.key === 'comments') count = comments.length
          if (tab.key === 'activity') count = activity.length

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colours whitespace-nowrap',
                isActive
                  ? 'border-coral text-coral'
                  : 'border-transparent text-mid-grey hover:text-off-white',
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    isActive ? 'bg-coral/20 text-coral' : 'bg-mid-grey/20 text-mid-grey',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div>
        {/* Files tab */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <FileList
              assetId={assetId}
              files={files}
              canEdit={true}
              onMutate={handleFileMutate}
            />

            {/* Collapsible upload section */}
            <div>
              <button
                type="button"
                onClick={() => setUploaderOpen(!uploaderOpen)}
                className="flex items-center gap-2 text-sm text-mid-grey hover:text-off-white transition-colours"
              >
                {uploaderOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                Upload files
              </button>
              {uploaderOpen && (
                <div className="mt-3">
                  <FileUploader
                    assetId={assetId}
                    onUploadComplete={handleFileMutate}
                  />
                </div>
              )}
            </div>

            {/* Collapsible external file section */}
            <div>
              <button
                type="button"
                onClick={() => setExternalFormOpen(!externalFormOpen)}
                className="flex items-center gap-2 text-sm text-mid-grey hover:text-off-white transition-colours"
              >
                {externalFormOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                Add external file reference
              </button>
              {externalFormOpen && (
                <div className="mt-3">
                  <ExternalFileForm
                    assetId={assetId}
                    onSuccess={handleFileMutate}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Derivatives tab */}
        {activeTab === 'derivatives' && (
          <div className="space-y-6">
            {/* Source chain breadcrumb */}
            {sourceChain.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-mid-grey uppercase tracking-wider mb-2">
                  Source chain
                </h3>
                <div className="flex flex-wrap items-center gap-1 text-sm">
                  {sourceChain.map((ancestor, i) => (
                    <span key={ancestor.id} className="flex items-center gap-1">
                      <Link
                        href={`/assets/${ancestor.id}`}
                        className="text-coral hover:text-coral/80 transition-colours"
                      >
                        {ancestor.title}
                      </Link>
                      {i < sourceChain.length - 1 && (
                        <span className="text-mid-grey">&rarr;</span>
                      )}
                    </span>
                  ))}
                  <span className="text-mid-grey">&rarr;</span>
                  <span className="text-off-white font-medium">Current</span>
                </div>
              </div>
            )}

            <DerivativeTree
              assets={derivativeChildren}
              currentAssetId={assetId}
              rootAsset={rootAsset}
            />
          </div>
        )}

        {/* Publications tab */}
        {activeTab === 'publications' && (
          <div>
            {publications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-mid-grey/20 text-left">
                      <th className="py-3 px-4 text-xs font-medium text-mid-grey uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="py-3 px-4 text-xs font-medium text-mid-grey uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-4 text-xs font-medium text-mid-grey uppercase tracking-wider">
                        Scheduled
                      </th>
                      <th className="py-3 px-4 text-xs font-medium text-mid-grey uppercase tracking-wider">
                        Published
                      </th>
                      <th className="py-3 px-4 text-xs font-medium text-mid-grey uppercase tracking-wider">
                        Link
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {publications.map((pub) => (
                      <tr
                        key={pub.id}
                        className="border-b border-mid-grey/10 hover:bg-white/5 transition-colours"
                      >
                        <td className="py-3 px-4 text-off-white">
                          {pub.platform?.name ?? 'Unknown'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={getPublicationStatusVariant(pub.status)}
                            size="sm"
                          >
                            {getPublicationStatusLabel(pub.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-off-white/80">
                          {pub.scheduled_at
                            ? format(parseISO(pub.scheduled_at), 'd MMM yyyy HH:mm')
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-off-white/80">
                          {pub.published_at
                            ? format(parseISO(pub.published_at), 'd MMM yyyy HH:mm')
                            : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {pub.external_url ? (
                            <a
                              href={pub.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-coral hover:text-coral/80 inline-flex items-center gap-1 transition-colours"
                            >
                              View
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-mid-grey">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={<Globe className="w-10 h-10" />}
                title="No publications yet"
                description="This asset has not been published to any platforms."
              />
            )}
          </div>
        )}

        {/* Comments tab */}
        {activeTab === 'comments' && (
          <AssetComments assetId={assetId} comments={comments} />
        )}

        {/* Activity tab */}
        {activeTab === 'activity' && <AssetActivity entries={activity} />}
      </div>
    </div>
  )
}
