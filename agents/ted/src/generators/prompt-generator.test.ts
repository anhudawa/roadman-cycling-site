import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";

// Mock collaborators before importing the unit under test.
vi.mock("../lib/anthropic", () => ({
  loadPrompt: vi.fn(),
  callLLM: vi.fn(),
  callOpusAdvisor: vi.fn(),
  parseJsonResponse: vi.fn(),
}));
vi.mock("../lib/voice-check", async () => {
  const actual = await vi.importActual<typeof import("../lib/voice-check")>(
    "../lib/voice-check"
  );
  return {
    ...actual,
    runVoiceCheck: vi.fn(),
  };
});

import { callLLM, loadPrompt } from "../lib/anthropic";
import { runVoiceCheck } from "../lib/voice-check";
import { generateDailyPrompt } from "./prompt-generator";

const PASS = { pass: true, redFlags: [], notes: "", regenerationNotes: "" };
const FAIL = {
  pass: false,
  redFlags: ["ecosystem metaphor"],
  notes: "",
  regenerationNotes: "rewrite without the ecosystem word",
};

function mockLLMBodies(bodies: string[]): void {
  const m = vi.mocked(callLLM);
  m.mockReset();
  for (const body of bodies) {
    m.mockResolvedValueOnce({
      text: body,
      inputTokens: 100,
      outputTokens: 50,
      cost: 0.001,
      runtimeMs: 500,
    });
  }
}

// Tiny empty-but-valid prompt dir so fs.readdirSync / fs.readFileSync in the
// podcast scanner don't explode when the generator checks for Saturday episodes.
let emptyPodcastDir: string;

beforeEach(() => {
  vi.mocked(loadPrompt).mockReturnValue("MOCK PROMPT");
  vi.mocked(runVoiceCheck).mockReset();
  emptyPodcastDir = fs.mkdtempSync(path.join(os.tmpdir(), "ted-test-"));
});

describe("generateDailyPrompt", () => {
  it("returns the first body on a clean voice-check pass", async () => {
    mockLLMBodies(["Question for the group.\n\n— Ted"]);
    vi.mocked(runVoiceCheck).mockResolvedValue({
      result: PASS,
      usage: { inputTokens: 100, outputTokens: 50, cost: 0.005, runtimeMs: 300 },
      modelUsed: "claude-opus-4-6",
    });

    const result = await generateDailyPrompt({
      promptsDir: "/ignored",
      podcastDir: emptyPodcastDir,
      pillar: "monday",
      targetDate: "2026-04-20",
    });

    expect(result.body).toContain("Question for the group");
    expect(result.voiceCheck.pass).toBe(true);
    expect(result.attempts).toBe(1);
    expect(callLLM).toHaveBeenCalledTimes(1);
  });

  it("retries with regeneration notes when voice-check fails, succeeds on second attempt", async () => {
    // Bodies must not trip the cheap banned-word scanner — voice-check is the
    // gate under test here. Polished aphoristic phrasing fails the LLM gate
    // but passes the cheap scan.
    mockLLMBodies([
      "A perfect sentence that sounds like an Instagram caption.\n\n— Ted",
      "A cleaner rewrite about Z2 that sounds natural.\n\n— Ted",
    ]);
    vi.mocked(runVoiceCheck)
      .mockResolvedValueOnce({
        result: FAIL,
        usage: { inputTokens: 80, outputTokens: 30, cost: 0.003, runtimeMs: 200 },
        modelUsed: "claude-opus-4-6",
      })
      .mockResolvedValueOnce({
        result: PASS,
        usage: { inputTokens: 70, outputTokens: 25, cost: 0.002, runtimeMs: 180 },
        modelUsed: "claude-opus-4-6",
      });

    const result = await generateDailyPrompt({
      promptsDir: "/ignored",
      podcastDir: emptyPodcastDir,
      pillar: "tuesday",
      targetDate: "2026-04-21",
    });

    expect(result.voiceCheck.pass).toBe(true);
    expect(result.body).toContain("cleaner rewrite");
    expect(result.attempts).toBe(2);
    expect(callLLM).toHaveBeenCalledTimes(2);

    // Second call's userMessage should carry the regeneration feedback
    const secondCall = vi.mocked(callLLM).mock.calls[1][0];
    expect(secondCall.userMessage).toContain("Previous attempt failed voice check");
    expect(secondCall.userMessage).toContain("rewrite without the ecosystem word");
  });

  it("stops retrying after MAX_VOICE_RETRIES and returns the last attempt flagged", async () => {
    // Polished-but-clean bodies — voice-check fails all three, cheap scan passes.
    mockLLMBodies([
      "Polished aphorism number one.\n\n— Ted",
      "Polished aphorism number two.\n\n— Ted",
      "Polished aphorism number three.\n\n— Ted",
    ]);
    vi.mocked(runVoiceCheck).mockResolvedValue({
      result: FAIL,
      usage: { inputTokens: 80, outputTokens: 30, cost: 0.003, runtimeMs: 200 },
      modelUsed: "claude-opus-4-6",
    });

    const result = await generateDailyPrompt({
      promptsDir: "/ignored",
      podcastDir: emptyPodcastDir,
      pillar: "wednesday",
      targetDate: "2026-04-22",
    });

    expect(result.voiceCheck.pass).toBe(false);
    expect(result.attempts).toBe(3);
    expect(callLLM).toHaveBeenCalledTimes(3);
  });

  it("short-circuits when the cheap banned-word scan fires", async () => {
    // "delve" is in the cheap scanner; voice-check should never be called
    // for that attempt, but the retry still happens.
    mockLLMBodies([
      "Let's delve into Z2 training.\n\n— Ted",
      "Z2 question: what's your FTP protocol?\n\n— Ted",
    ]);
    vi.mocked(runVoiceCheck).mockResolvedValue({
      result: PASS,
      usage: { inputTokens: 70, outputTokens: 25, cost: 0.002, runtimeMs: 180 },
      modelUsed: "claude-opus-4-6",
    });

    const result = await generateDailyPrompt({
      promptsDir: "/ignored",
      podcastDir: emptyPodcastDir,
      pillar: "thursday",
      targetDate: "2026-04-23",
    });

    expect(result.voiceCheck.pass).toBe(true);
    expect(result.attempts).toBe(2);
    // Voice check only ran for the clean attempt
    expect(runVoiceCheck).toHaveBeenCalledTimes(1);
  });

  it("honours a [SKIP marker and returns a flagged draft for human review", async () => {
    mockLLMBodies(["[SKIP — no recent episode found]"]);

    const result = await generateDailyPrompt({
      promptsDir: "/ignored",
      podcastDir: emptyPodcastDir,
      pillar: "saturday",
      targetDate: "2026-04-25",
    });

    expect(result.body.startsWith("[SKIP")).toBe(true);
    expect(result.voiceCheck.pass).toBe(false);
    expect(result.voiceCheck.redFlags).toContain("generator returned SKIP marker");
    // SKIP short-circuits the loop; runVoiceCheck should never run
    expect(runVoiceCheck).not.toHaveBeenCalled();
  });
});
