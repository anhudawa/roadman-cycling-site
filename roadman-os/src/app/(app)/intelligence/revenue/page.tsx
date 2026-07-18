import { PageHeader } from '@/components/ui/PageHeader'
import { RevenueAttribution } from '@/components/intelligence/RevenueAttribution'

export const metadata = {
  title: 'Revenue Attribution — Roadman OS',
}

/**
 * T71 — Revenue Attribution page.
 * Revenue by topic, by month, by attribution method.
 * UTM-attributed and inferred shown separately — never blended.
 */
export default function RevenueAttributionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue Attribution"
        description="Revenue by topic, by month, by attribution method. UTM-attributed and inferred shown separately — never blended."
      />
      <RevenueAttribution />
    </div>
  )
}
