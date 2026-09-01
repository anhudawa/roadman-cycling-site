import { describe, expect, it } from "vitest";
import {
  CYCLING_EXERCISE_CATEGORY_LABELS,
  getCyclingExerciseCatalog,
} from "./cycling-exercises";

describe("cycling exercise catalogue", () => {
  it("derives one stable record for every public library movement", () => {
    const catalogue = getCyclingExerciseCatalog();

    expect(catalogue).toHaveLength(54);
    expect(new Set(catalogue.map((exercise) => exercise.id)).size).toBe(54);
    expect(new Set(catalogue.map((exercise) => exercise.category))).toEqual(
      new Set(Object.keys(CYCLING_EXERCISE_CATEGORY_LABELS)),
    );
    expect(
      catalogue.every((exercise) =>
        exercise.canonicalUrl.startsWith(
          "https://roadmancycling.com/sc/exercises#",
        ),
      ),
    ).toBe(true);
  });

  it("keeps programme use separate from richer core and mobility records", () => {
    const catalogue = getCyclingExerciseCatalog();
    const frontSquat = catalogue.find(
      (exercise) => exercise.id === "front-squat",
    );
    const sidePlank = catalogue.find(
      (exercise) => exercise.id === "side-plank-with-dips",
    );
    const hipFlexors = catalogue.find(
      (exercise) => exercise.id === "hip-flexors",
    );

    expect(frontSquat).toMatchObject({
      category: "workout",
      description: null,
      evidenceGuideUrl:
        "https://roadmancycling.com/blog/cycling-gym-exercises-best",
    });
    expect(frontSquat?.programmeWeeks.length).toBeGreaterThan(0);
    expect(sidePlank?.targetAreas).toContain("obliques");
    expect(sidePlank?.instructions.length).toBeGreaterThan(0);
    expect(hipFlexors).toMatchObject({
      category: "stretch",
      targetAreas: ["Hip flexors"],
    });
  });
});
