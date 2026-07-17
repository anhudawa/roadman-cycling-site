import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/utils/auth'
import { getDropdownData } from '@/lib/queries/assets'
import { PageHeader } from '@/components/ui/PageHeader'
import { AssetForm } from '@/components/assets/AssetForm'

export const metadata = {
  title: 'New Asset — Roadman OS',
}

export default async function NewAssetPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const { campaigns, profiles, topics, tags, assets } = await getDropdownData()

  return (
    <div>
      <PageHeader
        title="New Asset"
        description="Create a new content asset"
      />

      <AssetForm
        mode="create"
        campaigns={campaigns}
        profiles={profiles}
        topics={topics}
        tags={tags}
        assets={assets}
      />
    </div>
  )
}
