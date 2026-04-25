import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/admin/auth";
import { getRule, listRuns } from "@/lib/crm/automations";
import { RuleBuilder, type RuleDraft } from "../_components/RuleBuilder";

export const dynamic = "force-dynamic";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusColor(s: string): string {
  if (s === "success") return "text-green-300 bg-green-500/10 border-green-500/20";
  if (s === "partial") return "text-amber-300 bg-amber-500/10 border-amber-500/20";
  return "text-red-300 bg-red-500/10 border-red-500/20";
}

export default async function AutomationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) notFound();

  const rule = await getRule(id);
  if (!rule) notFound();
  const runs = await listRuns(id, 50);

  const draft: RuleDraft = {
    id: rule.id,
    name: rule.name,
    active: rule.active,
    triggerType: rule.triggerType as RuleDraft["triggerType"],
    triggerConfig: (rule.triggerConfig ?? {}) as RuleDraft["triggerConfig"],
    actions: (Array.isArray(rule.actions) ? rule.actions : []).map((a) => ({
      type: a.type,
      config: a.config as Record<string, string | number | undefined>,
    })),
    maxRunsPerDay: rule.maxRunsPerDay ?? 0,
    dedupeWindowMinutes: rule.dedupeWindowMinutes ?? 0,
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/automations" className="text-xs text-foreground-subtle hover:text-accent">
          $Üê Automations
        </Link>
        <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase mt-2">
          {rule.name}
        </h1>
        <p className="text-xs text-foreground-subtle mt-1">
          Created {formatWhen(rule.createdAt.toISOString())} $∑ {rule.runCount} runs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RuleBuilder mode="edit" initial={draft} />
        </div>

        <div className="bg-background-elevated border border-white/5 rounded-lg p-4">
          <h3 className="font-heading text-sm text-off-white tracking-wider uppercase mb-3">
            Recent runs
          </h3>
          {runs.length === 0 ? (
            <p className="text-xs text-foreground-subtle">No runs yet.</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {runs.map((r) => {
                const result = r.result as { actions?: Array<{ type: string; status: string; message?: string }> } | null;
                return (
                  <div key={r.id} className="bg-background-deep border border-white/5 rounded p-2.5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-1.5 py-0.5 rounded border text-[10px] uppercase tracking-wider ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                      <span className="text-foreground-subtle">{formatWhen(r.createdAt.toISOString())}</span>
                    </div>
                    {result?.actions && result.actions.length > 0 && (
                      <ul className="space-y-0.5 mt-1">
                        {result.actions.map((a, i) => (
                          <li key={i} className="text-foreground-muted">
                            <span className="text-accent">{a.type}</span>: {a.status}
                            {a.message ? ` $Äî ${a.message}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                    {r.error && <p className="text-red-300 mt-1">{r.error}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
