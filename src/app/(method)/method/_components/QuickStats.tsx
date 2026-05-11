interface Stat {
  label: string;
  value: string;
  hint?: string;
}

interface QuickStatsProps {
  stats: readonly Stat[];
}

/**
 * Four-column dashboard stat row. Numbers in Bebas Neue, labels small
 * and tracked. Reflows to 2x2 on small screens.
 */
export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <dl className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border border-white/10 bg-white/5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-1 bg-charcoal/80 px-5 py-5 md:py-6"
        >
          <dt className="text-[11px] font-heading uppercase tracking-[0.25em] text-foreground-muted">
            {stat.label}
          </dt>
          <dd className="font-heading text-3xl md:text-4xl leading-none text-off-white">
            {stat.value}
          </dd>
          {stat.hint && (
            <p className="text-[11px] text-foreground-muted">{stat.hint}</p>
          )}
        </div>
      ))}
    </dl>
  );
}
