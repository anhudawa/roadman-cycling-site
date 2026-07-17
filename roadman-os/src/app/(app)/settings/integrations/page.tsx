import { PageHeader } from '@/components/ui/PageHeader'
import { ConnectionCard } from '@/components/integrations/ConnectionCard'
import { ApiKeyForm } from '@/components/integrations/ApiKeyForm'
import { getConnections } from '@/lib/queries/integrations'
import { getPlatforms } from '@/lib/queries/platforms'
import type { PlatformConnection } from '@/types/database'

export const metadata = {
  title: 'Integrations — Roadman OS',
}

/** Platforms we support integrations for, in display order. */
const INTEGRATION_PLATFORMS = [
  {
    slug: 'youtube',
    name: 'YouTube',
    authType: 'oauth' as const,
    description: 'Video analytics, revenue, and subscriber data',
  },
  {
    slug: 'meta',
    name: 'Meta (Instagram + Facebook)',
    authType: 'oauth' as const,
    description: 'Post insights, reach, and engagement',
  },
  {
    slug: 'linkedin',
    name: 'LinkedIn',
    authType: 'oauth' as const,
    description: 'Org posts, follower stats, and impressions',
  },
  {
    slug: 'spotify',
    name: 'Spotify for Podcasters',
    authType: 'oauth' as const,
    description: 'Episode stats and listener demographics',
  },
  {
    slug: 'beehiiv',
    name: 'Beehiiv',
    authType: 'api_key' as const,
    description: 'Newsletter metrics, subscribers, and growth',
    extraFields: [
      {
        name: 'publication_id',
        label: 'Publication ID',
        placeholder: 'pub_xxxxxxxx',
        hint: 'Found in Beehiiv Settings > API',
      },
    ],
  },
  {
    slug: 'ga4',
    name: 'Google Analytics 4',
    authType: 'api_key' as const,
    description: 'Website traffic, top pages, and engagement',
    extraFields: [
      {
        name: 'property_id',
        label: 'Property ID',
        placeholder: '123456789',
        hint: 'Found in GA4 Admin > Property Settings',
      },
    ],
  },
  {
    slug: 'skool',
    name: 'Skool',
    authType: 'manual' as const,
    description: 'Community metrics (manual entry)',
  },
]

export default async function IntegrationsSettingsPage() {
  const [connections, platforms] = await Promise.all([
    getConnections(),
    getPlatforms(),
  ])

  // Map connections by platform_id for quick lookup
  const connectionsByPlatformId = new Map<string, PlatformConnection>()
  for (const conn of connections) {
    if (conn.is_active) {
      connectionsByPlatformId.set(conn.platform_id, conn)
    }
  }

  // Map platform slugs to IDs
  const platformIdBySlug = new Map<string, string>()
  for (const p of platforms) {
    platformIdBySlug.set(p.slug, p.id)
  }

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Connect your platforms to automatically sync analytics data."
      />

      {/* OAuth-based integrations */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-off-white mb-4">
          Platform Connections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATION_PLATFORMS.filter((p) => p.authType === 'oauth').map(
            (ip) => {
              const platformId = platformIdBySlug.get(ip.slug) ?? ''
              const connection = platformId
                ? connectionsByPlatformId.get(platformId) ?? null
                : null

              return (
                <ConnectionCard
                  key={ip.slug}
                  platformName={ip.name}
                  platformSlug={ip.slug}
                  platformId={platformId}
                  connection={connection}
                  authType="oauth"
                />
              )
            },
          )}
        </div>
      </section>

      {/* API key-based integrations */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-off-white mb-4">
          API Key Connections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INTEGRATION_PLATFORMS.filter((p) => p.authType === 'api_key').map(
            (ip) => {
              const platformId = platformIdBySlug.get(ip.slug) ?? ''
              const connection = platformId
                ? connectionsByPlatformId.get(platformId) ?? null
                : null

              return (
                <div
                  key={ip.slug}
                  className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-5"
                >
                  <div className="mb-4">
                    <h3 className="font-medium text-off-white">{ip.name}</h3>
                    <p className="text-sm text-mid-grey mt-1">
                      {ip.description}
                    </p>
                  </div>
                  {connection ? (
                    <ConnectionCard
                      platformName={ip.name}
                      platformSlug={ip.slug}
                      platformId={platformId}
                      connection={connection}
                      authType="api_key"
                    />
                  ) : (
                    <ApiKeyForm
                      platformSlug={ip.slug}
                      platformName={ip.name}
                      extraFields={'extraFields' in ip ? ip.extraFields : []}
                    />
                  )}
                </div>
              )
            },
          )}
        </div>
      </section>

      {/* Manual entry (Skool) */}
      <section>
        <h2 className="text-lg font-medium text-off-white mb-4">
          Manual Entry
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INTEGRATION_PLATFORMS.filter((p) => p.authType === 'manual').map(
            (ip) => (
              <a
                key={ip.slug}
                href={`/settings/integrations/${ip.slug}`}
                className="block rounded-xl border border-mid-grey/20 bg-charcoal/50 p-5 hover:border-coral/40 transition-colors"
              >
                <h3 className="font-medium text-off-white">{ip.name}</h3>
                <p className="text-sm text-mid-grey mt-1">{ip.description}</p>
                <p className="text-sm text-coral mt-3">Enter metrics &rarr;</p>
              </a>
            ),
          )}
        </div>
      </section>
    </div>
  )
}
