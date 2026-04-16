import fs from "fs";
import path from "path";
import { findRepoRoot, loadEnv, paths } from "../config.js";
import { assertNotPaused, KillSwitchPaused } from "../lib/kill-switch.js";
import { TedLogger } from "../lib/log.js";
import { sendTedAlert } from "../lib/alert.js";
import {
  hasSurfacedRecently,
  listActiveMembers,
  recordSurfaced,
} from "../lib/memory.js";
import { SkoolBrowser } from "../lib/skool-browser.js";
import { generateSurfaceForThread } from "../generators/surface-generator.js";
import type { EpisodeTopicMap, SkoolPost } from "../types.js";

export interface SurfaceThreadsOpts {
  dryRun?: boolean;
  maxSurfacesPerRun?: number;
}

const DEFAULT_MIN_REPLIES = 3;
const DEFAULT_HOURS_BACK = 48;

export async function runSurfaceThreads(
  opts: SurfaceThreadsOpts = {}
): Promise<void> {
  const repoRoot = findRepoRoot();
  loadEnv(repoRoot);
  const p = paths(repoRoot);
  const logger = new TedLogger({ job: "surface-threads", logsDir: p.logsDir });
  const maxSurfaces = opts.maxSurfacesPerRun ?? 2;

  try {
    const state = await assertNotPaused();
    if (!state.surfaceThreadsEnabled && !opts.dryRun) {
      await logger.write({
        job: "surface-threads",
        action: "gate-disabled",
        payload: { gate: "surface_threads_enabled" },
      });
      return;
    }

    const email = process.env.SKOOL_EMAIL;
    const password = process.env.SKOOL_PASSWORD;
    const communitySlug = process.env.SKOOL_COMMUNITY_SLUG ?? "roadman";
    if (!email || !password) throw new Error("SKOOL_EMAIL and SKOOL_PASSWORD must be set");

    const episodeMap = loadEpisodeMap(p.dataDir);

    const browser = new SkoolBrowser({
      email,
      password,
      communitySlug,
      headless: true,
      screenshotDir: path.join(p.logsDir, "screenshots", `surface-${Date.now()}`),
      dryRun: opts.dryRun,
    });

    let surfaceCount = 0;
    try {
      await browser.open();
      await browser.login();

      const threads = await browser.scanRecentThreads({
        hoursBack: DEFAULT_HOURS_BACK,
        maxThreads: 20,
      });
      await logger.write({
        job: "surface-threads",
        action: "scanned",
        payload: { found: threads.length },
      });

      for (const t of threads) {
        if (surfaceCount >= maxSurfaces) break;

        const thread: SkoolPost = {
          id: t.id,
          url: t.url,
          author: t.author,
          authorId: "",
          body: t.body,
          replies: t.replies,
          createdAt: "",
        };

        // Filter — the spec's criteria.
        if (thread.replies < DEFAULT_MIN_REPLIES) continue;
        if (await hasSurfacedRecently(thread.id)) continue;
        if (/ted|anthony/i.test(thread.author)) continue; // never surface Ted's or Anthony's posts

        const topicTags = inferTopicTags(thread.body);
        const members = await listActiveMembers(topicTags, 6);
        const memberCandidates = members.map((m) => ({
          firstName: m.firstName,
          topicTags: m.topicTags ?? [],
          lastSeenAt: m.lastSeenAt?.toISOString() ?? "",
          priorContributionNote: "active on related topics",
        }));

        const episodeCandidates = pickEpisodeCandidates(episodeMap, topicTags, 4);

        const surface = await generateSurfaceForThread({
          promptsDir: p.promptsDir,
          thread,
          activeMembers: memberCandidates,
          episodes: episodeCandidates,
        });

        if (!surface) {
          await logger.write({
            job: "surface-threads",
            action: "no-surface",
            payload: { threadId: thread.id, replies: thread.replies },
          });
          continue;
        }

        if (opts.dryRun) {
          await logger.write({
            job: "surface-threads",
            action: "dry-run",
            payload: {
              threadId: thread.id,
              surfaceType: surface.surfaceType,
              body: surface.body,
              cost: surface.cost,
            },
          });
          surfaceCount += 1;
          continue;
        }

        try {
          const result = await browser.replyToThread({
            threadUrl: thread.url,
            body: surface.body,
          });
          await recordSurfaced({
            skoolPostId: thread.id,
            surfaceType: surface.surfaceType,
            body: surface.body,
            skoolReplyUrl: result?.url,
          });
          await logger.write({
            job: "surface-threads",
            action: "surfaced",
            payload: {
              threadId: thread.id,
              surfaceType: surface.surfaceType,
              url: result?.url,
              cost: surface.cost,
            },
          });
          surfaceCount += 1;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await logger.write({
            job: "surface-threads",
            action: "reply-failed",
            level: "error",
            payload: { threadId: thread.id },
            error: msg,
          });
        }

        const mid = await assertNotPaused();
        if (!mid.surfaceThreadsEnabled && !opts.dryRun) break;
      }
    } finally {
      await browser.close();
    }

    await logger.write({
      job: "surface-threads",
      action: "done",
      payload: { surfaced: surfaceCount },
    });
  } catch (err) {
    if (err instanceof KillSwitchPaused) {
      await logger.write({
        job: "surface-threads",
        action: "paused",
        level: "warn",
        error: err.message,
      });
      return;
    }
    const msg = err instanceof Error ? err.message : String(err);
    await logger.write({
      job: "surface-threads",
      action: "failed",
      level: "error",
      error: msg,
    });
    await sendTedAlert({
      severity: "error",
      subject: "surface-threads failed",
      body: msg,
    });
    throw err;
  }
}

function loadEpisodeMap(dataDir: string): EpisodeTopicMap {
  const file = path.join(dataDir, "episode-topic-map.json");
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as EpisodeTopicMap;
  } catch {
    return {};
  }
}

function inferTopicTags(body: string): string[] {
  const lower = body.toLowerCase();
  const topics: string[] = [];
  const map: Array<[string, string]> = [
    ["endurance", "z2|zone 2|base|endurance|aerobic|ftp|vlamax|vo2"],
    ["nutrition", "gel|carbs|fuel|fasted|caffeine|bonk|protein|weight"],
    ["strength", "strength|hinge|squat|deadlift|s&c|lift|gym"],
    ["recovery", "sleep|recover|hrv|taper|rest day|illness|overtrain"],
    ["culture", "kit|bib|sock|group ride|half-wheel|cafe|metier|unwritten"],
  ];
  for (const [topic, pattern] of map) {
    if (new RegExp(pattern).test(lower)) topics.push(topic);
  }
  return topics;
}

function pickEpisodeCandidates(
  map: EpisodeTopicMap,
  topicTags: string[],
  limit: number
) {
  const seen = new Set<string>();
  const out: Array<{ slug: string; title: string; guest?: string; relevance: string }> = [];
  for (const tag of topicTags) {
    const list = map[tag] ?? [];
    for (const ep of list) {
      if (seen.has(ep.slug)) continue;
      seen.add(ep.slug);
      out.push({
        slug: ep.slug,
        title: ep.title,
        guest: ep.guest,
        relevance: ep.relevance,
      });
      if (out.length >= limit) return out;
    }
  }
  return out;
}
