import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { listRules } from "@/lib/crm/automations";
import { ToggleRule } from "./_components/ToggleRule";

export const dynamic = "force-dynamic";

function triggerSummary(triggerType: string, cfg: Record<string, unknown> | null | undefined): string {
  const c = cfg ?? {};
  if (triggerType === "application.stage_changed") return `Application → ${c.toStage ?? "any"}`;
  if (triggerType === "deal.stage_changed") return `Deal → ${c.toStage ?? "any"}`;
  if (triggerType === "contact.created") return `Contact created${c.source ? ` (source=${c.source})` : ""}`;
  if (triggerType === "contact.lifecycle_changed") return `Lifecycle → ${c.toStage ?? "any"}`;
  return triggerType;
}

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AutomationsPage() {
  await requireAuth();
  const rules = await listRules();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase">Automations</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Rules that fire on CRM events. Send emails, create tasks, tag contacts, ping the team.
          </p>
        </div>
        <Link
          href="/admin/automations/new"
          className="px-4 py-2 bg-coral text-background-deep font-medium rounded text-sm hover:bg-coral/90"
        >
          + New rule
        </Link>
      </div>

      {rules.length === 0 ? (
        <div className="bg-background-elevated border border-white/5 rounded-lg p-8 text-center">
          <p className="text-foreground-muted text-sm">No automation rules yet.</p>
          <Link href="/admin/automations/new" className="inline-block mt-3 text-accent text-sm hover:underline">
            Create your first rule →
          </Link>
        </div>
      ) : (
        <div className="bg-background-elevated border border-white/5 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-subtle">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Trigger</th>
                <th className="px-4 py-3">Actions</th>
                <th className="px-4 py-3">Last run</th>
                <th className="px-4 py-3">Runs</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/automations/${r.id}`} className="text-off-white hover:text-accent font-medium">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {triggerSummary(r.triggerType, r.triggerConfig as Record<string, unknown>)}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {Array.isArray(r.actions) ? r.actions.length : 0}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {formatWhen(r.lastRunAt ? r.lastRunAt.toISOString() : null)}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">{r.runCount}</td>
                  <td className="px-4 py-3">
                    <ToggleRule id={r.id} initial={r.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
