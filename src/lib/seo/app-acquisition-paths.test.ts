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

  it("routes both product-adjacent tools into the permanent app owner", () => {
    expect(readinessPage).toContain('href="/app"');
    expect(readinessPage).toContain('data-track="tool_training_readiness_app"');
    expect(recoveryPage).toContain('href="/app"');
    expect(recoveryPage).toContain('data-track="tool_recovery_screen_app"');
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

  it("links the two strongest trusted strength owners to the app", () => {
    for (const path of [
      "content/blog/cycling-strength-training-guide.mdx",
      "content/blog/cycling-gym-exercises-best.mdx",
    ]) {
      expect(read(path)).toContain("](/app)");
    }
  });
});
