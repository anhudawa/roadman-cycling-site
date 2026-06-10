import { trackAnalyticsEvent } from "@/lib/analytics/client";

/**
 * Racing IQ analytics — the event names from the build brief, wired to
 * the site's existing /api/events dispatcher. Fire-and-forget; nothing
 * here can break the game.
 *
 * Events: scenario_started, decision_made, gate_shown, email_captured,
 * result_viewed, card_downloaded, share_clicked.
 */

const PAGE = "/racing-iq";

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `riq_${crypto.randomUUID().slice(0, 12)}`
        : `riq_${Math.random().toString(36).slice(2, 14)}`;
  }
  return sessionId;
}

function track(type: string, meta?: Record<string, string>): void {
  trackAnalyticsEvent({ type, page: PAGE, sessionId: getSessionId(), meta });
}

export const racingIqAnalytics = {
  sessionId: getSessionId,
  scenarioStarted: (scenarioId: string, index: number) =>
    track("scenario_started", { scenario: scenarioId, index: String(index) }),
  decisionMade: (scenarioId: string, choiceId: string, matchesAfter: number) =>
    track("decision_made", {
      scenario: scenarioId,
      choice: choiceId,
      matches_after: String(matchesAfter),
    }),
  gateShown: () => track("gate_shown"),
  emailCaptured: (where: "gate" | "result") => track("email_captured", { where }),
  resultViewed: (archetype: string) => track("result_viewed", { archetype }),
  cardDownloaded: (archetype: string) => track("card_downloaded", { archetype }),
  shareClicked: (archetype: string) => track("share_clicked", { archetype }),
};
