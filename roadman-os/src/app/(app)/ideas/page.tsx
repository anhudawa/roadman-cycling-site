import { PageHeader } from '@/components/ui/PageHeader'
import { getIdeas } from '@/lib/queries/ideas'
import { IdeasClient } from '@/components/ideas/IdeasClient'

export const metadata = {
  title: 'Ideas — Roadman OS',
}

export default async function IdeasPage() {
  const ideas = await getIdeas()

  return (
    <div>
      <PageHeader
        title="Ideas"
        description="Capture, vote, and promote ideas into content assets."
      />

      <IdeasClient ideas={ideas} />
    </div>
  )
}
