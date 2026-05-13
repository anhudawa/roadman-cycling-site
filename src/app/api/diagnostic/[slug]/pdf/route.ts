import { NextResponse } from "next/server";
import { getSubmissionBySlug } from "@/lib/diagnostic/store";
import {
  renderDiagnosticPdf,
  diagnosticPdfFilename,
} from "@/lib/diagnostic/pdf";

/**
 * Branded PDF for a diagnostic result. Streamed straight off the
 * stored submission — same data as /diagnostic/[slug], just laid out
 * for download. No auth: slugs are unguessable and the page already
 * relies on that posture. Robots are blocked at the page level; this
 * route gets the same `noindex` posture via response header.
 */

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug || slug.length > 32) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const submission = await getSubmissionBySlug(slug);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let pdf: Buffer;
  try {
    pdf = await renderDiagnosticPdf({
      slug: submission.slug,
      primary: submission.primaryProfile,
      closeToBreakthrough: submission.closeToBreakthrough,
      breakdown: submission.breakdown,
      createdAt: submission.createdAt,
    });
  } catch (err) {
    console.error("[Diagnostic PDF] render failed:", err);
    return NextResponse.json(
      { error: "Could not render PDF." },
      { status: 500 }
    );
  }

  const filename = diagnosticPdfFilename({
    primary: submission.primaryProfile,
    closeToBreakthrough: submission.closeToBreakthrough,
    slug: submission.slug,
  });

  // `?inline=1` opens in-browser; default forces download. The button
  // on the results page uses the default; share links can opt in.
  const url = new URL(request.url);
  const inline = url.searchParams.get("inline") === "1";

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "private, max-age=300",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
