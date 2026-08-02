import { NextResponse } from "next/server";
import { gte, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { cohortApplications } from "@/lib/db/schema";
import {
  buildGoogleAdsConversionRows,
  googleAdsConversionsToCsv,
} from "@/lib/analytics/google-ads-offline-conversions";
import { verifyBasicAuth } from "@/lib/security/basic-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const username = process.env.GOOGLE_ADS_FEED_USERNAME?.trim();
  const password = process.env.GOOGLE_ADS_FEED_PASSWORD?.trim();
  if (!username || !password) {
    return NextResponse.json(
      { error: "Google Ads conversion feed is not configured." },
      { status: 503 },
    );
  }

  if (
    !verifyBasicAuth(
      request.headers.get("authorization"),
      username,
      password,
    )
  ) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Google Ads feed"' },
    });
  }

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 90);
  const applications = await db
    .select({
      id: cohortApplications.id,
      email: cohortApplications.email,
      attribution: cohortApplications.attribution,
      status: cohortApplications.status,
      signedUpAt: cohortApplications.signedUpAt,
      createdAt: cohortApplications.createdAt,
    })
    .from(cohortApplications)
    .where(
      or(
        gte(cohortApplications.createdAt, since),
        gte(cohortApplications.signedUpAt, since),
      ),
    );
  const rows = buildGoogleAdsConversionRows(applications, { since });

  return new NextResponse(googleAdsConversionsToCsv(rows), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": 'inline; filename="google-ads-conversions.csv"',
      "Content-Type": "text/csv; charset=utf-8",
      "X-Roadman-Conversion-Rows": String(rows.length),
    },
  });
}
