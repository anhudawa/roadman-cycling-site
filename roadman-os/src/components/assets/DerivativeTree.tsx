'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getStatusBadgeVariant, getTypeBadgeVariant } from '@/lib/utils/badge-variants'
import { ASSET_TYPES, ASSET_STATUSES } from '@/lib/constants'
import type { AssetStatus, AssetType } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TreeNode = {
  id: string
  title: string
  type: string
  status: string
  parent_asset_id: string | null
  children?: TreeNode[]
}

interface DerivativeTreeProps {
  assets: TreeNode[]
  currentAssetId: string
  /** The root/source asset shown at the top of the tree */
  rootAsset?: { id: string; title: string; type: string; status: string }
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

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// ---------------------------------------------------------------------------
// Tree node component
// ---------------------------------------------------------------------------

function TreeNodeItem({
  node,
  currentAssetId,
  depth = 0,
}: {
  node: TreeNode
  currentAssetId: string
  depth?: number
}) {
  const hasChildren = node.children && node.children.length > 0
  const [expanded, setExpanded] = useState(true)
  const isCurrent = node.id === currentAssetId

  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpanded((prev) => !prev)
  }, [])

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-lg group transition-colours',
          isCurrent
            ? 'border border-coral bg-coral/5'
            : 'hover:bg-white/5',
        )}
        style={{ marginLeft: depth * 24 }}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            type="button"
            onClick={toggleExpand}
            className="shrink-0 p-0.5 text-mid-grey hover:text-off-white transition-colours"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        {/* Tree connector line */}
        {depth > 0 && (
          <div className="w-3 border-l-2 border-b-2 border-mid-grey/30 h-3 shrink-0 -ml-1 rounded-bl-sm" />
        )}

        {/* Node content */}
        <Link
          href={`/assets/${node.id}`}
          className={cn(
            'flex-1 min-w-0 flex items-center gap-2',
            isCurrent ? 'text-off-white' : 'text-off-white/80 hover:text-off-white',
          )}
        >
          <span className="text-sm truncate font-medium">
            {truncate(node.title, 40)}
          </span>
          <Badge variant={getTypeBadgeVariant(node.type as AssetType)} size="sm">
            {getTypeLabel(node.type)}
          </Badge>
          <Badge variant={getStatusBadgeVariant(node.status as AssetStatus)} size="sm">
            {getStatusLabel(node.status)}
          </Badge>
        </Link>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="border-l-2 border-mid-grey/20" style={{ marginLeft: depth * 24 + 12 }}>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              currentAssetId={currentAssetId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DerivativeTree({
  assets,
  currentAssetId,
  rootAsset,
}: DerivativeTreeProps) {
  const rootNode: TreeNode | null = rootAsset
    ? {
        id: rootAsset.id,
        title: rootAsset.title,
        type: rootAsset.type,
        status: rootAsset.status,
        parent_asset_id: null,
        children: assets,
      }
    : null

  const sourceId = rootAsset?.id ?? currentAssetId

  return (
    <div className="space-y-3">
      {rootNode ? (
        <TreeNodeItem node={rootNode} currentAssetId={currentAssetId} />
      ) : (
        assets.map((node) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            currentAssetId={currentAssetId}
          />
        ))
      )}

      {assets.length === 0 && !rootAsset && (
        <p className="text-sm text-mid-grey py-4 text-center">
          No derivatives yet.
        </p>
      )}

      <div className="pt-2">
        <Link href={`/assets/new?parent_asset_id=${sourceId}`}>
          <Button
            variant="outline"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Add derivative
          </Button>
        </Link>
      </div>
    </div>
  )
}
