import { db, schema } from "./db.js";
import { eq } from "drizzle-orm";

export type JobGate =
  | "post_prompt_enabled"
  | "post_welcome_enabled"
  | "surface_threads_enabled";

export interface KillSwitchState {
  paused: boolean;
  pausedAt: Date | null;
  pausedBySlug: string | null;
  reason: string | null;
  postPromptEnabled: boolean;
  postWelcomeEnabled: boolean;
  surfaceThreadsEnabled: boolean;
}

export async function getKillSwitch(): Promise<KillSwitchState> {
  const rows = await db
    .select()
    .from(schema.tedKillSwitch)
    .where(eq(schema.tedKillSwitch.id, 1))
    .limit(1);

  const row = rows[0];
  if (!row) {
    // Seed the singleton row paused=false, all posting flags false (shadow mode default)
    await db.insert(schema.tedKillSwitch).values({
      id: 1,
      paused: false,
      postPromptEnabled: false,
      postWelcomeEnabled: false,
      surfaceThreadsEnabled: false,
    });
    return {
      paused: false,
      pausedAt: null,
      pausedBySlug: null,
      reason: null,
      postPromptEnabled: false,
      postWelcomeEnabled: false,
      surfaceThreadsEnabled: false,
    };
  }

  return {
    paused: row.paused,
    pausedAt: row.pausedAt,
    pausedBySlug: row.pausedBySlug,
    reason: row.reason,
    postPromptEnabled: row.postPromptEnabled,
    postWelcomeEnabled: row.postWelcomeEnabled,
    surfaceThreadsEnabled: row.surfaceThreadsEnabled,
  };
}

/** Throws if paused. Returns the full state so jobs can also check per-gate flags. */
export async function assertNotPaused(): Promise<KillSwitchState> {
  const state = await getKillSwitch();
  if (state.paused) {
    throw new KillSwitchPaused(state.reason ?? "manual pause");
  }
  return state;
}

export class KillSwitchPaused extends Error {
  constructor(reason: string) {
    super(`Ted is paused: ${reason}`);
    this.name = "KillSwitchPaused";
  }
}
