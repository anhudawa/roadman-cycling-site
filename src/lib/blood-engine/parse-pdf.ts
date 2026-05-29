/**
 * PDF extraction helper shared by /api/blood-engine/parse-pdf and the
 * scripts/blood-engine-test-pdf.ts CLI.
 *
 * Takes a raw PDF buffer, ships it to Claude with the 17-marker catalogue
 * as a system prompt, parses the JSON reply, validates shape, and
 * normalises every value to canonical units. Returns what the UI and the
 * CLI can both render directly.
 */

import Anthropic from "@anthropic-ai/sdk";
import { isValidMarkerId, MARKERS, type MarkerId } from "./markers";
import { normalize } from "./units";

export const PDF_EXTRACT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export interface ExtractedMarker {
  markerId: MarkerId;
  originalValue: number;
  originalUnit: string;
  canonicalValue: number;
  confidence: number;
}

/**
 * What came back from the model but didn't pass validation — surfaced for
 * diagnostics (CLI, admin views). Not returned from the API route so users
 * don't see broken rows.
 */
export interface RejectedExtraction {
  entry: Record<string, unknown>;
  reason: string;
}

export interface ParseBloodTestPdfOptions {
  client?: Anthropic;
  model?: string;
  /** Emit rejected-row diagnostics. Default: false (API route doesn't need them). */
  includeRejected?: boolean;
}

export interface ParseBloodTestPdfResult {
  extracted: ExtractedMarker[];
  rejected: RejectedExtraction[];
  /** Raw JSON string the model returned — useful for debugging malformed replies. */
  raw: string;
}

export class ParseBloodTestPdfError extends Error {
  code: "invalid_json" | "missing_extracted_array" | "upstream_failure" | "empty_response";
  constructor(code: ParseBloodTestPdfError["code"], message: string) {
    super(message);
    this.code = code;
    this.name = "ParseBloodTestPdfError";
  }
}

export async function parseBloodTestPdf(
  pdf: Buffer,
  options: ParseBloodTestPdfOptions = {}
): Promise<ParseBloodTestPdfResult> {
  const client = options.client ?? makeClient();
  const base64 = pdf.toString("base64");

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
    const response = await client.messages.create({
      model: options.model ?? "claude-sonnet-4-6",
      max_tokens: 2048,
      system: extractionSystem,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: base64 },
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
      throw new ParseBloodTestPdfError("empty_response", "No text block in Anthropic response");
    }
    raw = stripJsonFences(textBlock.text);
  } catch (err) {
    if (err instanceof ParseBloodTestPdfError) throw err;
    throw new ParseBloodTestPdfError(
      "upstream_failure",
      err instanceof Error ? err.message : "Anthropic call failed"
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ParseBloodTestPdfError("invalid_json", "Extractor returned invalid JSON");
  }

  const extractedRaw = (parsed as { extracted?: unknown })?.extracted;
  if (!Array.isArray(extractedRaw)) {
    throw new ParseBloodTestPdfError(
      "missing_extracted_array",
      "Extractor response missing `extracted` array"
    );
  }

  const extracted: ExtractedMarker[] = [];
  const rejected: RejectedExtraction[] = [];

  for (const entry of extractedRaw) {
    if (!entry || typeof entry !== "object") {
      if (options.includeRejected) {
        rejected.push({ entry: { value: String(entry) } as never, reason: "not an object" });
      }
      continue;
    }
    const e = entry as Record<string, unknown>;
    if (typeof e.markerId !== "string" || !isValidMarkerId(e.markerId)) {
      if (options.includeRejected) {
        rejected.push({ entry: e, reason: `unknown markerId "${String(e.markerId)}"` });
      }
      continue;
    }
    const value = Number(e.value);
    if (!Number.isFinite(value)) {
      if (options.includeRejected) {
        rejected.push({ entry: e, reason: `non-numeric value "${String(e.value)}"` });
      }
      continue;
    }
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
    } catch (err) {
      if (options.includeRejected) {
        rejected.push({
          entry: e,
          reason: err instanceof Error ? err.message : "unit conversion failed",
        });
      }
    }
  }

  return { extracted, rejected, raw };
}

function makeClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}
