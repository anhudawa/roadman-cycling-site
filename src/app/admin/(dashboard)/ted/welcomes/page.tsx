import { db } from "@/lib/db";
import { tedWelcomeQueue } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  pending: { label: "pending", cls: "bg-white/10 text-foreground-subtle" },
  drafted: { label: "drafted", cls: "bg-blue-500/10 text-blue-300" },
  approved: { label: "approved", cls: "bg-emerald-500/10 text-emerald-300" },
  posted: { label: "posted", cls: "bg-emerald-500/15 text-emerald-200" },
  failed: { label: "failed", cls: "bg-coral/10 text-coral" },
  skipped: { label: "skipped", cls: "bg-yellow-500/10 text-yellow-300" },
};

function statusPill(status: string): { label: string; cls: string } {
  return STATUS_PILL[status] ?? { label: status, cls: "bg-white/10 text-foreground-subtle" };
}

export default async function TedWelcomesPage() {
  await requireAuth();

  const rows = await db
    .select()
    .from(tedWelcomeQueue)
    .orderBy(desc(tedWelcomeQueue.createdAt))
    .limit(100);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ted — welcome queue</h1>
        <p className="text-sm text-foreground-subtle">
          New-member welcome pipeline. Status flows: pending → drafted → posted.
          Welcomes are not pre-approved (per spec); voice-check must pass before
          they advance to posting.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-md bg-white/5 border border-white/10 p-6 text-sm text-foreground-subtle">
          No welcome entries yet. New members joining the Skool Clubhouse hit
          the webhook and land here.
        </div>
      ) : (
        <div className="rounded-md bg-white/5 border border-white/10 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-foreground-subtle uppercase tracking-wide">
                <th className="text-left p-2">Joined</th>
                <th className="text-left p-2">Member</th>
                <th className="text-left p-2">Persona</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Draft body / error</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pill = statusPill(r.status);
                return (
                  <tr key={r.memberEmail} className="border-t border-white/5 align-top">
                    <td className="p-2 font-mono text-foreground-subtle whitespace-nowrap">
                      {r.createdAt?.toISOString().slice(0, 10) ?? "—"}
                    </td>
                    <td className="p-2">
                      <div className="text-white">{r.firstName || "(no name)"}</div>
                      <div className="font-mono text-[10px] text-foreground-subtle">
                        {r.memberEmail}
                      </div>
                    </td>
                    <td className="p-2 text-foreground-subtle">{r.persona ?? "—"}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded-full ${pill.cls}`}>
                        {pill.label}
                      </span>
                    </td>
                    <td className="p-2 text-foreground-subtle max-w-xl">
                      {r.failureReason ? (
                        <code className="text-coral">{r.failureReason}</code>
                      ) : r.draftBody ? (
                        <pre className="font-sans text-xs whitespace-pre-wrap">{r.draftBody}</pre>
                      ) : (
                        "—"
                      )}
                      {r.skoolPostUrl ? (
                        <a
                          href={r.skoolPostUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block mt-1 text-blue-300 hover:underline"
                        >
                          View on Skool →
                        </a>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
