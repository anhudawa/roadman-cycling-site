'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'
import { DataTable, type ColumnDef } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'

// ---------------------------------------------------------------------------
// Row type (pre-computed server-side for cleanliness)
// ---------------------------------------------------------------------------
export type AssetRow = {
  id: string
  title: string
  type: string
  typeLabel: string
  status: string
  statusLabel: string
  pillar: string | null
  pillarLabel: string | null
  campaignTitle: string | null
  assigneeName: string | null
  updatedAt: string
  updatedAtRelative: string
  statusVariant: 'grey' | 'blue' | 'amber' | 'purple' | 'green' | 'coral' | 'default'
  typeVariant: 'coral' | 'red' | 'blue' | 'purple' | 'amber' | 'green' | 'grey' | 'default'
  pillarVariant: 'blue' | 'green' | 'amber' | 'purple' | 'coral' | 'default'
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
const columns: ColumnDef<AssetRow, unknown>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <Link
        href={`/assets/${row.original.id}`}
        className="text-off-white hover:text-coral transition-colors font-medium truncate max-w-[240px] block"
        onClick={(e) => e.stopPropagation()}
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'typeLabel',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant={row.original.typeVariant} size="sm">
        {row.original.typeLabel}
      </Badge>
    ),
  },
  {
    accessorKey: 'statusLabel',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.statusVariant} size="sm">
        {row.original.statusLabel}
      </Badge>
    ),
  },
  {
    accessorKey: 'pillarLabel',
    header: 'Pillar',
    cell: ({ row }) =>
      row.original.pillarLabel ? (
        <Badge variant={row.original.pillarVariant} size="sm">
          {row.original.pillarLabel}
        </Badge>
      ) : (
        <span className="text-mid-grey/50">—</span>
      ),
  },
  {
    accessorKey: 'campaignTitle',
    header: 'Campaign',
    cell: ({ row }) =>
      row.original.campaignTitle ? (
        <span className="text-sm text-off-white truncate max-w-[160px] block">
          {row.original.campaignTitle}
        </span>
      ) : (
        <span className="text-mid-grey/50">—</span>
      ),
  },
  {
    accessorKey: 'assigneeName',
    header: 'Assigned To',
    cell: ({ row }) =>
      row.original.assigneeName ? (
        <span className="text-sm text-off-white">
          {row.original.assigneeName}
        </span>
      ) : (
        <span className="text-mid-grey/50">—</span>
      ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) => (
      <span className="text-sm text-mid-grey whitespace-nowrap">
        {row.original.updatedAtRelative}
      </span>
    ),
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface AssetTableProps {
  rows: AssetRow[]
}

export function AssetTable({ rows }: AssetTableProps) {
  const router = useRouter()

  const handleRowClick = useCallback(
    (row: AssetRow) => {
      router.push(`/assets/${row.id}`)
    },
    [router],
  )

  return (
    <DataTable<AssetRow>
      columns={columns}
      data={rows}
      emptyMessage="No assets match your filters."
      onRowClick={handleRowClick}
    />
  )
}
