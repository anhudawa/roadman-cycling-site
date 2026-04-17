import path from "path";
import { findRepoRoot, loadEnv, paths } from "../config.js";
import { assertNotPaused, KillSwitchPaused } from "../lib/kill-switch.js";
import { TedLogger } from "../lib/log.js";
import { sendTedAlert } from "../lib/alert.js";
import {
  listApprovedWelcomes,
  markWelcomePosted,
} from "../lib/memory.js";
import { SkoolBrowser } from "../lib/skool-browser.js";

export interface PostWelcomeOpts {
  dryRun?: boolean;
  max?: number;
}

export async function runPostWelcome(opts: PostWelcomeOpts = {}): Promise<void> {
  const repoRoot = findRepoRoot();
  loadEnv(repoRoot);
  const p = paths(repoRoot);
  const logger = new TedLogger({ job: "post-welcome", logsDir: p.logsDir });

  try {
    const state = await assertNotPaused();
    if (!state.postWelcomeEnabled && !opts.dryRun) {
      await logger.write({
        job: "post-welcome",
        action: "gate-disabled",
        payload: { gate: "post_welcome_enabled" },
      });
      return;
    }

    const toPost = await listApprovedWelcomes(opts.max ?? 10);
    await logger.write({
      job: "post-welcome",
      action: "start",
      payload: { count: toPost.length, dryRun: !!opts.dryRun },
    });
    if (toPost.length === 0) return;

    const email = process.env.SKOOL_EMAIL;
    const password = process.env.SKOOL_PASSWORD;
    const communitySlug = process.env.SKOOL_COMMUNITY_SLUG ?? "roadman";
    const introCategory = process.env.SKOOL_INTRO_CATEGORY ?? "Intro Yourself";
    if (!email || !password) throw new Error("SKOOL_EMAIL and SKOOL_PASSWORD must be set");

    const browser = new SkoolBrowser({
      email,
      password,
      communitySlug,
      headless: true,
      screenshotDir: path.join(p.logsDir, "screenshots", `welcome-${Date.now()}`),
      dryRun: opts.dryRun,
    });

    try {
      await browser.open();
      await browser.login();

      for (const row of toPost) {
        if (!row.draftBody) {
          await logger.write({
            job: "post-welcome",
            action: "skip-no-body",
            payload: { memberEmail: row.memberEmail },
          });
          continue;
        }

        try {
          const result = await browser.postToCommunity({
            body: row.draftBody,
            category: introCategory,
          });

          if (opts.dryRun) {
            await logger.write({
              job: "post-welcome",
              action: "dry-run",
              payload: { memberEmail: row.memberEmail },
            });
            continue;
          }

          if (!result) {
            throw new Error("post returned no URL");
          }

          await markWelcomePosted(row.memberEmail, result.url);
          await logger.write({
            job: "post-welcome",
            action: "posted",
            payload: { memberEmail: row.memberEmail, url: result.url },
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await logger.write({
            job: "post-welcome",
            action: "member-failed",
            level: "error",
            payload: { memberEmail: row.memberEmail },
            error: msg,
          });
          // Continue with next member — one failure shouldn't block the batch.
        }

        // Re-check the kill switch between posts.
        const mid = await assertNotPaused();
        if (!mid.postWelcomeEnabled && !opts.dryRun) break;
      }
    } finally {
      await browser.close();
    }
  } catch (err) {
    if (err instanceof KillSwitchPaused) {
      await logger.write({
        job: "post-welcome",
        action: "paused",
        level: "warn",
        error: err.message,
      });
      return;
    }
    const msg = err instanceof Error ? err.message : String(err);
    await logger.write({
      job: "post-welcome",
      action: "failed",
      level: "error",
      error: msg,
    });
    await sendTedAlert({
      severity: "error",
      subject: "post-welcome failed",
      body: msg,
    });
    throw err;
  }
}
