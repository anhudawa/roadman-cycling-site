import fs from "fs";
import path from "path";

const STATE_FILE = path.join(process.cwd(), "scripts/sync-state.json");

export interface SyncState {
  lastSyncDate: string;
  channelId: string;
  uploadsPlaylistId: string;
  processedVideoIds: string[];
  skippedVideoIds: string[];
  episodeNumberCounter: number;
}

const DEFAULT_STATE: SyncState = {
  lastSyncDate: "",
  channelId: "",
  uploadsPlaylistId: "",
  processedVideoIds: [],
  skippedVideoIds: [],
  episodeNumberCounter: 0,
};

export function loadState(): SyncState {
  if (!fs.existsSync(STATE_FILE)) {
    return { ...DEFAULT_STATE };
  }

  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: SyncState): void {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}
