import { NextResponse } from "next/server";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import {
  PDF_EXTRACT_MAX_SIZE_BYTES,
  parseBloodTestPdf,
  ParseBloodTestPdfError,
} from "@/lib/blood-engine/parse-pdf";
import {
  enforceRateLimit,
  RateLimitError,
  recordApiCall,
} from "@/lib/blood-engine/rate-limit";

/**
 * Parse a blood-test PDF with Claude's native PDF support.
 *
 * POST (multipart/form-data): field `file` (application/pdf, ≤10MB)
 *
 * Returns: { extracted: Array<{ markerId, originalValue, originalUnit, canonicalValue, confidence }> }
 *
 * The user reviews the extraction on the UI before submitting for interpretation —
 * Claude's PDF support is good but not perfect, and blood-test PDFs vary wildly
 * by provider. Confidence is 0-1 per marker.
 */

export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await requireBloodEngineAccess();

  try {
    await enforceRateLimit(user.id, "parse-pdf");
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: err.message, retryAfterSeconds: err.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(err.retryAfterSeconds) } }
      );
    }
    throw err;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing `file` field" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "file must be application/pdf" }, { status: 400 });
  }
  if (file.size === 0 || file.size > PDF_EXTRACT_MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "file size must be 1B–10MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let result;
  try {
    result = await parseBloodTestPdf(buffer);
  } catch (err) {
    if (err instanceof ParseBloodTestPdfError) {
      const status =
        err.code === "upstream_failure" || err.code === "empty_response" ? 502 : 502;
      console.error(`[blood-engine/parse-pdf] ${err.code}: ${err.message}`);
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[blood-engine/parse-pdf] unexpected:", err);
    return NextResponse.json({ error: "PDF extraction failed" }, { status: 502 });
  }

  // Charge a slot only once the upstream call succeeded.
  await recordApiCall(user.id, "parse-pdf");

  return NextResponse.json({ extracted: result.extracted });
}
