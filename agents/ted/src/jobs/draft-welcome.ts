import { findRepoRoot, loadEnv, paths } from "../config.js";
import { TedLogger } from "../lib/log.js";
import { sendTedAlert } from "../lib/alert.js";
import { listPendingWelcomes, updateWelcomeDraft } from "../lib/memory.js";
import { generateWelcome } from "../generators/welcome-generator.js";

export interface DraftWelcomeOpts {
  dryRun?: boolean;
  limit?: number;
  force?: boolean;
}

const MIN_PENDING_FOR_DAILY_BATCH = 3;

export async function runDraftWelcome(opts: DraftWelcomeOpts = {}): Promise<void> {
  const repoRoot = findRepoRoot();
  loadEnv(repoRoot);
  const p = paths(repoRoot);
  const logger = new TedLogger({ job: "draft-welcome", logsDir: p.logsDir });

  try {
    const pending = await listPendingWelcomes(opts.limit ?? 25);
    await logger.write({
      job: "draft-welcome",
      action: "start",
      payload: { count: pending.length, dryRun: !!opts.dryRun, force: !!opts.force },
    });

    if (pending.length === 0) return;

    // Daily flood protection (per spec): "skip a day if fewer than 3 new members joined
    // (daily welcomes for one person feels weird)". Force overrides for manual runs.
    if (pending.length < MIN_PENDING_FOR_DAILY_BATCH && !opts.force) {
      await logger.write({
        job: "draft-welcome",
        action: "skip-below-threshold",
        level: "warn",
        payload: {
          pending: pending.length,
          threshold: MIN_PENDING_FOR_DAILY_BATCH,
          hint: "re-run with --force to draft anyway",
        },
      });
      return;
    }

    let successCount = 0;
    for (const row of pending) {
      try {
        const answers = parseAnswers(row.questionnaireAnswers);
        const result = await generateWelcome({
          promptsDir: p.promptsDir,
          firstName: row.firstName,
          persona: row.persona,
          questionnaireAnswers: answers,
        });

        await logger.write({
          job: "draft-welcome",
          action: "generated",
          payload: {
            memberEmail: row.memberEmail,
            attempts: result.attempts,
            voiceCheckPass: result.voiceCheck.pass,
          },
        });

        if (opts.dryRun) {
          console.log(`\n--- DRY RUN welcome for ${row.firstName} <${row.memberEmail}> ---\n${result.body}\n`);
          continue;
        }

        const voiceFlagged = !result.voiceCheck.pass;
        await updateWelcomeDraft({
          memberEmail: row.memberEmail,
          draftBody: result.body,
          voiceCheck: result.voiceCheck,
          voiceFlagged,
        });

        if (voiceFlagged) {
          await sendTedAlert({
            severity: "warn",
            subject: `Welcome draft failed voice-check for ${row.firstName}`,
            body: `Email: ${row.memberEmail}\nPersona: ${row.persona ?? "listener"}\nRed flags:\n- ${result.voiceCheck.redFlags.join("\n- ")}\n\nBody:\n${result.body}`,
          });
        }

        successCount += 1;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await logger.write({
          job: "draft-welcome",
          action: "member-failed",
          level: "error",
          payload: { memberEmail: row.memberEmail },
          error: msg,
        });
      }
    }

    await logger.write({
      job: "draft-welcome",
      action: "batch-done",
      payload: { processed: pending.length, successful: successCount },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logger.write({
      job: "draft-welcome",
      action: "failed",
      level: "error",
      error: msg,
    });
    throw err;
  }
}

function parseAnswers(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "object") return Object.values(raw as Record<string, unknown>).map(String);
  return [];
}
