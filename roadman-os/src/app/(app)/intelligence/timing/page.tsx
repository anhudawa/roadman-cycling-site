import { PageHeader } from '@/components/ui/PageHeader'
import { TimingRecommendations } from '@/components/intelligence/TimingRecommendations'

export const metadata = {
  title: 'Timing Recommendations — Roadman OS',
}

/**
 * T66 — Timing Recommendations page.
 * When to publish what: upcoming demand peaks with per-format
 * publish-by windows based on seasonal indices.
 */
export default function TimingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Timing Recommendations"
        description="Publish-by windows for upcoming demand peaks. Each format has a different lead time for SEO/algorithm ramp."
      />
      <TimingRecommendations />
    </div>
  )
}
