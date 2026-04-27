import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/paid-reports/products";

/**
 * GET /api/paid-reports/availability
 *
 * Cheap server-side gate the upsell card pings on mount. Returns whether
 * checkout can actually be initiated. Used so the button can show
 * "Coming soon" rather than failing on click in environments where
 * Stripe isn't configured (preview deploys, local dev without keys).
 *
 * Does NOT expose the secret key itself or any other sensitive value.
 */
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY);
  const raceReport = await getProductBySlug("report_race");
  return NextResponse.json(
    {
      stripeReady,
      raceReportReady: Boolean(raceReport?.active),
      raceReportPriceCents: raceReport?.priceCents ?? null,
      raceReportCurrency: raceReport?.currency ?? null,
      // Resend is non-fatal at checkout time (delivery happens later) but
      // surfacing it lets admin spot misconfigured environments.
      resendReady: Boolean(process.env.RESEND_API_KEY),
    },
    {
      headers: {
        // Short cache — when admin sets the env var the next deploy
        // will pick it up; we don't need millisecond freshness here.
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    },
  );
}
