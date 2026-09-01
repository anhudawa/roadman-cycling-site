import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import {
  prioritiseSearchOpportunities,
  renderSearchOpportunityReport,
  type OpportunityPageContext,
  type RollingPageOpportunity,
} from "../src/lib/seo/search-opportunity-prioritisation";

interface RollingOpportunityScan {
  property: string;
  capturedAt: string;
  dataThrough: string;
  opportunities: {
    pages: RollingPageOpportunity[];
    queries?: Array<{
      query: string;
      currentClicks: number;
      currentImpressions: number;
      previousClicks: number;
      previousImpressions: number;
    }>;
  };
}

const args = process.argv.slice(2);
const optionValues = new Map<string, string>();
const positional: string[] = [];
for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (["--output", "--json-output", "--as-of"].includes(argument)) {
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`${argument} requires a value.`);
    }
    optionValues.set(argument, value);
    index += 1;
  } else {
    positional.push(argument);
  }
}
const [inputPath] = positional;
const outputPath = optionValues.get("--output");
const jsonOutputPath = optionValues.get("--json-output");
const asOf =
  optionValues.get("--as-of") ?? new Date().toISOString().slice(0, 10);

if (!inputPath) {
  console.error(
    "Usage: npm run seo:opportunities -- <rolling-scan.json> [--as-of YYYY-MM-DD] [--output report.md] [--json-output queue.json]",
  );
  process.exitCode = 1;
} else {
  const scan = JSON.parse(
    readFileSync(resolve(inputPath), "utf8"),
  ) as RollingOpportunityScan;

  const findSourceFile = (routePath: string): string | null => {
    const segments = routePath.split("/").filter(Boolean);
    const [section, ...rest] = segments;
    const slug = rest.join("/");
    if (["blog", "topics", "best", "answers"].includes(section ?? "")) {
      const directCandidates = [
        `content/${section}/${slug}.mdx`,
        `content/${section}/${slug}.md`,
      ];
      const direct = directCandidates.find((candidate) =>
        existsSync(candidate),
      );
      if (direct) return direct;
    }

    const routeSuffix = `${segments.join("/")}/page.tsx`;
    const walk = (directory: string): string | null => {
      if (!existsSync(directory)) return null;
      for (const entry of readdirSync(directory)) {
        const candidate = `${directory}/${entry}`;
        if (statSync(candidate).isDirectory()) {
          const found = walk(candidate);
          if (found) return found;
        } else if (
          candidate.endsWith(routeSuffix) &&
          !candidate.includes("/[slug]/")
        ) {
          return candidate;
        }
      }
      return null;
    };

    return walk("src/app");
  };

  const lastChangedAt = (sourceFile: string | null): string | null => {
    if (!sourceFile) return null;
    try {
      const output = execFileSync(
        "git",
        ["log", "-1", "--format=%cs", "--", sourceFile],
        { encoding: "utf8" },
      ).trim();
      return output || null;
    } catch {
      return null;
    }
  };

  const contexts = new Map<string, OpportunityPageContext>();
  for (const row of scan.opportunities.pages) {
    const sourceFile = findSourceFile(row.path);
    contexts.set(row.path, {
      sourceFile,
      lastChangedAt: lastChangedAt(sourceFile),
    });
  }

  const opportunities = prioritiseSearchOpportunities(
    scan.opportunities.pages,
    contexts,
    asOf,
  );
  const markdown = renderSearchOpportunityReport({
    property: scan.property,
    capturedAt: scan.capturedAt,
    dataThrough: scan.dataThrough,
    asOf,
    opportunities,
    queryInvestigations: scan.opportunities.queries,
  });

  if (outputPath) {
    writeFileSync(resolve(outputPath), markdown, "utf8");
    console.log(`Wrote ${resolve(outputPath)}`);
  } else {
    console.log(markdown);
  }

  if (jsonOutputPath) {
    writeFileSync(
      resolve(jsonOutputPath),
      `${JSON.stringify({ asOf, opportunities }, null, 2)}\n`,
      "utf8",
    );
    console.log(`Wrote ${resolve(jsonOutputPath)}`);
  }
}
