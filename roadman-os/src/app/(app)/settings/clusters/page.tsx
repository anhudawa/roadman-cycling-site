import Link from 'next/link'
import { Plus, Layers } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils/cn'
import { CONTENT_PILLARS } from '@/lib/constants'
import { getClustersWithStats } from '@/lib/queries/clusters'
import type { ContentPillar } from '@/types/database'

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

// -------------------------------------------------------------------------
// Page
// -------------------------------------------------------------------------

export default async function ClustersPage({
  searchParams,
}: {
  searchParams: { pillar?: string }
}) {
  const activePillar = searchParams.pillar || undefined
  const clusters = await getClustersWithStats(
    activePillar ? { pillar: activePillar } : undefined,
  )

  return (
    <div>
      <PageHeader
        title="Content Clusters"
        description="Group related content for SEO topic authority."
        actions={
          <Link href="/settings/clusters/new">
            <Button icon={<Plus className="h-4 w-4" />}>New Cluster</Button>
          </Link>
        }
      />

      {/* Pillar filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <Link
          href="/settings/clusters"
          className={cn(
            'px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap',
            !activePillar
              ? 'bg-coral text-white'
              : 'text-mid-grey hover:text-off-white hover:bg-white/5',
          )}
        >
          All
        </Link>
        {CONTENT_PILLARS.map((p) => (
          <Link
            key={p.value}
            href={`/settings/clusters?pillar=${p.value}`}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap',
              activePillar === p.value
                ? 'bg-coral text-white'
                : 'text-mid-grey hover:text-off-white hover:bg-white/5',
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Cluster grid */}
      {clusters.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-12 h-12" />}
          title="No clusters yet"
          description="Create your first content cluster to start grouping related assets for SEO."
          action={
            <Link href="/settings/clusters/new">
              <Button icon={<Plus className="h-4 w-4" />}>
                Create Cluster
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clusters.map((cluster) => (
            <Link
              key={cluster.id}
              href={`/settings/clusters/${cluster.id}`}
              className="block"
            >
              <div className="bg-charcoal border border-mid-grey/20 rounded-xl p-5 hover:border-mid-grey/40 transition-colors h-full">
                {/* Name + badges */}
                <h3 className="text-base font-medium text-off-white mb-2 line-clamp-1">
                  {cluster.name}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {cluster.pillar && (
                    <Badge
                      variant={pillarVariant(cluster.pillar)}
                      size="sm"
                    >
                      {PILLAR_LABELS[cluster.pillar] || cluster.pillar}
                    </Badge>
                  )}
                  <Badge variant={statusVariant(cluster.status)} size="sm">
                    {STATUS_LABELS[cluster.status] || cluster.status}
                  </Badge>
                </div>

                {/* Coverage bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-mid-grey">Coverage</span>
                    <span className="text-xs text-off-white font-medium">
                      {cluster.coverage_covered}/{cluster.coverage_total}{' '}
                      formats &mdash; {cluster.coverage_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-mid-grey/20 rounded-full h-1.5">
                    <div
                      className="bg-coral h-1.5 rounded-full transition-all"
                      style={{
                        width: `${cluster.coverage_percentage}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Footer stats */}
                <div className="flex items-center justify-between text-xs text-mid-grey">
                  <span>
                    {cluster.asset_count}{' '}
                    {cluster.asset_count === 1 ? 'asset' : 'assets'}
                  </span>
                  {cluster.hub_asset_title && (
                    <span className="truncate ml-2 text-right max-w-[60%]">
                      Hub: {cluster.hub_asset_title}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
