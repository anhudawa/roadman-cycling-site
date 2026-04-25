#!/usr/bin/env tsx
// ---------------------------------------------------------------------------
// Ted — Roadman Cycling Clubhouse community agent
//
// Usage:
//   tsx agents/ted/src/index.ts --job=draft-prompt [--dry-run] [--date=YYYY-MM-DD]
//   tsx agents/ted/src/index.ts --job=post-prompt [--dry-run]
//   tsx agents/ted/src/index.ts --job=draft-welcome [--dry-run] [--limit=25] [--force]
//   tsx agents/ted/src/index.ts --job=post-welcome [--dry-run] [--max=10]
//   tsx agents/ted/src/index.ts --job=draft-surfaces [--dry-run] [--max=2]
//   tsx agents/ted/src/index.ts --job=post-surfaces [--dry-run] [--max=5]
// ---------------------------------------------------------------------------

import { runDraftPrompt } from "./jobs/draft-prompt.js";
import { runPostPrompt } from "./jobs/post-prompt.js";
import { runDraftWelcome } from "./jobs/draft-welcome.js";
import { runPostWelcome } from "./jobs/post-welcome.js";
import { runDraftSurfaces } from "./jobs/draft-surfaces.js";
import { runPostSurfaces } from "./jobs/post-surfaces.js";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const flagValue = (name: string) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];

const job = flagValue("job");
const dryRun = flag("dry-run");

const JOBS = [
  "draft-prompt",
  "post-prompt",
  "draft-welcome",
  "post-welcome",
  "draft-surfaces",
  "post-surfaces",
];

async function main() {
  if (!job) {
    console.error(
      `Usage: tsx agents/ted/src/index.ts --job=<${JOBS.join("|")}> [--dry-run] [flags...]`
    );
    process.exit(1);
  }

  console.log(`=== Ted — ${job}${dryRun ? " (dry-run)" : ""} ===`);

  switch (job) {
    case "draft-prompt":
      await runDraftPrompt({ dryRun, date: flagValue("date") });
      break;
    case "post-prompt":
      await runPostPrompt({ dryRun });
      break;
    case "draft-welcome":
      await runDraftWelcome({
        dryRun,
        limit: flagValue("limit") ? Number(flagValue("limit")) : undefined,
        force: flag("force"),
      });
      break;
    case "post-welcome":
      await runPostWelcome({
        dryRun,
        max: flagValue("max") ? Number(flagValue("max")) : undefined,
      });
      break;
    case "draft-surfaces":
      await runDraftSurfaces({
        dryRun,
        maxDraftsPerRun: flagValue("max") ? Number(flagValue("max")) : undefined,
      });
      break;
    case "post-surfaces":
      await runPostSurfaces({
        dryRun,
        max: flagValue("max") ? Number(flagValue("max")) : undefined,
      });
      break;
    default:
      console.error(`Unknown job: ${job}`);
      process.exit(1);
  }

  console.log(`=== Ted — ${job} complete ===`);
}

main().catch((err) => {
  console.error("Ted failed:", err);
  process.exit(1);
});
