import { describe, expect, it } from "vitest";
import {
  APP_ACQUISITION_SOURCES,
  buildAppWaitlistSource,
  normaliseAppAcquisitionSource,
} from "./app-acquisition";

describe("app acquisition attribution", () => {
  it("retains every approved origin and form placement", () => {
    expect(APP_ACQUISITION_SOURCES.size).toBe(45);
    expect(buildAppWaitlistSource("strength-guide", "hero")).toBe(
      "roadman-app-waitlist-strength-guide-hero",
    );
    expect(buildAppWaitlistSource("recovery-screen", "bottom")).toBe(
      "roadman-app-waitlist-recovery-screen-bottom",
    );
    expect(
      buildAppWaitlistSource("best-cycling-strength-training-apps", "hero"),
    ).toBe("roadman-app-waitlist-best-cycling-strength-training-apps-hero");
    expect(buildAppWaitlistSource("beginner-strength-plan", "bottom")).toBe(
      "roadman-app-waitlist-beginner-strength-plan-bottom",
    );
    expect(buildAppWaitlistSource("strength-over-50-guide", "hero")).toBe(
      "roadman-app-waitlist-strength-over-50-guide-hero",
    );
    expect(buildAppWaitlistSource("core-workout", "hero")).toBe(
      "roadman-app-waitlist-core-workout-hero",
    );
    expect(buildAppWaitlistSource("core-progressions", "bottom")).toBe(
      "roadman-app-waitlist-core-progressions-bottom",
    );
    expect(buildAppWaitlistSource("off-season-strength", "hero")).toBe(
      "roadman-app-waitlist-off-season-strength-hero",
    );
    expect(buildAppWaitlistSource("recovery-nutrition", "bottom")).toBe(
      "roadman-app-waitlist-recovery-nutrition-bottom",
    );
    expect(buildAppWaitlistSource("recovery-week", "hero")).toBe(
      "roadman-app-waitlist-recovery-week-hero",
    );
    expect(buildAppWaitlistSource("recovery-guide", "bottom")).toBe(
      "roadman-app-waitlist-recovery-guide-bottom",
    );
    expect(buildAppWaitlistSource("sleep-guide", "bottom")).toBe(
      "roadman-app-waitlist-sleep-guide-bottom",
    );
    expect(buildAppWaitlistSource("mobility-guide", "bottom")).toBe(
      "roadman-app-waitlist-mobility-guide-bottom",
    );
    expect(buildAppWaitlistSource("glute-guide", "hero")).toBe(
      "roadman-app-waitlist-glute-guide-hero",
    );
    expect(buildAppWaitlistSource("fatigue-guide", "bottom")).toBe(
      "roadman-app-waitlist-fatigue-guide-bottom",
    );
    expect(buildAppWaitlistSource("hrv-guide", "bottom")).toBe(
      "roadman-app-waitlist-hrv-guide-bottom",
    );
    expect(buildAppWaitlistSource("iron-guide", "bottom")).toBe(
      "roadman-app-waitlist-iron-guide-bottom",
    );
    expect(buildAppWaitlistSource("magnesium-guide", "bottom")).toBe(
      "roadman-app-waitlist-magnesium-guide-bottom",
    );
    expect(buildAppWaitlistSource("rhr-guide", "bottom")).toBe(
      "roadman-app-waitlist-rhr-guide-bottom",
    );
    expect(buildAppWaitlistSource("rest-day-guide", "hero")).toBe(
      "roadman-app-waitlist-rest-day-guide-hero",
    );
    expect(buildAppWaitlistSource("cold-water-guide", "bottom")).toBe(
      "roadman-app-waitlist-cold-water-guide-bottom",
    );
    expect(buildAppWaitlistSource("foam-rolling-guide", "bottom")).toBe(
      "roadman-app-waitlist-foam-rolling-guide-bottom",
    );
    expect(buildAppWaitlistSource("massage-gun-guide", "hero")).toBe(
      "roadman-app-waitlist-massage-gun-guide-hero",
    );
    expect(buildAppWaitlistSource("tart-cherry-guide", "bottom")).toBe(
      "roadman-app-waitlist-tart-cherry-guide-bottom",
    );
    expect(buildAppWaitlistSource("creatine-guide", "hero")).toBe(
      "roadman-app-waitlist-creatine-guide-hero",
    );
    expect(buildAppWaitlistSource("autonomic-recovery-guide", "bottom")).toBe(
      "roadman-app-waitlist-autonomic-recovery-guide-bottom",
    );
    expect(buildAppWaitlistSource("cortisol-guide", "hero")).toBe(
      "roadman-app-waitlist-cortisol-guide-hero",
    );
    expect(buildAppWaitlistSource("between-sessions-guide", "bottom")).toBe(
      "roadman-app-waitlist-between-sessions-guide-bottom",
    );
    expect(buildAppWaitlistSource("blood-testing-guide", "hero")).toBe(
      "roadman-app-waitlist-blood-testing-guide-hero",
    );
    expect(buildAppWaitlistSource("overreaching-guide", "hero")).toBe(
      "roadman-app-waitlist-overreaching-guide-hero",
    );
    expect(
      buildAppWaitlistSource("overtraining-recovery-guide", "bottom"),
    ).toBe("roadman-app-waitlist-overtraining-recovery-guide-bottom");
    expect(buildAppWaitlistSource("persistent-fatigue-guide", "hero")).toBe(
      "roadman-app-waitlist-persistent-fatigue-guide-hero",
    );
  });

  it("rejects unknown and duplicated query values", () => {
    expect(normaliseAppAcquisitionSource("made-up-source")).toBeNull();
    expect(
      normaliseAppAcquisitionSource(["strength-guide", "recovery-hub"]),
    ).toBe("strength-guide");
    expect(buildAppWaitlistSource("made-up-source", "hero")).toBe(
      "roadman-app-waitlist-hero",
    );
  });
});
