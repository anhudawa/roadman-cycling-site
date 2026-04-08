import {
  pgTable,
  serial,
  text,
  timestamp,
  date,
  integer,
  real,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ── Events ────────────────────────────────────────────────
export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    type: text("type").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    page: text("page").notNull(),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    device: text("device").notNull(),
    email: text("email"),
    source: text("source"),
    sessionId: text("session_id").notNull(),
    meta: jsonb("meta"),
    variantId: text("variant_id"),
  },
  (table) => [
    index("events_timestamp_idx").on(table.timestamp),
    index("events_page_idx").on(table.page),
    index("events_session_id_idx").on(table.sessionId),
  ]
);

// ── Beehiiv Snapshots ─────────────────────────────────────
export const beehiivSnapshots = pgTable(
  "beehiiv_snapshots",
  {
    id: serial("id").primaryKey(),
    snapshotDate: date("snapshot_date").notNull(),
    totalSubscribers: integer("total_subscribers").notNull(),
    activeSubscribers: integer("active_subscribers").notNull(),
    newSubscribersToday: integer("new_subscribers_today").notNull(),
    avgOpenRate: real("avg_open_rate").notNull(),
    avgClickRate: real("avg_click_rate").notNull(),
    rawData: jsonb("raw_data"),
  },
  (table) => [
    uniqueIndex("beehiiv_snapshots_date_idx").on(table.snapshotDate),
  ]
);

// ── Stripe Snapshots ──────────────────────────────────────
export const stripeSnapshots = pgTable(
  "stripe_snapshots",
  {
    id: serial("id").primaryKey(),
    snapshotDate: date("snapshot_date").notNull(),
    totalRevenueCents: integer("total_revenue_cents").notNull(),
    transactionCount: integer("transaction_count").notNull(),
    mrrCents: integer("mrr_cents").notNull(),
    rawData: jsonb("raw_data"),
  },
  (table) => [
    uniqueIndex("stripe_snapshots_date_idx").on(table.snapshotDate),
  ]
);

// ── A/B Tests ─────────────────────────────────────────────
export const abTests = pgTable("ab_tests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  page: text("page").notNull(),
  element: text("element").notNull(),
  variants: jsonb("variants").notNull(),
  status: text("status").notNull().default("draft"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  winnerVariantId: text("winner_variant_id"),
  createdBy: text("created_by").notNull().default("manual"),
  completedBy: text("completed_by"),
});

// ── Agent Reports ─────────────────────────────────────────
export const agentReports = pgTable("agent_reports", {
  id: serial("id").primaryKey(),
  reportDate: date("report_date").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  summary: text("summary").notNull(),
  pageAnalyses: jsonb("page_analyses"),
  suggestedExperiments: jsonb("suggested_experiments"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
