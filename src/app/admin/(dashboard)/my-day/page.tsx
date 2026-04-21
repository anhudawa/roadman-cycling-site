import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { getMyDayData } from "@/lib/crm/dashboard";
import { STAGE_COLORS, STAGE_LABELS, isApplicationStage } from "@/lib/crm/pipeline";
import { TaskCompleteCheckbox } from "./_components/TaskCompleteCheckbox";
import { SendTestDigestButton } from "./_components/SendTestDigestButton";
import { TaskRequests } from "./_components/TaskRequests";
import { listAllTeamUsers } from "@/lib/admin/team-users";
import {
  Card,
  CardBody,
  EmptyState,
  PageHeader,
  Pill,
  SectionLabel,
  StatTile,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "never";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function emailStatusTone(status: string): "good" | "bad" | "warn" | "neutral" {
  switch (status) {
    case "sent":
    case "delivered":
      return "good";
    case "failed":
    case "bounced":
    case "complained":
      return "bad";
    case "queued":
      return "warn";
    default:
      return "neutral";
  }
}

function activityIcon(type: string): string {
  switch (type) {
    case "email_sent":
      return "✉";
    case "note":
      return "◉";
    case "call_logged":
      return "☎";
    case "task_completed":
      return "✓";
    case "task_created":
      return "+";
    case "stage_change":
      return "→";
    case "assigned":
      return "@";
    default:
      return "·";
  }
}


export default async function MyDayPage() {
  const user = await requireAuth();
  const [data, allUsers] = await Promise.all([
    getMyDayData(user),
    listAllTeamUsers(),
  ]);
  const teammates = allUsers
    .filter((u) => u.active)
    .map((u) => ({ slug: u.slug, name: u.name, email: u.email }));

  const now = new Date();
  const weekday = now.toLocaleDateString("en-GB", { weekday: "long" });
  const dateStr = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`My Day — ${user.name}`}
        subtitle={`${weekday}, ${dateStr}`}
        actions={<SendTestDigestButton />}
      />

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Open tasks"
          value={data.stats.openTasks}
          href="/admin/tasks?scope=mine&status=open"
        />
        <StatTile
          label="Overdue"
          value={data.stats.overdueTasks}
          href="/admin/tasks?scope=mine&status=open&due=overdue"
          tone={data.stats.overdueTasks > 0 ? "coral" : "neutral"}
        />
        <StatTile
          label="Contacts I own"
          value={data.stats.contactsOwned}
          href={`/admin/contacts?owner=${encodeURIComponent(user.slug)}`}
        />
        <StatTile
          label="Stale (7d+)"
          value={data.stats.staleContacts}
          href={`/admin/contacts?owner=${encodeURIComponent(user.slug)}&stale=1`}
          tone={data.stats.staleContacts > 0 ? "coral" : "neutral"}
        />
      </div>

      {/* Peer-to-peer task requests */}
      <Card>
        <CardBody className="p-6">
          <TaskRequests
            currentUserSlug={user.slug}
            currentUserName={user.name}
            incoming={data.incomingTaskRequests}
            outgoing={data.outgoingTaskRequests}
            teammates={teammates}
          />
        </CardBody>
      </Card>

      {/* Today's bookings */}
      {(data.todayBookings.length > 0 || data.upcomingBookings.length > 0) && (
        <div className="bg-background-elevated border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm tracking-wider uppercase text-foreground-muted">
              Today&apos;s Bookings
            </h2>
            <Link href="/admin/bookings" className="text-xs text-coral hover:underline">
              See all
            </Link>
          </div>
          {data.todayBookings.length === 0 ? (
            <p className="text-sm text-foreground-subtle">
              Nothing today. Next 24h: {data.upcomingBookings.length}.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.todayBookings.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0"
                >
                  <span className="text-xs text-coral tabular-nums font-heading tracking-wider w-14 shrink-0">
                    {new Date(b.scheduledAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="text-sm text-off-white hover:text-coral truncate block"
                    >
                      {b.title}
                    </Link>
                    {b.contactId && (
                      <Link
                        href={`/admin/contacts/${b.contactId}`}
                        className="text-xs text-foreground-muted hover:text-coral"
                      >
                        {b.contactName ?? b.contactEmail}
                      </Link>
                    )}
                  </div>
                  <span className="text-xs text-foreground-subtle shrink-0">
                    {b.durationMinutes}m
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left column ─────────────────────────────── */}
        <div className="space-y-6">
          {/* Today's tasks */}
          <div className="bg-background-elevated border border-white/5 rounded-xl p-6">
            <h2 className="font-heading text-sm tracking-wider uppercase text-foreground-muted mb-4">
              Today&apos;s Tasks
            </h2>
            {data.todaysTasks.length === 0 ? (
              <EmptyState
                icon="✓"
                title="No tasks due today"
                subtitle="Nice. Take a ride."
              />
            ) : (
              <ul className="space-y-2">
                {data.todaysTasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0"
                  >
                    <TaskCompleteCheckbox taskId={t.id} completed={!!t.completedAt} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-off-white truncate">{t.title}</p>
                      {t.contactId && (
                        <Link
                          href={`/admin/contacts/${t.contactId}`}
                          className="text-xs text-foreground-muted hover:text-coral"
                        >
                          {t.contactName ?? t.contactEmail}
                        </Link>
                      )}
                    </div>
                    <span className="text-xs text-foreground-muted tabular-nums">
                      {formatTime(t.dueAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Overdue tasks */}
          {data.overdueTasks.length > 0 && (
            <div className="bg-background-elevated border border-white/5 rounded-xl p-6">
              <h2 className="font-heading text-sm tracking-wider uppercase text-foreground-muted mb-4">
                Overdue
              </h2>
              <ul className="space-y-2">
                {data.overdueTasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0"
                  >
                    <TaskCompleteCheckbox taskId={t.id} completed={!!t.completedAt} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-off-white truncate">{t.title}</p>
                      {t.contactId && (
                        <Link
                          href={`/admin/contacts/${t.contactId}`}
                          className="text-xs text-foreground-muted hover:text-coral"
                        >
                          {t.contactName ?? t.contactEmail}
                        </Link>
                      )}
                    </div>
                    <span className="text-xs text-red-400 tabular-nums">
                      {formatDate(t.dueAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Applications waiting on me */}
          <div className="bg-background-elevated border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-sm tracking-wider uppercase text-foreground-muted">
                Applications Waiting On Me
              </h2>
              <Link
                href="/admin/applications"
                className="text-xs text-coral hover:underline"
              >
                See all
              </Link>
            </div>
            {data.applicationsWaiting.length === 0 ? (
              <EmptyState
                icon="✓"
                title="Nothing waiting"
                subtitle="No cohort applications need your attention."
              />
            ) : (
              <ul className="space-y-2">
                {data.applicationsWaiting.map((a) => {
                  const stage = isApplicationStage(a.status) ? a.status : "awaiting_response";
                  const firstGoal = a.goal.split("\n")[0];
                  return (
                    <li
                      key={a.id}
                      className="py-2 border-b border-white/5 last:border-0"
                    >
                      <Link
                        href={a.contactId ? `/admin/contacts/${a.contactId}` : "/admin/applications"}
                        className="block"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-off-white font-medium truncate">
                            {a.name}
                          </span>
                          <span
                            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${STAGE_COLORS[stage].badge}`}
                          >
                            {STAGE_LABELS[stage]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-foreground-muted">
                          <span>{a.hours}</span>
                          <span className="text-foreground-subtle">·</span>
                          <span className="truncate">{firstGoal}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right column ────────────────────────────── */}
        <div className="space-y-6">
          {/* Recent activity */}
          <div className="bg-background-elevated border border-white/5 rounded-xl p-6">
            <h2 className="font-heading text-sm tracking-wider uppercase text-foreground-muted mb-4">
              Recent Activity (Mine)
            </h2>
            {data.recentActivity.length === 0 ? (
              <EmptyState icon="·" title="No activity yet" />
            ) : (
              <ul className="space-y-1.5">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-1">
                    <span className="text-coral text-sm w-4 text-center shrink-0">
                      {activityIcon(a.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-off-white truncate">{a.title}</p>
                      <Link
                        href={`/admin/contacts/${a.contactId}`}
                        className="text-xs text-foreground-muted hover:text-coral"
                      >
                        {a.contactName ?? a.contactEmail ?? `#${a.contactId}`}
                      </Link>
                    </div>
                    <span className="text-xs text-foreground-subtle shrink-0">
                      {formatRelative(a.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Stale contacts */}
          <div className="bg-background-elevated border border-white/5 rounded-xl p-6">
            <h2 className="font-heading text-sm tracking-wider uppercase text-foreground-muted mb-4">
              Stale Contacts
            </h2>
            {data.staleContacts.length === 0 ? (
              <EmptyState icon="✓" title="All current" />
            ) : (
              <ul className="space-y-1.5">
                {data.staleContacts.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 py-1.5 border-b border-white/5 last:border-0"
                  >
                    <Link
                      href={`/admin/contacts/${c.id}`}
                      className="text-sm text-off-white hover:text-coral truncate"
                    >
                      {c.name ?? c.email}
                    </Link>
                    <span className="text-xs text-amber-400 shrink-0">
                      {formatRelative(c.lastActivityAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent emails */}
          <div className="bg-background-elevated border border-white/5 rounded-xl p-6">
            <h2 className="font-heading text-sm tracking-wider uppercase text-foreground-muted mb-4">
              Recent Emails Sent (Mine)
            </h2>
            {data.recentEmails.length === 0 ? (
              <EmptyState icon="✉" title="No emails sent yet" />
            ) : (
              <ul className="space-y-2">
                {data.recentEmails.map((e) => (
                  <li key={e.id} className="py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-off-white truncate">{e.subject}</p>
                      <Pill tone={emailStatusTone(e.status)}>{e.status}</Pill>
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-0.5">
                      <Link
                        href={`/admin/contacts/${e.contactId}`}
                        className="text-xs text-foreground-muted hover:text-coral truncate"
                      >
                        {e.contactName ?? e.contactEmail}
                      </Link>
                      <span className="text-xs text-foreground-subtle shrink-0">
                        {formatRelative(e.sentAt ?? e.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
