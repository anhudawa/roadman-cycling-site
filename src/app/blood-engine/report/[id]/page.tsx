import { notFound } from "next/navigation";
import { Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { getReport } from "@/lib/blood-engine/db";
import type { InterpretationJSON, ReportContext } from "@/lib/blood-engine/schemas";
import { MedicalDisclaimer } from "../../MedicalDisclaimer";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reportId = Number(id);
  if (!Number.isInteger(reportId) || reportId <= 0) {
    notFound();
  }
  const user = await requireBloodEngineAccess();
  const report = await getReport(reportId, user.id);
  if (!report) notFound();

  const interp = report.interpretation as InterpretationJSON | null;
  const ctx = report.context as ReportContext;

  if (!interp) {
    return (
      <Section background="deep-purple">
        <Container width="narrow" className="text-center">
          <h1 className="font-heading uppercase text-[var(--text-section)] text-off-white">
            Interpretation unavailable
          </h1>
          <p className="text-foreground-muted mt-6">This report has no interpretation attached.</p>
          <div className="mt-10">
            <Button href="/blood-engine/dashboard">Back to dashboard</Button>
          </div>
        </Container>
      </Section>
    );
  }

  const statusColor =
    interp.overall_status === "optimal"
      ? "bg-emerald-500"
      : interp.overall_status === "suboptimal"
        ? "bg-amber-400"
        : "bg-coral";
  const statusLabel =
    interp.overall_status === "optimal"
      ? "All clear"
      : interp.overall_status === "suboptimal"
        ? "Needs attention"
        : "Flagged";

  return (
    <Section background="deep-purple">
      <Container>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8 print:mb-4">
          <div>
            <p className="font-heading tracking-[0.3em] text-coral text-sm mb-2">
              Blood Engine — Report #{report.id}
            </p>
            <h1 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white">
              Your bloodwork, decoded
            </h1>
            <p className="text-foreground-subtle mt-3 text-sm">
              Draw date: {report.drawDate ?? "—"} · Generated:{" "}
              {report.createdAt?.toLocaleDateString?.() ?? ""} · Prompt:{" "}
              {report.promptVersion ?? "n/a"}
            </p>
          </div>
          <div className="flex gap-3 print:hidden flex-wrap">
            <Button href="/blood-engine/dashboard" variant="ghost">
              ← Dashboard
            </Button>
            <Button
              href={`/api/blood-engine/report/${report.id}/markdown`}
              variant="ghost"
            >
              Export markdown
            </Button>
            <PrintButton />
          </div>
        </div>

        {/* Overall status banner */}
        <div className="rounded-lg border border-white/10 bg-background-elevated p-6 mb-8 flex items-start gap-5">
          <span className={`inline-block w-6 h-6 rounded-full mt-1 flex-shrink-0 ${statusColor}`} />
          <div>
            <p className="font-heading uppercase text-off-white text-2xl mb-2">{statusLabel}</p>
            <p className="text-foreground-muted">{interp.summary}</p>
          </div>
        </div>

        {/* Context summary */}
        <div className="rounded-lg border border-white/10 bg-background-elevated p-6 mb-10">
          <p className="font-heading uppercase text-off-white text-lg mb-3">Context</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Meta label="Age" value={String(ctx.age)} />
            <Meta label="Sex" value={ctx.sex === "m" ? "Male" : "Female"} />
            <Meta label="Training hours / wk" value={String(ctx.trainingHoursPerWeek)} />
            <Meta label="Phase" value={ctx.trainingPhase} />
          </div>
          {ctx.symptoms.length > 0 ? (
            <div className="mt-4 text-sm">
              <span className="font-heading uppercase tracking-wider text-foreground-subtle mr-2">
                Symptoms:
              </span>
              <span className="text-foreground-muted">
                {ctx.symptoms.map((s) => s.replace(/_/g, " ")).join(", ")}
              </span>
            </div>
          ) : null}
        </div>

        {/* Detected patterns */}
        {interp.detected_patterns.length > 0 ? (
          <div className="mb-10">
            <h2 className="font-heading uppercase text-off-white text-3xl mb-4">Patterns detected</h2>
            <div className="space-y-3">
              {interp.detected_patterns.map((p, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-5 ${
                    p.severity === "urgent"
                      ? "border-coral bg-coral-muted"
                      : p.severity === "address"
                        ? "border-amber-400/40 bg-amber-400/10"
                        : "border-white/10 bg-background-elevated"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <h3 className="font-heading uppercase text-off-white text-xl">{p.name}</h3>
                    <span className="text-xs font-heading uppercase tracking-wider text-foreground-subtle">
                      {p.severity}
                    </span>
                  </div>
                  <p className="text-foreground-muted text-sm">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Marker-by-marker */}
        <div className="mb-10">
          <h2 className="font-heading uppercase text-off-white text-3xl mb-4">Marker by marker</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {interp.markers.map((m, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/10 bg-background-elevated p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-heading uppercase text-off-white text-xl leading-tight">
                    {m.name}
                  </h3>
                  <StatusPill status={m.status} />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-heading text-coral text-3xl">{m.value}</span>
                  <span className="text-foreground-subtle text-sm">{m.unit}</span>
                  <span className="text-foreground-subtle text-xs ml-auto">
                    Optimal: {m.athlete_optimal_range}
                  </span>
                </div>
                <p className="text-foreground-muted text-sm mb-3">{m.interpretation}</p>
                <div className="pt-3 border-t border-white/5">
                  <p className="font-heading uppercase tracking-wider text-coral text-xs mb-1">
                    Action
                  </p>
                  <p className="text-off-white text-sm">{m.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action plan */}
        <div className="mb-10">
          <h2 className="font-heading uppercase text-off-white text-3xl mb-4">Action plan</h2>
          <div className="space-y-3">
            {interp.action_plan.map((a) => (
              <div
                key={a.priority}
                className="rounded-lg border border-white/10 bg-background-elevated p-5 flex items-start gap-4"
              >
                <div className="font-heading text-coral text-3xl leading-none">
                  {String(a.priority).padStart(2, "0")}
                </div>
                <div>
                  <p className="text-off-white">{a.action}</p>
                  <p className="text-xs font-heading uppercase tracking-wider text-foreground-subtle mt-1">
                    {a.timeframe}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retest */}
        <div className="rounded-lg border border-white/10 bg-background-elevated p-6 mb-10">
          <p className="font-heading uppercase text-off-white text-lg mb-2">Next retest</p>
          <p className="text-foreground-muted">
            In <span className="text-coral">{interp.retest_recommendation.timeframe}</span>. We&apos;ll
            remind you — focus on{" "}
            {interp.retest_recommendation.focus_markers.length > 0
              ? interp.retest_recommendation.focus_markers.join(", ")
              : "every marker in the panel"}
            .
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mb-10">
          <MedicalDisclaimer variant="prominent" />
        </div>

        {/* Upsell */}
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-purple to-deep-purple p-8 text-center print:hidden">
          <h3 className="font-heading uppercase text-off-white text-3xl mb-3">
            You&apos;ve got the diagnosis
          </h3>
          <p className="text-foreground-muted max-w-xl mx-auto mb-6">
            Now execute the training. Not Done Yet Premium is the coaching system built to train
            around exactly the markers you just decoded.
          </p>
          <Button href="/community/not-done-yet" variant="primary" size="lg">
            Explore Not Done Yet →
          </Button>
        </div>
      </Container>
    </Section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-heading uppercase tracking-wider text-foreground-subtle text-xs mb-1">
        {label}
      </p>
      <p className="text-off-white">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: "optimal" | "suboptimal" | "flag" }) {
  const cls =
    status === "optimal"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : status === "suboptimal"
        ? "bg-amber-400/15 text-amber-200 border-amber-400/40"
        : "bg-coral/20 text-coral border-coral/40";
  return (
    <span
      className={`text-xs font-heading uppercase tracking-wider px-2.5 py-1 rounded-full border ${cls}`}
    >
      {status}
    </span>
  );
}
