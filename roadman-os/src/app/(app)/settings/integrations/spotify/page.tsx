import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { SyncStatusBadge } from '@/components/integrations/SyncStatusBadge'
import {
  getConnectionByPlatform,
  getConnectionStatus,
  getRecentSyncJobs,
} from '@/lib/queries/integrations'

export const metadata = {
  title: 'Spotify for Podcasters — Roadman OS',
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

export default async function SpotifyIntegrationPage() {
  const connection = await getConnectionByPlatform('spotify')
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
  const rssFeedUrl = meta.rss_feed_url as string | undefined
  const showId = meta.show_id as string | undefined
  const totalEpisodes = meta.total_episodes as number | undefined
  const totalDownloads = meta.total_downloads as number | undefined
  const avgDownloadsPerEpisode = meta.avg_downloads_per_episode as number | undefined
  const accountName = connection?.account_name ?? null

  return (
    <div>
      <PageHeader
        title="Spotify for Podcasters"
        description="Podcast episode analytics, listener demographics, and download trends from Spotify."
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

        {status === 'disconnected' && (
          <div className="space-y-3">
            <p className="text-sm text-mid-grey">
              Connect your Spotify for Podcasters account to automatically sync
              episode analytics, listener data, and download stats.
            </p>
            <Link
              href="/api/auth/spotify"
              className="inline-flex items-center rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral/90"
            >
              Connect Spotify
            </Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="space-y-3">
            <p className="text-sm text-mid-grey">
              Your Spotify authorisation has expired. Re-authorise to resume
              syncing.
            </p>
            <Link
              href="/api/auth/spotify"
              className="inline-flex items-center rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral/90"
            >
              Re-authorise
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-off-white">
                There was an error with your Spotify connection. Try
                re-authorising below.
              </p>
            </div>
            <Link
              href="/api/auth/spotify"
              className="inline-flex items-center rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral/90"
            >
              Re-authorise
            </Link>
          </div>
        )}
      </section>

      {/* Show details — only shown when connected */}
      {status === 'connected' && connection && (
        <>
          {/* RSS feed + show ID */}
          <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
            <h2 className="text-lg font-medium text-off-white mb-4">
              Show Details
            </h2>

            <div className="space-y-3">
              {showId && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid-grey">Show ID:</span>
                  <span className="text-sm text-off-white font-mono">
                    {showId}
                  </span>
                </div>
              )}

              {rssFeedUrl && (
                <div className="flex items-start gap-2">
                  <span className="text-sm text-mid-grey shrink-0">
                    RSS Feed:
                  </span>
                  <span className="text-sm text-off-white font-mono break-all">
                    {rssFeedUrl}
                  </span>
                </div>
              )}

              {!showId && !rssFeedUrl && (
                <p className="text-sm text-mid-grey">
                  Show details will appear here after the first sync.
                </p>
              )}
            </div>
          </section>

          {/* Episode stats summary */}
          <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
            <h2 className="text-lg font-medium text-off-white mb-4">
              Episode Stats
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4 text-centre">
                <p className="text-xs text-mid-grey mb-1">Total Episodes</p>
                <p className="text-2xl font-semibold text-off-white">
                  {totalEpisodes?.toLocaleString() ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4 text-centre">
                <p className="text-xs text-mid-grey mb-1">Total Downloads</p>
                <p className="text-2xl font-semibold text-off-white">
                  {totalDownloads?.toLocaleString() ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4 text-centre">
                <p className="text-xs text-mid-grey mb-1">Avg per Episode</p>
                <p className="text-2xl font-semibold text-off-white">
                  {avgDownloadsPerEpisode?.toLocaleString() ?? '—'}
                </p>
              </div>
            </div>

            <p className="text-xs text-mid-grey mt-3">
              Stats are updated each time data is synced from Spotify.
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
