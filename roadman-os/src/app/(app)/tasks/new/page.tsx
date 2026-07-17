import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { TaskForm } from '@/components/tasks/TaskForm'
import { getProfiles, getActiveCampaigns } from '@/lib/queries/campaigns'
import { createTask } from '@/lib/actions/tasks'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'New Task — Roadman OS',
}

export default async function NewTaskPage() {
  const [profiles, campaigns] = await Promise.all([
    getProfiles(),
    getActiveCampaigns(),
  ])

  // Fetch assets for the asset dropdown
  const supabase = await createClient()
  const { data: assetsData } = await supabase
    .from('assets')
    .select('id, title')
    .order('title')

  const assets = (assetsData ?? []).map((a) => ({ id: a.id, title: a.title }))

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await createTask(formData)
    if (result.success) {
      redirect('/tasks')
    } else {
      throw new Error(result.error ?? 'Failed to create task')
    }
  }

  return (
    <div>
      <PageHeader
        title="New Task"
        description="Create a new task and assign it to your team."
      />

      <TaskForm
        mode="create"
        profiles={profiles}
        campaigns={campaigns}
        assets={assets}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
