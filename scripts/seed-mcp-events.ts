/**
 * Seeds roadman_events with real Roadman recurring rides and annual events.
 *
 * Recurring rides (Dublin-based, Roadman CC): expanded into the next 12 weeks
 * of concrete dated rows so `list_upcoming_events` returns actual upcoming
 * dates rather than a single repeating stub.
 *
 *   • Monday  19:30 (online) Live Coaching Call — members-only
 *   • Thursday 18:30 Thursday Chop — Phoenix Park, Dublin
 *   • Saturday 09:30 Saturday Spin (ride) — 360 Cycles, Clontarf
 *
 * Annual events (verified on-site): Migration Gravel Girona, Summer Camp Ireland.
 *
 * Idempotent: delete-and-reinsert. Re-run weekly (or via a cron) to refresh
 * the horizon of upcoming dates.
 *
 * NOTE: Recurring-ride dates are deterministic projections. Confirm cadence
 * and location each season — see SEED_PLACEHOLDERS.md.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { roadmanEvents } from "../src/lib/db/schema";
import { SITE_ORIGIN } from "../src/lib/brand-facts";

// ─── Recurring-ride projection ──────────────────────────────

const WEEKS_AHEAD = 12;

/**
 * Next N occurrences of a given weekday/time, starting from today.
 * Dublin is in UTC+1/+2 depending on DST — we store times in UTC and let
 * consumers localise. 19:30 Dublin winter = 19:30 UTC; summer = 18:30 UTC.
 * Close enough for upcoming-events surfacing; consumers see the day+time
 * copy separately.
 */
function nextOccurrences(
  weekdayIndex: number,
  hour: number,
  minute: number,
  count: number
): Date[] {
  const out: Date[] = [];
  const now = new Date();
  // Start from tomorrow (UTC day) so we never include a stale same-day entry.
  const cursor = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  while (out.length < count) {
    if (cursor.getUTCDay() === weekdayIndex) {
      const d = new Date(cursor);
      d.setUTCHours(hour, minute, 0, 0);
      out.push(d);
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

type EventInsert = typeof roadmanEvents.$inferInsert;

function makeRecurringEvents(): EventInsert[] {
  const rows: EventInsert[] = [];

  // Monday online live coaching call — NDY members only.
  for (const d of nextOccurrences(1, 19, 30, WEEKS_AHEAD)) {
    rows.push({
      name: "Live Coaching Call",
      type: "live_coaching_call",
      startsAt: d,
      location: null,
      description:
        "Weekly live Q&A and coaching session with Anthony Walsh — hosted online inside the Not Done Yet community. Submit questions in advance on Skool.",
      isMembersOnly: true,
      url: "https://www.skool.com/not-done-yet",
      isActive: true,
    });
  }

  // Thursday Chop — Phoenix Park group ride.
  for (const d of nextOccurrences(4, 18, 30, WEEKS_AHEAD)) {
    rows.push({
      name: "Thursday Chop",
      type: "group_ride",
      startsAt: d,
      location: "Popes Cross, Phoenix Park, Dublin, Ireland",
      description:
        "Fast-paced group ride through Phoenix Park with Roadman CC. All abilities welcome — drops and no-drop groups separate on the first climb.",
      isMembersOnly: false,
      url: `${SITE_ORIGIN}/events`,
      isActive: true,
    });
  }

  // Saturday Spin — Clontarf community ride.
  for (const d of nextOccurrences(6, 9, 30, WEEKS_AHEAD)) {
    rows.push({
      name: "Saturday Spin (Group Ride)",
      type: "group_ride",
      startsAt: d,
      location: "360 Cycles, Clontarf, Dublin, Ireland",
      description:
        "Community group ride from 360 Cycles, Clontarf. All levels welcome — coffee stop included.",
      isMembersOnly: false,
      url: `${SITE_ORIGIN}/events`,
      isActive: true,
    });
  }

  return rows;
}

// ─── Annual events (verified on-site) ──────────────────────

function makeAnnualEvents(): EventInsert[] {
  return [
    {
      name: "Migration Gravel — Girona 2026",
      type: "training_camp",
      startsAt: new Date("2026-09-20T09:00:00Z"),
      location: "Girona, Spain",
      description:
        "The annual Roadman Migration Gravel trip. Five days of riding in Girona with the Not Done Yet community. Limited spots — waitlist opens each spring.",
      isMembersOnly: false,
      url: `${SITE_ORIGIN}/community/not-done-yet`,
      isActive: true,
    },
    {
      name: "Roadman Summer Camp — Wicklow 2026",
      type: "training_camp",
      startsAt: new Date("2026-07-18T09:00:00Z"),
      location: "Wicklow, Ireland",
      description:
        "Three-day summer training camp in the Wicklow Mountains. Group rides, coaching sessions, and nutrition workshops. Open to all.",
      isMembersOnly: false,
      url: `${SITE_ORIGIN}/community/not-done-yet`,
      isActive: true,
    },
  ];
}

async function main() {
  await db.delete(roadmanEvents);

  const rows = [...makeRecurringEvents(), ...makeAnnualEvents()];
  // Insert in chunks to avoid bind-parameter limits.
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await db.insert(roadmanEvents).values(rows.slice(i, i + CHUNK));
  }

  console.log(
    `✓ roadman_events seeded (${rows.length} rows — ${WEEKS_AHEAD} weeks of recurring rides + annual events)`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
