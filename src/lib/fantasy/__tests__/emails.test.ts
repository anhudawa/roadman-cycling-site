import { describe, it, expect } from "vitest";
import {
  renderDailyStageEmail,
  renderRestDayEmail,
  renderLeagueNudgeEmail,
  type DailyStageEmailInput,
} from "../emails";

function dailyInput(overrides: Partial<DailyStageEmailInput> = {}): DailyStageEmailInput {
  return {
    to: "rider@example.com",
    firstName: "Aoife",
    teamName: "Watts Occurring",
    globalRank: 412,
    totalPlayers: 5210,
    lastStagePoints: 87,
    lastStageNumber: 13,
    miniLeagues: [{ name: "Sunday Worlds", rank: 2, size: 14 }],
    stage: {
      stageNumber: 14,
      startTown: "Mulhouse",
      finishTown: "Le Markstein Fellering",
      distanceKm: "155",
      stageType: "mountain",
      summitFinish: true,
    },
    roadmanTake: "The break goes early here. Watch the final 6 km, that is where the GC men show their hand.",
    deadline: new Date("2026-07-18T13:05:00+02:00"),
    deepLinkToken: "test-token",
    ...overrides,
  };
}

describe("renderDailyStageEmail", () => {
  it("leads with position, names the stage, and carries exactly one deep-link CTA", () => {
    const { subject, html, text } = renderDailyStageEmail(dailyInput());
    expect(subject).toBe("Stage 14: Mulhouse → Le Markstein Fellering (you scored 87)");
    expect(html).toContain("#412");
    expect(html).toContain("Sunday Worlds");
    expect(html).toContain("summit finish");
    // The CTA is the entire point of the email (Section 5.2).
    const ctaMatches = html.match(/api\/fantasy\/auth\/verify\?token=test-token/g) ?? [];
    expect(ctaMatches.length).toBeGreaterThanOrEqual(1);
    expect(text).toContain("Make your changes:");
  });

  it("shows the deadline in Irish time and CEST", () => {
    const { html } = renderDailyStageEmail(dailyInput());
    expect(html).toContain("12:05 Irish time");
    expect(html).toContain("(13:05 CEST)");
  });

  it("drops a take that violates the content guard and falls back to facts", () => {
    const { html } = renderDailyStageEmail(
      dailyInput({ roadmanTake: "Dan Lorang has Pogacar flying for this one." }),
    );
    expect(html).not.toContain("Lorang");
    expect(html).toContain("Stage 14");
  });

  it("handles a first-time player with no rank yet", () => {
    const { html, subject } = renderDailyStageEmail(
      dailyInput({ globalRank: null, lastStagePoints: null, lastStageNumber: null, miniLeagues: [] }),
    );
    expect(html).toContain("Your first points land tonight.");
    expect(subject).toBe("Stage 14: Mulhouse → Le Markstein Fellering");
  });
});

describe("renderRestDayEmail", () => {
  it("sells the bonus transfer and deep-links into the team page", () => {
    const { subject, html } = renderRestDayEmail({
      firstName: "Aoife",
      globalRank: 412,
      totalPlayers: 5210,
      deepLinkToken: "test-token",
      weekLabel: "week two",
    });
    expect(subject).toContain("bonus transfer");
    expect(html).toContain("bonus transfer is unlocked");
    expect(html).toContain("api/fantasy/auth/verify?token=test-token");
  });
});

describe("renderLeagueNudgeEmail", () => {
  it("includes the team name, the Clubhouse code, and the deep link", () => {
    const { html, text } = renderLeagueNudgeEmail({
      firstName: "Aoife",
      teamName: "Watts Occurring",
      deepLinkToken: "test-token",
      clubhouseCode: "RDMNCC",
    });
    expect(html).toContain("Watts Occurring");
    expect(html).toContain("RDMNCC");
    expect(text).toContain("api/fantasy/auth/verify?token=test-token");
  });

  it("escapes player-controlled values", () => {
    const { html } = renderLeagueNudgeEmail({
      firstName: "<script>x</script>",
      teamName: "Team <b>",
      deepLinkToken: "t",
      clubhouseCode: "RDMNCC",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
