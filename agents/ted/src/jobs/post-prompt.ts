import path from "path";
import { findRepoRoot, loadEnv, paths, dublinISODate } from "../config.js";
import { assertNotPaused, KillSwitchPaused } from "../lib/kill-switch.js";
import { TedLogger } from "../lib/log.js";
import { sendTedAlert } from "../lib/alert.js";
import {
  getNextApprovedDraft,
  markDraftPosted,
  markDraftFailed,
} from "../lib/memory.js";
import { SkoolBrowser } from "../lib/skool-browser.js";

export interface PostPromptOpts {
  dryRun?: boolean;
}

export async function runPostPrompt(opts: PostPromptOpts = {}): Promise<void> {
  const repoRoot = findRepoRoot();
  loadEnv(repoRoot);
  const p = paths(repoRoot);
  const logger = new TedLogger({ job: "post-prompt", logsDir: p.logsDir });

  try {
    const state = await assertNotPaused();
    if (!state.postPromptEnabled && !opts.dryRun) {
      await logger.write({
        job: "post-prompt",
        action: "gate-disabled",
        payload: { gate: "post_prompt_enabled" },
      });
      return;
    }

    const today = dublinISODate(new Date());
    const draft = await getNextApprovedDraft(today);
    if (!draft) {
      await logger.write({
        job: "post-prompt",
        action: "no-draft",
        payload: { today },
      });
      return;
    }

    const body = draft.editedBody ?? draft.originalBody;
    await logger.write({
      job: "post-prompt",
      action: "posting",
      payload: {
        draftId: draft.id,
        pillar: draft.pillar,
        scheduledFor: draft.scheduledFor,
        dryRun: !!opts.dryRun,
      },
    });

    const email = process.env.SKOOL_EMAIL;
    const password = process.env.SKOOL_PASSWORD;
    const communitySlug = process.env.SKOOL_COMMUNITY_SLUG ?? "roadman";
    if (!email || !password) {
      throw new Error("SKOOL_EMAIL and SKOOL_PASSWORD must be set");
    }

    const browser = new SkoolBrowser({
      email,
      password,
      communitySlug,
      headless: true,
      screenshotDir: path.join(p.logsDir, "screenshots", String(draft.id)),
      dryRun: opts.dryRun,
    });

    try {
      await browser.open();
      await browser.login();
      const result = await browser.postToCommunity({ body });

      if (opts.dryRun) {
        await logger.write({
          job: "post-prompt",
          action: "dry-run-complete",
          payload: { draftId: draft.id },
        });
        return;
      }

      if (!result) {
        throw new Error("post returned no URL");
      }

      await markDraftPosted(draft.id, result.url);
      await logger.write({
        job: "post-prompt",
        action: "posted",
        payload: { draftId: draft.id, url: result.url },
      });
    } finally {
      await browser.close();
    }
  } catch (err) {
    if (err instanceof KillSwitchPaused) {
      await logger.write({
        job: "post-prompt",
        action: "paused",
        level: "warn",
        error: err.message,
      });
      return;
    }

    const msg = err instanceof Error ? err.message : String(err);
    await logger.write({
      job: "post-prompt",
      action: "failed",
      level: "error",
      error: msg,
    });
    await sendTedAlert({
      severity: "error",
      subject: "post-prompt failed",
      body: `Exception: ${msg}`,
    });

    // Best-effort: mark the draft as failed so it doesn't block the queue forever.
    try {
      const today = dublinISODate(new Date());
      const draft = await getNextApprovedDraft(today);
      if (draft) await markDraftFailed(draft.id, msg);
    } catch {
      /* ignore */
    }

    throw err;
  }
}
