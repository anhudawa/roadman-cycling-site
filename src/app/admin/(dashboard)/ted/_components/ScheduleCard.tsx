// Static schedule display — cron expressions are hardcoded in the workflows
// and vercel.json, so we mirror them here for operator visibility. Update
// both places if schedules change.

interface Slot {
  job: string;
  when: string;
  cron: string;
  note: string;
}

const SLOTS: Slot[] = [
  {
    job: "draft-prompt",
    when: "daily 07:00 Dublin (±1h DST)",
    cron: "0 6 * * * UTC",
    note: "GH Actions — generates tomorrow's prompt into the queue",
  },
  {
    job: "post-prompt",
    when: "daily 07:30 Dublin",
    cron: "30 6 * * * UTC",
    note: "GH Actions — posts next approved draft (if gate enabled)",
  },
  {
    job: "welcomes",
    when: "twice daily — 09:00 + 18:00 Dublin",
    cron: "0 8,17 * * * UTC",
    note: "GH Actions — drafts pending welcomes (min 3), then posts (if gate enabled)",
  },
  {
    job: "surface-threads",
    when: "daily 14:00 Dublin",
    cron: "0 13 * * * UTC",
    note: "GH Actions — scans last 48h, surfaces up to 2 (if gate enabled)",
  },
  {
    job: "heartbeat",
    when: "every 6 hours",
    cron: "0 */6 * * * UTC",
    note: "Vercel cron — alerts if no activity in 36h",
  },
  {
    job: "weekly-digest",
    when: "Mondays 09:00 UTC",
    cron: "0 9 * * 1 UTC",
    note: "Vercel cron — emails the weekly metrics summary",
  },
];

export function ScheduleCard() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-2">Schedule</h2>
      <div className="rounded-md bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-foreground-subtle uppercase tracking-wide">
              <th className="text-left p-2">Job</th>
              <th className="text-left p-2">Runs</th>
              <th className="text-left p-2">Cron</th>
              <th className="text-left p-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((s) => (
              <tr key={s.job} className="border-t border-white/5">
                <td className="p-2 font-mono text-white whitespace-nowrap">{s.job}</td>
                <td className="p-2 text-foreground-subtle">{s.when}</td>
                <td className="p-2 font-mono text-foreground-subtle text-[10px]">{s.cron}</td>
                <td className="p-2 text-foreground-subtle">{s.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
