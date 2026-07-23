import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { SyncStatusBadge } from '@/components/integrations/SyncStatusBadge'
import { getConnectionByPlatform, getRecentSyncJobs } from '@/lib/queries/integrations'

export const metadata = {
  title: 'X / Twitter — Roadman OS',
}

export default async function TwitterIntegrationPage() {
  const connection = await getConnectionByPlatform('twitter')
  const syncJobs = connection
    ? await getRecentSyncJobs(connection.id, 10)
    : []

  const isConnected = !!connection?.is_active
  const lastSyncedAt = connection?.last_synced_at ?? null

  return (
    <div>
      <PageHeader
        title="X / Twitter"
        description="Tweet impressions, engagement metrics, and follower statistics."
      />

      {/* Connection status */}
      <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-off-white">
              Connection Status
            </h2>
            {connection?.account_name && (
              <p className="text-sm text-mid-grey mt-1">
                @{connection.account_name}
              </p>
            )}
          </div>
          <Badge variant={isConnected ? 'green' : 'grey'} size="sm">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-mid-grey">Sync status</span>
              <SyncStatusBadge lastSyncedAt={lastSyncedAt} />
            </div>
            {lastSyncedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-mid-grey">Last synced</span>
                <span className="text-off-white">
                  {new Date(lastSyncedAt).toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-mid-grey">Sync interval</span>
              <span className="text-off-white">Every 6 hours</span>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-mid-grey mb-4">
              Connect your X / Twitter account to automatically sync tweet
              performance data, engagement metrics, and follower statistics.
            </p>
            <a
              href="/api/auth/twitter"
              className="inline-flex items-center justify-center rounded-lg bg-coral px-4 py-2 text-sm font-medium text-off-white hover:bg-coral/90 transition-colors"
            >
              Connect X / Twitter
            </a>
          </div>
        )}
      </section>

      {/* Sync settings */}
      {isConnected && (
        <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-8">
          <h2 className="text-lg font-medium text-off-white mb-4">
            Sync Settings
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-mid-grey">Platform</span>
              <span className="text-off-white">X / Twitter</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-mid-grey">Data source</span>
              <Badge variant="purple" size="sm">twitter_x</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-mid-grey">OAuth scopes</span>
              <span className="text-off-white">tweet.read, users.read</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-mid-grey">Data collected</span>
              <span className="text-off-white">
                Impressions, likes, retweets, replies, bookmarks
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Recent sync history */}
      {isConnected && syncJobs.length > 0 && (
        <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6">
          <h2 className="text-lg font-medium text-off-white mb-4">
            Recent Sync History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mid-grey/20">
                  <th className="text-left text-mid-grey font-medium py-2 pr-4">
                    Date
                  </th>
                  <th className="text-left text-mid-grey font-medium py-2 pr-4">
                    Status
                  </th>
                  <th className="text-right text-mid-grey font-medium py-2 pr-4">
                    Records
                  </th>
                  <th className="text-left text-mid-grey font-medium py-2">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody>
                {syncJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-mid-grey/10 last:border-0"
                  >
                    <td className="py-2 pr-4 text-off-white">
                      {new Date(job.created_at).toLocaleString('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-2 pr-4">
                      <Badge
                        variant={
                          job.status === 'completed'
                            ? 'green'
                            : job.status === 'failed'
                              ? 'red'
                              : job.status === 'running'
                                ? 'amber'
                                : 'grey'
                        }
                        size="sm"
                      >
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-right text-off-white">
                      {job.records_synced}
                    </td>
                    <td className="py-2 text-red-400 truncate max-w-[200px]">
                      {job.error_message ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Empty state when connected but no sync history */}
      {isConnected && syncJobs.length === 0 && (
        <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6">
          <h2 className="text-lg font-medium text-off-white mb-2">
            Recent Sync History
          </h2>
          <p className="text-sm text-mid-grey">
            No syncs have run yet. The first sync will be triggered
            automatically within 6 hours, or you can trigger one manually from
            the integrations overview.
          </p>
        </section>
      )}
    </div>
  )
}
