"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/paid-reports/admin-audit";
import {
  getPaidReportById,
  markResent,
  markRevoked,
} from "@/lib/paid-reports/reports";
import { generateAndDeliverPaidReport } from "@/lib/paid-reports/generator";

/**
 * Admin server actions for the paid-reports table.
 *
 * Each action runs `requireAuth`, performs the state change, writes an
 * audit log row, then revalidates /admin/paid-reports so the table
 * reflects the new state on reload.
 *
 * Resend / regenerate both route through the generator. We only keep
 * the sha256 of the secure token, so we can't reconstruct the original
 * link — resend is implemented as a fresh generate+deliver which
 * hands out a new token in the email. This is stricter than necessary
 * for happy-path resend, but it keeps the admin tooling honest.
 */

export async function resendReportAction(reportId: number): Promise<void> {
  const actor = await requireAuth();
  const report = await getPaidReportById(reportId);
  if (!report) throw new Error("Report not found");
  if (report.status === "revoked" || report.status === "refunded") {
    throw new Error(`Cannot resend a ${report.status} report`);
  }
  await generateAndDeliverPaidReport(report.id);
  await markResent(report.id);
  await logAdminAction({
    actorEmail: actor.email,
    action: "report_resend",
    targetType: "paid_report",
    targetId: report.id,
  });
  revalidatePath("/admin/paid-reports");
}

export async function revokeReportAction(
  reportId: number,
  reason: string,
): Promise<void> {
  const actor = await requireAuth();
  const report = await getPaidReportById(reportId);
  if (!report) throw new Error("Report not found");
  const trimmed = reason.trim() || "Admin revoked";
  await markRevoked(report.id, trimmed);
  await logAdminAction({
    actorEmail: actor.email,
    action: "report_revoke",
    targetType: "paid_report",
    targetId: report.id,
    reason: trimmed,
  });
  revalidatePath("/admin/paid-reports");
}

export async function regenerateReportAction(
  reportId: number,
): Promise<void> {
  const actor = await requireAuth();
  const report = await getPaidReportById(reportId);
  if (!report) throw new Error("Report not found");
  if (report.status === "revoked" || report.status === "refunded") {
    throw new Error(`Cannot regenerate a ${report.status} report`);
  }
  await generateAndDeliverPaidReport(report.id);
  await logAdminAction({
    actorEmail: actor.email,
    action: "report_regenerate",
    targetType: "paid_report",
    targetId: report.id,
  });
  revalidatePath("/admin/paid-reports");
}
