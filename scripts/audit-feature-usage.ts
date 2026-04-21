import { config } from "dotenv";
import { sql } from "@vercel/postgres";

config({ path: ".env.local" });

const QUERIES: Array<{ label: string; sql: string }> = [
  // ── Contacts ops
  { label: "contacts (total)", sql: "SELECT count(*)::int AS n FROM contacts" },
  {
    label: "contacts (active last 30d)",
    sql: "SELECT count(*)::int AS n FROM contacts WHERE last_activity_at > now() - interval '30 days'",
  },

  // ── CRM submissions / inbox
  {
    label: "contact_submissions",
    sql: "SELECT count(*)::int AS n, count(*) FILTER (WHERE read_at IS NULL)::int AS unread FROM contact_submissions",
  },
  {
    label: "cohort_applications",
    sql: "SELECT count(*)::int AS n, count(*) FILTER (WHERE created_at > now() - interval '30 days')::int AS recent FROM cohort_applications",
  },

  // ── Deals
  {
    label: "deals",
    sql: "SELECT count(*)::int AS n, coalesce(sum(value_cents)/100,0)::int AS total_value_usd FROM deals",
  },
  {
    label: "deals by stage",
    sql: "SELECT stage, count(*)::int AS n FROM deals GROUP BY stage ORDER BY stage",
  },

  // ── Tasks
  {
    label: "tasks",
    sql: "SELECT count(*)::int AS n, count(*) FILTER (WHERE completed_at IS NULL)::int AS open FROM tasks",
  },

  // ── Bookings
  {
    label: "bookings",
    sql: "SELECT count(*)::int AS n, count(*) FILTER (WHERE scheduled_at > now())::int AS upcoming FROM bookings",
  },

  // ── Segments
  {
    label: "segments",
    sql: "SELECT count(*)::int AS n FROM segments",
  },

  // ── Saved views
  {
    label: "saved_views",
    sql: "SELECT count(*)::int AS n FROM saved_views",
  },

  // ── Automations
  {
    label: "automation_rules",
    sql: "SELECT count(*)::int AS n, count(*) FILTER (WHERE active)::int AS active FROM automation_rules",
  },
  {
    label: "automation_runs (last 30d)",
    sql: "SELECT count(*)::int AS n FROM automation_runs WHERE started_at > now() - interval '30 days'",
  },

  // ── Email engagement
  {
    label: "email_messages (last 30d)",
    sql: "SELECT count(*)::int AS n, count(*) FILTER (WHERE sent_at IS NOT NULL)::int AS sent, count(*) FILTER (WHERE opened_at IS NOT NULL)::int AS opened, count(*) FILTER (WHERE clicked_at IS NOT NULL)::int AS clicked FROM email_messages WHERE created_at > now() - interval '30 days'",
  },
  {
    label: "email_templates",
    sql: "SELECT count(*)::int AS n FROM email_templates",
  },

  // ── Skool
  {
    label: "skool_events (last 7d)",
    sql: "SELECT count(*)::int AS n, count(*) FILTER (WHERE status = 'accepted')::int AS accepted FROM skool_events WHERE created_at > now() - interval '7 days'",
  },
  {
    label: "subscribers (with skoolJoinedAt)",
    sql: "SELECT count(*)::int AS n, count(*) FILTER (WHERE skool_joined_at > now() - interval '30 days')::int AS last30d FROM subscribers WHERE skool_joined_at IS NOT NULL",
  },

  // ── Snapshots
  {
    label: "stripe_snapshots",
    sql: "SELECT count(*)::int AS n, max(snapshot_date)::text AS latest FROM stripe_snapshots",
  },
  {
    label: "beehiiv_snapshots",
    sql: "SELECT count(*)::int AS n, max(snapshot_date)::text AS latest FROM beehiiv_snapshots",
  },

  // ── Experiments
  {
    label: "ab_tests",
    sql: "SELECT count(*)::int AS n, count(*) FILTER (WHERE status = 'running')::int AS running FROM ab_tests",
  },

  // ── Content / TED
  {
    label: "repurposed_content",
    sql: "SELECT count(*)::int AS n, count(*) FILTER (WHERE status = 'pending')::int AS pending FROM repurposed_content",
  },

  // ── Newsletter (subscribers)
  {
    label: "subscribers (total)",
    sql: "SELECT count(*)::int AS n, count(*) FILTER (WHERE paid_at IS NOT NULL)::int AS paid, count(*) FILTER (WHERE trial_started_at IS NOT NULL AND paid_at IS NULL)::int AS trialing FROM subscribers",
  },

  // ── Tags
  {
    label: "contacts with tags",
    sql: "SELECT count(*)::int AS n FROM contacts WHERE tags IS NOT NULL AND array_length(tags, 1) > 0",
  },

  // ── Notes / activities
  {
    label: "activities (last 30d)",
    sql: "SELECT count(*)::int AS n FROM activities WHERE created_at > now() - interval '30 days'",
  },

  // ── Notifications
  {
    label: "notifications",
    sql: "SELECT count(*)::int AS n, count(*) FILTER (WHERE read_at IS NULL)::int AS unread FROM notifications",
  },

  // ── Team users
  {
    label: "team_users (active)",
    sql: "SELECT count(*)::int AS n FROM team_users WHERE active",
  },
];

async function main() {
  if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL not set");
  const missing: string[] = [];
  const rows: Array<{ label: string; data: string }> = [];
  for (const q of QUERIES) {
    try {
      const r = await sql.query(q.sql);
      const first = r.rows[0] ?? {};
      if (r.rows.length > 1) {
        const parts = r.rows.map((row) =>
          Object.entries(row)
            .map(([k, v]) => `${k}=${v}`)
            .join(" ")
        );
        rows.push({ label: q.label, data: parts.join(" | ") });
      } else {
        const parts = Object.entries(first)
          .map(([k, v]) => `${k}=${v}`)
          .join("  ");
        rows.push({ label: q.label, data: parts });
      }
    } catch (err) {
      missing.push(`${q.label}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  for (const r of rows) {
    console.log(r.label.padEnd(38), r.data);
  }
  if (missing.length) {
    console.log("\nMISSING TABLES / ERRORS:");
    for (const m of missing) console.log("  -", m);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
