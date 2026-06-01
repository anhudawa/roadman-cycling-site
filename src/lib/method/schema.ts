/**
 * Drizzle schema additions for The Roadman Method course.
 *
 * On merge into `main`, re-export these from `src/lib/db/schema.ts` so
 * `import { methodEnrollments } from "@/lib/db/schema"` works alongside
 * the rest of the schema. See docs/method-architecture.md §12.
 */

import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const METHOD_ENROLLMENT_STATUSES = [
  "pending",
  "active",
  "refunded",
  "cancelled",
] as const;
export type MethodEnrollmentStatus = (typeof METHOD_ENROLLMENT_STATUSES)[number];

export const methodEnrollments = pgTable(
  "method_enrollments",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    // 'standard' ($297) | 'premium' ($397). Captured at checkout so the
    // webhook + members area can gate Premium-only fulfilment (personalised
    // TrainingPeaks plan, mid-course adjustment, NDY trial). Source of truth
    // for entitlement; `amount_cents` is the audited paid figure from Stripe.
    tier: text("tier").notNull().default("standard"),
    // 'pending' | 'active' | 'refunded' | 'cancelled'
    // 'pending' = checkout started, webhook hasn't fired yet.
    // 'active'  = paid + access granted.
    status: text("status").notNull().default("pending"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    // When the drip schedule starts for this enrollment. Defaults to paidAt
    // on webhook completion. Admin can adjust to gift a VIP early access.
    dripStartAt: timestamp("drip_start_at", { withTimezone: true }),
    amountCents: integer("amount_cents"),
    currency: text("currency").notNull().default("usd"),
    stripeSessionId: text("stripe_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    // Mirrors the orders table: idempotency log so re-delivered webhooks
    // can detect duplicates without separate ledger.
    stripeEventIds: jsonb("stripe_event_ids").$type<string[]>().notNull().default([]),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("method_enrollments_email_idx").on(table.email),
    index("method_enrollments_status_idx").on(table.status),
    index("method_enrollments_paid_at_idx").on(table.paidAt),
  ],
);

export const methodProgress = pgTable(
  "method_progress",
  {
    id: serial("id").primaryKey(),
    enrollmentId: integer("enrollment_id")
      .notNull()
      .references(() => methodEnrollments.id, { onDelete: "cascade" }),
    moduleSlug: text("module_slug").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("method_progress_enrollment_id_idx").on(table.enrollmentId),
    index("method_progress_module_slug_idx").on(table.moduleSlug),
    // Upsert target — re-marking a module complete is a no-op rather
    // than a duplicate row.
    uniqueIndex("method_progress_enrollment_module_unique").on(
      table.enrollmentId,
      table.moduleSlug,
    ),
  ],
);

export const methodLoginTokens = pgTable(
  "method_login_tokens",
  {
    id: serial("id").primaryKey(),
    enrollmentId: integer("enrollment_id")
      .notNull()
      .references(() => methodEnrollments.id, { onDelete: "cascade" }),
    // bcrypt-hashed magic-link token. Raw token is 32 random bytes (base64url)
    // and is sent over email; only the hash lives in the database.
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    // Single-use enforcement: a successful verify sets this column. Any
    // subsequent attempt to consume the same raw token finds usedAt set
    // and refuses.
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("method_login_tokens_enrollment_id_idx").on(table.enrollmentId),
    index("method_login_tokens_expires_at_idx").on(table.expiresAt),
  ],
);

export type MethodEnrollment = typeof methodEnrollments.$inferSelect;
export type NewMethodEnrollment = typeof methodEnrollments.$inferInsert;
export type MethodProgressRow = typeof methodProgress.$inferSelect;
export type MethodLoginToken = typeof methodLoginTokens.$inferSelect;

/**
 * Persisted result of the onboarding quiz (goal × hours × level → plan).
 *
 * One current recommendation per enrollment (unique enrollmentId, upserted
 * on retake), so the dashboard and account can surface the rider's saved
 * plan and the ops team can fulfil the matching TrainingPeaks block. Mirrors
 * what the onboarding API previously only logged to stdout.
 */
export const methodOnboarding = pgTable(
  "method_onboarding",
  {
    id: serial("id").primaryKey(),
    enrollmentId: integer("enrollment_id")
      .notNull()
      .references(() => methodEnrollments.id, { onDelete: "cascade" }),
    planCode: text("plan_code").notNull(),
    planName: text("plan_name").notNull(),
    goal: text("goal").notNull(),
    hours: integer("hours").notNull(),
    level: text("level").notNull(),
    /** Optional — calibrates zones, not plan selection. */
    ftp: integer("ftp"),
    /** Optional ISO date (YYYY-MM-DD). */
    eventDate: text("event_date"),
    /** Optional — weeks until target event at time of submission. */
    weeksToEvent: integer("weeks_to_event"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Upsert target — a retake replaces the rider's current recommendation
    // rather than spawning a second row.
    uniqueIndex("method_onboarding_enrollment_unique").on(table.enrollmentId),
  ],
);

export type MethodOnboardingRow = typeof methodOnboarding.$inferSelect;
export type NewMethodOnboardingRow = typeof methodOnboarding.$inferInsert;

/**
 * Per-module week-checklist tick state, persisted server-side so progress
 * survives a device/browser change (localStorage remains a fast offline
 * cache on the client). Distinct from `method_progress`, which tracks
 * whole-module completion. Stores the set of ticked item indexes.
 */
export const methodChecklistState = pgTable(
  "method_checklist_state",
  {
    id: serial("id").primaryKey(),
    enrollmentId: integer("enrollment_id")
      .notNull()
      .references(() => methodEnrollments.id, { onDelete: "cascade" }),
    moduleSlug: text("module_slug").notNull(),
    /** Indexes of ticked checklist items. */
    checkedIndexes: jsonb("checked_indexes").$type<number[]>().notNull().default([]),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("method_checklist_state_enrollment_id_idx").on(table.enrollmentId),
    // Upsert target — one row per (enrollment, module).
    uniqueIndex("method_checklist_state_enrollment_module_unique").on(
      table.enrollmentId,
      table.moduleSlug,
    ),
  ],
);

export type MethodChecklistStateRow = typeof methodChecklistState.$inferSelect;

/**
 * Server-persisted Fuel Planner state (profile + week pattern + meals +
 * start date) so a rider's plan survives a device/browser change. The whole
 * client-side FuelPlannerState is stored as a jsonb blob; localStorage stays
 * the fast offline cache and the two reconcile by `updatedAt`. One row per
 * enrollment.
 */
export const methodFuelState = pgTable(
  "method_fuel_state",
  {
    id: serial("id").primaryKey(),
    enrollmentId: integer("enrollment_id")
      .notNull()
      .references(() => methodEnrollments.id, { onDelete: "cascade" }),
    /** Full FuelPlannerState (see src/lib/fuel-planner/storage.ts). */
    state: jsonb("state").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("method_fuel_state_enrollment_unique").on(table.enrollmentId),
  ],
);

export type MethodFuelStateRow = typeof methodFuelState.$inferSelect;
