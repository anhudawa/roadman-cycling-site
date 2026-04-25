import { NextResponse } from "next/server";
import { getSubmissionBySlug } from "@/lib/diagnostic/store";
import { maskEmail } from "@/lib/admin/events-store";

/**
 * Public read endpoint for a diagnostic result. Returns only the
 * render-safe fields $€” we never expose the raw email or the full
 * question answers over this route. Admins pull more detail from the
 * admin stats page, which reads from the DB directly.
 */
export async function GET(
  _request: Request,
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

  return NextResponse.json({
    slug: submission.slug,
    primaryProfile: submission.primaryProfile,
    secondaryProfile: submission.secondaryProfile,
    severeMultiSystem: submission.severeMultiSystem,
    closeToBreakthrough: submission.closeToBreakthrough,
    breakdown: submission.breakdown,
    emailHint: maskEmail(submission.email),
    createdAt: submission.createdAt.toISOString(),
  });
}
