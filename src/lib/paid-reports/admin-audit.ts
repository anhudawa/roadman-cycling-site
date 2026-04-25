import { db } from "@/lib/db";
import { adminAuditLogs } from "@/lib/db/schema";

/**
 * Admin audit log $€” every mutating action an admin performs on a
 * sensitive row (paid report resend / revoke / regenerate, consent
 * purge, etc.) writes one row. Combined with the admin email allowlist
 * this gives us a full accountability trail.
 */

export type AdminAuditAction =
  | "report_resend"
  | "report_revoke"
  | "report_regenerate"
  | "order_refund"
  | "consent_purge"
  | "profile_merge"
  | "lead_score_refresh"
  | "product_price_update";

export type AdminAuditTargetType =
  | "paid_report"
  | "order"
  | "rider_profile"
  | "report_product"
  | "consent_record";

export interface LogAdminActionInput {
  actorEmail: string;
  action: AdminAuditAction;
  targetType: AdminAuditTargetType;
  targetId: number;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logAdminAction(input: LogAdminActionInput): Promise<void> {
  try {
    await db.insert(adminAuditLogs).values({
      actorEmail: input.actorEmail,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason ?? null,
      metadata: input.metadata ?? null,
    });
  } catch (err) {
    console.error("[paid-reports/admin-audit] write failed:", err);
  }
}
