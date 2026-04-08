const PLACEHOLDER_EXPERIMENTS = [
  {
    id: "exp-001",
    name: "Homepage hero CTA copy",
    status: "running" as const,
    variants: 2,
    startDate: "2026-03-25",
    visitors: 1240,
  },
  {
    id: "exp-002",
    name: "Blog sidebar signup form vs inline",
    status: "completed" as const,
    variants: 2,
    startDate: "2026-03-10",
    visitors: 3420,
  },
  {
    id: "exp-003",
    name: "Podcast page lead magnet offer",
    status: "draft" as const,
    variants: 3,
    startDate: null,
    visitors: 0,
  },
];

function StatusBadge({ status }: { status: "draft" | "running" | "completed" }) {
  const styles = {
    draft: "text-foreground-subtle bg-white/5",
    running: "text-green-400 bg-green-400/10",
    completed: "text-blue-400 bg-blue-400/10",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default async function ExperimentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">
            A/B EXPERIMENTS
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            Test variations and measure conversion impact
          </p>
        </div>
        <button className="px-4 py-2 bg-coral hover:bg-coral/90 text-white text-sm font-medium rounded-lg transition-colors">
          Create Experiment
        </button>
      </div>

      {/* Experiments list */}
      <div className="space-y-3">
        {PLACEHOLDER_EXPERIMENTS.map((exp) => (
          <div
            key={exp.id}
            className="bg-background-elevated border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-off-white font-medium text-sm truncate">
                    {exp.name}
                  </h3>
                  <StatusBadge status={exp.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-foreground-subtle">
                  <span>{exp.variants} variants</span>
                  {exp.startDate && <span>Started {exp.startDate}</span>}
                  {exp.visitors > 0 && (
                    <span>{exp.visitors.toLocaleString()} visitors</span>
                  )}
                </div>
              </div>
              <button className="text-xs text-foreground-muted hover:text-off-white transition-colors px-3 py-1.5 border border-white/10 rounded-lg">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-4">
        <p className="text-foreground-subtle text-xs">
          Experiments use the built-in event tracking system. Create an experiment to split traffic
          between variants and measure conversion differences with statistical significance.
        </p>
      </div>
    </div>
  );
}
