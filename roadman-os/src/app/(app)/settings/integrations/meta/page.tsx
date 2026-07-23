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
  title: 'Meta (Instagram + Facebook) — Roadman OS',
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

export default async function MetaIntegrationPage() {
  const connection = await getConnectionByPlatform('meta')
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

  // Instagram details
  const igAccountId = meta.instagram_account_id as string | undefined
  const igUsername = meta.instagram_username as string | undefined
  const igFollowers = meta.instagram_followers as number | undefined

  // Facebook details
  const fbPageId = meta.facebook_page_id as string | undefined
  const fbPageName = meta.facebook_page_name as string | undefined
  const fbFollowers = meta.facebook_followers as number | undefined

  // Connected pages / accounts list
  const connectedAccounts = meta.connected_accounts as
    | { type: string; name: string; id: string }[]
    | undefined

  const accountName = connection?.account_name ?? null

  return (
    <div>
      <PageHeader
        title="Meta (Instagram + Facebook)"
        description="Post analytics, engagement metrics, and follower growth across Instagram and Facebook."
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
              Connect your Meta Business account to sync Instagram and Facebook
              analytics, post engagement, and audience insights.
            </p>
            <Link
              href="/api/auth/meta"
              className="inline-flex items-center rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral/90"
            >
              Connect Meta
            </Link>
            <p className="text-xs text-mid-grey">
              Requires a linked Instagram Professional account and Facebook Page.
            </p>
          </div>
        )}

        {status === 'expired' && (
          <div className="space-y-3">
            <p className="text-sm text-mid-grey">
              Your Meta authorisation has expired. Re-authorise to resume
              syncing.
            </p>
            <Link
              href="/api/auth/meta"
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
                There was an error with your Meta connection. Try
                re-authorising below.
              </p>
            </div>
            <Link
              href="/api/auth/meta"
              className="inline-flex items-center rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral/90"
            >
              Re-authorise
            </Link>
          </div>
        )}
      </section>

      {/* Connected accounts/pages — only shown when connected */}
      {status === 'connected' && connection && (
        <>
          {/* Connected pages & accounts */}
          {connectedAccounts && connectedAccounts.length > 0 && (
            <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
              <h2 className="text-lg font-medium text-off-white mb-4">
                Connected Pages &amp; Accounts
              </h2>

              <div className="space-y-3">
                {connectedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-lg border border-mid-grey/10 bg-charcoal/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={account.type === 'instagram' ? 'coral' : 'blue'}
                        size="sm"
                      >
                        {account.type === 'instagram' ? 'Instagram' : 'Facebook'}
                      </Badge>
                      <span className="text-sm text-off-white">
                        {account.name}
                      </span>
                    </div>
                    <span className="text-xs text-mid-grey font-mono">
                      {account.id}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Instagram section */}
          <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-medium text-off-white">Instagram</h2>
              <Badge variant="coral" size="sm">IG</Badge>
            </div>

            <div className="space-y-3">
              {igUsername && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid-grey">Username:</span>
                  <span className="text-sm text-off-white font-medium">
                    @{igUsername}
                  </span>
                </div>
              )}

              {igAccountId && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid-grey">Account ID:</span>
                  <span className="text-sm text-off-white font-mono">
                    {igAccountId}
                  </span>
                </div>
              )}

              {igFollowers !== undefined && (
                <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4 mt-3 inline-block">
                  <p className="text-xs text-mid-grey mb-1">Followers</p>
                  <p className="text-2xl font-semibold text-off-white">
                    {igFollowers.toLocaleString()}
                  </p>
                </div>
              )}

              {!igUsername && !igAccountId && (
                <p className="text-sm text-mid-grey">
                  Instagram details will appear here after the first sync.
                </p>
              )}
            </div>
          </section>

          {/* Facebook section */}
          <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-medium text-off-white">Facebook</h2>
              <Badge variant="blue" size="sm">FB</Badge>
            </div>

            <div className="space-y-3">
              {fbPageName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid-grey">Page:</span>
                  <span className="text-sm text-off-white font-medium">
                    {fbPageName}
                  </span>
                </div>
              )}

              {fbPageId && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid-grey">Page ID:</span>
                  <span className="text-sm text-off-white font-mono">
                    {fbPageId}
                  </span>
                </div>
              )}

              {fbFollowers !== undefined && (
                <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4 mt-3 inline-block">
                  <p className="text-xs text-mid-grey mb-1">Page Followers</p>
                  <p className="text-2xl font-semibold text-off-white">
                    {fbFollowers.toLocaleString()}
                  </p>
                </div>
              )}

              {!fbPageName && !fbPageId && (
                <p className="text-sm text-mid-grey">
                  Facebook Page details will appear here after the first sync.
                </p>
              )}
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
