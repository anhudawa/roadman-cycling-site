'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { EmptyState } from './EmptyState'

export { type ColumnDef } from '@tanstack/react-table'

export interface DataTableProps<T> {
  /** Column definitions from @tanstack/react-table */
  columns: ColumnDef<T, unknown>[]
  /** Row data */
  data: T[]
  /** Show skeleton loading rows */
  loading?: boolean
  /** Message shown when data is empty */
  emptyMessage?: string
  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void
}

/**
 * Data table wrapper around @tanstack/react-table with sorting,
 * loading skeletons, and empty state support.
 */
export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No results found.',
  onRowClick,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        {/* Header */}
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-deep-purple/30">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sorted = header.column.getIsSorted()

                return (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-3 text-left text-xs uppercase text-mid-grey font-medium tracking-wider',
                      canSort && 'cursor-pointer select-none hover:text-off-white transition-colors',
                    )}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {canSort && (
                        <span className="inline-flex flex-col">
                          <ChevronUp
                            className={cn(
                              'h-3 w-3 -mb-0.5',
                              sorted === 'asc'
                                ? 'text-coral'
                                : 'text-mid-grey/40',
                            )}
                          />
                          <ChevronDown
                            className={cn(
                              'h-3 w-3 -mt-0.5',
                              sorted === 'desc'
                                ? 'text-coral'
                                : 'text-mid-grey/40',
                            )}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>

        {/* Body */}
        <tbody>
          {loading
            ? /* Skeleton rows */
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr
                  key={`skeleton-${rowIdx}`}
                  className="border-b border-mid-grey/10"
                >
                  {columns.map((_, colIdx) => (
                    <td key={`skeleton-${rowIdx}-${colIdx}`} className="px-4 py-3">
                      <div className="animate-pulse bg-mid-grey/10 h-4 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            : table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-mid-grey/10 hover:bg-white/5 transition-colors',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-off-white"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>

      {/* Empty state */}
      {!loading && data.length === 0 && (
        <EmptyState title={emptyMessage} />
      )}
    </div>
  )
}
