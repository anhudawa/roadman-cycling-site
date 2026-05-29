/**
 * One-shot PDF extraction test — point at a local blood-test PDF and see
 * exactly what the Blood Engine extractor pulls out, no DB writes, no auth.
 *
 *   ANTHROPIC_API_KEY=… npm run blood-engine:test-pdf -- tmp/pdfs/my-file.pdf
 *   # with full interpretation on top of extraction:
 *   ANTHROPIC_API_KEY=… npm run blood-engine:test-pdf -- tmp/pdfs/my-file.pdf --interpret
 *   # save the raw model output to ./tmp/ for debugging:
 *   ANTHROPIC_API_KEY=… npm run blood-engine:test-pdf -- tmp/pdfs/my-file.pdf --save
 *
 * The harness renders:
 *   - File + size
 *   - Per-marker row: displayName, original value+unit, canonical value+unit,
 *     ATHLETE-OPTIMAL range, quick status classification
 *   - List of panel markers NOT found (so you know what's missing)
 *   - Rejected rows with reasons (usually unit mismatch or unknown marker)
 *   - If --interpret: the full Claude interpretation against male-default
 *     context (you can edit the context below to match your own situation)
 */

import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";
import { classifyValue, getMarker, MARKERS } from "../src/lib/blood-engine/markers";
import { parseBloodTestPdf } from "../src/lib/blood-engine/parse-pdf";
import { runInterpretation } from "../src/lib/blood-engine/run-interpretation";
import type { ReportContext } from "../src/lib/blood-engine/schemas";

// ── Defaults you can tweak ────────────────────────────────────────────────
// The --interpret flag runs the full interpretation pipeline. Adjust the
// context object to match the owner of the PDF (age, sex, training load,
// symptoms, draw date) for a realistic test.
const DEFAULT_INTERPRET_CONTEXT: ReportContext = {
  age: 45,
  sex: "m",
  trainingHoursPerWeek: 10,
  trainingPhase: "build",
  symptoms: [],
  drawDate: new Date().toISOString().slice(0, 10),
};

// ── CLI arg parsing ──────────────────────────────────────────────────────
const rawArgs = process.argv.slice(2);
const flags = new Set(rawArgs.filter((a) => a.startsWith("--")));
const positional = rawArgs.filter((a) => !a.startsWith("--"));

if (positional.length === 0) {
  console.error("Usage: npm run blood-engine:test-pdf -- <path> [--interpret] [--save]");
  process.exit(1);
}

async function main() {

const pdfPath = resolve(positional[0]);
if (!existsSync(pdfPath)) {
  console.error(`✗ File not found: ${pdfPath}`);
  process.exit(1);
}

const stats = statSync(pdfPath);
if (stats.size === 0) {
  console.error("✗ File is empty");
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("✗ ANTHROPIC_API_KEY not set");
  process.exit(1);
}

// ── Extract ──────────────────────────────────────────────────────────────
console.log(`\n▸ ${basename(pdfPath)}  (${(stats.size / 1024).toFixed(1)} KB)\n`);

const buffer = readFileSync(pdfPath);

const t0 = Date.now();
const result = await parseBloodTestPdf(buffer, { includeRejected: true });
const elapsedMs = Date.now() - t0;

console.log(`Extraction finished in ${(elapsedMs / 1000).toFixed(1)}s`);
console.log(`  Extracted: ${result.extracted.length} / ${MARKERS.length} markers`);
console.log(`  Rejected:  ${result.rejected.length}`);
console.log();

// ── Pretty table ─────────────────────────────────────────────────────────
if (result.extracted.length > 0) {
  console.log("Extracted markers");
  console.log("─".repeat(110));
  console.log(
    pad("Marker", 22) +
      pad("As printed", 20) +
      pad("Canonical", 20) +
      pad("Athlete-optimal (M)", 20) +
      pad("Status", 14) +
      "Conf."
  );
  console.log("─".repeat(110));

  for (const e of result.extracted) {
    const m = getMarker(e.markerId);
    const opt = m.optimal.m;
    const range =
      opt.low !== null && opt.high !== null
        ? `${opt.low}–${opt.high}`
        : opt.low !== null
          ? `>${opt.low}`
          : opt.high !== null
            ? `<${opt.high}`
            : "—";
    const status = classifyValue(e.markerId, e.canonicalValue, "m");
    const statusColour =
      status === "optimal" ? "\x1b[32m" : status === "suboptimal" ? "\x1b[33m" : "\x1b[31m";

    console.log(
      pad(m.displayName, 22) +
        pad(`${e.originalValue} ${e.originalUnit}`, 20) +
        pad(`${e.canonicalValue} ${m.canonicalUnit}`, 20) +
        pad(`${range} ${m.canonicalUnit}`, 20) +
        statusColour +
        pad(status, 14) +
        "\x1b[0m" +
        `${(e.confidence * 100).toFixed(0)}%`
    );
  }
  console.log("─".repeat(110));
}

// ── Missing markers ──────────────────────────────────────────────────────
const foundIds = new Set(result.extracted.map((e) => e.markerId));
const missing = MARKERS.filter((m) => !foundIds.has(m.id));
if (missing.length > 0) {
  console.log(`\nNot found in PDF (${missing.length}):`);
  for (const m of missing) {
    console.log(`  • ${m.displayName}`);
  }
}

// ── Rejected rows ────────────────────────────────────────────────────────
if (result.rejected.length > 0) {
  console.log(`\nRejected rows from model output (${result.rejected.length}):`);
  for (const r of result.rejected) {
    console.log(`  ✗ ${JSON.stringify(r.entry)} — ${r.reason}`);
  }
}

// ── Save raw output for debugging ────────────────────────────────────────
if (flags.has("--save")) {
  const outPath = pdfPath.replace(/\.pdf$/i, ".extraction.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        file: basename(pdfPath),
        elapsedMs,
        extracted: result.extracted,
        rejected: result.rejected,
        raw: result.raw,
      },
      null,
      2
    )
  );
  console.log(`\nRaw output saved to ${outPath}`);
}

// ── Optional full interpretation ─────────────────────────────────────────
if (flags.has("--interpret")) {
  if (result.extracted.length === 0) {
    console.log("\nNo markers extracted — skipping interpretation.");
    process.exit(0);
  }

  console.log(`\n─ Running interpretation with default context ─`);
  console.log(
    `  age ${DEFAULT_INTERPRET_CONTEXT.age}, sex ${DEFAULT_INTERPRET_CONTEXT.sex}, ${DEFAULT_INTERPRET_CONTEXT.trainingHoursPerWeek}h/wk, ${DEFAULT_INTERPRET_CONTEXT.trainingPhase}`
  );
  console.log(`  (edit DEFAULT_INTERPRET_CONTEXT at the top of the script to change)\n`);

  const t1 = Date.now();
  const interp = await runInterpretation(
    DEFAULT_INTERPRET_CONTEXT,
    result.extracted.map((e) => ({
      markerId: e.markerId,
      value: e.canonicalValue,
      unit: getMarker(e.markerId).canonicalUnit,
    }))
  );
  const interpElapsed = Date.now() - t1;
  console.log(`Interpretation finished in ${(interpElapsed / 1000).toFixed(1)}s (prompt ${interp.promptVersion})`);
  console.log();

  const { interpretation: i } = interp;
  const statusColour =
    i.overall_status === "optimal"
      ? "\x1b[32m"
      : i.overall_status === "suboptimal"
        ? "\x1b[33m"
        : "\x1b[31m";
  console.log(`OVERALL: ${statusColour}${i.overall_status.toUpperCase()}\x1b[0m`);
  console.log(`${i.summary}\n`);

  if (i.detected_patterns.length > 0) {
    console.log("Patterns detected:");
    for (const p of i.detected_patterns) {
      console.log(`  ▸ ${p.name}  [${p.severity}]`);
      console.log(`    ${p.description}`);
    }
    console.log();
  }

  console.log("Action plan:");
  for (const a of i.action_plan) {
    console.log(`  ${a.priority}. ${a.action}  (${a.timeframe})`);
  }
  console.log();
  console.log(
    `Retest in ${i.retest_recommendation.timeframe}. Focus: ${i.retest_recommendation.focus_markers.join(", ") || "—"}`
  );
  console.log();

  if (flags.has("--save")) {
    const interpPath = pdfPath.replace(/\.pdf$/i, ".interpretation.json");
    writeFileSync(interpPath, JSON.stringify(interp, null, 2));
    console.log(`Interpretation saved to ${interpPath}`);
  }
}

main();

function pad(s: string, n: number): string {
  if (s.length >= n) return s.slice(0, n - 1) + " ";
  return s + " ".repeat(n - s.length);
}
