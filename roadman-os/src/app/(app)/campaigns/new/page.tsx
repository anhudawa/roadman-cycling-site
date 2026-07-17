import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { CampaignForm } from '@/components/campaigns/CampaignForm'
import { getProfiles } from '@/lib/queries/campaigns'
import { createCampaign } from '@/lib/actions/campaigns'

export const metadata = {
  title: 'New Campaign — Roadman OS',
}

export default async function NewCampaignPage() {
  const profiles = await getProfiles()

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await createCampaign(formData)
    if (result.success) {
      redirect('/campaigns')
    } else {
      throw new Error(result.error ?? 'Failed to create campaign')
    }
  }

  return (
    <div>
      <PageHeader
        title="New Campaign"
        description="Set up a new campaign to organise your content."
      />

      <CampaignForm
        mode="create"
        profiles={profiles}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
