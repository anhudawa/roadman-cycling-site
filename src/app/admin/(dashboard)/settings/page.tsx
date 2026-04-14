import { requireAdmin } from "@/lib/admin/auth";
import { listAllTeamUsers } from "@/lib/admin/team-users";
import { db } from "@/lib/db";
import { sql as drizzleSql } from "drizzle-orm";
import { TeamUsersPanel } from "./_components/TeamUsersPanel";
import { CustomFieldsPanel } from "./_components/CustomFieldsPanel";
import { listFieldDefs } from "@/lib/crm/custom-fields";
import { automationsDisabled } from "@/lib/crm/automations";

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
    </div>
  );
}
