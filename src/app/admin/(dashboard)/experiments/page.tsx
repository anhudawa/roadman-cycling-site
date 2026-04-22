import Link from "next/link";
import type { ABTest } from "@/lib/ab/types";
import { DeleteButton } from "./delete-button";

async function getExperiments(): Promise<ABTest[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/experiments`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.experiments ?? [];
  } catch {
    return [];
  }
}

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
  const experiments = await getExperiments();

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
        <Link
          href="/admin/experiments/new"
          className="px-4 py-2 bg-[var(--color-coral)] hover:bg-[var(--color-bad-tint)] text-white text-sm font-medium rounded-lg transition-colors"
        >
          Create Experiment
        </Link>
      </div>

      {/* Experiments list */}
      <div className="space-y-3">
        {experiments.length === 0 ? (
          <div className="bg-background-elevated border border-white/5 rounded-xl p-8 text-center">
            <svg
              className="w-8 h-8 text-foreground-subtle mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
            <p className="text-foreground-subtle text-sm">
              No experiments yet. Create one to start testing.
            </p>
          </div>
        ) : (
          experiments.map((exp) => (
            <Link
              key={exp.id}
              href={`/admin/experiments/${exp.id}`}
              className="block bg-background-elevated border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-off-white font-medium text-sm truncate">
                      {exp.name}
                    </h3>
                    <StatusBadge status={exp.status} />
                    {(exp as unknown as Record<string, unknown>).completedBy === "auto" && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple/10 text-purple">
                        Auto
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-foreground-subtle">
                    <span>{exp.variants.length} variants</span>
                    <span>{exp.page}</span>
                    <span>{exp.element}</span>
                    {exp.startedAt && (
                      <span>
                        Started{" "}
                        {new Date(exp.startedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                    {exp.winnerVariantId && (
                      <span className="text-[var(--color-bad)]">Winner declared</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {exp.status !== "running" && (
                    <DeleteButton experimentId={exp.id} />
                  )}
                  <span className="text-xs text-foreground-muted hover:text-off-white transition-colors px-3 py-1.5 border border-white/10 rounded-lg">
                    View
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
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
