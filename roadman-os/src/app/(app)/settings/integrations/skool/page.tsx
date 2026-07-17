import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { SkoolMetricsForm } from '@/components/integrations/SkoolMetricsForm'
import { getSkoolHistory } from '@/lib/actions/skool'

export const metadata = {
  title: 'Skool Communities — Roadman OS',
}

export default async function SkoolIntegrationPage() {
  const [clubhouseHistory, ndyHistory] = await Promise.all([
    getSkoolHistory('clubhouse'),
    getSkoolHistory('not_done_yet'),
  ])

  return (
    <div>
      <PageHeader
        title="Skool Communities"
        description="Track community growth and engagement across both Skool groups."
      />

      {/* No-API notice */}
      <div className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 mb-8">
        <p className="text-sm text-off-white">
          Skool does not currently offer a public API. Enter your community
          metrics manually below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clubhouse (free) */}
        <section className="rounded-xl border border-coral/30 bg-charcoal/50 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-medium text-off-white">Clubhouse</h2>
            <Badge variant="coral" size="sm">Free</Badge>
          </div>
          <p className="text-sm text-mid-grey mb-6">
            Free community &mdash; 1,852 members
          </p>

          <SkoolMetricsForm tier="clubhouse" history={clubhouseHistory} />
        </section>

        {/* Not Done Yet (paid) */}
        <section className="rounded-xl border border-purple/30 bg-charcoal/50 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-medium text-off-white">Not Done Yet</h2>
            <Badge variant="purple" size="sm">$195/mo</Badge>
          </div>
          <p className="text-sm text-mid-grey mb-2">
            Paid community &mdash; 113 members
          </p>
          <p className="text-xs text-purple mb-6">
            MRR auto-calculated from member count
          </p>

          <SkoolMetricsForm tier="not_done_yet" history={ndyHistory} />
        </section>
      </div>
    </div>
  )
}
