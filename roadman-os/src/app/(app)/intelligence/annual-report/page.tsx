import { PageHeader } from '@/components/ui/PageHeader'
import { AnnualReport } from '@/components/intelligence/AnnualReport'

export const metadata = {
  title: 'Annual Audience Report — Roadman OS',
}

/**
 * T70 — Annual Audience Report page.
 * "State of the Masters Cyclist" — annual data export for
 * marketing and sponsor sales.
 */
export default function AnnualReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Annual Audience Report"
        description="State of the Masters Cyclist — annual data export for marketing and sponsor sales."
      />
      <AnnualReport />
    </div>
  )
}
