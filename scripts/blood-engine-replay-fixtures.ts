/**
 * Replay every Blood Engine fixture against the live Anthropic API and report
 * pass/fail vs the fixture's expectations.
 *
 *   ANTHROPIC_API_KEY=… npx tsx scripts/blood-engine-replay-fixtures.ts
 *   # filter to a single fixture:
 *   npx tsx scripts/blood-engine-replay-fixtures.ts --only=04-under-fuelling-signature
 *   # save raw JSON outputs:
 *   npx tsx scripts/blood-engine-replay-fixtures.ts --save=./tmp/replay
 *   # write a single Markdown review pack (for sports-doc email / Google Doc):
 *   npx tsx scripts/blood-engine-replay-fixtures.ts --md=./tmp/replay/review.md
 *
 * Bumps PROMPT_VERSION in interpretation-prompt.ts whenever the prompt changes.
 * This script is the regression harness for those bumps.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { checkFixture, type FixtureCheckResult } from "../src/lib/blood-engine/fixtures/check";
import { FIXTURES, type BloodEngineFixture } from "../src/lib/blood-engine/fixtures/index";
import { PROMPT_VERSION } from "../src/lib/blood-engine/interpretation-prompt";
import { runInterpretation } from "../src/lib/blood-engine/run-interpretation";
import type { InterpretationJSON } from "../src/lib/blood-engine/schemas";

const args = new Map<string, string>();
for (const arg of process.argv.slice(2)) {
  const [k, v = "true"] = arg.replace(/^--/, "").split("=");
  args.set(k, v);
}
const onlyId = args.get("only");
const saveDir = args.get("save");
const mdPath = args.get("md");

if (saveDir) {
  mkdirSync(saveDir, { recursive: true });
}
if (mdPath) {
  mkdirSync(dirname(mdPath), { recursive: true });
}

async function main(): Promise<number> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is required");
    return 1;
  }

  const fixtures = onlyId ? FIXTURES.filter((f) => f.id === onlyId) : FIXTURES;
  if (fixtures.length === 0) {
    console.error(`No fixtures matched --only=${onlyId}`);
    return 1;
  }

  console.log(`\nReplaying ${fixtures.length} fixture(s) against prompt ${PROMPT_VERSION}\n`);

  const mdSections: string[] = [];
  let passed = 0;
  let failed = 0;

  for (const fixture of fixtures) {
    process.stdout.write(`▸ ${fixture.id} — ${fixture.label}\n`);
    process.stdout.write(`  ${fixture.scenario}\n`);

    let result;
    try {
      result = await runInterpretation(fixture.context, fixture.results);
    } catch (err) {
      failed++;
      console.error(`  ✗ THROWN: ${err instanceof Error ? err.message : err}\n`);
      continue;
    }

    const check = checkFixture(fixture, result.interpretation);

    if (saveDir) {
      writeFileSync(
        join(saveDir, `${fixture.id}.json`),
        JSON.stringify(
          {
            fixture: { id: fixture.id, label: fixture.label, scenario: fixture.scenario },
            input: { context: fixture.context, results: fixture.results },
            interpretation: result.interpretation,
            check,
          },
          null,
          2
        )
      );
    }

    if (check.passed) {
      passed++;
      console.log(`  ✓ PASS — overall: ${result.interpretation.overall_status}`);
    } else {
      failed++;
      console.log(`  ✗ FAIL — overall: ${result.interpretation.overall_status}`);
      for (const f of check.failures) console.log(`     • ${f}`);
    }
    for (const w of check.warnings) console.log(`     ! ${w}`);
    console.log();

    if (mdPath) {
      mdSections.push(renderFixtureMd(fixture, result.interpretation, check));
    }
  }

  if (mdPath) {
    const header = [
      `# Blood Engine prompt review`,
      ``,
      `Prompt version: **${PROMPT_VERSION}**  `,
      `Generated: ${new Date().toISOString()}  `,
      `Fixtures run: ${fixtures.length}`,
      ``,
      `---`,
      ``,
    ].join("\n");
    writeFileSync(mdPath, header + mdSections.join("\n\n---\n\n") + "\n");
    console.log(`Markdown review pack written to ${mdPath}`);
  }

  console.log(`\nResult: ${passed} passed, ${failed} failed (${fixtures.length} total)`);
  if (saveDir) console.log(`Outputs saved to ${saveDir}/`);
  return failed === 0 ? 0 : 1;
}

main().then((code) => process.exit(code));

// ── Markdown rendering ────────────────────────────────────────────────────

function renderFixtureMd(
  fixture: BloodEngineFixture,
  interpretation: InterpretationJSON,
  check: FixtureCheckResult
): string {
  const lines: string[] = [];
  lines.push(`## ${fixture.label}`);
  lines.push("");
  lines.push(`_${fixture.scenario}_`);
  lines.push("");
  lines.push(check.passed ? `✅ **PASS**` : `❌ **FAIL**`);
  if (check.failures.length) {
    lines.push("");
    lines.push(`**Failures:**`);
    for (const f of check.failures) lines.push(`- ${f}`);
  }
  if (check.warnings.length) {
    lines.push("");
    lines.push(`**Warnings:**`);
    for (const w of check.warnings) lines.push(`- ${w}`);
  }
  lines.push("");
  lines.push(`### Input`);
  lines.push("");
  lines.push(`**Context:** age ${fixture.context.age}${fixture.context.sex === "m" ? "M" : "F"}, ${fixture.context.trainingHoursPerWeek}h/wk, ${fixture.context.trainingPhase}, symptoms: ${fixture.context.symptoms.join(", ") || "none"}`);
  lines.push("");
  lines.push(`| Marker | Value |`);
  lines.push(`| --- | --- |`);
  for (const r of fixture.results) {
    lines.push(`| ${r.markerId} | ${r.value} ${r.unit} |`);
  }
  lines.push("");
  lines.push(`### Interpretation`);
  lines.push("");
  lines.push(`**Overall:** \`${interpretation.overall_status}\``);
  lines.push("");
  lines.push(`> ${interpretation.summary}`);
  lines.push("");
  if (interpretation.detected_patterns.length) {
    lines.push(`**Detected patterns**`);
    lines.push("");
    for (const p of interpretation.detected_patterns) {
      lines.push(`- **${p.name}** (${p.severity}) — ${p.description}`);
    }
    lines.push("");
  }
  lines.push(`**Marker-by-marker**`);
  lines.push("");
  lines.push(`| Marker | Value | Range | Status | Interpretation |`);
  lines.push(`| --- | --- | --- | --- | --- |`);
  for (const m of interpretation.markers) {
    lines.push(
      `| ${m.name} | ${m.value} ${m.unit} | ${m.athlete_optimal_range} | ${m.status} | ${escapeMd(m.interpretation)} |`
    );
  }
  lines.push("");
  lines.push(`**Action plan**`);
  lines.push("");
  for (const a of interpretation.action_plan) {
    lines.push(`${a.priority}. ${a.action} _(${a.timeframe})_`);
  }
  lines.push("");
  lines.push(
    `**Retest:** in ${interpretation.retest_recommendation.timeframe}, focus on ${interpretation.retest_recommendation.focus_markers.join(", ") || "—"}`
  );
  return lines.join("\n");
}

function escapeMd(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
