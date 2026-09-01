import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  compareRecoverySearchSnapshots,
  renderRecoverySearchComparisonMarkdown,
  type RecoverySearchSnapshot,
} from "../src/lib/seo/recovery-search-measurement";

const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");
const outputPath = outputIndex >= 0 ? args[outputIndex + 1] : undefined;
const positional =
  outputIndex >= 0
    ? args.filter(
        (_, index) => index !== outputIndex && index !== outputIndex + 1,
      )
    : args;
const [baselinePath, currentPath] = positional;

if (!baselinePath || !currentPath) {
  console.error(
    "Usage: npm run seo:recovery:compare -- <baseline.json> <current.json> [--output report.md]",
  );
  process.exitCode = 1;
} else {
  const read = (path: string): RecoverySearchSnapshot =>
    JSON.parse(readFileSync(resolve(path), "utf8")) as RecoverySearchSnapshot;
  const markdown = renderRecoverySearchComparisonMarkdown(
    compareRecoverySearchSnapshots(read(baselinePath), read(currentPath)),
  );
  if (outputPath) {
    writeFileSync(resolve(outputPath), markdown, "utf8");
    console.log(`Wrote ${resolve(outputPath)}`);
  } else {
    console.log(markdown);
  }
}
