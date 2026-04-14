import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { isValidMarkerId, MARKERS, type MarkerId } from "@/lib/blood-engine/markers";
import { normalize } from "@/lib/blood-engine/units";

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
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  await requireBloodEngineAccess();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
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
  if (file.size === 0 || file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "file size must be 1B–10MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  const anthropic = new Anthropic({ apiKey });

  const markerCatalogue = MARKERS.map(
    (m) =>
      `- markerId: ${m.id} | name: ${m.displayName} | canonical unit: ${m.canonicalUnit} | accepted units: ${m.allowedUnits.join(", ")}`
  ).join("\n");

  const extractionSystem = `You are a blood-test PDF extraction agent. Extract ONLY the 17 markers listed below from the attached PDF. For each marker you find, return its value exactly as printed on the report AND the unit exactly as printed.

If a marker is not present in the PDF, DO NOT include it in the output. Never invent values. If you are unsure about a value, set confidence < 0.6.

Return ONLY JSON — no preamble, no markdown. Schema:

{ "extracted": [ { "markerId": "ferritin", "value": 42, "unit": "ng/mL", "confidence": 0.98 } ] }

Markers to extract:
${markerCatalogue}`;

  let raw: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: extractionSystem,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            {
              type: "text",
              text: "Extract the markers from this PDF and return JSON only.",
            },
          ],
        },
      ],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text block in Anthropic response");
    }
    raw = stripJsonFences(textBlock.text);
  } catch (err) {
    console.error("[blood-engine/parse-pdf] Anthropic call failed:", err);
    return NextResponse.json({ error: "PDF extraction failed" }, { status: 502 });
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("[blood-engine/parse-pdf] non-JSON response:", raw.slice(0, 400));
    return NextResponse.json({ error: "Extractor returned invalid JSON" }, { status: 502 });
  }

  const extractedRaw = parsed?.extracted;
  if (!Array.isArray(extractedRaw)) {
    return NextResponse.json({ error: "Extractor response missing `extracted` array" }, { status: 502 });
  }

  // Server-side normalisation + filter out any bogus entries.
  const extracted: Array<{
    markerId: MarkerId;
    originalValue: number;
    originalUnit: string;
    canonicalValue: number;
    confidence: number;
  }> = [];

  for (const entry of extractedRaw) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.markerId !== "string" || !isValidMarkerId(e.markerId)) continue;
    const value = Number(e.value);
    if (!Number.isFinite(value)) continue;
    const unit = typeof e.unit === "string" ? e.unit : "";
    const confidence = typeof e.confidence === "number" ? e.confidence : 0.5;
    try {
      const canonicalValue = normalize(e.markerId, value, unit);
      extracted.push({
        markerId: e.markerId,
        originalValue: value,
        originalUnit: unit,
        canonicalValue,
        confidence: Math.max(0, Math.min(1, confidence)),
      });
    } catch {
      // Unit didn't match — skip. User can still enter the value manually.
    }
  }

  return NextResponse.json({ extracted });
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}
