import {
  pgTable,
  serial,
  text,
  timestamp,
  date,
  integer,
  real,
  jsonb,
  boolean,
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
    activeSubscriptions: integer("active_subscriptions").notNull().default(0),
    trialingCount: integer("trialing_count").notNull().default(0),
    pastDueCount: integer("past_due_count").notNull().default(0),
    pastDueMrrCents: integer("past_due_mrr_cents").notNull().default(0),
    annualMrrCents: integer("annual_mrr_cents").notNull().default(0),
    netNewMrrCents: integer("net_new_mrr_cents").notNull().default(0),
    netNewSubs: integer("net_new_subs").notNull().default(0),
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

// ── Contact Submissions ──────────────────────────────────
export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    assignedTo: text("assigned_to"),
    // new | in_progress | replied | follow_up | closed
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("contact_submissions_created_at_idx").on(table.createdAt),
    index("contact_submissions_read_at_idx").on(table.readAt),
    index("contact_submissions_status_idx").on(table.status),
  ]
);

export const INBOX_STAGES = [
  "new",
  "in_progress",
  "replied",
  "follow_up",
  "closed",
] as const;
export type InboxStage = (typeof INBOX_STAGES)[number];
export function isInboxStage(x: string): x is InboxStage {
  return (INBOX_STAGES as readonly string[]).includes(x);
}

// ── Cohort Applications ─────────────────────────────────
export const cohortApplications = pgTable(
  "cohort_applications",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    goal: text("goal").notNull(),
    hours: text("hours").notNull(),
    ftp: text("ftp"),
    frustration: text("frustration").notNull(),
    cohort: text("cohort").notNull().default("2026"),
    persona: text("persona"),
    status: text("status").notNull().default("awaiting_response"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("cohort_applications_created_at_idx").on(table.createdAt),
    index("cohort_applications_cohort_idx").on(table.cohort),
    index("cohort_applications_read_at_idx").on(table.readAt),
    // One application per email per cohort — prevents duplicate kanban cards.
    uniqueIndex("cohort_applications_email_cohort_idx").on(
      table.email,
      table.cohort,
    ),
  ]
);

// ── CRM: Contacts ─────────────────────────────────────────
export const contacts = pgTable(
  "contacts",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    phone: text("phone"),
    owner: text("owner"),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    customFields: jsonb("custom_fields").$type<Record<string, unknown>>().default({}).notNull(),
    source: text("source"),
    lifecycleStage: text("lifecycle_stage").notNull().default("lead"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("contacts_email_idx").on(table.email),
    index("contacts_owner_idx").on(table.owner),
    index("contacts_lifecycle_stage_idx").on(table.lifecycleStage),
    index("contacts_last_activity_at_idx").on(table.lastActivityAt),
  ]
);

// ── CRM: Contact Activities ───────────────────────────────
export const contactActivities = pgTable(
  "contact_activities",
  {
    id: serial("id").primaryKey(),
    contactId: integer("contact_id").notNull().references(() => contacts.id),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    meta: jsonb("meta").$type<Record<string, unknown>>(),
    authorName: text("author_name"),
    authorSlug: text("author_slug"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("contact_activities_contact_id_idx").on(table.contactId),
    index("contact_activities_created_at_idx").on(table.createdAt),
    index("contact_activities_author_slug_idx").on(table.authorSlug),
  ]
);

// ── CRM: Tasks ────────────────────────────────────────────
export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    contactId: integer("contact_id").references(() => contacts.id),
    title: text("title").notNull(),
    notes: text("notes"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    assignedTo: text("assigned_to"),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // Peer-to-peer "send task" flow. NULL = direct-owned legacy task.
    requestStatus: text("request_status"), // requested | accepted | declined | null
    responseMessage: text("response_message"),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    // Main Focus (drizzle/0024_task_focus_order.sql). NULL = lives in "All
    // other tasks" (sorted by due date); NOT NULL = lives in "My main focus"
    // (sorted by focus_order ascending).
    focusOrder: integer("focus_order"),
  },
  (table) => [
    index("tasks_contact_id_idx").on(table.contactId),
    index("tasks_assigned_to_idx").on(table.assignedTo),
    index("tasks_due_at_idx").on(table.dueAt),
    index("tasks_completed_at_idx").on(table.completedAt),
  ]
);

// ── Team Users ────────────────────────────────────────────
export const teamUsers = pgTable(
  "team_users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("member"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    // Google OAuth linkage. Only Anthony currently grants Calendar scope;
    // for Sarah/Matthew the refresh_token will be null.
    googleSub: text("google_sub"),
    googleRefreshToken: text("google_refresh_token"),
    googleLinkedAt: timestamp("google_linked_at", { withTimezone: true }),
  },
  (table) => [
    index("team_users_email_idx").on(table.email),
    index("team_users_slug_idx").on(table.slug),
  ]
);

// ── CRM: Email Templates ──────────────────────────────────
export const emailTemplates = pgTable(
  "email_templates",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("email_templates_slug_idx").on(table.slug),
    index("email_templates_updated_at_idx").on(table.updatedAt),
  ]
);

// ── CRM: Email Messages ───────────────────────────────────
export const emailMessages = pgTable(
  "email_messages",
  {
    id: serial("id").primaryKey(),
    contactId: integer("contact_id").notNull().references(() => contacts.id),
    templateId: integer("template_id").references(() => emailTemplates.id),
    fromUser: text("from_user").notNull(),
    fromAddress: text("from_address").notNull(),
    toAddress: text("to_address").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    resendMessageId: text("resend_message_id"),
    // queued | sent | delivered | bounced | complained | failed
    status: text("status").notNull().default("queued"),
    errorMessage: text("error_message"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    openedAt: timestamp("opened_at", { withTimezone: true }),
    clickedAt: timestamp("clicked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("email_messages_contact_id_idx").on(table.contactId),
    index("email_messages_sent_at_idx").on(table.sentAt),
    index("email_messages_status_idx").on(table.status),
  ]
);

// ── Content Chat Messages ─────────────────────────────────
export const contentChatMessages = pgTable("content_chat_messages", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => repurposedContent.id),
  role: text("role").notNull(), // user | assistant
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Sponsor Reports ───────────────────────────────────────
export const monthlySocialStats = pgTable(
  "monthly_social_stats",
  {
    id: serial("id").primaryKey(),
    month: text("month").notNull(), // 'YYYY-MM'
    platform: text("platform").notNull(), // 'facebook' | 'x' | 'instagram'
    views: integer("views").notNull(),
    enteredAt: timestamp("entered_at", { withTimezone: true }).defaultNow(),
    enteredBy: text("entered_by"),
  },
  (t) => ({
    monthPlatformIdx: uniqueIndex("monthly_social_stats_month_platform_idx").on(
      t.month,
      t.platform,
    ),
  }),
);

// ── CRM: Saved Views ──────────────────────────────────────
export const savedViews = pgTable(
  "saved_views",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    entity: text("entity").notNull(),
    filters: jsonb("filters").$type<Record<string, unknown>>().notNull().default({}),
    createdBySlug: text("created_by_slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("saved_views_entity_idx").on(table.entity),
    index("saved_views_created_by_slug_idx").on(table.createdBySlug),
  ]
);

// ── CRM: Notifications ────────────────────────────────────
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    recipientSlug: text("recipient_slug").notNull(),
    type: text("type").notNull(), // 'mention' | 'task_assigned' | 'stage_change'
    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("notifications_recipient_slug_idx").on(table.recipientSlug),
    index("notifications_read_at_idx").on(table.readAt),
    index("notifications_created_at_idx").on(table.createdAt),
  ]
);

// ── CRM: Deals ────────────────────────────────────────────
export const deals = pgTable(
  "deals",
  {
    id: serial("id").primaryKey(),
    contactId: integer("contact_id").references(() => contacts.id),
    title: text("title").notNull(),
    valueCents: integer("value_cents").notNull().default(0),
    currency: text("currency").notNull().default("EUR"),
    stage: text("stage").notNull().default("qualified"),
    ownerSlug: text("owner_slug"),
    source: text("source"),
    expectedCloseDate: date("expected_close_date"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("deals_contact_id_idx").on(table.contactId),
    index("deals_stage_idx").on(table.stage),
    index("deals_owner_slug_idx").on(table.ownerSlug),
    index("deals_expected_close_date_idx").on(table.expectedCloseDate),
  ]
);

// ── CRM: Automations ──────────────────────────────────────
export type AutomationTriggerType =
  | "application.stage_changed"
  | "deal.stage_changed"
  | "contact.created"
  | "contact.lifecycle_changed";

export interface AutomationTriggerConfig {
  toStage?: string;
  source?: string;
}

export type AutomationAction =
  | { type: "send_email"; config: { templateSlug: string } }
  | { type: "create_task"; config: { title: string; assignedTo?: string; dueInDays?: number } }
  | { type: "add_tag"; config: { tag: string } }
  | { type: "notify_user"; config: { recipientSlug: string; title: string } };

export const automationRules = pgTable(
  "automation_rules",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    active: boolean("active").notNull().default(true),
    triggerType: text("trigger_type").notNull(),
    triggerConfig: jsonb("trigger_config").$type<AutomationTriggerConfig>().notNull().default({}),
    actions: jsonb("actions").$type<AutomationAction[]>().notNull().default([]),
    createdBySlug: text("created_by_slug"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    runCount: integer("run_count").notNull().default(0),
    maxRunsPerDay: integer("max_runs_per_day").notNull().default(0),
    dedupeWindowMinutes: integer("dedupe_window_minutes").notNull().default(0),
  },
  (table) => [
    index("automation_rules_trigger_type_idx").on(table.triggerType),
    index("automation_rules_active_idx").on(table.active),
  ]
);

export const automationRuns = pgTable(
  "automation_runs",
  {
    id: serial("id").primaryKey(),
    ruleId: integer("rule_id").references(() => automationRules.id, { onDelete: "cascade" }),
    contactId: integer("contact_id"),
    status: text("status").notNull(), // 'success' | 'partial' | 'error'
    event: jsonb("event").$type<Record<string, unknown>>(),
    result: jsonb("result").$type<Record<string, unknown>>(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("automation_runs_rule_id_idx").on(table.ruleId),
    index("automation_runs_created_at_idx").on(table.createdAt),
    index("automation_runs_rule_contact_idx").on(table.ruleId, table.contactId, table.createdAt),
  ]
);

// ── CRM: Segments ─────────────────────────────────────────
export type CustomFieldFilterOp = "eq" | "ne" | "contains" | "present" | "absent";

export interface CustomFieldFilter {
  key: string;
  op: CustomFieldFilterOp;
  value?: string;
}

export interface SegmentFilters {
  tagsAny?: string[];
  lifecycleStageIn?: string[];
  ownerIn?: string[];
  sourceIn?: string[];
  isSubscriber?: boolean;
  isCustomer?: boolean;
  lastActivityBefore?: string;
  lastActivityAfter?: string;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
  customFields?: CustomFieldFilter[];
}

export const segments = pgTable(
  "segments",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    filters: jsonb("filters").$type<SegmentFilters>().notNull().default({}),
    createdBySlug: text("created_by_slug"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("segments_created_by_slug_idx").on(table.createdBySlug),
  ]
);

// ── CRM: Attachments ──────────────────────────────────────
export const attachments = pgTable(
  "attachments",
  {
    id: serial("id").primaryKey(),
    contactId: integer("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    contentType: text("content_type"),
    sizeBytes: integer("size_bytes"),
    blobUrl: text("blob_url").notNull(),
    blobPathname: text("blob_pathname").notNull(),
    uploadedBySlug: text("uploaded_by_slug"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("attachments_contact_id_idx").on(table.contactId),
    index("attachments_created_at_idx").on(table.createdAt),
  ]
);

// ── CRM: Custom Field Defs ────────────────────────────────
export type CustomFieldType =
  | "text"
  | "longtext"
  | "number"
  | "date"
  | "url"
  | "select"
  | "boolean";

export interface CustomFieldOption {
  label: string;
  value: string;
}

export const customFieldDefs = pgTable(
  "custom_field_defs",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull().unique(),
    label: text("label").notNull(),
    type: text("type").notNull(),
    options: jsonb("options").$type<CustomFieldOption[]>().notNull().default([]),
    helpText: text("help_text"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("custom_field_defs_sort_order_idx").on(table.sortOrder)]
);

// ── CRM: Sync Runs ────────────────────────────────────────
export interface SyncRunResult {
  scanned: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

export const syncRuns = pgTable(
  "sync_runs",
  {
    id: serial("id").primaryKey(),
    source: text("source").notNull(), // 'beehiiv' | 'stripe'
    status: text("status").notNull(), // 'running' | 'success' | 'error'
    result: jsonb("result").$type<SyncRunResult | null>(),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (table) => [
    index("sync_runs_source_idx").on(table.source, table.startedAt),
  ]
);

// ── CRM: Bookings ─────────────────────────────────────────
export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    contactId: integer("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
    ownerSlug: text("owner_slug").notNull(),
    title: text("title").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(30),
    location: text("location"),
    notes: text("notes"),
    // 'scheduled' | 'completed' | 'cancelled' | 'no_show'
    status: text("status").notNull().default("scheduled"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdBySlug: text("created_by_slug"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("bookings_contact_id_idx").on(table.contactId),
    index("bookings_owner_slug_idx").on(table.ownerSlug),
    index("bookings_scheduled_at_idx").on(table.scheduledAt),
    index("bookings_status_idx").on(table.status),
  ]
);

// ── CRM: Cron Runs ────────────────────────────────────────
export type CronRunKind =
  | "daily_digest"
  | "weekly_digest"
  | "sync_all"
  | "score_all"
  | "complete_past_bookings"
  | "beehiiv_snapshot"
  | "stripe_snapshot";

export const cronRuns = pgTable(
  "cron_runs",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(),
    status: text("status").notNull(), // 'running' | 'success' | 'error'
    result: jsonb("result").$type<Record<string, unknown> | null>(),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (table) => [
    index("cron_runs_kind_idx").on(table.kind, table.startedAt),
  ]
);

export const episodeDownloadsCache = pgTable("episode_downloads_cache", {
  episodeId: text("episode_id").primaryKey(),
  downloads: integer("downloads").notNull(),
  source: text("source").notNull().default("seeded"), // 'seeded' | 'spotify' | 'manual'
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ── Ted Community Agent ───────────────────────────────────
// Autonomous agent that runs the free Roadman Clubhouse on Skool.
// See agents/ted/README.md for runtime split (Vercel drafts, GitHub Actions posts).

export type TedDraftStatus =
  | "draft"
  | "approved"
  | "edited"
  | "rejected"
  | "posted"
  | "failed"
  | "voice_flagged";

export const tedDrafts = pgTable(
  "ted_drafts",
  {
    id: serial("id").primaryKey(),
    pillar: text("pillar").notNull(),
    scheduledFor: date("scheduled_for").notNull(),
    status: text("status").notNull().default("draft"),
    originalBody: text("original_body").notNull(),
    editedBody: text("edited_body"),
    approvedBySlug: text("approved_by_slug"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    skoolPostUrl: text("skool_post_url"),
    voiceCheck: jsonb("voice_check").$type<Record<string, unknown> | null>(),
    generationAttempts: integer("generation_attempts").notNull().default(1),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("ted_drafts_scheduled_for_idx").on(table.scheduledFor),
    index("ted_drafts_status_idx").on(table.status),
  ]
);

export const tedWelcomeQueue = pgTable(
  "ted_welcome_queue",
  {
    memberEmail: text("member_email").primaryKey(),
    memberId: text("member_id"),
    firstName: text("first_name").notNull(),
    persona: text("persona"),
    questionnaireAnswers: jsonb("questionnaire_answers").$type<
      Record<string, unknown> | null
    >(),
    status: text("status").notNull().default("pending"),
    draftBody: text("draft_body"),
    voiceCheck: jsonb("voice_check").$type<Record<string, unknown> | null>(),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    skoolPostUrl: text("skool_post_url"),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("ted_welcome_queue_status_idx").on(table.status),
    index("ted_welcome_queue_created_at_idx").on(table.createdAt),
  ]
);

export const tedSurfaced = pgTable(
  "ted_surfaced",
  {
    id: serial("id").primaryKey(),
    skoolPostId: text("skool_post_id").notNull(),
    surfaceType: text("surface_type").notNull(), // 'tag' | 'link' | 'summary'
    body: text("body").notNull(),
    skoolReplyUrl: text("skool_reply_url"),
    surfacedAt: timestamp("surfaced_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("ted_surfaced_post_id_idx").on(table.skoolPostId),
    index("ted_surfaced_at_idx").on(table.surfacedAt),
  ]
);

export const tedActiveMembers = pgTable("ted_active_members", {
  memberId: text("member_id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  topicTags: text("topic_tags").array(),
  postCount: integer("post_count").notNull().default(0),
  replyCount: integer("reply_count").notNull().default(0),
});

// Thread-surface drafts awaiting human approval. Populated by the draft-surfaces
// job, drained by post-surfaces. Successfully-posted surfaces are recorded in
// ted_surfaced for de-dup.
export const tedSurfaceDrafts = pgTable(
  "ted_surface_drafts",
  {
    id: serial("id").primaryKey(),
    skoolPostId: text("skool_post_id").notNull(),
    threadUrl: text("thread_url").notNull(),
    threadAuthor: text("thread_author"),
    threadTitle: text("thread_title"),
    threadBody: text("thread_body"),
    surfaceType: text("surface_type").notNull(), // 'tag' | 'link' | 'summary'
    originalBody: text("original_body").notNull(),
    editedBody: text("edited_body"),
    // 'drafted' | 'voice_flagged' | 'approved' | 'edited' | 'rejected' | 'posted' | 'failed'
    status: text("status").notNull().default("drafted"),
    voiceCheck: jsonb("voice_check").$type<Record<string, unknown> | null>(),
    approvedBySlug: text("approved_by_slug"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    skoolReplyUrl: text("skool_reply_url"),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("ted_surface_drafts_status_idx").on(table.status),
    index("ted_surface_drafts_skool_post_id_idx").on(table.skoolPostId),
    index("ted_surface_drafts_created_at_idx").on(table.createdAt),
  ]
);

export const tedActivityLog = pgTable(
  "ted_activity_log",
  {
    id: serial("id").primaryKey(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    job: text("job").notNull(),
    action: text("action").notNull(),
    level: text("level").notNull().default("info"),
    payload: jsonb("payload").$type<Record<string, unknown> | null>(),
    error: text("error"),
  },
  (table) => [
    index("ted_activity_log_timestamp_idx").on(table.timestamp),
    index("ted_activity_log_job_idx").on(table.job, table.timestamp),
  ]
);

export const tedEdits = pgTable(
  "ted_edits",
  {
    id: serial("id").primaryKey(),
    draftId: integer("draft_id")
      .notNull()
      .references(() => tedDrafts.id, { onDelete: "cascade" }),
    beforeText: text("before_text").notNull(),
    afterText: text("after_text").notNull(),
    charsChanged: integer("chars_changed").notNull().default(0),
    editedBySlug: text("edited_by_slug"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("ted_edits_draft_id_idx").on(table.draftId),
    index("ted_edits_created_at_idx").on(table.createdAt),
  ]
);

export const tedKillSwitch = pgTable("ted_kill_switch", {
  id: integer("id").primaryKey(), // singleton row id=1
  paused: boolean("paused").notNull().default(false),
  pausedBySlug: text("paused_by_slug"),
  pausedAt: timestamp("paused_at", { withTimezone: true }),
  reason: text("reason"),
  postPromptEnabled: boolean("post_prompt_enabled").notNull().default(false),
  postWelcomeEnabled: boolean("post_welcome_enabled").notNull().default(false),
  surfaceThreadsEnabled: boolean("surface_threads_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Skool Webhook Events (audit log) ──────────────────────
export const skoolEvents = pgTable(
  "skool_events",
  {
    id: serial("id").primaryKey(),
    eventType: text("event_type").notNull(),            // member_joined | member_updated | other | bad_payload | unauthorized
    source: text("source").notNull().default("unknown"), // skool_native | zapier | make | curl | unknown
    email: text("email"),
    name: text("name"),
    persona: text("persona"),
    rawPayload: jsonb("raw_payload").notNull().$type<Record<string, unknown>>(),
    status: text("status").notNull(),                    // accepted | skipped | error
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("skool_events_created_at_idx").on(table.createdAt),
    index("skool_events_status_idx").on(table.status),
  ]
);
