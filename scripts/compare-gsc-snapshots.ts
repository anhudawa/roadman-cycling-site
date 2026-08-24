import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  compareGscSnapshots,
  renderGscComparisonMarkdown,
  type GscSnapshot,
} from "../src/lib/seo/gsc-measurement";

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
    "Usage: npm run seo:gsc:compare -- <baseline.json> <current.json> [--output report.md]",
  );
  process.exitCode = 1;
} else {
  const readSnapshot = (path: string): GscSnapshot =>
    JSON.parse(readFileSync(resolve(path), "utf8")) as GscSnapshot;

  const markdown = renderGscComparisonMarkdown(
    compareGscSnapshots(
      readSnapshot(baselinePath),
      readSnapshot(currentPath),
    ),
  );

  if (outputPath) {
    writeFileSync(resolve(outputPath), markdown, "utf8");
    console.log(`Wrote ${resolve(outputPath)}`);
  } else {
    console.log(markdown);
  }
}
