import Link from "next/link";
import { notFound } from "next/navigation";
import type { ABTest, ABResult } from "@/lib/ab/types";
import { estimateSampleSize } from "@/lib/ab/statistics";
import { getExperimentResults } from "@/lib/admin/events-store";
import ExperimentActions from "./experiment-actions";

// ── Data fetching ────────────────────────────────────────

async function getExperiment(id: string): Promise<ABTest | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/experiments`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const experiments: ABTest[] = data.experiments ?? [];
    return experiments.find((e) => e.id === id) ?? null;
  } catch {
    return null;
  }
}

// ── Sub-components ───────────────────────────────────────

function StatusBadge({ status }: { status: ABTest["status"] }) {
  const styles = {
    draft: "text-foreground-subtle bg-white/5",
    running: "text-green-400 bg-green-400/10",
    completed: "text-blue-400 bg-blue-400/10",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Main page ────────────────────────────────────────────

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let experiment = await getExperiment(id);

  if (!experiment) {
    return notFound();
  }

  let results: ABResult[];
  try {
    results = await getExperimentResults(
      experiment.variants.map((v) => v.id),
      experiment.page
    );
  } catch {
    results = experiment.variants.map((v) => ({
      variantId: v.id,
      impressions: 0,
      conversions: 0,
      conversionRate: 0,
      isSignificant: false,
      confidence: 0,
    }));
  }

  // Auto-declare winner if experiment is running and a variant is significant
  if (experiment.status === "running") {
    const significantResults = results.filter(
      (r) => r.isSignificant && r.variantId !== experiment!.variants[0]?.id
    );
    if (significantResults.length > 0) {
      const winner = significantResults.reduce((best, r) =>
        r.conversionRate > best.conversionRate ? r : best
      );
      const controlRate = results[0]?.conversionRate ?? 0;
      const minSamples = estimateSampleSize(Math.max(controlRate, 0.01), 0.1);
      if (winner.impressions >= minSamples) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
          await fetch(`${baseUrl}/api/admin/experiments`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: experiment.id,
              action: "declare_winner",
              winnerVariantId: winner.variantId,
              completedBy: "auto",
            }),
          });
          experiment = (await getExperiment(id))!;
        } catch {
          // Auto-declare failed silently
        }
      }
    }
  }

  const requiredSampleSize = estimateSampleSize(0.05, 0.2); // 5% baseline, 20% MDE

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/experiments"
              className="text-foreground-subtle hover:text-off-white transition-colors text-sm"
            >
              &larr; Experiments
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl text-off-white tracking-wider">
              {experiment.name}
            </h1>
            <StatusBadge status={experiment.status} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-foreground-subtle">
            <span>Page: {experiment.page}</span>
            <span>Element: {experiment.element}</span>
            <span>Created by: {experiment.createdBy}</span>
          </div>
          {experiment.startedAt && (
            <p className="text-xs text-foreground-subtle mt-1">
              Started:{" "}
              {new Date(experiment.startedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {experiment.endedAt && (
                <>
                  {" "}
                  &mdash; Ended:{" "}
                  {new Date(experiment.endedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </>
              )}
            </p>
          )}
        </div>
        <ExperimentActions experimentId={experiment.id} status={experiment.status} variants={experiment.variants} />
      </div>

      {/* Variants */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          VARIANTS
        </h2>
        <div className="grid gap-3">
          {experiment.variants.map((variant, i) => (
            <div
              key={variant.id}
              className={`p-4 rounded-lg border transition-colors ${
                experiment.winnerVariantId === variant.id
                  ? "border-coral/40 bg-coral/5"
                  : "border-white/5 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-foreground-subtle">
                  {i === 0 ? "CONTROL" : `VARIANT ${i}`}
                </span>
                <span className="text-sm text-off-white font-medium">
                  {variant.label}
                </span>
                {experiment.winnerVariantId === variant.id && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-coral/20 text-coral">
                    Winner
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground-muted leading-relaxed">
                {variant.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Results table */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          RESULTS
        </h2>
        {experiment.status === "draft" ? (
          <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
            <p className="text-foreground-subtle text-sm">
              Start the test to begin collecting data.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-foreground-subtle font-medium py-3 pr-4">
                    Variant
                  </th>
                  <th className="text-right text-foreground-subtle font-medium py-3 px-4">
                    Impressions
                  </th>
                  <th className="text-right text-foreground-subtle font-medium py-3 px-4">
                    Conversions
                  </th>
                  <th className="text-right text-foreground-subtle font-medium py-3 px-4">
                    CVR
                  </th>
                  <th className="text-right text-foreground-subtle font-medium py-3 pl-4">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, i) => {
                  const variant = experiment.variants.find(
                    (v) => v.id === result.variantId
                  );
                  return (
                    <tr
                      key={result.variantId}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-off-white">
                            {variant?.label ?? `Variant ${i}`}
                          </span>
                          {result.isSignificant && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-400/10 text-green-400">
                              SIG
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right text-foreground-muted py-3 px-4">
                        {result.impressions.toLocaleString()}
                      </td>
                      <td className="text-right text-foreground-muted py-3 px-4">
                        {result.conversions.toLocaleString()}
                      </td>
                      <td className="text-right text-off-white font-medium py-3 px-4">
                        {(result.conversionRate * 100).toFixed(2)}%
                      </td>
                      <td className="text-right py-3 pl-4">
                        {i === 0 ? (
                          <span className="text-foreground-subtle">&mdash;</span>
                        ) : (
                          <span
                            className={
                              result.confidence >= 95
                                ? "text-green-400"
                                : result.confidence >= 80
                                ? "text-yellow-400"
                                : "text-foreground-muted"
                            }
                          >
                            {result.confidence.toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Progress toward significance */}
      {experiment.status === "running" && (
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
            PROGRESS TOWARD SIGNIFICANCE
          </h2>
          <div className="space-y-3">
            {results.map((result, i) => {
              if (i === 0) return null; // Skip control
              const progress = Math.min(
                100,
                (result.impressions / requiredSampleSize) * 100
              );
              const variant = experiment.variants.find(
                (v) => v.id === result.variantId
              );
              return (
                <div key={result.variantId}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-foreground-muted">
                      {variant?.label ?? `Variant ${i}`}
                    </span>
                    <span className="text-foreground-subtle text-xs">
                      {result.impressions.toLocaleString()} /{" "}
                      {requiredSampleSize.toLocaleString()} needed
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress >= 100 ? "bg-green-400" : "bg-coral"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-foreground-subtle mt-2">
              Based on 5% baseline conversion rate, 20% minimum detectable
              effect. Each variant needs ~{requiredSampleSize.toLocaleString()}{" "}
              impressions for 95% confidence.
            </p>
          </div>
        </div>
      )}

      {/* Winner info */}
      {experiment.winnerVariantId && (
        <div className="bg-coral/10 border border-coral/20 rounded-xl p-5">
          <h2 className="font-heading text-sm text-coral tracking-wider mb-2">
            WINNER DECLARED
          </h2>
          <p className="text-sm text-off-white">
            {experiment.variants.find(
              (v) => v.id === experiment.winnerVariantId
            )?.label ?? "Unknown variant"}{" "}
            was declared the winner of this experiment.
          </p>
        </div>
      )}

      {(experiment as unknown as Record<string, unknown>).completedBy === "auto" && (
        <div className="bg-purple/10 border border-purple/20 rounded-xl p-5">
          <p className="text-sm text-off-white">
            <span className="text-purple font-medium">Auto-optimized</span> — This experiment was
            automatically completed when a variant reached statistical significance.
          </p>
        </div>
      )}
    </div>
  );
}
