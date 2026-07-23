import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { SyncStatusBadge } from '@/components/integrations/SyncStatusBadge'
import { getConnectionByPlatform, getConnectionStatus, getRecentSyncJobs } from '@/lib/queries/integrations'

export const metadata = {
  title: 'TikTok Integration — Roadman OS',
}

export default async function TikTokIntegrationPage() {
  const connection = await getConnectionByPlatform('tiktok')
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

  const accountName = connection?.account_name ?? null

  return (
    <div>
      <PageHeader
        title="TikTok"
        description="Video views, engagement, and follower growth from TikTok."
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
              Connect your TikTok account to automatically sync video
              analytics, engagement data, and follower growth.
            </p>
            {/* TODO: Wire up OAuth flow once TikTok API credentials are available */}
            <Link
              href="/api/auth/tiktok"
              className="inline-flex items-center rounded-lg bg-coral px-4 py-2 text-sm font-medium text-off-white hover:bg-coral/80 transition-colors"
            >
              Connect TikTok
            </Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="space-y-3">
            <p className="text-sm text-mid-grey">
              Your TikTok authorisation has expired. Re-authorise to resume
              syncing.
            </p>
            <Link
              href="/api/auth/tiktok"
              className="inline-flex items-center rounded-lg bg-coral px-4 py-2 text-sm font-medium text-off-white hover:bg-coral/80 transition-colors"
            >
              Re-authorise
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-off-white">
                There was an error with your TikTok connection. Try
                re-authorising below.
              </p>
            </div>
            <Link
              href="/api/auth/tiktok"
              className="inline-flex items-center rounded-lg bg-coral px-4 py-2 text-sm font-medium text-off-white hover:bg-coral/80 transition-colors"
            >
              Re-authorise
            </Link>
          </div>
        )}
      </section>

      {/* Sync settings — only shown when connected */}
      {status === 'connected' && connection && (
        <>
          <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
            <h2 className="text-lg font-medium text-off-white mb-4">
              Sync Settings
            </h2>

            <div className="space-y-4">
              {/* Auto-sync toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-off-white">
                    Auto-sync
                  </p>
                  <p className="text-xs text-mid-grey">
                    Automatically pull TikTok data on a schedule
                  </p>
                </div>
                {/* TODO: Replace with interactive toggle once client component is wired up */}
                <Badge variant="green" size="sm">
                  Enabled
                </Badge>
              </div>

              {/* Sync frequency */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-off-white">
                    Sync frequency
                  </p>
                  <p className="text-xs text-mid-grey">
                    How often data is pulled from TikTok
                  </p>
                </div>
                <span className="text-sm text-coral">Every 6 hours</span>
              </div>

              {/* Scopes */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-off-white">
                    OAuth scopes
                  </p>
                  <p className="text-xs text-mid-grey">
                    Permissions granted to Roadman OS
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Badge variant="default" size="sm">
                    user.info.basic
                  </Badge>
                  <Badge variant="default" size="sm">
                    video.list
                  </Badge>
                </div>
              </div>
            </div>
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
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-lg border border-mid-grey/10 bg-charcoal/30 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-off-white">
                        {job.started_at
                          ? new Date(job.started_at).toLocaleString('en-GB', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'Pending'}
                      </p>
                      {job.error_message && (
                        <p className="text-xs text-red-400 mt-0.5">
                          {job.error_message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-mid-grey">
                        {job.records_synced} record
                        {job.records_synced === 1 ? '' : 's'}
                      </span>
                      <Badge
                        variant={
                          job.status === 'completed'
                            ? 'green'
                            : job.status === 'running'
                              ? 'blue'
                              : job.status === 'failed'
                                ? 'red'
                                : 'grey'
                        }
                        size="sm"
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
