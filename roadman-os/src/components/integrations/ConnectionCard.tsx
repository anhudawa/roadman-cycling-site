'use client'

import { useState, useTransition } from 'react'
import {
  Youtube,
  Instagram,
  Facebook,
  Linkedin,
  Music,
  Mail,
  BarChart3,
  Users,
  Plug,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SyncStatusBadge } from '@/components/integrations/SyncStatusBadge'
import { disconnectPlatform, triggerSync } from '@/lib/actions/integrations'
import { getConnectionStatus } from '@/lib/queries/integrations'
import type { PlatformConnection } from '@/types/database'

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'expired'

export interface ConnectionCardProps {
  platformName: string
  platformSlug: string
  platformId: string
  connection: PlatformConnection | null
  /** Whether the platform uses OAuth (vs API key) */
  authType: 'oauth' | 'api_key'
}

const PLATFORM_ICONS: Record<string, LucideIcon> = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  meta: Instagram,
  linkedin: Linkedin,
  spotify: Music,
  beehiiv: Mail,
  ga4: BarChart3,
  skool: Users,
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; variant: 'green' | 'grey' | 'red' | 'amber' }
> = {
  connected: { label: 'Connected', variant: 'green' },
  disconnected: { label: 'Disconnected', variant: 'grey' },
  error: { label: 'Error', variant: 'red' },
  expired: { label: 'Expired', variant: 'amber' },
}

/**
 * Integration connection card showing platform status with connect/disconnect controls.
 */
export function ConnectionCard({
  platformName,
  platformSlug,
  platformId,
  connection,
  authType,
}: ConnectionCardProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const status = getConnectionStatus(connection)
  const Icon = PLATFORM_ICONS[platformSlug] || Plug
  const { label: statusLabel, variant: statusVariant } = STATUS_CONFIG[status]

  const handleDisconnect = () => {
    if (!connection) return
    setError(null)
    startTransition(async () => {
      const result = await disconnectPlatform(connection.id)
      if (!result.success) {
        setError(result.error ?? 'Failed to disconnect')
      }
    })
  }

  const handleSync = () => {
    if (!connection) return
    setError(null)
    startTransition(async () => {
      const result = await triggerSync(connection.id)
      if (!result.success) {
        setError(result.error ?? 'Failed to start sync')
      }
    })
  }

  const handleConnect = () => {
    if (authType === 'oauth') {
      // Redirect to OAuth flow
      window.location.href = `/api/auth/${platformSlug}`
    }
    // API key connections are handled by a separate form
  }

  const lastSynced = connection?.last_synced_at
    ? new Date(connection.last_synced_at).toLocaleString()
    : null

  return (
    <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-deep-purple/30">
            <Icon className="h-5 w-5 text-coral" />
          </div>
          <div>
            <h3 className="font-medium text-off-white">{platformName}</h3>
            {connection?.account_name && (
              <p className="text-xs text-mid-grey">{connection.account_name}</p>
            )}
          </div>
        </div>
        <Badge variant={statusVariant} size="sm">
          {statusLabel}
        </Badge>
      </div>

      {status === 'connected' && connection && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-mid-grey">Last sync</span>
            <SyncStatusBadge lastSyncedAt={connection.last_synced_at} />
          </div>
          {lastSynced && (
            <p className="text-xs text-mid-grey">{lastSynced}</p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 mb-3">{error}</p>
      )}

      <div className="flex gap-2">
        {status === 'connected' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              loading={isPending}
            >
              Sync Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              loading={isPending}
            >
              Disconnect
            </Button>
          </>
        )}
        {status === 'disconnected' && authType === 'oauth' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleConnect}
            loading={isPending}
          >
            Connect
          </Button>
        )}
        {status === 'expired' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleConnect}
            loading={isPending}
          >
            Re-authorise
          </Button>
        )}
        {status === 'error' && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConnect}
              loading={isPending}
            >
              Re-authorise
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              loading={isPending}
            >
              Disconnect
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
