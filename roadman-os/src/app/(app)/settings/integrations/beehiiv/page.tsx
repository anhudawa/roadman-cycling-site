import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { SyncStatusBadge } from '@/components/integrations/SyncStatusBadge'
import { ApiKeyForm } from '@/components/integrations/ApiKeyForm'
import {
  getConnectionByPlatform,
  getConnectionStatus,
  getRecentSyncJobs,
} from '@/lib/queries/integrations'

export const metadata = {
  title: 'Beehiiv — Roadman OS',
}

/** Format a date string for display in en-GB style. */
function formatDateTime(isoString: string | null): string {
  if (!isoString) return 'Never'
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Get a badge variant + label from a sync job status string. */
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

export default async function BeehiivIntegrationPage() {
  const connection = await getConnectionByPlatform('beehiiv')
  const status = getConnectionStatus(connection)
  const recentJobs = connection
    ? await getRecentSyncJobs(connection.id, 10)
    : []

  const lastSynced = connection?.last_synced_at
    ? new Date(connection.last_synced_at).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null

  const meta = (connection?.metadata ?? {}) as Record<string, unknown>
  const publicationId = meta.publication_id as string | undefined
  const totalSubscribers = meta.total_subscribers as number | undefined
  const activeSubscribers = meta.active_subscribers as number | undefined
  const avgOpenRate = meta.avg_open_rate as number | undefined
  const avgClickRate = meta.avg_click_rate as number | undefined
  const accountName = connection?.account_name ?? null

  return (
    <div>
      <PageHeader
        title="Beehiiv"
        description="Newsletter subscriber growth, open rates, and engagement analytics from Beehiiv."
      />

      {/* Connection status */}
      <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-off-white">
              Connection Status
            </h2>
            {accountName && (
              <p className="text-sm text-mid-grey mt-1">
                Connected as {accountName}
              </p>
            )}
          </div>
          <Badge
            variant={
              status === 'connected'
                ? 'green'
                : status === 'expired'
                  ? 'amber'
                  : status === 'error'
                    ? 'red'
                    : 'grey'
            }
            size="sm"
          >
            {status === 'connected'
              ? 'Connected'
              : status === 'expired'
                ? 'Expired'
                : status === 'error'
                  ? 'Error'
                  : 'Disconnected'}
          </Badge>
        </div>

        {status === 'error' && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 mb-4">
            <p className="text-sm text-off-white">
              There was an error with your Beehiiv connection. Check your API
              key below and re-save.
            </p>
          </div>
        )}
      </section>

      {/* API key form — shown when disconnected or for updating */}
      <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
        <h2 className="text-lg font-medium text-off-white mb-2">
          {status === 'connected' ? 'Update API Key' : 'Connect with API Key'}
        </h2>
        <p className="text-sm text-mid-grey mb-4">
          Beehiiv uses API key authentication. You can find your API key in
          the{' '}
          <span className="text-coral">
            Beehiiv dashboard &rarr; Settings &rarr; Integrations
          </span>
          .
        </p>

        <ApiKeyForm
          platformSlug="beehiiv"
          platformName="Beehiiv"
          extraFields={[
            {
              name: 'publication_id',
              label: 'Publication ID',
              placeholder: 'pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
              hint: 'Found in your Beehiiv publication settings.',
            },
          ]}
        />
      </section>

      {/* Publication details — only shown when connected */}
      {status === 'connected' && connection && (
        <>
          {/* Publication info */}
          <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
            <h2 className="text-lg font-medium text-off-white mb-4">
              Publication Details
            </h2>

            <div className="space-y-3">
              {publicationId && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid-grey">Publication ID:</span>
                  <span className="text-sm text-off-white font-mono">
                    {publicationId}
                  </span>
                </div>
              )}

              {!publicationId && (
                <p className="text-sm text-mid-grey">
                  Publication details will appear here after the first sync.
                </p>
              )}
            </div>
          </section>

          {/* Newsletter stats summary */}
          <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
            <h2 className="text-lg font-medium text-off-white mb-4">
              Newsletter Stats
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4">
                <p className="text-xs text-mid-grey mb-1">Total Subscribers</p>
                <p className="text-2xl font-semibold text-off-white">
                  {totalSubscribers?.toLocaleString() ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4">
                <p className="text-xs text-mid-grey mb-1">Active Subscribers</p>
                <p className="text-2xl font-semibold text-off-white">
                  {activeSubscribers?.toLocaleString() ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4">
                <p className="text-xs text-mid-grey mb-1">Avg Open Rate</p>
                <p className="text-2xl font-semibold text-off-white">
                  {avgOpenRate !== undefined
                    ? `${(avgOpenRate * 100).toFixed(1)}%`
                    : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4">
                <p className="text-xs text-mid-grey mb-1">Avg Click Rate</p>
                <p className="text-2xl font-semibold text-off-white">
                  {avgClickRate !== undefined
                    ? `${(avgClickRate * 100).toFixed(1)}%`
                    : '—'}
                </p>
              </div>
            </div>

            <p className="text-xs text-mid-grey mt-3">
              Stats are updated each time data is synced from Beehiiv.
            </p>
          </section>

          {/* Last sync info */}
          <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-off-white">
                Last Sync
              </h2>
              <SyncStatusBadge lastSyncedAt={connection.last_synced_at} />
            </div>

            {lastSynced ? (
              <p className="text-sm text-mid-grey">{lastSynced}</p>
            ) : (
              <p className="text-sm text-mid-grey">
                No sync has been run yet for this connection.
              </p>
            )}
          </section>

          {/* Recent sync history */}
          <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6">
            <h2 className="text-lg font-medium text-off-white mb-4">
              Sync History
            </h2>

            {recentJobs.length === 0 ? (
              <p className="text-sm text-mid-grey">
                No sync jobs recorded yet.
              </p>
            ) : (
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
                        <td className="py-2">
                          {syncJobStatusBadge(job.status)}
                        </td>
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
            )}
          </section>
        </>
      )}
    </div>
  )
}
