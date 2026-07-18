import { PageHeader } from '@/components/ui/PageHeader'
import { AudienceSegments } from '@/components/intelligence/AudienceSegments'

export const metadata = {
  title: 'Audience Segments — Roadman OS',
}

/**
 * T68 — Audience Segments page.
 * Behavioural audience clusters: topic affinities, seasonal profiles,
 * revenue rates. Privacy-preserving — hashed member keys only.
 */
export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audience Segments"
        description="Behavioural clusters discovered from engagement patterns. First-party data only — no raw emails stored."
      />
      <AudienceSegments />
    </div>
  )
}
