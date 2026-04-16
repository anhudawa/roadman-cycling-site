import { requireAdmin } from "@/lib/admin/auth";
import { listAllTeamUsers } from "@/lib/admin/team-users";
import { db } from "@/lib/db";
import { sql as drizzleSql } from "drizzle-orm";
import { TeamUsersPanel } from "./_components/TeamUsersPanel";
import { CustomFieldsPanel } from "./_components/CustomFieldsPanel";
import { IntegrationsPanel } from "./_components/IntegrationsPanel";
import { listFieldDefs } from "@/lib/crm/custom-fields";
import { automationsDisabled } from "@/lib/crm/automations";
import { listCronRuns } from "@/lib/crm/cron-runs";
import { syncRuns } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { CronHealthPanel, type CronKindRow } from "./_components/CronHealthPanel";

export const dynamic = "force-dynamic";

type PillColor = "green" | "red" | "yellow";

interface HealthRow {
  variable: string;
  status: "ok" | "missing" | "info";
  notes: string;
}

function pillClass(color: PillColor): string {
  if (color === "green") return "bg-emerald-500/10 text-emerald-300";
  if (color === "red") return "bg-red-500/10 text-red-300";
  return "bg-amber-500/10 text-amber-300";
}

function envPresent(name: string): HealthRow {
  const val = process.env[name];
  const present = typeof val === "string" && val.length > 0;
  return {
    variable: name,
    status: present ? "ok" : "missing",
    notes: present ? "present" : "not set",
  };
}

async function dbHealth(): Promise<HealthRow> {
  try {
    await db.execute(drizzleSql`SELECT 1`);
    return { variable: "Database reachability", status: "ok", notes: "SELECT 1 succeeded" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { variable: "Database reachability", status: "missing", notes: msg };
  }
}

function rowPill(status: HealthRow["status"]): { label: string; color: PillColor } {
  if (status === "ok") return { label: "OK", color: "green" };
  if (status === "missing") return { label: "MISSING", color: "red" };
  return { label: "INFO", color: "yellow" };
}

export default async function SettingsPage() {
  const currentUser = await requireAdmin();
  const users = await listAllTeamUsers();
  const customFieldDefsList = await listFieldDefs();

  const envChecks: HealthRow[] = [
    envPresent("RESEND_API_KEY"),
    envPresent("RESEND_WEBHOOK_SECRET"),
    envPresent("CRON_SECRET"),
    envPresent("AUTH_SECRET"),
    envPresent("POSTGRES_URL"),
    envPresent("ANTHROPIC_API_KEY"),
    envPresent("BLOB_READ_WRITE_TOKEN"),
    envPresent("BEEHIIV_API_KEY"),
    envPresent("BEEHIIV_PUBLICATION_ID"),
    envPresent("STRIPE_SECRET_KEY"),
    envPresent("SKOOL_WEBHOOK_SECRET"),
  ];
  const database = await dbHealth();

  const automationsKilled = automationsDisabled();
  const automationsRow: HealthRow = {
    variable: "Automations engine",
    status: automationsKilled ? "missing" : "ok",
    notes: automationsKilled
      ? "GLOBALLY DISABLED via AUTOMATIONS_DISABLED env"
      : "enabled",
  };

  const digestRow: HealthRow = {
    variable: "Daily digest cron",
    status: "info",
    notes: "Not instrumented yet",
  };

  const resendDomainRow: HealthRow = {
    variable: "Resend domain status",
    status: "info",
    notes: "Check Resend dashboard",
  };

  const rows: HealthRow[] = [
    ...envChecks,
    database,
    automationsRow,
    digestRow,
    resendDomainRow,
  ];

  // ── Cron health ──────────────────────────────────────────
  const CRON_KINDS: Array<{ kind: string; label: string; schedule: string }> = [
    { kind: "daily_digest", label: "Daily digest", schedule: "0 8 * * *" },
    { kind: "weekly_digest", label: "Weekly digest", schedule: "0 8 * * 1" },
    { kind: "sync_all", label: "Sync all (Beehiiv+Stripe)", schedule: "0 6 * * *" },
    { kind: "score_all", label: "Lead scoring", schedule: "30 6 * * *" },
    { kind: "complete_past_bookings", label: "Auto-complete past bookings", schedule: "15 * * * *" },
  ];

  function serializeRun(r: {
    id: number;
    status: string;
    result: Record<string, unknown> | null;
    error: string | null;
    startedAt: Date;
    finishedAt: Date | null;
  }) {
    return {
      id: r.id,
      status: r.status,
      result: r.result,
      error: r.error,
      startedAt: r.startedAt.toISOString(),
      finishedAt: r.finishedAt ? r.finishedAt.toISOString() : null,
    };
  }

  function summarizeCron(kind: string, result: Record<string, unknown> | null, error: string | null): string {
    if (error) return error.length > 80 ? error.slice(0, 77) + "..." : error;
    if (!result) return "—";
    if (kind === "daily_digest" || kind === "weekly_digest") {
      const sent = result.sent ?? 0;
      const skipped = result.skipped ?? 0;
      const errs = result.errors ?? 0;
      return `Sent ${sent} / Skipped ${skipped}${errs ? ` / Errors ${errs}` : ""}`;
    }
    if (kind === "score_all") {
      const scored = result.scored ?? "?";
      const errs = result.errorCount ?? 0;
      return `Scored ${scored}${errs ? ` / Errors ${errs}` : ""}`;
    }
    if (kind === "sync_all") {
      const errs = result.errorCount ?? 0;
      return errs ? `Errors ${errs}` : "OK";
    }
    if (kind === "complete_past_bookings") {
      const completed = result.completed ?? 0;
      return `Completed ${completed}`;
    }
    return "OK";
  }

  const cronRows: CronKindRow[] = [];
  for (const c of CRON_KINDS) {
    const history = await listCronRuns({
      kind: c.kind as
        | "daily_digest"
        | "weekly_digest"
        | "sync_all"
        | "score_all"
        | "complete_past_bookings",
      limit: 10,
    });
    const latest = history[0] ?? null;
    cronRows.push({
      kind: c.kind,
      label: c.label,
      schedule: c.schedule,
      latest: latest ? serializeRun(latest) : null,
      history: history.map(serializeRun),
      summary: latest ? summarizeCron(c.kind, latest.result, latest.error) : "Never",
    });
  }

  // Also include sync_runs (beehiiv/stripe) side-by-side
  for (const source of ["beehiiv", "stripe"] as const) {
    try {
      const history = await db
        .select()
        .from(syncRuns)
        .where(eq(syncRuns.source, source))
        .orderBy(desc(syncRuns.startedAt))
        .limit(10);
      const latest = history[0] ?? null;
      const toRow = (r: typeof syncRuns.$inferSelect) => ({
        id: r.id,
        status: r.status,
        result: (r.result as unknown) as Record<string, unknown> | null,
        error: r.error,
        startedAt: r.startedAt.toISOString(),
        finishedAt: r.finishedAt ? r.finishedAt.toISOString() : null,
      });
      let summary = "Never";
      if (latest) {
        if (latest.error) {
          summary = latest.error.slice(0, 80);
        } else if (latest.result) {
          const res = latest.result as { scanned?: number; created?: number; updated?: number; errors?: number };
          summary = `Scanned ${res.scanned ?? 0} / Created ${res.created ?? 0} / Updated ${res.updated ?? 0}${res.errors ? ` / Errors ${res.errors}` : ""}`;
        } else {
          summary = "OK";
        }
      }
      cronRows.push({
        kind: `sync_${source}`,
        label: `Sync: ${source}`,
        schedule: "via sync_all",
        latest: latest ? toRow(latest) : null,
        history: history.map(toRow),
        summary,
      });
    } catch {
      cronRows.push({
        kind: `sync_${source}`,
        label: `Sync: ${source}`,
        schedule: "via sync_all",
        latest: null,
        history: [],
        summary: "Never",
      });
    }
  }

  const serializedUsers = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    slug: u.slug,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
  }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase">Settings</h1>
        <p className="text-sm text-foreground-muted mt-1">
          System health, team user management, and operational safety controls.
        </p>
      </div>

      <CronHealthPanel rows={cronRows} />

      <section>
        <h2 className="font-heading text-sm uppercase tracking-widest text-off-white mb-3">
          System Health
        </h2>
        <div className="bg-background-elevated border border-white/5 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
                <th className="px-4 py-3">Variable</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pill = rowPill(r.status);
                return (
                  <tr key={r.variable} className="border-b border-white/5">
                    <td className="px-4 py-3 text-off-white font-medium">{r.variable}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${pillClass(
                          pill.color
                        )}`}
                      >
                        {pill.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted text-xs">{r.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <TeamUsersPanel initial={serializedUsers} currentUserId={currentUser.id} />
      </section>

      <section>
        <CustomFieldsPanel initial={customFieldDefsList} />
      </section>

      <section>
        <IntegrationsPanel />
      </section>
    </div>
  );
}
