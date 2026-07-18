import { PageHeader } from '@/components/ui/PageHeader'
import { SkoolRitualForm } from '@/components/intelligence/SkoolRitualForm'
import { SkoolRitualHistory } from '@/components/intelligence/SkoolRitualHistory'

export const metadata = {
  title: 'Skool Weekly Ritual — Roadman OS',
}

/**
 * T57 — Skool Weekly Ritual page.
 * Monday morning snapshot entry for both communities.
 */
export default function SkoolRitualPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Skool Weekly Ritual"
        description="Monday morning snapshot — enter this week's community numbers from Skool."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SkoolRitualForm />
        </div>

        <div className="lg:col-span-1">
          <SkoolRitualHistory />
        </div>
      </div>
    </div>
  )
}
