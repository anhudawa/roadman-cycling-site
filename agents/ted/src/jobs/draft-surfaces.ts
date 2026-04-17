import fs from "fs";
import path from "path";
import { findRepoRoot, loadEnv, paths } from "../config.js";
import { assertNotPaused, KillSwitchPaused } from "../lib/kill-switch.js";
import { TedLogger } from "../lib/log.js";
import { sendTedAlert } from "../lib/alert.js";
import {
  hasOpenSurfaceDraft,
  hasSurfacedRecently,
  insertSurfaceDraft,
  listActiveMembers,
} from "../lib/memory.js";
import { SkoolBrowser } from "../lib/skool-browser.js";
import { generateSurfaceForThread } from "../generators/surface-generator.js";
import type { EpisodeTopicMap, SkoolPost } from "../types.js";

export interface DraftSurfacesOpts {
  dryRun?: boolean;
  maxDraftsPerRun?: number;
}

const DEFAULT_MIN_REPLIES = 3;
const DEFAULT_HOURS_BACK = 48;

// Scan the last 48h of threads, generate surface replies via Claude, store
// them as drafted rows in ted_surface_drafts. No posting. Separate post-surfaces
// job drains the approved queue.
export async function runDraftSurfaces(
  opts: DraftSurfacesOpts = {}
): Promise<void> {
  const repoRoot = findRepoRoot();
  loadEnv(repoRoot);
  const p = paths(repoRoot);
  const logger = new TedLogger({ job: "surface-threads", logsDir: p.logsDir });
  const maxDrafts = opts.maxDraftsPerRun ?? 2;

  try {
    try {
      await assertNotPaused();
    } catch (err) {
      if (err instanceof KillSwitchPaused) {
        await logger.write({
          job: "surface-threads",
          action: "draft-paused-but-continuing",
          level: "warn",
          error: err.message,
        });
      } else {
        throw err;
      }
    }

    const email = process.env.SKOOL_EMAIL;
    const password = process.env.SKOOL_PASSWORD;
    const communitySlug = process.env.SKOOL_COMMUNITY_SLUG ?? "roadman";
    if (!email || !password) {
      throw new Error("SKOOL_EMAIL and SKOOL_PASSWORD must be set");
    }

    const episodeMap = loadEpisodeMap(p.dataDir);

    const browser = new SkoolBrowser({
      email,
      password,
      communitySlug,
      headless: true,
      screenshotDir: path.join(p.logsDir, "screenshots", `draft-surfaces-${Date.now()}`),
      dryRun: opts.dryRun,
    });

    let draftCount = 0;
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
        if (draftCount >= maxDrafts) break;

        const combinedBody = t.title ? `${t.title}\n\n${t.body}`.trim() : t.body;
        const thread: SkoolPost = {
          id: t.id,
          url: t.url,
          author: t.author,
          authorId: "",
          body: combinedBody,
          replies: t.replies,
          createdAt: "",
        };

        if (thread.replies < DEFAULT_MIN_REPLIES) continue;
        if (await hasSurfacedRecently(thread.id)) continue;
        if (await hasOpenSurfaceDraft(thread.id)) continue;
        if (/ted|anthony/i.test(thread.author)) continue;

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
            action: "draft-dry-run",
            payload: {
              threadId: thread.id,
              surfaceType: surface.surfaceType,
              body: surface.body,
              cost: surface.cost,
            },
          });
          draftCount += 1;
          continue;
        }

        const voiceFlagged = !surface.voiceCheck.pass;
        const draftId = await insertSurfaceDraft({
          skoolPostId: thread.id,
          threadUrl: thread.url,
          threadAuthor: thread.author,
          threadTitle: t.title,
          threadBody: t.body,
          surfaceType: surface.surfaceType,
          body: surface.body,
          voiceCheck: surface.voiceCheck,
          voiceFlagged,
        });
        await logger.write({
          job: "surface-threads",
          action: "drafted",
          payload: {
            draftId,
            threadId: thread.id,
            surfaceType: surface.surfaceType,
            voiceFlagged,
            cost: surface.cost,
          },
        });
        draftCount += 1;

        if (voiceFlagged) {
          await sendTedAlert({
            severity: "warn",
            subject: `Surface draft parked for review (${surface.surfaceType})`,
            body: `Thread: ${thread.url}\n\nBody:\n${surface.body}\n\nRed flags:\n- ${surface.voiceCheck.redFlags.join("\n- ")}`,
          });
        }
      }
    } finally {
      await browser.close();
    }

    await logger.write({
      job: "surface-threads",
      action: "draft-done",
      payload: { drafted: draftCount },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logger.write({
      job: "surface-threads",
      action: "draft-failed",
      level: "error",
      error: msg,
    });
    await sendTedAlert({
      severity: "error",
      subject: "draft-surfaces failed",
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
