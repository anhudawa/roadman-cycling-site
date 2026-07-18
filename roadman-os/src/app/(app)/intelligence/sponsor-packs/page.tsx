import { PageHeader } from '@/components/ui/PageHeader'
import { SponsorEvidencePack } from '@/components/intelligence/SponsorEvidencePack'

export const metadata = {
  title: 'Sponsor Evidence Packs — Roadman OS',
}

/**
 * T69 — Sponsor Evidence Packs page.
 * One-click branded evidence packs per commercial category for sponsor sales.
 */
export default function SponsorEvidencePacksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sponsor Evidence Packs"
        description="One-click branded evidence packs per commercial category for sponsor sales."
      />
      <SponsorEvidencePack />
    </div>
  )
}
