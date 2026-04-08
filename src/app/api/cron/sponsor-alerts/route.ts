import { NextRequest, NextResponse } from "next/server";
import { getSponsors } from "@/lib/inventory";
import { notifyRenewalApproaching, notifyStaleSponsor } from "@/lib/notifications";

/**
 * GET /api/cron/sponsor-alerts
 *
 * Daily cron job (triggered by Vercel Cron) that checks all sponsors for:
 * 1. Renewal dates within 30 days
 * 2. Last contact older than 30 days
 *
 * Protected by CRON_SECRET env var — Vercel sends this as an Authorization
 * header automatically when using Vercel Cron.
 */

export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[sponsor-alerts] CRON_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    // Fetch all sponsors — we need to check dates client-side since Airtable
    // formula support for date comparisons is limited
    const sponsors = await getSponsors();

    const results = {
      renewals: [] as string[],
      stale: [] as string[],
      errors: [] as string[],
    };

    for (const sponsor of sponsors) {
      // Check renewal approaching (within 30 days)
      if (sponsor.renewalDate) {
        const renewalDate = new Date(sponsor.renewalDate);
        if (renewalDate >= now && renewalDate <= thirtyDaysFromNow) {
          const result = await notifyRenewalApproaching(
            sponsor.brandName,
            sponsor.renewalDate,
            sponsor.totalValue ?? 0,
          );
          if (result.success) {
            results.renewals.push(sponsor.brandName);
          } else {
            results.errors.push(`Renewal alert for ${sponsor.brandName}: ${result.error}`);
          }
        }
      }

      // Check stale contact (last contact > 30 days ago)
      if (sponsor.lastContact) {
        const lastContact = new Date(sponsor.lastContact);
        if (lastContact < thirtyDaysAgo) {
          const result = await notifyStaleSponsor(
            sponsor.brandName,
            sponsor.lastContact,
          );
          if (result.success) {
            results.stale.push(sponsor.brandName);
          } else {
            results.errors.push(`Stale alert for ${sponsor.brandName}: ${result.error}`);
          }
        }
      }
    }

    console.log(
      `[sponsor-alerts] Processed ${sponsors.length} sponsors: ` +
      `${results.renewals.length} renewals, ${results.stale.length} stale, ` +
      `${results.errors.length} errors`,
    );

    return NextResponse.json({
      ok: true,
      processed: sponsors.length,
      renewalAlerts: results.renewals,
      staleAlerts: results.stale,
      errors: results.errors,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[sponsor-alerts] Cron failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
