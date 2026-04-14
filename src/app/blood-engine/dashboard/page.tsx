import Link from "next/link";
import { Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { listReports } from "@/lib/blood-engine/db";
import { getRemainingHeadroom } from "@/lib/blood-engine/rate-limit";
import type { InterpretationJSON, ReportContext } from "@/lib/blood-engine/schemas";
import { computeTrends } from "@/lib/blood-engine/trends";
import dynamicImport from "next/dynamic";
import { CompareLauncher } from "./CompareLauncher";
import { MedicalDisclaimer } from "../MedicalDisclaimer";

// Recharts is ~100KB gzipped. It's only needed once the user has 2+ reports,
// so don't ship it to the first-run dashboard at all.
const MarkerTrendCard = dynamicImport(
  () => import("./MarkerTrendCard").then((m) => m.MarkerTrendCard),
  {
    loading: () => (
      <div className="rounded-lg border border-white/10 bg-background-elevated p-5 h-[180px] animate-pulse" />
    ),
  }
);

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireBloodEngineAccess();
  const [reports, interpretHeadroom, pdfHeadroom] = await Promise.all([
    listReports(user.id),
    getRemainingHeadroom(user.id, "interpret"),
    getRemainingHeadroom(user.id, "parse-pdf"),
  ]);

  // Trends use the sex from the most recent report (no per-user demographics yet).
  const latestCtx = reports[0]?.context as ReportContext | undefined;
  const trends = latestCtx ? computeTrends(reports, latestCtx.sex) : [];

  return (
    <Section background="deep-purple">
      <Container>
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="font-heading tracking-[0.3em] text-coral text-sm mb-2">Your dashboard</p>
            <h1 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white">
              {user.email}
            </h1>
          </div>
          <div className="flex gap-3 items-center">
            <Link
              href="/blood-engine/account"
              className="font-heading tracking-wider uppercase text-sm text-foreground-muted hover:text-off-white"
            >
              Account
            </Link>
            <Button href="/blood-engine/new" size="lg">
              New report
            </Button>
          </div>
        </div>

        {reports.length > 0 ? (
          <div className="mb-8 grid sm:grid-cols-2 gap-3">
            <UsageBadge
              label="Interpretations"
              today={pickDay(interpretHeadroom)}
              hour={pickHour(interpretHeadroom)}
            />
            <UsageBadge
              label="PDF extractions"
              today={pickDay(pdfHeadroom)}
              hour={pickHour(pdfHeadroom)}
            />
          </div>
        ) : null}

        {reports.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-background-elevated p-12 text-center">
            <h2 className="font-heading uppercase text-off-white text-3xl mb-4">
              No reports yet
            </h2>
            <p className="text-foreground-muted max-w-xl mx-auto mb-8">
              Kick off your first interpretation. You&apos;ll need your latest blood-test PDF — or just the
              values. Either way takes a few minutes.
            </p>
            <Button href="/blood-engine/new" size="lg">
              Run your first report
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => {
              const interp = r.interpretation as InterpretationJSON | null;
              const status = interp?.overall_status ?? "suboptimal";
              return (
                <Link
                  key={r.id}
                  href={`/blood-engine/report/${r.id}`}
                  className="block rounded-lg border border-white/10 bg-background-elevated p-6 hover:border-coral/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div className="flex items-center gap-4">
                      <StatusDot status={status} />
                      <div>
                        <p className="font-heading uppercase text-off-white text-xl">
                          Report #{r.id}
                        </p>
                        <p className="text-sm text-foreground-subtle">
                          Draw date: {r.drawDate ?? "—"} · Ran:{" "}
                          {r.createdAt?.toLocaleDateString?.() ?? ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-[240px]">
                      <p className="text-foreground-muted line-clamp-2">
                        {interp?.summary ?? "Interpretation not available."}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {reports.length >= 2 ? (
          <div className="mt-12">
            <CompareLauncher
              reports={reports.map((r) => ({
                id: r.id,
                drawDate: r.drawDate,
                createdAt: r.createdAt?.toISOString() ?? null,
              }))}
            />
          </div>
        ) : null}

        {trends.length > 0 ? (
          <div className="mt-16">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-heading uppercase text-off-white text-3xl">
                What&apos;s moving
              </h2>
              <p className="text-sm text-foreground-subtle">
                Across {reports.length} reports · green band = athlete-optimal
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trends.map((t) => (
                <MarkerTrendCard key={t.markerId} trend={t} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-16">
          <MedicalDisclaimer variant="muted" />
        </div>
      </Container>
    </Section>
  );
}

function StatusDot({ status }: { status: "optimal" | "suboptimal" | "flag" }) {
  const color =
    status === "optimal" ? "bg-emerald-500" : status === "suboptimal" ? "bg-amber-400" : "bg-coral";
  return <span className={`inline-block w-4 h-4 rounded-full ${color}`} aria-label={status} />;
}

type Headroom = Awaited<ReturnType<typeof getRemainingHeadroom>>[number];

function pickDay(arr: Headroom[]): Headroom | undefined {
  return arr.find((h) => h.windowLabel === "day");
}
function pickHour(arr: Headroom[]): Headroom | undefined {
  return arr.find((h) => h.windowLabel === "hour");
}

function UsageBadge({
  label,
  today,
  hour,
}: {
  label: string;
  today?: Headroom;
  hour?: Headroom;
}) {
  if (!today && !hour) return null;
  const main = today ?? hour;
  if (!main) return null;
  const pct = main.used / main.max;
  const color =
    pct >= 1 ? "text-coral" : pct >= 0.7 ? "text-amber-300" : "text-emerald-400";
  return (
    <div className="rounded-lg border border-white/10 bg-background-elevated px-4 py-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-heading uppercase tracking-wider text-foreground-subtle">
          {label}
        </p>
        <p className={`font-heading text-xl tabular-nums ${color}`}>
          {main.remaining} <span className="text-foreground-subtle text-xs">/ {main.max}</span>
        </p>
      </div>
      <div className="text-right text-[11px] text-foreground-subtle">
        <p>left today</p>
        {hour && hour.used > 0 ? (
          <p>
            {hour.remaining}/{hour.max} this hour
          </p>
        ) : null}
      </div>
    </div>
  );
}
