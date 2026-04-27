export interface MetricRow {
  /** Label, e.g. "FTP", "Body fat", "20-min power" */
  label: string;
  /** Starting value, e.g. "205w" */
  before: string;
  /** Ending value, e.g. "295w" */
  after: string;
  /** Optional delta caption, e.g. "+90w in 6 months" */
  delta?: string;
}

interface BeforeAfterMetricsProps {
  metrics: MetricRow[];
  /** Optional eyebrow/header above the metrics block */
  eyebrow?: string;
  /** Optional title, e.g. athlete name or scenario */
  title?: string;
  /** Optional supporting context line under the title */
  subtitle?: string;
  className?: string;
}

/**
 * Before/after metric grid for case-study modules.
 *
 * Use 2-4 metrics. With one metric the card collapses too small;
 * with 5+ it loses scannability. Pair with an <AthleteProfileCard>
 * if you need name/quote context, or wrap in <ProofModule> for the
 * full 3-up layout.
 *
 * The visual rhythm mirrors a stat ladder rather than a table —
 * left → arrow → right — to make the "movement" the message even
 * for someone who skims the page in two seconds.
 */
export function BeforeAfterMetrics({
  metrics,
  eyebrow,
  title,
  subtitle,
  className = "",
}: BeforeAfterMetricsProps) {
  return (
    <div
      className={`
        rounded-2xl border border-coral/20
        bg-gradient-to-br from-coral/10 via-deep-purple/30 to-charcoal
        p-6 md:p-8
        ${className}
      `}
    >
      {eyebrow && (
        <p className="font-heading text-coral text-[11px] tracking-[0.3em] mb-3">
          {eyebrow.toUpperCase()}
        </p>
      )}
      {title && (
        <h3 className="font-heading text-off-white text-xl md:text-2xl tracking-wide mb-1">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-foreground-muted text-sm mb-6">{subtitle}</p>
      )}

      <ul
        className={`
          grid gap-3
          ${metrics.length >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}
          ${title || subtitle ? "mt-2" : ""}
        `}
      >
        {metrics.map((m) => (
          <li
            key={m.label}
            className="rounded-lg bg-white/[0.04] border border-white/5 p-4"
          >
            <p className="text-[11px] font-heading tracking-widest text-foreground-subtle uppercase mb-2">
              {m.label}
            </p>
            <p className="font-heading text-off-white leading-tight">
              <span className="text-foreground-muted">{m.before}</span>
              <span
                aria-hidden="true"
                className="text-coral mx-2 font-body font-bold"
              >
                →
              </span>
              <span className="text-coral">{m.after}</span>
            </p>
            {m.delta && (
              <p className="text-[11px] text-foreground-subtle mt-1.5 leading-snug">
                {m.delta}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
