// Static schedule display $€” cron expressions are hardcoded in the workflows
// and vercel.json, so we mirror them here for operator visibility. Update
// both places if schedules change.

interface Slot {
  job: string;
  when: string;
  cron: string;
  note: string;
  /** UTC hours at which this job fires (minutes assumed from `minute`). */
  utcHours: number[];
  /** UTC minute within the hour. */
  minute: number;
  /** If set, job only runs on this day-of-week in UTC (0=Sun..6=Sat). */
  dayOfWeek?: number;
}

const SLOTS: Slot[] = [
  {
    job: "draft-prompt",
    when: "daily 07:00 Dublin ($±1h DST)",
    cron: "0 6 * * * UTC",
    note: "GH Actions $€” generates tomorrow's prompt into the queue",
    utcHours: [6],
    minute: 0,
  },
  {
    job: "post-prompt",
    when: "daily 07:30 Dublin",
    cron: "30 6 * * * UTC",
    note: "GH Actions $€” posts next approved draft (if gate enabled)",
    utcHours: [6],
    minute: 30,
  },
  {
    job: "welcomes",
    when: "twice daily $€” 09:00 + 18:00 Dublin",
    cron: "0 8,17 * * * UTC",
    note: "GH Actions $€” drafts pending welcomes (min 3), then posts (if gate enabled)",
    utcHours: [8, 17],
    minute: 0,
  },
  {
    job: "surface-threads",
    when: "daily 14:00 Dublin",
    cron: "0 13 * * * UTC",
    note: "GH Actions $€” scans last 48h, surfaces up to 2 (if gate enabled)",
    utcHours: [13],
    minute: 0,
  },
  {
    job: "heartbeat",
    when: "every 6 hours",
    cron: "0 */6 * * * UTC",
    note: "Vercel cron $€” alerts if no activity in 36h",
    utcHours: [0, 6, 12, 18],
    minute: 0,
  },
  {
    job: "weekly-digest",
    when: "Mondays 09:00 UTC",
    cron: "0 9 * * 1 UTC",
    note: "Vercel cron $€” emails the weekly metrics summary",
    utcHours: [9],
    minute: 0,
    dayOfWeek: 1,
  },
];

function nextRunAt(slot: Slot, now: Date = new Date()): Date {
  const cursor = new Date(now.getTime());
  for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
    const day = new Date(
      Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate() + dayOffset
      )
    );
    if (slot.dayOfWeek !== undefined && day.getUTCDay() !== slot.dayOfWeek) continue;
    for (const h of slot.utcHours) {
      const candidate = new Date(
        Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, slot.minute)
      );
      if (candidate.getTime() > now.getTime()) return candidate;
    }
  }
  return cursor;
}

function formatCountdown(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "now";
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remH = hours % 24;
    return remH > 0 ? `${days}d ${remH}h` : `${days}d`;
  }
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function ScheduleCard() {
  const now = new Date();
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-2">Schedule</h2>
      <div className="rounded-md bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-foreground-subtle uppercase tracking-wide">
              <th className="text-left p-2">Job</th>
              <th className="text-left p-2">Runs</th>
              <th className="text-left p-2">Next</th>
              <th className="text-left p-2">Cron</th>
              <th className="text-left p-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((s) => {
              const next = nextRunAt(s, now);
              return (
                <tr key={s.job} className="border-t border-white/5">
                  <td className="p-2 font-mono text-white whitespace-nowrap">{s.job}</td>
                  <td className="p-2 text-foreground-subtle">{s.when}</td>
                  <td className="p-2 text-foreground-subtle whitespace-nowrap">
                    in {formatCountdown(next, now)}
                  </td>
                  <td className="p-2 font-mono text-foreground-subtle text-[10px]">{s.cron}</td>
                  <td className="p-2 text-foreground-subtle">{s.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Exported for testing.
export const __internal = { nextRunAt, formatCountdown, SLOTS };
