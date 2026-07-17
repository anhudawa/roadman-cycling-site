import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ClusterForm } from '@/components/clusters/ClusterForm'
import { getAllAssetOptions } from '@/lib/queries/clusters'
import { createCluster } from '@/lib/actions/clusters'

export default async function NewClusterPage() {
  const assets = await getAllAssetOptions()

  async function handleCreate(
    formData: FormData,
  ): Promise<{ error?: string } | void> {
    'use server'
    const result = await createCluster(formData)
    if (result.success) {
      redirect('/settings/clusters')
    }
    return { error: result.error || 'Failed to create cluster' }
  }

  return (
    <div>
      <PageHeader title="New Cluster" />
      <div className="max-w-2xl">
        <ClusterForm mode="create" assets={assets} onSubmit={handleCreate} />
      </div>
    </div>
  )
}
