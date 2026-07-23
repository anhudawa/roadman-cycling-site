import Link from 'next/link'
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
  title: 'Google Analytics 4 — Roadman OS',
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

export default async function GA4IntegrationPage() {
  const connection = await getConnectionByPlatform('ga4')
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
  const propertyId = meta.property_id as string | undefined
  const propertyName = meta.property_name as string | undefined

  // Site-level traffic overview from last sync
  const totalUsers = meta.total_users as number | undefined
  const totalSessions = meta.total_sessions as number | undefined
  const totalPageviews = meta.total_pageviews as number | undefined
  const avgSessionDuration = meta.avg_session_duration as number | undefined
  const bounceRate = meta.bounce_rate as number | undefined

  const accountName = connection?.account_name ?? null

  return (
    <div>
      <PageHeader
        title="Google Analytics 4"
        description="Site-level traffic, user behaviour, and page performance from GA4."
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
              There was an error with your GA4 connection. Check your API key
              below and re-save.
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
          GA4 uses a service account key for authentication. Create a service
          account in the{' '}
          <span className="text-coral">
            Google Cloud Console &rarr; IAM &amp; Admin &rarr; Service Accounts
          </span>{' '}
          and grant it Viewer access to your GA4 property.
        </p>

        <ApiKeyForm
          platformSlug="ga4"
          platformName="GA4"
          extraFields={[
            {
              name: 'property_id',
              label: 'Property ID',
              placeholder: '123456789',
              hint: 'The numeric GA4 property ID (not the measurement ID).',
            },
          ]}
        />
      </section>

      {/* Property details — only shown when connected */}
      {status === 'connected' && connection && (
        <>
          {/* Property info */}
          <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
            <h2 className="text-lg font-medium text-off-white mb-4">
              Property Details
            </h2>

            <div className="space-y-3">
              {propertyName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid-grey">Property:</span>
                  <span className="text-sm text-off-white font-medium">
                    {propertyName}
                  </span>
                </div>
              )}

              {propertyId && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid-grey">Property ID:</span>
                  <span className="text-sm text-off-white font-mono">
                    {propertyId}
                  </span>
                </div>
              )}

              {!propertyId && !propertyName && (
                <p className="text-sm text-mid-grey">
                  Property details will appear here after the first sync.
                </p>
              )}
            </div>
          </section>

          {/* Article-level GA4 settings link */}
          <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-off-white">
                  Article-Level Analytics
                </h2>
                <p className="text-sm text-mid-grey mt-1">
                  Configure per-article GA4 tracking and view page-level
                  performance data.
                </p>
              </div>
              <Link
                href="/settings/integrations/ga4-articles"
                className="inline-flex items-center rounded-lg border border-coral/30 bg-coral/10 px-4 py-2 text-sm font-medium text-coral transition-colors hover:bg-coral/20"
              >
                Article Settings
              </Link>
            </div>
          </section>

          {/* Site-level traffic overview */}
          <section className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 mb-6">
            <h2 className="text-lg font-medium text-off-white mb-4">
              Site Traffic Overview
              <span className="text-xs text-mid-grey font-normal ml-2">
                from last sync
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4">
                <p className="text-xs text-mid-grey mb-1">Users</p>
                <p className="text-2xl font-semibold text-off-white">
                  {totalUsers?.toLocaleString() ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4">
                <p className="text-xs text-mid-grey mb-1">Sessions</p>
                <p className="text-2xl font-semibold text-off-white">
                  {totalSessions?.toLocaleString() ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4">
                <p className="text-xs text-mid-grey mb-1">Pageviews</p>
                <p className="text-2xl font-semibold text-off-white">
                  {totalPageviews?.toLocaleString() ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4">
                <p className="text-xs text-mid-grey mb-1">Avg Duration</p>
                <p className="text-2xl font-semibold text-off-white">
                  {avgSessionDuration !== undefined
                    ? `${Math.floor(avgSessionDuration / 60)}m ${Math.round(avgSessionDuration % 60)}s`
                    : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4">
                <p className="text-xs text-mid-grey mb-1">Bounce Rate</p>
                <p className="text-2xl font-semibold text-off-white">
                  {bounceRate !== undefined
                    ? `${(bounceRate * 100).toFixed(1)}%`
                    : '—'}
                </p>
              </div>
            </div>

            <p className="text-xs text-mid-grey mt-3">
              Traffic data is refreshed with each sync. Figures reflect the
              most recently synced period.
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
