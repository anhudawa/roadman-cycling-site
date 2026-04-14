import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { getReport } from "@/lib/blood-engine/db";
import { getMarker, MARKERS, type MarkerId } from "@/lib/blood-engine/markers";
import type {
  InterpretationJSON,
  NormalizedMarkerValue,
  ReportContext,
} from "@/lib/blood-engine/schemas";
import { MedicalDisclaimer } from "../MedicalDisclaimer";

export const dynamic = "force-dynamic";

/**
 * Side-by-side comparison of two of a user's reports.
 *
 *   /blood-engine/compare?ids=12,17
 *
 * The order in `ids` is preserved (left = older / baseline, right = newer /
 * follow-up by convention). Marker rows show value + change + direction.
 */
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const user = await requireBloodEngineAccess();
  const params = await searchParams;
  const idsRaw = params.ids ?? "";
  const ids = idsRaw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);

  if (ids.length !== 2) {
    redirect("/blood-engine/dashboard");
  }

  const [a, b] = await Promise.all([
    getReport(ids[0], user.id),
    getReport(ids[1], user.id),
  ]);
  if (!a || !b) notFound();

  const aResults = (a.results ?? []) as NormalizedMarkerValue[];
  const bResults = (b.results ?? []) as NormalizedMarkerValue[];
  const aInterp = a.interpretation as InterpretationJSON | null;
  const bInterp = b.interpretation as InterpretationJSON | null;
  const aCtx = a.context as ReportContext;
  const bCtx = b.context as ReportContext;

  // Build a unified marker list — only include markers present in at least one
  // report, keep canonical order from MARKERS.
  const presentIds = new Set<MarkerId>();
  for (const r of [...aResults, ...bResults]) presentIds.add(r.markerId);

  const aBy = mapById(aResults);
  const bBy = mapById(bResults);
  const aStatus = statusMap(aInterp);
  const bStatus = statusMap(bInterp);

  return (
    <Section background="deep-purple">
      <Container>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="font-heading tracking-[0.3em] text-coral text-sm mb-2">
              Compare reports
            </p>
            <h1 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white">
              Report #{a.id} vs #{b.id}
            </h1>
          </div>
          <Button href="/blood-engine/dashboard" variant="ghost">
            ← Dashboard
          </Button>
        </div>

        {/* ── Header strip: one column per report ─────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <ReportHeaderCard
            id={a.id}
            label="Earlier"
            drawDate={a.drawDate}
            ctx={aCtx}
            interp={aInterp}
          />
          <ReportHeaderCard
            id={b.id}
            label="Later"
            drawDate={b.drawDate}
            ctx={bCtx}
            interp={bInterp}
          />
        </div>

        {/* ── Marker comparison table ─────────────────────────────── */}
        <div className="rounded-lg border border-white/10 bg-background-elevated overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/10 text-xs font-heading uppercase tracking-wider text-foreground-subtle">
            <div className="col-span-4">Marker</div>
            <div className="col-span-3 text-right">#{a.id}</div>
            <div className="col-span-3 text-right">#{b.id}</div>
            <div className="col-span-2 text-right">Δ</div>
          </div>
          <div className="divide-y divide-white/5">
            {MARKERS.filter((m) => presentIds.has(m.id)).map((m) => {
              const av = aBy.get(m.id);
              const bv = bBy.get(m.id);
              return (
                <CompareRow
                  key={m.id}
                  markerId={m.id}
                  a={av}
                  b={bv}
                  aStatus={aStatus.get(m.id) ?? null}
                  bStatus={bStatus.get(m.id) ?? null}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <Button href={`/blood-engine/report/${a.id}`} variant="ghost">
            Open report #{a.id} →
          </Button>
          <Button href={`/blood-engine/report/${b.id}`} variant="ghost">
            Open report #{b.id} →
          </Button>
        </div>

        <div className="mt-12">
          <MedicalDisclaimer variant="muted" />
        </div>
      </Container>
    </Section>
  );
}

function mapById(rs: NormalizedMarkerValue[]): Map<MarkerId, NormalizedMarkerValue> {
  const out = new Map<MarkerId, NormalizedMarkerValue>();
  for (const r of rs) out.set(r.markerId, r);
  return out;
}

function statusMap(interp: InterpretationJSON | null): Map<string, "optimal" | "suboptimal" | "flag"> {
  const out = new Map<string, "optimal" | "suboptimal" | "flag">();
  for (const m of interp?.markers ?? []) out.set(m.markerId, m.status);
  return out;
}

function ReportHeaderCard({
  id,
  label,
  drawDate,
  ctx,
  interp,
}: {
  id: number;
  label: string;
  drawDate: string | null;
  ctx: ReportContext;
  interp: InterpretationJSON | null;
}) {
  const status = interp?.overall_status ?? null;
  const statusColor =
    status === "optimal"
      ? "bg-emerald-500"
      : status === "suboptimal"
        ? "bg-amber-400"
        : status === "flag"
          ? "bg-coral"
          : "bg-mid-grey";
  return (
    <Link
      href={`/blood-engine/report/${id}`}
      className="block rounded-lg border border-white/10 bg-background-elevated p-5 hover:border-coral/40 transition-colors"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className={`inline-block w-3 h-3 rounded-full ${statusColor}`} />
        <p className="font-heading uppercase text-xs tracking-wider text-foreground-subtle">
          {label} · #{id}
        </p>
      </div>
      <p className="text-off-white text-sm mb-1">Drawn {drawDate ?? "—"}</p>
      <p className="text-foreground-subtle text-xs">
        {ctx.trainingHoursPerWeek}h/wk · {ctx.trainingPhase} · age {ctx.age}
      </p>
    </Link>
  );
}

function CompareRow({
  markerId,
  a,
  b,
  aStatus,
  bStatus,
}: {
  markerId: MarkerId;
  a?: NormalizedMarkerValue;
  b?: NormalizedMarkerValue;
  aStatus: "optimal" | "suboptimal" | "flag" | null;
  bStatus: "optimal" | "suboptimal" | "flag" | null;
}) {
  const m = getMarker(markerId);

  let delta: number | null = null;
  let pct: number | null = null;
  if (a && b && Number.isFinite(a.canonicalValue) && Number.isFinite(b.canonicalValue)) {
    delta = b.canonicalValue - a.canonicalValue;
    pct = a.canonicalValue !== 0 ? (delta / a.canonicalValue) * 100 : null;
  }
  const arrow = delta === null ? "—" : delta > 0 ? "↑" : delta < 0 ? "↓" : "·";

  return (
    <div className="grid grid-cols-12 gap-3 px-5 py-3 items-center text-sm">
      <div className="col-span-4">
        <p className="font-heading uppercase text-off-white">{m.displayName}</p>
        <p className="text-[11px] text-foreground-subtle">{m.canonicalUnit}</p>
      </div>
      <div className="col-span-3 text-right tabular-nums">
        <ValueCell value={a?.canonicalValue} status={aStatus} />
      </div>
      <div className="col-span-3 text-right tabular-nums">
        <ValueCell value={b?.canonicalValue} status={bStatus} />
      </div>
      <div className="col-span-2 text-right tabular-nums">
        {delta !== null ? (
          <span
            className={
              "font-heading " +
              (delta > 0 ? "text-emerald-400" : delta < 0 ? "text-coral" : "text-foreground-muted")
            }
          >
            {arrow} {Math.abs(delta).toFixed(Math.abs(delta) >= 10 ? 0 : 1)}
            {pct !== null ? (
              <span className="text-foreground-subtle text-[11px] block">
                {pct > 0 ? "+" : ""}
                {pct.toFixed(0)}%
              </span>
            ) : null}
          </span>
        ) : (
          <span className="text-foreground-subtle">—</span>
        )}
      </div>
    </div>
  );
}

function ValueCell({
  value,
  status,
}: {
  value: number | undefined;
  status: "optimal" | "suboptimal" | "flag" | null;
}) {
  if (value === undefined || !Number.isFinite(value)) {
    return <span className="text-foreground-subtle">—</span>;
  }
  const color =
    status === "optimal"
      ? "text-emerald-400"
      : status === "suboptimal"
        ? "text-amber-300"
        : status === "flag"
          ? "text-coral"
          : "text-off-white";
  return (
    <span className={color}>{value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)}</span>
  );
}
