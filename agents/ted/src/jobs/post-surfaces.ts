import path from "path";
import { findRepoRoot, loadEnv, paths } from "../config.js";
import { assertNotPaused, KillSwitchPaused } from "../lib/kill-switch.js";
import { TedLogger } from "../lib/log.js";
import { sendTedAlert } from "../lib/alert.js";
import {
  listApprovedSurfaceDrafts,
  markSurfaceDraftFailed,
  markSurfaceDraftPosted,
  recordSurfaced,
} from "../lib/memory.js";
import { SkoolBrowser } from "../lib/skool-browser.js";
import type { SurfaceType } from "../types.js";

export interface PostSurfacesOpts {
  dryRun?: boolean;
  max?: number;
}

// Drains human-approved surface drafts from ted_surface_drafts. Posts via
// Playwright, records to ted_surfaced for 48h de-dup.
export async function runPostSurfaces(opts: PostSurfacesOpts = {}): Promise<void> {
  const repoRoot = findRepoRoot();
  loadEnv(repoRoot);
  const p = paths(repoRoot);
  const logger = new TedLogger({ job: "surface-threads", logsDir: p.logsDir });

  try {
    const state = await assertNotPaused();
    if (!state.surfaceThreadsEnabled && !opts.dryRun) {
      await logger.write({
        job: "surface-threads",
        action: "post-gate-disabled",
        payload: { gate: "surface_threads_enabled" },
      });
      return;
    }

    const approved = await listApprovedSurfaceDrafts(opts.max ?? 5);
    await logger.write({
      job: "surface-threads",
      action: "post-start",
      payload: { count: approved.length, dryRun: !!opts.dryRun },
    });
    if (approved.length === 0) return;

    const email = process.env.SKOOL_EMAIL;
    const password = process.env.SKOOL_PASSWORD;
    const communitySlug = process.env.SKOOL_COMMUNITY_SLUG ?? "roadman";
    if (!email || !password) throw new Error("SKOOL_EMAIL and SKOOL_PASSWORD must be set");

    const browser = new SkoolBrowser({
      email,
      password,
      communitySlug,
      headless: true,
      screenshotDir: path.join(p.logsDir, "screenshots", `post-surfaces-${Date.now()}`),
      dryRun: opts.dryRun,
    });

    try {
      await browser.open();
      await browser.login();

      for (const row of approved) {
        const body = row.editedBody ?? row.originalBody;
        try {
          const result = await browser.replyToThread({
            threadUrl: row.threadUrl,
            body,
          });

          if (opts.dryRun) {
            await logger.write({
              job: "surface-threads",
              action: "post-dry-run",
              payload: { draftId: row.id, threadUrl: row.threadUrl },
            });
            continue;
          }

          if (!result) throw new Error("reply returned no URL");

          await markSurfaceDraftPosted(row.id, result.url);
          await recordSurfaced({
            skoolPostId: row.skoolPostId,
            surfaceType: row.surfaceType as SurfaceType,
            body,
            skoolReplyUrl: result.url,
          });
          await logger.write({
            job: "surface-threads",
            action: "posted",
            payload: {
              draftId: row.id,
              threadUrl: row.threadUrl,
              surfaceType: row.surfaceType,
            },
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await markSurfaceDraftFailed(row.id, msg);
          await logger.write({
            job: "surface-threads",
            action: "post-failed",
            level: "error",
            payload: { draftId: row.id, threadUrl: row.threadUrl },
            error: msg,
          });
        }

        const mid = await assertNotPaused();
        if (!mid.surfaceThreadsEnabled && !opts.dryRun) break;
      }
    } finally {
      await browser.close();
    }
  } catch (err) {
    if (err instanceof KillSwitchPaused) {
      await logger.write({
        job: "surface-threads",
        action: "post-paused",
        level: "warn",
        error: err.message,
      });
      return;
    }
    const msg = err instanceof Error ? err.message : String(err);
    await logger.write({
      job: "surface-threads",
      action: "post-failed",
      level: "error",
      error: msg,
    });
    await sendTedAlert({
      severity: "error",
      subject: "post-surfaces failed",
      body: msg,
    });
    throw err;
  }
}
