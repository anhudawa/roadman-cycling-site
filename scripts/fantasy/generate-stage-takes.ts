/**
 * Pre-generate the 21 "Roadman take" stage notes for the daily emails
 * (Section 5.2). Drafts go into a review file for Sarah/Ted — they are
 * NEVER written to the database by this script. After review, the
 * approved file is imported with --import-approved.
 *
 * Guard rails:
 *  - Every draft runs through checkContent() (fact blocklist + AI-slop
 *    filters). A violating draft gets one regeneration with the
 *    violation fed back; if it still fails, the stage ships with an
 *    empty take (the email falls back to the factual stage line)
 *    rather than shipping slop or a forbidden attribution.
 *  - The renderer re-checks at send time, so even a bad manual edit
 *    can't reach an inbox.
 *
 * Usage:
 *   npx tsx scripts/fantasy/generate-stage-takes.ts [--dry-run]
 *   npx tsx scripts/fantasy/generate-stage-takes.ts --import-approved
 *
 * Requires ANTHROPIC_API_KEY for generation.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { checkContent } from "../../src/lib/fantasy/content-guard";

const DRY_RUN = process.argv.includes("--dry-run");
const IMPORT_APPROVED = process.argv.includes("--import-approved");
const DRAFTS_PATH = join(process.cwd(), "docs", "fantasy-tour-stage-takes.json");
const MODEL = "claude-opus-4-8";

interface StageRow {
  stageNumber: number;
  date: string;
  startTown: string;
  finishTown: string;
  distanceKm: number;
  stageType: string;
  summitFinish: boolean;
}

interface DraftRow {
  stageNumber: number;
  take: string;
  status: "pending_review" | "approved" | "rejected";
  guardViolations: string[];
  generatedAt: string;
}

const SYSTEM_PROMPT = `You write 2-3 sentence stage notes for Roadman Cycling's fantasy Tour de France daily email. The audience is serious amateur cyclists, 35-55, who already know who Lenny Martinez is — never explain basics, never hype.

Voice (Anthony Walsh, Irish cycling coach and podcaster): direct, knowledgeable, dry. Short sentences. A specific tactical observation beats a general one. It's fine to have an opinion.

Hard rules:
- 2-3 sentences, under 70 words.
- Only state facts present in the stage data you're given. Do not invent climbs, gradients, history, or rider/team details. Do not name any coach.
- No em dashes. No exclamation marks. Never open with "When it comes to", "In the world of", or a question.
- Banned words: delve, tapestry, unleash, game-changer, supercharge, embark.`;

function stagePrompt(stage: StageRow): string {
  return [
    `Stage ${stage.stageNumber} of the 2026 Tour de France.`,
    `Route: ${stage.startTown} to ${stage.finishTown}, ${stage.distanceKm} km.`,
    `Profile: ${stage.stageType}${stage.summitFinish ? ", summit finish" : ""}.`,
    `Date: ${stage.date}.`,
    "",
    "Write the stage note.",
  ].join("\n");
}

async function generateTake(client: Anthropic, stage: StageRow): Promise<DraftRow> {
  let take = "";
  let violations: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const feedback =
      attempt > 0
        ? `\n\nYour previous draft was rejected by the content filter: ${violations.join("; ")}. Rewrite it.`
        : "";
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: stagePrompt(stage) + feedback }],
    });
    if (response.stop_reason === "refusal") {
      violations = ["model refused"];
      continue;
    }
    take =
      response.content
        .find((block): block is Anthropic.TextBlock => block.type === "text")
        ?.text.trim() ?? "";
    const check = checkContent(take);
    if (check.ok) {
      return {
        stageNumber: stage.stageNumber,
        take,
        status: "pending_review",
        guardViolations: [],
        generatedAt: new Date().toISOString(),
      };
    }
    violations = check.violations.map((v) => v.detail);
  }
  console.warn(`  ⚠ Stage ${stage.stageNumber}: draft failed the content guard twice — shipping empty take`);
  return {
    stageNumber: stage.stageNumber,
    take: "",
    status: "rejected",
    guardViolations: violations,
    generatedAt: new Date().toISOString(),
  };
}

async function importApproved(): Promise<void> {
  if (!existsSync(DRAFTS_PATH)) {
    console.error(`✗ ${DRAFTS_PATH} not found — generate and review drafts first`);
    process.exit(1);
  }
  const drafts = JSON.parse(readFileSync(DRAFTS_PATH, "utf8")) as DraftRow[];
  const approved = drafts.filter((d) => d.status === "approved" && d.take.trim());
  if (approved.length === 0) {
    console.error("✗ No drafts marked approved. Sarah/Ted set status to 'approved' per stage after review.");
    process.exit(1);
  }

  const { db } = await import("../../src/lib/db");
  const { fantasyStages, fantasyAuditLog } = await import("../../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  for (const draft of approved) {
    const check = checkContent(draft.take);
    if (!check.ok) {
      console.error(`✗ Stage ${draft.stageNumber}: approved take fails the content guard — skipped:`);
      for (const violation of check.violations) console.error(`    ${violation.detail}`);
      continue;
    }
    await db
      .update(fantasyStages)
      .set({ roadmanTake: draft.take })
      .where(eq(fantasyStages.stageNumber, draft.stageNumber));
    await db.insert(fantasyAuditLog).values({
      actor: "generate-stage-takes --import-approved",
      action: "stage.take_imported",
      entity: "stage",
      entityId: String(draft.stageNumber),
      detail: { take: draft.take },
    });
    console.log(`✓ Stage ${draft.stageNumber} take imported`);
  }
}

async function main() {
  if (IMPORT_APPROVED) {
    await importApproved();
    return;
  }

  const stagesFile = JSON.parse(
    readFileSync(join(process.cwd(), "src", "data", "fantasy", "stages-2026.json"), "utf8"),
  ) as { stages: StageRow[] };

  if (DRY_RUN) {
    console.log("Dry run — prompts that would be sent:\n");
    console.log(`[system]\n${SYSTEM_PROMPT}\n`);
    console.log(`[stage 1 example]\n${stagePrompt(stagesFile.stages[0])}`);
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("✗ ANTHROPIC_API_KEY is required");
    process.exit(1);
  }
  const client = new Anthropic();

  const drafts: DraftRow[] = [];
  for (const stage of stagesFile.stages) {
    console.log(`Generating Stage ${stage.stageNumber} (${stage.startTown} → ${stage.finishTown})…`);
    drafts.push(await generateTake(client, stage));
  }

  writeFileSync(DRAFTS_PATH, JSON.stringify(drafts, null, 2) + "\n");
  const clean = drafts.filter((d) => d.status === "pending_review").length;
  console.log(`\n✓ ${clean}/21 drafts written to ${DRAFTS_PATH}`);
  console.log("Next: Sarah/Ted review each take, set status to 'approved' (editing is fine),");
  console.log("then run: npx tsx scripts/fantasy/generate-stage-takes.ts --import-approved");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
