import { PageHeader } from '@/components/ui/PageHeader'
import { FormatEffectiveness } from '@/components/intelligence/FormatEffectiveness'

export const metadata = {
  title: 'Format Effectiveness — Roadman OS',
}

/**
 * T67 — Format Effectiveness page.
 * Per-topic engagement comparison across content formats.
 */
export default function FormatEffectivenessPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Format Effectiveness"
        description="Per-topic engagement comparison across content formats. Minimum 3 pieces per format for reliable ratios."
      />
      <FormatEffectiveness />
    </div>
  )
}
