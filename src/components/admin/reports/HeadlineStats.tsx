import { CounterAnimated } from './CounterAnimated';

interface Stat {
  label: string;
  value: number | null;
  deltaPct: number | null;
}

interface Props {
  stats: Stat[];
}

function DeltaPill({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct >= 0;
  return (
    <span
      className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        up ? 'bg-[#F16363]/20 text-[#F16363]' : 'bg-white/10 text-white/60'
      }`}
    >
      {up ? '$†‘' : '$†“'} {Math.abs(pct)}%
    </span>
  );
}

export function HeadlineStats({ stats }: Props) {
  return (
    <section className="grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-white/5 bg-white/5 p-6 text-center">
          <div className="font-[var(--font-bebas-neue)] text-5xl text-white">
            {s.value === null ? '$€”' : <CounterAnimated value={s.value} />}
          </div>
          <div className="mt-2 text-xs uppercase tracking-widest text-white/50">
            {s.label}
            <DeltaPill pct={s.deltaPct} />
          </div>
        </div>
      ))}
    </section>
  );
}
