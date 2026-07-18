import { PageHeader } from '@/components/ui/PageHeader'
import { InsightReview } from '@/components/intelligence/InsightReview'

export const metadata = {
  title: 'Insights — Roadman OS',
}

/**
 * T65 — Insight Review page.
 * Review candidate insights, validate/dismiss, manage sponsor safety flags.
 */
export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="Machine-generated insights from the trend engine. Review, validate, and promote to sponsor evidence packs."
      />
      <InsightReview />
    </div>
  )
}
