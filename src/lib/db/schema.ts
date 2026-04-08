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

// ── Subscribers (unified identity) ───────────────────────
export const subscribers = pgTable(
  "subscribers",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    source: text("source"),
    sourcePage: text("source_page"),
    signedUpAt: timestamp("signed_up_at", { withTimezone: true }),
    skoolJoinedAt: timestamp("skool_joined_at", { withTimezone: true }),
    trialStartedAt: timestamp("trial_started_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    churnedAt: timestamp("churned_at", { withTimezone: true }),
    beehiivId: text("beehiiv_id"),
    stripeCustomerId: text("stripe_customer_id"),
    persona: text("persona"),
    meta: jsonb("meta"),
  },
  (table) => [
    index("subscribers_email_idx").on(table.email),
    index("subscribers_signed_up_at_idx").on(table.signedUpAt),
  ]
);

// ── Repurposed Episodes ───────────────────────────────────
export const repurposedEpisodes = pgTable("repurposed_episodes", {
  id: serial("id").primaryKey(),
  episodeSlug: text("episode_slug").notNull().unique(),
  episodeTitle: text("episode_title").notNull(),
  episodeNumber: integer("episode_number").notNull(),
  pillar: text("pillar").notNull(),
  status: text("status").notNull().default("pending"), // pending | approved | partial
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Repurposed Content ────────────────────────────────────
export const repurposedContent = pgTable("repurposed_content", {
  id: serial("id").primaryKey(),
  episodeId: integer("episode_id").notNull().references(() => repurposedEpisodes.id),
  contentType: text("content_type").notNull(), // blog | twitter | instagram | linkedin | facebook | quote-card
  content: text("content").notNull(),
  status: text("status").notNull().default("pending"), // pending | approved | rejected | amended
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Content Chat Messages ─────────────────────────────────
export const contentChatMessages = pgTable("content_chat_messages", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => repurposedContent.id),
  role: text("role").notNull(), // user | assistant
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
