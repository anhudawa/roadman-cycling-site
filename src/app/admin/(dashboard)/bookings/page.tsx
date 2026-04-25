import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { CALENDAR_SCOPE_EMAIL } from "@/lib/admin/google-oauth";
import { fetchOwnerCalendarEvents } from "@/lib/integrations/google-calendar";

export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function BookingsPage() {
  const user = await requireAuth();

  // Gate: only Anthony (admin) sees his Google Calendar. Everyone else gets
  // an explicit "not authorised" screen so Sarah/Matthew don't accidentally
  // bookmark the URL and see a calendar that isn't theirs.
  if (user.email.toLowerCase() !== CALENDAR_SCOPE_EMAIL) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-3">
        <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase">
          Bookings
        </h1>
        <p className="text-foreground-muted text-sm">
          This page shows Anthony&apos;s Google Calendar. It&apos;s private to
          him; ask him to share a specific event if you need one.
        </p>
      </div>
    );
  }

  const { events, needsLink, notConfigured, errorMessage } =
    await fetchOwnerCalendarEvents({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase">
            Bookings
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            Next 30 days from your Google Calendar · cached 60s
          </p>
        </div>
        <Link
          href="/api/admin/auth/google/start?calendar=1&next=/admin/bookings"
          className="font-body font-semibold text-[13px] px-3 py-1.5 rounded-[var(--radius-admin-md)] border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong)]"
        >
          Re-link Google
        </Link>
      </div>

      {notConfigured && (
        <div className="p-4 rounded-[var(--radius-admin-lg)] border border-[var(--color-warn)]/30 bg-[var(--color-warn-tint)] text-[var(--color-warn)] text-sm">
          Google OAuth isn&apos;t configured on this deployment. Set{" "}
          <code className="bg-black/40 px-1 rounded">GOOGLE_CLIENT_ID</code>,{" "}
          <code className="bg-black/40 px-1 rounded">GOOGLE_CLIENT_SECRET</code>{" "}
          and{" "}
          <code className="bg-black/40 px-1 rounded">GOOGLE_REDIRECT_URI</code>{" "}
          on Vercel, then click <em>Re-link Google</em>.
        </div>
      )}

      {!notConfigured && needsLink && (
        <div className="p-4 rounded-[var(--radius-admin-lg)] border border-[var(--color-warn)]/30 bg-[var(--color-warn-tint)] text-sm text-[var(--color-fg)]">
          <p className="font-body font-semibold text-[13px] text-[var(--color-warn)] mb-1">
            Google Calendar not connected
          </p>
          <p className="text-foreground-muted mb-3">
            Click the button below to grant calendar access. You&apos;ll only
            need to do this once.
          </p>
          <Link
            href="/api/admin/auth/google/start?calendar=1&next=/admin/bookings"
            className="inline-block px-4 py-2 bg-[var(--color-elevated)] hover:bg-[var(--color-raised)] text-[var(--color-fg)] border border-[var(--color-border-strong)] font-body font-semibold text-[14px] rounded-[var(--radius-admin-md)] transition-colors"
          >
            Connect Google Calendar
          </Link>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-[var(--radius-admin-md)] border border-[var(--color-bad)]/30 bg-[var(--color-bad-tint)] text-xs text-[var(--color-bad)]">
          {errorMessage}
        </div>
      )}

      {events.length === 0 && !needsLink && !notConfigured && !errorMessage && (
        <div className="p-8 rounded-xl border border-dashed border-white/10 text-center">
          <p className="text-foreground-subtle text-sm">
            Nothing on the calendar in the next 30 days.
          </p>
        </div>
      )}

      {events.length > 0 && (
        <div className="space-y-5">
          {groupByDay(events).map((group) => (
            <div key={group.key} className="space-y-2">
              <div className="flex items-baseline gap-3">
                <h2 className="font-heading tracking-wider uppercase text-off-white text-sm">
                  {group.label}
                </h2>
                <span className="text-[10px] text-foreground-subtle">
                  {group.events.length} event
                  {group.events.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="space-y-2">
                {group.events.map((ev) => (
                  <a
                    key={ev.id}
                    href={ev.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-[var(--radius-admin-md)] p-4 hover:border-[var(--color-border-strong)] hover:bg-white/[0.04] transition"
                  >
                    <div className="flex items-start gap-4 flex-wrap">
                      <div className="font-mono tabular-nums text-[var(--color-fg)] text-sm min-w-[96px]">
                        {ev.allDay
                          ? "ALL DAY"
                          : `${fmtTime(ev.start)} – ${fmtTime(ev.end)}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-off-white text-sm font-semibold truncate">
                          {ev.summary}
                        </p>
                        {ev.location && (
                          <p className="text-foreground-muted text-xs truncate">
                            {ev.location}
                          </p>
                        )}
                        {ev.attendees.length > 0 && (
                          <p className="text-foreground-subtle text-[11px] mt-1">
                            {ev.attendees.length} attendee
                            {ev.attendees.length === 1 ? "" : "s"}
                            {ev.hangoutLink && " · Meet link available"}
                          </p>
                        )}
                      </div>
                      <div className="text-foreground-subtle text-[10px] uppercase tracking-widest shrink-0">
                        {ev.status === "cancelled" ? "cancelled" : ""}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByDay(events: Awaited<
  ReturnType<typeof fetchOwnerCalendarEvents>
>["events"]) {
  const groups = new Map<
    string,
    { key: string; label: string; events: typeof events }
  >();
  for (const ev of events) {
    const key = dayKey(ev.start);
    const existing = groups.get(key);
    if (existing) {
      existing.events.push(ev);
    } else {
      groups.set(key, {
        key,
        label: fmtDate(ev.start),
        events: [ev],
      });
    }
  }
  return Array.from(groups.values());
}
