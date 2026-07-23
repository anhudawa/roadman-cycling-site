import { PageHeader } from '@/components/ui/PageHeader'
import { BackfillProgress } from '@/components/intelligence/BackfillProgress'

export const metadata = {
  title: 'Historical Backfill — Roadman OS',
}

/**
 * T55 — Historical Backfill Programme page.
 * Manage and monitor backfill operations for YouTube Analytics,
 * Beehiiv newsletters, and GA4 web analytics.
 */
export default function BackfillPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Historical Backfill"
        description="Import historical performance data from YouTube, Beehiiv, and GA4 to enrich trend analysis."
      />
      <BackfillProgress />
    </div>
  )
}
