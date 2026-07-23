import { PageHeader } from '@/components/ui/PageHeader'
import { Demographics } from '@/components/intelligence/Demographics'

export const metadata = {
  title: 'Demographics — Roadman OS',
}

/**
 * T54 — Audience Demographics page.
 * Age, gender, and geographic breakdowns across platforms, per topic.
 */
export default function DemographicsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audience Demographics"
        description="Age, gender, and geographic breakdowns across platforms, per topic."
      />
      <Demographics />
    </div>
  )
}
