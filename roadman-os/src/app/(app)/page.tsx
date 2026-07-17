import Link from 'next/link'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { Calendar, ChevronRight, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { WeeklyFocusBanner } from '@/components/campaigns/WeeklyFocusBanner'
import { getUpcomingWeeklyFocuses, getRecentActivity } from '@/lib/queries/dashboard'
import { formatActivityEntry } from '@/lib/utils/format-activity'
import { CONTENT_PILLARS, CAMPAIGN_STATUSES } from '@/lib/constants'

export const metadata = {
  title: 'Dashboard — Roadman OS',
}

/** Map campaign status values to Badge colour variants. */
const statusVariant: Record<string, 'green' | 'blue' | 'amber' | 'grey' | 'red'> = {
  draft: 'grey',
  planned: 'blue',
  active: 'green',
  completed: 'amber',
  cancelled: 'red',
}

/** Map entity types to their URL prefix. */
const entityRoutes: Record<string, string> = {
  campaign: '/campaigns',
  asset: '/assets',
  task: '/tasks',
  idea: '/ideas',
}

export default async function DashboardPage() {
  const [upcoming, activity] = await Promise.all([
    getUpcomingWeeklyFocuses(4),
    getRecentActivity(10),
  ])

  return (
    <div className="space-y-8">
      {/* 1. Weekly Focus Banner */}
      <WeeklyFocusBanner />

      {/* 2. Upcoming Weeks */}
      <section>
        <h2 className="mb-4 font-heading text-xl uppercase tracking-wide text-off-white">
          Coming Up
        </h2>

        {upcoming.length === 0 ? (
          <p className="text-sm text-mid-grey">
            No upcoming weekly focuses scheduled.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((campaign) => {
              const meta = (campaign.metadata ?? {}) as Record<string, unknown>
              const pillarValue = meta.pillar as string | undefined
              const pillarLabel = pillarValue
                ? CONTENT_PILLARS.find((p) => p.value === pillarValue)?.label ??
                  pillarValue
                : null
              const statusLabel =
                CAMPAIGN_STATUSES.find((s) => s.value === campaign.status)
                  ?.label ?? campaign.status

              const startLabel = campaign.start_date
                ? format(parseISO(campaign.start_date), 'd MMM')
                : null
              const endLabel = campaign.end_date
                ? format(parseISO(campaign.end_date), 'd MMM')
                : null
              const dateRange =
                startLabel && endLabel
                  ? `${startLabel} — ${endLabel}`
                  : null

              return (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="group rounded-xl border border-mid-grey/20 bg-charcoal p-5 transition hover:border-coral/30"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-heading text-base uppercase tracking-wide text-off-white group-hover:text-coral transition-colors">
                      {campaign.title}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-mid-grey/50 group-hover:text-coral transition-colors" />
                  </div>

                  {dateRange && (
                    <p className="mb-3 flex items-center gap-1.5 text-xs text-mid-grey">
                      <Calendar className="h-3.5 w-3.5" />
                      {dateRange}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={statusVariant[campaign.status] ?? 'default'}
                      size="sm"
                    >
                      {statusLabel}
                    </Badge>
                    {pillarLabel && (
                      <Badge variant="coral" size="sm">
                        {pillarLabel}
                      </Badge>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* 3. Recent Activity */}
      <section>
        <h2 className="mb-4 font-heading text-xl uppercase tracking-wide text-off-white">
          Recent Activity
        </h2>

        {activity.length === 0 ? (
          <p className="text-sm text-mid-grey">No recent activity to show.</p>
        ) : (
          <div className="space-y-1">
            {activity.map((entry) => {
              const description = formatActivityEntry(entry)
              const route = entityRoutes[entry.entity_type]
              const timestamp = formatDistanceToNow(parseISO(entry.created_at), {
                addSuffix: true,
              })

              return (
                <div
                  key={entry.id}
                  className="flex items-start justify-between gap-4 rounded-lg px-3 py-2.5 transition hover:bg-white/5"
                >
                  <div className="flex items-start gap-3 text-sm">
                    <Activity className="mt-0.5 h-4 w-4 shrink-0 text-mid-grey/50" />
                    <p className="text-off-white/90">
                      {route ? (
                        <Link
                          href={`${route}/${entry.entity_id}`}
                          className="hover:text-coral transition-colors"
                        >
                          {description}
                        </Link>
                      ) : (
                        description
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-mid-grey">
                    {timestamp}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
