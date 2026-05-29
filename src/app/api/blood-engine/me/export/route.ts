import { NextResponse } from "next/server";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { listReports } from "@/lib/blood-engine/db";

/**
 * GDPR data export for a Blood Engine user. Returns ALL data we hold about
 * the signed-in user as a single JSON file.
 *
 *   GET /api/blood-engine/me/export
 *
 * Response: a JSON download containing the user record (sans internal ids
 * for other tables) and every blood report with its raw input + Claude's
 * interpretation. Stripe customer id is included so users can correlate.
 */
export async function GET() {
  const user = await requireBloodEngineAccess();
  const reports = await listReports(user.id);

  const payload = {
    exportedAt: new Date().toISOString(),
    user: {
      email: user.email,
      hasAccess: user.hasAccess,
      stripeCustomerId: user.stripeCustomerId,
      accessGrantedAt: user.accessGrantedAt,
      tosAcceptedAt: user.tosAcceptedAt,
      tosVersion: user.tosVersion,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    },
    reports: reports.map((r) => ({
      id: r.id,
      drawDate: r.drawDate,
      context: r.context,
      results: r.results,
      interpretation: r.interpretation,
      promptVersion: r.promptVersion,
      retestDueAt: r.retestDueAt,
      retestNudgeSentAt: r.retestNudgeSentAt,
      createdAt: r.createdAt,
    })),
  };

  const filename = `blood-engine-export-${user.email.replace(/[^a-z0-9]/gi, "_")}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Don't ever cache the export
      "Cache-Control": "no-store",
    },
  });
}
