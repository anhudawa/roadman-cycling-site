import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliateClickEvents } from "@/lib/db/schema";
import { getOfferForRedirect } from "@/lib/recommends/queries";
import {
  affiliateDevice,
  attachAffiliateClickId,
  hasAnalyticsConsent,
  isAffiliateBot,
  isSafeAffiliateDestination,
  readRequestCookie,
} from "@/lib/recommends/tracking";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ offerId: string }> },
) {
  const { offerId: rawOfferId } = await params;
  const offerId = Number(rawOfferId);
  if (!Number.isInteger(offerId) || offerId <= 0) {
    return new NextResponse("Affiliate offer not found", {
      status: 404,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  const result = await getOfferForRedirect(offerId);
  if (!result || !isSafeAffiliateDestination(result.offer.destinationUrl)) {
    return new NextResponse("This retailer link is currently unavailable.", {
      status: 404,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  const requestUrl = new URL(request.url);
  const userAgent = request.headers.get("user-agent");
  const bot = isAffiliateBot(userAgent);
  const clickId = randomUUID();
  const analyticsConsent = hasAnalyticsConsent(request);
  const existingSessionId = analyticsConsent
    ? readRequestCookie(request, "roadman_recommends_session")
    : null;
  const sessionId = analyticsConsent
    ? existingSessionId ?? randomUUID()
    : null;
  const destinationUrl = bot
    ? result.offer.destinationUrl
    : attachAffiliateClickId(result.offer.destinationUrl, clickId);

  const redirectResponse = () => {
    const response = NextResponse.redirect(destinationUrl, {
      status: 302,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
    if (analyticsConsent && !existingSessionId && sessionId) {
      response.cookies.set("roadman_recommends_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 90,
        path: "/",
      });
    }
    return response;
  };

  try {
    // Pre-migration preview products use a negative product ID. Their approved
    // affiliate destination still works, but no invalid foreign-key event is
    // written. Once the migration is applied, the database-backed offer records
    // normal first-party click attribution.
    if (result.product.id < 1) {
      return redirectResponse();
    }
    await db.insert(affiliateClickEvents).values({
      id: clickId,
      offerId: result.offer.id,
      productId: result.product.id,
      sessionId,
      page: request.headers.get("referer"),
      placement: requestUrl.searchParams.get("placement"),
      campaign: requestUrl.searchParams.get("campaign"),
      region: requestUrl.searchParams.get("region"),
      device: affiliateDevice(userAgent),
      referrer: request.headers.get("referer"),
      userAgent: userAgent?.slice(0, 500),
      affiliateClickId: bot ? null : clickId,
      bot,
    });
  } catch (error) {
    // Attribution failure must not strand a rider who has chosen a retailer.
    console.error("[recommends/click] unable to record click", error);
  }

  return redirectResponse();
}
