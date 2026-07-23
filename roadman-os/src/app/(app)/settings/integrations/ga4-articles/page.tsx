import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { SyncStatusBadge } from '@/components/integrations/SyncStatusBadge'
import { ConnectionCard } from '@/components/integrations/ConnectionCard'
import { getConnectionByPlatform, getRecentSyncJobs } from '@/lib/queries/integrations'
import { countMatchedArticles } from '@/lib/integrations/ga4-articles'

export const metadata = {
  title: 'GA4 Article-Level Analytics — Roadman OS',
}

/**
 * Settings page for the article-level GA4 integration.
 *
 * Shares the same GA4 API key connection but adds an article path prefix
 * filter to produce per-article performance records.
 *
 * TODO: Wire up real GA4 API credentials once available.
 */
export default async function GA4ArticlesSettingsPage() {
  const connection = await getConnectionByPlatform('ga4-articles')

  const connectionMetadata = connection?.metadata as Record<string, unknown> | null
  const articlePathPrefix = (connectionMetadata?.article_path_prefix as string) ?? ''
  const propertyId = (connectionMetadata?.property_id as string) ?? ''

  // Count matched articles if prefix is configured
  const matchedCount = articlePathPrefix
    ? await countMatchedArticles(articlePathPrefix)
    : 0

  // Load recent sync jobs if connected
  const recentSyncs = connection
    ? await getRecentSyncJobs(connection.id, 5)
    : []

  const lastSync = recentSyncs[0] ?? null

  return (
    <div>
      <PageHeader
        title="GA4 Article-Level Analytics"
        description="Track per-article page views, engagement, and time on page from Google Analytics 4."
      />

      {/* Connection status */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-off-white mb-4">
          Connection
        </h2>

        {connection ? (
          <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-5">
            <ConnectionCard
              platformName="GA4 Article-Level"
              platformSlug="ga4-articles"
              platformId={connection.platform_id}
              connection={connection}
              authType="api_key"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-3">
            <p className="text-sm text-off-white">
              No GA4 article-level connection found. Set up a GA4 connection with
              an article path prefix on the{' '}
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

      {/* Article path prefix configuration */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-off-white mb-4">
          Article Path Prefix
        </h2>

        <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-off-white mb-1">
                Current prefix
              </label>
              <p className="text-sm text-mid-grey font-mono">
                {articlePathPrefix || '(not configured)'}
              </p>
              <p className="text-xs text-mid-grey mt-1">
                Only pages starting with this path will be tracked as articles.
                For example, <code className="text-coral">/blog/</code> or{' '}
                <code className="text-coral">/articles/</code>.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-off-white mb-1">
                GA4 Property ID
              </label>
              <p className="text-sm text-mid-grey font-mono">
                {propertyId || '(not configured)'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-mid-grey">Matched articles</span>
              <Badge variant={matchedCount > 0 ? 'green' : 'grey'} size="sm">
                {matchedCount} {matchedCount === 1 ? 'article' : 'articles'}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Last sync info */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-off-white mb-4">
          Sync History
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
                    Recent syncs
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
            Connect to GA4 to start syncing article-level analytics.
          </p>
        )}
      </section>
    </div>
  )
}
