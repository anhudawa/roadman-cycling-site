import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { diagnosticSubmissions } from "@/lib/db/schema";
import { getDiagnosticStats } from "@/lib/diagnostic/store";
import { PROFILE_LABELS, PROFILE_BREAKDOWNS } from "@/lib/diagnostic/profiles";
import { maskEmail } from "@/lib/admin/events-store";
import { isProfile, type Profile } from "@/lib/diagnostic/types";
import { RegenerateButton } from "./RegenerateButton";

/**
 * Admin stats page for the Masters Plateau Diagnostic (§15).
 * Summary counts, breakdown by profile, recent submissions with a
 * link into each individual result page. The regenerate control lives
 * on the per-submission row — it POSTs to the admin-gated regenerate
 * endpoint and reloads.
 */

export const dynamic = "force-dynamic";

const ALL_PROFILES: Profile[] = [
  "underRecovered",
  "polarisation",
  "strengthGap",
  "fuelingDeficit",
];

type FilterTab = "all" | "llm" | "fallback" | "multi" | Profile;

export default async function AdminDiagnosticPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireAuth();
  const stats = await getDiagnosticStats();
  const { filter: rawFilter } = await searchParams;
  const filter: FilterTab =
    rawFilter === "llm" ||
    rawFilter === "fallback" ||
    rawFilter === "multi" ||
    (typeof rawFilter === "string" && isProfile(rawFilter))
      ? (rawFilter as FilterTab)
      : "all";

  // Translate the filter tab into a Drizzle WHERE clause. Kept inline
  // because the table is small enough that a join-style filter helper
  // is over-engineering for four predicates.
  const filterCondition = (() => {
    switch (filter) {
      case "llm":
        return eq(diagnosticSubmissions.generationSource, "llm");
      case "fallback":
        return eq(diagnosticSubmissions.generationSource, "fallback");
      case "multi":
        return eq(diagnosticSubmissions.severeMultiSystem, true);
      case "all":
        return undefined;
      default:
        return eq(diagnosticSubmissions.primaryProfile, filter);
    }
  })();

  const recent = await db
    .select({
      id: diagnosticSubmissions.id,
      slug: diagnosticSubmissions.slug,
      email: diagnosticSubmissions.email,
      primaryProfile: diagnosticSubmissions.primaryProfile,
      secondaryProfile: diagnosticSubmissions.secondaryProfile,
      generationSource: diagnosticSubmissions.generationSource,
      severeMultiSystem: diagnosticSubmissions.severeMultiSystem,
      closeToBreakthrough: diagnosticSubmissions.closeToBreakthrough,
      retakeNumber: diagnosticSubmissions.retakeNumber,
      utmCampaign: diagnosticSubmissions.utmCampaign,
      utmContent: diagnosticSubmissions.utmContent,
      createdAt: diagnosticSubmissions.createdAt,
    })
    .from(diagnosticSubmissions)
    .where(filterCondition ? and(filterCondition) : undefined)
    .orderBy(desc(diagnosticSubmissions.createdAt))
    .limit(50);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Plateau Diagnostic
          </h1>
          <p className="text-sm text-foreground-subtle mt-1">
            Funnel metrics for /plateau. See every submission, which
            profile was assigned, and whether the LLM or the fallback
            rendered.
          </p>
        </div>
        <Link
          href="/plateau"
          className="text-sm rounded-md bg-white/5 border border-white/10 text-white hover:bg-white/10 px-3 py-1.5"
        >
          Open /plateau
        </Link>
      </header>

      {/* ── Top-level counts ────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total submissions" value={stats.total} />
        <StatCard label="Last 7 days" value={stats.last7d} />
        <StatCard label="Last 24 hours" value={stats.last24h} />
        <StatCard
          label="LLM success rate"
          value={`${stats.llmSuccessRate.toFixed(0)}%`}
          hint="Validated outputs from Claude vs total (rest are §9 fallbacks)"
        />
      </section>

      {/* ── Breakdown by profile ───────────────────── */}
      <section className="rounded-md bg-white/5 border border-white/10 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">
          By profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {ALL_PROFILES.map((profile) => {
            const count = stats.byProfile[profile];
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div
                key={profile}
                className="rounded-md bg-white/5 border border-white/10 p-4"
              >
                <p className="text-xs tracking-widest font-heading text-coral mb-2">
                  {PROFILE_LABELS[profile].toUpperCase()}
                </p>
                <p className="text-2xl font-semibold text-white">
                  {count}
                </p>
                <p className="text-xs text-foreground-subtle mt-1">
                  {pct.toFixed(0)}% of total
                </p>
                <p className="text-xs text-foreground-subtle mt-2 leading-relaxed">
                  {PROFILE_BREAKDOWNS[profile].diagnosis.slice(0, 120)}…
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Recent submissions ─────────────────────── */}
      <section className="rounded-md bg-white/5 border border-white/10 p-5">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-white">
            Recent submissions
          </h2>
          <span className="text-xs text-foreground-subtle">
            {stats.last7d} in the last 7 days &middot;{" "}
            <Link
              href="/api/admin/diagnostic/export"
              className="hover:text-coral underline underline-offset-4"
            >
              CSV export
            </Link>
          </span>
        </div>
        {/* Filter tabs. URL-driven so the QA workflow is bookmarkable
            and the back-button works as expected. */}
        <nav className="flex flex-wrap items-center gap-1 mb-4 text-xs">
          <FilterTabLink current={filter} value="all" label="All" />
          <FilterTabLink current={filter} value="llm" label="LLM" />
          <FilterTabLink current={filter} value="fallback" label="Fallback" />
          <FilterTabLink current={filter} value="multi" label="Multi-system" />
          <span className="mx-1 text-foreground-subtle">·</span>
          {ALL_PROFILES.map((p) => (
            <FilterTabLink
              key={p}
              current={filter}
              value={p}
              label={PROFILE_LABELS[p]}
            />
          ))}
        </nav>
        {recent.length === 0 ? (
          <p className="text-sm text-foreground-subtle">
            No submissions match this filter yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-foreground-subtle">
                <tr>
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Profile</th>
                  <th className="py-2 pr-4">Flags</th>
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Campaign</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recent.map((r) => (
                  <tr key={r.id} className="text-foreground-muted">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {r.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-white">
                      {maskEmail(r.email)}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="rounded-full bg-coral/10 text-coral text-xs font-semibold px-2 py-0.5">
                        {PROFILE_LABELS[r.primaryProfile as Profile]}
                      </span>
                      {r.secondaryProfile && (
                        <span className="ml-2 text-xs text-foreground-subtle">
                          +{" "}
                          {PROFILE_LABELS[r.secondaryProfile as Profile]}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2 text-xs">
                        <Badge
                          variant={
                            r.generationSource === "llm"
                              ? "ok"
                              : "warn"
                          }
                        >
                          {r.generationSource === "llm" ? "LLM" : "Fallback"}
                        </Badge>
                        {r.severeMultiSystem && (
                          <Badge variant="alert">multi</Badge>
                        )}
                        {r.closeToBreakthrough && (
                          <Badge variant="info">close</Badge>
                        )}
                        {r.retakeNumber > 1 && (
                          <Badge variant="info">retake #{r.retakeNumber}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {r.utmCampaign ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-xs text-foreground-subtle">
                      {r.utmContent ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-right whitespace-nowrap">
                      <RegenerateButton slug={r.slug} />
                      <span className="mx-2 text-foreground-subtle">·</span>
                      <Link
                        href={`/admin/diagnostic/${r.slug}`}
                        className="text-xs text-coral hover:underline"
                      >
                        QA →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function FilterTabLink({
  current,
  value,
  label,
}: {
  current: FilterTab;
  value: FilterTab;
  label: string;
}) {
  const active = current === value;
  const href = value === "all" ? "/admin/diagnostic" : `/admin/diagnostic?filter=${value}`;
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-coral/10 border border-coral/40 text-coral px-3 py-1 font-semibold"
          : "rounded-full bg-white/5 border border-white/10 text-foreground-muted hover:text-white hover:bg-white/10 px-3 py-1"
      }
    >
      {label}
    </Link>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-md bg-white/5 border border-white/10 p-5">
      <p className="text-xs uppercase tracking-widest text-foreground-subtle mb-2">
        {label}
      </p>
      <p className="text-3xl font-semibold text-white">{value}</p>
      {hint && (
        <p className="text-xs text-foreground-subtle mt-2 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "ok" | "warn" | "alert" | "info";
}) {
  const cls = {
    ok: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    warn: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    alert: "bg-coral/10 text-coral border-coral/30",
    info: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  }[variant];
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${cls}`}
    >
      {children}
    </span>
  );
}
