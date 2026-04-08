import fs from "fs";
import path from "path";
import { type RepurposeState } from "./types.js";

const STATE_FILE = path.join(process.cwd(), "scripts/repurpose-state.json");

const DEFAULT_STATE: RepurposeState = {
  lastRepurposeDate: "",
  processedEpisodeSlugs: [],
};

export function loadRepurposeState(): RepurposeState {
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

export function saveRepurposeState(state: RepurposeState): void {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}
