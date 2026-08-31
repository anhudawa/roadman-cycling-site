import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("strength and recovery app acquisition paths", () => {
  const readinessPage = read(
    "src/app/(content)/tools/training-readiness/page.tsx",
  );
  const readinessLayout = read(
    "src/app/(content)/tools/training-readiness/layout.tsx",
  );
  const recoveryPage = read("src/app/(content)/tools/recovery-screen/page.tsx");
  const recoveryLayout = read(
    "src/app/(content)/tools/recovery-screen/layout.tsx",
  );
  const plannerPage = read(
    "src/app/(content)/tools/strength-session-planner/page.tsx",
  );

  it("routes every product-adjacent tool into the permanent app owner with source attribution", () => {
    expect(readinessPage).toContain('href="/app?source=training-readiness"');
    expect(readinessPage).toContain('data-track="tool_training_readiness_app"');
    expect(recoveryPage).toContain('href="/app?source=recovery-screen"');
    expect(recoveryPage).toContain('data-track="tool_recovery_screen_app"');
    expect(plannerPage).toContain(
      'href="/app?source=strength-session-planner"',
    );
    expect(plannerPage).toContain('data-track="strength_placement_app"');
  });

  it("states that the web scores are heuristic rather than validated prescriptions", () => {
    for (const source of [
      readinessPage,
      readinessLayout,
      recoveryPage,
      recoveryLayout,
    ]) {
      expect(source).toMatch(/heuristic/i);
      expect(source).toMatch(/not clinically validated|not a diagnosis/i);
    }
  });

  it("removes unsupported universal recovery rules", () => {
    const sources = `${readinessPage}\n${readinessLayout}\n${recoveryPage}\n${recoveryLayout}`;

    for (const claim of [
      "Training today does more harm than good",
      "Three-day rule",
      "at least two complete rest days",
      "3:1 carb-to-protein ratio",
      "a jump of 5+ bpm suggests accumulated fatigue",
      "reduce training volume by 20–30%",
      "Recovery Deficit",
      "Green Light",
    ]) {
      expect(sources).not.toContain(claim);
    }
  });

  it("attributes every strength, recovery and masters education handoff", () => {
    const handoffs = {
      "content/blog/cycling-active-recovery-rides-guide.mdx":
        "/app?source=active-recovery-guide",
      "content/blog/derek-teel-best-exercises-cyclists.mdx":
        "/app?source=derek-teel-exercises",
      "content/blog/cycling-strength-training-12-week-beginner-plan.mdx":
        "/app?source=beginner-strength-plan",
      "content/blog/cycling-gym-exercises-best.mdx":
        "/app?source=gym-exercises",
      "content/blog/cycling-fatigue-signs-when-to-back-off.mdx":
        "/app?source=fatigue-guide",
      "content/blog/glute-activation-cyclists-power-leaks.mdx":
        "/app?source=glute-guide",
      "content/blog/cycling-mobility-routine.mdx":
        "/app?source=mobility-guide",
      "content/blog/cycling-core-workout-routine.mdx":
        "/app?source=core-workout",
      "content/blog/core-strength-cyclists-beyond-planks.mdx":
        "/app?source=core-progressions",
      "content/blog/off-season-gym-routine-cyclists-12-week-block.mdx":
        "/app?source=off-season-strength",
      "content/blog/best-recovery-foods-after-cycling.mdx":
        "/app?source=recovery-nutrition",
      "content/blog/cycling-recovery-week-what-to-actually-do.mdx":
        "/app?source=recovery-week",
      "content/blog/cycling-recovery-tips.mdx": "/app?source=recovery-guide",
      "content/blog/cycling-sleep-performance-guide.mdx":
        "/app?source=sleep-guide",
      "content/blog/cycling-hrv-training-guide.mdx":
        "/app?source=hrv-guide",
      "content/blog/magnesium-cyclists-recovery-performance-guide.mdx":
        "/app?source=magnesium-guide",
      "content/blog/resting-heart-rate-masters-cyclists.mdx":
        "/app?source=rhr-guide",
      "content/blog/cycling-rest-day-what-to-do-guide.mdx":
        "/app?source=rest-day-guide",
      "content/blog/cycling-strength-training-guide.mdx":
        "/app?source=strength-guide",
      "content/blog/strength-training-cyclists-over-50.mdx":
        "/app?source=strength-over-50-guide",
      "content/blog/cycling-time-crunched-training-guide.mdx":
        "/app?source=time-crunched-guide",
      "content/topics/cycling-recovery.mdx": "/app?source=recovery-hub",
      "content/topics/cycling-strength-conditioning.mdx":
        "/app?source=strength-hub",
      "content/topics/masters-cycling.mdx": "/app?source=masters-hub",
    } as const;

    for (const [path, href] of Object.entries(handoffs)) {
      expect(read(path), path).toContain(`](${href})`);
    }
  });

  it("keeps every attributed capture inside one Beehiiv audience", () => {
    const segmentation = read("src/lib/newsletter/beehiiv-segmentation.ts");
    const acquisition = read("src/lib/app-acquisition.ts");

    expect(segmentation).toContain('APP_WAITLIST_TAG = "app-waitlist"');
    expect(segmentation).toContain(
      "source.startsWith(APP_WAITLIST_SOURCE_PREFIX)",
    );
    expect(acquisition).toContain("normaliseAppAcquisitionSource");
    expect(acquisition).toContain(
      "roadman-app-waitlist-${source}-${placement}",
    );
  });

  it("routes authoritative education pages into each commercial comparison owner", () => {
    const bridges = [
      {
        owner: "/best/best-cycling-training-apps",
        sources: ["content/topics/cycling-training-plans.mdx"],
      },
      {
        owner: "/best/best-cycling-strength-training-apps",
        sources: [
          "content/topics/cycling-strength-conditioning.mdx",
          "content/blog/cycling-strength-training-guide.mdx",
        ],
      },
      {
        owner: "/best/best-cycling-recovery-apps",
        sources: [
          "content/topics/cycling-recovery.mdx",
          "content/blog/cycling-recovery-tips.mdx",
        ],
      },
      {
        owner: "/best/best-cycling-apps-structured-training",
        sources: ["content/topics/masters-cycling.mdx"],
      },
    ];

    for (const bridge of bridges) {
      for (const source of bridge.sources) {
        expect(read(source), `${source} -> ${bridge.owner}`).toContain(
          `](${bridge.owner})`,
        );
      }
    }
  });
});
