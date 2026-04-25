import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { getSubmissionBySlug, replaceBreakdown } from "@/lib/diagnostic/store";
import { generateBreakdown } from "@/lib/diagnostic/generator";

/**
 * Admin-only regenerate endpoint. Re-runs the LLM against the stored
 * answers and swaps the breakdown in-place so Anthony can retry when
 * QA flags a specific output.
 *
 * Gated by the standard admin cookie (requireAuth redirects on
 * unauthenticated $€” for an API route that yields a 307 to /admin/login
 * which is fine from the admin UI).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAuth();

  const { slug } = await params;
  const submission = await getSubmissionBySlug(slug);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const generation = await generateBreakdown(
    submission.primaryProfile,
    submission.secondaryProfile,
    submission.answers
  );

  const updated = await replaceBreakdown(slug, generation);
  if (!updated) {
    return NextResponse.json(
      { error: "Regenerate failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    source: generation.source,
    attempts: generation.attempts,
    errors: generation.errors,
  });
}
