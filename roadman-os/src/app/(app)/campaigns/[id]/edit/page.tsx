import { notFound, redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { CampaignForm } from '@/components/campaigns/CampaignForm'
import { getCampaign, getProfiles } from '@/lib/queries/campaigns'
import { updateCampaign } from '@/lib/actions/campaigns'

export const metadata = {
  title: 'Edit Campaign — Roadman OS',
}

interface EditCampaignPageProps {
  params: { id: string }
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const [campaign, profiles] = await Promise.all([
    getCampaign(params.id),
    getProfiles(),
  ])

  if (!campaign) {
    notFound()
  }

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await updateCampaign(params.id, formData)
    if (result.success) {
      redirect(`/campaigns/${params.id}`)
    } else {
      throw new Error(result.error ?? 'Failed to update campaign')
    }
  }

  return (
    <div>
      <PageHeader
        title="Edit Campaign"
        description={`Editing "${campaign.title}"`}
      />

      <CampaignForm
        mode="edit"
        campaign={campaign}
        profiles={profiles}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
