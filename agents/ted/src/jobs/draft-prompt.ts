import { findRepoRoot, loadEnv, paths, pillarForDate, dublinISODate } from "../config.js";
import { assertNotPaused, KillSwitchPaused } from "../lib/kill-switch.js";
import { TedLogger } from "../lib/log.js";
import { sendTedAlert } from "../lib/alert.js";
import { generateDailyPrompt } from "../generators/prompt-generator.js";
import { insertDraft, getDraftForDate } from "../lib/memory.js";

export interface DraftPromptOpts {
  dryRun?: boolean;
  date?: string; // YYYY-MM-DD (optional override; defaults to tomorrow Dublin time)
}

export async function runDraftPrompt(opts: DraftPromptOpts = {}): Promise<void> {
  const repoRoot = findRepoRoot();
  loadEnv(repoRoot);
  const p = paths(repoRoot);
  const logger = new TedLogger({ job: "draft-prompt", logsDir: p.logsDir });

  try {
    // Drafting runs even when paused — "paused" means don't POST, not don't think.
    // But we still log the state.
    try {
      const state = await assertNotPaused();
      await logger.write({
        job: "draft-prompt",
        action: "start",
        payload: { state, dryRun: !!opts.dryRun },
      });
    } catch (err) {
      if (err instanceof KillSwitchPaused) {
        await logger.write({
          job: "draft-prompt",
          action: "paused-but-continuing",
          level: "warn",
          payload: { reason: err.message },
        });
      } else {
        throw err;
      }
    }

    const targetDate = opts.date ?? defaultTargetDate();
    const pillar = pillarForDate(new Date(`${targetDate}T12:00:00Z`));

    const existing = await getDraftForDate(targetDate);
    if (existing && existing.status !== "failed") {
      await logger.write({
        job: "draft-prompt",
        action: "skip-existing-draft",
        payload: { targetDate, existingId: existing.id, existingStatus: existing.status },
      });
      return;
    }

    const result = await generateDailyPrompt({
      promptsDir: p.promptsDir,
      podcastDir: p.podcastDir,
      pillar,
      targetDate,
    });

    await logger.write({
      job: "draft-prompt",
      action: "generated",
      payload: {
        targetDate,
        scheduledPillar: pillar,
        effectivePillar: result.pillar,
        attempts: result.attempts,
        voiceCheckPass: result.voiceCheck.pass,
        redFlags: result.voiceCheck.redFlags,
        cost:
          result.usage.generation.cost + result.usage.voiceCheck.cost,
        wordCount: result.body.split(/\s+/).length,
      },
    });

    if (opts.dryRun) {
      console.log("\n--- DRY RUN: generated prompt ---\n");
      console.log(result.body);
      console.log("\n--- VOICE CHECK ---");
      console.log(JSON.stringify(result.voiceCheck, null, 2));
      return;
    }

    const voiceFlagged = !result.voiceCheck.pass;
    const draftId = await insertDraft({
      pillar: result.pillar,
      scheduledFor: targetDate,
      body: result.body,
      voiceCheck: result.voiceCheck,
      attempts: result.attempts,
      voiceFlagged,
    });

    await logger.write({
      job: "draft-prompt",
      action: "persisted",
      payload: { draftId, voiceFlagged, targetDate, pillar: result.pillar },
    });

    if (voiceFlagged) {
      await sendTedAlert({
        severity: "warn",
        subject: `Draft parked for review (${result.pillar} / ${targetDate})`,
        body: `Ted generated a ${pillar} prompt but voice-check failed after ${result.attempts} attempts. Review at /admin/ted/queue.\n\nRed flags:\n- ${result.voiceCheck.redFlags.join("\n- ")}\n\nBody:\n${result.body}`,
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logger.write({
      job: "draft-prompt",
      action: "failed",
      level: "error",
      error: msg,
    });
    await sendTedAlert({
      severity: "error",
      subject: "draft-prompt failed",
      body: `Exception: ${msg}`,
    });
    throw err;
  }
}

function defaultTargetDate(): string {
  // Tomorrow in Dublin time
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return dublinISODate(tomorrow);
}
