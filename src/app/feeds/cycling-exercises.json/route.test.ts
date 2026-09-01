import { describe, expect, it } from "vitest";
import { CYCLING_EXERCISE_LIBRARY } from "@/lib/cycling-exercises";
import { GET } from "./route";

describe("GET /feeds/cycling-exercises.json", () => {
  it("publishes the complete programme catalogue without inventing rankings", async () => {
    const response = GET();
    const body = await response.json();

    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(body.schemaVersion).toBe(1);
    expect(body.canonicalPage).toBe(CYCLING_EXERCISE_LIBRARY.canonicalUrl);
    expect(body.catalogue).toMatchObject({
      exerciseCount: 54,
      individualExercisePagesPublished: false,
      researchRankedList: false,
    });
    expect(body.catalogue.categories).toHaveLength(5);
    expect(body.exercises).toHaveLength(54);
  });

  it("preserves programme provenance and honest null fields", async () => {
    const body = await GET().json();
    const frontSquat = body.exercises.find(
      (exercise: { id: string }) => exercise.id === "front-squat",
    );
    const sidePlank = body.exercises.find(
      (exercise: { id: string }) => exercise.id === "side-plank-with-dips",
    );

    expect(frontSquat.programmeWeeks.length).toBeGreaterThan(0);
    expect(frontSquat.examplePrescriptions.length).toBeGreaterThan(0);
    expect(frontSquat.description).toBeNull();
    expect(sidePlank.description).toContain("Lateral core stability");
    expect(sidePlank.targetAreas).toContain("obliques");
    expect(body.discovery.appUrl).toBe("https://roadmancycling.com/app");
    expect(body.discovery.programmeFeedUrl).toBe(
      "https://roadmancycling.com/feeds/cycling-strength-programme.json",
    );
  });
});
