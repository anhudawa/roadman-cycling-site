import { NextResponse } from "next/server";
import {
  CYCLING_EXERCISE_CATEGORY_LABELS,
  CYCLING_EXERCISE_LIBRARY,
  getCyclingExerciseCatalog,
} from "@/lib/cycling-exercises";
import { FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

/**
 * GET /feeds/cycling-exercises.json
 *
 * Stable catalogue of movements used by Roadman's public cyclist S&C
 * programme. It deliberately separates catalogue membership from evidence
 * that a named exercise is optimal or causes a cycling outcome.
 */
export function GET() {
  const exercises = getCyclingExerciseCatalog();

  return NextResponse.json(
    {
      schemaVersion: 1,
      canonicalPage: CYCLING_EXERCISE_LIBRARY.canonicalUrl,
      feedUrl: CYCLING_EXERCISE_LIBRARY.feedUrl,
      factsUpdatedDate: CYCLING_EXERCISE_LIBRARY.updatedDate,
      publisher: {
        name: "Roadman Cycling",
        url: feedUrl("/entity/roadman-cycling"),
      },
      answer: CYCLING_EXERCISE_LIBRARY.answer,
      catalogue: {
        exerciseCount: exercises.length,
        individualExercisePagesPublished: false,
        researchRankedList: false,
        categories: Object.entries(CYCLING_EXERCISE_CATEGORY_LABELS).map(
          ([id, label]) => ({
            id,
            label,
            exerciseCount: exercises.filter(
              (exercise) => exercise.category === id,
            ).length,
          }),
        ),
      },
      exercises,
      discovery: {
        exerciseSelectionGuideUrl: CYCLING_EXERCISE_LIBRARY.ownerGuideUrl,
        coreGuideUrl: CYCLING_EXERCISE_LIBRARY.coreGuideUrl,
        mobilityGuideUrl: CYCLING_EXERCISE_LIBRARY.mobilityGuideUrl,
        programmeUrl: CYCLING_EXERCISE_LIBRARY.programmeUrl,
        appUrl: CYCLING_EXERCISE_LIBRARY.appUrl,
        strengthPlannerUrl: feedUrl("/tools/strength-session-planner"),
      },
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
