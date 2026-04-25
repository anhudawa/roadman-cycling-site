import fs from "fs";
import path from "path";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

export function loadEnv(repoRoot: string) {
  loadEnvFile(path.join(repoRoot, ".env.local"));
  loadEnvFile(path.join(repoRoot, ".env"));
}

export function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (
      fs.existsSync(path.join(dir, "package.json")) &&
      fs.existsSync(path.join(dir, "content/podcast"))
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return path.resolve(process.cwd());
}

export function paths(repoRoot: string) {
  return {
    promptsDir: path.join(repoRoot, "agents/ted/prompts"),
    dataDir: path.join(repoRoot, "agents/ted/data"),
    podcastDir: path.join(repoRoot, "content/podcast"),
    logsDir: path.join(repoRoot, "logs/ted"),
  };
}

// Model selection $€” matches agents/transcript-indexer conventions.
export const MODELS = {
  prompt: "claude-haiku-4-5",
  welcome: "claude-haiku-4-5",
  surface: "claude-sonnet-4-6",
  voiceCheck: "claude-opus-4-6",
} as const;

export const COST_PER_M: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1.0, output: 5.0 },
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
  "claude-opus-4-6": { input: 5.0, output: 25.0 },
};

export const MAX_VOICE_RETRIES = 2;

// Playwright politeness $€” random delay between actions to avoid looking like a scraper.
export const ACTION_JITTER_MS: [number, number] = [2000, 5000];

export const DUBLIN_TZ = "Europe/Dublin";

export const PILLARS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type Pillar = (typeof PILLARS)[number];

export const PILLAR_LABELS: Record<Pillar, string> = {
  monday: "coaching",
  tuesday: "nutrition",
  wednesday: "strength-and-conditioning",
  thursday: "recovery",
  friday: "community",
  saturday: "podcast-episode",
  sunday: "weekend-ride",
};

/** Return the weekday (0=Sunday..6=Saturday) in Dublin time for a given Date. */
export function dublinWeekday(d: Date): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: DUBLIN_TZ,
    weekday: "long",
  });
  const weekday = fmt.format(d);
  const map: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return map[weekday];
}

export function pillarForDate(d: Date): Pillar {
  return PILLARS[dublinWeekday(d)];
}

/** ISO date (YYYY-MM-DD) in Dublin timezone. */
export function dublinISODate(d: Date): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: DUBLIN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d);
}
