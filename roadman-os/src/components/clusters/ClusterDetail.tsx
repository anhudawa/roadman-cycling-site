'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Pencil, Archive, ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { ClusterForm } from './ClusterForm'
import {
  updateCluster,
  addAssetToCluster,
  removeAssetFromCluster,
  archiveCluster,
} from '@/lib/actions/clusters'
import type {
  ContentCluster,
  ContentPillar,
  AssetType,
  AssetStatus,
} from '@/types/database'

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

type ClusterAssetRow = {
  asset_id: string
  sort_order: number
  asset: {
    id: string
    title: string
    type: AssetType
    status: AssetStatus
    pillar: ContentPillar | null
  }
}

type CoverageScore = {
  covered: number
  total: number
  percentage: number
}

type ClusterWithHubAsset = ContentCluster & {
  hub_asset: { id: string; title: string } | null
}

type Props = {
  cluster: ClusterWithHubAsset
  clusterAssets: ClusterAssetRow[]
  allAssets: { id: string; title: string }[]
  coverageScore: CoverageScore
}

// -------------------------------------------------------------------------
// Label + colour helpers
// -------------------------------------------------------------------------

const PILLAR_LABELS: Record<string, string> = {
  coaching: 'Coaching',
  nutrition: 'Nutrition',
  strength_and_conditioning: 'S&C',
  recovery: 'Recovery',
  le_metier: 'Le Metier',
}

const STATUS_LABELS: Record<string, string> = {
  planned: 'Planned',
  building: 'Building',
  complete: 'Complete',
  needs_update: 'Needs Update',
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  podcast_episode: 'Podcast',
  youtube_video: 'YouTube',
  blog_post: 'Blog Post',
  social_post: 'Social',
  newsletter: 'Newsletter',
  infographic: 'Infographic',
  clip: 'Clip',
  reel: 'Reel',
  short: 'Short',
  story: 'Story',
  carousel: 'Carousel',
  thread: 'Thread',
  quote_card: 'Quote Card',
  course_module: 'Course',
  pdf: 'PDF',
  live_stream: 'Live Stream',
  webinar: 'Webinar',
  other: 'Other',
}

const ASSET_STATUS_LABELS: Record<string, string> = {
  idea: 'Idea',
  brief_written: 'Brief Written',
  in_production: 'In Production',
  in_review: 'In Review',
  approved: 'Approved',
  scheduled: 'Scheduled',
  published: 'Published',
  repurposed: 'Repurposed',
  archived: 'Archived',
}

type BadgeVariant =
  | 'default'
  | 'coral'
  | 'purple'
  | 'green'
  | 'amber'
  | 'red'
  | 'blue'
  | 'grey'

function pillarVariant(pillar: string | null): BadgeVariant {
  switch (pillar) {
    case 'coaching':
      return 'coral'
    case 'nutrition':
      return 'green'
    case 'strength_and_conditioning':
      return 'amber'
    case 'recovery':
      return 'blue'
    case 'le_metier':
      return 'purple'
    default:
      return 'grey'
  }
}

function statusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'planned':
      return 'grey'
    case 'building':
      return 'amber'
    case 'complete':
      return 'green'
    case 'needs_update':
      return 'red'
    default:
      return 'grey'
  }
}

function assetTypeVariant(type: string): BadgeVariant {
  switch (type) {
    case 'podcast_episode':
      return 'purple'
    case 'youtube_video':
      return 'red'
    case 'blog_post':
      return 'blue'
    case 'social_post':
      return 'coral'
    case 'newsletter':
      return 'green'
    default:
      return 'default'
  }
}

// -------------------------------------------------------------------------
// Component
// -------------------------------------------------------------------------

export function ClusterDetail({
  cluster,
  clusterAssets,
  allAssets,
  coverageScore,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [editOpen, setEditOpen] = useState(false)
  const [addAssetOpen, setAddAssetOpen] = useState(false)
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false)
  const [removeAssetId, setRemoveAssetId] = useState<string | null>(null)
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Assets not already in the cluster
  const existingAssetIds = new Set(clusterAssets.map((a) => a.asset_id))
  const availableAssets = allAssets.filter((a) => !existingAssetIds.has(a.id))

  // Role is derived: hub_asset_id = Pillar, everything else = Supporting
  const getRole = (assetId: string) =>
    assetId === cluster.hub_asset_id ? 'Pillar' : 'Supporting'

  const roleVariant = (assetId: string): BadgeVariant =>
    assetId === cluster.hub_asset_id ? 'coral' : 'default'

  // ------ Handlers ------

  const handleEditSubmit = async (
    formData: FormData,
  ): Promise<{ error?: string } | void> => {
    const result = await updateCluster(cluster.id, formData)
    if (result.success) {
      setEditOpen(false)
      router.refresh()
      return
    }
    return { error: result.error || 'Failed to update cluster' }
  }

  const handleAddAsset = () => {
    if (!selectedAssetId) return
    startTransition(async () => {
      const result = await addAssetToCluster(cluster.id, selectedAssetId)
      if (result.success) {
        setAddAssetOpen(false)
        setSelectedAssetId('')
        router.refresh()
      } else {
        setError(result.error || 'Failed to add asset')
      }
    })
  }

  const handleRemoveAsset = (assetId: string) => {
    startTransition(async () => {
      const result = await removeAssetFromCluster(cluster.id, assetId)
      if (result.success) {
        setRemoveAssetId(null)
        router.refresh()
      } else {
        setError(result.error || 'Failed to remove asset')
      }
    })
  }

  const handleArchive = () => {
    startTransition(async () => {
      const result = await archiveCluster(cluster.id)
      if (result.success) {
        router.push('/settings/clusters')
      } else {
        setError(result.error || 'Failed to archive cluster')
      }
    })
  }

  return (
    <div>
      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-300 hover:text-red-200 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Back link */}
      <Link
        href="/settings/clusters"
        className="inline-flex items-center gap-1.5 text-sm text-mid-grey hover:text-off-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to clusters
      </Link>

      {/* Page header with actions */}
      <PageHeader
        title={cluster.name}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Archive className="h-4 w-4" />}
              onClick={() => setConfirmArchiveOpen(true)}
            >
              Archive
            </Button>
          </>
        }
      />

      {/* Cluster metadata */}
      <div className="bg-charcoal border border-mid-grey/20 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cluster.pillar && (
            <div>
              <span className="text-xs uppercase text-mid-grey tracking-wider">
                Pillar
              </span>
              <div className="mt-1">
                <Badge variant={pillarVariant(cluster.pillar)}>
                  {PILLAR_LABELS[cluster.pillar] || cluster.pillar}
                </Badge>
              </div>
            </div>
          )}

          <div>
            <span className="text-xs uppercase text-mid-grey tracking-wider">
              Status
            </span>
            <div className="mt-1">
              <Badge variant={statusVariant(cluster.status)}>
                {STATUS_LABELS[cluster.status] || cluster.status}
              </Badge>
            </div>
          </div>

          {cluster.target_query && (
            <div>
              <span className="text-xs uppercase text-mid-grey tracking-wider">
                Target Search Query
              </span>
              <p className="mt-1 text-sm text-off-white">
                {cluster.target_query}
              </p>
            </div>
          )}

          {cluster.hub_asset && (
            <div>
              <span className="text-xs uppercase text-mid-grey tracking-wider">
                Pillar Page
              </span>
              <p className="mt-1 text-sm text-off-white">
                {cluster.hub_asset.title}
              </p>
            </div>
          )}

          {cluster.related_queries && cluster.related_queries.length > 0 && (
            <div className="md:col-span-2">
              <span className="text-xs uppercase text-mid-grey tracking-wider">
                Related Queries
              </span>
              <div className="mt-1 flex flex-wrap gap-2">
                {cluster.related_queries.map((q, i) => (
                  <Badge key={i} variant="default" size="sm">
                    {q}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {cluster.description && (
            <div className="md:col-span-2">
              <span className="text-xs uppercase text-mid-grey tracking-wider">
                Description
              </span>
              <p className="mt-1 text-sm text-off-white whitespace-pre-line">
                {cluster.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Coverage score */}
      <div className="bg-charcoal border border-mid-grey/20 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-medium text-off-white mb-3">
          Format Coverage
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-mid-grey/20 rounded-full h-2.5">
              <div
                className="bg-coral h-2.5 rounded-full transition-all"
                style={{ width: `${coverageScore.percentage}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-off-white font-medium whitespace-nowrap">
            {coverageScore.covered}/{coverageScore.total} formats &mdash;{' '}
            {coverageScore.percentage}%
          </span>
        </div>
      </div>

      {/* Member assets */}
      <div className="bg-charcoal border border-mid-grey/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-off-white">
            Cluster Assets ({clusterAssets.length})
          </h3>
          <Button
            size="sm"
            variant="outline"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setAddAssetOpen(true)}
          >
            Add Asset
          </Button>
        </div>

        {clusterAssets.length === 0 ? (
          <EmptyState
            title="No assets yet"
            description="Add content assets to build out this cluster."
            action={
              <Button
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setAddAssetOpen(true)}
              >
                Add Asset
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-mid-grey/20">
                  <th className="text-left text-xs uppercase text-mid-grey font-medium tracking-wider py-2 px-3">
                    Title
                  </th>
                  <th className="text-left text-xs uppercase text-mid-grey font-medium tracking-wider py-2 px-3">
                    Type
                  </th>
                  <th className="text-left text-xs uppercase text-mid-grey font-medium tracking-wider py-2 px-3">
                    Status
                  </th>
                  <th className="text-left text-xs uppercase text-mid-grey font-medium tracking-wider py-2 px-3">
                    Role
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {clusterAssets.map((row) => (
                  <tr
                    key={row.asset_id}
                    className="border-b border-mid-grey/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <span className="text-sm text-off-white">
                        {row.asset.title}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={assetTypeVariant(row.asset.type)}
                        size="sm"
                      >
                        {ASSET_TYPE_LABELS[row.asset.type] || row.asset.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="default" size="sm">
                        {ASSET_STATUS_LABELS[row.asset.status] ||
                          row.asset.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={roleVariant(row.asset_id)} size="sm">
                        {getRole(row.asset_id)}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setRemoveAssetId(row.asset_id)}
                        className="text-mid-grey hover:text-red-400 transition-colors p-1"
                        title="Remove from cluster"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- Modals ---- */}

      {/* Edit cluster */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Cluster"
        size="lg"
      >
        <ClusterForm
          mode="edit"
          cluster={cluster}
          assets={allAssets}
          onSubmit={handleEditSubmit}
        />
      </Modal>

      {/* Add asset */}
      <Modal
        open={addAssetOpen}
        onClose={() => {
          setAddAssetOpen(false)
          setSelectedAssetId('')
        }}
        title="Add Asset to Cluster"
        size="md"
      >
        <div className="space-y-4">
          {availableAssets.length === 0 ? (
            <p className="text-sm text-mid-grey">
              All assets are already in this cluster.
            </p>
          ) : (
            <>
              <Select
                label="Asset"
                placeholder="Select an asset..."
                options={availableAssets.map((a) => ({
                  value: a.id,
                  label: a.title,
                }))}
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAddAssetOpen(false)
                    setSelectedAssetId('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAsset}
                  disabled={!selectedAssetId}
                  loading={isPending}
                >
                  Add Asset
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Confirm remove asset */}
      <ConfirmDialog
        open={!!removeAssetId}
        onClose={() => setRemoveAssetId(null)}
        onConfirm={() => removeAssetId && handleRemoveAsset(removeAssetId)}
        title="Remove Asset"
        message="Are you sure you want to remove this asset from the cluster? The asset itself will not be deleted."
        confirmText="Remove"
        variant="danger"
        loading={isPending}
      />

      {/* Confirm archive */}
      <ConfirmDialog
        open={confirmArchiveOpen}
        onClose={() => setConfirmArchiveOpen(false)}
        onConfirm={handleArchive}
        title="Archive Cluster"
        message="Are you sure you want to archive this cluster? It can be restored later."
        confirmText="Archive"
        variant="warning"
        loading={isPending}
      />
    </div>
  )
}
