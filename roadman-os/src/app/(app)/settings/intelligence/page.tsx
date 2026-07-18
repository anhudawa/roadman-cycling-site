import { PageHeader } from '@/components/ui/PageHeader'
import { IntelligenceOps } from '@/components/intelligence/IntelligenceOps'

export const metadata = {
  title: 'Intelligence Ops — Roadman OS',
}

/**
 * T72 — Intelligence Ops + Data Quality Monitor page.
 * Admin view: sync coverage, taxonomy health, stale indices, dark-source alerts.
 */
export default function IntelligenceOpsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Intelligence Ops"
        description="Data quality, sync coverage, taxonomy health, and pipeline monitoring."
      />

      <IntelligenceOps />
    </div>
  )
}
