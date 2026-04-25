import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SkoolPost } from "../types";

// Mock the heavy collaborators before importing the unit under test.
vi.mock("../lib/anthropic", () => ({
  loadPrompt: vi.fn(() => "MOCK SYSTEM PROMPT"),
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

import { callLLM } from "../lib/anthropic";
import { runVoiceCheck } from "../lib/voice-check";
import { generateSurfaceForThread } from "./surface-generator";

const thread: SkoolPost = {
  id: "thread-1",
  url: "https://skool.com/roadman/posts/thread-1",
  author: "Alice",
  authorId: "alice-1",
  body: "How do you structure winter base?",
  replies: 5,
  createdAt: new Date().toISOString(),
};

const candidateMembers = [
  {
    firstName: "SeÃ¡n",
    topicTags: ["endurance"],
    lastSeenAt: new Date().toISOString(),
    priorContributionNote: "winter base Q in November",
  },
];

const candidateEpisodes = [
  {
    slug: "ep-8-how-to-structure-winter-training",
    title: "How To Structure Winter Training",
    guest: "Daryl Fitzgerald",
    relevance: "polarised winter blocks",
  },
];

const PASS = { pass: true, redFlags: [], notes: "", regenerationNotes: "" };
const FAIL = {
  pass: false,
  redFlags: ["ecosystem metaphor"],
  notes: "",
  regenerationNotes: "avoid ecosystem",
};

function mockedCallLLM(bodies: string[]): void {
  const m = vi.mocked(callLLM);
  m.mockReset();
  for (const body of bodies) {
    m.mockResolvedValueOnce({
      text: body,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
      runtimeMs: 0,
    });
  }
}

describe("generateSurfaceForThread $€” cascade", () => {
  beforeEach(() => {
    vi.mocked(runVoiceCheck).mockReset();
  });

  it("picks tag first when a real body comes back", async () => {
    mockedCallLLM(["@SeÃ¡n you were talking about winter base $€” might have a take.\n\n$€” Ted"]);
    vi.mocked(runVoiceCheck).mockResolvedValue({
      result: PASS,
      usage: { inputTokens: 0, outputTokens: 0, cost: 0, runtimeMs: 0 },
      modelUsed: "claude-opus-4-6",
    });

    const result = await generateSurfaceForThread({
      promptsDir: "/ignored",
      thread,
      activeMembers: candidateMembers,
      episodes: candidateEpisodes,
    });

    expect(result).not.toBeNull();
    expect(result?.surfaceType).toBe("tag");
    expect(result?.body).toContain("@SeÃ¡n");
    expect(callLLM).toHaveBeenCalledTimes(1);
  });

  it("falls through from tag SKIP to link", async () => {
    mockedCallLLM([
      "[SKIP $€” no match]",
      "Episode 8 with Daryl Fitzgerald covers exactly this.\n\n$€” Ted",
    ]);
    vi.mocked(runVoiceCheck).mockResolvedValue({
      result: PASS,
      usage: { inputTokens: 0, outputTokens: 0, cost: 0, runtimeMs: 0 },
      modelUsed: "claude-opus-4-6",
    });

    const result = await generateSurfaceForThread({
      promptsDir: "/ignored",
      thread,
      activeMembers: candidateMembers,
      episodes: candidateEpisodes,
    });

    expect(result?.surfaceType).toBe("link");
    expect(callLLM).toHaveBeenCalledTimes(2);
  });

  it("falls through from tag and link to summary", async () => {
    mockedCallLLM([
      "[SKIP $€” no match]",
      "[SKIP $€” no match]",
      "Good thread for anyone lurking $€” three takes so far.\n\n$€” Ted",
    ]);
    vi.mocked(runVoiceCheck).mockResolvedValue({
      result: PASS,
      usage: { inputTokens: 0, outputTokens: 0, cost: 0, runtimeMs: 0 },
      modelUsed: "claude-opus-4-6",
    });

    const result = await generateSurfaceForThread({
      promptsDir: "/ignored",
      thread,
      activeMembers: candidateMembers,
      episodes: candidateEpisodes,
    });

    expect(result?.surfaceType).toBe("summary");
    expect(callLLM).toHaveBeenCalledTimes(3);
  });

  it("returns null if all three variants SKIP or fail voice-check", async () => {
    mockedCallLLM([
      "[SKIP $€” no match]",
      "[SKIP $€” no match]",
      "[SKIP $€” thread too thin]",
    ]);

    const result = await generateSurfaceForThread({
      promptsDir: "/ignored",
      thread,
      activeMembers: candidateMembers,
      episodes: candidateEpisodes,
    });

    expect(result).toBeNull();
  });

  it("skips a variant whose voice-check fails", async () => {
    mockedCallLLM([
      "A tag reply that trips the voice-check.\n\n$€” Ted",
      "Episode 8 with Daryl Fitzgerald.\n\n$€” Ted",
    ]);
    vi.mocked(runVoiceCheck)
      .mockResolvedValueOnce({
        result: FAIL,
        usage: { inputTokens: 0, outputTokens: 0, cost: 0, runtimeMs: 0 },
        modelUsed: "claude-opus-4-6",
      })
      .mockResolvedValueOnce({
        result: PASS,
        usage: { inputTokens: 0, outputTokens: 0, cost: 0, runtimeMs: 0 },
        modelUsed: "claude-opus-4-6",
      });

    const result = await generateSurfaceForThread({
      promptsDir: "/ignored",
      thread,
      activeMembers: candidateMembers,
      episodes: candidateEpisodes,
    });

    expect(result?.surfaceType).toBe("link");
  });

  it("does not attempt tag when no active members are provided", async () => {
    mockedCallLLM([
      "Episode 8 with Daryl Fitzgerald.\n\n$€” Ted",
    ]);
    vi.mocked(runVoiceCheck).mockResolvedValue({
      result: PASS,
      usage: { inputTokens: 0, outputTokens: 0, cost: 0, runtimeMs: 0 },
      modelUsed: "claude-opus-4-6",
    });

    const result = await generateSurfaceForThread({
      promptsDir: "/ignored",
      thread,
      activeMembers: [],
      episodes: candidateEpisodes,
    });

    expect(result?.surfaceType).toBe("link");
    expect(callLLM).toHaveBeenCalledTimes(1);
  });

  it("drops a variant whose draft contains a banned phrase", async () => {
    // "delve" is in the quick-banned-word scanner's list
    mockedCallLLM([
      "Let me delve into winter base.\n\n$€” Ted",
      "Episode 8 with Daryl Fitzgerald.\n\n$€” Ted",
    ]);
    vi.mocked(runVoiceCheck).mockResolvedValue({
      result: PASS,
      usage: { inputTokens: 0, outputTokens: 0, cost: 0, runtimeMs: 0 },
      modelUsed: "claude-opus-4-6",
    });

    const result = await generateSurfaceForThread({
      promptsDir: "/ignored",
      thread,
      activeMembers: candidateMembers,
      episodes: candidateEpisodes,
    });

    expect(result?.surfaceType).toBe("link");
    // Tag variant was dropped by the cheap scan before voice-check ran
    expect(vi.mocked(runVoiceCheck)).toHaveBeenCalledTimes(1);
  });
});
