import Link from 'next/link'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'

export const metadata = {
  title: 'Assets — Roadman OS',
}

import { requireAuth } from '@/lib/utils/auth'
import { getFilteredAssets, getDropdownData } from '@/lib/queries/assets'
import { ASSET_TYPES, ASSET_STATUSES, CONTENT_PILLARS } from '@/lib/constants'
import {
  getStatusBadgeVariant,
  getTypeBadgeVariant,
  getPillarBadgeVariant,
} from '@/lib/utils/badge-variants'

import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { AssetFilters } from '@/components/assets/AssetFilters'
import { AssetPagination } from '@/components/assets/AssetPagination'
import { AssetTable } from '@/components/assets/AssetTable'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function labelFor(
  value: string | null | undefined,
  options: readonly { value: string; label: string }[],
): string {
  if (!value) return ''
  return options.find((o) => o.value === value)?.label ?? value
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const PER_PAGE = 20

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AssetsPage({ searchParams }: PageProps) {
  await requireAuth()

  const params = await searchParams

  // Parse search params
  const page = Math.max(1, Number(params.page) || 1)
  const search = typeof params.search === 'string' ? params.search : undefined
  const type = typeof params.type === 'string' ? params.type : undefined
  const status = typeof params.status === 'string' ? params.status : undefined
  const pillar = typeof params.pillar === 'string' ? params.pillar : undefined
  const campaignId =
    typeof params.campaign_id === 'string' ? params.campaign_id : undefined
  const assigneeId =
    typeof params.assignee_id === 'string' ? params.assignee_id : undefined
  const dateFrom =
    typeof params.date_from === 'string' ? params.date_from : undefined
  const dateTo =
    typeof params.date_to === 'string' ? params.date_to : undefined

  // Fetch data in parallel
  const [{ data: assets, count }, dropdowns] = await Promise.all([
    getFilteredAssets({
      search,
      type,
      status,
      pillar,
      campaign_id: campaignId,
      assignee_id: assigneeId,
      date_from: dateFrom,
      date_to: dateTo,
      page,
      perPage: PER_PAGE,
    }),
    getDropdownData(),
  ])

  const totalPages = Math.max(1, Math.ceil(count / PER_PAGE))

  // Map dropdown data to filter options
  const campaignOptions = dropdowns.campaigns.map((c) => ({
    id: c.id,
    label: c.title,
  }))
  const profileOptions = dropdowns.profiles.map((p) => ({
    id: p.id,
    label: p.display_name ?? p.id,
  }))

  // Prepare table rows
  const rows = assets.map((asset) => ({
    id: asset.id,
    title: asset.title,
    type: asset.type,
    typeLabel: labelFor(asset.type, ASSET_TYPES),
    status: asset.status,
    statusLabel: labelFor(asset.status, ASSET_STATUSES),
    pillar: asset.pillar,
    pillarLabel: asset.pillar
      ? labelFor(asset.pillar, CONTENT_PILLARS)
      : null,
    campaignTitle: asset.campaign?.title ?? null,
    assigneeName:
      asset.assignee?.display_name ?? asset.assignee?.full_name ?? null,
    updatedAt: asset.updated_at,
    updatedAtRelative: formatDistanceToNow(parseISO(asset.updated_at), {
      addSuffix: true,
    }),
    statusVariant: getStatusBadgeVariant(asset.status),
    typeVariant: getTypeBadgeVariant(asset.type),
    pillarVariant: asset.pillar
      ? getPillarBadgeVariant(asset.pillar)
      : ('default' as const),
  }))

  return (
    <div>
      <PageHeader
        title="Assets"
        actions={
          <Link href="/assets/new">
            <Button icon={<Plus className="h-4 w-4" />}>New Asset</Button>
          </Link>
        }
      />

      <Suspense fallback={null}>
        <AssetFilters
          campaigns={campaignOptions}
          profiles={profileOptions}
        />
      </Suspense>

      <div className="mt-6">
        <AssetTable rows={rows} />
      </div>

      <AssetPagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={count}
        perPage={PER_PAGE}
      />
    </div>
  )
}
