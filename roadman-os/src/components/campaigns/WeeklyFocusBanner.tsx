import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { Calendar, Target, Layers, Radio, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CONTENT_PILLARS } from '@/lib/constants'
import { getWeeklyFocusWithStats } from '@/lib/queries/dashboard'

/**
 * Weekly Focus Banner — the hero element of the dashboard.
 *
 * Self-contained server component: fetches its own data via
 * `getWeeklyFocusWithStats()` and renders either the active
 * weekly focus or an empty-state prompt.
 */
export async function WeeklyFocusBanner() {
  const focus = await getWeeklyFocusWithStats()

  if (!focus) {
    return <EmptyFocusBanner />
  }

  const meta = (focus.metadata ?? {}) as Record<string, unknown>
  const keyMessages = (meta.key_messages as string[]) ?? []
  const pillarValue = meta.pillar as string | undefined
  const pillarLabel = pillarValue
    ? CONTENT_PILLARS.find((p) => p.value === pillarValue)?.label ?? pillarValue
    : null

  const startLabel = focus.start_date
    ? format(parseISO(focus.start_date), 'd MMM')
    : null
  const endLabel = focus.end_date
    ? format(parseISO(focus.end_date), 'd MMM yyyy')
    : null
  const dateRange =
    startLabel && endLabel ? `${startLabel} — ${endLabel}` : null

  const ownerName = focus.owner?.full_name ?? null

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-deep-purple to-purple px-8 py-8">
      {/* Coral accent line along the top */}
      <div className="absolute inset-x-0 top-0 h-1 bg-coral" />

      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-heading text-3xl uppercase tracking-wide text-off-white lg:text-4xl">
              {focus.title}
            </h2>
            {pillarLabel && (
              <Badge variant="coral" size="md">
                {pillarLabel}
              </Badge>
            )}
          </div>

          {/* Date range and owner */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-off-white/70">
            {dateRange && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {dateRange}
              </span>
            )}
            {ownerName && (
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                {ownerName}
              </span>
            )}
          </div>

          {/* Description */}
          {focus.description && (
            <p className="max-w-2xl text-sm text-off-white/80">
              {focus.description}
            </p>
          )}
        </div>

        <Link href={`/campaigns/${focus.id}`} className="shrink-0">
          <Button variant="primary" size="md">
            View Campaign
          </Button>
        </Link>
      </div>

      {/* Key messages */}
      {keyMessages.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 font-heading text-xs uppercase tracking-wider text-off-white/60">
            Key Messages
          </h3>
          <ul className="space-y-1.5">
            {keyMessages.map((msg, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-off-white/90"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard
          label="Assets"
          value={focus.stats.assets}
          icon={<Layers className="h-4 w-4 text-off-white/50" />}
        />
        <StatCard
          label="Tasks Remaining"
          value={focus.stats.tasksRemaining}
          icon={<Target className="h-4 w-4 text-off-white/50" />}
        />
        <StatCard
          label="Publications"
          value={focus.stats.publications}
          icon={<Radio className="h-4 w-4 text-off-white/50" />}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat card (internal)
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3">
      {icon}
      <div>
        <p className="font-heading text-2xl text-coral">{value}</p>
        <p className="text-sm text-off-white/70">{label}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyFocusBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-deep-purple to-purple px-8 py-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-mid-grey/30" />
      <div className="flex flex-col items-center py-4 text-center">
        <div className="mb-4 rounded-full bg-white/10 p-3">
          <Calendar className="h-8 w-8 text-off-white/50" />
        </div>
        <h2 className="font-heading text-2xl uppercase tracking-wide text-off-white">
          No Weekly Focus Set
        </h2>
        <p className="mt-2 max-w-md text-sm text-off-white/60">
          Set this week&apos;s content focus to keep the team aligned.
        </p>
        <Link href="/campaigns/new?type=weekly_focus" className="mt-4">
          <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>
            Create Weekly Focus
          </Button>
        </Link>
      </div>
    </div>
  )
}
