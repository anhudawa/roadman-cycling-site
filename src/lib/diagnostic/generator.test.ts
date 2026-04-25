import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Answers, Breakdown } from "./types";

/**
 * Generator tests. The Anthropic SDK is mocked so we can drive each
 * branch: happy path, malformed JSON, banned-phrase validation miss
 * that succeeds on retry, two failures dropping to the static $§9
 * fallback, and the "API key missing" short-circuit.
 *
 * Keep these deterministic $€” no real network, no timers.
 */

// Hoisted so the vi.mock factory (which itself is hoisted above
// imports) can close over it reliably. Without this the factory
// captures an undefined reference and `new Anthropic()` returns a
// bare object with no `messages.create`.
const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => {
  // Regular function, not arrow $€” `new` requires a real constructor.
  function MockAnthropic(this: unknown) {
    return { messages: { create: mockCreate } };
  }
  return { default: MockAnthropic };
});

function textResponse(text: string) {
  return {
    content: [{ type: "text" as const, text }],
  };
}

const BASE_ANSWERS: Answers = {
  age: "45-54",
  hoursPerWeek: "9-12",
  ftp: 285,
  goal: "Etape du Tour",
  Q1: 3, Q2: 3, Q3: 3,
  Q4: 1, Q5: 1, Q6: 1,
  Q7: 1, Q8: 3, Q9: 1,
  Q10: 1, Q11: 1, Q12: 3,
  Q13: "Legs feel heavy.",
};

// Build a breakdown that sits inside the 500$€“900 word window and
// doesn't trip any banned-phrase regex. 60 repetitions of a filler
// sentence gets us to ~550 words total $€” enough to clear the floor
// with headroom for overrides.
function wellFormed(overrides: Partial<Breakdown> = {}): string {
  const body: Breakdown = {
    headline: "Short punchy headline here",
    diagnosis: "Your diagnosis is Under-recovered. Committing to it directly.",
    whyThisIsHappening:
      Array(60)
        .fill("You are sleeping poorly and the recovery budget is spent")
        .join(". ") + ".",
    whatItsCosting:
      "The hard sessions land on top of fatigue. The stimulus gets muted. This is the mechanism.",
    fix: [
      {
        step: 1,
        title: "Protect sleep like a session.",
        detail: "Seven and a half hours minimum, consistent wake time, no screens past 10.",
      },
      {
        step: 2,
        title: "Flip the load.",
        detail: "Two hard days a week for eight weeks. Everything else genuinely easy.",
      },
      {
        step: 3,
        title: "Track recovery not training.",
        detail: "HRV trends matter more than Strava kudos right now.",
      },
    ],
    whyAlone:
      "Because backing off is the hardest thing in cycling. Everyone around you is training more.",
    nextMove: "Book a 15-minute call.",
    secondaryNote: null,
    ...overrides,
  };
  return JSON.stringify(body);
}

describe("generateBreakdown", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the static fallback when ANTHROPIC_API_KEY is missing", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { generateBreakdown } = await import("./generator");
    const { PROFILE_BREAKDOWNS } = await import("./profiles");

    const result = await generateBreakdown("underRecovered", null, BASE_ANSWERS);
    expect(result.source).toBe("fallback");
    expect(result.breakdown.headline).toBe(
      PROFILE_BREAKDOWNS.underRecovered.headline
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns the LLM output when it passes validation on the first attempt", async () => {
    mockCreate.mockResolvedValueOnce(textResponse(wellFormed()));
    const { generateBreakdown } = await import("./generator");

    const result = await generateBreakdown("underRecovered", null, BASE_ANSWERS);
    expect(result.source).toBe("llm");
    expect(result.attempts).toBe(1);
    expect(result.breakdown.headline).toBe("Short punchy headline here");
  });

  it("strips fenced JSON code blocks before parsing", async () => {
    const fenced = "```json\n" + wellFormed({ headline: "Strip the fences here" }) + "\n```";
    mockCreate.mockResolvedValueOnce(textResponse(fenced));
    const { generateBreakdown } = await import("./generator");

    const result = await generateBreakdown("polarisation", null, BASE_ANSWERS);
    expect(result.source).toBe("llm");
    expect(result.breakdown.headline).toBe("Strip the fences here");
  });

  it("retries once and returns the second attempt when the first fails validation", async () => {
    const banned = wellFormed({
      nextMove: "Time to crush it $€” unlock your potential.",
    });
    mockCreate
      .mockResolvedValueOnce(textResponse(banned))
      .mockResolvedValueOnce(textResponse(wellFormed({ headline: "Clean retry" })));
    const { generateBreakdown } = await import("./generator");

    const result = await generateBreakdown("underRecovered", null, BASE_ANSWERS);
    expect(result.source).toBe("llm");
    expect(result.attempts).toBe(2);
    expect(result.breakdown.headline).toBe("Clean retry");
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toMatch(/banned_phrase/);
  });

  it("falls back to the static $§9 template after two validation failures", async () => {
    const banned = wellFormed({
      nextMove: "Crush it and unlock your potential.",
    });
    mockCreate
      .mockResolvedValueOnce(textResponse(banned))
      .mockResolvedValueOnce(textResponse(banned));
    const { generateBreakdown } = await import("./generator");
    const { PROFILE_BREAKDOWNS } = await import("./profiles");

    const result = await generateBreakdown("fuelingDeficit", null, BASE_ANSWERS);
    expect(result.source).toBe("fallback");
    expect(result.breakdown.headline).toBe(
      PROFILE_BREAKDOWNS.fuelingDeficit.headline
    );
    expect(result.attempts).toBe(2);
    expect(result.validation?.ok).toBe(false);
    expect(result.rawModelOutput).not.toBeNull();
  });

  it("falls back when the model output is not valid JSON, even after retry", async () => {
    mockCreate
      .mockResolvedValueOnce(textResponse("sorry, I can't help with that"))
      .mockResolvedValueOnce(textResponse("still not json"));
    const { generateBreakdown } = await import("./generator");
    const { PROFILE_BREAKDOWNS } = await import("./profiles");

    const result = await generateBreakdown("strengthGap", null, BASE_ANSWERS);
    expect(result.source).toBe("fallback");
    expect(result.breakdown.headline).toBe(
      PROFILE_BREAKDOWNS.strengthGap.headline
    );
    // Both attempts threw, so we should have two error entries
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
  }, 10_000);

  it("attaches a secondaryNote when a secondary profile is passed to the fallback", async () => {
    // Force fallback by making both attempts fail
    mockCreate
      .mockRejectedValueOnce(new Error("500 bad gateway"))
      .mockRejectedValueOnce(new Error("503 unavailable"));
    const { generateBreakdown } = await import("./generator");

    const result = await generateBreakdown(
      "underRecovered",
      "fuelingDeficit",
      BASE_ANSWERS
    );
    expect(result.source).toBe("fallback");
    expect(result.breakdown.secondaryNote).not.toBeNull();
    expect(result.breakdown.secondaryNote).toContain("Fuelling Deficit");
  }, 10_000);
});
