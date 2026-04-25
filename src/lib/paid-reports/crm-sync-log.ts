import { db } from "@/lib/db";
import { crmSyncLogs } from "@/lib/db/schema";

/**
 * Outbound CRM call audit. Every Beehiiv / contacts / Resend side-effect
 * writes one row $€” both on success and on failure $€” so admin can see the
 * real pipeline health and we can retry from the table if an external
 * service had a bad hour.
 *
 * The boolean profile flags + the tool_results row are fast-path state;
 * this table is the slow-path "what actually happened".
 */

export type CrmSyncTarget =
  | "beehiiv"
  | "contacts"
  | "resend"
  | "stripe"
  | "custom";

export type CrmSyncStatus = "pending" | "success" | "failed" | "skipped";

export interface LogCrmSyncInput {
  email: string;
  target: CrmSyncTarget;
  /** e.g. tag_add, upsert, activity, send_email */
  operation: string;
  payload: Record<string, unknown>;
  status: CrmSyncStatus;
  error?: string | null;
  attemptCount?: number;
  relatedTable?: "tool_results" | "orders" | "paid_reports" | "rider_profiles";
  relatedId?: number;
}

export async function logCrmSync(input: LogCrmSyncInput): Promise<void> {
  try {
    await db.insert(crmSyncLogs).values({
      email: input.email,
      target: input.target,
      operation: input.operation,
      payload: input.payload,
      status: input.status,
      error: input.error ?? null,
      attemptCount: input.attemptCount ?? 1,
      relatedTable: input.relatedTable ?? null,
      relatedId: input.relatedId ?? null,
    });
  } catch (err) {
    // Never let the audit-log write itself break a real pipeline.
    console.error("[paid-reports/crm-sync-log] write failed:", err);
  }
}
