import { notFound, redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/utils/auth'
import { getAsset, getAssetTopics, getAssetTags, getDropdownData } from '@/lib/queries/assets'
import { PageHeader } from '@/components/ui/PageHeader'
import { AssetForm } from '@/components/assets/AssetForm'
import type { Asset } from '@/types/database'

export const metadata = {
  title: 'Edit Asset — Roadman OS',
}

interface EditAssetPageProps {
  params: { id: string }
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const [assetData, assetTopics, assetTags, dropdownData] = await Promise.all([
    getAsset(params.id),
    getAssetTopics(params.id),
    getAssetTags(params.id),
    getDropdownData(),
  ])

  if (!assetData) notFound()

  const asset = assetData as Asset
  const { campaigns, profiles, topics, tags, assets } = dropdownData
  const existingTopicIds = assetTopics.map((at) => at.topic_id)
  const existingTagIds = assetTags.map((at) => at.tag_id)

  return (
    <div>
      <PageHeader
        title="Edit Asset"
        description={asset.title}
      />

      <AssetForm
        mode="edit"
        asset={asset}
        campaigns={campaigns}
        profiles={profiles}
        topics={topics}
        tags={tags}
        assets={assets}
        existingTopicIds={existingTopicIds}
        existingTagIds={existingTagIds}
      />
    </div>
  )
}
