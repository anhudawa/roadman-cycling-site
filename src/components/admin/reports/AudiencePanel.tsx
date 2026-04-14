import type { PlatformStat } from '@/lib/reports/types';
import { CounterAnimated } from './CounterAnimated';

const LABELS: Record<PlatformStat['platform'], string> = {
  website: 'Website Sessions',
  facebook: 'Facebook Views',
  x: 'X Views',
  instagram: 'Instagram Views',
};

interface Props {
  platforms: PlatformStat[];
}

export function AudiencePanel({ platforms }: Props) {
  return (
    <section className="py-10">
      <h2 className="mb-6 font-[var(--font-bebas-neue)] text-3xl text-white">Audience</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {platforms.map((p) => (
          <div key={p.platform} className="rounded-xl border border-white/5 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-widest text-white/50">{LABELS[p.platform]}</div>
            <div className="mt-2 font-[var(--font-bebas-neue)] text-5xl text-white">
              {p.views === null ? '—' : <CounterAnimated value={p.views} />}
            </div>
            {p.deltaPct !== null && (
              <div
                className={`mt-1 text-sm ${p.deltaPct >= 0 ? 'text-[#F16363]' : 'text-white/50'}`}
              >
                {p.deltaPct >= 0 ? '↑' : '↓'} {Math.abs(p.deltaPct)}% vs last month
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
