import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { SyncStatusBadge } from '@/components/integrations/SyncStatusBadge'
import { ConnectionCard } from '@/components/integrations/ConnectionCard'
import { getConnectionByPlatform, getRecentSyncJobs } from '@/lib/queries/integrations'

export const metadata = {
  title: 'YouTube Clips Channel — Roadman OS',
}

/**
 * Settings page for the YouTube Clips (second channel) integration.
 *
 * Uses the same YouTube OAuth connection but targets a different channel ID
 * stored in metadata.clips_channel_id. Performance records are tagged with
 * `custom_metrics.channel_type = 'clips'`.
 *
 * TODO: Wire up real YouTube API credentials once available.
 */
export default async function YouTubeClipsSettingsPage() {
  const connection = await getConnectionByPlatform('youtube-clips')

  const connectionMetadata = connection?.metadata as Record<string, unknown> | null
  const clipsChannelId = (connectionMetadata?.clips_channel_id as string) ?? ''
  const accountName = connection?.account_name ?? ''

  // Load recent sync jobs if connected
  const recentSyncs = connection
    ? await getRecentSyncJobs(connection.id, 5)
    : []

  const lastSync = recentSyncs[0] ?? null

  return (
    <div>
      <PageHeader
        title="YouTube Clips Channel"
        description="Track analytics for your clips/highlights second channel."
      />

      {/* Connection status */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-off-white mb-4">
          Connection
        </h2>

        {connection ? (
          <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-5">
            <ConnectionCard
              platformName="YouTube Clips"
              platformSlug="youtube-clips"
              platformId={connection.platform_id}
              connection={connection}
              authType="oauth"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-3">
            <p className="text-sm text-off-white">
              No YouTube Clips connection found. Connect your YouTube account
              and configure the clips channel ID on the{' '}
              <a
                href="/settings/integrations"
                className="text-coral underline hover:text-coral/80"
              >
                integrations page
              </a>
              .
            </p>
          </div>
        )}
      </section>

      {/* Channel configuration */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-off-white mb-4">
          Channel Configuration
        </h2>

        <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-off-white mb-1">
                Clips Channel ID
              </label>
              <p className="text-sm text-mid-grey font-mono">
                {clipsChannelId || '(not configured)'}
              </p>
              <p className="text-xs text-mid-grey mt-1">
                The YouTube channel ID for your clips/highlights channel. Found in
                YouTube Studio under{' '}
                <span className="text-coral">Settings &rarr; Channel &rarr; Advanced settings</span>.
              </p>
            </div>

            {accountName && (
              <div>
                <label className="block text-sm font-medium text-off-white mb-1">
                  Account
                </label>
                <p className="text-sm text-mid-grey">{accountName}</p>
              </div>
            )}

            <div className="rounded-lg border border-deep-purple/30 bg-deep-purple/10 px-4 py-3">
              <p className="text-xs text-mid-grey">
                This integration uses the same YouTube OAuth connection as the main
                channel but fetches data for a different channel ID. All performance
                records are tagged with{' '}
                <code className="text-coral">channel_type: &apos;clips&apos;</code>{' '}
                so they can be distinguished in reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sync status and history */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-off-white mb-4">
          Sync Status
        </h2>

        {connection ? (
          <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-mid-grey">Last sync</span>
                <SyncStatusBadge lastSyncedAt={connection.last_synced_at} />
              </div>

              {lastSync && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-mid-grey">Status</span>
                    <Badge
                      variant={lastSync.status === 'completed' ? 'green' : lastSync.status === 'failed' ? 'red' : 'amber'}
                      size="sm"
                    >
                      {lastSync.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-mid-grey">Records synced</span>
                    <span className="text-sm text-off-white">
                      {lastSync.records_synced ?? 0}
                    </span>
                  </div>

                  {lastSync.metadata && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-mid-grey">Videos found</span>
                      <span className="text-sm text-off-white">
                        {(lastSync.metadata as Record<string, unknown>)?.videos_found ?? '—'}
                      </span>
                    </div>
                  )}

                  {lastSync.error_message && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                      <p className="text-xs text-red-400">{lastSync.error_message}</p>
                    </div>
                  )}
                </>
              )}

              {recentSyncs.length > 1 && (
                <div className="border-t border-mid-grey/10 pt-3 mt-3">
                  <h3 className="text-xs font-medium text-mid-grey uppercase mb-2">
                    Sync history
                  </h3>
                  <div className="space-y-1">
                    {recentSyncs.slice(1).map((sync) => (
                      <div
                        key={sync.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-mid-grey">
                          {sync.completed_at
                            ? new Date(sync.completed_at).toLocaleString()
                            : sync.started_at
                              ? new Date(sync.started_at).toLocaleString()
                              : '—'}
                        </span>
                        <Badge
                          variant={sync.status === 'completed' ? 'green' : sync.status === 'failed' ? 'red' : 'grey'}
                          size="sm"
                        >
                          {sync.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-mid-grey">
            Connect to YouTube to start syncing clips channel analytics.
          </p>
        )}
      </section>
    </div>
  )
}
