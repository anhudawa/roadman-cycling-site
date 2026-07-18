import { PageHeader } from '@/components/ui/PageHeader'
import { TrendExplorer } from '@/components/intelligence/TrendExplorer'

export const metadata = {
  title: 'Trend Explorer — Roadman OS',
}

/**
 * T61 — Trend Explorer page.
 * Main intelligence dashboard: seasonal indices, daily metrics,
 * forecast overlay, and anomaly markers.
 */
export default function TrendExplorerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Trend Explorer"
        description="Seasonal patterns, daily metrics, forecasts, and anomalies across your content topics."
      />
      <TrendExplorer />
    </div>
  )
}
