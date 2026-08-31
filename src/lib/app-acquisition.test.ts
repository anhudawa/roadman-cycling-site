import { describe, expect, it } from "vitest";
import {
  APP_ACQUISITION_SOURCES,
  buildAppWaitlistSource,
  normaliseAppAcquisitionSource,
} from "./app-acquisition";

describe("app acquisition attribution", () => {
  it("retains every approved origin and form placement", () => {
    expect(APP_ACQUISITION_SOURCES.size).toBe(17);
    expect(buildAppWaitlistSource("strength-guide", "hero")).toBe(
      "roadman-app-waitlist-strength-guide-hero",
    );
    expect(buildAppWaitlistSource("recovery-screen", "bottom")).toBe(
      "roadman-app-waitlist-recovery-screen-bottom",
    );
    expect(
      buildAppWaitlistSource("best-cycling-strength-training-apps", "hero"),
    ).toBe("roadman-app-waitlist-best-cycling-strength-training-apps-hero");
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
