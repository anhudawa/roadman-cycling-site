import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  compareStrengthSearchSnapshots,
  renderStrengthSearchComparisonMarkdown,
  type StrengthSearchSnapshot,
} from "../src/lib/seo/strength-search-measurement";

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
    "Usage: npm run seo:strength:compare -- <baseline.json> <current.json> [--output report.md]",
  );
  process.exitCode = 1;
} else {
  const read = (path: string): StrengthSearchSnapshot =>
    JSON.parse(readFileSync(resolve(path), "utf8")) as StrengthSearchSnapshot;
  const markdown = renderStrengthSearchComparisonMarkdown(
    compareStrengthSearchSnapshots(read(baselinePath), read(currentPath)),
  );
  if (outputPath) {
    writeFileSync(resolve(outputPath), markdown, "utf8");
    console.log(`Wrote ${resolve(outputPath)}`);
  } else {
    console.log(markdown);
  }
}
