import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../lib/anthropic", () => ({
  loadPrompt: vi.fn(() => "MOCK PROMPT"),
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
import { generateWelcome } from "./welcome-generator";

const PASS = { pass: true, redFlags: [], notes: "", regenerationNotes: "" };
const FAIL = {
  pass: false,
  redFlags: ["missing sign-off"],
  notes: "body cuts off",
  regenerationNotes: "add '$€” Ted' on its own line at the end",
};

function mockLLMBodies(bodies: string[]): void {
  const m = vi.mocked(callLLM);
  m.mockReset();
  for (const body of bodies) {
    m.mockResolvedValueOnce({
      text: body,
      inputTokens: 90,
      outputTokens: 40,
      cost: 0.001,
      runtimeMs: 400,
    });
  }
}

beforeEach(() => {
  vi.mocked(runVoiceCheck).mockReset();
});

describe("generateWelcome", () => {
  it("returns the first body on a clean voice-check pass", async () => {
    mockLLMBodies([
      "Welcome in, Alice. Good to have you. Drop a reply below with where you're riding and what you're working on.\n\n$€” Ted",
    ]);
    vi.mocked(runVoiceCheck).mockResolvedValue({
      result: PASS,
      usage: { inputTokens: 80, outputTokens: 30, cost: 0.005, runtimeMs: 300 },
      modelUsed: "claude-opus-4-6",
    });

    const result = await generateWelcome({
      promptsDir: "/ignored",
      firstName: "Alice",
      persona: "listener",
    });

    expect(result.body).toContain("Welcome in, Alice");
    expect(result.voiceCheck.pass).toBe(true);
    expect(result.attempts).toBe(1);
    expect(result.cost).toBeGreaterThan(0);
  });

  it("retries on voice-check failure and succeeds on second pass", async () => {
    mockLLMBodies([
      "Welcome Alice $€” drop a line.",
      "Welcome in, Alice. Drop a reply with where you're riding.\n\n$€” Ted",
    ]);
    vi.mocked(runVoiceCheck)
      .mockResolvedValueOnce({
        result: FAIL,
        usage: { inputTokens: 60, outputTokens: 20, cost: 0.002, runtimeMs: 180 },
        modelUsed: "claude-opus-4-6",
      })
      .mockResolvedValueOnce({
        result: PASS,
        usage: { inputTokens: 70, outputTokens: 25, cost: 0.003, runtimeMs: 200 },
        modelUsed: "claude-opus-4-6",
      });

    const result = await generateWelcome({
      promptsDir: "/ignored",
      firstName: "Alice",
      persona: "plateau",
    });

    expect(result.voiceCheck.pass).toBe(true);
    expect(result.attempts).toBe(2);
    expect(callLLM).toHaveBeenCalledTimes(2);

    const secondCallUser = vi.mocked(callLLM).mock.calls[1][0].userMessage;
    expect(secondCallUser).toContain("Previous attempt failed voice-check");
    expect(secondCallUser).toContain("$€” Ted");
  });

  it("honours the persona hook when present", async () => {
    mockLLMBodies([
      "Welcome in, Nick.\n\n$€” Ted",
    ]);
    vi.mocked(runVoiceCheck).mockResolvedValue({
      result: PASS,
      usage: { inputTokens: 80, outputTokens: 30, cost: 0.005, runtimeMs: 300 },
      modelUsed: "claude-opus-4-6",
    });

    const result = await generateWelcome({
      promptsDir: "/ignored",
      firstName: "Nick",
      persona: "comeback",
    });

    expect(result.personaNote).toContain("coming back to the bike");
    // Prompt must have passed the hook into the user message
    const user = vi.mocked(callLLM).mock.calls[0][0].userMessage;
    expect(user).toContain("coming back to the bike");
  });

  it("falls back to the generic persona when persona is unknown", async () => {
    mockLLMBodies(["Welcome in, SeÃ¡n.\n\n$€” Ted"]);
    vi.mocked(runVoiceCheck).mockResolvedValue({
      result: PASS,
      usage: { inputTokens: 80, outputTokens: 30, cost: 0.005, runtimeMs: 300 },
      modelUsed: "claude-opus-4-6",
    });

    const result = await generateWelcome({
      promptsDir: "/ignored",
      firstName: "SeÃ¡n",
      persona: null,
    });

    expect(result.personaNote).toBeUndefined();
  });

  it("short-circuits the cheap banned-word scan and retries", async () => {
    mockLLMBodies([
      "Welcome in, Alice $€” delve into our content.\n\n$€” Ted",
      "Welcome in, Alice. Reply with where you're riding.\n\n$€” Ted",
    ]);
    vi.mocked(runVoiceCheck).mockResolvedValue({
      result: PASS,
      usage: { inputTokens: 80, outputTokens: 30, cost: 0.005, runtimeMs: 300 },
      modelUsed: "claude-opus-4-6",
    });

    const result = await generateWelcome({
      promptsDir: "/ignored",
      firstName: "Alice",
      persona: "listener",
    });

    expect(result.attempts).toBe(2);
    // First attempt hit cheap scan $€” voice-check ran only on the clean one
    expect(runVoiceCheck).toHaveBeenCalledTimes(1);
  });
});
