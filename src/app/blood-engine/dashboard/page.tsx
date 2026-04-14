import Link from "next/link";
import { Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { listReports } from "@/lib/blood-engine/db";
import type { InterpretationJSON } from "@/lib/blood-engine/schemas";
import { BLOOD_ENGINE_DISCLAIMER } from "../../../../content/blood-engine/disclaimer";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireBloodEngineAccess();
  const reports = await listReports(user.id);

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
          <Button href="/blood-engine/new" size="lg">
            New report
          </Button>
        </div>

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

        <div className="mt-16 border border-coral/20 bg-coral-muted rounded-lg p-6 text-sm text-off-white/90">
          {BLOOD_ENGINE_DISCLAIMER}
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
