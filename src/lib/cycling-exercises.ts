import {
  CORE_EXERCISES,
  EXERCISE_VIDEO_MAP,
  PROGRAMME,
  STRETCHES,
  getAllExercises,
} from "@/lib/sc-programme";
import { SITE_ORIGIN } from "@/lib/brand-facts";

export const CYCLING_EXERCISE_LIBRARY = {
  canonicalPath: "/sc/exercises",
  canonicalUrl: `${SITE_ORIGIN}/sc/exercises`,
  feedUrl: `${SITE_ORIGIN}/feeds/cycling-exercises.json`,
  updatedDate: "2026-09-01",
  reviewedBy: "Anthony Walsh",
  answer:
    "Roadman's cyclist exercise library contains the 54 warm-up, strength, power, core and mobility movements used across its public 12-week programme. It is a movement catalogue, not a research-ranked list: choose exercises by training job, competence, equipment and recoverability, then use the evidence guide to build a routine.",
  ownerGuideUrl: `${SITE_ORIGIN}/blog/cycling-gym-exercises-best`,
  coreGuideUrl: `${SITE_ORIGIN}/blog/cycling-core-workout-routine`,
  mobilityGuideUrl: `${SITE_ORIGIN}/blog/cycling-mobility-routine`,
  programmeUrl: `${SITE_ORIGIN}/sc/programme`,
  appUrl: `${SITE_ORIGIN}/app`,
} as const;

export const CYCLING_EXERCISE_CATEGORY_LABELS = {
  warmup: "Warm-up and activation",
  workout: "Strength and power",
  "core-circuit": "Programme core circuit",
  "core-standalone": "Standalone core",
  stretch: "Mobility and stretching",
} as const;

export type CyclingExerciseCategory =
  keyof typeof CYCLING_EXERCISE_CATEGORY_LABELS;

export interface CyclingExerciseCatalogItem {
  id: string;
  name: string;
  category: CyclingExerciseCategory;
  categoryLabel: string;
  canonicalUrl: string;
  videoUrl: string | null;
  videoAvailable: boolean;
  coachingTip: string | null;
  description: string | null;
  targetAreas: readonly string[];
  instructions: readonly string[];
  programmeWeeks: readonly number[];
  programmePhases: readonly string[];
  examplePrescriptions: readonly string[];
  evidenceGuideUrl: string;
}

export function getCyclingExerciseCatalog(): CyclingExerciseCatalogItem[] {
  const coreById = new Map(
    CORE_EXERCISES.map((exercise) => [exercise.id, exercise]),
  );
  const stretchById = new Map(
    STRETCHES.map((stretch) => [stretch.id, stretch]),
  );

  return getAllExercises().map((exercise) => {
    const programmeMatches = PROGRAMME.flatMap((week) =>
      week.days.flatMap((day) =>
        day.workout
          .filter((item) => item.id === exercise.id)
          .map((item) => ({
            weekNumber: week.weekNumber,
            phaseLabel: week.phaseLabel,
            prescription: item.setsReps,
          })),
      ),
    );
    const core = coreById.get(exercise.id);
    const stretch = stretchById.get(exercise.id);
    const category = exercise.category as CyclingExerciseCategory;
    const videoUrl = exercise.videoUrl ?? null;

    return {
      id: exercise.id,
      name: exercise.name,
      category,
      categoryLabel: CYCLING_EXERCISE_CATEGORY_LABELS[category],
      canonicalUrl: `${CYCLING_EXERCISE_LIBRARY.canonicalUrl}#${exercise.id}`,
      videoUrl,
      videoAvailable: Boolean(videoUrl),
      coachingTip: EXERCISE_VIDEO_MAP[exercise.id]?.tip ?? null,
      description: core?.description ?? stretch?.description ?? null,
      targetAreas: core?.targetMuscles ?? (stretch ? [stretch.targetArea] : []),
      instructions: core?.instructions ?? stretch?.instructions ?? [],
      programmeWeeks: Array.from(
        new Set(programmeMatches.map((match) => match.weekNumber)),
      ),
      programmePhases: Array.from(
        new Set(programmeMatches.map((match) => match.phaseLabel)),
      ),
      examplePrescriptions: Array.from(
        new Set(programmeMatches.map((match) => match.prescription)),
      ),
      evidenceGuideUrl:
        category === "core-circuit" || category === "core-standalone"
          ? CYCLING_EXERCISE_LIBRARY.coreGuideUrl
          : category === "stretch"
            ? CYCLING_EXERCISE_LIBRARY.mobilityGuideUrl
            : CYCLING_EXERCISE_LIBRARY.ownerGuideUrl,
    };
  });
}
