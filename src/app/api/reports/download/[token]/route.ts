import { NextResponse, type NextRequest } from "next/server";
import {
  getPaidReportByToken,
  incrementDownloadCount,
} from "@/lib/paid-reports/reports";

/**
 * GET /api/reports/download/[token]
 *
 * Looks up a paid_report by secure-token hash. If the report is in a
 * deliverable state and has a blob-hosted PDF, streams the PDF back to
 * the rider. The token is unguessable (32 bytes base64url = ~256 bits
 * of entropy) so we don't require auth — possession of the link proves
 * ownership.
 *
 * We increment a download counter so admin can see abuse (e.g. someone
 * sharing a link widely) and revoke if needed. Revoked reports return
 * 410 Gone.
 */

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length < 20) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const report = await getPaidReportByToken(token);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (report.status === "revoked") {
    return NextResponse.json(
      { error: "This report has been revoked. Contact support for a new link." },
      { status: 410 },
    );
  }
  if (report.status === "refunded") {
    return NextResponse.json(
      { error: "This report has been refunded." },
      { status: 410 },
    );
  }
  if (!["generated", "delivered"].includes(report.status)) {
    return NextResponse.json(
      { error: "This report isn't ready yet." },
      { status: 409 },
    );
  }

  if (!report.pdfUrl) {
    return NextResponse.json(
      {
        error:
          "The PDF for this report isn't available. Use the web link instead.",
      },
      { status: 404 },
    );
  }

  // Fetch from the blob store and stream back. Keeps the blob URL
  // private — the rider only ever sees our token-scoped path.
  const upstream = await fetch(report.pdfUrl);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Could not retrieve the PDF." },
      { status: 502 },
    );
  }

  void incrementDownloadCount(report.id).catch((err) =>
    console.error("[reports/download] incrementDownloadCount failed:", err),
  );

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${report.productSlug}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
