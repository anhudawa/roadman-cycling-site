/**
 * Replay every Blood Engine fixture against the live Anthropic API and report
 * pass/fail vs the fixture's expectations.
 *
 *   ANTHROPIC_API_KEY=… npx tsx scripts/blood-engine-replay-fixtures.ts
 *   # filter to a single fixture:
 *   npx tsx scripts/blood-engine-replay-fixtures.ts --only=04-under-fuelling-signature
 *   # save raw outputs for sports-doc review:
 *   npx tsx scripts/blood-engine-replay-fixtures.ts --save=./tmp/replay
 *
 * Bumps PROMPT_VERSION in interpretation-prompt.ts whenever the prompt changes.
 * This script is the regression harness for those bumps.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkFixture } from "../src/lib/blood-engine/fixtures/check";
import { FIXTURES } from "../src/lib/blood-engine/fixtures/index";
import { PROMPT_VERSION } from "../src/lib/blood-engine/interpretation-prompt";
import { runInterpretation } from "../src/lib/blood-engine/run-interpretation";

const args = new Map<string, string>();
for (const arg of process.argv.slice(2)) {
  const [k, v = "true"] = arg.replace(/^--/, "").split("=");
  args.set(k, v);
}
const onlyId = args.get("only");
const saveDir = args.get("save");

if (saveDir) {
  mkdirSync(saveDir, { recursive: true });
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is required");
  process.exit(1);
}

const fixtures = onlyId ? FIXTURES.filter((f) => f.id === onlyId) : FIXTURES;
if (fixtures.length === 0) {
  console.error(`No fixtures matched --only=${onlyId}`);
  process.exit(1);
}

console.log(`\nReplaying ${fixtures.length} fixture(s) against prompt ${PROMPT_VERSION}\n`);

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
}

console.log(`\nResult: ${passed} passed, ${failed} failed (${fixtures.length} total)`);
if (saveDir) console.log(`Outputs saved to ${saveDir}/`);
process.exit(failed === 0 ? 0 : 1);
