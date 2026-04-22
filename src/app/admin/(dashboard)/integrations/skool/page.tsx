import { requireAuth } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { skoolEvents } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";
import { TestWebhookButton } from "./TestWebhookButton";

export const dynamic = "force-dynamic";

function fmt(ts: Date | string | null): string {
  if (!ts) return "—";
  const d = typeof ts === "string" ? new Date(ts) : ts;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ago(ts: Date | string | null): string {
  if (!ts) return "never";
  const d = typeof ts === "string" ? new Date(ts) : ts;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function SkoolIntegrationPage() {
  await requireAuth();

  const secretConfigured = Boolean(process.env.SKOOL_WEBHOOK_SECRET);
  const beehiivConfigured = Boolean(
    process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID
  );

  const [
    [counts],
    recent,
    [latestOk],
  ] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        day: sql<number>`count(*) filter (where created_at > now() - interval '24 hours')::int`,
        week: sql<number>`count(*) filter (where created_at > now() - interval '7 days')::int`,
        month: sql<number>`count(*) filter (where created_at > now() - interval '30 days')::int`,
        accepted: sql<number>`count(*) filter (where status = 'accepted')::int`,
        errors: sql<number>`count(*) filter (where status = 'error')::int`,
        skipped: sql<number>`count(*) filter (where status = 'skipped')::int`,
      })
      .from(skoolEvents),
    db
      .select()
      .from(skoolEvents)
      .orderBy(desc(skoolEvents.createdAt))
      .limit(50),
    db
      .select({ createdAt: skoolEvents.createdAt })
      .from(skoolEvents)
      .where(sql`status = 'accepted'`)
      .orderBy(desc(skoolEvents.createdAt))
      .limit(1),
  ]);

  const lastAccepted = latestOk?.createdAt ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          SKOOL CLUBHOUSE
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Every webhook payload is logged here so you can prove signups are
          landing — even if Zapier / Skool sends a malformed body.
        </p>
      </div>

      {/* Health pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <HealthCard
          label="Webhook secret"
          value={secretConfigured ? "Configured" : "Missing"}
          ok={secretConfigured}
        />
        <HealthCard
          label="Beehiiv bridge"
          value={beehiivConfigured ? "Configured" : "Missing"}
          ok={beehiivConfigured}
        />
        <HealthCard
          label="Last accepted signup"
          value={lastAccepted ? ago(lastAccepted) : "never"}
          ok={Boolean(lastAccepted)}
        />
        <HealthCard
          label="Total events logged"
          value={String(counts?.total ?? 0)}
          ok={(counts?.total ?? 0) > 0}
        />
      </div>

      {/* Volume */}
      <div className="bg-background-elevated rounded-xl border border-white/5 p-4">
        <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-3">
          Volume
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-sm">
          <Metric label="Last 24h" value={counts?.day ?? 0} />
          <Metric label="Last 7d" value={counts?.week ?? 0} />
          <Metric label="Last 30d" value={counts?.month ?? 0} />
          <Metric label="Accepted" value={counts?.accepted ?? 0} tone="ok" />
          <Metric label="Skipped" value={counts?.skipped ?? 0} tone="warn" />
          <Metric label="Errors" value={counts?.errors ?? 0} tone="err" />
        </div>
      </div>

      {/* Smoke test */}
      <div className="bg-background-elevated rounded-xl border border-white/5 p-4">
        <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-3">
          Smoke test
        </p>
        <TestWebhookButton />
        <p className="text-foreground-subtle text-xs mt-3">
          &quot;Send test webhook&quot; uses your admin session to attach the
          configured secret server-side (same path a real Skool / Zapier call
          would take). &quot;Send unauthenticated&quot; proves the secret is
          enforced — it should land in the table below with status
          <span className="text-[var(--color-bad)]"> error · unauthorized</span>.
        </p>
      </div>

      {/* Setup instructions */}
      <details className="bg-background-elevated rounded-xl border border-white/5 p-4">
        <summary className="cursor-pointer text-off-white text-sm font-heading tracking-wider uppercase">
          How to connect Skool →
        </summary>
        <div className="mt-4 text-sm text-foreground-muted space-y-3">
          <p>
            Skool&apos;s native webhooks live at
            <span className="text-off-white"> Community → Settings → Webhooks</span>.
            Add:
          </p>
          <pre className="bg-background-deep border border-white/10 rounded p-3 text-xs text-off-white overflow-x-auto">
POST https://roadmancycling.com/api/skool-webhook?secret=$SKOOL_WEBHOOK_SECRET
event: member.joined, member.created
          </pre>
          <p>
            If you&apos;re piping via Zapier, use the
            <span className="text-off-white"> &quot;Webhooks by Zapier&quot; → POST</span>
            action. Body must contain at least <code>email</code>. Auth can be:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Header <code>Authorization: Bearer $SKOOL_WEBHOOK_SECRET</code>
            </li>
            <li>
              Header <code>X-Webhook-Secret: $SKOOL_WEBHOOK_SECRET</code>
            </li>
            <li>
              Or query <code>?secret=$SKOOL_WEBHOOK_SECRET</code>
            </li>
          </ul>
          <p>
            To smoke-test:{" "}
            <code className="text-off-white text-xs">
              curl -X POST {'https://roadmancycling.com/api/skool-webhook?secret=…'} -H
              &apos;Content-Type: application/json&apos; -d &apos;{`{"email":"you@roadman.com","name":"Test"}`}&apos;
            </code>{" "}
            then refresh this page.
          </p>
        </div>
      </details>

      {/* Recent events */}
      <div className="bg-background-elevated rounded-xl border border-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center">
          <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
            Recent events ({recent.length})
          </p>
          <span className="ml-auto text-[10px] text-foreground-subtle">
            Click a row to see the raw payload
          </span>
        </div>
        {recent.length === 0 ? (
          <div className="px-4 py-12 text-center text-foreground-subtle text-sm">
            No webhook calls yet. Send a test from the Smoke test block above,
            or wire Zapier to the URL in the setup instructions.
          </div>
        ) : (
          <div>
            {recent.map((e) => (
              <details
                key={e.id}
                className="border-b border-white/[0.03] group [&_summary]:list-none"
              >
                <summary className="cursor-pointer px-4 py-2 hover:bg-white/[0.02] grid grid-cols-12 gap-3 items-center text-sm">
                  <span
                    className="col-span-2 text-foreground-muted whitespace-nowrap"
                    title={fmt(e.createdAt)}
                  >
                    {ago(e.createdAt)}
                  </span>
                  <span className="col-span-1">
                    <StatusPill status={e.status} />
                  </span>
                  <span className="col-span-2 text-foreground-muted whitespace-nowrap truncate">
                    {e.eventType}
                  </span>
                  <span className="col-span-2 text-foreground-muted whitespace-nowrap truncate">
                    {e.source}
                  </span>
                  <span className="col-span-3 text-off-white whitespace-nowrap truncate">
                    {e.email ?? "—"}
                  </span>
                  <span className="col-span-1 text-foreground-muted whitespace-nowrap truncate">
                    {e.persona ?? "—"}
                  </span>
                  <span className="col-span-1 text-foreground-subtle text-[10px] text-right group-open:rotate-90 transition-transform">
                    ▸
                  </span>
                </summary>
                <div className="px-4 pb-4 space-y-2">
                  {e.errorMessage && (
                    <div className="text-xs text-[var(--color-bad)] bg-[var(--color-bad-tint)] border border-[var(--color-border-strong)] rounded p-2">
                      {e.errorMessage}
                    </div>
                  )}
                  {e.name && (
                    <p className="text-[10px] text-foreground-subtle uppercase tracking-widest">
                      Name: <span className="text-off-white normal-case">{e.name}</span>
                    </p>
                  )}
                  <div>
                    <p className="text-[10px] text-foreground-subtle uppercase tracking-widest mb-1">
                      Raw payload
                    </p>
                    <pre className="bg-background-deep border border-white/10 rounded p-3 text-[11px] text-off-white overflow-x-auto max-h-64">
{JSON.stringify(e.rawPayload ?? {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HealthCard({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="bg-background-elevated border border-white/5 rounded-xl p-4">
      <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-xl font-heading tracking-wide ${
          ok ? "text-green-400" : "text-[var(--color-bad)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "ok" | "warn" | "err";
}) {
  const color =
    tone === "ok"
      ? "text-green-400"
      : tone === "warn"
        ? "text-yellow-400"
        : tone === "err"
          ? "text-[var(--color-bad)]"
          : "text-off-white";
  return (
    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <p className="text-[10px] uppercase tracking-widest text-foreground-subtle mb-1">
        {label}
      </p>
      <p className={`text-xl font-heading tracking-wide ${color}`}>{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "accepted"
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : status === "skipped"
        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
        : "bg-[var(--color-bad-tint)] text-[var(--color-bad)] border-[var(--color-border-strong)]";
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  );
}
