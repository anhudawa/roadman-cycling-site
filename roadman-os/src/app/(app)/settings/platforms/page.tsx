import { PageHeader } from '@/components/ui/PageHeader'
import { PlatformTable } from '@/components/platforms/PlatformTable'
import { getPlatforms } from '@/lib/queries/platforms'

export const metadata = {
  title: 'Platforms — Roadman OS',
}

export default async function PlatformsSettingsPage() {
  const platforms = await getPlatforms()

  return (
    <div>
      <PageHeader
        title="Platforms"
        description="Manage your distribution platforms and channels."
      />

      <PlatformTable platforms={platforms} />
    </div>
  )
}
