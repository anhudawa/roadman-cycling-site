'use client'

import { useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AssetPaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  perPage: number
}

/**
 * Pagination controls for the asset library.
 * Updates the `page` URL search param on navigation.
 */
export function AssetPagination({
  currentPage,
  totalPages,
  totalCount,
  perPage,
}: AssetPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * perPage + 1
  const rangeEnd = Math.min(currentPage * perPage, totalCount)

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (page <= 1) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false })
      })
    },
    [router, searchParams, startTransition],
  )

  const buttonBase = cn(
    'inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg',
    'border border-mid-grey/30 transition-colors',
  )

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      <p className="text-sm text-mid-grey">
        {totalCount === 0
          ? 'No assets found'
          : `Showing ${rangeStart}–${rangeEnd} of ${totalCount} assets`}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
            className={cn(
              buttonBase,
              currentPage <= 1
                ? 'text-mid-grey/40 cursor-not-allowed'
                : 'text-off-white hover:bg-white/5',
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="text-sm text-mid-grey px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className={cn(
              buttonBase,
              currentPage >= totalPages
                ? 'text-mid-grey/40 cursor-not-allowed'
                : 'text-off-white hover:bg-white/5',
            )}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
