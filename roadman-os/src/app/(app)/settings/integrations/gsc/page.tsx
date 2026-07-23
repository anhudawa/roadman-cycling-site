import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/server'
import { getConnectionByPlatform, getConnectionStatus, getSyncFreshness, getRecentSyncJobs } from '@/lib/queries/integrations'
import type { SyncJob } from '@/types/database'

export const metadata = {
  title: 'Google Search Console — Roadman OS',
}

// ---------------------------------------------------------------------------
// Data coverage helpers
// ---------------------------------------------------------------------------

type MonthCoverage = {
  month: string // YYYY-MM
  label: string // e.g. "Jan 2025"
  hasData: boolean
  rowCount: number
}

/** Build a 16-month coverage map showing which months have data. */
async function getDataCoverage(): Promise<MonthCoverage[]> {
  const supabase = await createClient()
  const months: MonthCoverage[] = []
  const now = new Date()

  for (let i = 15; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = d.toISOString().slice(0, 7) // YYYY-MM
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })

    // Check if we have any rows for this month
    const startDate = `${monthStr}-01`
    const endD = new Date(d.getFullYear(), d.getMonth() + 1, 0) // last day of month
    const endDate = endD.toISOString().split('T')[0]

    const { count } = await supabase
      .from('search_console_daily')
      .select('id', { count: 'exact', head: true })
      .gte('date', startDate)
      .lte('date', endDate)

    months.push({
      month: monthStr,
      label,
      hasData: (count ?? 0) > 0,
      rowCount: count ?? 0,
    })
  }

  return months
}

/** Format a date string for display. */
function formatDateTime(isoString: string | null): string {
  if (!isoString) return 'Never'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Get a human-readable status badge for sync freshness. */
function freshnessBadge(freshness: ReturnType<typeof getSyncFreshness>) {
  switch (freshness) {
    case 'fresh':
      return <Badge variant="green" size="sm">Fresh</Badge>
    case 'stale':
      return <Badge variant="amber" size="sm">Stale</Badge>
    case 'critical':
      return <Badge variant="red" size="sm">Critical</Badge>
    case 'never':
      return <Badge variant="grey" size="sm">Never synced</Badge>
  }
}

/** Get a badge for sync job status. */
function syncJobStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge variant="green" size="sm">Completed</Badge>
    case 'running':
      return <Badge variant="blue" size="sm">Running</Badge>
    case 'failed':
      return <Badge variant="red" size="sm">Failed</Badge>
    case 'pending':
      return <Badge variant="grey" size="sm">Pending</Badge>
    default:
      return <Badge variant="grey" size="sm">{status}</Badge>
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function GSCIntegrationPage() {
  const connection = await getConnectionByPlatform('gsc')
  const connectionStatus = getConnectionStatus(connection)
  const syncFreshness = getSyncFreshness(connection?.last_synced_at ?? null)

  const [coverage, recentJobs] = await Promise.all([
    getDataCoverage(),
    connection ? getRecentSyncJobs(connection.id, 5) : ([] as SyncJob[]),
  ])

  const siteUrl = (connection?.metadata as Record<string, unknown>)?.site_url as string | undefined

  return (
    <div>
      <PageHeader
        title="Google Search Console"
        description="Search queries, click-through rates, and average positions with a 16-month rolling window."
      />

      {/* Connection status */}
      <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-off-white">Connection</h2>
          {connectionStatus === 'connected' ? (
            <Badge variant="green" size="sm">Connected</Badge>
          ) : connectionStatus === 'expired' ? (
            <Badge variant="amber" size="sm">Token Expired</Badge>
          ) : connectionStatus === 'error' ? (
            <Badge variant="red" size="sm">Error</Badge>
          ) : (
            <Badge variant="grey" size="sm">Not Connected</Badge>
          )}
        </div>

        {connection && siteUrl ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-mid-grey">Site URL:</span>
              <span className="text-sm text-off-white font-mono">{siteUrl}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-mid-grey">Last synced:</span>
              <span className="text-sm text-off-white">
                {formatDateTime(connection.last_synced_at)}
              </span>
              {freshnessBadge(syncFreshness)}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-mid-grey">
              Connect your Google Search Console account to sync search
              performance data automatically.
            </p>
            {/* TODO: Wire up OAuth flow when credentials are available */}
            <a
              href="/api/auth/gsc"
              className="inline-flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral/90"
            >
              Connect Google Search Console
            </a>
            <p className="text-xs text-mid-grey">
              Requires the <code className="text-purple font-mono">webmasters.readonly</code> scope.
              Your data stays private and is only used within Roadman OS.
            </p>
          </div>
        )}
      </section>

      {/* Sync settings — only show when connected */}
      {connection && (
        <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
          <h2 className="text-lg font-medium text-off-white mb-4">Sync Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Incremental sync */}
            <div className="rounded-lg border border-mid-grey/20 bg-charcoal/30 p-4">
              <h3 className="text-sm font-medium text-off-white mb-1">
                Incremental Sync
              </h3>
              <p className="text-xs text-mid-grey mb-3">
                Fetches the last 3 days of data. Runs automatically via daily cron
                at 05:00 UTC.
              </p>
              {/* TODO: Wire up form action to trigger POST /api/integrations/gsc */}
              <form action="/api/integrations/gsc" method="POST">
                <input type="hidden" name="connection_id" value={connection.id} />
                <input type="hidden" name="full_backfill" value="false" />
                <button
                  type="button"
                  className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-1.5 text-sm text-coral transition-colors hover:bg-coral/20"
                >
                  Sync Last 3 Days
                </button>
              </form>
            </div>

            {/* Full backfill */}
            <div className="rounded-lg border border-purple/20 bg-charcoal/30 p-4">
              <h3 className="text-sm font-medium text-off-white mb-1">
                Full 16-Month Backfill
              </h3>
              <p className="text-xs text-mid-grey mb-3">
                Downloads the entire 16-month rolling window. Takes several minutes
                depending on data volume.
              </p>
              {/* TODO: Wire up form action with client-side confirmation */}
              <button
                type="button"
                className="rounded-lg border border-purple/20 bg-purple/10 px-3 py-1.5 text-sm text-purple transition-colors hover:bg-purple/20"
              >
                Run Full Backfill
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Data coverage indicator */}
      {connection && (
        <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
          <h2 className="text-lg font-medium text-off-white mb-4">
            Data Coverage
            <span className="text-xs text-mid-grey font-normal ml-2">
              16-month rolling window
            </span>
          </h2>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {coverage.map((month) => (
              <div
                key={month.month}
                className={`rounded-lg border p-2 text-center transition-colors ${
                  month.hasData
                    ? 'border-coral/30 bg-coral/10'
                    : 'border-mid-grey/10 bg-charcoal/30'
                }`}
              >
                <p className={`text-xs font-medium ${
                  month.hasData ? 'text-coral' : 'text-mid-grey/50'
                }`}>
                  {month.label}
                </p>
                {month.hasData && (
                  <p className="text-[10px] text-mid-grey mt-0.5">
                    {month.rowCount.toLocaleString()} rows
                  </p>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-mid-grey mt-3">
            Highlighted months have synced data. Run a full backfill to populate
            missing months.
          </p>
        </section>
      )}

      {/* Recent sync jobs */}
      {connection && recentJobs.length > 0 && (
        <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6">
          <h2 className="text-lg font-medium text-off-white mb-4">
            Recent Sync Jobs
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mid-grey/20">
                  <th className="pb-2 text-left text-xs font-medium text-mid-grey">
                    Status
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-mid-grey">
                    Started
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-mid-grey">
                    Completed
                  </th>
                  <th className="pb-2 text-right text-xs font-medium text-mid-grey">
                    Records
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-mid-grey">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => (
                  <tr key={job.id} className="border-b border-mid-grey/10">
                    <td className="py-2">{syncJobStatusBadge(job.status)}</td>
                    <td className="py-2 text-off-white">
                      {formatDateTime(job.started_at)}
                    </td>
                    <td className="py-2 text-off-white">
                      {formatDateTime(job.completed_at)}
                    </td>
                    <td className="py-2 text-right text-off-white">
                      {job.records_synced.toLocaleString()}
                    </td>
                    <td className="py-2 text-red-400 text-xs max-w-[200px] truncate">
                      {job.error_message ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
