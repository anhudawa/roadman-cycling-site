import { describe, expect, it } from "vitest";
import {
  aggregateAppWaitlistEvents,
  parseAppWaitlistEventSource,
  type AppWaitlistEventRow,
} from "./app-waitlist-funnel";

const FROM = new Date("2026-09-01T00:00:00Z");
const TO = new Date("2026-09-08T23:59:59Z");

function row(
  id: number,
  type: string,
  overrides: Partial<AppWaitlistEventRow> = {},
): AppWaitlistEventRow {
  return {
    id,
    type,
    timestamp: new Date(`2026-09-0${Math.min(id, 8)}T10:00:00Z`),
    page: "/app",
    source: null,
    sessionId: `session-${id}`,
    email: null,
    referrer: null,
    aiReferrer: null,
    meta: null,
    ...overrides,
  };
}

describe("app waitlist funnel", () => {
  it("parses one permanent waitlist source into acquisition and placement", () => {
    expect(parseAppWaitlistEventSource("roadman-app-waitlist-hero")).toEqual({
      acquisitionSource: "direct",
      placement: "hero",
    });
    expect(
      parseAppWaitlistEventSource(
        "roadman-app-waitlist-strength-over-50-guide-bottom",
      ),
    ).toEqual({
      acquisitionSource: "strength-over-50-guide",
      placement: "bottom",
    });
    expect(parseAppWaitlistEventSource("footer")).toBeNull();
  });

  it("separates consented funnel sessions from server-recorded unique joins", () => {
    const result = aggregateAppWaitlistEvents(
      [
        row(1, "pageview", { page: "/app?source=strength-guide", sessionId: "a" }),
        row(2, "page_view", { page: "/app", sessionId: "b", aiReferrer: "chatgpt.com" }),
        row(3, "form_start", { source: "roadman-app-waitlist-strength-guide-hero", sessionId: "a" }),
        row(4, "email_captured", { source: "roadman-app-waitlist-strength-guide-hero", sessionId: "a" }),
        row(5, "signup", { source: "roadman-app-waitlist-strength-guide-hero", email: "a***z@example.com" }),
        row(6, "signup", { source: "roadman-app-waitlist-strength-guide-hero", email: "a***z@example.com" }),
        row(7, "signup", { source: "roadman-app-waitlist-bottom", email: "b***y@example.com" }),
        row(8, "cta_click", { page: "/blog/strength", sessionId: "c", meta: { destination: "/app?source=strength-guide" } }),
      ],
      FROM,
      TO,
    );

    expect(result.tracked).toMatchObject({
      appPageviews: 2,
      appSessions: 2,
      aiSessions: 1,
      sourceTaggedSessions: 1,
      contentCtaSessions: 1,
      formStartSessions: 1,
      confirmedCaptureSessions: 1,
      formStartRate: 0.5,
      formCompletionRate: 1,
      trackedVisitToCaptureRate: 0.5,
    });
    expect(result.operational).toEqual({
      submissionAttempts: 3,
      uniqueLeads: 2,
      repeatAttempts: 1,
    });
    expect(result.acquisitionSources[0]).toMatchObject({
      key: "strength-guide",
      submissions: 2,
      uniqueLeads: 1,
    });
    expect(result.placements).toEqual([
      { key: "hero", label: "Hero", submissions: 2, uniqueLeads: 1 },
      { key: "bottom", label: "Bottom", submissions: 1, uniqueLeads: 1 },
    ]);
  });

  it("does not count ordinary newsletter or unknown-session events", () => {
    const result = aggregateAppWaitlistEvents(
      [
        row(1, "pageview", { page: "/newsletter", sessionId: "n" }),
        row(2, "signup", { source: "footer", email: "n***s@example.com" }),
        row(3, "pageview", { page: "/app", sessionId: "unknown" }),
      ],
      FROM,
      TO,
    );

    expect(result.tracked.appPageviews).toBe(1);
    expect(result.tracked.appSessions).toBe(0);
    expect(result.operational.uniqueLeads).toBe(0);
    expect(result.acquisitionSources).toEqual([]);
  });
});
