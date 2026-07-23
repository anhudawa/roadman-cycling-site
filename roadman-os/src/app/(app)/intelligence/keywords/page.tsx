import { PageHeader } from '@/components/ui/PageHeader'
import { KeywordTracker } from '@/components/intelligence/KeywordTracker'

export const metadata = {
  title: 'Keyword Tracker — Roadman OS',
}

/**
 * T58 — Keyword Volume Tracking page.
 * Track search volumes, CPC, competition, and rankings for target keywords.
 */
export default function KeywordTrackerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Keyword Tracker"
        description="Track search volumes, competition, and rankings for your target keywords across topics."
      />
      <KeywordTracker />
    </div>
  )
}
